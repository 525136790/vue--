<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" />
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 主体区域 -->
        <el-container>
            <!-- 左侧边栏 -->
            <el-aside :width="isCollapes ?'65px':'200px'">
				<div class='toggle-button' @click='toggleCollapese'>|||</div>
                <!-- 侧边栏菜单区  unique-opened 每次只能展开一个菜单  collapse 折叠菜单栏  collapse-transition  折叠动画  router 开启路由模式 点击二级菜单后会路由跳转 其index 中的值  default-active 二级菜单选中后效果的保持-->
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" :unique-opened ='true' :collapse="isCollapes" :collapse-transition='false' :router='true' :default-active="Nav">
                    <!-- 一级菜单 index 需指定不同值，不然点击一个后所有的菜单都会展开-->
                    <el-submenu :index="item.id + ''" v-for='item in menulist' :key = 'item.id'>
                        <!-- 一级菜单模板区 -->
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单  saveNavstate 选中后保存该index的值，同default-active一起使用  -->
                        <el-menu-item :index="'/' + subItem.path" v-for='subItem in item.children' :key ='subItem.id' @click ="saveNavstate('/' + subItem.path)">
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{ subItem.authName }}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右主体内容 -->
            <el-main>
				<!-- 路由占位符 -->
				<router-view></router-view>
			</el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
	name: "home",
	data(){
		return {
			menulist:[],
			iconsObj:{
				'125':'iconfont icon-user',
				'103':'iconfont icon-tijikongjian',
				'101':'iconfont icon-shangpin',
				'102':'iconfont icon-danju',
				'145':'iconfont icon-baobiao',
			},
			isCollapes:false,
			Nav:""
		}
	},
	created(){
		this.getMenuList()
		this.Nav = window.sessionStorage.getItem('nav')
	},
    methods: {
        logout() {
            //退出的实现
            window.sessionStorage.clear(); //清除token缓存
            this.$router.push("/login"); //重新登录
		},
		//获取所有菜单
		async getMenuList(){
			const {data : result}  = await this.$http.get('menus')
			if(result.meta.status !== 200){  //不等于200表示获取失败，弹出失败信息
				this.$message.error(result.meta.msg)
			}else{ //获取成功，赋值
				this.menulist = result.data
			}
		},
		// 点击后实现菜单栏的展开与折叠
		toggleCollapese(){
			this.isCollapes = !this.isCollapes
		},
		//保存路由链接的状态
		saveNavstate(data){
			window.sessionStorage.setItem('nav',data)  //保存至缓存中，刷新不会丢失点击状态
			this.Nav = data
		}
    }
};
</script>

<style lang="less" scoped>
.home-container {
    height: 100%;
}
.el-header {
    padding-left: 0;
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    font-size: 20px;
    > div {
        display: flex;
        align-items: center;
        span {
            margin-left: 15px;
        }
    }
}
.el-aside {
	background-color: #333744;
	.el-menu {
		border-right: none;
	}
}
.el-main {
    background-color: #eaedf1;
}
.iconfont{
	margin-right: 10px;
}
.toggle-button{
	background-color: #4a5064;
	color: #fff;
	font-size: 10px;
	line-height: 24px;
	text-align: center;
	letter-spacing: 0.2em;
	cursor: pointer;
}
</style>