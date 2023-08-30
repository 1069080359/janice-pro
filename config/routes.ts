import type { defineConfig } from 'umi';

type RoutesType = ReturnType<typeof defineConfig>['routes'];

export const routes: RoutesType = [
  { path: '/unauthorized', hideInMenu: true, component: '@/pages/unauthorized', name: '未授权' },
  // { path: '/versionlog', layout: false, hideInMenu: true, component: '@/pages/versionlog', name: '更新日志' },
  {
    path: '/',
    component: '@/layouts/user-authentication',
    menu: {
      flatMenu: true,
    },
    routes: [
      {
        path: '/home',
        name: '首页',
        icon: 'menu-home',
        routes: [
          {
            path: 'tableExcel',
            component: '@/pages/home/table-excel',
            name: '表格过滤',
          },
        ],
      },
      { path: '/', redirect: '/home/tableExcel' },
      { path: '*', layout: false, hideInMenu: true, name: '404', component: './404' },
    ],
  },
  { path: '*', layout: false, hideInMenu: true, name: '404', component: './404' },
];
