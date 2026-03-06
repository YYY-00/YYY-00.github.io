/**
 * 音频处理器模块
 * 负责音频的基本编辑操作
 */

class AudioProcessor {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.currentBuffer = null;
        this.currentSource = null;
    }

    /**
     * 从文件加载音频
     */
    async loadFromFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        this.currentBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return this.currentBuffer;
    }

    /**
     * 设置当前音频缓冲区
     */
    setBuffer(buffer) {
        this.currentBuffer = buffer;
        return this.currentBuffer;
    }

    /**
     * 获取当前缓冲区
     */
    getBuffer() {
        return this.currentBuffer;
    }

    /**
     * 播放整个音频
     */
    play() {
        if (!this.currentBuffer) return null;

        this.stop();

        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = this.currentBuffer;
        this.currentSource.connect(this.audioContext.destination);
        this.currentSource.start(0);

        return this.currentSource;
    }

    /**
     * 播放指定范围
     */
    playRange(startTime, endTime) {
        if (!this.currentBuffer) return null;

        this.stop();

        this.currentSource = this.audioContext.createBufferSource();
        this.currentSource.buffer = this.currentBuffer;
        this.currentSource.connect(this.audioContext.destination);
        this.currentSource.start(0, startTime, endTime - startTime);

        return this.currentSource;
    }

    /**
     * 停止播放
     */
    stop() {
        if (this.currentSource) {
            try {
                this.currentSource.stop();
            } catch (e) {
                // 忽略已经停止的源
            }
            this.currentSource = null;
        }
    }

    /**
     * 裁剪音频（保留选中区域）
     */
    trim(startTime, endTime) {
        if (!this.currentBuffer) return null;

        const startSample = Math.floor(startTime * this.currentBuffer.sampleRate);
        const endSample = Math.floor(endTime * this.currentBuffer.sampleRate);
        const newLength = endSample - startSample;

        const newBuffer = this.audioContext.createBuffer(
            this.currentBuffer.numberOfChannels,
            newLength,
            this.currentBuffer.sampleRate
        );

        for (let channel = 0; channel < this.currentBuffer.numberOfChannels; channel++) {
            const oldData = this.currentBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);

            for (let i = 0; i < newLength; i++) {
                newData[i] = oldData[startSample + i];
            }
        }

        this.currentBuffer = newBuffer;
        return this.currentBuffer;
    }

    /**
     * 删除选中区域
     */
    deleteRange(startTime, endTime) {
        if (!this.currentBuffer) return null;

        const sampleRate = this.currentBuffer.sampleRate;
        const startSample = Math.floor(startTime * sampleRate);
        const endSample = Math.floor(endTime * sampleRate);
        const totalSamples = this.currentBuffer.length;
        const deleteLength = endSample - startSample;
        const newLength = totalSamples - deleteLength;

        const newBuffer = this.audioContext.createBuffer(
            this.currentBuffer.numberOfChannels,
            newLength,
            sampleRate
        );

        for (let channel = 0; channel < this.currentBuffer.numberOfChannels; channel++) {
            const oldData = this.currentBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);

            // 复制删除区域之前的数据
            for (let i = 0; i < startSample; i++) {
                newData[i] = oldData[i];
            }

            // 复制删除区域之后的数据
            for (let i = endSample; i < totalSamples; i++) {
                newData[i - deleteLength] = oldData[i];
            }
        }

        this.currentBuffer = newBuffer;
        return this.currentBuffer;
    }

    /**
     * 复制选中区域并追加到末尾
     */
    duplicateRange(startTime, endTime) {
        if (!this.currentBuffer) return null;

        const startSample = Math.floor(startTime * this.currentBuffer.sampleRate);
        const endSample = Math.floor(endTime * this.currentBuffer.sampleRate);
        const copyLength = endSample - startSample;
        const originalLength = this.currentBuffer.length;
        const newLength = originalLength + copyLength;

        const newBuffer = this.audioContext.createBuffer(
            this.currentBuffer.numberOfChannels,
            newLength,
            this.currentBuffer.sampleRate
        );

        for (let channel = 0; channel < this.currentBuffer.numberOfChannels; channel++) {
            const oldData = this.currentBuffer.getChannelData(channel);
            const newData = newBuffer.getChannelData(channel);

            // 复制原始数据
            for (let i = 0; i < originalLength; i++) {
                newData[i] = oldData[i];
            }

            // 追加选中的数据
            for (let i = 0; i < copyLength; i++) {
                newData[originalLength + i] = oldData[startSample + i];
            }
        }

        this.currentBuffer = newBuffer;
        return this.currentBuffer;
    }

    /**
     * 应用淡入效果
     */
    applyFadeIn(duration) {
        if (!this.currentBuffer) return null;

        const sampleRate = this.currentBuffer.sampleRate;
        const fadeSamples = Math.floor(duration * sampleRate);
        const actualFadeSamples = Math.min(fadeSamples, this.currentBuffer.length);

        for (let channel = 0; channel < this.currentBuffer.numberOfChannels; channel++) {
            const channelData = this.currentBuffer.getChannelData(channel);

            for (let i = 0; i < actualFadeSamples; i++) {
                const gain = i / actualFadeSamples;
                channelData[i] *= gain;
            }
        }

        return this.currentBuffer;
    }

    /**
     * 应用淡出效果
     */
    applyFadeOut(duration) {
        if (!this.currentBuffer) return null;

        const sampleRate = this.currentBuffer.sampleRate;
        const fadeSamples = Math.floor(duration * sampleRate);
        const actualFadeSamples = Math.min(fadeSamples, this.currentBuffer.length);
        const startSample = this.currentBuffer.length - actualFadeSamples;

        for (let channel = 0; channel < this.currentBuffer.numberOfChannels; channel++) {
            const channelData = this.currentBuffer.getChannelData(channel);

            for (let i = 0; i < actualFadeSamples; i++) {
                const gain = 1 - (i / actualFadeSamples);
                channelData[startSample + i] *= gain;
            }
        }

        return this.currentBuffer;
    }

    /**
     * 调整音量
     */
    adjustVolume(gainMultiplier) {
        if (!this.currentBuffer) return null;

        for (let channel = 0; channel < this.currentBuffer.numberOfChannels; channel++) {
            const channelData = this.currentBuffer.getChannelData(channel);

            for (let i = 0; i < channelData.length; i++) {
                channelData[i] *= gainMultiplier;
            }
        }

        return this.currentBuffer;
    }

    /**
     * 调整选中区域的音量
     */
    adjustVolumeRange(startTime, endTime, gainMultiplier) {
        if (!this.currentBuffer) return null;

        const startSample = Math.floor(startTime * this.currentBuffer.sampleRate);
        const endSample = Math.floor(endTime * this.currentBuffer.sampleRate);

        for (let channel = 0; channel < this.currentBuffer.numberOfChannels; channel++) {
            const channelData = this.currentBuffer.getChannelData(channel);

            for (let i = startSample; i < endSample; i++) {
                channelData[i] *= gainMultiplier;
            }
        }

        return this.currentBuffer;
    }

    /**
     * 合并多个音频缓冲区
     */
    concatenate(buffers) {
        if (buffers.length === 0) return null;
        if (buffers.length === 1) return buffers[0];

        const sampleRate = buffers[0].sampleRate;
        const numChannels = buffers[0].numberOfChannels;

        // 计算总长度
        let totalLength = 0;
        for (const buffer of buffers) {
            totalLength += buffer.length;
        }

        const newBuffer = this.audioContext.createBuffer(numChannels, totalLength, sampleRate);
        let offset = 0;

        for (const buffer of buffers) {
            for (let channel = 0; channel < numChannels; channel++) {
                const sourceData = buffer.getChannelData(channel);
                const destData = newBuffer.getChannelData(channel);

                for (let i = 0; i < buffer.length; i++) {
                    destData[offset + i] = sourceData[i];
                }
            }
            offset += buffer.length;
        }

        return newBuffer;
    }

    /**
     * 将AudioBuffer转换为WAV格式的Blob
     */
    exportToWav() {
        if (!this.currentBuffer) return null;

        return this.audioBufferToWav(this.currentBuffer);
    }

    /**
     * AudioBuffer转WAV Blob（静态方法）
     */
    static audioBufferToWav(buffer) {
        const numChannels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
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
        view.setUint16(20, 1, true); // PCM format
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
     * 获取音频时长
     */
    getDuration() {
        if (!this.currentBuffer) return 0;
        return this.currentBuffer.duration;
    }

    /**
     * 获取采样率
     */
    getSampleRate() {
        if (!this.currentBuffer) return 0;
        return this.currentBuffer.sampleRate;
    }

    /**
     * 获取通道数
     */
    getNumberOfChannels() {
        if (!this.currentBuffer) return 0;
        return this.currentBuffer.numberOfChannels;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioProcessor;
}
