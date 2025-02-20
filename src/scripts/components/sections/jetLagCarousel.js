export default async (Alpine) => {
    Alpine.data('jetLagCarousel', activeSlide => ({
        slider: null,

        async initSlider() {
            const { default: Swiper } = await import('swiper');

            this.slider = new Swiper(this.$refs.slider, {
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
        }
    }));
};
