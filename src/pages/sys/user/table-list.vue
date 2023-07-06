<template>
    <div>
        <Button type="primary" ghost icon="md-add" @click="handleOpenCreate">添加用户</Button>
        <Button @click="handleDeleteMultiple" type="error" ghost icon="md-trash" class="ivu-ml-8" v-show="selectedData.length">批量删除</Button>
        <div class="ivu-inline-block ivu-fr">
            <Dropdown @on-click="handleChangeTableSize" trigger="click">
                <Tooltip class="ivu-ml" content="密度" placement="top">
                    <i-link>
                        <Icon type="md-list" />
                    </i-link>
                </Tooltip>
                <DropdownMenu slot="list">
                    <DropdownItem name="default" :selected="tableSize === 'default'">默认</DropdownItem>
                    <DropdownItem name="large" :selected="tableSize === 'large'">宽松</DropdownItem>
                    <DropdownItem name="small" :selected="tableSize === 'small'">紧凑</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <Tooltip class="ivu-ml" :content="tableFullscreen ? '退出全屏' : '全屏'" placement="top">
                <i-link @click.native="handleFullscreen">
                    <Icon :custom="tableFullscreen ? 'i-icon i-icon-exit-full-screen' : 'i-icon i-icon-full-screen'" />
                </i-link>
            </Tooltip>
            <Tooltip class="ivu-ml" content="刷新" placement="top">
                <i-link @click.native="handleRefresh">
                    <Icon custom="i-icon i-icon-refresh" />
                </i-link>
            </Tooltip>
            <Dropdown trigger="click">
                <Tooltip class="ivu-ml" content="列设置" placement="top">
                    <i-link>
                        <Icon type="md-options" />
                    </i-link>
                </Tooltip>
                <DropdownMenu slot="list">
                    <div class="ivu-p-8">列展示</div>
                    <Divider size="small" class="ivu-mt-8 ivu-mb-8" />
                    <li class="ivu-dropdown-item" v-for="item in columns" :key="item.title" v-if="item.title" @click="item.show = !item.show">
                        <Checkbox v-model="item.show"></Checkbox>
                        <span>{{ item.title }}</span>
                    </li>
                </DropdownMenu>
            </Dropdown>
        </div>
        <Table
            ref="table"
            :columns="tableColumns"
            :data="list"
            :loading="loading"
            :size="tableSize"
            class="ivu-mt"
            @on-row-click="handleClickRow"
            @on-sort-change="handleSortChange"
            @on-select="handleSelect"
            @on-select-cancel="handleSelectCancel"
            @on-select-all="handleSelectAll"
            @on-select-all-cancel="handleClearSelect"
        >
            <template slot-scope="{ row }" slot="name">
                <Avatar shape="square" :src="row.avatar" v-if="row.avatar" />
                <Avatar shape="square" icon="ios-person" v-else />
                {{ row.name }}
            </template>
            <template slot-scope="{ row }" slot="status">
                <Badge v-if="row.status === 1" color="green" text="正常" />
                <Badge v-if="row.status === 2" color="yellow" text="冻结" />
                <Badge v-if="row.status === 3" color="red" text="关闭" />
            </template>
            <template slot-scope="{ row }" slot="gender">
                <Tag v-if="row.gender === 1" color="blue">男</Tag>
                <Tag v-if="row.gender === 2" color="magenta">女</Tag>
            </template>
            <template slot-scope="{ row }" slot="action">
                <div @click.stop.prevent>
                    <a type="text" @click="handleEdit(row.id)">编辑</a>
                    <Divider type="vertical" />
                    <a type="text" @click="handleDelete(row.id)">删除</a>
                </div>
            </template>
        </Table>
        <div class="ivu-mt ivu-text-center">
            <Page
                :total="total"
                :current.sync="current"
                show-total
                show-sizer
                show-elevator
                :page-size="limit"
                @on-change="handleChangePage"
                @on-page-size-change="handleChangePageSize"
            />
        </div>
        <Drawer
                :styles="drawer.styles"
                v-model="drawer.show"
                :title="drawer.type === 'edit' ? '编辑用户' : drawer.type === 'new' ? '添加用户' : '用户信息'"
                width="560"
                :before-close="handleCloseEdit"
                :transfer="false"
        >
            <Form
                    v-if="userInfo && userInfoFormReady"
                    ref="userInfoForm"
                    class="page-sys-user-drawer-form"
                    :model="userInfo"
                    :rules="userInfoRules"
                    :disabled="drawer.type === 'read'"
                    label-position="top"
                    label-colon
                    hide-required-mark
            >
                <Row :gutter="32" v-if="drawer.type !== 'new'">
                    <Col span="10" class="ivu-text-center">
                        <Avatar v-if="userInfo.avatar" :size="64" shape="square" :src="userInfo.avatar" />
                        <Avatar v-else :size="64" shape="square" icon="ios-person" />
                        <Upload v-if="drawer.type === 'edit'" class="ivu-mt-8" :show-upload-list="false" action="//jsonplaceholder.typicode.com/posts/">
                            <Button type="text">
                                修改 <Icon type="ios-create-outline" />
                            </Button>
                        </Upload>
                    </Col>
                    <Col span="14">
                        <div>用户 ID：{{ userInfo.id }}</div>
                        <div class="ivu-mt-8">登录账号：{{ userInfo.account }}</div>
                        <div class="ivu-mt-8">创建时间：{{ userInfo.date }}</div>
                    </Col>
                </Row>
                <Divider v-if="drawer.type !== 'new'" />
                <Row :gutter="32">
                    <Col span="12">
                        <FormItem prop="name" label="用户名">
                            <Input v-model="userInfo.name" placeholder="请输入用户名，必填" />
                        </FormItem>
                    </Col>
                    <Col span="12">
                        <FormItem prop="phone" label="手机号">
                            <Input v-model="userInfo.phone" placeholder="请输入手机号，必填" maxlength="11" />
                        </FormItem>
                    </Col>
                </Row>
                <Row :gutter="32">
                    <Col span="12">
                        <FormItem prop="mail" label="邮箱">
                            <Input v-model="userInfo.mail" placeholder="请输入邮箱，必填" />
                        </FormItem>
                    </Col>
                    <Col span="12">
                        <FormItem prop="gender" label="性别">
                            <Select v-model="userInfo.gender" placeholder="请选择性别">
                                <Option :value="1">男</Option>
                                <Option :value="2">女</Option>
                            </Select>
                        </FormItem>
                    </Col>
                </Row>
                <Row :gutter="32">
                    <Col span="12">
                        <FormItem prop="status" label="状态">
                            <Select v-model="userInfo.status" placeholder="请选择状态">
                                <Option :value="1">正常</Option>
                                <Option :value="2">冻结</Option>
                                <Option :value="3">关闭</Option>
                            </Select>
                        </FormItem>
                    </Col>
                    <Col span="12">
                        <FormItem prop="role" label="角色分配">
                            <Select v-model="userInfo.role" multiple placeholder="请选择角色">
                                <Option value="ROLE_USER">
                                    ROLE_USER
                                    <span v-color="'#c5c8ce'">普通用户</span>
                                </Option>
                                <Option value="ROLE_ADMIN">
                                    ROLE_ADMIN
                                    <span v-color="'#c5c8ce'">管理员</span>
                                </Option>
                                <Option value="ROLE_OP">
                                    ROLE_OP
                                    <span v-color="'#c5c8ce'">运营</span>
                                </Option>
                            </Select>
                        </FormItem>
                    </Col>
                </Row>
                <Row :gutter="32" v-if="drawer.type === 'new'">
                    <Col span="12">
                        <FormItem prop="account" label="登录账号">
                            <Input v-model="userInfo.account" placeholder="请输入登录账号，必填" />
                        </FormItem>
                    </Col>
                </Row>
                <Divider />
                <Row :gutter="32">
                    <Col span="12">
                        <FormItem prop="region" label="地区">
                            <!--地区选择器组件是物料市场内容，需要额外付费购买，Admin Pro 无限制用户免费享有。购买的 Admin Pro 中不包含地区选择器。-->
                            <!--行政区域选择组件：https://pro.iviewui.com/store/item/1247106998852521984-->
                            <!--<i-region class="page-sys-user-drawer-form-region" v-model="userInfo.region" type="district" data-type="name" placeholder="请选择地区" />-->
                        </FormItem>
                    </Col>
                    <Col span="12">
                        <FormItem prop="birthday" label="生日">
                            <DatePicker v-model="userInfo.birthday" placeholder="请选择日期" v-width="'100%'" />
                        </FormItem>
                    </Col>
                    <Col span="24">
                        <Alert type="warning" show-icon>
                            <template slot="desc">
                                地区选择器组件是物料市场内容，需要额外付费购买，Admin Pro 无限制用户免费享有。购买的 Admin Pro 中不包含地区选择器。
                            </template>
                        </Alert>
                    </Col>
                </Row>
                <FormItem prop="desc" label="个人介绍">
                    <Input v-model="userInfo.desc" placeholder="请输入个人介绍" type="textarea" :autosize="{ minRows: 3 }" />
                </FormItem>
            </Form>
            <div class="page-sys-user-drawer-footer" v-if="drawer.type === 'edit'">
                <Button type="primary" @click="handleSubmitEdit" :loading="submitting">提交</Button>
            </div>
            <div class="page-sys-user-drawer-footer" v-if="drawer.type === 'new'">
                <Button type="primary" @click="handleSubmitNew" :loading="submitting">提交</Button>
            </div>
        </Drawer>
    </div>
</template>
<script>
    import { GetUserList, DeleteUser, DeleteUserMultiple, UpdateUser, CreateUser } from '@api/system';
    import { cloneDeep } from 'lodash';

    export default {
        data () {
            return {
                columns: [
                    {
                        type: 'selection',
                        minWidth: 60,
                        align: 'center',
                        show: true
                    },
                    {
                        title: '用户名',
                        key: 'name',
                        slot: 'name',
                        sortable: 'custom',
                        minWidth: 140,
                        show: true
                    },
                    {
                        title: '登录账号',
                        key: 'account',
                        sortable: 'custom',
                        minWidth: 120,
                        show: true
                    },
                    {
                        title: '手机号',
                        key: 'phone',
                        minWidth: 140,
                        show: true
                    },
                    {
                        title: '邮箱',
                        key: 'mail',
                        minWidth: 200,
                        show: true
                    },
                    {
                        title: '性别',
                        key: 'gender',
                        slot: 'gender',
                        minWidth: 100,
                        show: true
                    },
                    {
                        title: '状态',
                        key: 'status',
                        slot: 'status',
                        minWidth: 100,
                        show: true
                    },
                    {
                        title: '创建时间',
                        key: 'date',
                        sortable: 'custom',
                        minWidth: 200,
                        show: true
                    },
                    {
                        title: '用户 ID',
                        key: 'id',
                        minWidth: 120,
                        show: false
                    },
                    {
                        title: '生日',
                        key: 'birthday',
                        minWidth: 120,
                        show: false
                    },
                    {
                        title: '操作',
                        key: 'action',
                        slot: 'action',
                        minWidth: 120,
                        align: 'center',
                        fixed: 'right',
                        show: true
                    }
                ],
                loading: false,
                list: [],
                selectedData: [],
                current: 1,
                limit: 10,
                total: 0,
                sortType: 'normal', // 当前排序类型，可选值为：normal（默认） || asc（升序）|| desc（降序）,
                sortKey: '', // 排序列的 key
                tableSize: 'default',
                tableFullscreen: false,
                userInfo: null, // 当前选中的用户信息
                userInfoString: '', // 当前选中的用户信息字符串
                userInfoRules: {
                    name: [
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    phone: [
                        { required: true, message: '请输入手机号', trigger: 'blur' }
                    ],
                    mail: [
                        { required: true, message: '请输入邮箱', trigger: 'blur' }
                    ],
                    account: [
                        { required: true, message: '请输入登录账号', trigger: 'blur' }
                    ]
                },
                userInfoFormReady: true,
                drawer: {
                    show: false,
                    type: 'edit', // edit || read || new
                    styles: {
                        height: 'calc(100% - 55px)',
                        overflow: 'auto',
                        paddingBottom: '53px',
                        position: 'static'
                    }
                },
                submitting: false
            }
        },
        computed: {
            // 动态设置列
            tableColumns () {
                const columns = [...this.columns];
                return columns.filter(item => item.show);
            },
            offset () {
                return (this.current - 1) * this.limit;
            }
        },
        methods: {
            getData () {
                if (this.loading) return;
                this.loading = true;
                // 下面的 params 是获取的表单查询参数
                const params = this.$parent.$parent.$refs.form.data;
                GetUserList({
                    name: params.name,
                    phone: params.phone,
                    mail: params.mail,
                    gender: params.gender,
                    account: params.account,
                    id: params.id,
                    status: params.status,
                    date: params.date.length === 2 && params.date[0] !== '' && params.date[1] !== '' ? [this.$Date(params.date[0]).format('YYYY-MM-DD') + ' 00:00:00', this.$Date(params.date[1]).format('YYYY-MM-DD') + ' 23:59:59'] : [],
                    offset: this.offset, // 起始页
                    limit: this.limit, // 查询数量
                    sortType: this.sortType,
                    sortKey: this.sortKey
                }).then(res => {
                    this.handleClearSelect();
                    this.list = res.list;
                    this.total = res.total;
                    this.loading = false;
                });
            },
            // 改变表格尺寸
            handleChangeTableSize (size) {
                this.tableSize = size;
            },
            // 表格全屏
            handleFullscreen () {
                this.tableFullscreen = !this.tableFullscreen;
                this.$emit('on-fullscreen', this.tableFullscreen);
            },
            // 刷新表格数据
            handleRefresh () {
                this.getData();
            },
            // 切换页码
            handleChangePage (page) {
                this.current = page;
                this.getData();
            },
            // 切换每页条数
            handleChangePageSize (size) {
                this.current = 1;
                this.limit = size;
                this.getData();
            },
            // 排序
            handleSortChange ({ key, order }) {
                this.current = 1;
                this.sortType = order;
                this.sortKey = key;
                this.getData();
            },
            // 选中一项，将数据添加至已选项中
            handleSelect (selection, row) {
                this.selectedData.push(row);
            },
            // 取消选中一项，将取消的数据从已选项中删除
            handleSelectCancel (selection, row) {
                const index = this.selectedData.findIndex(item => item.id === row.id);
                this.selectedData.splice(index, 1);
            },
            // 当前页全选时，判断已选数据是否存在，不存在则添加
            handleSelectAll (selection) {
                selection.forEach(item => {
                    if (this.selectedData.findIndex(i => i.id === item.id) < 0) {
                        this.selectedData.push(item);
                    }
                });
            },
            // 清空所有已选项
            handleClearSelect () {
                this.selectedData = [];
            },
            // 查找单一用户信息
            handleGetUser (id) {
                return this.list.find(item => item.id === id);
            },
            // 删除
            handleDelete (id) {
                if (this.loading) return;
                this.$Modal.confirm({
                    title: '删除确认',
                    content: `您确认要删除用户<strong>${this.handleGetUser(id).name}</strong>？`,
                    loading: true,
                    onOk: () => {
                        DeleteUser({
                            id
                        }).then(res => {
                            this.$Modal.remove();
                            this.$Message.error(res.msg);
                            // 完成后刷新数据
                            // this.handleClearSelect();
                            // this.handleChangePage(1);
                        });
                    }
                });
            },
            // 批量删除
            handleDeleteMultiple () {
                if (this.loading) return;
                const ids = this.selectedData.map(item => item.id);
                const names = this.selectedData.map(item => item.name);
                this.$Modal.confirm({
                    title: '删除确认',
                    content: `您确认要删除用户<strong>${names}</strong>？`,
                    loading: true,
                    onOk: () => {
                        DeleteUserMultiple({
                            ids
                        }).then(res => {
                            this.$Modal.remove();
                            this.$Message.error(res.msg);
                            // 完成后刷新数据
                            // this.handleClearSelect();
                            // this.handleChangePage(1);
                        });
                    }
                });
            },
            // 编辑
            handleEdit (id) {
                this.userInfo = cloneDeep(this.handleGetUser(id));
                this.userInfo.birthday = this.$Date(this.userInfo.birthday).format('YYYY-MM-DD');
                this.userInfoString = JSON.stringify(this.userInfo);
                this.drawer.type = 'edit';
                this.drawer.show = true;
                this.handleInitUserInfoForm();
            },
            // 关闭编辑
            handleCloseEdit () {
                // 判断内容是否修改，没修改则直接关闭
                if (this.drawer.type === 'edit') {
                    const editUserInfo = cloneDeep(this.userInfo);
                    editUserInfo.birthday = this.$Date(editUserInfo.birthday).format('YYYY-MM-DD');
                    const editUserInfoString = JSON.stringify(editUserInfo);

                    if (editUserInfoString !== this.userInfoString) {
                        return new Promise((resolve) => {
                            this.$Modal.confirm({
                                title: '关闭确认',
                                content: '您已经修改了用户信息，是否直接关闭？',
                                onOk: () => {
                                    resolve();
                                }
                            });
                        });
                    }
                }
            },
            // 用户详情
            handleClickRow (row) {
                this.userInfo = cloneDeep(this.handleGetUser(row.id));
                this.drawer.type = 'read';
                this.drawer.show = true;
                this.handleInitUserInfoForm();
            },
            // 添加用户
            handleOpenCreate () {
                this.userInfo = {
                    id: '',
                    name: '',
                    avatar: '',
                    account: '',
                    phone: '',
                    mail: '',
                    gender: 1,
                    status: 1,
                    date: '',
                    birthday: '',
                    region: [],
                    role: [],
                    desc: ''
                };
                this.drawer.type = 'new';
                this.drawer.show = true;
                this.handleInitUserInfoForm();
            },
            handleSubmitEdit () {
                this.$refs.userInfoForm.validate(valid => {
                    if (valid) {
                        if (this.submitting) return;
                        this.submitting = true;
                        UpdateUser(this.userInfo).then(res => {
                            this.submitting = false;
                            this.drawer.show = false;
                            this.$Message.error(res.msg);
                            // 完成后刷新数据
                            // this.handleClearSelect();
                            // this.handleChangePage(1);
                        });
                    }
                });
            },
            handleSubmitNew () {
                this.$refs.userInfoForm.validate(valid => {
                    if (valid) {
                        if (this.submitting) return;
                        this.submitting = true;
                        CreateUser(this.userInfo).then(res => {
                            this.submitting = false;
                            this.drawer.show = false;
                            this.$Message.error(res.msg);
                            // 完成后刷新数据
                            // this.handleClearSelect();
                            // this.handleChangePage(1);
                        });
                    }
                });
            },
            handleInitUserInfoForm () {
                this.userInfoFormReady = false;
                this.$nextTick(() => {
                    this.userInfoFormReady = true;
                });
            }
        }
    }
</script>
<style lang="less">
    .page-sys-user{
        &-drawer{
            &-footer{
                width: 100%;
                position: absolute;
                bottom: 0;
                left: 0;
                border-top: 1px solid #e8e8e8;
                padding: 10px 16px;
                text-align: right;
                background: #fff;
            }
            &-form{
                .ivu-input[disabled], fieldset[disabled] .ivu-input, .ivu-select-disabled .ivu-select-selection{
                    background-color: #fff;
                    color: inherit;
                }
                &-region{
                    .i-region-transfer{
                        width: 270px;
                    }
                    .i-region-drop-main{
                        width: 270px !important;
                        height: 200px;
                        overflow: auto;
                        column-count: 2;
                        &-item{
                            line-height: normal;
                        }
                    }
                }
            }
        }
    }
</style>
