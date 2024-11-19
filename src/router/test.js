
const HomeView =()=>import(/* webpackChunkName: 'test' */ '../views/HomeView.vue')

const routes = [
      {
        path: '/',
        name: 'HomeView',
        component: HomeView,
        meta:{
          pageId:'A_YYKH_001'
        },
        children:[
            {
                path: '/',
                name: 'HomeView',
                component: HomeView,
                meta:{
                    pageId:'A_YYKH_002'
                },
            },{
                path: '/',
                name: 'HomeView',
                component: HomeView,
                meta:{
                    pageId:'A_YYKH_003'
                },
            }
        ]
      }
    ]

export default routes