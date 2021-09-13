import ListProfiles from "../views/Profiles/ListProfiles";
import SaveProfile from "../views/Profiles/SaveProfile";

export default {
    path: 'perfiles',
    components: { 
        sectionView: {
            render: c => c("router-view")
        }
    },
    children: [
        {
            name: 'home.profiles',
            path: '',
            meta: { permission: 'profiles-view' },
            component: ListProfiles
        },
        {
            name: 'home.profiles.create',
            path: 'crear',
            meta: { permission: 'profiles-create' },
            component: SaveProfile
        },
        {
            name: 'home.profiles.edit',
            path: 'editar',
            meta: { permission: 'profiles-edit' },
            component: SaveProfile 
        }
    ]
}