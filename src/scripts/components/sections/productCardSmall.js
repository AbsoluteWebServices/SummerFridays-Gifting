export default async (Alpine) => {
    Alpine.data('productCardSmall', (variant_id, priceModifier = 1, selling_plans = []) => ({
        initialized: false,
        variantId: null,
        priceModifier: priceModifier,
        selling_plan: selling_plans[0] || null,
        selling_plans: selling_plans,
        data: null,
        swatchesSlider: null,

        init() {
            this.variantId = variant_id;
        },

        async initSwatchesSlider() {
            const sliderEl = this.$refs.swatchesSlider;
            if (!sliderEl) {
                return;
            }

            const { default: Swiper } = await import('swiper');

            this.slider = new Swiper(sliderEl, {
                slidesPerView: 5.75,
                spaceBetween: 14,
                maxBackfaceHiddenSlides: 1,
                noSwipingClass: 'swiper-no-swiping--nested',
                nested: true
            });
        },

        updateProductCard(data) {
            this.data = data;

            this.updateMainMedia();
        },

        updateMainMedia() {
            if (!this.data) {
                return;
            }

            const {main_media = null} = this.data;
            if (!main_media) {
                return;
            }

            const el = this.$refs.mainMedia;
            if (!el) {
                return;
            }

            const {type} = main_media;
            const img = el.querySelector('img');
            const current_type = img ? 'image' : null;

            if (type === 'image' && type === current_type) {
                const {image_url = null} = main_media;
                if (!image_url) {
                    return;
                }

                img.src = `${ image_url }&width=200`;
                return;
            }

            const mediaHTML = this.mediaHTML(main_media);
            if (!mediaHTML) {
                return;
            }

            el.innerHTML = mediaHTML;
        },

        mediaHTML(media) {
            if (!media) {
                return null;
            }

            const {type = null} = media;
            if (!type) {
                return null;
            }

            if (type === 'video') {
                const {video_url = null} = media;
                if (!video_url) {
                    return null;
                }

                return `
                    <video
                        class="absolute-img"
                        autoplay
                        playsinline 
                        muted 
                        loop
                        <source src="${ video_url }" type="video/mp4">
                    >
                `;
            }

            if (type === 'image') {
                const {image_url = null} = media;
                if (!image_url) {
                    return null;
                }

                return `
                    <img
                        class="absolute-img"
                        src="${ image_url }&width=200"
                        height="100"
                        width="100"
                        alt="${ media.alt || 'Image' }"
                    >
                `;
            }

            return null;
        }
    }));
};