export default async (Alpine) => {
    Alpine.data('sustainabilityReports', () => ({
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
                slidesPerView: 1.15,
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
                } : {}),
                breakpoints: {
                    576: {
                        slidesPerView: 1.35,
                    },
                    768: {
                        slidesPerView: 2.1,
                    },
                    1024: {
                        slidesPerView: 2.35,
                    },
                    1280: {
                        slidesPerView: 1.1,
                    },
                    1440: {
                        slidesPerView: 1.66,
                    }
                }
            });
        },
    }));
};
