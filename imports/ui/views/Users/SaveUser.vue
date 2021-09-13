<template>
    <v-container>
        <v-row>
            <v-col> 
                <div class="headline">{{dataView.title}}</div>
            </v-col>
            <v-col cols="2">
                <v-btn block type="submit" form="saveUser" color="primary" v-text="dataView.targetButton">
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-text>
                        <v-form @submit.prevent="saveUser" id="saveUser" autocomplete="off">
                            <v-row>
                                <v-col xs="12" sm="12" md="4">
                                    <div class="d-flex flex-column align-center">
                                        <img :src="user.profile.path || '/img/user.png'" :alt="user.profile.name" width="100px">
                                        <v-file-input v-show="false" ref="imageFile" v-model="file" accept="image/png, image/jpeg, image/bmp">
                                        </v-file-input>
                                        <v-btn color="primary" class="mb-5 mt-5" width="100%" rounded depressed 
                                                @click="onClickUploadButton">
                                            <span v-if="user.profile.path">Cambiar</span>
                                            <span v-else>Cargar</span>
                                        </v-btn>
                                    </div>
                                </v-col>
                                <v-col xs="12" sm="12" md="8">
                                    <v-text-field v-model="user.profile.name" id="inputName" name="name" label="Nombre">
                                    </v-text-field>
                                    <v-select v-model="user.profile.profile" id="selectProfile" name="profile" 
                                            :items="profiles"
                                            item-text="description" item-value="name"
                                            label="Perfil">
                                    </v-select>
                                    <v-text-field v-model="user.username" id="inputUserName" name="username" label="Usuario">
                                    </v-text-field>
                                    <v-text-field v-model="user.emails[0].address" id="inputEmail" type="email" 
                                                name="email" label="Correo">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import { Profile } from '../../../api/Profiles/Profile';
    import uploadImage from '../../mixins/users/uploadImage';
    
    export default {
        name: "SaveUser",
        mixins:[uploadImage],
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
                },
                dataView: {
                    title: '',
                    targetButton: ''
                }
            }
        },
        created() {
            if(this.$router.currentRoute.name.includes("create")) {
                this.dataView.title = "Crear usuario";
                this.dataView.targetButton = "Crear";
            } else if(this.$router.currentRoute.name.includes("edit")){
                this.dataView.title = "Editar usuario";
                this.dataView.targetButton = "Actualizar";
                const tempUser = this.$store.state.temporal.element;
                this.user = {
                    _id: tempUser._id,
                    username: tempUser.username,
                    emails: tempUser.emails,
                    profile: tempUser.profile,
                };
            }
        },
        methods: {
            saveUser() {
                this.$loader.activate('Guardando usuario. . .');
                Meteor.call('user.save', {user: this.user, photoFileUser: this.photoFileUser}, (error, response) => {
                    this.$loader.desactivate();
                    if (error) {
                        this.$alert.showAlertSimple('error', error.reason);
                    } else {
                        this.$alert.showAlertSimple('success', response.message);
                        this.$router.push({ name: 'home.users' });
                    }
                });
            }
        },
        meteor: {
            $subscribe: {
                'profile.listAll': []
            },
            profiles () {
                return Profile.find().fetch();
            }
        }
    }
</script>

<style>

</style>