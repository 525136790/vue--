import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
//导入全局样式表

import '../src/assets/css/global.css'

//导入字体图标库
import './assets/fonts/iconfont.css'

//全局使用axios 数据请求
import axios from "axios"
// 配置请求的根路径
axios.defaults.baseURL ='http://127.0.0.1:8888/api/private/v1/'
//通过设置axios拦截器来添加token验证
axios.interceptors.request.use(config=>{
  // console.log(config)
  // 在请求头中添加 token字段，
  config.headers.Authorization =window.sessionStorage.getItem('token');
  // 必须要 return config
  return config
})
Vue.prototype.$http = axios;


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
