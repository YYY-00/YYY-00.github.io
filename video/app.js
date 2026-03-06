/**
 * 主应用逻辑
 * 整合UI交互、音频处理和音效合成
 */

class AudioEditorApp {
    constructor() {
        this.processor = new AudioProcessor();
        this.synthesizer = new SoundSynthesizer();
        this.audioLibrary = [];
        this.currentAudioIndex = -1;
        this.isPlaying = false;
        this.selection = {
            start: 0,
            end: 0,
            active: false
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateUI();
    }

    bindEvents() {
        // 文件导入
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('audioFileInput').click();
        });

        document.getElementById('audioFileInput').addEventListener('change', (e) => {
            this.handleFileImport(e.target.files);
        });

        // 播放控制
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('playSelectionBtn').addEventListener('click', () => this.playSelection());

        // 剪辑工具
        document.getElementById('trimBtn').addEventListener('click', () => this.trimSelection());
        document.getElementById('deleteBtn').addEventListener('click', () => this.deleteSelection());
        document.getElementById('duplicateBtn').addEventListener('click', () => this.duplicateSelection());
        document.getElementById('fadeInBtn').addEventListener('click', () => this.applyFadeIn(0.5));
        document.getElementById('fadeOutBtn').addEventListener('click', () => this.applyFadeOut(0.5));
        document.getElementById('volumeBtn').addEventListener('click', () => this.toggleVolumeControl());

        // 音量控制
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            document.getElementById('volumeValue').textContent = parseFloat(e.target.value).toFixed(1) + 'x';
        });

        document.getElementById('volumeSlider').addEventListener('change', (e) => {
            const multiplier = parseFloat(e.target.value);
            this.adjustVolume(multiplier);
        });

        // 音效合成 - 基础波形
        document.getElementById('genSineBtn').addEventListener('click', () => this.generateAndAddSound('sine'));
        document.getElementById('genSquareBtn').addEventListener('click', () => this.generateAndAddSound('square'));
        document.getElementById('genSawtoothBtn').addEventListener('click', () => this.generateAndAddSound('sawtooth'));
        document.getElementById('genWhiteNoiseBtn').addEventListener('click', () => this.generateAndAddSound('white-noise'));
        document.getElementById('genPinkNoiseBtn').addEventListener('click', () => this.generateAndAddSound('pink-noise'));

        // 包络生成
        document.getElementById('genSimpleBeep').addEventListener('click', () => this.generateAndAddSound('beep'));
        document.getElementById('genPing').addEventListener('click', () => this.generateAndAddSound('ping'));
        document.getElementById('genKick').addEventListener('click', () => this.generateAndAddSound('kick'));
        document.getElementById('genSnare').addEventListener('click', () => this.generateAndAddSound('snare'));
        document.getElementById('genHiHat').addEventListener('click', () => this.generateAndAddSound('hihat'));

        // 导出
        document.getElementById('exportBtn').addEventListener('click', () => this.exportAudio());

        // 波形选择
        this.initWaveformSelection();
    }

    initWaveformSelection() {
        const canvas = document.getElementById('waveformCanvas');
        const overlay = document.getElementById('selectionOverlay');
        let isSelecting = false;
        let startX = 0;

        canvas.addEventListener('mousedown', (e) => {
            if (!this.processor.getBuffer()) return;

            const rect = canvas.getBoundingClientRect();
            startX = e.clientX - rect.left;
            isSelecting = true;
            this.selection.active = false;
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isSelecting) return;

            const rect = canvas.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const canvasWidth = rect.width;

            const startTime = Math.min(startX, currentX) / canvasWidth * this.processor.getDuration();
            const endTime = Math.max(startX, currentX) / canvasWidth * this.processor.getDuration();

            this.selection.start = Math.max(0, startTime);
            this.selection.end = Math.min(this.processor.getDuration(), endTime);

            this.updateSelectionOverlay();
        });

        canvas.addEventListener('mouseup', (e) => {
            if (isSelecting) {
                isSelecting = false;

                if (Math.abs(this.selection.end - this.selection.start) > 0.01) {
                    this.selection.active = true;
                }

                this.updateSelectionInfo();
            }
        });

        canvas.addEventListener('mouseleave', () => {
            if (isSelecting) {
                isSelecting = false;
                if (Math.abs(this.selection.end - this.selection.start) > 0.01) {
                    this.selection.active = true;
                }
                this.updateSelectionInfo();
            }
        });
    }

    async handleFileImport(files) {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';

        for (const file of files) {
            if (file.type.startsWith('audio/')) {
                try {
                    const processor = new AudioProcessor();
                    await processor.loadFromFile(file);

                    this.audioLibrary.push({
                        name: file.name,
                        processor: processor,
                        originalFile: file
                    });

                    fileList.innerHTML += `<p>✓ 已导入: ${file.name}</p>`;
                } catch (error) {
                    fileList.innerHTML += `<p>✗ 导入失败: ${file.name} - ${error.message}</p>`;
                }
            }
        }

        this.updateAudioLibrary();

        // 如果是第一个音频，自动选中
        if (this.audioLibrary.length > 0 && this.currentAudioIndex === -1) {
            this.selectAudio(0);
        }
    }

    updateAudioLibrary() {
        const library = document.getElementById('audioLibrary');
        library.innerHTML = '';

        this.audioLibrary.forEach((audio, index) => {
            const duration = audio.processor.getDuration().toFixed(2);
            const sampleRate = audio.processor.getSampleRate();

            const item = document.createElement('div');
            item.className = `audio-item ${index === this.currentAudioIndex ? 'active' : ''}`;
            item.innerHTML = `
                <div class="audio-item-name">${audio.name}</div>
                <div class="audio-item-info">时长: ${duration}s | 采样率: ${sampleRate}Hz</div>
                <div class="audio-item-actions">
                    <button class="btn btn-secondary" onclick="app.selectAudio(${index})">编辑</button>
                    <button class="btn btn-info" onclick="app.previewAudio(${index})">试听</button>
                    <button class="btn btn-danger" onclick="app.removeAudio(${index})">删除</button>
                </div>
            `;

            library.appendChild(item);
        });
    }

    selectAudio(index) {
        this.currentAudioIndex = index;
        const audio = this.audioLibrary[index];

        // 设置为当前处理器
        this.processor = audio.processor;

        // 更新UI
        document.getElementById('currentAudioName').textContent = audio.name;
        document.getElementById('editorSection').style.display = 'block';

        // 重置选择
        this.selection = { start: 0, end: 0, active: false };
        document.getElementById('selectionOverlay').style.display = 'none';
        document.getElementById('selectionInfo').textContent = '选择范围: 未选择';

        // 更新时长信息
        const duration = this.processor.getDuration();
        document.getElementById('durationInfo').textContent = `总时长: ${duration.toFixed(2)}秒`;

        // 绘制波形
        this.drawWaveform();

        // 更新音频库高亮
        this.updateAudioLibrary();
    }

    previewAudio(index) {
        const audio = this.audioLibrary[index];
        audio.processor.play();
    }

    removeAudio(index) {
        if (confirm('确定要删除这个音频吗？')) {
            this.audioLibrary.splice(index, 1);

            if (index === this.currentAudioIndex) {
                this.currentAudioIndex = -1;
                document.getElementById('editorSection').style.display = 'none';
            } else if (index < this.currentAudioIndex) {
                this.currentAudioIndex--;
            }

            this.updateAudioLibrary();
        }
    }

    drawWaveform() {
        const canvas = document.getElementById('waveformCanvas');
        const ctx = canvas.getContext('2d');
        const buffer = this.processor.getBuffer();

        if (!buffer) return;

        // 设置canvas尺寸
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const data = buffer.getChannelData(0);
        const step = Math.ceil(data.length / width);
        const amp = height / 2;

        // 清空并画背景
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // 画网格
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // 水平网格
        for (let i = 0; i < 5; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // 垂直网格
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // 画波形
        ctx.beginPath();
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 1;

        for (let i = 0; i < width; i++) {
            let min = 1.0;
            let max = -1.0;

            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }

            ctx.lineTo(i, (1 + min) * amp);
        }

        ctx.stroke();

        // 画下半部分
        ctx.beginPath();
        for (let i = 0; i < width; i++) {
            let min = 1.0;
            let max = -1.0;

            for (let j = 0; j < step; j++) {
                const datum = data[(i * step) + j];
                if (datum < min) min = datum;
                if (datum > max) max = datum;
            }

            ctx.lineTo(i, (1 + max) * amp);
        }

        ctx.stroke();
    }

    updateSelectionOverlay() {
        const canvas = document.getElementById('waveformCanvas');
        const overlay = document.getElementById('selectionOverlay');
        const duration = this.processor.getDuration();
        const canvasWidth = canvas.offsetWidth;

        const startX = (this.selection.start / duration) * canvasWidth;
        const endX = (this.selection.end / duration) * canvasWidth;

        overlay.style.left = startX + 'px';
        overlay.style.width = (endX - startX) + 'px';
        overlay.style.display = 'block';
    }

    updateSelectionInfo() {
        const info = document.getElementById('selectionInfo');
        if (this.selection.active) {
            const duration = this.selection.end - this.selection.start;
            info.textContent = `选择范围: ${this.selection.start.toFixed(2)}s - ${this.selection.end.toFixed(2)}s (${duration.toFixed(2)}s)`;
        } else {
            info.textContent = '选择范围: 未选择';
        }
    }

    play() {
        this.processor.play();
    }

    pause() {
        this.processor.stop();
    }

    stop() {
        this.processor.stop();
    }

    playSelection() {
        if (!this.selection.active) {
            alert('请先在波形图上选择一个区域');
            return;
        }
        this.processor.playRange(this.selection.start, this.selection.end);
    }

    trimSelection() {
        if (!this.selection.active) {
            alert('请先在波形图上选择一个区域');
            return;
        }

        if (confirm('确定要裁剪并只保留选中区域吗？')) {
            this.processor.trim(this.selection.start, this.selection.end);
            this.selection.active = false;
            document.getElementById('selectionOverlay').style.display = 'none';
            this.updateSelectionInfo();
            this.drawWaveform();
            this.updateDurationInfo();
        }
    }

    deleteSelection() {
        if (!this.selection.active) {
            alert('请先在波形图上选择一个区域');
            return;
        }

        if (confirm('确定要删除选中区域吗？')) {
            this.processor.deleteRange(this.selection.start, this.selection.end);
            this.selection.active = false;
            document.getElementById('selectionOverlay').style.display = 'none';
            this.updateSelectionInfo();
            this.drawWaveform();
            this.updateDurationInfo();
        }
    }

    duplicateSelection() {
        if (!this.selection.active) {
            alert('请先在波形图上选择一个区域');
            return;
        }

        this.processor.duplicateRange(this.selection.start, this.selection.end);
        this.drawWaveform();
        this.updateDurationInfo();
    }

    applyFadeIn(duration) {
        this.processor.applyFadeIn(duration);
        this.drawWaveform();
    }

    applyFadeOut(duration) {
        this.processor.applyFadeOut(duration);
        this.drawWaveform();
    }

    toggleVolumeControl() {
        const volumeControl = document.getElementById('volumeControl');
        volumeControl.style.display = volumeControl.style.display === 'none' ? 'block' : 'none';
    }

    adjustVolume(multiplier) {
        if (this.selection.active) {
            this.processor.adjustVolumeRange(this.selection.start, this.selection.end, multiplier);
        } else {
            this.processor.adjustVolume(multiplier);
        }
        this.drawWaveform();
    }

    generateAndAddSound(type) {
        const duration = parseFloat(document.getElementById('synthDuration').value);
        const frequency = parseFloat(document.getElementById('synthFrequency').value);
        const sampleRate = parseInt(document.getElementById('synthSampleRate').value);

        let buffer;
        let name;

        try {
            switch (type) {
                case 'sine':
                    buffer = this.synthesizer.generateSineWave(frequency, duration, sampleRate);
                    name = `正弦波_${frequency}Hz`;
                    break;
                case 'square':
                    buffer = this.synthesizer.generateSquareWave(frequency, duration, sampleRate);
                    name = `方波_${frequency}Hz`;
                    break;
                case 'sawtooth':
                    buffer = this.synthesizer.generateSawtoothWave(frequency, duration, sampleRate);
                    name = `锯齿波_${frequency}Hz`;
                    break;
                case 'white-noise':
                    buffer = this.synthesizer.generateWhiteNoise(duration, sampleRate);
                    name = `白噪声_${duration}s`;
                    break;
                case 'pink-noise':
                    buffer = this.synthesizer.generatePinkNoise(duration, sampleRate);
                    name = `粉红噪声_${duration}s`;
                    break;
                case 'beep':
                    buffer = this.synthesizer.generateSimpleBeep(frequency, duration);
                    name = `哔声_${frequency}Hz`;
                    break;
                case 'ping':
                    buffer = this.synthesizer.generatePing(frequency, duration);
                    name = `Ping_${frequency}Hz`;
                    break;
                case 'kick':
                    buffer = this.synthesizer.generateKick(duration);
                    name = `底鼓`;
                    break;
                case 'snare':
                    buffer = this.synthesizer.generateSnare(duration);
                    name = `军鼓`;
                    break;
                case 'hihat':
                    buffer = this.synthesizer.generateHiHat(duration);
                    name = `踩镲`;
                    break;
            }

            if (buffer) {
                const processor = new AudioProcessor();
                processor.setBuffer(buffer);

                this.audioLibrary.push({
                    name: name,
                    processor: processor,
                    originalFile: null
                });

                this.updateAudioLibrary();

                // 自动选中新生成的音频
                this.selectAudio(this.audioLibrary.length - 1);

                // 显示预览
                this.showSynthPreview(name);
            }
        } catch (error) {
            alert('生成音效失败: ' + error.message);
        }
    }

    showSynthPreview(name) {
        const preview = document.getElementById('synthPreview');
        preview.innerHTML = `<p>✓ 已生成: ${name}</p>`;
        preview.style.display = 'block';

        setTimeout(() => {
            preview.style.display = 'none';
        }, 3000);
    }

    updateDurationInfo() {
        const duration = this.processor.getDuration();
        document.getElementById('durationInfo').textContent = `总时长: ${duration.toFixed(2)}秒`;
    }

    exportAudio() {
        if (!this.processor.getBuffer()) {
            alert('没有可导出的音频');
            return;
        }

        const wavBlob = AudioProcessor.audioBufferToWav(this.processor.getBuffer());

        if (wavBlob) {
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.audioLibrary[this.currentAudioIndex]?.name || 'export.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    updateUI() {
        this.updateAudioLibrary();
        if (this.currentAudioIndex >= 0) {
            this.drawWaveform();
            this.updateDurationInfo();
        }
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new AudioEditorApp();
});
