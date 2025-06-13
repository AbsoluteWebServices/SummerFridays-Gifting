import Alpine from 'alpinejs';
import focus from '@alpinejs/focus';
import intersect from '@alpinejs/intersect';
import { formatMoney } from '@/scripts/utils/helpers';
import { KlevuConfig } from '@klevu/core';

Alpine.plugin(focus);
Alpine.plugin(intersect);

window.Shopify.formatMoney = formatMoney;

KlevuConfig.init({
    url: 'https://uscs33v2.ksearchnet.com/cs/v2/search',
    apiKey: 'klevu-169896688798816849',
});

import '@/scripts/store/index.js';
import '@/scripts/components/index.js';

const init = async () => {
    const splitLoadSections = document.querySelectorAll(
        '[data-split-load-section]'
    );

    if (!splitLoadSections?.length) {
        Alpine.start();
        return;
    }

    const loadedSections = [];

    for (const section of splitLoadSections) {
        const fileName = section.getAttribute('x-data')?.split('(')[0];

        if (fileName && !loadedSections.includes(fileName)) {
            try {
                const { default: plugin } = await import(
                    `./components/sections/${fileName}.js`
                );
                Alpine.plugin(plugin);
                loadedSections.push(fileName);
            } catch (error) {
                console.error(
                    `Failed to load this section: ${fileName}`,
                    error
                );
            }
        }
    }
    Alpine.start();
};

init();