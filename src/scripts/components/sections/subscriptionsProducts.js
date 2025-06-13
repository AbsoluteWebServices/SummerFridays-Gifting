import { setArrowsPosition } from '@/scripts/utils/helpers';

export default async (Alpine) => {
    Alpine.data('subscriptionsProducts', () => ({
        slider: null,

        init() {
            window.addEventListener('resize', () => {
                const sliderEl = this.$refs.slider;

                if (!sliderEl) {
                    return;
                }

                setArrowsPosition(sliderEl);
            });
        },

        async initSlider() {
            const sliderEl = this.$refs.slider;

            if (!sliderEl) {
                return;
            }

            const { default: Swiper } = await import('swiper');
            const {Navigation } = await import('swiper/modules');

            const nextEl = sliderEl.querySelector('[data-swiper-next]');
            const prevEl = sliderEl.querySelector('[data-swiper-prev]');

            this.slider = new Swiper(sliderEl, { 
                slidesPerView: 1.35,
                spaceBetween: 20,
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
                        slidesPerView: 2.35,
                    },
                    1024: {
                        slidesPerView: 3,
                    }
                }
            });

            setTimeout(() => setArrowsPosition(sliderEl), 50);
        }
    }));
};
