<template>
    <v-menu offset-y>
        <template v-slot:activator="{on}">
            <v-btn color="default" dark text v-on="on" class="mr-5">
                {{ user.username }}
                <v-icon>keyboard_arrow_down</v-icon>
            </v-btn>
        </template>
        <v-list>
            <v-list-item :to="{name:'home.account'}">Cuenta</v-list-item>
            <v-list-item @click="closeSession">Cerrar sesion</v-list-item>
        </v-list>
    </v-menu>
</template>

<script>
    import {mapMutations} from 'vuex';
    export default {
        name: "UserLogged",
        data() {
            return {
                user: {
                    username: null
                },
                onLogoutHook: null
            };
        },
        created() {
            this.setSession();
        },
        mounted() {
            this.$root.$on('setUserLogged', () => {
                this.setSession();
            });
            this.onLogoutHook = Accounts.onLogout( () => {
                this.closeFrontSession();
            });
        },
        methods: {
            ...mapMutations('auth', ['logout']),
            closeSession () {
                this.onLogoutHook.stop();
                Meteor.logout();
                this.logout();
                this.$router.push({ name: 'login' });
            },
            closeFrontSession () {
                this.onLogoutHook.stop();
                this.logout();
                this.$router.push({ name: 'login' });
            },
            setSession () {
                if (Meteor.userId() !== null) {
                    this.user = this.$store.state.auth.user;
                } else {
                    this.closeSession();
                }
            }
        }
    };
</script>

<style>

</style>