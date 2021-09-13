<template>
    <div>
        <div class="d-flex flex-row justify-start">
            <v-btn color="primary" icon :to="{name:'login'}">
                <v-icon>arrow_back</v-icon>
            </v-btn>
            <div class="title">Olvidé mi contraseña</div>
        </div>
        <v-form @submit.prevent="forgotPassword">
            <v-text-field v-model="user.email" id="inputEmail" name="email" type="email"
                            label="Correo electronico">

            </v-text-field>
            <v-btn type="submit" color="primary" rounded>Recuperar</v-btn>
        </v-form>
    </div>
</template>

<script>
    export default {
        name: "ForgotPassword",
        data() {
            return {
                user: {
                    email: null
                }
            }
        },
        methods: {
            forgotPassword() {
                Accounts.forgotPassword(this.user, error => {
                    if (error) {
                        console.error('Error sending email: ', error);
                        this.$alert.showAlertSimple('error', 'Ocurrio un error al enviar el correo');
                    } else {
                        this.$alert.showAlertSimple('success', 'Correo enviado! Por favor abra su correo electronico y haga click en el enlace del mensaje que le enviamos');
                        setTimeout(() => {
                           this.$router.push({name: login}); 
                        }, 5000);
                    }
                });
            }
        },
    }
</script>

<style>

</style>