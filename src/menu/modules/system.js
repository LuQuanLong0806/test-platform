const pre = '/system/';

export default {
    path: '/system',
    title: '系统管理',
    header: 'home',
    icon: 'md-options',
    children: [
        {
            path: `${pre}user`,
            title: '用户管理'
        },
        {
            path: `${pre}menu`,
            title: '菜单权限管理'
        },
        {
            path: `${pre}role`,
            title: '角色权限管理'
        }
    ]
}
