<template>
    <v-container>
        <v-row>
            <v-col>
                <div class="headline">Configurar cuenta</div>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12" xs="12" sm="12" md="6" lg="6" xl="5">
                <general-data />
            </v-col> 
            <v-col cols="12" xs="12" sm="12" md="6" lg="6" offset-xl="1" xl="5">
                <update-password />
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
    import GeneralData from '../../components/ConfigureAccount/GeneralData';
    import UpdatePassword from '../../components/ConfigureAccount/UpdatePassword';
    
    export default {
        name: "ConfigureAccount",
        components: {
            GeneralData,
            UpdatePassword
        }
    }
</script>

<style>

</style>