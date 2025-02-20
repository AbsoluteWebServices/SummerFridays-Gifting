import { loadKlaviyo } from '@/scripts/components/klaviyo';
import {randomKey} from '@/scripts/utils/helpers';

export default async (Alpine) => {
    Alpine.data('bundle', () => ({
        slider: null,
        thumbSlider: null,
        settings: null,
        selectedVariants: {},

        get available() {
            let available = !!this.settings.available;

            for (let i = 0; i < this.settings.steps.length; i++) {
                const variant = this.getSelectedVariant(i);
                if (!variant?.available) {
                    available = false;
                    break;
                }
            }

            return available;
        },

        get total_price() {
            let price = 0;
            this.settings.steps.forEach((step, index) => {
                const variant = this.getSelectedVariant(index);
                if (!variant) {
                    return;
                }

                price += variant.price;
            });
            return price;
        },

        get total_price_discounted() {
            let price = 0;
            this.settings.steps.forEach((step, index) => {
                const variant = this.getSelectedVariant(index);
                if (!variant) {
                    return;
                }

                price += (typeof variant.discounted_price === 'number') ? variant.discounted_price : variant.price;
            });
            return price;
        },

        init() {
            this.setSettings();

            this.initKlaviyo();

            this.$watch('selectedVariants', () => {
                if (!window.item) {
                    return;
                }

                window.item.Price = window.Shopify.formatMoney(this.total_price_discounted);
                window.item.CompareAtPrice = window.Shopify.formatMoney(this.total_price);
            });
        },

        async initKlaviyo() {
            const {settings} = this;
            if (!settings) {
                return;
            }

            await loadKlaviyo();

            window.klaviyo = window.klaviyo || [];
            window.klaviyo.init({
                account: Alpine.store('Global')?.settings?.klaviyo_company_id,
                list: "Xcp8cA",
                platform: "shopify"
            });

            if (!window.item) {
                return;
            }

            window._learnq = window._learnq || [];
            window._learnq.push(['track', 'Viewed Product', window.item]);
            window._learnq.push(['trackviewedItem', {
                Title: item.Name,
                ItemId: item.ProductID,
                Categories: item.Categories,
                ImageUrl: item.ImageURL,
                Url: item.URL,
                Metadata: {
                    Brand : item.Brand,
                    Price: item.Price,
                    CompareAtPrice: item.CompareAtPrice
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

        getAllVariantsInStep(step_index) {
            if (isNaN(step_index)) {
                return [];
            }

            const step = this.settings.steps[step_index];
            if (!step) {
                return [];
            }

            let variants = [];
            step.products.forEach((product) => {
                variants = [...variants, ...product.variants];
            });

            return variants;
        },

        optionTitle(option_title) {
            const contains_separator = option_title.includes(' - ');

            if (!contains_separator) {
                return option_title;
            }

            if (contains_separator) {
                const option_title_parts = option_title.split(' - ');
                if (option_title_parts.length !== 2) {
                    return option_title;
                }

                const option_title_string = `Shade ${option_title_parts[0]}<span class="font-10-smaller">: ${option_title_parts[1]}</span>`;
                const doc = new DOMParser().parseFromString(option_title_string, 'text/html');
                return doc.body.innerHTML;
            }

            return option_title;
        },

        getSelectedVariant(step_index) {
            if (isNaN(step_index)) {
                return null;
            }

            const step = this.settings.steps[step_index];
            if (!step) {
                return null;
            }

            return this.selectedVariants[step_index] ?? step.products[0].variants[0];
        },

        addToBag() {
            const data = {
                items: [],
            };

            const bundle_key = randomKey();

            const steps = this.settings.steps;
            if (!steps?.length) {
                return;
            }

            steps.forEach((step, index) => {
                const variant = this.getSelectedVariant(index);
                if (!variant) {
                    return;
                }

                if (!variant.available || variant.draft) {
                    return;
                }

                const variant_id = variant.id;

                data.items = [
                    ...data.items,
                    {
                        id: variant_id,
                        quantity: 1,
                        properties: {
                            _bundle_key: bundle_key,
                            _bundle_main_product: !index,
                            _bundle_image: this.settings.image,
                            _bundle_url: window.location.href,
                            _bundle_title: this.settings.title,
                        },
                    },
                ];
            });

            Alpine.store('Cart').addToCart(null, data);
        },

        toggleSelector(event) {
            const selector_wrapper = event.target.closest('[data-selector-wrapper]');
            if (!selector_wrapper) {
                return;
            }

            const selector = selector_wrapper.querySelector('[data-selector]');
            if (!selector) {
                return;
            }

            this.closeAllSelectors(null, selector.id);

            selector.classList.toggle('open');
        },

        closeAllSelectors(event, exclude_selector_id) {
            const selectors = document.querySelectorAll('[data-selector]');
            if (!selectors.length) {
                return;
            }

            if (event) {
                const selector_wrapper = event.target.closest('[data-selector-wrapper]');
                if (selector_wrapper) {
                    return;
                }
            }

            selectors.forEach((selector) => {
                if (!exclude_selector_id || selector.id !== exclude_selector_id) {
                    selector.classList.remove('open');
                }
            });
        },

        selectVariant(step_index, variant_id) {
            if (isNaN(step_index) || isNaN(variant_id)) {
                return;
            }

            const step = this.settings.steps[step_index];
            if (!step) {
                return;
            }

            const variant = this.getAllVariantsInStep(step_index)?.find((v) => v.id === variant_id);
            if (!variant) {
                return;
            }

            this.selectedVariants = {
                ...this.selectedVariants,
                [step_index]: variant,
            };
        },

        setSettings() {
            const el = this.$refs.settings;
            if (!el?.innerHTML) {
                return;
            }

            try {
                this.settings = JSON.parse(el.innerHTML || '{}');
            } catch (error) {
                console.error(error);
            }
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

            const thumbs = this.thumbSlider
                ? {
                      swiper: this.thumbSlider,
                  }
                : null;

            const nextEl = sliderEl.querySelector('[data-swiper-next]');
            const prevEl = sliderEl.querySelector('[data-swiper-prev]');

            this.slider = new Swiper(sliderEl, {
                loop: true,
                modules: [Navigation, Thumbs],
                draggable: true,
                allowTouchMove: true,
                maxBackfaceHiddenSlides: 1,
                thumbs,
                ...(nextEl && prevEl
                    ? {
                          navigation: {
                              nextEl,
                              prevEl,
                          },
                      }
                    : {}),
                on: {
                    slideChange: (swiper) => {
                        this.sliderActiveIndex = swiper.realIndex;
                    },
                },
            });
        },

        goToNextThumb() {
            if (!this.slider) {
                return;
            }

            this.slider.slideNext();
        },
    }));
};
