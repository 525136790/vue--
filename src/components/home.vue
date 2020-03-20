<template>
	<el-container>
		<!-- 头部区域 -->
    	<el-header>
      		<el-button type="info" @click="logout">退出</el-button>
    	</el-header>
		<!-- 主体区域 -->
   		<el-container>
			   <!-- 左侧边栏 -->
      		<el-aside width="200px">Aside</el-aside>
			  <!-- 右主体内容 -->
      		<el-main>Main</el-main>
    	</el-container>
  	</el-container>
</template>

<script>
export default {
  name: "home",
  methods: {
    logout() {
      //退出的实现
      window.sessionStorage.clear(); //清除token缓存
      this.$router.push("/login"); //重新登录
    }
  }
};
</script>

<style lang="less" scoped>
</style>