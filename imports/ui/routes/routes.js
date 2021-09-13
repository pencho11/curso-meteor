import loginRoutes from "./loginRoutes";
import LytSPA from "../layouts/LytSPA";
import Home from "../views/Home/Home";
import CongfigureAccount from "../views/Account/ConfigureAccount";
import usersRoutes from "./usersRoutes";
import profilesRoutes from "./profilesRoutes";
import chatRoutes from "./chatRoutes";

export default [
    {
        path: '*',
        redirect: '/login'
    },
    loginRoutes,
    {
        path: '/',
        components: {
            allPageView: LytSPA
        },
        meta: {
            requiresAuth: true
        }, 
        children: [
            {
                name: 'home',
                path: '',
                components: {
                    sectionView: Home
                }
            },
            {
                name: 'home.account',
                path: 'account',
                components: {
                    sectionView: CongfigureAccount
                }
            },
            usersRoutes,
            profilesRoutes,
            chatRoutes
        ]
    }
]