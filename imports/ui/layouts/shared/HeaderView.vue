<template>
    <v-app-bar app dark dense src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg">
        <v-toolbar-title>Scaffold Meteor + Vue</v-toolbar-title>
        <v-spacer></v-spacer>
        <user-logged></user-logged>
        <template v-slot:extension>
            <v-tabs v-model="optionSelected" align-with-title>
                <v-tab v-for="option in options" :key="option.title" @click="goToView(option)"      
                        v-text="option.title">
                </v-tab>
            </v-tabs>
        </template>
    </v-app-bar>
</template>

<script>
    import UserLogged from '../../components/UserLogged/UserLogged';
    
    export default {
        name: "HeaderView",
        components: {
            UserLogged
        },
        data() {
            return {
                optionSelected: 0,
                options: []
            }
        },
        created() {
            Meteor.call('user.getSystemOptions', (error, response) => {
                if (error) {
                    this.$alert.showAlertSimple('error', error.response);
                } else {
                    this.options = response.data;
                    this.updateSelectedOption(); 
                }
            })
        },
        watch: {
            '$route'() {
                this.updateSelectedOption();
            }
        },
        methods: {
            goToView(option) {
                this.$router.push({name: option.routeName});
            },
            updateSelectedOption() {
                const optionSelected = this.options.find(option => option.routeName === this.$route.name);
                this.optionSelected = optionSelected ? this.options.indexOf(optionSelected) : this.optionSelected;
            }
        },
    }
</script>

<style>

</style>