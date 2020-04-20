<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区 -->
            <el-row>
                <el-col>
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表显示区 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row
                            :class="['bd-bottom',index===0?'bd-top':'','vcenter']"
                            v-for="(item,index) in scope.row.children"
                            :key="item.id"
                        >
                            <el-col :span="5">
                                <el-tag
                                    closable
                                    @close="removeRightById(scope.row,item.id)"
                                >{{item.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <el-col :span="19">
                                <el-row
                                    :class="[index2 === 0 ?'':'bd-top','vcenter']"
                                    v-for="(item2,index2) in item.children"
                                    :key="item2.id"
                                >
                                    <el-col :span="6">
                                        <el-tag
                                            type="success"
                                            closable
                                            @close="removeRightById(scope.row,item2.id)"
                                        >{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag
                                            type="warning"
                                            closable
                                            @close="removeRightById(scope.row,item3.id)"
                                            v-for="item3 in item2.children"
                                            :key="item3.id"
                                        >{{item3.authName}}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column label="#" type="index"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template slot-scope="scope">
                        <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
                        <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                        <el-button
                            @click="showSetRightDialog(scope.row)"
                            size="mini"
                            type="warning"
                            icon="el-icon-setting"
                        >分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialog" width="50%">
            <!-- el-tree的使用  data绑定数据 props 绑定的是要显示的分组文字 要自定义-->
            <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys='defKeys' ref='treeRef'></el-tree>
            <span slot="footer" class="dialog-footer" @close='setRightDialogClose'>
                <el-button @click="setRightDialog = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            rolesList: [], //角色列表
            setRightDialog:false,  //分配用户权限的对话框
            //权限列表
            rightslist:[],
            //树形控件 props 绑定的数据
            treeProps:{
                children: 'children',
                label: 'authName'
            },
            //默认选中已有权限
            defKeys:[],
            //当前即将分配权限的角色id
            roleId:null
        };
    },
    created() {
        this.getRolesList();
    },
    methods: {
        //获取角色列表
        async getRolesList(role) {
            const { data: res } = await this.$http.get("roles");
            if (res.meta.status !== 200)
                return this.$message.error("获取角色列表失败");
            this.rolesList = res.data;
        },
        //删除用户权限
        async removeRightById(item, id) {
            const confirm = await this.$confirm(
                "此操作将永久删除该权限, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }
            ).catch(err => err);
            if (confirm !== "confirm") return this.$message.info("取消删除");
            const { data: res } = await this.$http.delete(
                `roles/${item.id}/rights/${id}`
            );
            if (res.meta.status !== 200)
                return this.$message.error("删除权限失败");
            // this.getRolesList 会重新请求数据，并刷新页面，这会使下拉菜单关闭，不利于用户体验
            item.children = res.data; //重新赋值删除的那条数据，避免重新请求数据后，关闭下拉选项
            this.$message.success("删除权限成功");
        },
        //显示分配用户权限对话框
        async showSetRightDialog(role) {
            this.roleId = role.id
            //获取所有权限列表数据
            const {data:res} =  await this.$http.get('rights/tree');
            // 判断是否请求成功
            if(res.meta.status !== 200){
                return this.$message.error("获取权限数据失败");
            }
            // 把获取到的权限数据保存到 data 中
            this.rightslist = res.data
            this.getLeatKey(role,this.defKeys)
            this.setRightDialog = true;


        },
        //通过递归的方式，得到点击后的角色下的所有id，并保存到defKey中 
        getLeatKey(node,arr){
            //当前节点不包含 children 则表示是三级节点，直接返回该节点的Id值
            if(!node.children){
                return arr.push(node.id)
            }
            //否则就开始递归调用
            node.children.forEach(item =>this.getLeatKey(item,arr))
        },
        //监听分配权限对话框的关闭事件 关闭时清除 默认选中的数组中的数据
        setRightDialogClose(){
            this.defKeys = [];
        },
        //点击为角色分配权限
        async allotRights(){
            const keys =[
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            console.log(keys)
            const idStr = keys.join(',');
            const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
            if(res.meta.status !== 200){
                return this.$message.error('分配权限失败！')
            }
            this.$message.success('分配权限成功！')
            //刷新角色列表
            this.getRolesList()
            // 关闭对话框
            this.setRightDialog = false
        }
    }
};
</script>

<style lang="less" scoped>
.el-tag {
    margin: 7px;
}
.bd-top {
    border-top: 1px solid #eee;
}
.bd-bottom {
    border-bottom: 1px solid #eee;
}
.vcenter {
    display: flex;
    align-items: center;
}
</style>