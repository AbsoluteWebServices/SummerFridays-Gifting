import { setArrowsPosition } from '@/scripts/utils/helpers';

export default async (Alpine) => {
    Alpine.data('search', () => ({
        slider: null,
        sliderYMAL: null,

        init() {
            window.addEventListener('resize', () => {
                const sliderEl = this.$refs.slider;
                const sliderElYMAL = this.$refs.sliderYMAL;
                if (sliderEl) {
                    setArrowsPosition(sliderEl, '[data-swiper-next], [data-swiper-prev]', '.predictive-search__cms-image');
                }

                if (sliderElYMAL) {
                    setArrowsPosition(sliderElYMAL);
                }
            });
        },

        async initSliderYMAL() {
            const sliderEl = this.$refs.sliderYMAL;
            if (!sliderEl) {
                return;
            }

            const { default: Swiper } = await import('swiper');
            const {Navigation } = await import('swiper/modules');

            const nextEl = sliderEl.querySelector('[data-swiper-next]');
            const prevEl = sliderEl.querySelector('[data-swiper-prev]');

            this.sliderYMAL = new Swiper(sliderEl, { 
                slidesPerView: 1.35,
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
                        slidesPerView: 2.35,
                    },
                    1024: {
                        slidesPerView: 3.35,
                    },
                    1280: {
                        slidesPerView: 4.2,
                    },
                    1700: {
                        slidesPerView: 5.2,
                    }
                }
            });

            setArrowsPosition(sliderEl);
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
                        slidesPerView: 2.35,
                    },
                    1024: {
                        slidesPerView: 3.35,
                    },
                    1280: {
                        slidesPerView: 4.2,
                    },
                    1700: {
                        slidesPerView: 5.2,
                    }
                }
            });

            setArrowsPosition(sliderEl, '[data-swiper-next], [data-swiper-prev]', '.predictive-search__cms-image');
        },
    }));
};
