import {
    disableBodyScroll,
    enableBodyScroll,
} from 'body-scroll-lock-upgrade';

export default async (Alpine) => {
    Alpine.data('quiz', () => ({
        loaded: false,
        stepLoaded: false,
        formLoading: false,
        formError: false,
        formSuccess: false,
        formMsg: '',
        current_step: {},
        index: 0,
        settings: null,
        selectedOptions: [],
        answers: [],
        allProductIds: [],
        treatmentProductIds: [],
        container: null,

        get progressBar() {
            const percentage = (this.index / this.settings.steps.length) * 100;
            const width = percentage < 100 ? `${percentage}%` : '100%';

            return width;
        },

        init() {
            this.initSettings();
            if (!this.settings) {
                return;
            }

            this.container = this.$el;

            disableBodyScroll(this.container, {
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

            this.current_step = this.settings.steps[0];
            this.index = this.current_step.index;
            this.allProductIds = this.current_step.routine_products.filter(product => product.available).map(product => product.variant_id);
            this.treatmentProductIds = this.current_step.treatment_products.filter(product => {
                return product.compatible_with_all_answers
            }).map(product => product.variant_id);
            this.loaded = true;
            this.stepLoaded = true;
        },

        initSettings() {
            const el = this.$refs.settings;
            if (!el?.innerHTML) {
                return;
            }

            try {
                this.settings = JSON.parse(el.innerHTML);
            } catch (error) {
                console.error(`Error parsing quiz settings: ${error}`);
            }
        }
    }));
};
