import { setArrowsPosition } from '@/scripts/utils/helpers';

export default async (Alpine) => {
    Alpine.data('pairsWellWith', (fetch_required = false, pid = null, limit = 8) => ({
        slider: null,
        fetch_required,
        pid,
        limit,
        container: null,
        fetched: false,

        init() {
            this.container = this.$el;

            window.addEventListener('resize', () => {
                const sliderEl = this.$refs.slider;
                if (!sliderEl) {
                    return;
                }

                setArrowsPosition(sliderEl);
            });
        },

        async fetchRecs() {
            const {pid, container} = this;
            if (!pid || !container) {
                return;
            }
            
            const {limit = 8} = this;

            const el = container.querySelector('.swiper-wrapper.swiper-wrapper--main');
            if (!el) {
                return;
            }

            const placeholderEl = container.querySelector('.swiper-wrapper--placeholder');

            try {
                const text = await fetch(`${ window.Shopify.routes.root }recommendations/products?product_id=${pid}&limit=${limit}&section_id=recommendations&intent=related`).then((res) => res.text());

                if (!text) {
                    return;
                }

                const html = document.createElement('div');
                html.innerHTML = text;
                const recsEl = html.querySelector('.swiper-wrapper.swiper-wrapper--main');
                if (!recsEl?.innerHTML) {
                    return;
                }

                el.innerHTML = recsEl.innerHTML;

                this.fetched = true;
                if (placeholderEl) {
                    placeholderEl.remove();
                }
            } catch (error) {
                console.error(error);
            }
        },

        async initSlider() {
            if (this.fetch_required) {
                if (!this.pid) {
                    return;
                }

                await this.fetchRecs();
            }

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

            setArrowsPosition(sliderEl);
        },
    }));
};
