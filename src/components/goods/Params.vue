<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- alert 警告 closable 是否能被关闭  show-icon 前面的感叹号 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>
                    <!-- 选择商品分类的级联选择框 -->
                    <el-cascader
                        v-model="selectedKeys"
                        :options="cateList"
                        :props="cascaderProps"
                        @change="handleChange"
                    ></el-cascader>
                </el-col>
            </el-row>
            <!-- tab 页签区 -->
            <!-- activeName 当前激活的页签名称   name 页签名 @tab-click 监听页签的点击事件，自动跟新activeName为当前页签的name值-->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button
                        type="primary"
                        size="mini"
                        :disabled="isBtnDisabled"
                        @click="showAddDialog"
                    >添加参数</el-button>
                    <!-- 动态数据表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开列 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 数据显示tag -->
                                <el-tag
                                    closable
                                    v-for="(item, i) in scope.row.attr_vals"
                                    :key="i"
                                    @close='handleClose(i,scope.row)'
                                >{{ item }}</el-tag>
                                <!-- 输入文本框  -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                ></el-input>
                                <!-- 添加按钮 -->
                                <el-button
                                    v-else
                                    class="button-new-tag"
                                    size="small"
                                    @click="showInput(scope.row)"
                                >+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    size="mini"
                                    @click="showEditDialog(scope.row.attr_id)"
                                >编辑</el-button>
                                <el-button
                                    type="danger"
                                    icon="el-icon-delete"
                                    size="mini"
                                    @click="removeParams(scope.row.attr_id)"
                                >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button
                        type="primary"
                        size="mini"
                        :disabled="isBtnDisabled"
                        @click="showAddDialog"
                    >添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 数据显示tag -->
                                <el-tag
                                    closable
                                    v-for="(item, i) in scope.row.attr_vals"
                                    :key="i"
                                    @close='handleClose(i,scope.row)'
                                >{{ item }}</el-tag>
                                <!-- 输入文本框  -->
                                <el-input
                                    class="input-new-tag"
                                    v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue"
                                    ref="saveTagInput"
                                    size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)"
                                ></el-input>
                                <!-- 添加按钮 -->
                                <el-button
                                    v-else
                                    class="button-new-tag"
                                    size="small"
                                    @click="showInput(scope.row)"
                                >+ New Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button
                                    type="primary"
                                    icon="el-icon-edit"
                                    size="mini"
                                    @click="showEditDialog(scope.row.attr_id)"
                                >编辑</el-button>
                                <el-button
                                    type="danger"
                                    icon="el-icon-delete"
                                    size="mini"
                                    @click="removeParams(scope.row.attr_id)"
                                >删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数的对话框 -->
        <el-dialog
            :title="'添加' + titleTest"
            :visible.sync="addDialogVisible"
            width="50%"
            @close="addDialogClose"
        >
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleTest" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog
            :title="'修改' + titleTest"
            :visible.sync="editDialogVisible"
            width="50%"
            @close="editDialogClose"
        >
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleTest" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            //商品分类列表
            cateList: [],
            //级联选择框双向绑定选中父子节点id的数组
            selectedKeys: [],
            // 级联选择框的 配置对象
            cascaderProps: {
                expandTrigger: "hover",
                value: "cat_id", //选中的id
                label: "cat_name", //显示的文字
                children: "children" //父子节点的嵌套属性
            },
            //默认被激活的页签的名称
            activeName: "many",
            //当前选中的三级分类的动态数据
            manyTableData: [],
            //当前选中的三级分类的静态态数据
            onlyTableData: [],
            // 控制添加参数或属性对话框的显示与隐藏
            addDialogVisible: false,
            // 添加参数的表单数据对象
            addForm: {
                attr_name: ""
            },
            // 添加对话框中的表单的验证规则对象
            addFormRules: {
                attr_name: [
                    {
                        required: true,
                        message: "请输入参数名称",
                        trigger: "blur"
                    }
                ]
            },
            // 控制修改对话框的显示与隐藏
            editDialogVisible: false,
            // 修改的表单数据对象
            editForm: {},
            //修改对话框中的表单的验证规则对象
            editFormRules: {
                attr_name: [
                    {
                        required: true,
                        message: "请输入参数名称",
                        trigger: "blur"
                    }
                ]
            },
        };
    },
    created() {
        this.getCateList();
    },
    methods: {
        // 获取所有的商品分类列表
        async getCateList() {
            const { data: res } = await this.$http.get("categories");
            if (res.meta.status !== 200) {
                return this.$message.error("获取商品列表失败");
            }
            this.cateList = res.data;
        },
        // 级联选择框 选中项变化 触发的函数
        handleChange() {
            this.getParamsData();
        },
        // tab 页签点击事件的处理
        handleTabClick() {
            this.getParamsData();
        },
        // 获取选中的三级分类的数据
        async getParamsData() {
            // 当选中的不是三级分类
            if (this.selectedKeys.length != 3) {
                this.selectedKeys = []; //不显示选中的内容
                this.manyTableData = []; //清空 动态参数中的表格数据 ，避免选中二级分类时，依旧保留有上次所选三级分类的数据
                this.onlyTableData = []; //清空静态参数中的表格数据 
                return;
            }
            // 根据所选分类的Id，和当前所处的页签，发起请求 获取对应的参数 
            const { data: res } = await this.$http.get(
                `categories/${this.cateId}/attributes`,
                {
                    params: { sel: this.activeName }
                }
            );
            if (res.meta.status !== 200) {
                return this.$message.error("获取分类数据失败");
            }
            res.data.forEach(item => {
                // 不为空才进行分割，否则就直接返回一个空数组
                item.attr_vals = item.attr_vals? item.attr_vals.split(" "): [];
                item.inputVisible = false
                item.inputValue = ''
            });
            if (this.activeName === "many") {
                this.manyTableData = res.data;
            } else {
                this.onlyTableData = res.data;
            }
        },
        // 显示添加参数或属性的对话框
        showAddDialog() {
            this.addDialogVisible = true;
        },
        // 监听添加参数对话框的关闭事件
        addDialogClose() {
            // 清除表单验证信息
            this.$refs.addFormRef.resetFields();
        },
        // 点击确定，添加参数 发起请求
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return;
                const { data: res } = await this.$http.post(
                    `categories/${this.cateId}/attributes`,
                    {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    }
                );
                if (res.meta.status !== 201) {
                    return this.$message.error("添加失败！");
                }
                this.$message.success("添加成功！");
                this.addDialogVisible = false;
                this.getParamsData();
            });
        },
        // 点击修改 展示修改的对话框 发起请求
        async showEditDialog(attr_id) {
            const {
                data: res
            } = await this.$http.get(
                `categories/${this.cateId}/attributes/${attr_id}`,
                { params: { attr_sel: this.activeName } }
            );
            if (res.meta.status !== 200) {
                return this.$message.error("获取分类数据失败");
            }
            this.editForm = res.data;
            this.editDialogVisible = true;
        },
        // 监听修改对话框的关闭事件
        editDialogClose() {
            // 重置修改的表单
            this.$refs.editFormRef.resetFields();
        },
        //点击确定，修改参数 发起请求
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return;
                const { data: res } = await this.$http.put(
                    `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                    {
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.activeName
                    }
                );
                if (res.meta.status !== 200) {
                    return this.$message.error("修改失败！");
                }
                this.$message.success("修改成功！");
                this.getParamsData();
                this.editDialogVisible = false;
            });
        },
        // 点击删除 删除此数据 发起请求
        async removeParams(id) {
            const result = await this.$confirm(
                "此操作将永久删除该参数, 是否继续?",
                "提示",
                {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }
            ).catch(err => err);
            // 用户取消本次操作
            if (result !== "confirm") {
                return this.$message.info("已取消删除");
            }

            //删除 发起请求
            const { data: res } = await this.$http.delete(
                `categories/${this.cateId}/attributes/${id}`
            );
            if (res.meta.status !== 200) {
                return this.$message.error("删除失败");
            }
            this.$message.success("删除成功");
            this.getParamsData();
        },
        // 当文本输入框失去焦点或按下 Enter 都会触发的函数 发起请求
        handleInputConfirm(row){
            // trim 去除多余空格 
            if(row.inputValue.trim().length === 0) {
                row.inputValue = ""
                row.inputVisible = false
                return
            }
            // 添加新的tag参数 
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ""
            row.inputVisible = false
            // 发起请求，保存此次操作到数据库中
           this.saveAttrVals(row)

        },
        //点击添加tag标签参数后显示输入框
        showInput(row){
            row.inputVisible = true
            // 让文本框自动获得焦点
            // nextTick 当页面中的元素被重新渲染后才会执行回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        // 删除tag标签参数  发起请求
        handleClose(index,row){
            // 修改vals 
            row.attr_vals.splice(index,1)
            // 发起请求
            this.saveAttrVals(row)
        },
        // 添加或删除某条参数时发起的请求函数
        async saveAttrVals(row) {
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{attr_name:row.attr_name,attr_sel:row.attr_sel,attr_vals:row.attr_vals.join(" ")})
            if(res.meta.status !== 200){
                return this.$message.error('修改失败！')
            }
            this.$message.success('修改成功！')
        }

    },
    // 计算属性，根据监听的值自动更新视图
    computed: {
        //  如果按钮需要被禁用，则返回true 否则返回false
        isBtnDisabled() {
            if (this.selectedKeys.length !== 3) {
                return true;
            } else {
                return false;
            }
        },
        // 当前选中的三级分类的Id
        cateId() {
            if (this.selectedKeys.length === 3) {
                return this.selectedKeys[2];
            }
            return null;
        },
        // 根据所点击的页签来动态显示对话框的标题
        titleTest() {
            if (this.activeName === "many") {
                return "动态参数";
            }
            return "静态属性";
        }
    }
};
</script>

<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}
.el-tag {
    margin-right: 10px;
}
.input-new-tag{
    width: 150px;
}
</style>
