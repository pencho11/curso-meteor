export default {
    methods: {
        currentLocalDate() {
            const date = new Date();
            const offsetMs = date.getTimezoneOffset() * 60 * 1000;
            const msLocal = date.getTime() - offsetMs;
            return new Date(msLocal);
        }
    },
}