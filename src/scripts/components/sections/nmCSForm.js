import { subscribeToKlaviyo, subscribeToKlaviyoBackInStock } from '@/scripts/api/klaviyo';
import { subscribeToAttentive } from '@/scripts/api/attentive';
import { isEmailValid, isPhoneValid, phoneNumber } from '@/scripts/utils/helpers';

export default async (Alpine) => {
    Alpine.data('nmCSForm', () => ({
        settings: {},
        error: false,
        success: false,
        loading: false,
        message: null,

        init() {
            // this.settings = settings;
        },

        resetForm() {
            this.error = false;
            this.success = false;
            this.message = null;
        },

        setError(message = '') {
            const m = message ? message : 'Something went wrong. Please try again later.';

            this.loading = false;
            this.success = false;
            this.error = true;
            this.message = m;
        },

        setSuccess(message = '') {
            const m = message ? message : 'Thanks for subscribing.';

            this.loading = false;
            this.error = false;
            this.success = true;
            this.message = m;
        },

        async handleForm() {
            this.resetForm();

            if (this.loading) {
                this.setError('The request is being processed. Please wait.');
                return;
            }

            const data = new FormData(this.$el);
            if (!data) {
                this.setError();
                return;
            }

            const formType = data.get('popup');
            if (!formType || (formType !== 'notify-me' && formType !== 'coming-soon')) {
                this.setError();
                return;
            }

            const list_id = data.get('klaviyo_list_id');
            if (!list_id) {
                this.setError();
                return;
            }

            const email = data.get('email');
            if (!email) {
                this.setError('Email is required.');
                return;
            }

            if (email && !isEmailValid(email)) {
                this.setError('Email is invalid.');
                return;
            }

            const phone = phoneNumber(data.get('phone'));

            if (phone && (!isPhoneValid(phone) || phone.length !== 12)) {
                this.setError('Phone is invalid.');
                return;
            }

            this.loading = true;

            const payload = {
                custom_source: formType,
                attributes: {
                    ...(email ? {
                        email
                    } : {}),
                    ...(phone ? {
                        phone_number: phone
                    } : {}),
                    properties: {}
                },
                list_id
            };

            const coming_soon = (formType === 'coming-soon');
            const notify_me = (formType === 'notify-me');
            const product_title = data.get('product_title');
            const variant_id = data.get('variant_id');
            const agree = data.get('agreement');

            const klaviyoPromises = [];

            if (coming_soon) {
                payload.attributes.properties["Coming Soon"] = product_title;
            }

            if (coming_soon || (notify_me && agree)) {
                klaviyoPromises.push(subscribeToKlaviyo(payload));
            }

            if (notify_me && variant_id) {
                const bis_payload = {
                    attributes: {
                        ...(email ? {
                            email
                        } : {}),
                        ...(phone ? {
                            phone_number: phone
                        } : {}),
                    },
                    variant_id
                }

                klaviyoPromises.push(subscribeToKlaviyoBackInStock(bis_payload));
            }

            try {
                if (phone) {
                    const data_attentive = {
                        phone,
                        email,
                        signup_unit_id: Alpine.store('Global')?.settings?.attentive_sign_up_unit_id,
                        coming_soon,
                        product_title,
                        notify_me
                    }

                    await Promise.all([
                        ...klaviyoPromises,
                        subscribeToAttentive(data_attentive)
                    ]);
                } else {
                    if (!klaviyoPromises?.length) {
                        this.setError();
                        return;
                    }

                    await Promise.all([
                        ...klaviyoPromises
                    ]);
                }
            } catch(error) {
                this.setError();
                return;
            }

            this.setSuccess();
        }
    }));
};
