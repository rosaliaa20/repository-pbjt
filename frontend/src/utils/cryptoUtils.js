// frontend/src/utils/cryptoUtils.js

/**
 * Generate AES-GCM Key dari string "secret" lokal (kombinasi ID perangkat/Browser)
 * Agar konsisten, kita menggunakan SHA-256 untuk mengubah password text menjadi CryptoKey.
 */
async function getCryptoKey() {
  const encoder = new TextEncoder();
  // Gunakan ID unik dari localStorage atau string default yang dikunci per domain
  let deviceId = localStorage.getItem('device_offline_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('device_offline_id', deviceId);
  }
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(`E-Repo-PBJT-Secret-${deviceId}`),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('PBJT-Secure-Salt-2026'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Enkripsi ArrayBuffer (PDF biner)
 * Return: Uint8Array yang berisi [IV (12 bytes)] + [Ciphertext]
 */
export async function encryptDocument(arrayBuffer) {
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  );
  
  // Gabungkan IV dan Ciphertext agar bisa didekripsi nanti
  const encryptedArray = new Uint8Array(encryptedBuffer);
  const finalBlob = new Uint8Array(iv.length + encryptedArray.length);
  finalBlob.set(iv, 0);
  finalBlob.set(encryptedArray, iv.length);
  
  return finalBlob;
}

/**
 * Dekripsi Uint8Array yang berisi [IV] + [Ciphertext] kembali menjadi ArrayBuffer PDF asli
 */
export async function decryptDocument(encryptedUint8Array) {
  const key = await getCryptoKey();
  const iv = encryptedUint8Array.slice(0, 12);
  const ciphertext = encryptedUint8Array.slice(12);
  
  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
    return decryptedBuffer;
  } catch (err) {
    console.error("Gagal dekripsi dokumen. Mungkin kunci tidak cocok.", err);
    throw err;
  }
}
