<template>
    <div>
        <Button type="primary" ghost icon="md-add" @click="handleOpenCreate">添加角色</Button>
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
            @on-sort-change="handleSortChange"
            @on-select="handleSelect"
            @on-select-cancel="handleSelectCancel"
            @on-select-all="handleSelectAll"
            @on-select-all-cancel="handleClearSelect"
        >
            <template slot-scope="{ row }" slot="default_role">
                <Tag color="green" v-if="row.default_role === 1">是</Tag>
                <Tag color="red" v-if="row.default_role === 0">否</Tag>
            </template>
            <template slot-scope="{ row }" slot="action">
                <div @click.stop.prevent>
                    <a type="text" @click="handleOpenMenu(row.id)">菜单权限</a>
                    <Divider type="vertical" />
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
                :title="drawer.type === 'edit' ? '编辑角色' : '添加角色'"
                :before-close="handleCloseEdit"
                :transfer="false"
                width="360"
        >
            <Form
                    v-if="roleInfo && roleInfoReady"
                    ref="roleInfoForm"
                    :model="roleInfo"
                    :rules="roleInfoRules"
                    label-position="top"
                    label-colon
                    hide-required-mark
            >
                <FormItem prop="name" label="角色名称">
                    <Input v-model="roleInfo.name" placeholder="请输入角色名称，必填" />
                </FormItem>
                <FormItem prop="desc" label="说明">
                    <Input v-model="roleInfo.desc" placeholder="请输入说明" />
                </FormItem>
                <FormItem prop="default_role">
                    <div slot="label">
                        是否默认角色
                        <Tooltip content="开启后，新注册用户默认拥有该角色">
                            <Icon type="md-help-circle" />
                        </Tooltip>
                    </div>
                    <Switch v-model="roleInfo.default_role" :true-value="1" :false-value="0">
                        <Icon type="md-checkmark" slot="open"></Icon>
                        <Icon type="md-close" slot="close"></Icon>
                    </Switch>
                </FormItem>
            </Form>
            <div class="page-sys-role-drawer-footer" v-if="drawer.type === 'edit'">
                <Button type="primary" @click="handleSubmitEdit" :loading="submitting">提交</Button>
            </div>
            <div class="page-sys-role-drawer-footer" v-if="drawer.type === 'new'">
                <Button type="primary" @click="handleSubmitNew" :loading="submitting">提交</Button>
            </div>
        </Drawer>
        <Modal v-model="modal.show" :title="roleInfo ? '分配 ' + roleInfo.name + ' 的菜单权限' : ''" :transfer="false" :styles="{top: '24px'}">
            <div :style="modalStyle">
                <Tree :data="roleMenuList" show-checkbox check-strictly check-directly />
            </div>
            <div slot="footer">
                <Button type="primary" ghost v-show="!toggleExpand" @click="handleToggleExpandAll(true)">全部展开</Button>
                <Button type="primary" ghost v-show="toggleExpand" @click="handleToggleExpandAll(false)">全部收起</Button>
                <Button type="primary" ghost v-show="!toggleSelectAll" @click="handleToggleSelectAll(true)">全部选择</Button>
                <Button type="primary" ghost v-show="toggleSelectAll" @click="handleToggleSelectAll(false)">全部取消</Button>
                <Divider type="vertical" />
                <Button type="primary" :loading="submitting" @click="handleSubmitMenu">提交</Button>
            </div>
        </Modal>
    </div>
</template>
<script>
    import { GetRoleList, DeleteRole, DeleteRoleMultiple, UpdateRole, CreateRole, GetMenuList, UpdateRoleMenu } from '@api/system';
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
                        title: 'ID',
                        key: 'id',
                        sortable: 'custom',
                        minWidth: 140,
                        show: false
                    },
                    {
                        title: '角色名称',
                        key: 'name',
                        sortable: 'custom',
                        minWidth: 140,
                        show: true
                    },
                    {
                        title: '说明',
                        key: 'desc',
                        minWidth: 140,
                        show: true
                    },
                    {
                        title: '创建时间',
                        key: 'created_at',
                        sortable: 'custom',
                        minWidth: 200,
                        show: true
                    },
                    {
                        title: '更新时间',
                        key: 'updated_at',
                        sortable: 'custom',
                        minWidth: 200,
                        show: true
                    },
                    {
                        title: '是否默认角色',
                        key: 'default_role',
                        slot: 'default_role',
                        align: 'center',
                        minWidth: 200,
                        show: true
                    },
                    {
                        title: '操作',
                        key: 'action',
                        slot: 'action',
                        minWidth: 200,
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
                drawer: {
                    show: false,
                    type: 'edit', // edit || new
                    styles: {
                        height: 'calc(100% - 55px)',
                        overflow: 'auto',
                        paddingBottom: '53px',
                        position: 'static'
                    }
                },
                roleInfo: null,
                roleInfoRules: {
                    name: [
                        { required: true, message: '请输入角色名称', trigger: 'blur' }
                    ]
                },
                roleInfoString: '',
                roleInfoReady: true,
                submitting: false,
                modal: {
                    show: false
                },
                menuList: [],
                roleMenuList: [],
                toggleExpand: true,
                toggleSelectAll: false
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
            },
            modalStyle () {
                return {
                    height: document.body.clientHeight - 186 + 'px',
                    overflow: 'auto'
                }
            }
        },
        methods: {
            getData () {
                if (this.loading) return;
                this.loading = true;

                GetRoleList({
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
            // 查找单一角色信息
            handleGetRole (id) {
                return this.list.find(item => item.id === id);
            },
            // 删除
            handleDelete (id) {
                if (this.loading) return;
                this.$Modal.confirm({
                    title: '删除确认',
                    content: `您确认要删除角色 <strong>${this.handleGetRole(id).name}</strong>？`,
                    loading: true,
                    onOk: () => {
                        DeleteRole({
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
                    content: `您确认要删除角色 <strong>${names}</strong>？`,
                    loading: true,
                    onOk: () => {
                        DeleteRoleMultiple({
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
                this.roleInfo = cloneDeep(this.handleGetRole(id));
                this.roleInfoString = JSON.stringify(this.roleInfo);
                this.drawer.type = 'edit';
                this.drawer.show = true;
                this.handleInitRoleInfoForm();
            },
            handleInitRoleInfoForm () {
                this.roleInfoReady = false;
                this.$nextTick(() => {
                    this.roleInfoReady = true;
                });
            },
            // 关闭编辑
            handleCloseEdit () {
                // 判断内容是否修改，没修改则直接关闭
                if (this.drawer.type === 'edit') {
                    const editRoleInfo = cloneDeep(this.roleInfo);
                    const editRoleInfoString = JSON.stringify(editRoleInfo);

                    if (editRoleInfoString !== this.roleInfoString) {
                        return new Promise((resolve) => {
                            this.$Modal.confirm({
                                title: '关闭确认',
                                content: '您已经修改了角色信息，是否直接关闭？',
                                onOk: () => {
                                    resolve();
                                }
                            });
                        });
                    }
                }
            },
            // 添加用户
            handleOpenCreate () {
                this.roleInfo = {
                    id: '',
                    name: '',
                    desc: '',
                    created_at: '',
                    updated_at: '',
                    default_role: 0,
                    menu_list: []
                };
                this.drawer.type = 'new';
                this.drawer.show = true;
                this.handleInitRoleInfoForm();
            },
            handleSubmitEdit () {
                if (this.submitting) return;
                this.$refs.roleInfoForm.validate(valid => {
                    if (valid) {
                        this.submitting = true;
                        UpdateRole(this.roleInfo).then(res => {
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
                if (this.submitting) return;
                this.$refs.roleInfoForm.validate(valid => {
                    if (valid) {
                        this.submitting = true;
                        CreateRole(this.roleInfo).then(res => {
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
            // 打开分配权限
            handleOpenMenu (id) {
                this.roleInfo = cloneDeep(this.handleGetRole(id));
                this.roleInfoString = JSON.stringify(this.roleInfo);
                this.roleMenuList = cloneDeep(this.menuList);
                this.handleToggleExpandAll(true, true);
                // 如果数据默认已全选，则修改全选/全反按钮的状态
                this.toggleSelectAll = this.handleCheckSelectAllStatus(this.roleMenuList, []).length === 0;
                this.modal.show = true;
            },
            // 判断是否已经全选，更新toggleSelectAll状态
            handleCheckSelectAllStatus (menuList, checkedList) {
                menuList.forEach(menu => {
                    let newMenu = {};
                    for (let i in menu) {
                        if (i !== 'children') newMenu[i] = cloneDeep(menu[i]);
                    }
                    if (!newMenu.checked) checkedList.push(newMenu);
                    if (menu.children && menu.children.length) newMenu.children = [];
                    menu.children && this.handleCheckSelectAllStatus(menu.children, newMenu.children);
                });
                return checkedList;
            },
            // 展开所有树
            handleToggleExpandAll (status, checkChecked = false) {
                this.toggleExpand = status;
                this.roleMenuList = this.handleToggleExpandNode(this.roleMenuList, status, checkChecked, []);
            },
            /**
             * @description 递归状态
             * @param {Array} menuList 原数据
             * @param {Boolean} isExpand 是否展开
             * @param {Boolean} checkChecked 是否选中
             * @param {Array} lastList 递归数据
             * */
            handleToggleExpandNode (menuList, isExpand, checkChecked, lastList) {
                menuList.forEach(menu => {
                    let newMenu = {};
                    for (let i in menu) {
                        if (i !== 'children') newMenu[i] = cloneDeep(menu[i]);
                    }
                    newMenu.expand = isExpand;
                    if (checkChecked) {
                        const roleMenuList = [...this.roleInfo.menu_list];
                        newMenu.checked = !!roleMenuList.find(item => item === newMenu.id);
                    }
                    if (menu.children && menu.children.length) newMenu.children = [];

                    lastList.push(newMenu);
                    menu.children && this.handleToggleExpandNode(menu.children, isExpand, checkChecked, newMenu.children);
                });
                return lastList;
            },
            // 全选/全取消
            handleToggleSelectAll (status) {
                this.toggleSelectAll = status;
                this.roleMenuList = this.handleToggleSelectAllNode(this.roleMenuList, status, []);
            },
            /**
             * @description 全选/全取消
             * @param {Array} menuList 原数据
             * @param {Boolean} isSelectAll 是否全选
             * @param {Array} lastList 递归数据
             * */
            handleToggleSelectAllNode (menuList, isSelectAll, lastList) {
                menuList.forEach(menu => {
                    let newMenu = {};
                    for (let i in menu) {
                        if (i !== 'children') newMenu[i] = cloneDeep(menu[i]);
                    }
                    newMenu.checked = isSelectAll;
                    if (menu.children && menu.children.length) newMenu.children = [];

                    lastList.push(newMenu);
                    menu.children && this.handleToggleSelectAllNode(menu.children, isSelectAll, newMenu.children);
                });
                return lastList;
            },
            // 获取菜单数据
            handleGetMenuList () {
                GetMenuList().then(res => {
                    this.menuList = res.list;
                });
            },
            handleSubmitMenu () {
                if (this.submitting) return;
                this.submitting = true;
                UpdateRoleMenu({
                    id: this.roleInfo.id,
                    menuIds: this.handleGetMenuIds(this.roleMenuList, [])
                }).then(res => {
                    this.submitting = false;
                    this.modal.show = false;
                    this.$Message.error(res.msg);
                    // 完成后刷新数据
                    // this.handleClearSelect();
                    // this.handleChangePage(1);
                });
            },
            handleGetMenuIds (menuList, ids) {
                menuList.forEach(menu => {
                    let newMenu = {};
                    for (let i in menu) {
                        if (i !== 'children') newMenu[i] = cloneDeep(menu[i]);
                    }
                    if (newMenu.checked) ids.push(newMenu.id);
                    if (menu.children && menu.children.length) newMenu.children = [];
                    menu.children && this.handleGetMenuIds(menu.children, ids);
                });
                return ids;
            }
        },
        mounted () {
            this.handleGetMenuList();
        }
    }
</script>
<style lang="less">
    .page-sys-role{
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
        }
    }
</style>
