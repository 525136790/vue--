import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/login'
import  Home from '../components/home'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'
import Rights from '../components/power/Rights'
import Roles from '../components/power/Roles'
import Cate from "../components/goods/Cate"
import Params from "../components/goods/Params"
Vue.use(VueRouter)

const routes = [
  {path:'/',redirect:'/login'},
  {path:'/login',component:Login},
  {
    path:'/home',
    component:Home,
    redirect:'/welcome',//重定向到子级
    children:[
      {path:'/welcome',component:Welcome},
      {path:'/users',component:Users},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/categories',component:Cate},
      {path:'/params',component:Params}
    ]
  }
]
//路由导航守卫的设置   通过路由导航守卫来控制访问权限的设定



const router = new VueRouter({
  routes
})

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
