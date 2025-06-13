import{_ as v}from"./sf-index-c0d09c9b.js";const b=async p=>{p.data("imageGallery",()=>({slider:null,async initSlider(){const e=this.$refs.slider;if(!e)return;const{default:n}=await v(()=>import("./sf-chunk-swiper-39539a76.js"),["./sf-chunk-swiper-39539a76.js","./sf-chunk-utils-a346f4ef.js"],import.meta.url),{Navigation:i}=await v(()=>import("./sf-chunk-index-2e390332.js"),["./sf-chunk-index-2e390332.js","./sf-chunk-utils-a346f4ef.js"],import.meta.url),t="[data-swiper-next]",r="[data-swiper-prev]";this.slider=new n(e,{slidesPerView:1.35,spaceBetween:18,modules:[i],draggable:!0,allowTouchMove:!0,maxBackfaceHiddenSlides:1,navigation:{nextEl:t,prevEl:r},breakpoints:{576:{slidesPerView:2.35},1024:{slidesPerView:3.35},1280:{slidesPerView:4.2},1536:{slidesPerView:5.2}}})},initSpirit(e){e=e.replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&quot;",'"');const i=new DOMParser().parseFromString(e,"text/html").getElementsByTagName("script")[0],t=document.createElement("script");for(let r=0;r<i.attributes.length;r++){const l=i.attributes[r];t.setAttribute(l.name,l.value)}this.$el.append(t)},async initSpiritAPI(e,n=10,i=!1){var l,m;if(!e)return;const t=((m=(l=p.store("Global"))==null?void 0:l.settings)==null?void 0:m.dashhudson_brand_id)||null;if(!t)return;const r=`https://service.summerfridays.com/dashhudson/index.php?brand_id=${t}&gallery_id=${e}&limit=${n}${i?"&force=true":""}&action=getGallery`;try{const u=await fetch(r).then(c=>c.json());if(!u)return;const{data:s}=u;if(!(s!=null&&s.length)||s.length!==n)return;const o=this.$el.querySelectorAll("[data-spirit-image-container]");if(!(o!=null&&o.length)||o.length!==s.length)return;o.forEach((c,g)=>{var f,y,w,_;const d=s[g];if(!d)return;switch(d.type||"IMAGE"){case"IMAGE":const a=(y=(f=d.image)==null?void 0:f.sizes)==null?void 0:y.medium_square;if(!(a!=null&&a.url))return;c.innerHTML=`
                                <img 
                                    src="${a.url}"
                                    width="${a.width||640}"
                                    height="${a.height||640}"
                                    alt="SummerFridays beauty gallery ${g}"
                                    class="absolute-img"
                                >
                            `;break;case"VIDEO":const h=(_=(w=d.video)==null?void 0:w.sizes)==null?void 0:_.original;if(!(h!=null&&h.url))return;c.innerHTML=`
                                <video
                                    class="absolute-img" 
                                    autoplay
                                    playsinline 
                                    muted 
                                    loop
                                >
                                    <source src="${h.url}" type="video/mp4">
                                </video>
                            `;break}c.classList.remove("skeleton")}),this.initSlider()}catch(u){console.error(`Error fetching Dashhudson gallery: ${u}`)}}}))};export{b as default};
