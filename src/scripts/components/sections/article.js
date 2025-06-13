export default async (Alpine) => {
    Alpine.data('article', () => ({
        init() {
            this.$nextTick(() => {
                this.initVideos();
            })
        },

        initVideos() {
            const content = this.$refs.content;
            if (!content) {
                return;
            }

            const iframes = content.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="vimeo.com"]');

            iframes.forEach(iframe => {
                if (!iframe.parentElement.classList.contains('video')) {
                    const wrapper = document.createElement('div');
                    wrapper.classList.add('video');
                    iframe.parentNode.insertBefore(wrapper, iframe);
                    wrapper.appendChild(iframe);
                }
            });
        }
    }));
};
