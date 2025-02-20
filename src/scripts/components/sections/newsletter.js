import { subscribeToKlaviyo } from '@/scripts/api/klaviyo';
import { subscribeToAttentive } from '@/scripts/api/attentive';
import { isEmailValid, isPhoneValid, phoneNumber } from '@/scripts/utils/helpers';

export default async (Alpine) => {
    Alpine.data('newsletter', ({ custom_source, list_id, signup_unit_id, coming_soon = false, product_title = '' }) => ({
        error: false,
        success: false,
        loading: false,
        message: null,

        init() {
            this.initForm();
        },

        resetForm() {
            this.error = false;
            this.success = false;
            this.message = null;
        },

        setError(message = '') {
            const m = message ? message : Alpine.store('Global')?.settings?.subscription_error_message ? Alpine.store('Global').settings.subscription_error_message : 'Something went wrong.';

            this.loading = false;
            this.success = false;
            this.error = true;
            this.message = m;
        },

        setSuccess(message = '') {
            const m = message ? message : Alpine.store('Global')?.settings?.subscription_success_message ? Alpine.store('Global').settings.subscription_success_message : 'Thanks for subscribing.';

            this.loading = false;
            this.error = false;
            this.success = true;
            this.message = m;
        },

        initForm() {
            const form = this.$el.querySelector('form');
            if (!form) {
                return;
            }

            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                if (this.loading) {
                    return;
                }

                const emailInput = form.querySelector('[data-newsletter-email-input]')
                const phoneInput = form.querySelector('[data-newsletter-phone-input]')
                if (!emailInput || !phoneInput) {
                    return;
                }

                this.resetForm();

                const email = emailInput.value.trim();
                const phone = phoneNumber(phoneInput.value.trim());

                if (!email && !phone) {
                    this.setError('Either email or phone is required.');
                    return;
                }

                if (email && !isEmailValid(email)) {
                    this.setError('Email is invalid.');
                    return;
                }

                if (phone && (!isPhoneValid(phone) || phone.length !== 12)) {
                    this.setError('Phone is invalid.');
                    return;
                }

                this.loading = true;

                const data = {
                    custom_source,
                    attributes: {
                        ...(email ? {
                            email
                        } : {}),
                        ...(phone ? {
                            phone_number: phone
                        } : {})
                    },
                    list_id
                }

                if (phone) {
                    const data_attentive = {
                        phone,
                        email,
                        signup_unit_id,
                        coming_soon,
                        product_title
                    }

                    try {
                        const [klaviyo_reponse, attentive_response] = await Promise.all([
                            subscribeToKlaviyo(data),
                            subscribeToAttentive(data_attentive)
                        ]);

                        if (!klaviyo_reponse?.ok) {
                            this.setError();
                            return;
                        }
                    } catch (error) {
                        this.setError();
                        return;
                    }
                } else {
                    try {
                        const klaviyo_reponse = await subscribeToKlaviyo(data);
                        if (!klaviyo_reponse?.ok) {
                            this.setError();
                            return;
                        }
                    } catch (error) {
                        this.setError();
                        return;
                    }
                }
            
                this.setSuccess();
            });
        },
    }));
};