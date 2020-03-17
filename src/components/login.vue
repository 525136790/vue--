<template>
    <div class='login_container'>
       <div class="login_box">
           <div class="avatar_box">
               <img src="../assets/logo.png" alt="">
           </div>
           <el-form ref="loginFormRef" :model='loginFrom' :rules='loginFromRules' label-width="0px" class='login_form'>
                <el-form-item  prop='username'>
                    <el-input v-model='loginFrom.username' prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <el-form-item  prop='password'>
                    <el-input v-model='loginFrom.password' prefix-icon="iconfont icon-3702mima" type='password'></el-input>
                </el-form-item>
                <el-form-item class='btns'>
                     <el-button type="primary" @click='login'>登录</el-button>
                     <el-button type="info" @click='resetLoginForm'>重置</el-button>
                </el-form-item>
            </el-form>
       </div>
       
    </div>
</template>

<script>
export default {
    data(){
        return {
            loginFrom:{
                username:'admin',
                password:'123456'
            },
            //表单验证规则
            loginFromRules:{
                username:[
                    {required:true,message:'请输入用户名',trigger:"blur"},
                    {min:3,max:10,message:'长度在 3 到 10 个字符',trigger:"blur"}
                ],
                password:[
                    {required:true,message:'请输入密码',trigger:"blur"},
                    {min:6,max:15,message:'长度在 6 到 15 个字符',trigger:"blur"}
                ]
            }
        }
        
    },
    methods:{
        //重置表单
        resetLoginForm(){
            //点击触发 resetFields 重置表单
            this.$refs.loginFormRef.resetFields()
        },
        login(){
            // 点击触发validate 验证表单输入信息是否合法
            this.$refs.loginFormRef.validate( async (valid) =>{
                //console.log(valid)  验证通过 true  否则 false
                if(!valid) return;
                //解构赋值 ，把后面请求回来的data赋值给result
                const { data : result } = await this.$http.post('login',this.loginFrom);
                if(result.meta.status !== 200){  //判断状态码 
                   this.$message.error('登录失败')  //ele弹窗的使用
                }else{
                    this.$message.success('登录成功')
                    //1.登录成功后把 token 保存到客户端的 sessionStoeage 中
                    //  1.1 项目中除了登录之外的其他APi 接口 必须在登录之后才能访问
                    //  1.2 token 只应在当前网站打开期间生效，所以要保存在sessionAtorage 中
                    window.sessionStorage.setItem('token',result.data.token);
                    //2. 通过编程式导航跳转到后台主页，路由地址是 /home
                    this.$router.push('/home')
                }
            })
        }
    }
}
</script>

<style lang="less" scoped>
    .login_container{
        background:#2b4b6b;
        height: 100%;
    }
    .login_box{
        width: 450px;
        height: 300px;
        background: #fff;
        border-radius: 4px;
        position: absolute;
        left: 50%;
        top:50%;
        transform: translate(-50%,-50%);
        .avatar_box{
            height: 130px;
            width: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            background-color: #fff;
            img{
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background:#eee;
            }
        }

    }
    .btns{
        display: flex;
        justify-content: flex-end;
    }
    .login_form{
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }
</style>