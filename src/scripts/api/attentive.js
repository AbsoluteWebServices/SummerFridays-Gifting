import Alpine from 'alpinejs';

const SETTINGS = Alpine.store('Global')?.settings || null;

const url = new URL('https://service.summerfridays.com/index.php');
 
const subscribeToAttentive = async ({ 
    phone, 
    signup_unit_id, 
    email = '',
    coming_soon = false, 
    product_title = '',
    notify_me = false
}) => {
    if ([
        Boolean(phone),
        Boolean(signup_unit_id) || Boolean(SETTINGS?.attentive_sign_up_unit_id)
    ].includes(false)) {
        return;
    }

    const unit_id = signup_unit_id || SETTINGS?.attentive_sign_up_unit_id;

    url.searchParams.set('phone', phone);
    url.searchParams.set('signUpSourceId', unit_id);
    url.searchParams.set('action', 'subscribe');
    if (email) {
        url.searchParams.set('email', email);
    }

    const response_subsctiber = await fetch(url.toString(), { 
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json' 
        }
    })

    const subscriber = await response_subsctiber.json();

    if (subscriber.message) {
        return;
    }

    if ((coming_soon || notify_me) && product_title) {
        url.searchParams.set('product_title', product_title);
        url.searchParams.set('action', 'add_custom_attributes');

        if (coming_soon) {
            url.searchParams.set('coming_soon', 'true');
        }

        return await fetch(url.toString(), { 
            method: 'GET', 
            headers: {
              'Content-Type': 'application/json'
            }
        })
    }
}

export {
    subscribeToAttentive
}