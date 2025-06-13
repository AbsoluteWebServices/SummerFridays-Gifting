import { loadJS } from '@/scripts/utils/helpers';

const SRC = 'https://cmp.osano.com/16BYCOTdxwDWV1YqE/8cc858fc-82ed-4599-aea0-801d4138bb67/osano.js';

const loadOsano = async () => {
    try {
        await loadJS(SRC);
    } catch (error) {
        console.error(`Error loading Osano: ${ error }`);
    }
};

async function initOsanoToggle() {
    await loadOsano();

    window.Shopify.loadFeatures([{
        name: "consent-tracking-api",
        version: "0.1"
    }], function (error) {
    });

    window.Osano.cm.ready("shopify");

    const toggleBtn = document.querySelector('a[href="#toggle-osano-cookies"]');
    if (!toggleBtn) {
      return
    }
  
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault()
  
      if (typeof window.Osano?.cm?.showDrawer !== 'function') {
        return
      }
  
      window.Osano.cm.showDrawer('osano-cm-dom-info-dialog-open')
    })

}

initOsanoToggle()