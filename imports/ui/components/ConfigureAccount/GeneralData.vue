<template>
    <v-form @submit.prevent="saveUser">
        <v-card>
            <v-card-title>
                <div class="subtitle-2">
                    DATOS GENERALES
                </div>
            </v-card-title>
            <v-row>
                <v-col cols="12" sm="12" md="3" lg="3" class="pl-10">
                    <img :src="user.profile.path || '/img/user.png'" :alt="user.profile.name" width="100px">
                    <v-file-input v-show="false" ref="imageFile" v-model="file" accept="image/png, image/jpeg, image/bmp">
                    </v-file-input>
                    <v-btn color="primary" class="mb-5 mt-5" width="100%" rounded depressed 
                            @click="onClickUploadButton">
                        <span v-if="user.profile.path">Cambiar</span>
                        <span v-else>Cargar</span>
                    </v-btn>
                </v-col>
                <v-col cols="12" sm="12" md="9" lg="9">
                    <v-card-text>
                        <v-text-field v-model="user.profile.name" id="inputName" name="name"  
                                    label="Nombre completo">
                        </v-text-field>
                        <v-text-field v-model="user.username" id="inputUsername" name="username"            
                                    label="Usuario">
                        </v-text-field>
                        <v-text-field v-model="user.emails[0].address" id="inputEmail" name="email"  
                                    label="Correo electronico">
                        </v-text-field>
                        <div class="d-flex justify-center">
                            <v-btn type="submit" color="primary" rounded depressed>
                                Guardar
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-col>

            </v-row>
        </v-card>
    </v-form>
</template>

<script>
    import { mapMutations } from 'vuex';
    import uploadImage from '../../mixins/users/uploadImage';
    
    export default {
        name: "GeneralData",
        mixins: [uploadImage],
        data() {
            return {
                user: {
                    _id: null,
                    username: null,
                    emails: [{ address: null, verified: false }],
                    profile: {
                        profile: null,
                        name: null,
                        path: null
                    }
                }
            };
        },
        created() {
            const user = this.$store.state.auth.user;
            this.user = {
                _id: user._id,
                username: user.username,
                emails: user.emails,
                profile: user.profile,
            };
        },
        methods: {
            ...mapMutations('auth', ['setUser']),
            saveUser() {
                this.$loader.activate('Actualizando datos. . .');
                Meteor.call('user.updatePersonalData', {user: this.user, photoFileUser: this.photoFileUser}, (error, response) => {
                    this.$loader.desactivate();
                    if (error) {
                        this.$alert.showAlertSimple('error', error.reason);
                    } else {
                        this.setUser(Meteor.user());
                        this.$root.$emit('setUserLogged');
                        this.$alert.showAlertSimple('success', response.message);
                    }
                });
            }
        },
    }
</script>

<style>

</style>