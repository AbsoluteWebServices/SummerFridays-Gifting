import { setArrowsPosition } from '@/scripts/utils/helpers';

export default async (Alpine) => {
    Alpine.data('shadeCarousel', (sectionId) => ({
        slider: null,
        sliderName: '',
        toggle: false,
        activeSlider: 1,
        dropdownOpen: false,

        init() {
            window.addEventListener('resize', () => {
                const sliderEls = this.$el.querySelectorAll('.swiper');
                if (!sliderEls?.length) {
                    return;
                }

                sliderEls.forEach((sliderEl) => {
                    setArrowsPosition(sliderEl, '[data-swiper-next], [data-swiper-prev]', '.shade-carousel__image');
                });
            });
        },

        async initSlider(sliderEl, sliderName) {
            if (!sliderEl) {
                return;
            }

            this.sliderName = sliderName;

            const { default: Swiper } = await import('swiper');
            const { Navigation, FreeMode } = await import('swiper/modules');

            const nextEl = '[data-swiper-next]';
            const prevEl = '[data-swiper-prev]';

            const numberOfSlides = sliderEl.querySelectorAll('.swiper-slide')?.length;

            this.slider = new Swiper(sliderEl, {
                slidesPerView: 1.35,
                spaceBetween: 18,
                modules: [Navigation, FreeMode],
                freeMode: true, 
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
                        slidesPerView: (numberOfSlides || 5) < 5 ? 4 : 4.2,
                    },
                    1536: {
                        slidesPerView: (numberOfSlides || 5) < 5 ? 4 : 5.2,
                    }
                }
            });

            setArrowsPosition(sliderEl, '[data-swiper-next], [data-swiper-prev]', '.shade-carousel__image');
        }
    }));
};
