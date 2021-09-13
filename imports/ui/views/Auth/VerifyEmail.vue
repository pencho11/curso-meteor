<template>
    <div align="center">
        <div v-if="loading">
            <h3>Cargando datos. . .</h3>
        </div>
        <div v-else>
            <v-icon size="120" :color="status?'green':'red'">
                {{ status ? 'mdi-check-circle' : 'mdi-cancel' }}
            </v-icon>
            <h3 class="text-wrap">
                {{ message }}
                <small v-text="description"></small>
            </h3>
            <v-btn :to="{name: 'login'}" color="primary">
                Regresar a login
            </v-btn>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'VerifyEmail',
        data() {
            return {
                loading: true,
                status: false,
                message: null,
                description: null
            };
        },
        mounted() {
            const token = this.$route.params.token;
            Accounts.verifyEmail(token, error => {
                this.loading = false;
                if (error) {
                    console.error('Verify email failed', error);
                    this.message = 'Ocurrio un error al verificar tu cuenta.';
                    this.description = 'Intenta registrandote de nuevo o usando la opcion de "Olvide mi contraseña"';
                    this.status = false;
                } else {
                    this.message = 'Se ha verificado tu correo exitosamente. Ahora puedes iniciar sesion.';
                    this.status = true;
                }
            });
        },
    };
</script>

<style>

</style>