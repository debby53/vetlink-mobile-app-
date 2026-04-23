/**
 * Simple script to generate ringtone audio files using Web Audio API
 * This creates basic but pleasant ringtone sounds
 * Run this in a browser console or as a Node.js script with appropriate audio libraries
 */

// Function to create a simple ringtone using Web Audio API
async function generateRingtone(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const duration = type === 'incoming' ? 3 : 2; // seconds
    const numChannels = 1;

    const audioBuffer = audioContext.createBuffer(numChannels, sampleRate * duration, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    if (type === 'incoming') {
        // Create a pleasant two-tone ringtone (like classic phone ring)
        const freq1 = 440; // A4
        const freq2 = 554.37; // C#5
        const ringDuration = 0.4;
        const pauseDuration = 0.2;
        const cycleDuration = (ringDuration * 2) + pauseDuration;

        for (let i = 0; i < channelData.length; i++) {
            const time = i / sampleRate;
            const cycleTime = time % cycleDuration;

            if (cycleTime < ringDuration) {
                // First tone
                channelData[i] = Math.sin(2 * Math.PI * freq1 * time) * 0.3;
            } else if (cycleTime < ringDuration * 2) {
                // Second tone
                channelData[i] = Math.sin(2 * Math.PI * freq2 * time) * 0.3;
            } else {
                // Pause
                channelData[i] = 0;
            }

            // Apply envelope for smoother sound
            const envelope = Math.min(1, time * 10) * Math.min(1, (duration - time) * 10);
            channelData[i] *= envelope;
        }
    } else {
        // Create outgoing ringtone (dial tone style)
        const freq = 400;
        const beepDuration = 1.0;
        const pauseDuration = 0.5;
        const cycleDuration = beepDuration + pauseDuration;

        for (let i = 0; i < channelData.length; i++) {
            const time = i / sampleRate;
            const cycleTime = time % cycleDuration;

            if (cycleTime < beepDuration) {
                channelData[i] = Math.sin(2 * Math.PI * freq * time) * 0.2;
            } else {
                channelData[i] = 0;
            }

            // Apply envelope
            const envelope = Math.min(1, time * 10) * Math.min(1, (duration - time) * 10);
            channelData[i] *= envelope;
        }
    }

    return audioBuffer;
}

// Function to convert AudioBuffer to WAV blob
function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;

    const data = buffer.getChannelData(0);
    const dataLength = data.length * bytesPerSample;
    const bufferLength = 44 + dataLength;

    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);

    // Write WAV header
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, bufferLength - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    // Write audio data
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
        const sample = Math.max(-1, Math.min(1, data[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Generate and download ringtones
async function generateAndDownload() {
    console.log('Generating ringtones...');

    // Generate incoming ringtone
    const incomingBuffer = await generateRingtone('incoming');
    const incomingBlob = audioBufferToWav(incomingBuffer);
    const incomingUrl = URL.createObjectURL(incomingBlob);
    const incomingLink = document.createElement('a');
    incomingLink.href = incomingUrl;
    incomingLink.download = 'incoming-ringtone.wav';
    incomingLink.click();

    console.log('Incoming ringtone generated');

    // Generate outgoing ringtone
    const outgoingBuffer = await generateRingtone('outgoing');
    const outgoingBlob = audioBufferToWav(outgoingBuffer);
    const outgoingUrl = URL.createObjectURL(outgoingBlob);
    const outgoingLink = document.createElement('a');
    outgoingLink.href = outgoingUrl;
    outgoingLink.download = 'outgoing-ringtone.wav';
    outgoingLink.click();

    console.log('Outgoing ringtone generated');
    console.log('Done! Check your downloads folder.');
}

// Run if in browser
if (typeof window !== 'undefined') {
    console.log('Run generateAndDownload() to create ringtone files');
}
