<template>
    <div>
        <div class="title">Establecer contraseña</div>
        <v-form @submit.prevent="setPassword">
            <v-text-field v-model="user.password" id="inputPassword"
                        :append-icon="showPass.new ? 'mdi-eye':'mdi-eye-off'"
                        :type="showPass.new ? 'text':'password'"
                        name="password" label="Nueva contraseña"
                        @click:append="showPass.new=!showPass.new"
                        autocomplete="new-password">
            </v-text-field>
            <v-text-field v-model="user.confirmPassword" id="inputConfirmPassword"
                        :append-icon="showPass.confirm ? 'mdi-eye':'mdi-eye-off'"
                        :type="showPass.confirm ? 'text':'password'"
                        name="password_confirmation" label="Confirmar contraseña"
                        @click:append="showPass.confirm=!showPass.confirm"
                        autocomplete="new-password">
            </v-text-field>
            <div class="d-flex justify-start mt-2">
                <v-btn type="submit" color="primary" rounded>Establecer</v-btn>
            </div>
        </v-form>
    </div>
</template>

<script>
    export default {
        name: "SetInitialPasword",
        data() {
            return {
                user: {
                    password: null,
                    confirmPassword: null
                },
                showPass: {
                    new: false,
                    confirm: false
                }
            }
        },
        methods: {
            setPassword() {
                const token = this.$route.params.token;
                Accounts.resetPassword(token, this.user.password, error => {
                    if (error) {
                        this.$alert.showAlertSimple('error', 'Se produjo un error al establecer la contraseña.');
                    } else {
                        this.$alert.showAlertSimple('success', 'Se establecio la contraseña exitosamente.');
                        this.$router.push({name: 'login'});
                    }
                });
            }
        },
    }
</script>

<style>

</style>