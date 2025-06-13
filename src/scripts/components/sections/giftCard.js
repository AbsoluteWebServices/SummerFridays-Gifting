export default async (Alpine) => {
    Alpine.data('giftCard', () => ({
        tab: 1,
        send_at: 'now',
        date: null,

        get formattedDate() {
            const {date} = this;
            if (!date) {
                return '';
            }

            const dateObj = new Date(date);
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return dateObj.toLocaleDateString('en-US', options);
        },
        
        async init() {
            this.initDateField();
        },

        initDateField() {
            const {giftCardDateInput} = this.$refs;
            if (!giftCardDateInput) {
                return;
            }

            this.$watch('send_at', () => {
                if (this.send_at === 'schedule') {
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');

                    this.date = `${year}-${month}-${day}`;

                    giftCardDateInput.showPicker();
                    return;
                }

                this.date = null;
            })
        }
    }));
};