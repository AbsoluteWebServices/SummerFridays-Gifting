import{_ as h}from"./sf-index-c0d09c9b.js";import{l as p}from"./sf-chunk-klaviyo-210bc1c5.js";import"./sf-chunk-main-179c6691.js";const u=/(\p{Extended_Pictographic}|\p{Emoji_Component})/u,w="Emojis are not supported.",v=async c=>{c.data("product",d=>({handle:d,product:null,variant:null,variantId:null,sellingPlan:null,sellingPlanId:null,purchaseType:"onetime",slider:null,thumbSlider:null,sliderActiveIndex:0,totalMediaCount:0,quantity:1,showStickyATCBar:!1,popup:"",validationError:"",async init(){d&&(this.$watch("quantity",()=>{this.updateQty()}),this.$watch("showStickyATCBar",()=>{this.showStickyATCBar?(document.body.classList.add("sticky-atc-bar-active"),this.updateUserwayWidgetButton(8)):(document.body.classList.remove("sticky-atc-bar-active"),this.updateUserwayWidgetButton(2))}),this.initStickyATCBar(),document.addEventListener("cart:updated",this.updateQty.bind(this)),this.setVariantId(),await this.initProduct(d),this.product&&(this.$watch("purchaseType",i=>{this.onPurchaseTypeChange(i)}),this.setVariant(this.product.variant_default_id),this.$watch("variant",i=>{this.onVariantChange(i)}),this.setDefaultSellingPlan(),this.purchaseType="onetime",this.registerPopupListeners(),this.initKlaviyo()))},async initKlaviyo(){var s,a;await p(),window.klaviyo=window.klaviyo||[],window.klaviyo.init({account:(a=(s=c.store("Global"))==null?void 0:s.settings)==null?void 0:a.klaviyo_company_id,list:"Xcp8cA",platform:"shopify"});const{product:i}=this;if(!i)return;const e=this.variant||(this.product.variants||[]).find(n=>n.id===i.variant_default_id);e&&(window.item={Name:i.title,ProductID:i.id,Categories:i.collections,Brand:i.vendor,Price:window.Shopify.formatMoney(e.price),CompareAtPrice:window.Shopify.formatMoney(e.compare_at_price||0),ImageURL:i.image_url,URL:i.url},window._learnq=window._learnq||[],window._learnq.push(["track","Viewed Product",window.item]),window._learnq.push(["trackviewedItem",{Title:window.item.Name,ItemId:window.item.ProductID,Categories:window.item.Categories,ImageUrl:window.item.ImageURL,Url:window.item.URL,Metadata:{Brand:window.item.Brand,Price:window.item.Price,CompareAtPrice:window.item.CompareAtPrice}}]),document.addEventListener("cart:added",()=>{const{cart:n}=c.store("Cart")||{};if(!n)return;let r={total_price:n.total_price/100,$value:n.total_price/100,total_discount:n.total_discount,original_total_price:n.original_total_price,items:n.items};window.item&&(window.item.Price=e.price/100,r=Object.assign(r,window.item)),_learnq.push(["track","Added to Cart",r])}))},validateInputs(){const{giftName:i,giftEmail:e,giftMessage:s}=this.$refs;if([u.test(i.value||""),u.test(e.value||""),u.test(s.value||"")].includes(!0)){this.validationError=w;return}this.validationError=""},updateUserwayWidgetButton(i=2){const e=document.querySelector(".uwy.userway_p5 .userway_buttons_wrapper");e&&(e.style.bottom=`${i}rem`)},async initProduct(i){try{const e=new URLSearchParams;e.set("view","object"),this.variantId&&e.set("variant",this.variantId);const s=await fetch(`/products/${i}?${e.toString()}`).then(a=>a.json());this.product=s}catch(e){console.error(`Error fetching a product: ${e}`)}},initStickyATCBar(){const i=document.getElementById("stickyATCBar");if(!i)return;const e=a=>{a.forEach(n=>{n.isIntersecting?this.showStickyATCBar=!1:this.showStickyATCBar=window.innerWidth<1280})},s=()=>{var t;const n=`-${((t=document.getElementById("shopify-section-header"))==null?void 0:t.offsetHeight)||0}px`;new IntersectionObserver(e,{rootMargin:n,threshold:0}).observe(i)};s(),window.addEventListener("resize",()=>{s()})},registerPopupListeners(){document.body.addEventListener("click",async i=>{var r;const e=(r=i.target)==null?void 0:r.closest("button");if(!e)return;const s=e.dataset.productPopup||null;if(!s)return;i.preventDefault(),this.popup=s;const a="nm-cs",n=new CustomEvent("modal:open",{detail:{id:a}});document.dispatchEvent(n)})},price(){if(!this.variant)return null;const{price:e}=this.variant;if(!e)return null;if(this.purchaseType==="subscription"){const{sellingPlan:s}=this;if(!s)return e;const{price_modifier:a}=s;return a?e*a:e}return e},updateQty(){if(!this.quantity||this.quantity<1){this.quantity=1;return}if(this.quantity>this.maxQty()){this.quantity=this.maxQty()||1;return}},optionValueByPosition(i){if(!this.variant)return;const{options:e}=this.variant;if(e!=null&&e.length)return e[i||0]},setVariantId(){var s;const i=new URL(((s=window==null?void 0:window.location)==null?void 0:s.href)||"/");if(!i)return;const e=i.searchParams.get("variant");e&&(this.variantId=+e)},setVariant(i){if(!i||!this.product)return;const{variants:e}=this.product;if(!(e!=null&&e.length))return;const s=e.find(a=>a.id===i);s&&(this.variant=s)},onVariantChange(){this.variantId=this.variant.id,this.updateMedia(),this.updateURL(),this.updateItem()},updateItem(){window.item&&(window.item.Price=window.Shopify.formatMoney(this.variant.price),window.item.CompareAtPrice=window.Shopify.formatMoney(this.variant.compare_at_price||0))},updateMedia(){var t;if(!((t=this.variant)!=null&&t.title))return;const{product:i}=this;if(!i)return;const{custom_media:e,media:s}=i,a=this.variant.media;if(!(a!=null&&a.length)&&!(s!=null&&s.length)&&!(e!=null&&e.length))return;const n=(e||[]).filter(o=>!o.alt.includes("-exclude-")&&[!o.alt,o.alt.includes("-include-"),o.alt===this.variant.title,o.alt===i.title].includes(!0)),r=(s||[]).filter(o=>!o.alt.includes("-exclude-")&&[!o.alt,o.alt.includes("-include-"),o.alt===this.variant.title,o.alt===i.title].includes(!0));this.totalMediaCount=n.length+r.length,this.updateThumbs(a,n,r),this.updateMainSlider(a,n,r),this.thumbSlider&&this.slider&&this.initSliders()},updateThumbs(i,e,s){const a=this.$refs.thumbSlider;if(!a)return;const n=a.querySelector(".swiper-wrapper");if(!n)return;if(!(i!=null&&i.length)&&!(s!=null&&s.length)&&!(e!=null&&e.length)){a.style.display="none";return}let r="";if(i!=null&&i.length){i.forEach(t=>{r+='<div class="swiper-slide">',t.media_type==="image"?t.src&&(r+=`
                                    <img
                                        src="${t.src}&width=260"
                                        width="130"
                                        height="130"
                                        class="absolute-img"
                                        alt="${t.alt||this.product.title}"
                                    >
                                `):t.media_type==="video"&&(t.preview_image?r+=`
                                    <img
                                        src="${t.preview_image}&width=260"
                                        width="130"
                                        height="130"
                                        class="absolute-img"
                                        alt="${t.alt||this.product.title}"
                                    >
    
                                    <svg class="icon icon-play-round icon-play-thumbnail" aria-label="Play">
                                        <use xlink:href="#play-round"></use>
                                    </svg>
                                `:t.src&&(r+=`
                                    <video
                                        class="absolute-img" 
                                        autoplay
                                        playsinline 
                                        muted 
                                        loop
                                    >
                                        <source src="${t.src}" type="video/mp4">
                                    </video>
                                `)),r+="</div>"}),n.innerHTML=r;return}(e||[]).forEach(t=>{r+='<div class="swiper-slide">';let o=t.bg_media_type==="image"?t.bg_src:t.bg_preview_image;o&&(r+=`
                            <img
                                src="${o}&width=260"
                                width="130"
                                height="130"
                                class="absolute-img product-custom-media__bg"
                                alt="${t.alt||this.product.title}"
                            >
                        `);let l=t.main_media_type==="image"?t.main_src:t.main_preview_image;l&&(r+=`
                            <img
                                src="${l}&width=260"
                                width="130"
                                height="130"
                                class="absolute-img product-custom-media__bg"
                                alt="${t.alt||this.product.title}"
                            >
                        `),r+="</div>"}),(s||[]).forEach(t=>{r+='<div class="swiper-slide">',t.media_type==="image"?t.src&&(r+=`
                                <img
                                    src="${t.src}&width=260"
                                    width="130"
                                    height="130"
                                    class="absolute-img"
                                    alt="${t.alt||this.product.title}"
                                >
                            `):t.media_type==="video"&&(t.preview_image?r+=`
                                <img
                                    src="${t.preview_image}&width=260"
                                    width="130"
                                    height="130"
                                    class="absolute-img"
                                    alt="${t.alt||this.product.title}"
                                >

                                <svg class="icon icon-play-round icon-play-thumbnail" aria-label="Play">
                                    <use xlink:href="#play-round"></use>
                                </svg>
                            `:t.src&&(r+=`
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                >
                                    <source src="${t.src}" type="video/mp4">
                                </video>
                            `)),r+="</div>"}),n.innerHTML=r},updateMainSlider(i,e,s){const a=this.$refs.slider;if(!a)return;const n=a.querySelector(".swiper-wrapper");if(!n)return;if(!(i!=null&&i.length)&&!(s!=null&&s.length)&&!(e!=null&&e.length)){a.style.display="none";return}let r="";if(i!=null&&i.length){i.forEach(t=>{r+='<div class="swiper-slide">',t.media_type==="image"?t.src&&(r+=`
                                    <img
                                        srcset="
                                            ${t.src}&width=375 375w,
                                            ${t.src}&width=550 550w,
                                            ${t.src}&width=750 750w,
                                            ${t.src}&width=1100 1100w,
                                            ${t.src}&width=1500 1500w,
                                            ${t.src}&width=1780 1780w,
                                            ${t.src}&width=2000 2000w,
                                            ${t.src} 2000w
                                        "
                                        sizes="100vw"
                                        width="1000"
                                        height="1000"
                                        class="absolute-img"
                                        alt="${t.alt||this.product.title}"
                                    >
                                `):t.media_type==="video"&&t.src&&(r+=`
                                    <video
                                        class="absolute-img" 
                                        autoplay
                                        playsinline 
                                        muted 
                                        loop
                                        poster="${t.preview_image?t.preview_image:""}"
                                    >
                                        <source src="${t.src}" type="video/mp4">
                                    </video>
                                `),r+="</div>"}),n.innerHTML=r;return}(e||[]).forEach(t=>{r+='<div class="swiper-slide">',t.bg_media_type==="image"?t.bg_src&&(r+=`
                                <img
                                    srcset="
                                        ${t.bg_src}&width=375 375w,
                                        ${t.bg_src}&width=550 550w,
                                        ${t.bg_src}&width=750 750w,
                                        ${t.bg_src}&width=1100 1100w,
                                        ${t.bg_src}&width=1500 1500w,
                                        ${t.bg_src}&width=1780 1780w,
                                        ${t.bg_src}&width=2000 2000w,
                                        ${t.bg_src} 2000w
                                    "
                                    sizes="100vw"
                                    width="1000"
                                    height="1000"
                                    class="absolute-img"
                                    alt="${t.alt||this.product.title}"
                                >
                            `):t.bg_media_type==="video"&&t.bg_src&&(r+=`
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                    poster="${t.bg_preview_image?t.bg_preview_image:""}"
                                >
                                    <source src="${t.bg_src}" type="video/mp4">
                                </video>
                            `),t.main_media_type==="image"?t.main_src&&(r+=`
                                <img
                                    srcset="
                                        ${t.main_src}&width=375 375w,
                                        ${t.main_src}&width=550 550w,
                                        ${t.main_src}&width=750 750w,
                                        ${t.main_src}&width=1100 1100w,
                                        ${t.main_src}&width=1500 1500w,
                                        ${t.main_src}&width=1780 1780w,
                                        ${t.main_src}&width=2000 2000w,
                                        ${t.main_src} 2000w
                                    "
                                    sizes="100vw"
                                    width="1000"
                                    height="1000"
                                    class="absolute-img"
                                    alt="${t.alt||this.product.title}"
                                >
                            `):t.main_media_type==="video"&&t.main_src&&(r+=`
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                    poster="${t.main_preview_image?t.main_preview_image:""}"
                                >
                                    <source src="${t.main_src}" type="video/mp4">
                                </video>
                            `),r+="</div>"}),(s||[]).forEach(t=>{r+='<div class="swiper-slide">',t.media_type==="image"?t.src&&(r+=`
                                <img
                                    srcset="
                                        ${t.src}&width=375 375w,
                                        ${t.src}&width=550 550w,
                                        ${t.src}&width=750 750w,
                                        ${t.src}&width=1100 1100w,
                                        ${t.src}&width=1500 1500w,
                                        ${t.src}&width=1780 1780w,
                                        ${t.src}&width=2000 2000w,
                                        ${t.src} 2000w
                                    "
                                    sizes="100vw"
                                    width="1000"
                                    height="1000"
                                    class="absolute-img"
                                    alt="${t.alt||this.product.title}"
                                >
                            `):t.media_type==="video"&&t.src&&(r+=`
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                    poster="${t.preview_image?t.preview_image:""}"
                                >
                                    <source src="${t.src}" type="video/mp4">
                                </video>
                            `),r+="</div>"}),n.innerHTML=r},updateURL(){var e,s,a;const i=new URL(((e=window==null?void 0:window.location)==null?void 0:e.href)||"/");i&&((s=i==null?void 0:i.searchParams)==null||s.set("variant",this.variantId),(a=window==null?void 0:window.history)==null||a.replaceState({},"",i))},onPurchaseTypeChange(i){if(i==="subscription"){this.setSellingPlanId();return}this.sellingPlanId=null},setSellingPlanId(){var i;this.sellingPlanId=(i=this.sellingPlan)==null?void 0:i.id},setDefaultSellingPlan(){if(this.sellingPlan)return;const{selling_plans:i}=this.product;i!=null&&i.length&&(this.sellingPlan=i[0])},selectSelectPlan(i){if(!i)return;const{selling_plans:e}=this.product;if(!(e!=null&&e.length))return;const s=e.find(a=>a.id===i);s&&(this.sellingPlan=s,this.sellingPlanId=s.id)},async initSliders(){const i=this.$refs.slider;if(!i)return;const{default:e}=await h(()=>import("./sf-chunk-swiper-39539a76.js"),["./sf-chunk-swiper-39539a76.js","./sf-chunk-utils-a346f4ef.js"],import.meta.url),{Navigation:s,Thumbs:a}=await h(()=>import("./sf-chunk-index-2e390332.js"),["./sf-chunk-index-2e390332.js","./sf-chunk-utils-a346f4ef.js"],import.meta.url),n=this.$refs.thumbSlider;n&&(this.thumbSlider=new e(n,{direction:"vertical",slidesPerView:"auto",loop:!1,draggable:!0,allowTouchMove:!0,maxBackfaceHiddenSlides:1}));const r=this.thumbSlider?{swiper:this.thumbSlider}:null,t=i.querySelector("[data-swiper-next]"),o=i.querySelector("[data-swiper-prev]");this.slider=new e(i,{spaceBetween:2,loop:!0,modules:[s,a],draggable:!0,allowTouchMove:!0,maxBackfaceHiddenSlides:1,thumbs:r,...t&&o?{navigation:{nextEl:t,prevEl:o}}:{},on:{slideChange:l=>{this.sliderActiveIndex=l.realIndex}}})},goToNextThumb(){this.slider&&this.slider.slideNext()}}))};export{v as default};
