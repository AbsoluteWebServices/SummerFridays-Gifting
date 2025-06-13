import { loadKlaviyo } from '@/scripts/components/klaviyo';

const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Component})/u;
const emojiErrorMessage = 'Emojis are not supported.';

export default async (Alpine) => {
    Alpine.data('product', (handle) => ({
        handle,
        product: null,
        variant: null,
        variantId: null,
        sellingPlan: null,
        sellingPlanId: null,
        purchaseType: 'onetime',
        slider: null,
        thumbSlider: null,
        sliderActiveIndex: 0,
        totalMediaCount: 0,
        quantity: 1,
        showStickyATCBar: false,
        popup: '',
        validationError: '',
        
        async init() {
            if (!handle) {
                return;
            }

            this.$watch('quantity', () => {
                this.updateQty();
            });

            this.$watch('showStickyATCBar', () => {
                if (this.showStickyATCBar) {
                    document.body.classList.add('sticky-atc-bar-active');
                    this.updateUserwayWidgetButton(8);
                } else {
                    document.body.classList.remove('sticky-atc-bar-active');
                    this.updateUserwayWidgetButton(2);
                }
            });

            this.initStickyATCBar();

            document.addEventListener('cart:updated', this.updateQty.bind(this));

            this.setVariantId();

            await this.initProduct(handle);

            if (!this.product) {
                return;
            }

            this.$watch('purchaseType', (value) => {
                this.onPurchaseTypeChange(value);
            });

            this.setVariant(this.product.variant_default_id);
            
            this.$watch('variant', (value) => {
                this.onVariantChange(value);
            });

            this.setDefaultSellingPlan();
            this.purchaseType = 'onetime';

            this.registerPopupListeners();

            this.initKlaviyo();
        },

        async initKlaviyo() {
            await loadKlaviyo();

            window.klaviyo = window.klaviyo || [];
            window.klaviyo.init({
                account: Alpine.store('Global')?.settings?.klaviyo_company_id,
                list: "Xcp8cA",
                platform: "shopify"
            });

            const {product} = this;
            if (!product) {
                return;
            }

            const variant = this.variant || (this.product.variants || []).find(item => item.id === product.variant_default_id);
            if (!variant) {
                return;
            }

            window.item = {
                Name: product.title,
                ProductID: product.id,
                Categories: product.collections,
                Brand: product.vendor,
                Price: window.Shopify.formatMoney(variant.price),
                CompareAtPrice: window.Shopify.formatMoney(variant.compare_at_price || 0),
                ImageURL: product.image_url,
                URL: product.url
            };

            window._learnq = window._learnq || [];
            window._learnq.push(['track', 'Viewed Product', window.item]);
            window._learnq.push(['trackviewedItem', {
                Title: window.item.Name,
                ItemId: window.item.ProductID,
                Categories: window.item.Categories,
                ImageUrl: window.item.ImageURL,
                Url: window.item.URL,
                Metadata: {
                    Brand : window.item.Brand,
                    Price: window.item.Price,
                    CompareAtPrice: window.item.CompareAtPrice
                }
            }]);

            document.addEventListener('cart:added', () => {
                const {cart} = Alpine.store('Cart') || {};
                if (!cart) {
                    return;
                }

                let c = {
                    total_price: (cart.total_price / 100),
                    $value: (cart.total_price / 100),
                    total_discount: cart.total_discount,
                    original_total_price: cart.original_total_price,
                    items: cart.items
                };

                if (window.item) {
                    window.item.Price = (variant.price / 100),
                    c = Object.assign(c, window.item)
                }

                _learnq.push(['track', 'Added to Cart', c])
            });
        },

        validateInputs() {
            const {giftName, giftEmail, giftMessage} = this.$refs;
            if ([
                emojiRegex.test((giftName.value || '')),
                emojiRegex.test((giftEmail.value || '')),
                emojiRegex.test((giftMessage.value || '')),
            ].includes(true)) {
                this.validationError = emojiErrorMessage;
                return;
            }

            this.validationError = '';
            return;
        },

        updateUserwayWidgetButton(bottom = 2) {
            const userwayWidgetBtn = document.querySelector('.uwy.userway_p5 .userway_buttons_wrapper');
            if (!userwayWidgetBtn) {
                return;
            }

            userwayWidgetBtn.style.bottom = `${bottom}rem`;
        },

        async initProduct(handle) {
            try {
                const searchParams = new URLSearchParams();
                searchParams.set('view', 'object');
                if (this.variantId) {
                    searchParams.set('variant', this.variantId);
                }
                const product = await fetch(`/products/${ handle }?${ searchParams.toString() }`).then((res) => res.json());
                this.product = product;
            } catch (error) {
                console.error(`Error fetching a product: ${ error }`);
            }
        },

        initStickyATCBar() {
            const el = document.getElementById(`stickyATCBar`);
            if (!el) {
                return;
            }

            const showStickyBar = (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.showStickyATCBar = false;
                    } else {
                        this.showStickyATCBar = (window.innerWidth < 1280) ? true : false;
                    }
                });
            };

            const setupObserver = () => {
                const headerHeight = document.getElementById('shopify-section-header')?.offsetHeight || 0;
                const rootMargin = `-${headerHeight}px`;
            
                const observer = new IntersectionObserver(showStickyBar, {
                  rootMargin: rootMargin,
                  threshold: 0
                });
            
                observer.observe(el);
            };

            setupObserver();

            window.addEventListener('resize', () => {
                setupObserver();
            });
        },

        registerPopupListeners() {
            document.body.addEventListener('click', async (e) => {
                const button = e.target?.closest('button');
                if (!button) {
                    return;
                }

                const popup = button.dataset.productPopup || null;
                if (!popup) {
                    return;
                }

                e.preventDefault();

                this.popup = popup;

                const id = 'nm-cs';

                const event = new CustomEvent('modal:open', {
                    detail: { id }
                });

                document.dispatchEvent(event);
            });
        },

        price() {
            const variant = this.variant;
            if (!variant) {
                return null;
            }

            const { price } = this.variant;
            if (!price) {
                return null;
            }

            if (this.purchaseType === 'subscription') {
                const { sellingPlan } = this;
                if (!sellingPlan) {
                    return price;
                }

                const { price_modifier } = sellingPlan;
                if (!price_modifier) {
                    return price;
                }

                return price * price_modifier;
            }

            return price;
        },

        updateQty() {
            if (!this.quantity || this.quantity < 1) {
                this.quantity = 1;
                return;
            }

            if (this.quantity > this.maxQty()) {
                this.quantity = (this.maxQty() || 1);
                return;
            }
        },

        optionValueByPosition(position) {
            if (!this.variant) {
                return;
            }

            const { options } = this.variant;
            if (!options?.length) {
                return;
            }

            return options[position || 0];
        },

        setVariantId() {
            const url = new URL(window?.location?.href || "/");
            if (!url) {
                return;
            }

            const variantId = url.searchParams.get('variant');
            if (!variantId) {
                return;
            }

            this.variantId = +variantId;
        },

        setVariant(id) {
            if (!id) {
                return;
            }

            if (!this.product) {
                return;
            }

            const { variants } = this.product;
            if (!variants?.length) {
                return;
            }

            const variant = variants.find((v) => v.id === id);
            if (!variant) {
                return;
            }

            this.variant = variant;
        },

        onVariantChange() {
            this.variantId = this.variant.id;
            this.updateMedia();
            this.updateURL();
            this.updateItem();
        },

        updateItem() {
            if (!window.item) {
                return;
            }

            window.item.Price = window.Shopify.formatMoney(this.variant.price);
            window.item.CompareAtPrice = window.Shopify.formatMoney(this.variant.compare_at_price || 0);
        },

        updateMedia() {
            if (!this.variant?.title) {
                return;
            }

            const {product} = this;
            if (!product) {
                return;
            }

            const {custom_media, media} = product;
            const variantMedia = this.variant.media;

            if (!variantMedia?.length && !media?.length && !custom_media?.length) {
                return;
            }

            const filteredCustomMedia = (custom_media || []).filter((m) => {
                return !m.alt.includes('-exclude-') && [
                    !m.alt,
                    m.alt.includes('-include-'),
                    m.alt === this.variant.title,
                    m.alt === product.title
                ].includes(true)
            });

            const filteredMedia = (media || []).filter((m) => {
                return !m.alt.includes('-exclude-') && [
                    !m.alt,
                    m.alt.includes('-include-'),
                    m.alt === this.variant.title,
                    m.alt === product.title
                ].includes(true)
            });

            this.totalMediaCount = filteredCustomMedia.length + filteredMedia.length;

            this.updateThumbs(variantMedia, filteredCustomMedia, filteredMedia);
            this.updateMainSlider(variantMedia, filteredCustomMedia, filteredMedia);

            if (this.thumbSlider && this.slider) {
                // this.thumbSlider.destroy(true, true);
                // this.slider.destroy(true, true);
                // this.sliderActiveIndex = 0;
                this.initSliders();
            }
        },

        updateThumbs(variant_media, custom_media, media) {
            const el = this.$refs.thumbSlider;
            if (!el) {
                return;
            }

            const container = el.querySelector('.swiper-wrapper');
            if (!container) {
                return;
            }

            if (!variant_media?.length && !media?.length && !custom_media?.length) {
                el.style.display = 'none';
                return;
            }

            let html = '';

            if (variant_media?.length) {
                variant_media.forEach((m) => {
                    html += '<div class="swiper-slide">';
                        if (m.media_type === 'image') {
                            if (m.src) {
                                html += `
                                    <img
                                        src="${ m.src }&width=260"
                                        width="130"
                                        height="130"
                                        class="absolute-img"
                                        alt="${ m.alt || this.product.title }"
                                    >
                                `;
                            }
                        } else if (m.media_type === 'video') {
                            if (m.preview_image) {
                                html += `
                                    <img
                                        src="${ m.preview_image }&width=260"
                                        width="130"
                                        height="130"
                                        class="absolute-img"
                                        alt="${ m.alt || this.product.title }"
                                    >
    
                                    <svg class="icon icon-play-round icon-play-thumbnail" aria-label="Play">
                                        <use xlink:href="#play-round"></use>
                                    </svg>
                                `;
                            } else if (m.src) {
                                html += `
                                    <video
                                        class="absolute-img" 
                                        autoplay
                                        playsinline 
                                        muted 
                                        loop
                                    >
                                        <source src="${ m.src }" type="video/mp4">
                                    </video>
                                `;
                            }
                        }
                    html += '</div>';
                });

                container.innerHTML = html;
                return;
            }

            (custom_media || []).forEach((m) => {
                html += '<div class="swiper-slide">';
                    let bg_src = m.bg_media_type === 'image' ? m.bg_src : m.bg_preview_image;
                    if (bg_src) {
                        html += `
                            <img
                                src="${ bg_src }&width=260"
                                width="130"
                                height="130"
                                class="absolute-img product-custom-media__bg"
                                alt="${ m.alt || this.product.title }"
                            >
                        `;
                    }

                    let main_src = m.main_media_type === 'image' ? m.main_src : m.main_preview_image;
                    if (main_src) {
                        html += `
                            <img
                                src="${ main_src }&width=260"
                                width="130"
                                height="130"
                                class="absolute-img product-custom-media__bg"
                                alt="${ m.alt || this.product.title }"
                            >
                        `;
                    }
                html += '</div>';
            });

            (media || []).forEach((m) => {
                html += '<div class="swiper-slide">';
                    if (m.media_type === 'image') {
                        if (m.src) {
                            html += `
                                <img
                                    src="${ m.src }&width=260"
                                    width="130"
                                    height="130"
                                    class="absolute-img"
                                    alt="${ m.alt || this.product.title }"
                                >
                            `;
                        }
                    } else if (m.media_type === 'video') {
                        if (m.preview_image) {
                            html += `
                                <img
                                    src="${ m.preview_image }&width=260"
                                    width="130"
                                    height="130"
                                    class="absolute-img"
                                    alt="${ m.alt || this.product.title }"
                                >

                                <svg class="icon icon-play-round icon-play-thumbnail" aria-label="Play">
                                    <use xlink:href="#play-round"></use>
                                </svg>
                            `;
                        } else if (m.src) {
                            html += `
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                >
                                    <source src="${ m.src }" type="video/mp4">
                                </video>
                            `;
                        }
                    }
                html += '</div>';
            });

            container.innerHTML = html;
        },

        updateMainSlider(variant_media, custom_media, media) {
            const el = this.$refs.slider;
            if (!el) {
                return;
            }

            const container = el.querySelector('.swiper-wrapper');
            if (!container) {
                return;
            }

            if (!variant_media?.length && !media?.length && !custom_media?.length) {
                el.style.display = 'none';
                return;
            }

            let html = '';

            if (variant_media?.length) {
                variant_media.forEach((m) => {
                    html += '<div class="swiper-slide">';
                        if (m.media_type === 'image') {
                            if (m.src) {
                                html += `
                                    <img
                                        srcset="
                                            ${ m.src }&width=375 375w,
                                            ${ m.src }&width=550 550w,
                                            ${ m.src }&width=750 750w,
                                            ${ m.src }&width=1100 1100w,
                                            ${ m.src }&width=1500 1500w,
                                            ${ m.src }&width=1780 1780w,
                                            ${ m.src }&width=2000 2000w,
                                            ${ m.src } 2000w
                                        "
                                        sizes="100vw"
                                        width="1000"
                                        height="1000"
                                        class="absolute-img"
                                        alt="${ m.alt || this.product.title }"
                                    >
                                `;
                            }
                        } else if (m.media_type === 'video') {
                            if (m.src) {
                                html += `
                                    <video
                                        class="absolute-img" 
                                        autoplay
                                        playsinline 
                                        muted 
                                        loop
                                        poster="${ m.preview_image ? m.preview_image : '' }"
                                    >
                                        <source src="${ m.src }" type="video/mp4">
                                    </video>
                                `;
                            }
                        }
                    html += '</div>';
                });
                
                container.innerHTML = html;
                return;
            }

            (custom_media || []).forEach((m) => {
                html += '<div class="swiper-slide">';
                    if (m.bg_media_type === 'image') {
                        if (m.bg_src) {
                            html += `
                                <img
                                    srcset="
                                        ${ m.bg_src }&width=375 375w,
                                        ${ m.bg_src }&width=550 550w,
                                        ${ m.bg_src }&width=750 750w,
                                        ${ m.bg_src }&width=1100 1100w,
                                        ${ m.bg_src }&width=1500 1500w,
                                        ${ m.bg_src }&width=1780 1780w,
                                        ${ m.bg_src }&width=2000 2000w,
                                        ${ m.bg_src } 2000w
                                    "
                                    sizes="100vw"
                                    width="1000"
                                    height="1000"
                                    class="absolute-img"
                                    alt="${ m.alt || this.product.title }"
                                >
                            `;
                        }
                    } else if (m.bg_media_type === 'video') {
                        if (m.bg_src) {
                            html += `
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                    poster="${ m.bg_preview_image ? m.bg_preview_image : '' }"
                                >
                                    <source src="${ m.bg_src }" type="video/mp4">
                                </video>
                            `;
                        }
                    }

                    if (m.main_media_type === 'image') {
                        if (m.main_src) {
                            html += `
                                <img
                                    srcset="
                                        ${ m.main_src }&width=375 375w,
                                        ${ m.main_src }&width=550 550w,
                                        ${ m.main_src }&width=750 750w,
                                        ${ m.main_src }&width=1100 1100w,
                                        ${ m.main_src }&width=1500 1500w,
                                        ${ m.main_src }&width=1780 1780w,
                                        ${ m.main_src }&width=2000 2000w,
                                        ${ m.main_src } 2000w
                                    "
                                    sizes="100vw"
                                    width="1000"
                                    height="1000"
                                    class="absolute-img"
                                    alt="${ m.alt || this.product.title }"
                                >
                            `;
                        }
                    } else if (m.main_media_type === 'video') {
                        if (m.main_src) {
                            html += `
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                    poster="${ m.main_preview_image ? m.main_preview_image : '' }"
                                >
                                    <source src="${ m.main_src }" type="video/mp4">
                                </video>
                            `;
                        }
                    }
                html += '</div>';
            });

            (media || []).forEach((m) => {
                html += '<div class="swiper-slide">';
                    if (m.media_type === 'image') {
                        if (m.src) {
                            html += `
                                <img
                                    srcset="
                                        ${ m.src }&width=375 375w,
                                        ${ m.src }&width=550 550w,
                                        ${ m.src }&width=750 750w,
                                        ${ m.src }&width=1100 1100w,
                                        ${ m.src }&width=1500 1500w,
                                        ${ m.src }&width=1780 1780w,
                                        ${ m.src }&width=2000 2000w,
                                        ${ m.src } 2000w
                                    "
                                    sizes="100vw"
                                    width="1000"
                                    height="1000"
                                    class="absolute-img"
                                    alt="${ m.alt || this.product.title }"
                                >
                            `;
                        }
                    } else if (m.media_type === 'video') {
                        if (m.src) {
                            html += `
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                    poster="${ m.preview_image ? m.preview_image : '' }"
                                >
                                    <source src="${ m.src }" type="video/mp4">
                                </video>
                            `;
                        }
                    }
                html += '</div>';
            });

            container.innerHTML = html;
        },

        updateURL() {
            const url = new URL(window?.location?.href || "/");
            if (!url) {
                return;
            }

            url?.searchParams?.set('variant', this.variantId);

            window?.history?.replaceState({}, '', url);
        },

        onPurchaseTypeChange(value) {
            if (value === 'subscription') {
                this.setSellingPlanId();
                return;
            }
            
            this.sellingPlanId = null;
        },

        setSellingPlanId() {
            this.sellingPlanId = this.sellingPlan?.id;
        },

        setDefaultSellingPlan() {
            if (this.sellingPlan) {
                return;
            }
            
            const { selling_plans } = this.product;
            if (!selling_plans?.length) {
                return;
            }

            this.sellingPlan = selling_plans[0];
        },

        selectSelectPlan(id) {
            if (!id) {
                return;
            }

            const { selling_plans } = this.product;
            if (!selling_plans?.length) {
                return;
            }

            const selling_plan = selling_plans.find((sp) => sp.id === id);
            if (!selling_plan) {
                return;
            }

            this.sellingPlan = selling_plan;
            this.sellingPlanId = selling_plan.id;
        },

        async initSliders() {
            const sliderEl = this.$refs.slider;
            if (!sliderEl) {
                return;
            }

            const { default: Swiper } = await import('swiper');
            const { Navigation, Thumbs } = await import('swiper/modules');

            const thumbSliderEl = this.$refs.thumbSlider;
            if (thumbSliderEl) {
                this.thumbSlider = new Swiper(thumbSliderEl, {
                    direction: 'vertical',
                    slidesPerView: 'auto',
                    loop: false,
                    draggable: true,
                    allowTouchMove: true,
                    maxBackfaceHiddenSlides: 1,
                });
            }

            const thumbs = this.thumbSlider ? {
                swiper: this.thumbSlider
            } : null;

            const nextEl = sliderEl.querySelector('[data-swiper-next]');
            const prevEl = sliderEl.querySelector('[data-swiper-prev]');
 
            this.slider = new Swiper(sliderEl, {
                spaceBetween: 2,
                loop: true,
                modules: [Navigation, Thumbs],
                draggable: true,
                allowTouchMove: true,
                maxBackfaceHiddenSlides: 1,
                thumbs,
                ...(nextEl && prevEl ? {
                    navigation: {
                        nextEl,
                        prevEl
                    },
                } : {}),
                on: {
                    slideChange: (swiper) => {
                        this.sliderActiveIndex = swiper.realIndex;
                    }
                }
            });
        },

        goToNextThumb() {
            if (!this.slider) {
                return;
            }

            this.slider.slideNext();
        }
    }));
};