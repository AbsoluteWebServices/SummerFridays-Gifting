import Alpine from 'alpinejs';

Alpine.store('Global', {
    settings: null,

    init() {
        this.initSettings();

        this.misc();
    },

    misc() {
        window._learnq = window._learnq || [];

        const customer_email = this.settings?.customer_email;
        if (customer_email) {
            window._learnq.push(['identify', {
                '$email': customer_email
            }]);
        }
    },

    initSettings() {
        try {
            const el = document.querySelector('[data-sf-settings]');
            if (!el?.innerHTML) {
                return;
            }

            this.settings = JSON.parse(el.innerHTML);
        } catch (error) {
            console.error('Error parsing settings JSON', error);
        }
    }
});