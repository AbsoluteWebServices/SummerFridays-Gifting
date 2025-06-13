import Cookies from 'js-cookie';

const NEWSLETTER_POPUP_COOKIE = 'newsletter-popup';

export default async (Alpine) => {
    Alpine.data('newsletterPopup', (id = '', delay = 5, hide_days = 7) => ({
        id,
        delay,
        hide_days,

        init() {
            const {id, delay, hide_days} = this;
            if (!id) {
                return;
            }

            document.addEventListener('modal:closed', (e) => {
                const modal_id = e.detail?.id;
                if (!modal_id) {
                    return;
                }
    
                if (id !== modal_id) {
                    return;
                }
    
                Cookies.set(NEWSLETTER_POPUP_COOKIE, true, { expires: hide_days });
            }); 

            const cookie = Cookies.get(NEWSLETTER_POPUP_COOKIE);
            if (cookie) {
                return;
            }

            const e = new CustomEvent('modal:open', {
                detail: { id }
            });

            setTimeout(() => {
                document.dispatchEvent(e);
            }, (delay * 1000));
        }
    }));
};
