import Alpine from 'alpinejs';

const SETTINGS = Alpine.store('Global')?.settings || null;

const subscribeToKlaviyo = async ({ custom_source, attributes, list_id }) => {
    if ([
        Boolean(custom_source),
        Boolean(attributes),
        Boolean(list_id),
        Boolean(SETTINGS?.klaviyo_company_id),
        Boolean(SETTINGS?.klaviyo_revision)
    ].includes(false)) {
        return;
    }

    if (!attributes.email && !attributes.phone_number) {
        return;
    }

    try {
        return await fetch(`https://a.klaviyo.com/client/subscriptions/?company_id=${ SETTINGS.klaviyo_company_id }`, {
            method: 'POST', 
            headers: {
                revision: SETTINGS.klaviyo_revision,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: {
                    type: 'subscription',
                    attributes: {
                        custom_source,
                        profile: {
                            data: {
                                type: 'profile',
                                attributes
                            }
                        }
                    },
                    relationships: {
                        list: {
                            data: {
                                type: 'list', 
                                id: list_id
                            }
                        }
                    }
                }
            })
        });
    } catch (error) {
        console.error(`Error subscribing to Klaviyo: ${ error }`);
    }
}

const subscribeToKlaviyoBackInStock = async ({ attributes, variant_id }) => {
    if ([
        Boolean(attributes),
        Boolean(variant_id),
        Boolean(SETTINGS?.klaviyo_company_id),
        Boolean(SETTINGS?.klaviyo_revision)
    ].includes(false)) {
        return;
    }

    if (!attributes.email && !attributes.phone_number) {
        return;
    }

    const channels = [];
    if (attributes.email) {
        channels.push('EMAIL');
    }
    if (attributes.phone_number) {
        channels.push('SMS');
    }

    try {
        return await fetch(`https://a.klaviyo.com/client/back-in-stock-subscriptions/?company_id=${ SETTINGS.klaviyo_company_id }`, {
            method: 'POST', 
            headers: {
                accept: 'application/vnd.api+json',
                revision: SETTINGS.klaviyo_revision,
                'Content-Type': 'application/vnd.api+json'
            },
            body: JSON.stringify({
                data: {
                    type: 'back-in-stock-subscription',
                    attributes: {
                        profile: {
                            data: {
                                type: 'profile',
                                attributes
                            }
                        },
                        channels
                    },
                    relationships: {
                        variant: {
                            data: {
                                type: 'catalog-variant', 
                                id: `$shopify:::$default:::${variant_id}`
                            }
                        }
                    }
                }
            })
        });
    } catch (error) {
        console.error(`Error subscribing to Klaviyo Back-in-stock: ${ error }`);
    }
}

export {
    subscribeToKlaviyo,
    subscribeToKlaviyoBackInStock
}