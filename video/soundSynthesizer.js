/**
 * 音效合成器模块
 * 负责生成各种类型的音效和合成音
 */

class SoundSynthesizer {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    /**
     * 生成正弦波
     */
    generateSineWave(frequency, duration, sampleRate = 44100) {
        const numSamples = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            channelData[i] = Math.sin(2 * Math.PI * frequency * t);
        }

        return buffer;
    }

    /**
     * 生成方波
     */
    generateSquareWave(frequency, duration, sampleRate = 44100) {
        const numSamples = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const period = 1 / frequency;
            channelData[i] = (t % period) < (period / 2) ? 1 : -1;
        }

        return buffer;
    }

    /**
     * 生成锯齿波
     */
    generateSawtoothWave(frequency, duration, sampleRate = 44100) {
        const numSamples = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const period = 1 / frequency;
            channelData[i] = 2 * ((t % period) / period - 0.5);
        }

        return buffer;
    }

    /**
     * 生成白噪声
     */
    generateWhiteNoise(duration, sampleRate = 44100) {
        const numSamples = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            channelData[i] = Math.random() * 2 - 1;
        }

        return buffer;
    }

    /**
     * 生成粉红噪声（更自然的噪声）
     */
    generatePinkNoise(duration, sampleRate = 44100) {
        const numSamples = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);

        // 使用保罗·凯利特的粉红噪声生成算法
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        const pink = [0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < numSamples; i++) {
            const white = Math.random() * 2 - 1;

            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;

            pink[0] = b0;
            pink[1] = b1;
            pink[2] = b2;
            pink[3] = b3;
            pink[4] = b4;
            pink[5] = b5;

            const mono = pink[0] + pink[1] + pink[2] + pink[3] + pink[4] + pink[5] + pink[6] + white * 0.5362;
            pink[6] = white * 0.115926;

            channelData[i] = mono * 0.11; // 归一化
        }

        return buffer;
    }

    /**
     * 应用包络（ADSR或简单包络）
     */
    applyEnvelope(buffer, attackTime, decayTime, sustainLevel, releaseTime) {
        const sampleRate = buffer.sampleRate;
        const channelData = buffer.getChannelData(0);
        const numSamples = channelData.length;

        const attackSamples = attackTime * sampleRate;
        const decaySamples = decayTime * sampleRate;
        const releaseSamples = releaseTime * sampleRate;
        const sustainStart = attackSamples + decaySamples;
        const sustainEnd = numSamples - releaseSamples;

        for (let i = 0; i < numSamples; i++) {
            let gain = 0;

            if (i < attackSamples) {
                // Attack phase
                gain = i / attackSamples;
            } else if (i < sustainStart) {
                // Decay phase
                const decayProgress = (i - attackSamples) / decaySamples;
                gain = 1 - (1 - sustainLevel) * decayProgress;
            } else if (i < sustainEnd) {
                // Sustain phase
                gain = sustainLevel;
            } else {
                // Release phase
                const releaseProgress = (i - sustainEnd) / releaseSamples;
                gain = sustainLevel * (1 - releaseProgress);
            }

            channelData[i] *= gain;
        }

        return buffer;
    }

    /**
     * 生成简单哔声
     */
    generateSimpleBeep(frequency = 880, duration = 0.1) {
        const buffer = this.generateSineWave(frequency, duration, 44100);
        return this.applyEnvelope(buffer, 0.001, 0.01, 0, 0.02);
    }

    /**
     * 生成Ping音（金属感）
     */
    generatePing(frequency = 1200, duration = 0.5) {
        const buffer = this.generateSineWave(frequency, duration, 44100);
        const channelData = buffer.getChannelData(0);

        // 添加一些谐波来创造金属感
        for (let i = 0; i < channelData.length; i++) {
            const t = i / buffer.sampleRate;
            channelData[i] += Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3;
            channelData[i] += Math.sin(2 * Math.PI * frequency * 3 * t) * 0.15;
            channelData[i] /= 1.45; // 归一化
        }

        return this.applyEnvelope(buffer, 0.001, 0.05, 0, 0.4);
    }

    /**
     * 生成底鼓
     */
    generateKick(duration = 0.3) {
        const sampleRate = 44100;
        const numSamples = duration * sampleRate;
        const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
        const channelData = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            // 频率 sweep 从 150Hz 到 30Hz
            const freq = 150 * Math.exp(-t * 15) + 30;
            channelData[i] = Math.sin(2 * Math.PI * freq * t);

            // 添加一些噪声增加打击感
            channelData[i] += (Math.random() * 2 - 1) * 0.1 * Math.exp(-t * 30);
        }

        return this.applyEnvelope(buffer, 0.001, 0.05, 0, 0.1);
    }

    /**
     * 生成军鼓噪音
     */
    generateSnare(duration = 0.2) {
        const buffer = this.generateWhiteNoise(duration, 44100);
        return this.applyEnvelope(buffer, 0.001, 0.02, 0.3, 0.1);
    }

    /**
     * 生成踩镲
     */
    generateHiHat(duration = 0.1) {
        const buffer = this.generateWhiteNoise(duration, 44100);
        const channelData = buffer.getChannelData(0);

        // 高通滤波器效果（简单的模拟）
        for (let i = 1; i < channelData.length; i++) {
            channelData[i] = channelData[i] - channelData[i - 1] * 0.9;
        }

        return this.applyEnvelope(buffer, 0.001, 0.01, 0, 0.05);
    }

    /**
     * 将AudioBuffer转换为WAV格式的Blob
     */
    audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;

        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;

        const dataLength = buffer.length * blockAlign;
        const bufferLength = 44 + dataLength;

        const arrayBuffer = new ArrayBuffer(bufferLength);
        const view = new DataView(arrayBuffer);

        // WAV文件头
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
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

        // 写入音频数据
        const channels = [];
        for (let i = 0; i < numChannels; i++) {
            channels.push(buffer.getChannelData(i));
        }

        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            for (let ch = 0; ch < numChannels; ch++) {
                const sample = Math.max(-1, Math.min(1, channels[ch][i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    /**
     * 播放AudioBuffer
     */
    playBuffer(buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(0);
        return source;
    }

    /**
     * 停止播放
     */
    stopSource(source) {
        if (source) {
            source.stop();
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundSynthesizer;
}
