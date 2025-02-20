import Alpine from 'alpinejs';
import {
    disableBodyScroll,
    enableBodyScroll,
} from 'body-scroll-lock-upgrade';

Alpine.data('modal', (id = '') => ({
    opened: false,
    container: null,
    id,

    init() {
        this.container = this.$el;
        
        document.addEventListener('modal:open', (e) => {
            const id = e.detail?.id;
            if (!id) {
                return;
            }

            if (id !== this.id) {
                return;
            }

            this.open();
        });
    },

    handleClose(event) {
        if (!event) {
            return;
        }

        const {target} = event;
        if (!target) {
            return;
        }

        const container = target.closest('[data-modal-container]');
        if (container) {
            return;
        }

        this.close();
    },

    open() {
        const {container} = this;
        if (!container) {
            return;
        }

        if (this.opened) {
            return;
        }

        this.opened = true;

        disableBodyScroll(container, {
            allowTouchMove(el) {
                while (el && el !== document?.body) {
                    if (el.getAttribute('data-allow-scroll') !== null) {
                        return true;
                    }

                    el = el?.parentElement;
                }

                return false;
            }
        });
    },

    close() {
        const {id, container} = this;
        if (!container) {
            return;
        }

        if (!this.opened) {
            return;
        }

        this.opened = false;

        const elsAllowedToScroll = [
            container,
            ...Array.from(container.querySelectorAll('[data-allow-scroll]'))
        ];

        enableBodyScroll(container);

        if (!id) {
            return;
        }

        const e = new CustomEvent('modal:closed', {
            detail: { id }
        });

        document.dispatchEvent(e);
    }
}));
