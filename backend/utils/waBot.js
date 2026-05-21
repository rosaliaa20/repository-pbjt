const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Kita gunakan LocalAuth agar sesi tersimpan (cukup scan QR 1x saja)
const client = new Client({
    authStrategy: new LocalAuth()
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

// Fungsi pintar untuk memformat nomor HP dan mengirim pesan
const sendWAMessage = async (number, message) => {
    try {
        if (!number) return;
        
        // Bersihkan spasi atau tanda strip jika ada
        let formattedNumber = number.replace(/[- ]/g, "");
        
        // Ubah awalan '0' atau '+62' menjadi '62' (Standar WhatsApp)
        if (formattedNumber.startsWith('0')) {
            formattedNumber = '62' + formattedNumber.slice(1);
        } else if (formattedNumber.startsWith('+62')) {
            formattedNumber = '62' + formattedNumber.slice(3);
        }

        // Tambahkan akhiran ID WhatsApp
        formattedNumber = formattedNumber + '@c.us';

        // Kirim pesan
        await client.sendMessage(formattedNumber, message);
        console.log(`✅ Pesan WA berhasil dikirim ke: ${formattedNumber}`);
    } catch (error) {
        console.error(`❌ Gagal mengirim pesan WA:`, error.message);
    }
};

client.initialize();

module.exports = { sendWAMessage };