const fs = require('fs');
const path = require('path');

function generateWav(filename, frequency = 440, durationSeconds = 1.5) {
    const sampleRate = 44100;
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = sampleRate * durationSeconds * blockAlign;
    const fileSize = 36 + dataSize;

    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF chunk
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(fileSize, 4);
    buffer.write('WAVE', 8);

    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bytesPerSample * 8, 34); // BitsPerSample

    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    // Audio data (Sine wave beep-beep pattern)
    for (let i = 0; i < sampleRate * durationSeconds; i++) {
        const t = i / sampleRate;
        // Modulate amplitude for Beep-Beep effect
        const ampMod = Math.sin(t * Math.PI * 10) > 0 ? 1 : 0;

        const angle = t * frequency * 2 * Math.PI;
        const sample = Math.sin(angle) * ampMod * 0.5; // 50% volume

        // Scale to 16-bit signed integer range
        const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32767)));
        buffer.writeInt16LE(intSample, 44 + i * 2);
    }

    fs.writeFileSync(filename, buffer);
    console.log(`Generated ${filename}`);
}

// Ensure directory exists
const soundsDir = path.join(__dirname, 'public/sounds');
if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
}

// Generate incoming ringtone (High pitch)
generateWav(path.join(soundsDir, 'incoming.wav'), 880, 0.2);

// Generate outgoing ringtone (Lower pitch)
generateWav(path.join(soundsDir, 'outgoing.wav'), 440, 0.2);

// Output Base64 for embedding
const wavBuffer = fs.readFileSync(path.join(soundsDir, 'incoming.wav'));
console.log('--- BASE64 START ---');
console.log(wavBuffer.toString('base64'));
console.log('--- BASE64 END ---');

