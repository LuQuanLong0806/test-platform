import BasicLayout from '@/layouts/basic-layout';

const meta = {
    auth: true
};

const pre = 'system-';

export default {
    path: '/system',
    name: 'system',
    redirect: {
        name: `${pre}user`
    },
    meta,
    component: BasicLayout,
    children: [
        {
            path: 'user',
            name: `${pre}user`,
            meta: {
                ...meta,
                title: '用户管理'
            },
            component: () => import('@/pages/sys/user')
        },
        {
            path: 'menu',
            name: `${pre}menu`,
            meta: {
                ...meta,
                title: '菜单权限管理'
            },
            component: () => import('@/pages/sys/menu')
        },
        {
            path: 'role',
            name: `${pre}role`,
            meta: {
                ...meta,
                title: '角色权限管理'
            },
            component: () => import('@/pages/sys/role')
        }
    ]
};
