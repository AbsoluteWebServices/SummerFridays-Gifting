export default async (Alpine) => {
    Alpine.data('countrySelector', () => ({
        open: false,
        
        init() {
        },

        selectCountry(country) {
            if (!country) {
                return;
            }

            const form = document.querySelector('.shopify-localization-form');
            if (!form) {
                return;
            }

            const select = form.querySelector('select[name="country_code"]');
            if (!select) {
                return;
            }

            select.value = country;
            form.submit();
        }
    }));
};