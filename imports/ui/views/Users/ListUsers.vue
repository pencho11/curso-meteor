<template> 
    <v-container>
        <v-row justify="center">
            <v-col xs="12" sm="12" md="10" lg="8" xl="5">                 
                <div class="d-flex flex-row-reverse mb-5">
                    <v-tooltip bottom>
                        <template v-slot:activator="{on}">
                            <v-btn  color="success" v-on="on" fab dark :to="{name: 'home.users.create'}">
                                <v-icon>add</v-icon>
                            </v-btn>
                        </template>
                        <span>Agregar usuario</span>
                    </v-tooltip>
                </div>
                <v-data-table :headers="headers" :items="users" @dblclick:row="(event,{item})=>openEditUser(item)" sort-by="name" class="elevation-1">
                    <template v-slot:item.profile.path="{item}">
                        <div class="d-flex align-center pt-5 pb-5">
                            <v-avatar>
                                <img :src="item.profile.path || '/img/user.png'" alt="Avatar">
                            </v-avatar>
                        </div>
                    </template>
                    <template v-slot:item.status.online="{item}">
                        <div class="d-flex align-center pt-5 pb-5">
                            <v-icon :color="item.status.online?'green':'red'">
                                mdi-checkbox-blank-circle
                            </v-icon>
                        </div>
                    </template>
                    <template v-slot:item.action="{item}">
                        <v-tooltip bottom>
                            <template  v-slot:activator="{on}">
                                <v-icon v-can:edit.hide="'users'" color="info" v-on="on" small class="mr-2" @click="openEditUser(item)">
                                    edit
                                </v-icon>
                            </template>
                            <span>Editar</span>
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template  v-slot:activator="{on}">
                                <v-icon v-can:delete.hide="'users'" color="error" v-on="on" small class="mr-2" @click="openRemoveModal(item)">
                                    delete
                                </v-icon>
                            </template>
                            <span>Eliminar</span>
                        </v-tooltip>
                    </template>
                    <template v-slot:body.append="{isMobile}">
                        <tr v-if="!isMobile">
                            <td></td>
                            <td></td>
                            <td>
                                <v-text-field v-model="headersFilter.name" type="text" label="Nombre"></v-text-field>
                            </td>
                            <td>
                                <v-text-field v-model="headersFilter.username" type="text" label="Usuario"></v-text-field>
                            </td>
                            <td>
                                <v-text-field v-model="headersFilter.email" type="email" label="Correo"></v-text-field>
                            </td>
                        </tr>
                    </template>
                </v-data-table>
                <modal-remove ref="refModalRemove" v-bind:modalData="userTemp" @id_element="deleteUser"></modal-remove>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import { mapMutations } from 'vuex';
    import ModalRemove  from "../../components/utilities/Modals/ModalRemove";
    
    export default {
        name: "ListUsers",
        components: {
            ModalRemove
        },
        data() {
            return {
                headersFilter: {
                    name: '',
                    username: '',
                    email: ''
                },
                userTemp: {
                    preposition: 'al',
                    typeElement: 'usuario',
                    mainNameElement: '',
                    _id: null,
                    element: {}
                }
            }
        },
        computed: {
            headers() {
                return [
                    {value: 'profile.path', text: 'Imagen', sortable: false},
                    {value: 'status.online', text: 'En linea', sortable: true},
                    {
                        value: 'profile.name', text: 'Nombre', sortable: true, filter: value => {
                            return value!=null && typeof value==='string' &&
                                    value.toString().toLocaleLowerCase()
                                    .indexOf(this.headersFilter.name.toLocaleLowerCase())!== -1;
                        }
                    },
                    {
                        value: 'username', text: 'Usuario', sortable: true, filter: value => {
                            return value!=null && typeof value==='string' &&
                                    value.toString().toLocaleLowerCase()
                                    .indexOf(this.headersFilter.username.toLocaleLowerCase())!== -1;
                        }
                    },
                    {
                        value: 'emails[0].address', text: 'Correo', sortable: true, filter: value => {
                            return value!=null && typeof value==='string' &&
                                    value.toString().toLocaleLowerCase()
                                    .indexOf(this.headersFilter.email.toLocaleLowerCase())!== -1;
                        }
                    },
                    {value: 'action', text: 'Opciones', sortable: false}
                ]
            }
        },
        methods: {
            ...mapMutations('temporal', ['setElement']),
            // updateMainView() {
            //     const currentRoute = this.$router.currentRoute.name.split('.').pop();
            //     this.activeMainView = (currentRoute === 'users');
            // },
            openEditUser(user) {
                this.setElement(user);
                this.$router.push({name: 'home.users.edit'});
            },
            openRemoveModal(user) {
                this.userTemp.element = user;
                this.userTemp._id = user._id ;
                this.userTemp.mainNameElement = user.profile.name;
                this.$refs.refModalRemove.dialog = true;
            },
            deleteUser(idUser) {
                this.$loader.activate('Eliminando usuario. . .');
                Meteor.call('user.delete', {idUser}, (error, response) => {
                    this.$loader.desactivate();
                    if (error) {
                        this.$alert.showAlertSimple('error', error.reason);
                    } else {
                        this.$alert.showAlertSimple('succes', response.message);
                    }
                });
            }
        },
        meteor: {
            $subscribe: {
                'user.list': []
            },
            users() {
                return Meteor.users.find({ _id: { $ne: Meteor.userId() } }).fetch(); 
            }
        }
    }
</script>

<style>

</style>