import Alpine from 'alpinejs';

const RISE_URL = 'https://application.rise-ai.com/integrations/inbound/gifting/session';
const SETTINGS = Alpine.store('Global')?.settings || null;

const initGiftingSession = async () => {
    if (!SETTINGS) {
        throw Error('SETTINGS are not defined.');
    }

    const {rise_gifting_api_key} = SETTINGS;
    if (!rise_gifting_api_key) {
        throw Error('Rise gifting API key is missing.');
    }

    const shop_url = window.Shopify?.shop;
    if (!shop_url) {
        throw Error('Shop URL is not defined.');
    }

    const url = new URL(RISE_URL);
    url.searchParams.set('shop_url', shop_url);

    const headers = new Headers();
    headers.append('x-rise-gifting-api-key', rise_gifting_api_key);

    const options = {
        method: 'POST',
        headers,
        redirect: 'follow'
    };

    try {
        return await fetch(url, options).then((response) => response.json());
    } catch (error) {
        throw Error('Error initiating gifting session.');
    }
};

const getGiftingSessionId = async() => {
    const session = await initGiftingSession();
    if (!session) {
        return null;
    }

    const session_id = session.session?.id;
    if (!session_id) {
        return null;
    }

    return session_id;
};

const createGift = async(gift) => {
    if (!gift) {
        return;
    }

    if (!SETTINGS) {
        throw Error('SETTINGS are not defined.');
    }

    const {rise_gifting_api_key} = SETTINGS;
    if (!rise_gifting_api_key) {
        throw Error('Rise gifting API key is missing.');
    }

    const shop_url = window.Shopify?.shop;
    if (!shop_url) {
        throw Error('Shop URL is not defined.');
    }

    const session_id = await getGiftingSessionId();
    if (!session_id) {
        throw Error('Could not get gifting session id.');
    }

    const url = new URL(`${RISE_URL}/${session_id}/`);
    url.searchParams.set('shop_url', shop_url);

    const headers = new Headers();
    headers.append('x-rise-gifting-api-key', rise_gifting_api_key);
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');

    const options = {
        method: 'POST',
        headers,
        body: JSON.stringify(gift),
        redirect: 'follow'
    };

    try {
        return {
            ...await fetch(url, options).then((response) => response.json()).catch((error) => console.log(error, 'error')),
            session_id
        };
    } catch (error) {
        throw Error('Error creating gift.');
    }
};

export {
    createGift
}