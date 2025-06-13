import Alpine from 'alpinejs';
import { KlevuFetch, search, suggestions, searchCms, advancedFiltering, sendSearchEvent } from '@klevu/core';

Alpine.store('Search', {
    limit: 3,
    q: '',
    searchResults: {},

    init() {
        this.setLimit();
        this.setSearchFromURL();
    },

    setLimit() {
        const template = Alpine.store('Global')?.settings?.template;
        if (!template) {
            return;
        }

        if (template !== 'search') {
            return;
        }

        this.limit = 99;
    },

    async setSearchFromURL() {
        const params = new URLSearchParams(window.location.search || '');
        if (!params) {
            return;
        }

        const q = params.get('q');
        if (!q) {
            return;
        }

        this.q = q;
        await this.search();

        this.removePlaceholders();
    },

    removePlaceholders() {
        const els = document.querySelectorAll('[data-search-card-placeholder]');
        if (!els?.length) {
            return;
        }

        els.forEach(el => el.remove());
    },

    updateURL() {
        const template = Alpine.store('Global')?.settings?.template;
        if (!template) {
            return;
        }

        if (template !== 'search') {
            return;
        }

        const {q = ''} = this;
        const url = new URL(window?.location?.href || "/");
        if (!url) {
            return;
        }

        url.searchParams.set('q', q);

        window.history.replaceState({}, '', url);
    },

    async search() {
        const {q} = this;
        if (!q) {
            this.searchResults = {};
            return;
        }

        const {limit} = this;

        const searchResults = await KlevuFetch(
            search(
              q,
              {
                ...(limit ? {limit} : {}),
                fields: ['id', 'itemGroupId', 'name', 'klevu_price', 'url', 'image', 'additional_badge', 'plp_title']
              },
              sendSearchEvent(),
              advancedFiltering([ 
                {
                  key: "country_codes_to_include_the_product",
                  singleSelect: false,
                  valueOperator: "INCLUDE",
                  values: [(window?.Shopify?.country || 'US')]
                }
              ])
            ),
            suggestions(q, {
                ...(limit ? {limit} : {}),
            }),
            searchCms(q, {
              id: 'cms',
              ...(limit ? {limit} : {}),
            //   fields: ['name', 'url', 'imageUrl', 'shortDesc'],
            })
        );
        if (!searchResults) {
            this.searchResults = {};
            return;
        }
        
        this.searchResults = {
            products: (searchResults.queriesById('search')?.query?.records || []),
            cms: (searchResults.queriesById('cms')?.query?.records || []).filter(item => item.type === 'articles'),
            suggestions: (searchResults.suggestionsById('suggestions')?.suggestions || [])
        }
    },
});