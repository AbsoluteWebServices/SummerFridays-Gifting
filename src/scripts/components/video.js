import Alpine from 'alpinejs';

Alpine.data('video', () => ({
    initialized: false,
    isVideoPlaying: false,
    isVideoMuted: true,

    initVideo() {
        if (this.initialized) {
            return;
        }

        const sources = this.$refs['video'].querySelectorAll('source');
        if (!sources?.length) {
            return;
        }

        sources.forEach((source) => {
            const src = source.dataset.src;
            if (!src) {
                return;
            }

            source.src = src;

            source.removeAttribute('data-src');
        });

        this.$refs['video'].load();

        this.initialized = true;
        this.isVideoPlaying = this.$refs['video'].hasAttribute('autoplay');
    },

    playVideo() {
        if (!this.initialized) {
            return;
        }

        this.$refs['video'].play();
        this.isVideoPlaying = true;
    },
 
    pauseVideo() {
        if (!this.initialized) {
            return;
        }

        this.$refs['video'].pause();
        this.isVideoPlaying = false;
    },

    playVideoSound() {
        if (!this.initialized) {
            return;
        }

        this.$refs['video'].muted = false;
        this.isVideoMuted = false;
    },

    pauseVideoSound() {
        if (!this.initialized) {
            return;
        }

        this.$refs['video'].muted = true;
        this.isVideoMuted = true;
    },

    playVideoToggle() {
        if (!this.initialized) {
            return;
        }

        if (this.isVideoPlaying) {
            this.pauseVideo();
            return;
        }

        this.playVideo();
    },

    playVideoSoundToggle() {
        if (!this.initialized) {
            return;
        }
        
        if (this.isVideoMuted) {
            this.playVideoSound();
            return;
        }

        this.pauseVideoSound();
    }
}));
