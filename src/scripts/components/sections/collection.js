export default async (Alpine) => {
    Alpine.data('collection', () => ({
        filtersApplied: false,
        loading: false,

        async fetchAndRender(fetchUrl = null) {
            if (this.loading) {
                return;
            }

            const container = document.querySelector('[x-data="collection"]');
            if (!container) {
                return;
            }

            const {productsContainer} = this.$refs;

            if (!productsContainer) {
                return;
            }

            const jsReplace = container.querySelectorAll('[data-js-replace]');
            if (!jsReplace?.length) {
                return;
            }

            const {filtersForm} = this.$refs;
            if (!filtersForm) {
                return;
            }

            const url = new URL(window?.location?.href);
            let params = null;

            if (fetchUrl !== null) {
                const fetchUrlObj = new URL(fetchUrl);
                params = new URLSearchParams(fetchUrlObj.search);
            } else {
                const formData = new FormData(filtersForm);
                params = new URLSearchParams(formData);
            }

            if (url.searchParams.get('view')) {
                params.set('view', url.searchParams.get('view'));
            }

            params.set('section_id', 'collection');

            url.search = params?.toString() || "";

            this.loading = true;

            try {
                const response = await fetch(url.href).then(res => res.text());

                params.delete('section_id');
                url.search = params?.toString() || "";
                window.history.replaceState(null, '', url.href);

                if (!response) {
                    this.loading = false;
                    return;
                }
    
                const doc = new DOMParser().parseFromString(response, 'text/html');
                if (!doc) {
                    this.loading = false;
                    return;
                }
    
                const _productsContainer = doc.querySelector('[x-ref="productsContainer"]');
                if (!_productsContainer) {
                    this.loading = false;
                    return;
                }
    
                const _jsReplace = doc.querySelectorAll('[data-js-replace]');
                if (!_jsReplace?.length || _jsReplace.length !== jsReplace.length) {
                    this.loading = false;
                    return;
                }

                jsReplace.forEach((el, i) => {
                    el.innerHTML = _jsReplace[i].innerHTML;
                });
    
                productsContainer.setAttribute('data-next-page', (_productsContainer.dataset?.nextPage || false));

                this.filtersApplied = true;
            } catch (error) {
                console.error(`Error fetching products: ${ error }`);
            }

            this.loading = false;
        },

        async loadMore(url) {
            if (this.loading || !url) {
                return;
            }

            const {productsContainer} = this.$refs;

            if (!productsContainer) {
                return;
            }

            const loadMoreContainer = document.querySelector('[data-replace-load-more]');
            if (!loadMoreContainer) {
                return;
            }

            this.loading = true;

            try {
                const response = await fetch(`${ url }&section_id=collection`).then(res => res.text());
                if (!response) {
                    return;
                }
    
                const doc = new DOMParser().parseFromString(response, 'text/html');
                if (!doc) {
                    return;
                }
    
                const _productsContainer = doc.querySelector('[x-ref="productsContainer"]');
                if (!_productsContainer) {
                    return;
                }

                const productCardsToRemove = _productsContainer.querySelectorAll('[data-product-card-remove]');
                if (productCardsToRemove?.length) {
                    productCardsToRemove.forEach((el) => el.remove());
                }

                const _loadMoreContainer = doc.querySelector('[data-replace-load-more]');
                if (!_loadMoreContainer) {
                    return;
                }
    
                const html = _productsContainer.innerHTML;
                if (!html) {
                    return;
                }
                
                loadMoreContainer.innerHTML = _loadMoreContainer.innerHTML || '';
                productsContainer.insertAdjacentHTML('beforeend', html);
            } catch(error) {
                console.error(`Error fetching products: ${ error }`);
            }

            this.loading = false;
        }
    }));
};