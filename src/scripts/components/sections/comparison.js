export default async (Alpine) => {
    Alpine.data('comparison', (width) => ({
        comparing: false,
        leftX: 0,
        rightX: 0,
        width: 0,
        imageWidth: 0,
        previousWindowWidth: 0,
        
        init() {
            const thumb = this.$refs.thumb;
            if (!thumb) {
                return;
            }

            this.previousWindowWidth = window.innerWidth;

            this.$nextTick(() => {
                this.imageWidth = this.$el.getBoundingClientRect().width;
                this.width = this.imageWidth * (width / 100);
            });

            thumb.addEventListener('mousedown', this.startComparing.bind(this));
            thumb.addEventListener('touchstart', this.startComparing.bind(this));

            document.addEventListener('mouseup', this.endComparing.bind(this));
            document.addEventListener('touchend', this.endComparing.bind(this));
            document.addEventListener('touchcancel', this.endComparing.bind(this));

            document.addEventListener('mousemove', this.compare.bind(this));
            document.addEventListener('touchmove', this.compare.bind(this));

            window.addEventListener('resize', this.onResize.bind(this));
        },

        onResize() {
            if (this.previousWindowWidth === window.innerWidth) {
                return;
            }
            
            this.previousWindowWidth = window.innerWidth;
            this.imageWidth = this.$el.getBoundingClientRect().width;
            this.width = this.imageWidth * (width / 100);
            this.endComparing();
        },

        startComparing() {
            if (this.comparing) {
                return;
            }

            const rect = this.$el.getBoundingClientRect();
            this.leftX = rect.left;
            this.rightX = this.leftX + rect.width;

            this.comparing = true;
        },

        endComparing() {
            if (!this.comparing) {
                return;
            }

            this.comparing = false;
        },

        compare(event) {
            if (!this.comparing) {
                return;
            }

            const position_x = event?.changedTouches ? event?.changedTouches[0]?.clientX : event?.clientX;

            if (position_x <= this.leftX) {
                this.width = 0;
                return;
            }

            if (position_x >= this.rightX) {
                this.width = this.imageWidth;
                return;
            }

            this.width = position_x - this.leftX;
        }
    }));
};