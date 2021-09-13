<template>
    <v-container>
        <v-row justify="center">
            <v-col xs="12" sm="8" md="6" lg="5" xl="5">
                <div class="d-flex flex-row-reverse mb-5">
                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn  color="success" v-on="on" fab dark :to="{name: 'home.profiles.create'}">
                                <v-icon>add</v-icon>
                            </v-btn>
                        </template>
                        <span>Agregar perfil</span>
                    </v-tooltip>
                </div>
                <v-data-table :headers="headers" :items="profiles" @dblclick:row="(ev, {item})=>openEditProfile(item)" sort-by="name" class="elevation-1">
                    <template v-slot:item.action="{item}">
                        <v-tooltip bottom>
                            <template  v-slot:activator="{on}">
                                <v-icon v-can:edit.hide="'profiles'" color="info" v-on="on" small class="mr-2" @click="openEditProfile(item)">
                                    edit
                                </v-icon>
                            </template>
                            <span>Editar</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{on}">
                                <v-icon v-can:delete.hide="'profiles'" color="error" v-on="on" small class="mr-2" @click="openRemoveModal(item)">
                                    delete
                                </v-icon>
                            </template>
                            <span>Eliminar</span>
                        </v-tooltip>
                    </template>
                </v-data-table>
            </v-col>
        </v-row>
        <modal-remove ref="refModalRemove" v-bind:modalData="profileTemp" @id_element="deleteProfile"></modal-remove>
    </v-container>
</template>

<script>
    import { mapMutations } from 'vuex';
    import { Profile } from '../../../api/Profiles/Profile';
    import ModalRemove from '../../components/utilities/Modals/ModalRemove.vue';
    export default {
        name: "ListProfiles",
        components: {
            ModalRemove
        },
        data() {
            return {
                headers: [
                    {value: 'description', text: 'Nombre del perfil', sortable:true},
                    {value: 'action', text: 'Opciones', sortable:false},
                ],
                profileTemp: {
                    preposition: 'el',
                    typeElement: 'perfil',
                    mainNameElement: '',
                    _id: null,
                    element: {}
                }
            }
        },
        methods: {
            ...mapMutations('temporal', ['setElement']),
            openEditProfile(profile) {
                this.setElement(profile);
                this.$router.push({name: 'home.profiles.edit'});
            },
            openRemoveModal(profile) {
                this.profileTemp.element = profile;
                this.profileTemp._id = profile._id ;
                this.profileTemp.mainNameElement = profile.description;
                this.$refs.refModalRemove.dialog = true;
            },
            deleteProfile(idProfile) {
                this.$loader.activate('Eliminando perfil. . .');
                Meteor.call('profile.delete', {idProfile}, (error, response) => {
                    this.$loader.desactivate();
                    if (error) {
                        if (error.details) {
                            this.$alert.showAlertFull('warning', 'error', error.reason, 'multi-line', 5000, 'rigth', 'bottom', error.details);
                        } else {
                            this.$alert.showAlertSimple('error', error.response);
                        }
                    } else {
                        this.$alert.showAlertSimple('success', response.message);
                    }
                })
            }
        },
        meteor: {
            $subscribe: {
                'profile.listNotStaticProfiles': []
            },
            profiles() {
                return Profile.find().fetch();
            }
        }
    }
</script>

<style>

</style> 