const SuccessView = () => import(/* webpackChunkName: "NotFound" */ '@/views/SuccessView.vue')
const NotFoundView = () => import(/* webpackChunkName: "NotFound" */ '@/views/NotFoundView.vue')

const routes = [
  {
    path: '/404',
    name: 'NotFound',
    component: NotFoundView
  },
  {
    path: '/AcademyCourseDetail',
    name: 'AcademyCourseDetail',
    component: SuccessView
  },
  {
    path: '/AcademySeriesDetail',
    name: 'AcademySeriesDetail',
    component: SuccessView
  },
  {
    path: '/MyPurchase',
    name: 'MyPurchase',
    component: SuccessView
  },
  {
    path: '/MyClasses',
    name: 'MyClasses',
    component: SuccessView
  }
]

export default routes
