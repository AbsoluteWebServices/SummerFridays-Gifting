import { formatMoney as formatMoneyShopify } from '@shopify/theme-currency';

const formatMoney = (amount) => {
    return amount ? formatMoneyShopify(amount).replace('.00', '') : 'FREE';
}

const randomKey = () => {
  let key = ''

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 8; i++) {
    key += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return key
}

const isEmailValid = (email) => {
  return /^.+@.+\..+$/.test(email)
}

const phoneNumber = (phone) => {
  let p = phone;

  if (!p) {
    return null;
  }

  p = p.replaceAll(' ', '');
  p = p.replaceAll('-', '');
  p = p.replaceAll('(', '');
  p = p.replaceAll(')', '');

  if (!p) {
    return null;
  }

  const country_code = p.slice(0, 2) == '+1' ? true : false;

  if (!country_code) {
    p = '+1' + p;
  }

  return p;
}

const isPhoneValid = (phone) => {
  return /^\+1\d+$/.test(phone)
}

const debounce = (fn, wait) => {
  let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const setArrowsPosition = (
  slider, 
  arrowsSeslector = '[data-swiper-next], [data-swiper-prev]', 
  containersSelector = '.product-card__media-wrapper'
) => {
  if (!slider) {
      return;
  }

  const arrows = slider?.querySelectorAll(arrowsSeslector);
  if (!arrows) {
      return;
  }

  if (!arrows?.length) {
      return;
  }

  const mediaContainers = slider?.querySelectorAll(containersSelector);
  if (!mediaContainers?.length) {
      return;
  }

  const highestMediaContainer = Array.from(mediaContainers).reduce((a, b) => a.clientHeight > b.clientHeight ? a : b);
  const top = highestMediaContainer.clientHeight / 2;

  arrows?.forEach((el) => {
      el.style.top = `${ top }px`;
  });
}

const loadJS = async (src = '') => {
  if (!src) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export { 
  formatMoney,
  randomKey,
  isEmailValid,
  isPhoneValid,
  phoneNumber,
  debounce,
  setArrowsPosition,
  loadJS,
}