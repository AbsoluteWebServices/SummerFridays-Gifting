import { setArrowsPosition } from '@/scripts/utils/helpers';

export default async (Alpine) => {
    Alpine.data('featuredProducts', () => ({
        slider: null,

        init() {
            window.addEventListener('resize', () => {
                const sliderEl = this.$refs.slider;
                if (!sliderEl) {
                    return;
                }

                setArrowsPosition(sliderEl, '[data-swiper-next], [data-swiper-prev]', '.featured-products__media');
            });
        },

        async initSlider() { 
            const sliderEl = this.$refs.slider;
            if (!sliderEl) {
                return;
            }

            const { default: Swiper } = await import('swiper');
            const { Navigation } = await import('swiper/modules');

            const nextEl = sliderEl.querySelector('[data-swiper-next]');
            const prevEl = sliderEl.querySelector('[data-swiper-prev]');

            this.slider = new Swiper(sliderEl, {
                loop: true,
                slidesPerView: 1.2,
                spaceBetween: 18,
                modules: [Navigation],
                centeredSlides: true,
                maxBackfaceHiddenSlides: 1,
                ...(nextEl && prevEl ? {
                    navigation: {
                        nextEl,
                        prevEl
                    },
                } : {}),
                breakpoints: {
                    640: {
                        slidesPerView: 1.95,
                    },
                    1024: {
                        slidesPerView: 3.33,
                    },
                    1280: {
                        slidesPerView: 4.33,
                    },
                    1700: {
                        slidesPerView: 5.33,
                    },
                }
            }); 

            setArrowsPosition(sliderEl, '[data-swiper-next], [data-swiper-prev]', '.featured-products__media');
        },
    }));
};
