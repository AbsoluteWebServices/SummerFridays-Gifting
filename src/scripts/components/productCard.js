import Alpine from 'alpinejs';

Alpine.data('productCard', (variant_id, priceModifier = 1, selling_plans = []) => ({
    initialized: false,
    variantId: null,
    priceModifier: priceModifier,
    selling_plan_id: 0,
    selling_plan: selling_plans[0] || null,
    selling_plans: selling_plans,
    data: null,
    previousWindowWidth: window.innerWidth,

    init() {
        this.variantId = variant_id;

        this.setLandscapeMediaContainerHeight();
        window.addEventListener('resize', () => {
            if (this.previousWindowWidth === window.innerWidth) {
                return;
            }

            this.setLandscapeMediaContainerHeight();
            this.previousWindowWidth = window.innerWidth;
        });

        this.updateSellingPlan();
    },

    setLandscapeMediaContainerHeight() {
        const el = this.$refs.productCardMediaContainer;
        if (!el) {
            return;
        }

        const height = el.clientHeight;
        if (!height) {
            return;
        }

        document.body.style.setProperty('--product-card-landscape-max-height', `${ height }px`);
    },

    updateSellingPlan(id = 0) {
        this.selling_plan = (this.selling_plans || []).find((sp) => sp.id === id) || (this.selling_plans || [])[0];
        this.priceModifier = this.selling_plan?.priceModifier ? this.selling_plan.priceModifier : 1;
        this.selling_plan_id = this.selling_plan?.id || 0;
    },

    updateSellingPlans(selling_plans = []) {
        this.selling_plans = selling_plans || [];
        
        const updateRequired = !Boolean(this.selling_plans.find((sp) => sp.id === this.selling_plan?.id)?.id);
        if (updateRequired) {
            this.updateSellingPlan();
        }
    },

    updateProductCard(data) {
        this.data = data;

        this.updateMainMedia();
        this.updateHoverMedia();
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
        const current_type = el.querySelector('picture') ? 'image' : null;

        if (type === 'image' && type === current_type) {
            this.updateExistingMainImage(el, main_media);
            return;
        }

        const mediaHTML = this.mediaHTML(main_media);
        if (!mediaHTML) {
            return;
        }

        el.innerHTML = mediaHTML;
    },

    updateExistingMainImage(el, media) {
        const {image_url = null} = media;
        if (!image_url) {
            return;
        }

        const sourceDesktopEl = el.querySelector('[data-source-desktop]');
        if (sourceDesktopEl) {
            sourceDesktopEl.srcset = `${ image_url }&width=1000`;
        }

        const sourceTabletEl = el.querySelector('[data-source-tablet]');
        if (sourceTabletEl) {
            sourceTabletEl.srcset = `${ image_url }&width=658`;
        }

        const sourceMobileEl = el.querySelector('[data-source-mobile]');
        if (sourceMobileEl) {
            sourceMobileEl.srcset = `${ image_url }&width=568`;
        }

        const img = el.querySelector('img');
        if (img) {
            img.src = `${ image_url }&width=${ window.innerWidth >= 1024 ? '1000' : window.innerWidth >= 576 ? '658' : '568' }`
        }
    },

    updateHoverMedia() {
        if (!this.data) {
            return;
        }

        const {hover_media = null} = this.data;
        if (!hover_media) {
            return;
        }

        const el = this.$refs.hoverMedia;
        if (!el) {
            return;
        }

        const mediaHTML = this.mediaHTML(hover_media);
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
                <picture>
                    <source srcset="${ image_url }&width=1000" media="(min-width: 1024px)">
                    <source srcset="${ image_url }&width=658" media="(min-width: 576px)">
                    <source srcset="${ image_url }&width=568">
                    
                    <img
                        class="absolute-img"
                        src="${ image_url }&width=568"
                        height="300"
                        width="300"
                        alt="${ media.alt || 'Image' }"
                    >
                </picture>
            `;
        }

        return null;
    }
}));