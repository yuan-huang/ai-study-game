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
    
    // 本地存储键名
    private static readonly STORAGE_KEYS = {
        MASTER_VOLUME: 'gameAudio_masterVolume',
        MUSIC_VOLUME: 'gameAudio_musicVolume',
        SOUND_VOLUME: 'gameAudio_soundVolume',
        IS_MUTED: 'gameAudio_isMuted'
    };

    private constructor() {
        this.loadVolumeSettings();
    }

    public static getInstance(): AudioManager {
        if (!AudioManager.instance) {
            AudioManager.instance = new AudioManager();
        }
        return AudioManager.instance;
    }

    /**
     * 从localStorage加载音量设置
     */
    private loadVolumeSettings(): void {
        try {
            const masterVol = localStorage.getItem(AudioManager.STORAGE_KEYS.MASTER_VOLUME);
            const musicVol = localStorage.getItem(AudioManager.STORAGE_KEYS.MUSIC_VOLUME);
            const soundVol = localStorage.getItem(AudioManager.STORAGE_KEYS.SOUND_VOLUME);
            const muted = localStorage.getItem(AudioManager.STORAGE_KEYS.IS_MUTED);

            if (masterVol !== null) this.masterVolume = parseFloat(masterVol);
            if (musicVol !== null) this.musicVolume = parseFloat(musicVol);
            if (soundVol !== null) this.soundVolume = parseFloat(soundVol);
            if (muted !== null) this.isMuted = muted === 'true';

            console.log('🔊 音量设置已加载:', {
                master: this.masterVolume,
                music: this.musicVolume,
                sound: this.soundVolume,
                muted: this.isMuted
            });
        } catch (error) {
            console.warn('⚠️ 加载音量设置失败，使用默认值:', error);
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
        return this.isMuted ? 0 : this.masterVolume * this.musicVolume;
    }

    /**
     * 获取计算后的音效音量（考虑主音量和静音状态）
     */
    public getEffectiveSoundVolume(): number {
        return this.isMuted ? 0 : this.masterVolume * this.soundVolume;
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
     * 播放音乐（自动应用音量设置）
     */
    public playMusic(scene: Phaser.Scene, key: string, config?: Phaser.Types.Sound.SoundConfig): boolean {
        try {
            const finalConfig = {
                ...config,
                volume: this.getEffectiveMusicVolume()
            };
            scene.sound.play(key, finalConfig);
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
            const finalConfig = {
                ...config,
                volume: this.getEffectiveSoundVolume()
            };
            scene.sound.play(key, finalConfig);
            return true;
        } catch (error) {
            console.error('播放音效失败:', error);
            return false;
        }
    }

    /**
     * 更新所有正在播放的音频音量
     */
    public updateAllAudioVolume(scene: Phaser.Scene): void {
        try {
            // 对于WebAudioSoundManager，我们可以访问sounds数组
            const soundManager = scene.sound as any;
            if (soundManager.sounds && Array.isArray(soundManager.sounds)) {
                soundManager.sounds.forEach((sound: any) => {
                    if (sound.key && sound.isPlaying) {
                        // 根据音频类型判断是音乐还是音效
                        if (this.isMusicKey(sound.key)) {
                            sound.setVolume(this.getEffectiveMusicVolume());
                        } else {
                            sound.setVolume(this.getEffectiveSoundVolume());
                        }
                    }
                });
            }
        } catch (error) {
            console.warn('更新音频音量失败:', error);
        }
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
        this.saveVolumeSettings();
        return this.isMuted;
    }
} 