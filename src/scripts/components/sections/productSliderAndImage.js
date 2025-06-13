import { setArrowsPosition } from '@/scripts/utils/helpers';

export default async (Alpine) => {
    Alpine.data('productSliderAndImage', () => ({
        slider: null,

        async initSlider() {
            const container = this.$refs.slider;
            if (!container) {
                return;
            }

            const sliderEl = container.querySelector('.swiper');
            if (!sliderEl) {
                return;
            }

            const { default: Swiper } = await import('swiper');
            const { FreeMode, Navigation } = await import('swiper/modules');

            const numberOfSlides = sliderEl.querySelectorAll('.swiper-slide')?.length || 0;

            const nextEl = container.querySelector('[data-swiper-next]');
            const prevEl = container.querySelector('[data-swiper-prev]');

            this.slider = new Swiper(sliderEl, {
                slidesPerView: 1.5,
                spaceBetween: 18,
                modules: [FreeMode, Navigation],
                ...(nextEl && prevEl ? {
                    navigation: {
                        nextEl,
                        prevEl
                    },
                } : {}),
                freeMode: true,
                draggable: true,
                allowTouchMove: true,
                maxBackfaceHiddenSlides: 1,
                breakpoints: {
                    1280: {
                        slidesPerView: numberOfSlides < 3 ? 2 : 2.15,
                    }
                }
            });

            setArrowsPosition(container);
        },
    }));
};
