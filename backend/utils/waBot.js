const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-site-isolation-trials', 
            '--disable-gpu',                   
            '--single-process'                 
        ],
        timeout: 60000 
    }
});

client.on('qr', (qr) => {
    console.log('\n=========================================');
    console.log('📱 SCAN QR CODE INI DI WHATSAPP KAMU (Sbg Bot):');
    qrcode.generate(qr, { small: true });
    console.log('=========================================\n');
});

client.on('ready', () => {
    console.log('✅ Bot WhatsApp E-Repository Berhasil Terhubung!');
});

// ========================================================
// SYSTEM QUEUE (ANTREAN) AGAR TIDAK BENTROK / DETACHED FRAME
// ========================================================
let msgQueue = [];
let isProcessing = false;

const processQueue = async () => {
    // Jika sedang memproses pesan lain atau antrean kosong, berhenti dulu
    if (isProcessing || msgQueue.length === 0) return;
    
    isProcessing = true;
    const { targetNumber, textMessage } = msgQueue.shift(); // Ambil antrean pertama

    try {
        await client.sendMessage(targetNumber, textMessage);
        console.log(`✅ Pesan WA berhasil dikirim ke: ${targetNumber}`);
    } catch (error) {
        console.error(`❌ Gagal mengirim pesan WA ke ${targetNumber}:`, error.message);
    } finally {
        // Beri jeda aman 2.5 detik sebelum memproses pesan berikutnya agar tidak bentrok
        await new Promise(resolve => setTimeout(resolve, 2500));
        isProcessing = false;
        processQueue(); // Jalankan antrean berikutnya
    }
};

// Fungsi utama yang dipanggil oleh controller
const sendWAMessage = async (number, message) => {
    if (!number) return;
    
    // Bersihkan format nomor
    let formattedNumber = number.replace(/[- ]/g, "");
    if (formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.slice(1);
    } else if (formattedNumber.startsWith('+62')) {
        formattedNumber = '62' + formattedNumber.slice(3);
    }
    formattedNumber = formattedNumber + '@c.us';

    // Masukkan ke dalam antrean, bukan langsung dikirim
    msgQueue.push({ targetNumber: formattedNumber, textMessage: message });
    
    // Picu pemrosesan antrean
    processQueue();
};

client.initialize();

module.exports = { sendWAMessage };