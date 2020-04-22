<template>
    <div>
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 添加分类按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDailog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 商品分类表格  data 表格的数据源  columns 每一列的定义 selection-type 是否启用复选框 expand-type 是否使用展开选项-->
            <!-- show-index 是否显示索引列 index-text 设置所引类的标题名称  border 是否显示纵向边框 show-row-hover 鼠标悬停时，是否高亮显示当前行-->
            <tree-table
                class="treeTable"
                :data="cateList"
                :columns="columns"
                :selection-type="false"
                :expand-type="false"
                show-index
                index-text="#"
                border
                :show-row-hover="false"
            >
                <!-- 是否有效 isok 插槽  slot-scope 来接收这一行的数据  使用插槽需要在type中定义与template与template的值-->
                <template slot="isok" slot-scope="scope">
                    <i
                        v-if="scope.row.cat_deleted === false"
                        class="el-icon-success"
                        style="color:lightgreen;"
                    ></i>
                    <i v-else class="el-icon-error" style="color:red;"></i>
                </template>

                <!-- 排序 order 插槽-->
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
                    <el-tag size="mini" v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
                    <el-tag size="mini" v-else type="warning">三级</el-tag>
                </template>

                <!--操作 opt 插槽  -->
                <template slot="opt" slot-scope="scope">
                    <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页区 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="querInfo.pagenum"
                :page-sizes="[3, 5, 10, 15]"
                :page-size="querInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total"
            ></el-pagination>
        </el-card>

        <!-- 添加分类按钮的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close='addCateDialogClosed'>
            <!-- 添加分类的表单 -->
            <el-form
                :model="addCateForm"
                :rules="addCateFormRules"
                ref="addCateFormRef"
                label-width="100px"
            >
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <!--  ele 级联选择器-->
                    <!-- model指定选中的父级分类的id 只能是数组 expandTrigger 指定是点击还是移入时打开下级菜单  options 数据源 props 用来指定配置对象 clearable 是否支持清空选项-->
                    <el-cascader
                        v-model="selectedKeys"
                        :options="parentCateList"
                        :props="cascaderProps"
                        @change="parentCateChange"
                        :clearable="true"
                    ></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
 
 
 
<script>
export default {
    data() {
        return {
            //商品分类的数据列表，默认为空
            cateList: [],
            // 数据请求时，需携带的条件
            querInfo: {
                type: 3, //需要查询到几级列表
                pagenum: 1, //当前页数
                pagesize: 5 //每页显示的数量
            },
            total: 0, // 数据总条数
            // 为table指定列的定义 label 列表名称 prop 绑定的数据 type 值为template时，则说明该列为自定义模板列，template 自定义插槽的名字
            columns: [
                {
                    label: "分类名称",
                    prop: "cat_name"
                },
                {
                    label: "是否有效",
                    type: "template",
                    template: "isok"
                },
                {
                    label: "排序",
                    type: "template",
                    template: "order"
                },
                {
                    label: "操作",
                    type: "template",
                    template: "opt"
                }
            ],
            //添加对话框的显示与隐藏
            addCateDialogVisible: false,
            // 添加分类的表单数据对象
            addCateForm: {
                //将要调价的分裂的名称
                cat_name: "",
                //父级分类的id
                cat_pid: 0,
                //新家分类的等级，默认是1级分类
                cat_level: 0
            },
            // 表单验证规则对象
            addCateFormRules: {
                cat_name: [
                    {
                        required: true,
                        message: " 请输入分类名称",
                        trigger: "blur"
                    }
                ]
            },
            // 父级分类的列表
            parentCateList: [],
            // 指定联级选择器的配置对象
            cascaderProps:{
                expandTrigger: 'hover',
                value:"cat_id", //选中的id
                label:"cat_name", //显示的文字
                children:"children", //子节点
                checkStrictly:true  //父子节点是否关联
            },
            //选中的父级分类的id数组
            selectedKeys:[]
        };
    },
    created() {
        this.getCateList();
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get("categories", {
                params: this.querInfo
            });
            if (res.meta.status !== 200) {
                return this.$message.error("商品分类列表获取失败");
            }
            //把数据列表赋值给cateList
            this.cateList = res.data.result;
            // 赋值总条数数据
            this.total = res.data.total;
        },
        //监听pagesize改变的事件 执行时会返回当前的pagesize
        handleSizeChange(newSize) {
            this.querInfo.pagesize = newSize;
            this.getCateList();
        },
        //监听pagenum的改变 返回最新的页码值
        handleCurrentChange(newNum) {
            this.querInfo.pagenum = newNum;
            this.getCateList();
        },
        //弹出添加分类对话框
        showAddCateDailog() {
            // 线获取数据
            this.getParentCateList();
            // 再展示对话框
            this.addCateDialogVisible = true;
        },
        //获取父级分类的数据列表 只要前两级列表的数据，所以type写2就行
        async getParentCateList() {
            const { data: res } = await this.$http.get("categories", {
                params: { type: 2 }
            });
            if (res.meta.status !== 200) {
                return this.$message.error("获取父级分类数据失败");
            }
            this.parentCateList = res.data;
        },
        //选择项发生变化时被触发
        parentCateChange(){
            console.log(this.selectedKeys)
            // 当选中了父节点时,就保存父节点的id 和自身的分类等级
            if(this.selectedKeys.length > 0){
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
                this.addCateForm.cat_level = this.selectedKeys.length
                return
            }else{
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        // 点击确定，发起请求，添加新的分类
        addCate(){
            //点击确定时验证表单
            this.$refs.addCateFormRef.validate(async valid =>{
                if(!valid) return
                const {data:res} = await this.$http.post('categories',this.addCateForm)
                if(res.meta.status !== 201){
                    return this.$message.error('添加分类失败')
                }
                this.$message.success('添加分类成功')
                this.getCateList()
                this.addCateDialogVisible = false
            })
        },
        // 监听添加分类对话框的关闭事件
        addCateDialogClosed(){
            // 重置表单数据
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        }

    }
};
</script>
 
 
<style lang='less' scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader{
    width: 100%;
}
</style>