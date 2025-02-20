import Alpine from 'alpinejs';
import {
    disableBodyScroll,
    enableBodyScroll,
} from 'body-scroll-lock-upgrade';
import { createGift } from '@/scripts/api/rise';

Alpine.store('Cart', {
    el: null, 
    topOffset: 0,
    opened: false,
    settings: null,
    cart: null,
    loading: true,
    freeSamplesSlider: null,
    upsellsSlider: null,
    note: '',
    ariaLiveText: 'Cart drawer opened.',

    async init() {
        this.setSettings();
        if (!this.settings) {
            return;
        }

        this.el = document.getElementById('minicart');
        if (!this.el) {
            return;
        }

        this.setTopOffset();

        await this.setCart();
        if (!this.cart) {
            return;
        }

        this.openOnLoad();

        this.bundles();

        this.initOkendo();
    }, 

    initOkendo() {
        document.addEventListener('oke_connect_cart_itemVariantAdded', (async () => { 
            await this.setCart();
            this.open();
        }));
    },

    openOnLoad() {
        const params = new URLSearchParams(window.location.search);
        if (!params) {
            return;
        }

        const cart_redirect_param = params.get('cart_redirect');
        if (!cart_redirect_param) {
            return;
        }

        if (cart_redirect_param !== 'true') {
            return;
        }
        
        this.open();
    },

    bundles() {
        const {cart} = this;
        if (!cart) {
            return [];
        }

        const {items} = cart;
        if (!items) {
            return [];
        }

        const bundle_keys = items
            .map((item) => {
                if (item.properties?._bundle_main_product === 'true') {
                    return item.properties._bundle_key;
                }
            })
            .filter((bundle) => bundle);

        if (!bundle_keys?.length) {
            return [];
        }

        const bundles = Object.values( 
            bundle_keys.reduce((acc, key) => {
                const children = items.reverse().filter((item) => {
                    return Boolean(item.properties?._bundle_key && item.properties._bundle_key === key)
                });

                const mainItem = children.find((item) => item.properties._bundle_main_product === 'true');

                acc[key] = {
                    quantity: 1,
                    image: mainItem?.properties?._bundle_image ?? null,
                    title: mainItem?.properties?._bundle_title ?? 'Your Summer Fridays Kit',
                    url: mainItem?.properties?._bundle_url ?? '',
                    price: children.reduce((acc, item) => {
                        return acc + item.final_line_price
                    }, 0),
                    compare_at_price: children.reduce((acc, item) => {
                        return acc + item.original_line_price
                    }, 0),
                    key,
                    items: children,
                }

                return acc;
            }, {})
        );

        return bundles;
    },

    line_items() {
        const {cart} = this;
        if (!cart) {
            return [];
        }

        const {items} = cart;
        if (!items) {
            return [];
        }

        return items.filter((item) => {
            return !Boolean(item.properties?._bundle_key);
        });
    },

    properties(item) {
        if (!item) {
            return [];
        }

        const {properties} = item;
        if (!properties) {
            return [];
        }

        const keys = Object.keys(properties).filter((key) => !key.startsWith('_'));
        if (!keys?.length) {
            return [];
        }

        return keys.map((key) => {
            return {
                key,
                value: properties[key]
            }
        })
    },

    freeShippingProgressBarRemainingSum() {
        const total_price = this.cart?.total_price || 0;
        const cost = this.settings?.free_shipping_progress_bar?.cost || 0;

        return cost - total_price;
    },

    freeShippingProgressBarProgress() {
        const cost = this.settings?.free_shipping_progress_bar?.cost || 0;
        if (!cost) {
            return 100;
        }

        return (cost - this.freeShippingProgressBarRemainingSum()) / cost * 100;
    },

    async setCart() {
        this.loading = true;

        try {
            this.cart = await fetch('/cart?view=api').then((res) => res.json());
            this.note = this.cart?.note || '';
            await this.checkFreeSamples();
            await this.checkBundles();
            await this.checkDiscountCampaigns();

            const e = new Event('cart:updated');
            document.dispatchEvent(e);
        } catch (error) {
            console.error(`Error fetching and setting cart: ${ error }`);
        }

        this.loading = false;
    },

    setSettings() {
        const el = document.querySelector('[data-minicart-settings]');
        if (!el?.innerHTML) {
            return;
        }

        try {
            this.settings = JSON.parse(el.innerHTML);
        } catch (error) {
            console.error(`Error parsing minicart settings: ${ error }`);
        }
    },

    setTopOffset() {
        const announcementEl = document.getElementById('shopify-section-announcement');
        if (!announcementEl) {
            return;
        }

        this.topOffset = announcementEl.clientHeight;
    },

    async checkBundles() {
        const bundles = this.bundles() || [];
        if (!bundles?.length) {
            return;
        }

        if (bundles?.length < 4) {
            return;
        }

        const items = bundles[1].items;
        if (!items?.length) {
            return;
        }

        await this.update({
            updates: items.reduce((acc, item) => {
                acc[item.key] = 0;
                return acc;
            }, {})
        })

        this.ariaLiveText = 'Products in cart have been updated.';
    },

    async checkDiscountCampaigns() {
        const globalSettings = Alpine.store('Global')?.settings;
        if (!globalSettings) {
            return;
        }

        const {discount_campaigns} = globalSettings;
        if (!discount_campaigns?.length) {
            return;
        }

        let firstQualifiedDiscountCampaign = null;
        let firstDisQualifiedDiscountCampaign = null;
        
        discount_campaigns.forEach((discountCampaign) => {
            if (firstQualifiedDiscountCampaign || firstDisQualifiedDiscountCampaign) {
                return;
            }
    
            const discountCampaignName = discountCampaign.name;
            const discountCampaignApplied = !!(this.cart.items || []).filter((line_item) => line_item.properties?._discount_campaign === discountCampaignName)?.length;
    
            const current_date = new Date().getTime();
    
            if (discountCampaign.start_date) {
                const start_date = new Date(discountCampaign.start_date).getTime();
    
                if (current_date < start_date) {
                    if (discountCampaignApplied) {
                        firstDisQualifiedDiscountCampaign = discountCampaign;
                    }
    
                    return;
                }
            }
    
            if (discountCampaign.end_date) {
                const end_date = new Date(discountCampaign.end_date).getTime();
                
                if (current_date >= end_date) {
                    if (discountCampaignApplied) {
                        firstDisQualifiedDiscountCampaign = discountCampaign;
                    }
    
                    return;
                }
            }
    
            if (!discountCampaign.y_products?.length) {
              if (discountCampaignApplied) {
                firstDisQualifiedDiscountCampaign = discountCampaign;
              }
    
              return;
            }
    
            if (discountCampaign.x_products?.length) {
              const productsInCart = this.cart.items ?? {};
              if (!productsInCart?.length) {
                if (discountCampaignApplied) {
                    firstDisQualifiedDiscountCampaign = discountCampaign;
                }
    
                return;
              }
    
              const xProductsInCart = productsInCart.filter((line_item) => {
                return discountCampaign.x_products.includes(line_item.productId);
              });
    
              if (!xProductsInCart?.length) {
                if (discountCampaignApplied) {
                    firstDisQualifiedDiscountCampaign = discountCampaign;
                }
    
                return;
              }
    
              if (
                discountCampaign.all_x_products_must_be_in_cart &&
                discountCampaign.x_products.length !== xProductsInCart.length
              ) {
                if (discountCampaignApplied) {
                    firstDisQualifiedDiscountCampaign = discountCampaign;
                }
    
                return;
              }
    
              const qtyOfXProductsInCart = xProductsInCart.reduce((acc, obj) => {
                return acc + obj.quantity;
              }, 0);
    
              const requiredQty = discountCampaign.minimum_x_qty ?? 0;
    
              if (requiredQty > qtyOfXProductsInCart) {
                if (discountCampaignApplied) {
                    firstDisQualifiedDiscountCampaign = discountCampaign;
                }
    
                return;
              }
            }
    
            if (discountCampaign.customer_tags?.length) {
              const currentCustomerTags = globalSettings.customer_tags;
              if (!currentCustomerTags?.length) {
                if (discountCampaignApplied) {
                    firstDisQualifiedDiscountCampaign = discountCampaign;
                }
    
                return;
              }
    
              const tagFound = discountCampaign.customer_tags.some((tag) =>
                currentCustomerTags.includes(tag)
              );
              if (!tagFound) {
                if (discountCampaignApplied) {
                    firstDisQualifiedDiscountCampaign = discountCampaign;
                }
    
                return;
              }
            }
    
            const requiredMinCartAmount = (discountCampaign.minimum_cart_amount ?? 0) * 100;
            if (this.cart.total_price < requiredMinCartAmount) {
                if (discountCampaignApplied) {
                    firstDisQualifiedDiscountCampaign = discountCampaign;
                }
    
                return;
            }
    
            const code = discountCampaign.code;
            if (code) {
              const cartDiscountCode = document.querySelector('#cart-discount-code');
              if (cartDiscountCode?.value !== code) {
                return;
              }
            }
    
            if (discountCampaignApplied) {
                return;
            }
    
            firstQualifiedDiscountCampaign = discountCampaign;
        });

        if (!firstQualifiedDiscountCampaign && !firstDisQualifiedDiscountCampaign) {
            return;
        }

        if (firstQualifiedDiscountCampaign) {
            const data = {
                items: [],
            };
    
            firstQualifiedDiscountCampaign.y_products.forEach((variant_id) => {
                const item = {
                    id: variant_id,
                    quantity: 1,
                    properties: {
                        _discount_campaign: firstQualifiedDiscountCampaign.name,
                    },
                };
    
                data.items.push(item);
            });
    
            if (!data?.items?.length) {
                return;
            }
    
            await this.addToCart(null, data);
            return;
        } else if (firstDisQualifiedDiscountCampaign) {
            const updates =
                (this.cart.items || [])
                .filter((line_item) => line_item.properties?._discount_campaign === firstDisQualifiedDiscountCampaign.name)
                .reduce((acc, item) => {
                    acc[item.key] = 0;
                    return acc;
                }, {});
    
            if (!Object.keys(updates)?.length) {
                return;
            }

            const payload = {
                updates
            }
    
            await this.update(payload);

            return;
        }
    },

    async checkFreeSamples() {
        const {items} = this.cart;
        if (!items?.length) {
            return;
        }

        const free_samples_in_cart = items.filter((item) => item.free_sample);
        if (!free_samples_in_cart?.length) {
            return;
        }

        const eligible_items = items.filter((item) => item.requires_shipping);

        const free_samples_enable = this.settings?.free_samples?.enable;

        const {total_price = 0} = this.cart;
        const threshold = this.settings?.free_samples?.threshold || 7500;

        if ([
            !free_samples_enable, 
            free_samples_in_cart.length === items.length, 
            !eligible_items?.length,
            threshold > total_price
        ].includes(true)) {
            const updates = free_samples_in_cart.reduce((acc, item) => {
                acc[item.key] = 0;
                return acc;
            }, {});

            const payload = {
                updates
            }

            await this.update(payload);
            return;
        }

        const limit = this.settings?.free_samples?.limit || 1;
        if (free_samples_in_cart.length > limit) {
            const updates = free_samples_in_cart.slice(0, (free_samples_in_cart.length - limit)).reduce((acc, item) => {
                acc[item.key] = 0;
                return acc;
            }, {});

            const payload = {
                updates
            }

            await this.update(payload);
            return;
        }

        const free_samples_ids = (this.settings?.free_samples?.products || []).map((product) => product.variant_id);
        const not_registered_free_samples = free_samples_in_cart.filter((item) => !free_samples_ids.includes(item.id));
        if (!not_registered_free_samples.length) {
            return;
        }

        const updates = not_registered_free_samples.reduce((acc, item) => {
            acc[item.key] = 0;
            return acc;
        }, {});

        const payload = {
            updates
        }

        await this.update(payload);
        return;
    },

    showFreeSamples() {
        const {settings} = this;
        if (!settings) {
            return false;
        }

        const {free_samples} = settings;
        if (!free_samples) {
            return false;
        }

        if (!free_samples.enable) {
            return false;
        }

        const {products} = free_samples;
        if (!products?.length) {
            return false;
        }

        const items = (this.cart?.items || []).filter((item) => item.requires_shipping);
        if (!items?.length) {
            return false;
        }

        const free_sample_ids = products.map((product) => product.variant_id);
        const {limit = 1} = free_samples;

        const free_samples_in_cart = items.filter((item) => {
            return free_sample_ids.includes(item.id);
        });

        if (free_samples_in_cart?.length >= limit) {
            return false;
        }

        const {total_price = 0} = this.cart;
        const threshold = free_samples.threshold || 7500;
        if (threshold > total_price) {
            return false;
        }

        return true;
    },

    freeSamples() {
        const {settings} = this;
        if (!settings) {
            return [];
        }

        const {free_samples} = settings;
        if (!free_samples) {
            return [];
        }

        const {products} = free_samples;
        if (!products?.length) {
            return [];
        }

        const items_ids = (this.cart?.items || []).map((item) => item.id);
        if (!items_ids?.length) {
            return products;
        }

        return products.filter((product) => !items_ids.includes(product.variant_id));
    },

    async initFreeSamplesSlider() {
        const sliderEl = document.querySelector('[data-free-samples-slider="true"]');
        if (!sliderEl) {
            return;
        }

        const { default: Swiper } = await import('swiper');
        const { Navigation } = await import('swiper/modules');

        const nextEl = '[data-free-samples-slider-next]';
        const prevEl = '[data-free-samples-slider-prev]';

        this.freeSamplesSlider = new Swiper(sliderEl, {
            slidesPerView: 3,
            spaceBetween: 18,
            centeredSlides: false,
            modules: [Navigation],
            maxBackfaceHiddenSlides: 1,
            ...(nextEl && prevEl ? {
                navigation: {
                    nextEl,
                    prevEl
                },
            } : {})
        });
    },

    async initUpsellsSlider() {
        if (this.upsellsSlider) {
            return;
        }

        const sliderEl = document.querySelector('[data-minicart-upsells-slider]');
        if (!sliderEl) {
            return;
        }

        const { default: Swiper } = await import('swiper');
        const { Navigation } = await import('swiper/modules');

        const nextEl = '[data-upsells-slider-next]';
        const prevEl = '[data-upsells-slider-prev]';

        this.upsellsSlider = new Swiper(sliderEl, {
            slidesPerView: 1.1,
            spaceBetween: 18,
            modules: [Navigation],
            allowTouchMove: true,
            maxBackfaceHiddenSlides: 1,
            ...(nextEl && prevEl ? {
                navigation: {
                    nextEl,
                    prevEl
                },
            } : {})
        });
    },

    async updateNote(value = '') {
        const payload = {
            note: value
        }
        
        await this.update(payload);
        this.note = value;
    },

    open() {
        if (this.opened) {
            return;
        }

        this.opened = true;
        if (!this.el) {
            return;
        }

        this.setTopOffset();

        const topOffset = window.scrollY <= this.topOffset ? this.topOffset - window.scrollY : 0;
        this.el.style.top = `${ topOffset }px`;
        this.el.style.height = `calc(100% - ${ topOffset }px)`;

        disableBodyScroll(this.el, {
            allowTouchMove(el) {
                while (el && el !== document?.body) {
                    if (el.getAttribute('data-allow-scroll') !== null) {
                        return true;
                    }

                    el = el?.parentElement;
                }

                return false;
            }
        });
        
        this.ariaLiveText = 'Cart drawer opened.';
    },

    close() {
        if (!this.opened) {
            return;
        }

        this.opened = false;
        if (!this.el) {
            return;
        }

        enableBodyScroll(this.el);
    },

    async update(payload) {
        if (!Object.keys(payload || {}).length) {
            return;
        }

        this.loading = true;

        try {
            await fetch('/cart/update.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            await this.setCart();
        } catch (error) {
            console.error(`Error updating line items: ${ payload }`);
        }
    },

    async change(payload) {
        if (!Object.keys(payload || {}).includes('id')) {
            return;
        }

        this.loading = true;

        try {
            await fetch('/cart/change.js', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            await this.setCart();

            this.ariaLiveText = 'Products in cart have been updated.';
        } catch (error) {
            console.error(`Error changing the line item: ${ payload }`);
        }

        this.loading = false;
    },

    async addToCart(event = null, payload = null) {
        if (!event && !payload) {
            return;
        }

        let data = {};
        let headers = null;
        let btns = [];

        if (event) {
            const form = event.target;
            if (!form) {
                return;
            }

            btns = form.querySelectorAll('button[type="submit"]');
            if (btns?.length) {
                btns.forEach((btn) => btn.classList.add('loading'));
            }

            data = new FormData(form);

            const isGiftCard = data.get('gift_card');
            if (isGiftCard && isGiftCard === 'true') {
                const gift = {
                    variant_id: Number(data.get('id') || '0') || null,
                    name: data.get('properties[Name]') || null,
                    email: data.get('properties[Email]') || null,
                    message: (data.get('properties[Message]') || Alpine.store('Global')?.settings?.rise_default_message || 'Enjoy your gift!'),
                    sending_method: data.get('sending_method') || 'email',
                    image: Alpine.store('Global')?.settings?.rise_image || null,
                    send_at: data.get('send_at') ? new Date(data.get('send_at')).toISOString() : null,
                };

                if ([
                    !Boolean(gift.variant_id),
                    !Boolean(gift.name),
                    (gift.sending_method === 'email' && !Boolean(gift.email))
                ].includes(true)) {
                    if (btns?.length) {
                        btns.forEach((btn) => btn.classList.remove('loading'));
                    }
                    return;
                }

                const createdGift = await createGift({ gift }); 
                if (!createdGift?.gift?.gift_id) {
                    if (btns?.length) {
                        btns.forEach((btn) => btn.classList.remove('loading'));
                    }
                    return;
                }

                data.append('properties[_gift_id]', createdGift.gift.gift_id);
                data.append('properties[_gift_session_id]', createdGift.session_id);
            }
        } else {
            data = JSON.stringify(payload);
            headers = {
                'Content-Type': 'application/json'
            }
        }

        this.loading = true;

        try {
            await fetch(window.Shopify.routes.root + 'cart/add.js', {
                method: 'POST',
                ...(headers ? {
                    headers
                } : {}),
                body: data
            });

            await this.setCart();

            this.open();

            this.ariaLiveText = 'Product(s) added to cart. Please proceed to checkout.'

            const e = new Event('cart:added');
            document.dispatchEvent(e);
        } catch (error) {
            console.error(`Error adding to cart: ${ error }`);
        }

        if (btns?.length) {
            btns.forEach((btn) => btn.classList.remove('loading'));
        }

        this.loading = false;
    }
});