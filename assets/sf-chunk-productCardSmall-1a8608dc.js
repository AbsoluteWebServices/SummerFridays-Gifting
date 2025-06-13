import{_ as o}from"./sf-index-c0d09c9b.js";const m=async s=>{s.data("productCardSmall",(u,d=1,r=[])=>({initialized:!1,variantId:null,priceModifier:d,selling_plan:r[0]||null,selling_plans:r,data:null,swatchesSlider:null,init(){this.variantId=u},async initSwatchesSlider(){const e=this.$refs.swatchesSlider;if(!e)return;const{default:t}=await o(()=>import("./sf-chunk-swiper-39539a76.js"),["./sf-chunk-swiper-39539a76.js","./sf-chunk-utils-a346f4ef.js"],import.meta.url);this.slider=new t(e,{slidesPerView:5.75,spaceBetween:14,maxBackfaceHiddenSlides:1,noSwipingClass:"swiper-no-swiping--nested",nested:!0})},updateProductCard(e){this.data=e,this.updateMainMedia()},updateMainMedia(){if(!this.data)return;const{main_media:e=null}=this.data;if(!e)return;const t=this.$refs.mainMedia;if(!t)return;const{type:i}=e,n=t.querySelector("img");if(i==="image"&&i===(n?"image":null)){const{image_url:a=null}=e;if(!a)return;n.src=`${a}&width=200`;return}const l=this.mediaHTML(e);l&&(t.innerHTML=l)},mediaHTML(e){if(!e)return null;const{type:t=null}=e;if(!t)return null;if(t==="video"){const{video_url:i=null}=e;return i?`
                    <video
                        class="absolute-img"
                        autoplay
                        playsinline 
                        muted 
                        loop
                        <source src="${i}" type="video/mp4">
                    >
                `:null}if(t==="image"){const{image_url:i=null}=e;return i?`
                    <img
                        class="absolute-img"
                        src="${i}&width=200"
                        height="100"
                        width="100"
                        alt="${e.alt||"Image"}"
                    >
                `:null}return null}}))};export{m as default};
