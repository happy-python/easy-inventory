import Vue from "vue";
import Router from "vue-router";

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router);

/* Layout */
import Layout from "../views/layout/Layout";

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  {
    path: "",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index"),
        meta: { title: "首页", icon: "dashboard" },
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index"),
    hidden: true,
  },

  {
    path: "/product",
    component: Layout,
    children: [
      {
        path: "list",
        name: "Product",
        component: () => import("@/views/product/list"),
        meta: { title: "产品维护", icon: "example" },
      },
    ],
  },

  {
    path: "/in",
    component: Layout,
    children: [
      {
        path: "list",
        name: "In",
        component: () => import("@/views/in/list"),
        meta: { title: "入库", icon: "lock" },
      },
    ],
  },

  {
    path: "/out",
    component: Layout,
    children: [
      {
        path: "list",
        name: "Out",
        component: () => import("@/views/out/list"),
        meta: { title: "出库", icon: "out" },
      },
    ],
  },

  {
    path: "/match",
    component: Layout,
    redirect: "/match/list",
    name: "Match",
    meta: { title: "配煤", icon: "table" },
    children: [
      {
        path: "list",
        name: "MatchList",
        component: () => import("@/views/match/list"),
        meta: { title: "全部数据", icon: "list" },
      },
      {
        path: "create",
        name: "MatchCreate",
        component: () => import("@/views/match/create"),
        meta: { title: "新增数据", icon: "form" },
      },
    ],
  },

  {
    path: "/wash",
    component: Layout,
    redirect: "/wash/list",
    name: "Wash",
    meta: { title: "洗煤", icon: "table" },
    children: [
      {
        path: "list",
        name: "WashList",
        component: () => import("@/views/wash/list"),
        meta: { title: "全部数据", icon: "list" },
      },
      {
        path: "create",
        name: "WashCreate",
        component: () => import("@/views/wash/create"),
        meta: { title: "新增数据", icon: "form" },
      },
    ],
  },

  {
    path: "/check",
    component: Layout,
    children: [
      {
        path: "list",
        name: "Check",
        component: () => import("@/views/check/list"),
        meta: { title: "盈亏盘点", icon: "chart" },
      },
    ],
  },

  { path: "/404", component: () => import("@/views/404"), hidden: true },

  { path: "*", redirect: "/404", hidden: true },
];

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap,
});
