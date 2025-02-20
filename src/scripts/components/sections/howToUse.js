export default async (Alpine) => {
    Alpine.data('howToUse', () => ({
        slider: null,

        async initSlider() {
            const sliderEl = this.$refs.slider;
            if (!sliderEl) {
                return;
            }

            const { default: Swiper } = await import('swiper');
            const { Navigation } = await import('swiper/modules');

            const nextEl = '[data-swiper-next]';
            const prevEl = '[data-swiper-prev]';
 
            this.slider = new Swiper(sliderEl, {
                loop: true,
                spaceBetween: 18,
                modules: [Navigation],
                draggable: true,
                allowTouchMove: true,
                maxBackfaceHiddenSlides: 1,
                ...(nextEl && prevEl ? {
                    navigation: {
                        nextEl,
                        prevEl
                    },
                } : {})
            });
        },
    }));
};