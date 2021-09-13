import ListUsers from "../views/Users/ListUsers";
import SaveUser from "../views/Users/SaveUser";

export default {
    path: 'usuarios', 
    components: {
        sectionView: {
            render: c => c("router-view")
        }
    },
    children: [
        {
            name: 'home.users',
            path: '',
            meta: { permission: 'users-view' },
            component: ListUsers
        },
        {
            name: 'home.users.create',
            path: 'crear',
            meta: { permission: 'users-create' },
            component: SaveUser
        },
        {
            name: 'home.users.edit',
            path: 'editar',
            meta: { permission: 'users-edit' },
            component: SaveUser 
        }
    ]
} 
 