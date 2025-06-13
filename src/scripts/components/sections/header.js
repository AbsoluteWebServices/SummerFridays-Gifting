import {
    disableBodyScroll,
    enableBodyScroll,
} from 'body-scroll-lock-upgrade';
import hoverintent from 'hoverintent';

export default async (Alpine) => {
    Alpine.data('header', (isHeaderCoverHeroSection) => ({
        classes: {
            heroWhite: 'header--white'
        },
        mmOpen: false,
        searchOpen: false,
        topOffset: 0,
        cmsSlider: null,
        searchResults: {},

        init() {
            this.initSubmenus();

            this.setTopOffset();

            this.$watch('mmOpen', (value) => {
                const mmEl = document.getElementById('mobile-menu');
                if (!mmEl) {
                    return;
                }

                if (value) {
                    disableBodyScroll(mmEl, {
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
                } else {
                    enableBodyScroll(mmEl);
                }
            });

            this.handleResize();
            window.addEventListener('resize', this.handleResize.bind(this));

            if (isHeaderCoverHeroSection) {
                this.initHeaderCoverHero();
            }
        },

        initPredictiveSearch() {
            const el = this.$refs.predictiveSearch;
            if (!el) {
                return;
            }

            document.body.appendChild(el);
        },

        setTopOffset() {
            const announcementEl = document.getElementById('shopify-section-announcement');
            if (!announcementEl) {
                return;
            }
    
            this.topOffset = announcementEl.clientHeight;
        },

        async initCMSSlider() {
            const sliderEl = document.getElementById('predictive-search-cms-slider');
            if (!sliderEl) {
                return;
            }

            const { default: Swiper } = await import('swiper');
 
            this.slider = new Swiper(sliderEl, {
                slidesPerView: 1.35,
                spaceBetween: 18,
                maxBackfaceHiddenSlides: 1, 
            });
        },

        openSearch() {
            const container = document.getElementById('predictive-search');

            if (this.searchOpen || !container) {
                return;
            }
    
            this.searchOpen = true;

            this.$nextTick(() => {
                const input = container.querySelector('input[name="q"]');
                if (!input) {
                    return;
                }

                input.focus();
            });
    
            const topOffset = window.scrollY <= this.topOffset ? this.topOffset - window.scrollY : 0;
            container.style.top = `${ topOffset }px`;
            container.style.height = `calc(100% - ${ topOffset }px)`;
    
            disableBodyScroll(container, {
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
        },
    
        closeSearch() {
            const container = document.getElementById('predictive-search');

            if (!this.searchOpen || !container) {
                return;
            }
    
            this.searchOpen = false;
    
            enableBodyScroll(container);
        },

        handleResize() {
            const height = this.$el.clientHeight;
            if (!height) {
                return;
            }

            document.body.style.setProperty('--header-height-mobile', `${ height }px`);
            document.body.style.setProperty('--header-height-desktop', `${ height }px`);
        },

        initSubmenus() {
            const triggers = this.$el.querySelectorAll('[data-show-submenu]');
            if (!triggers?.length) {
                return;
            }

            triggers.forEach((el) => {
                hoverintent(
                    el,
                    function () {
                        this.classList.add('open');
                    },
                    function () {
                        this.classList.remove('open');
                    }
                ).options({
                    timeout: 500,
                    handleFocus: true
                });
            });
        },

        initHeaderCoverHero() {
            this.toggleCoverHeader(window.scrollY);

            window.addEventListener('scroll', () => {
                this.toggleCoverHeader(window.scrollY);
            });
        },

        toggleCoverHeader(scrollY) {
            const bottom = this.topOffset;

            if (scrollY > bottom) {
                this.$el.classList.add(this.classes.heroWhite);
            } else {
                this.$el.classList.remove(this.classes.heroWhite);
            }
        }
    }));
};
