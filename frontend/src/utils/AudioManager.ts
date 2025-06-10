/**
 * 音频管理器
 * 用于全局音量控制和设置持久化
 */
export class AudioManager {
    private static instance: AudioManager;
    private masterVolume: number = 1.0;
    private musicVolume: number = 0.5;
    private soundVolume: number = 0.8;
    private isMuted: boolean = false;
    
    // 音频实例跟踪
    private activeSounds: Map<string, Phaser.Sound.BaseSound> = new Map();
    private eventEmitter: Phaser.Events.EventEmitter;
    
    // AudioContext状态管理
    private audioContextResumed: boolean = false;
    
    // 本地存储键名
    private static readonly STORAGE_KEYS = {
        MASTER_VOLUME: 'gameAudio_masterVolume',
        MUSIC_VOLUME: 'gameAudio_musicVolume',
        SOUND_VOLUME: 'gameAudio_soundVolume',
        IS_MUTED: 'gameAudio_isMuted'
    };

    private constructor() {
        this.eventEmitter = new Phaser.Events.EventEmitter();
        this.loadVolumeSettings();
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    /**
     * 从localStorage加载音量设置，确保全局一致性
     */
    private loadVolumeSettings(): void {
        try {
            const masterVol = localStorage.getItem(AudioManager.STORAGE_KEYS.MASTER_VOLUME);
            const musicVol = localStorage.getItem(AudioManager.STORAGE_KEYS.MUSIC_VOLUME);
            const soundVol = localStorage.getItem(AudioManager.STORAGE_KEYS.SOUND_VOLUME);
            const muted = localStorage.getItem(AudioManager.STORAGE_KEYS.IS_MUTED);

            // 优先使用缓存设置，如果没有则使用默认值
            this.masterVolume = masterVol !== null ? parseFloat(masterVol) : 1.0;
            this.musicVolume = musicVol !== null ? parseFloat(musicVol) : 0.5;
            this.soundVolume = soundVol !== null ? parseFloat(soundVol) : 0.8;
            this.isMuted = muted !== null ? muted === 'true' : false;

            console.log('🔊 全局音量设置已加载:', {
                master: this.masterVolume,
                music: this.musicVolume,
                sound: this.soundVolume,
                muted: this.isMuted,
                fromCache: {
                    master: masterVol !== null,
                    music: musicVol !== null,
                    sound: soundVol !== null,
                    muted: muted !== null
                }
            });
            
            // 如果是首次使用，保存默认设置
            if (masterVol === null || musicVol === null || soundVol === null || muted === null) {
                console.log('💾 首次使用，保存默认音量设置');
                this.saveVolumeSettings();
            }
        } catch (error) {
            console.warn('⚠️ 加载音量设置失败，使用默认值:', error);
            // 使用默认值并保存
            this.saveVolumeSettings();
        }
    }

    /**
     * 保存音量设置到localStorage
     */
    private saveVolumeSettings(): void {
        try {
            localStorage.setItem(AudioManager.STORAGE_KEYS.MASTER_VOLUME, this.masterVolume.toString());
            localStorage.setItem(AudioManager.STORAGE_KEYS.MUSIC_VOLUME, this.musicVolume.toString());
            localStorage.setItem(AudioManager.STORAGE_KEYS.SOUND_VOLUME, this.soundVolume.toString());
            localStorage.setItem(AudioManager.STORAGE_KEYS.IS_MUTED, this.isMuted.toString());
            console.log('💾 音量设置已保存');
        } catch (error) {
            console.error('❌ 保存音量设置失败:', error);
        }
    }

    /**
     * 设置主音量
     */
    public setMasterVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.saveVolumeSettings();
    }

    /**
     * 设置音乐音量
     */
    public setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.saveVolumeSettings();
    }

    /**
     * 设置音效音量
     */
    public setSoundVolume(volume: number): void {
        this.soundVolume = Math.max(0, Math.min(1, volume));
        const effectiveVolume = this.getEffectiveSoundVolume();
        console.log(`🔊 音效音量已设置为: ${Math.round(this.soundVolume * 100)}%`);
        console.log(`🔊 实际有效音效音量: ${Math.round(effectiveVolume * 100)}%`);
        
        // 发送音量变化事件
        this.eventEmitter.emit('soundVolumeChanged', effectiveVolume);
        
        this.saveVolumeSettings();
    }

    /**
     * 设置静音状态
     */
    public setMuted(muted: boolean): void {
        this.isMuted = muted;
        this.saveVolumeSettings();
    }

    /**
     * 获取计算后的音乐音量（考虑主音量和静音状态）
     */
    public getEffectiveMusicVolume(): number {
        // 音乐音量保持原有逻辑，使用固定的合理音量
        return this.isMuted ? 0 : this.musicVolume;
    }

    /**
     * 获取计算后的音效音量（考虑主音量和静音状态）
     */
    public getEffectiveSoundVolume(): number {
        // 在简化模式下，直接使用音效音量作为最终音量（不乘以主音量）
        return this.isMuted ? 0 : this.soundVolume;
    }

    /**
     * 获取音量设置
     */
    public getVolumeSettings() {
        return {
            masterVolume: this.masterVolume,
            musicVolume: this.musicVolume,
            soundVolume: this.soundVolume,
            isMuted: this.isMuted
        };
    }

    /**
     * 尝试恢复AudioContext
     */
    private async tryResumeAudioContext(scene: Phaser.Scene): Promise<void> {
        if (!this.audioContextResumed && (scene.sound as any).context) {
            try {
                const audioContext = (scene.sound as any).context;
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                    this.audioContextResumed = true;
                    console.log('🎵 AudioContext已恢复');
                }
            } catch (error) {
                console.warn('⚠️ 无法恢复AudioContext:', error);
            }
        }
    }

    /**
     * 播放音乐（自动应用音量设置）
     */
    public playMusic(scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig): boolean {
        try {
            // 检查音频资源是否存在
            if (!scene.cache.audio.exists(key)) {
                console.warn(`⚠️ 音乐 "${key}" 不存在，跳过播放`);
                return false;
            }

            // 尝试恢复AudioContext
            this.tryResumeAudioContext(scene);

            const effectiveVolume = this.getEffectiveMusicVolume();
            const finalConfig = {
                ...config,
                volume: effectiveVolume
            };
            console.log(`🎵 播放音乐 "${key}" 音量: ${Math.round(effectiveVolume * 100)}%`);
            
            const sound = scene.sound.add(key, finalConfig);
            
            // 跟踪音频实例
            const soundId = `music_${key}_${Date.now()}`;
            this.activeSounds.set(soundId, sound);
            
            // 创建专门的音量变化处理函数
            const volumeChangeHandler = (newVolume: number) => {
                if (sound && sound.isPlaying) {
                    sound.setVolume(newVolume);
                    console.log(`🎵 更新音乐 "${key}" 音量: ${Math.round(newVolume * 100)}%`);
                }
            };
            
            // 监听音量变化事件
            this.eventEmitter.on('soundVolumeChanged', volumeChangeHandler);
            
            // 音频播放完成后清理
            sound.once('complete', () => {
                this.activeSounds.delete(soundId);
                this.eventEmitter.off('soundVolumeChanged', volumeChangeHandler);
            });
            
            // 音频停止时清理
            sound.once('stop', () => {
                this.activeSounds.delete(soundId);
                this.eventEmitter.off('soundVolumeChanged', volumeChangeHandler);
            });
            
            sound.play();
            return true;
        } catch (error) {
            console.error('播放音乐失败:', error);
            return false;
        }
    }

    /**
     * 播放音效（自动应用音量设置）
     */
    public playSound(scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig): boolean {
        try {
            // 检查音频资源是否存在
            if (!scene.cache.audio.exists(key)) {
                console.warn(`⚠️ 音效 "${key}" 不存在，跳过播放`);
                return false;
            }

            // 尝试恢复AudioContext
            this.tryResumeAudioContext(scene);

            const effectiveVolume = this.getEffectiveSoundVolume();
            const finalConfig = {
                ...config,
                volume: effectiveVolume
            };
            console.log(`🎵 播放音效 "${key}" 音量: ${Math.round(effectiveVolume * 100)}%`);
            
            const sound = scene.sound.add(key, finalConfig);
            
            // 跟踪音频实例
            const soundId = `${key}_${Date.now()}_${Math.random()}`;
            this.activeSounds.set(soundId, sound);
            
            // 创建专门的音量变化处理函数
            const volumeChangeHandler = (newVolume: number) => {
                if (sound && sound.isPlaying) {
                    sound.setVolume(newVolume);
                    console.log(`🔊 更新音效 "${key}" 音量: ${Math.round(newVolume * 100)}%`);
                }
            };
            
            // 监听音量变化事件
            this.eventEmitter.on('soundVolumeChanged', volumeChangeHandler);
            
            // 音频播放完成后清理
            sound.once('complete', () => {
                this.activeSounds.delete(soundId);
                this.eventEmitter.off('soundVolumeChanged', volumeChangeHandler);
            });
            
            // 音频停止时清理
            sound.once('stop', () => {
                this.activeSounds.delete(soundId);
                this.eventEmitter.off('soundVolumeChanged', volumeChangeHandler);
            });
            
            sound.play();
            return true;
        } catch (error) {
            console.error('播放音效失败:', error);
            return false;
        }
    }

    /**
     * 更新所有正在播放的音频音量 (备用方法，现在主要使用事件系统)
     */
    public updateAllAudioVolume(scene: Phaser.Scene): void {
        console.log(`🎛️ 使用事件系统更新音频音量，当前跟踪 ${this.activeSounds.size} 个音频实例`);
        // 事件系统会自动处理音频音量更新，这里主要用于日志输出
    }

    /**
     * 判断音频键是否为音乐类型
     */
    private isMusicKey(key: string): boolean {
        const musicKeys = [
            'landing-interface-music',
            'main-city-bgm',
            'level-background-music',
            'garden-bgm',
            'curious-tree-bgm'
        ];
        return musicKeys.includes(key);
    }

    /**
     * 切换静音状态
     */
    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        const effectiveVolume = this.getEffectiveSoundVolume();
        
        // 发送音量变化事件
        this.eventEmitter.emit('soundVolumeChanged', effectiveVolume);
        
        console.log(`🔇 静音状态切换为: ${this.isMuted ? '静音' : '正常'}`);
        console.log(`🔊 当前有效音效音量: ${Math.round(effectiveVolume * 100)}%`);
        console.log(`🎛️ 当前跟踪 ${this.activeSounds.size} 个音频实例`);
        
        this.saveVolumeSettings();
        return this.isMuted;
    }

    /**
     * 获取当前活跃音频数量
     */
    public getActiveSoundsCount(): number {
        return this.activeSounds.size;
    }

    /**
     * 清理已停止的音频实例
     */
    public cleanupInactiveSounds(): void {
        const toRemove: string[] = [];
        this.activeSounds.forEach((sound, id) => {
            if (!sound.isPlaying) {
                toRemove.push(id);
            }
        });
        
        toRemove.forEach(id => {
            this.activeSounds.delete(id);
        });
        
        if (toRemove.length > 0) {
            console.log(`🧹 清理了 ${toRemove.length} 个已停止的音频实例`);
        }
    }

    /**
     * 主动恢复AudioContext (在用户交互时调用)
     */
    public async resumeAudioContext(scene: Phaser.Scene): Promise<boolean> {
        try {
            if ((scene.sound as any).context) {
                const audioContext = (scene.sound as any).context;
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                    this.audioContextResumed = true;
                    console.log('🎵 用户交互后AudioContext已恢复');
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.warn('⚠️ 恢复AudioContext失败:', error);
            return false;
        }
    }

    /**
     * 检查AudioContext状态
     */
    public isAudioContextActive(scene: Phaser.Scene): boolean {
        if ((scene.sound as any).context) {
            const audioContext = (scene.sound as any).context;
            return audioContext.state === 'running';
        }
        return false;
    }
} 