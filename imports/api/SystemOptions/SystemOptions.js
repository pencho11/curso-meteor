import Permissions from '../../startup/server/Permissions';

export default [
    {
        title: 'Inicio',
        permission: null,
        routeName: 'home'
    },
    {
        title: 'Usuarios',
        permission: Permissions.USERS.LIST.VALUE,
        routeName: 'home.users'
    },
    {
        title: 'Perfiles',
        permission: Permissions.PROFILES.LIST.VALUE,
        routeName: 'home.profiles'
    },
    {
        title: 'Chat',
        permission: Permissions.CHAT.LIST.VALUE,
        routeName: 'home.chat'
    }

];