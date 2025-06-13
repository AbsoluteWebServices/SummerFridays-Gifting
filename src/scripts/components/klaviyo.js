import { loadJS } from '@/scripts/utils/helpers';

const SRC = 'https://a.klaviyo.com/media/js/onsite/onsite.js';

const loadKlaviyo = async () => {
    try {
        await loadJS(SRC);
    } catch (error) {
        console.error(`Error loading Klaviyo: ${ error }`);
    }
};

export {
    loadKlaviyo
}
