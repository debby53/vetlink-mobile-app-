/**
 * Ringtone Manager
 * Handles playing ringtones for incoming and outgoing calls
 * Respects browser autoplay policies by requiring user interaction
 */

export type RingtoneType = 'incoming' | 'outgoing';

export class RingtoneManager {
    // Static instances to persist across CallManager/RingtoneManager instantiations
    private static incomingAudio: HTMLAudioElement | null = null;
    private static outgoingAudio: HTMLAudioElement | null = null;
    private static isUnlocked: boolean = false;

    private currentlyPlaying: HTMLAudioElement | null = null;

    constructor() {
        this.initializeAudioElements();
    }

    /**
     * Initialize audio elements with ringtone sources
     * Uses Singleton pattern for audio elements to preserve "unlocked" state
     */
    private initializeAudioElements(): void {
        try {
            if (!RingtoneManager.incomingAudio) {
                RingtoneManager.incomingAudio = new Audio('/sounds/incoming.wav?v=' + Date.now());
                RingtoneManager.incomingAudio.loop = true;
                RingtoneManager.incomingAudio.volume = 0.7;
            }

            if (!RingtoneManager.outgoingAudio) {
                RingtoneManager.outgoingAudio = new Audio('/sounds/outgoing.wav?v=' + Date.now());
                RingtoneManager.outgoingAudio.loop = true;
                RingtoneManager.outgoingAudio.volume = 0.6;
            }

            console.log('🔔 Ringtone Manager initialized');
        } catch (error) {
            console.error('❌ Error initializing ringtone manager:', error);
        }
    }

    /**
     * Unlock audio playback (call this globally on first user interaction)
     */
    static async unlockAudio(): Promise<void> {
        if (this.isUnlocked) return;

        try {
            // Initialize if not already (in case called before any instance is made)
            if (!this.incomingAudio) {
                this.incomingAudio = new Audio('/sounds/incoming.wav?v=' + Date.now());
                this.incomingAudio.loop = true;
            }
            if (!this.outgoingAudio) {
                this.outgoingAudio = new Audio('/sounds/outgoing.wav?v=' + Date.now());
                this.outgoingAudio.loop = true;
            }

            const unlock = async (audio: HTMLAudioElement) => {
                const originalVolume = audio.volume;
                audio.volume = 0;
                try {
                    await audio.play();
                    audio.pause();
                    audio.currentTime = 0;
                } catch (e) {
                    console.warn('Silent unlock failed:', e);
                } finally {
                    audio.volume = originalVolume;
                }
            };

            await Promise.all([
                unlock(this.incomingAudio),
                unlock(this.outgoingAudio)
            ]);

            this.isUnlocked = true;
            console.log('🔓 Audio context unlocked globally');
        } catch (error) {
            console.warn('⚠️ Could not unlock audio:', error);
        }
    }

    /**
     * Legacy method for compatibility
     */
    async prepareAudio(): Promise<void> {
        // Just leverage the static unlock
        await RingtoneManager.unlockAudio();
    }

    /**
     * Play a ringtone
     * @param type - Type of ringtone to play ('incoming' or 'outgoing')
     */
    async play(type: RingtoneType): Promise<void> {
        try {
            // Stop any currently playing ringtone
            this.stop();

            const audio = type === 'incoming' ? RingtoneManager.incomingAudio : RingtoneManager.outgoingAudio;

            if (!audio) {
                console.warn('⚠️ Audio element not available');
                return;
            }

            // Reset to beginning
            audio.currentTime = 0;

            // Attempt to play
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                await playPromise;
                this.currentlyPlaying = audio;
                console.log(`🔔 Playing ${type} ringtone`);
            }
        } catch (error) {
            // Handle autoplay restrictions
            if (error instanceof Error && error.name === 'NotAllowedError') {
                console.warn('⚠️ Autoplay blocked by browser. User interaction required.');
            } else {
                console.error('❌ Error playing ringtone:', error);
            }
        }
    }

    /**
     * Stop the currently playing ringtone
     */
    stop(): void {
        try {
            if (this.currentlyPlaying) {
                this.currentlyPlaying.pause();
                this.currentlyPlaying.currentTime = 0;
                console.log('🔕 Ringtone stopped');
                this.currentlyPlaying = null;
            }

            // Ensure static instances are also stopped/reset
            if (RingtoneManager.incomingAudio) {
                RingtoneManager.incomingAudio.pause();
                RingtoneManager.incomingAudio.currentTime = 0;
            }
            if (RingtoneManager.outgoingAudio) {
                RingtoneManager.outgoingAudio.pause();
                RingtoneManager.outgoingAudio.currentTime = 0;
            }
        } catch (error) {
            console.error('❌ Error stopping ringtone:', error);
        }
    }

    /**
     * Check if a ringtone is currently playing
     */
    isPlaying(): boolean {
        return this.currentlyPlaying !== null && !this.currentlyPlaying.paused;
    }

    /**
     * Set volume for ringtones (0.0 to 1.0)
     */
    setVolume(volume: number): void {
        const clampedVolume = Math.max(0, Math.min(1, volume));

        if (RingtoneManager.incomingAudio) {
            RingtoneManager.incomingAudio.volume = clampedVolume;
        }
        if (RingtoneManager.outgoingAudio) {
            RingtoneManager.outgoingAudio.volume = clampedVolume;
        }
    }

    /**
     * Cleanup resources
     */
    destroy(): void {
        this.stop();
        // We do NOT destroy the static audio elements here, 
        // as they should persist for the session to maintain "unlocked" state.
        console.log('🔕 Ringtone Manager instance destroyed');
    }
}
