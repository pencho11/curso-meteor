<template>
    <v-app>
        <router-view name="allPageView"></router-view>
        <alert-message/>
        <loader/>
    </v-app>
</template>

<script>
    import AlertMessage from './components/utilities/Alerts/AlertMessage';
    import Loader from './components/utilities/Loaders/Loader';
    export default {
        name: "App",
        components: {
            AlertMessage,
            Loader
        }
    }
</script>

<style>
   
</style>