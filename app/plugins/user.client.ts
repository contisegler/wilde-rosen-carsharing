export default defineNuxtPlugin({
    setup(nuxtApp)  {
        const user = useUser();
        user.subscribe();
    },
    enforce: "post",
});