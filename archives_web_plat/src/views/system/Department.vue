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
        <el-table :data="department" highlight-current-row v-loading="listLoading" @row-click="rowClick"
                  @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="60">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="部门名称" min-width="10%" sortable>
            </el-table-column>
            <el-table-column prop="sn" label="部门标识" min-width="10%" sortable>
            </el-table-column>
            <el-table-column prop="telephoneNumber" label="联系电话" min-width="10%" sortable>
            </el-table-column>
            <el-table-column prop="fax" label="传真" min-width="10%" sortable>
            </el-table-column>
            <el-table-column prop="parentId" label="上级部门" min-width="10%" sortable>
                <template slot-scope="scope">
                    <span v-for="value in departmentSelect">
                        <el-tag v-if="value.value==scope.row.parentId" :type="value.color" close-transition>{{value.label}} </el-tag>
                    </span>
                </template>
            </el-table-column>
            <el-table-column prop="departmentHeadId" label="部门主管" min-width="10%" sortable>
            </el-table-column>
            <el-table-column prop="remarks" label="备注" min-width="10%" sortable>
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
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="部门标识" prop="sn">
                    <el-input v-model="form.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="联系电话" prop="telephoneNumber">
                    <el-input v-model="form.telephoneNumber" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="传真" prop="fax">
                    <el-input v-model="form.fax" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="上级部门" prop="parentId">
                    <template>
                        <el-select v-model="form.parentId" placeholder="请选择">
                            <el-option
                                    v-for="item in departmentSelect"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                    :disabled="item.disabled">
                            </el-option>
                        </el-select>
                    </template>
                </el-form-item>
                <el-form-item label="部门主管" prop="departmentHeadId">
                    <el-input v-model="form.departmentHeadId" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="备注" prop="remarks">
                    <el-input v-model="form.remarks" auto-complete="off"></el-input>
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
                department: [],
                departmentSelect:[],
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
                    sn: '',
                    name: '',
                    telephoneNumber: '',
                    fax: '',
                    route: '',
                    parentId: '',
                    departmentHeadId: '',
                    remarks: '',
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
            //获取部门详情
            getDeparment() {
                let params = {
                    keyword: this.filters.keyword,
                    rows: this.rows,
                    page: this.page
                };
                this.listLoading = true;
                this.$http.post("/common/department/json", params).then((res) => {
                    this.total = res.data.total;
                    this.department = res.data.rows;
                    this.listLoading = false;
                });
                this.getDepartmentSelectData();
            },
            //获取部门下拉框数据
            getDepartmentSelectData() {
                this.listLoading = true;
                this.$http.get("/common/department/getSelectData").then((res) => {
                    this.departmentSelect = res.data;
                    this.listLoading = false;
                });
            },
            //删除
            handleDel: function (row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    this.$http.delete("/common/department/delete/" + row.id).then((res) => {
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
                    sn:
                        '',
                    name:
                        '',
                    telephoneNumber:
                        '',
                    fax:
                        '',
                    route:
                        '',
                    parentId:
                        '',
                    departmentHeadId:
                        '',
                    remarks:
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
                            this.$http.post("/common/department/save", params).then((res) => {
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
                    this.$http.delete("/common/department/deleteBatches/" + ids).then((res) => {
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
            this.getDeparment();
        }
    }

</script>

<style scoped>

</style>
