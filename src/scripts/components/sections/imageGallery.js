export default async (Alpine) => {
    Alpine.data('imageGallery', () => ({
        slider: null,

        async initSlider() {
            const sliderEl = this.$refs.slider;
            if (!sliderEl) {
                return;
            }

            const { default: Swiper } = await import('swiper');
            const { Navigation } = await import('swiper/modules');

            const nextEl = '[data-swiper-next]';
            const prevEl = '[data-swiper-prev]';
 
            this.slider = new Swiper(sliderEl, {
                slidesPerView: 1.35,
                spaceBetween: 18,
                modules: [Navigation],
                draggable: true,
                allowTouchMove: true,
                maxBackfaceHiddenSlides: 1,
                ...(nextEl && prevEl ? {
                    navigation: {
                        nextEl,
                        prevEl
                    },
                } : {}),
                breakpoints: {
                    576: {
                        slidesPerView: 2.35,
                    },
                    1024: {
                        slidesPerView: 3.35,
                    },
                    1280: {
                        slidesPerView: 4.2,
                    },
                    1536: {
                        slidesPerView: 5.2,
                    }
                }
            });
        },

        initSpirit(embeddedScript) {
            embeddedScript = embeddedScript.replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&quot;', '\"');

            const doc = new DOMParser().parseFromString(embeddedScript, 'text/html');
            const parsedScript = doc.getElementsByTagName('script')[0];
            const newScript = document.createElement('script');

            for (let i = 0; i < parsedScript.attributes.length; i++) {
                const attr = parsedScript.attributes[i];

                newScript.setAttribute(attr.name, attr.value)
            }

            this.$el.append(newScript);
        },

        async initSpiritAPI(spiritGalleryID, limit = 10, force = false) {
            if (!spiritGalleryID) {
                return;
            }

            const dashhudsonBrandID = Alpine.store('Global')?.settings?.dashhudson_brand_id || null;
            if (!dashhudsonBrandID) {
                return;
            }

            const url = `https://service.summerfridays.com/dashhudson/index.php?brand_id=${ dashhudsonBrandID }&gallery_id=${ spiritGalleryID }&limit=${ limit }${ force ? '&force=true' : '' }&action=getGallery`;

            try {
                const response = await fetch(url).then((res) => res.json());
                if (!response) {
                    return;
                }

                const {data} = response;
                if (!data?.length) {
                    return;
                }

                if (data.length !== limit) {
                    return;
                }

                const els = this.$el.querySelectorAll('[data-spirit-image-container]');
                if (!els?.length) {
                    return;
                }

                if (els.length !== data.length) {
                    return;
                }

                els.forEach((el, index) => {
                    const media = data[index];
                    if (!media) {
                        return;
                    }

                    const type = media.type || 'IMAGE';

                    switch (type) {
                        case 'IMAGE':
                            const image = media.image?.sizes?.medium_square;
                            if (!image?.url) {
                                return;
                            }
        
                            el.innerHTML = `
                                <img 
                                    src="${ image.url }"
                                    width="${ image.width || 640 }"
                                    height="${ image.height || 640 }"
                                    alt="SummerFridays beauty gallery ${index}"
                                    class="absolute-img"
                                >
                            `;
                            break;

                        case 'VIDEO':
                            const video = media.video?.sizes?.original;
                            if (!video?.url) {
                                return;
                            }
        
                            el.innerHTML = `
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                >
                                    <source src="${ video.url }" type="video/mp4">
                                </video>
                            `;
                            break;
                    }
                    

                    el.classList.remove('skeleton');
                });

                this.initSlider();
            } catch (error) {
                console.error(`Error fetching Dashhudson gallery: ${ error }`);
            }
            
        }
    }));
};
