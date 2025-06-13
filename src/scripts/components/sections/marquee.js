export default async (Alpine) => {
    Alpine.data('marquee', () => ({
        isScrollingHover: true,
        isScrolling: true,

        init() {
            document.addEventListener('mouseover', (event) => {
                this.isScrollingHover = !Boolean(event?.target.closest('[data-autoplay-pause]'));
            });
        },

        toggleScroll() {
            this.isScrolling = !this.isScrolling;
        },
    }));
};
