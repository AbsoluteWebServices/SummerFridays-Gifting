const selectors = {
    container: '[data-articles-container]'
}

export default async (Alpine) => {
    Alpine.data('articles', () => ({
        loading: false,
        container: null,
        nextURL: null,

        init() {
            this.container = this.$el.querySelector(selectors.container);
            if (!this.container) {
                return;
            }

            const nextURL = this.container.getAttribute('data-next-url');
            if (!nextURL) {
                return;
            }

            this.nextURL = nextURL;
        },

        async loadMore() {
            const {loading, container, nextURL} = this;

            if (loading || !container || !nextURL) {
                return;
            }

            this.loading = true;

            try {
                const response = await fetch(`${ nextURL }&section_id=articles`).then(res => res.text());
                if (!response) {
                    return;
                }
    
                const doc = new DOMParser().parseFromString(response, 'text/html');
                if (!doc) {
                    return;
                }

                const _container = doc.querySelector(selectors.container);
                if (!_container?.innerHTML) {
                    return;
                }

                const _nextURL = _container.getAttribute('data-next-url') || null;
                this.nextURL = _nextURL;

                container.insertAdjacentHTML('beforeend', _container.innerHTML);
            } catch (error) {
                console.error(`Error loading more blog articles: ${error}`);
            }

            this.loading = false;
        }
    }));
};
