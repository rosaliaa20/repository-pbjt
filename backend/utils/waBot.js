const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');
const path = require('path');

// ============================================================
// CONSTANTS
// ============================================================
const RESTART_DELAY_MS = 10000;
const MAX_LOCK_RETRIES = 3; // Coba maksimal 3x sebelum menyerah untuk sesi ini
const SESSION_DIR = path.join(__dirname, '../.wwebjs_auth/session');
const SINGLETON_LOCK = path.join(SESSION_DIR, 'SingletonLock');

let lockRetryCount = 0;

// ============================================================
// BOT FACTORY: Dibuat sebagai fungsi agar bisa di-restart
// ============================================================
let client = null;
let latestQr = null;
let isBotReady = false;
let msgQueue = [];
let isProcessing = false;

const createClient = () => {
    return new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--disable-gpu'
                // NOTE: --no-zygote and --single-process dihapus karena
                // menyebabkan Chrome crash langsung di Windows dan meninggalkan
                // SingletonLock, sehingga restart loop tak berujung.
            ],
            timeout: 60000
        }
    });
};

const setupClientEvents = (c) => {
    c.on('qr', (qr) => {
        console.log('✅ QR Code WhatsApp baru telah di-generate. Silakan cek di Dashboard Frontend.');
        latestQr = qr;
        isBotReady = false;
    });

    c.on('ready', () => {
        console.log('✅ Bot WhatsApp E-Repository Berhasil Terhubung!');
        latestQr = null; // QR sudah tidak diperlukan setelah terhubung
        isBotReady = true;
    });

    c.on('auth_failure', (msg) => {
        // Autentikasi gagal (sesi kadaluarsa/korup). Bot akan coba restart.
        console.error('❌ WhatsApp Auth Failure:', msg, '— Mencoba restart dalam', RESTART_DELAY_MS / 1000, 'detik...');
        isBotReady = false;
        setTimeout(() => initializeBot(), RESTART_DELAY_MS);
    });

    c.on('disconnected', (reason) => {
        // Bot terputus (misal: logout manual dari HP). Bot akan coba restart.
        console.warn('⚠️ Bot WhatsApp Terputus. Alasan:', reason, '— Mencoba restart dalam', RESTART_DELAY_MS / 1000, 'detik...');
        isBotReady = false;
        latestQr = null;
        setTimeout(() => initializeBot(), RESTART_DELAY_MS);
    });
};

// ============================================================
// QUEUE PROCESSOR: Antrean pesan agar tidak bentrok
// ============================================================
const processQueue = async () => {
    if (isProcessing || msgQueue.length === 0 || !isBotReady) return;

    isProcessing = true;
    const { targetNumber, textMessage } = msgQueue.shift();

    try {
        await client.sendMessage(targetNumber, textMessage);
        console.log(`✅ Pesan WA berhasil dikirim ke: ${targetNumber}`);
    } catch (error) {
        console.error(`❌ Gagal mengirim pesan WA ke ${targetNumber}:`, error.message);
    } finally {
        await new Promise(resolve => setTimeout(resolve, 2500));
        isProcessing = false;
        processQueue();
    }
};

// ============================================================
// MAIN: Fungsi inisialisasi utama
// ============================================================
const initializeBot = async () => {
    // Hancurkan klien lama jika ada (cleanup)
    if (client) {
        try {
            await client.destroy();
        } catch (_) {
            // Abaikan error saat destroy
        }
    }

    // ============================================================
    // SESSION CLEANUP:
    // Hapus seluruh folder session agar Chrome mulai bersih.
    // ============================================================
    if (fs.existsSync(SESSION_DIR)) {
        try {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
            console.log('🧹 Folder session lama dibersihkan, memulai sesi baru...');
        } catch (cleanErr) {
            console.warn('⚠️ Gagal membersihkan folder session:', cleanErr.message);
        }
    }

    client = createClient();
    setupClientEvents(client);

    try {
        await client.initialize();
    } catch (error) {
        const isBusyError = error.message && error.message.includes('browser is already running');

        if (isBusyError) {
            lockRetryCount++;
            if (lockRetryCount > MAX_LOCK_RETRIES) {
                // Setelah MAX_LOCK_RETRIES, menyerah dan tunggu lebih lama
                console.error(`❌ Sudah mencoba ${MAX_LOCK_RETRIES}x membersihkan lock. Bot WA tidak dapat dimulai sesi ini. Coba restart server.`);
                lockRetryCount = 0; // Reset agar bisa dicoba lagi nanti
                setTimeout(() => initializeBot(), RESTART_DELAY_MS * 3); // Tunggu 30 detik
            } else {
                console.error(`❌ Chrome masih terkunci (percobaan ${lockRetryCount}/${MAX_LOCK_RETRIES}). Membersihkan lock...`);
                if (fs.existsSync(SINGLETON_LOCK)) {
                    try { fs.unlinkSync(SINGLETON_LOCK); } catch (_) {}
                }
                setTimeout(() => initializeBot(), 2000);
            }
        } else {
            console.error('❌ Gagal menginisialisasi Bot WhatsApp:', error.message);
            console.log(`⏳ Mencoba restart bot dalam ${RESTART_DELAY_MS / 1000} detik...`);
            setTimeout(() => initializeBot(), RESTART_DELAY_MS);
        }
        isBotReady = false;
    }
};

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Kirim pesan WhatsApp ke nomor tujuan (masuk ke antrean).
 * @param {string} number - Nomor HP tujuan (format apapun: 08xx, +62xx)
 * @param {string} message - Isi pesan teks
 */
const sendWAMessage = (number, message) => {
    if (!number) return;

    let formattedNumber = number.replace(/[- ]/g, '');
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.slice(1);
    } else if (formattedNumber.startsWith('+62')) {
        formattedNumber = '62' + formattedNumber.slice(3);
    }
    formattedNumber = formattedNumber + '@c.us';

    msgQueue.push({ targetNumber: formattedNumber, textMessage: message });
    processQueue();
};

/**
 * Ambil data QR code terbaru untuk di-render di Frontend.
 * @returns {string|null} String data QR, atau null jika bot sudah terhubung/belum siap.
 */
const getLatestQR = () => latestQr;

// Mulai bot saat server pertama kali berjalan
initializeBot();

module.exports = { sendWAMessage, getLatestQR };