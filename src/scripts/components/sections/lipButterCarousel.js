export default async (Alpine) => {
    Alpine.data('lipButterCarousel', (activeSlide) => ({
        slider: null,
        data: null,

        async initSlider(loop = false) {
            const { default: Swiper } = await import('swiper');

            this.slider = new Swiper(this.$refs.slider, {
                loop,
                speed: 300,
                initialSlide: activeSlide,
                slidesPerView: 2.05,
                centeredSlides: true,
                slideToClickedSlide: true,
                breakpoints: {
                    1280: {
                        slidesPerView: 5
                    }
                }
            });

            this.slider.on('slideChange', (swiper) => {
                if (!swiper) {
                    return;
                }

                const activeSlide = swiper.slides[swiper.activeIndex];
                if (!activeSlide) {
                    return;
                }

                const dataEl = activeSlide.querySelector('[data-lbb-product-settings]');
                if (!dataEl?.innerHTML) {
                    return;
                }

                try {
                    this.data = JSON.parse(dataEl.innerHTML);
                } catch (error) {
                    console.log(`Error parsing LBB product settings: ${ error }`);
                }
            });
        }
    }));
};
