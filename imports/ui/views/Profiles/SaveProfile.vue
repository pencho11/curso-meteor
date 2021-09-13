<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="headline">{{dataView.title}}</div>
            </v-col>
            <v-col cols="2">
                <v-btn block type="submit" form="saveProfile" color="primary" v-text="dataView.targetButton">
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-form @submit.prevent="saveProfile" id="saveProfile" autocomplete="off">
                    <v-row>
                        <v-col md="6">
                            <v-text-field v-model="profile.name" id="inputName" name="name" label="Nombre del perfil">
                            </v-text-field>
                        </v-col>
                        <v-col md="6">
                            <v-text-field v-model="profile.description" id="inputDescription" name="name" 
                                        label="Descripcion del perfil">
                            </v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-card>
                    <v-card-title>Permisos de este perfil</v-card-title>
                <v-card-text>
                    <v-text-field v-model="searchSelfPermission" placeholder="Buscar. . ."
                                    id="inputSearchSelfPermission" name="profileName">
                    </v-text-field>
                </v-card-text>
                <v-sheet id="scrolling-techniques-2" class="overflow-y-auto" max-height="500">
                    <v-list style="height: 400px">
                        <v-list-item-group>
                            <draggable :list="filteredSelfPermissions" @change="(ev)=>onChangeDragList(ev,'selfPermission')" group="permissions">
                                <v-list-item v-for="permissions in filteredSelfPermissions"
                                            v-text="permissions.publicName" :key="permissions._id">
                                </v-list-item>
                            </draggable>
                        </v-list-item-group>
                    </v-list>
                </v-sheet>
                </v-card>
            </v-col>
            <v-col>
                <v-card>
                    <v-card-title>Todos los permisos</v-card-title>
                    <v-card-text>
                        <v-text-field v-model="searchPermission" placeholder="Buscar. . ."
                                        id="inputSearchPermission" name="profileName2">
                        </v-text-field>
                    </v-card-text>
                    <v-sheet id="scrolling-techniques-3" class="overflow-y-auto" max-height="500">
                        <v-list style="height: 400px">
                            <v-list-item-group>
                                <draggable :list="filteredPermissions" @change="(ev)=>onChangeDragList(ev,'allPermission')" group="permissions">
                                    <v-list-item v-for="permissions in filteredPermissions"
                                                v-text="permissions.publicName" :key="permissions._id">
                                    </v-list-item>
                                </draggable>
                            </v-list-item-group>
                        </v-list>
                    </v-sheet>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import draggable from 'vuedraggable';
    export default {
        name: "SaveProfile",
        components: {
            draggable
        },
        data() {
            return {
                profile: {
                _id: null,
                name: null,
                description: null,
                permissions: []
                },
                dataView: {
                    title: '',
                    targetButton: ''
                },
                searchSelfPermission: '',
                searchPermission: '',
                selfPermission: [],
                allPermission: []
            }
        },
        created() {
            if(this.$router.currentRoute.name.includes("create")) {
                this.dataView.title = "Crear perfil";
                this.dataView.targetButton = "Crear";
                this.listAllPermissions();
            } else if(this.$router.currentRoute.name.includes("edit")){
                this.dataView.title = "Editar perfil";
                this.dataView.targetButton = "Actualizar";
                this.profile = this.$store.state.temporal.element;
                this.initPermissionsLists();
            }
        },
        methods: {
            onChangeDragList(event, propData) {
                if (event.hasOwnProperty('removed')) {
                    this[propData] = this[propData].filter(permissions => permissions._id !== event.removed.element._id);
                } else if (event.hasOwnProperty('added')) {
                    this[propData].splice(event.added.newIndex, 0, event.added.element);
                }
            },
            saveProfile() {
                this.$loader.activate('Guardando perfil. . .');
                this.profile.permissions = this.selfPermission.map(permission => permission._id);
                Meteor.call('profile.save', this.profile, (error, response) => {
                    this.$loader.desactivate();
                    if (error) {
                        this.$alert.showAlertSimple('error', error.response);
                    } else
                        this.$alert.showAlertSimple('success', response.message);
                        this.$router.push({ name: 'home.profiles' });
                });
            },
            listAllPermissions() {
                Meteor.call('permissions.list', (error, response) => {
                    if (error) {
                        this.$alert.showAlertSimple('error', error.reason);
                    } else {
                        this.allPermission = response.data;
                    }
                });
            },
            initPermissionsLists() {
                Meteor.call('permissions.listByIdProfile', {idProfile: this.profile._id}, (error, response) => {
                    if (error) {
                            this.$alert.showAlertSimple('error', error.reason);
                    } else {
                        this.selfPermission = response.data;
                    }
                });

                Meteor.call('permissions.listOtherForIdProfile', {idProfile: this.profile._id}, (error, response) => {
                    if (error) {
                            this.$alert.showAlertSimple('error', error.reason);
                    } else {
                        this.allPermission = response.data;
                    }
                });
            }
        },
        computed: {
            filteredSelfPermissions() {
                return this.selfPermission.filter(permissions => {
                    return permissions.publicName.toLowerCase().includes(this.searchSelfPermission.toLowerCase());
                })
            },
            filteredPermissions() {
                return this.allPermission.filter(permissions => {
                    return permissions.publicName.toLowerCase().includes(this.searchPermission.toLowerCase());
                })
            },
        }
    }
</script>

<style>

</style>