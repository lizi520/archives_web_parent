<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="请输入查询类容"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getDictionariesDir">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>
        <!--列表-->
        <el-table :data="dictionariesDetail" highlight-current-row v-loading="listLoading" @row-click="rowClick"
                  @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="60">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="名称" min-width="10%" sortable>
            </el-table-column>
            <el-table-column prop="serialNumber" label="序号" min-width="15%" sortable>
            </el-table-column>
            <el-table-column prop="dictionariesDirId" label="类型" min-width="15%" sortable>
                <template slot-scope="scope">
                    <span v-for="value in dictionariesDirSelect">
                        <el-tag v-if="value.value==scope.row.dictionariesDirId" :type="value.color" close-transition>{{value.label}} </el-tag>
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" min-width="10%" :filters="tags" :filter-method="filterTag"
                             filter-placement="bottom-end">
                <template slot-scope="scope">
                    <span v-for="(value,index) in tags">
                        <el-tag v-if="value.value==scope.row.status" :type="tags[index].color" close-transition>{{value.text}} </el-tag>
                    </span>
                </template>
            </el-table-column>
            <el-table-column label="操作" min-width="10%">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length==0">批量删除</el-button>
            <el-pagination layout="sizes, prev, pager, next" @size-change="handleSizeChange" :current-page.sync="page"
                           @current-change="handleCurrentChange" :page-sizes="[10, 20, 50, 100]" :page-size="rows"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--编辑界面-->
        <el-dialog title="编辑" v-model="formVisible" :close-on-click-modal="false">
            <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="序号" prop="serialNumber">
                    <el-input v-model="form.serialNumber" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="类型" prop="dictionariesDirId">
                    <template>
                        <el-select v-model="form.dictionariesDirId" placeholder="请选择">
                            <el-option
                                    v-for="item in dictionariesDirSelect"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <template>
                        <el-select v-model="form.status" placeholder="请选择">
                            <el-option
                                    v-for="item in tags"
                                    :key="item.value"
                                    :label="item.text"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="add_editSubmit" :loading="editLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import Vue from 'vue';
    import SelectTree from '@/components/SelectTree.vue';
    import VueQuillEditor from 'vue-quill-editor';
    // require styles 引入样式
    import 'quill/dist/quill.core.css';
    import 'quill/dist/quill.snow.css';
    import 'quill/dist/quill.bubble.css';

    Vue.use(VueQuillEditor);

    export default {
        components: {
            SelectTree,
        },
        data() {
            return {
                filters: {
                    keyword: ''
                },
                dictionariesDetail: [],
                dictionariesDirSelect: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                fileList2: [],
                rows: 10,
                formVisible: false,//编辑界面是否显示
                editLoading: false,
                curentRow: null,
                tags: [{text: '在使用', value: 0, color: 'success'}, {text: '已废弃', value: -1, color: 'danger'}],
                formRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //编辑界面数据
                form: {
                    id: '',
                    name: '',
                    serialNumber: '',
                    dictionariesDirId: '',
                    status: '',
                },
            }
        },
        methods: {
            filterTag(value, row) {
                return row.status == value;
            },
            handleSizeChange(val) {
                this.rows = val;
                this.getDictionariesDir();
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getDictionariesDir();
            },
            rowClick(row, event, column) {
                this.curentRow = row;
            },
            //获取字典目录
            getDictionariesDir() {
                let params = {
                    keyword: this.filters.keyword,
                    rows: this.rows,
                    page: this.page
                };
                this.listLoading = true;
                this.$http.post("/common/dictionariesDetail/json", params).then((res) => {
                    this.total = res.data.total;
                    this.dictionariesDetail = res.data.rows;
                    this.listLoading = false;
                });
            },
            //获取字典目录下拉框数据
            getDictionariesDirSelectData() {
                this.listLoading = true;
                this.$http.get("/common/dictionariesDir/getSelectData").then((res) => {
                    this.dictionariesDirSelect = res.data;
                    this.listLoading = false;
                });
            },
            //删除
            handleDel: function (row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    this.$http.delete("/common/dictionariesDetail/delete/" + row.id).then((res) => {
                        this.listLoading = false;
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功!',
                                type: 'success'
                            });
                        } else {
                            this.$message({
                                message: '删除失败!',
                                type: 'error'
                            });
                        }
                        this.getDictionariesDir();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.formVisible = true;
                this.form = Object.assign({}, row);
            },
            //显示新增界面
            handleAdd: function () {
                this.formVisible = true;
                this.fileList2 = [];
                this.form = {
                    id:
                        '',
                    name:
                        '',
                    serialNumber:
                        '',
                    dictionariesDirId:
                        '',
                    status:
                        '',
                }
                ;
            },
            //编辑
            add_editSubmit: function () {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        console.log(this.fileList2);
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let params = Object.assign({}, this.form);
                            this.$http.post("/common/dictionariesDetail/save", params).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                if (res.data.success) {
                                    this.$message({
                                        message: '提交成功!',
                                        type: 'success'
                                    });
                                } else {
                                    this.$message({
                                        message: '提交失败!',
                                        type: 'error'
                                    });
                                }
                                this.$refs['form'].resetFields();
                                this.formVisible = false;
                                this.getDictionariesDir();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    this.$http.delete("/common/dictionariesDetail/deleteBatches/" + ids).then((res) => {
                        this.listLoading = false;
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功!',
                                type: 'success'
                            });
                        } else {
                            this.$message({
                                message: '删除失败!',
                                type: 'error'
                            });
                        }
                        this.getDictionariesDir();
                    });
                }).catch(() => {
                });
            },
        },
        mounted() {
            this.getDictionariesDir();
            this.getDictionariesDirSelectData();
        }
    }

</script>

<style scoped>

</style>
