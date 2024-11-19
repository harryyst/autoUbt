import Vue from 'vue'
import Router from 'vue-router'
import AboutView from '@/views/AboutView.vue'
// import test from './test';

const HomeView =()=>import(/* webpackChunkName: 'test' */ '../views/HomeView.vue')
const HomeView2 =()=>import( /* webpackChunkName: 'test' */ '@/pages/index/views/haha.vue')

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'HomeView',
      component: HomeView,
      meta:{
        pageId:'A_YYKH_007'
      },
      // children:[...test]
    },
    {
      path: '/about',
      name: 'AboutView',
      component: AboutView,
      meta:{
        pageId:'A_YYKH_004'
      },
    },
    {
      path: '/',
      name: 'HomeView2',
      component: HomeView2,
      meta:{
        pageId:'A_YYKH_009'
      },
      // children:[...test]
    },
  ]
})
