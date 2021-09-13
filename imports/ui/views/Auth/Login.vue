<template>
    <div class="login-wrapper">
        <div class="tittle secondary--text">Bienvenido!</div>
        <div class="display-1 mb-0 secondary--text">Iniciar sesión</div>
        <v-form @submit.prevent="Login" aria-autocomplete="none">
            <v-text-field id="inputUser" v-model="user.userOrEmail" autocompete="off"
                    label="Usuario" name="email" prepend-icon="person" color="primary" type="text">
            </v-text-field>
            <v-text-field id="inputPassword" label="Contraseña" name="password" 
                    prepend-icon="lock" v-model="user.password" type="password">                
            </v-text-field>
            <div class="d-flex justify-end">
                <v-btn color="primary" text :to="{name:'forgotPassword'}" small>¿Olvide mi Contraseña?</v-btn>
            </div>
            <div class="d-flex justify-start">
                <v-btn type="submit" rounded color="primary" transition="fade">Entrar</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script>
import {mapMutations} from 'vuex';
    export default {
        name: "Login",
        data() {
            return {
                user: {
                    userOrEmail: null,
                    password: null
                }
            }
        },
        methods: {
            ...mapMutations('auth', ['setUser']),
            Login() {
                Meteor.loginWithPassword(this.user.userOrEmail, this.user.password, error => {
                    if (error) {
                        console.error('Error in login', error);
                        if (error.error === '403') {
                            this.$alert.showAlertFull('mdi-close-circle', 'warning', error.reason, 
                                        '', 5000, 'center', 'bottom');
                        } else {
                            this.$alert.showAlertSimple('error', 'Credenciales incorrectas');
                        }
                     } else {
                         Meteor.logoutOtherClients( err => {
                             console.error('Error al cerrar sesion en otros clientes', err);
                         });
                         this.setUser(Meteor.user());
                        this.$router.push({name: 'home'});
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-wrapper {
        margin-top: 45px;
    }
</style>