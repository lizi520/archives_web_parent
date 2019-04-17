import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import ProductType from './views/product/ProductType.vue'
import Brand from './views/product/Brand.vue'
import Product from './views/product/Product.vue'
import DictionariesDir from './views/system/DictionariesDir.vue'
import DictionariesDetail from './views/system/DictionariesDetail.vue'
import Department from './views/system/Department.vue'
import Employee from './views/system/Employee.vue'
import Menu from './views/system/Menu.vue'
import Permission from './views/system/Permission.vue'
import Resources from './views/system/Resources.vue'
import Role from './views/system/Role.vue'
import System from './views/system/System.vue'

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '主页',
        leaf: true,//只有一个节点
        iconCls: 'fa fa-bar-chart',
        children: [
            { path: '/main', component: echarts, name: '首页' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '系统管理',
        iconCls: 'fa fa-id-card-o',
        children: [
            { path: '/DictionariesDir', component: DictionariesDir, name: '字典目录管理' },
            { path: '/DictionariesDetail', component: DictionariesDetail, name: '字典明细管理' },
            { path: '/Department', component: Department, name: '部门管理' },
            { path: '/Employee', component: Employee, name: '员工管理' },
            { path: '/Role', component: Role, name: '角色管理' },
            { path: '/Permission', component: Permission, name: '权限管理' },
            { path: '/Menu', component: Menu, name: '系统菜单管理' },
            { path: '/Resources', component: Resources, name: '系统资源管理' },
            { path: '/System', component: System, name: '系统配置' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;