<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区 -->
        <el-card class="box-card">
            <!-- 搜索与添加用户区 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input
                        placeholder="请输入内容"
                        v-model="queryInfo.query"
                        clearable
                        @clear="getUserList"
                    >
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户显示列表 -->
            <el-table :data="userList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch
                            v-model="scope.row.mg_state"
                            @change="userStateChange(scope.row)"
                        ></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button
                            type="primary"
                            icon="el-icon-edit"
                            size="mini"
                            @click="showEditDialog(scope.row.id)"
                        ></el-button>
                        <el-button
                            type="danger"
                            icon="el-icon-delete"
                            size="mini"
                            @click="removeUserById(scope.row.id)"
                        ></el-button>
                        <el-tooltip effect="dark" content="分配角色" :enterable="false" placement="top">
                            <el-button
                                type="warning"
                                icon="el-icon-setting"
                                size="mini"
                                @click="setRole(scope.row)"
                            ></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1,2,5,10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            ></el-pagination>
        </el-card>

        <!-- 点击添加用户后弹出对话框 默认隐藏-->
        <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容主体区 -->
            <!-- model 数据绑定对象  rules 验证规则对象  ref表示该表单的引用对象-->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <!-- prop 引用验证规则对象 -->
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 点击修改后弹出对话框 默认隐藏 -->
        <el-dialog
            title="提示"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogReast"
        >
            <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="70px">
                <!-- prop 引用验证规则对象 -->
                <el-form-item label="用户名">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 点击分配角色后弹出对话框 默认隐藏-->
        <el-dialog title="分配角色" :visible.sync="setRolesDialogVisible" width="50%" @close='setRoleDialogClosed'>
            <div>
                <p>当前的用户：{{userInfo.username}}</p>
                <p>当前的角色：{{userInfo.role_name}}</p>
                <p>
                    设置新的角色信息：
                    <el-select v-model="selectRoleId" placeholder="请选择">
                        <el-option
                            v-for="item in rolesList"
                            :key="item.id"
                            :label="item.roleName"
                            :value="item.id"
                        ></el-option>
                    </el-select>
                </p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRolesDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        //自定义验证邮箱规则
        /**
         * rule  验证规则
         * value 需要验证的值
         * callback 回调函数 验证通过直接调用表示验证通过 失败需要传递一个 new Error（'提示信息'） 对象
         */
        var checkEmail = (rule, value, callback) => {
            // 验证邮箱的正则表达式
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
            if (regEmail.test(value)) {
                // 合法的邮箱
                return callback();
            }
            callback(new Error("请输入合法的邮箱"));
        };

        // 验证手机号的规则
        var checkMobile = (rule, value, callback) => {
            // 验证手机号的正则表达式
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
            if (regMobile.test(value)) {
                return callback();
            }
            callback(new Error("请输入合法的手机号"));
        };
        return {
            //获取用户列表的参数对象
            queryInfo: {
                query: "", //搜索关键字
                pagenum: 1, //获取哪一页
                pagesize: 2 //一页显示的数量
            },
            //分配角色的显示与隐藏
            setRolesDialogVisible: false,
            userInfo: {}, //某个用户的信息
            rolesList: [], //所有的角色列表
            //用户列表
            userList: [],
            total: 0, //用户列表数据总数
            dialogVisible: false, //控制添加用户对话框的显示与隐藏
            editDialogVisible: false, //控制编辑弹出框的显示与隐藏
            selectRoleId:'', //已选中的角色Id值
            //通过ID查询出的用户信息对象
            editForm: {},
            //添加用户的表单数据
            addForm: {
                username: "",
                password: "",
                email: "",
                mobile: ""
            },
            //添加表单的验证规则对象
            addFormRules: {
                username: [
                    // 非空验证及提示信息 trigger触发时机 blur 失去焦点时
                    {
                        required: true,
                        message: "请输入用户名",
                        trigger: "blur"
                    },
                    // 长度校验
                    {
                        min: 3,
                        max: 10,
                        message: "用户名的长度在3到10个字符之间",
                        trigger: "blur"
                    }
                ],
                password: [
                    // 非空验证及提示信息 trigger触发时机 blur 失去焦点时
                    { required: true, message: "请输入密码", trigger: "blur" },
                    // 长度校验
                    {
                        min: 6,
                        max: 15,
                        message: "密码的长度在6到15个字符之间",
                        trigger: "blur"
                    }
                ],
                email: [
                    // 非空验证及提示信息 trigger触发时机 blur 失去焦点时
                    { required: true, message: "请输入邮箱", trigger: "blur" },
                    // 绑定自定义校验规则
                    { validator: checkEmail, trigger: "blur" }
                ],
                mobile: [
                    // 非空验证及提示信息 trigger触发时机 blur 失去焦点时
                    {
                        required: true,
                        message: "请输入手机号",
                        trigger: "blur"
                    },
                    // 绑定自定义校验规则
                    {
                        validator: checkMobile,
                        trigger: "blur"
                    }
                ]
            }
        };
    },
    created() {
        this.getUserList();
    },
    methods: {
        //获取用户列表
        async getUserList() {
            const { data: res } = await this.$http.get("users", {
                params: this.queryInfo
            });
            if (res.meta.status !== 200)
                return this.$message("获取用户列表失败！");
            this.userList = res.data.users;
            this.total = res.data.total;
        },
        // 监听 pagesize改变后的函数
        handleSizeChange(newSize) {
            console.log(newSize);
            this.queryInfo.pagesize = newSize;
            this.getUserList();
        },
        //监听 页码值改变的函数
        handleCurrentChange(newPage) {
            console.log(newPage);
            this.queryInfo.pagenum = newPage;
            this.getUserList();
        },
        // 改变用户状态并调用接口同步到服务器中
        async userStateChange(userinfo) {
            const { data: res } = await this.$http.put(
                `users/${userinfo.id}/state/${userinfo.mg_state}`
            );
            if (res.meta.status !== 200) {
                userinfo.mg_state = !userinfo.mg_state;
                return this.$message.error("更新用户状态失败");
            }
            this.$message.success("更新用户状态成功");
        },
        //监听添加用户框的关闭事件 关闭时重置整个表单
        addDialogClosed() {
            this.$refs.addFormRef.resetFields();
        },
        //点击确定，校验表单，添加用户
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return;
                //校验通过，发送请求，添加用户
                const { data: res } = await this.$http.post(
                    "users",
                    this.addForm
                );
                if (res.meta.status !== 201) {
                    this.$message.error("添加用户失败");
                } else {
                    this.$message.success("添加用户成功");
                    //隐藏对话框
                    this.dialogVisible = false;
                    //刷新用户显示列表数据
                    this.getUserList();
                }
            });
        },

        //点击后弹出修改用户提示框
        async showEditDialog(id) {
            const { data: res } = await this.$http.get("users/" + id);
            if (res.meta.status !== 200) {
                return this.$message.error("查询用户失败");
            }
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        //监听表单退出时，重置整个表单
        editDialogReast() {
            this.$refs.editFormRef.resetFields();
        },
        //提交用户修改信息  validate 校验整个表单 通过就为true
        editUserInfo() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return;
                const { data: res } = await this.$http.put(
                    "users/" + this.editForm.id,
                    { email: this.editForm.email, mobile: this.editForm.mobile }
                );
                if (res.meta.status !== 200) {
                    return this.$message.error("编辑用户信息失败！");
                }
                //关闭对话框
                this.editDialogVisible = false;
                //刷新列表
                this.getUserList();
                //提示用户
                this.$message.success("编剧用户信息成功");
            });
        },
        //根据Id 删除用户
        async removeUserById(id) {
            const status = await this.$confirm(
                "此操作将永久删除该用户, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }
            ).catch(error => error); //点击取消后 await 会抛出一个错误，如果不用catch 接收，浏览器会报错
            if (status === "confirm") {
                const { data: res } = await this.$http.delete("users/" + id);
                if (res.meta.status !== 200) {
                    return this.$message.error("删除用户失败");
                }
                this.getUserList();
                this.$message.success("删除用户成功");
            } else {
                this.$message.info("已取消删除");
            }
        },
        // 设置用户角色信息
        async setRole(role) {
            this.userInfo = role;
            //在展示对话框之前，获取所有的角色列表
            const { data: res } = await this.$http.get("roles");
            if (res.meta.status !== 200) {
                return this.$message.error("获取角色列表失败");
            }
            //保存角色信息到 data中
            this.rolesList = res.data;
            this.setRolesDialogVisible = true;
        },
        //保存用户角色信息
        async saveRoleInfo(){
            //用户没选择角色就点击确定时
            if(!this.selectRoleId){
                return this.$message.error('请选择要分配的角色')
            }

            const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectRoleId})
            if(res.meta.status !== 200){
                return this.$message.error('设置用户角色失败')
            }
            this.$message.success('设置用户角色成功')
            //保存成功，刷新用户列表
            this.getUserList()
            this.setRolesDialogVisible = false
        },
        //监听角色对话框的关闭事件，重置selectRoleId和userInfo!
        setRoleDialogClosed(){
            this.selectRoleId = '';
            this.userInfo = {}
        }
    }
};
</script>

<style lang="less" scoped>
</style>