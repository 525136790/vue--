import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login'
import  Home from '../components/home'
Vue.use(VueRouter)

const routes = [
  {path:'/',redirect:'/login'},
  {path:'/login',component:Login},
  {path:'/home',component:Home}
]

const router = new VueRouter({
  routes
})
//路由导航守卫的设置   通过路由导航守卫来控制访问权限的设定
router.beforeEach((to,from,next)=>{
  //to 将要访问的路径
  //from 从哪个路径跳转而来
  //next 是一个函数 表示放行
  // next（'/login'） 强制跳转

  //如果访问的是登录页，直接放行
  if(to.path === '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token')
  //如果不存在，就强制跳转至登录页面
  if(!tokenStr) return next('/login')
  //如果存在，就放行 
  next()
})

export default router