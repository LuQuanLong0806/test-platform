<template>
    <div>
        <div class="i-layout-page-header">
            <PageHeader title="菜单权限管理" content="页面数据为 Mock 示例数据，非真实数据。" hidden-breadcrumb />
        </div>
        <Row :gutter="24" class="ivu-mt">
            <Col :xl="10" :lg="24" :md="24" :sm="24" :xs="24" class="ivu-mb">
                <Affix :offset-top="108">
                    <Card :bordered="false" dis-hover class="ivu-mb">
                        <div slot="title">
                            <Dropdown>
                                <Button type="primary" ghost>
                                    添加菜单
                                    <Icon type="ios-arrow-down"></Icon>
                                </Button>
                                <DropdownMenu slot="list">
                                    <DropdownItem @click.native="handleOpenCreateHeader">添加顶栏菜单</DropdownItem>
                                    <DropdownItem :disabled="!menuInfo" @click.native="handleOpenCreateSider">添加子菜单</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                            <Button type="primary" ghost class="ivu-ml" v-show="!toggleExpand" @click="handleToggleExpandAll(true)">
                                <Icon type="md-list" />
                                全部展开
                            </Button>
                            <Button type="primary" ghost class="ivu-ml" v-show="toggleExpand" @click="handleToggleExpandAll(false)">
                                <Icon type="md-list" />
                                全部收起
                            </Button>
                            <Button type="error" ghost class="ivu-ml" v-show="selectedData.length" @click="handleDeleteMultiple">
                                <Icon type="md-trash" />
                                批量删除
                            </Button>
                        </div>
                        <div :style="menuListStyle">
                            <div class="ivu-p-8">
                                <Input v-if="menuList.length || query !== ''" v-model="query" search placeholder="输入菜单名称搜索" @on-change="handleSearch" />
                            </div>
                            <Tree
                                    :data="menuList"
                                    show-checkbox
                                    check-strictly
                                    @on-select-change="handleSelectNode"
                                    @on-check-change="handleCheckNode"
                                    @on-contextmenu="handleContextMenu"
                            >
                                <template slot="contextMenu">
                                    <DropdownItem @click.native="handleContextMenuEdit">编辑</DropdownItem>
                                    <DropdownItem @click.native="handleContextMenuNew">添加子菜单</DropdownItem>
                                    <DropdownItem divided @click.native="handleContextMenuDelete" style="color: #ed4014">删除</DropdownItem>
                                </template>
                            </Tree>
                        </div>
                    </Card>
                </Affix>
            </Col>
            <Col :xl="14" :lg="24" :md="24" :sm="24" :xs="24" class="ivu-mb">
                <Card :bordered="false" dis-hover class="ivu-mb">
                    <div slot="title">
                        <Avatar icon="md-apps" size="small" v-color="'#1890ff'" v-bg-color="'#e6f7ff'" />
                        <span class="ivu-pl-8">编辑菜单</span>
                        <span v-if="menuInfo">：{{ menuInfo.title }}</span>
                    </div>
                    <div>
                        <div v-show="!menuInfo">
                            <Alert>从菜单列表选择一项后，进行编辑</Alert>
                        </div>
                        <Form
                                v-if="editMenuData && editMenuReady"
                                ref="infoForm"
                                :model="editMenuData"
                                :rules="editMenuRules"
                                label-position="right"
                                :label-width="100"
                                label-colon
                                hide-required-mark>
                            <FormItem label="类型">
                                <span v-if="editMenuData.name">顶栏菜单</span>
                                <span v-else>侧边栏菜单</span>
                            </FormItem>
                            <FormItem prop="title" label="标题">
                                <Input v-model="editMenuData.title" placeholder="请输入标题，必填" />
                            </FormItem>
                            <FormItem prop="subtitle" label="副标题" v-if="!editMenuData.name">
                                <Input v-model="editMenuData.subtitle" placeholder="请输入副标题" />
                            </FormItem>
                            <FormItem prop="path" label="路径">
                                <Input v-model="editMenuData.path" placeholder="请输入路径，必填" />
                            </FormItem>
                            <FormItem prop="target" label="打开方式">
                                <RadioGroup v-model="editMenuData.target">
                                    <Radio label="_self">当前窗口</Radio>
                                    <Radio label="_blank">新窗口</Radio>
                                </RadioGroup>
                            </FormItem>
                            <FormItem prop="divided" v-if="!editMenuData.name">
                                <div slot="label">
                                    分割线
                                    <Tooltip content="菜单折叠时是否显示分割线">
                                        <Icon type="md-help-circle" />
                                    </Tooltip>
                                </div>
                                <Switch v-model="editMenuData.divided">
                                    <Icon type="md-checkmark" slot="open" />
                                    <Icon type="md-close" slot="close" />
                                </Switch>
                            </FormItem>
                            <FormItem prop="name" v-if="editMenuData.name">
                                <div slot="label">
                                    菜单 Name
                                    <Tooltip content="详见文档：基础功能-添加菜单">
                                        <Icon type="md-help-circle" />
                                    </Tooltip>
                                </div>
                                <Input v-model="editMenuData.name" placeholder="请输入顶栏菜单 Name" />
                            </FormItem>
                            <FormItem prop="icon" label="图标">
                                <!--图标选择器组件是物料市场内容，需要额外付费购买，Admin Pro 无限制用户免费享有。购买的 Admin Pro 中不包含图标选择器。-->
                                <!--图标选择器组件：https://pro.iviewui.com/store/item/1328603625278279680-->
                                <!--<i-icon-select v-model="editMenuData.icon" clearable placeholder="请选择图标" search show-title />-->
                                <Input v-model="editMenuData.icon" placeholder="请选择图标" />
                                <Alert type="warning" show-icon>
                                    <template slot="desc">
                                        图标选择器组件是物料市场内容，需要额外付费购买，Admin Pro 无限制用户免费享有。购买的 Admin Pro 中不包含图标选择器。
                                    </template>
                                </Alert>
                            </FormItem>
                            <FormItem prop="auth">
                                <div slot="label">
                                    菜单权限
                                    <Tooltip content="详见文档：鉴权">
                                        <Icon type="md-help-circle" />
                                    </Tooltip>
                                </div>
                                <Input v-model="editMenuData.auth" placeholder="权限，逗号分隔" />
                            </FormItem>
                            <FormItem prop="hideSider" label="隐藏侧边栏" v-if="editMenuData.name">
                                <Switch v-model="editMenuData.hideSider">
                                    <Icon type="md-checkmark" slot="open" />
                                    <Icon type="md-close" slot="close" />
                                </Switch>
                            </FormItem>
                            <FormItem>
                                <Button type="primary" @click="handleSubmitUpdate" :loading="submitting">保存修改</Button>
                                <Button @click="handleResetUpdate" class="ivu-ml">重置</Button>
                            </FormItem>
                        </Form>
                    </div>
                </Card>
            </Col>
        </Row>
        <Drawer
                :styles="drawer.styles"
                v-model="drawer.show"
                :before-close="handleCloseEdit"
                :transfer="false"
                width="360"
        >
            <div slot="header" class="ivu-drawer-header-inner">
                <template v-if="drawer.type === 'header'">添加顶栏菜单</template>
                <template v-if="drawer.type === 'sider'">
                    添加子菜单：<span v-if="menuInfo">{{ menuInfo.title }}</span>
                </template>
            </div>
            <Form
                    v-if="menuData"
                    ref="menuForm"
                    :model="menuData"
                    :rules="drawer.type === 'header' ? headerMenuRules : siderMenuRules"
                    label-position="right"
                    :label-width="100"
                    label-colon
                    hide-required-mark
            >
                <FormItem prop="title" label="标题">
                    <Input v-model="menuData.title" placeholder="请输入标题，必填" />
                </FormItem>
                <FormItem prop="subtitle" label="副标题" v-if="drawer.type === 'sider'">
                    <Input v-model="menuData.subtitle" placeholder="请输入副标题" />
                </FormItem>
                <FormItem prop="path" label="路径">
                    <Input v-model="menuData.path" placeholder="请输入路径，必填" />
                </FormItem>
                <FormItem prop="target" label="打开方式">
                    <RadioGroup v-model="menuData.target">
                        <Radio label="_self">当前窗口</Radio>
                        <Radio label="_blank">新窗口</Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem prop="divided" v-if="drawer.type === 'sider'">
                    <div slot="label">
                        分割线
                        <Tooltip content="菜单折叠时是否显示分割线">
                            <Icon type="md-help-circle" />
                        </Tooltip>
                    </div>
                    <Switch v-model="menuData.divided">
                        <Icon type="md-checkmark" slot="open" />
                        <Icon type="md-close" slot="close" />
                    </Switch>
                </FormItem>
                <FormItem prop="name" v-if="drawer.type === 'header'">
                    <div slot="label">
                        菜单 Name
                        <Tooltip content="详见文档：基础功能-添加菜单">
                            <Icon type="md-help-circle" />
                        </Tooltip>
                    </div>
                    <Input v-model="menuData.name" placeholder="请输入顶栏菜单 Name" />
                </FormItem>
                <FormItem prop="icon" label="图标">
                    <!--图标选择器组件是物料市场内容，需要额外付费购买，Admin Pro 无限制用户免费享有。购买的 Admin Pro 中不包含图标选择器。-->
                    <!--图标选择器组件：https://pro.iviewui.com/store/item/1328603625278279680-->
                    <!--<i-icon-select class="page-sys-menu-icon-select" clearable v-model="menuData.icon" placeholder="请选择图标" search show-title />-->
                    <Input v-model="menuData.icon" placeholder="请选择图标" />
                </FormItem>
                <Alert type="warning" show-icon>
                    <template slot="desc">
                        图标选择器组件是物料市场内容，需要额外付费购买，Admin Pro 无限制用户免费享有。购买的 Admin Pro 中不包含图标选择器。
                    </template>
                </Alert>
                <FormItem prop="auth">
                    <div slot="label">
                        菜单权限
                        <Tooltip content="详见文档：鉴权">
                            <Icon type="md-help-circle" />
                        </Tooltip>
                    </div>
                    <Input v-model="menuData.auth" placeholder="权限，逗号分隔" />
                </FormItem>
                <FormItem prop="hideSider" label="隐藏侧边栏" v-if="drawer.type === 'header'">
                    <Switch v-model="menuData.hideSider">
                        <Icon type="md-checkmark" slot="open" />
                        <Icon type="md-close" slot="close" />
                    </Switch>
                </FormItem>
            </Form>
            <div class="page-sys-menu-drawer-footer" v-if="drawer.type === 'header'">
                <Button type="primary" @click="handleSubmitHeader" :loading="submitting">提交</Button>
            </div>
            <div class="page-sys-menu-drawer-footer" v-if="drawer.type === 'sider'">
                <Button type="primary" @click="handleSubmitSider" :loading="submitting">提交</Button>
            </div>
        </Drawer>
    </div>
</template>
<script>
    import { GetMenuList, CreateHeaderMenu, CreateSiderMenu, DeleteMenu, DeleteMenuMultiple, UpdateMenu } from '@api/system';
    import { cloneDeep } from 'lodash';

    const headerMenu = {
        title: '',
        path: '',
        name: '',
        icon: '',
        hideSider: false,
        auth: '',
        target: '_self'
    };

    const siderMenu = {
        title: '',
        subtitle: '',
        path: '',
        icon: '',
        auth: '',
        target: '_self',
        divided: false,
        header: ''
    };

    export default {
        name: 'system-menu',
        data () {
            return {
                loading: false,
                sourceMenuList: [],
                menuList: [],
                selectedData: [],
                toggleExpand: true,
                menuInfo: null,
                contextMenuInfo: null,
                query: '',
                drawer: {
                    show: false,
                    type: 'header', // header || sider
                    styles: {
                        height: 'calc(100% - 55px)',
                        overflow: 'auto',
                        paddingBottom: '53px',
                        position: 'static'
                    }
                },
                submitting: false,
                menuData: null,
                menuDataString: '',
                headerMenuRules: {
                    title: [
                        { required: true, message: '请输入标题', trigger: 'blur' }
                    ],
                    path: [
                        { required: true, message: '请输入路径', trigger: 'blur' }
                    ],
                    name: [
                        { required: true, message: '请输入 Name', trigger: 'blur' }
                    ]
                },
                siderMenuRules: {
                    title: [
                        { required: true, message: '请输入标题', trigger: 'blur' }
                    ],
                    path: [
                        { required: true, message: '请输入路径', trigger: 'blur' }
                    ],
                    name: [
                        { required: true, message: '请输入 Name', trigger: 'blur' }
                    ],
                    header: [
                        { required: true, message: '请指定对应的顶栏菜单', trigger: 'change' }
                    ]
                },
                editMenuRules: {
                    title: [
                        { required: true, message: '请输入标题', trigger: 'blur' }
                    ],
                    path: [
                        { required: true, message: '请输入路径', trigger: 'blur' }
                    ],
                    name: [
                        { required: true, message: '请输入 Name', trigger: 'blur' }
                    ]
                },
                editMenuData: null,
                editMenuReady: true
            }
        },
        computed: {
            menuListStyle () {
                return {
                    height: document.body.clientHeight - 330 + 'px',
                    overflow: 'auto'
                }
            }
        },
        methods: {
            // 获取菜单数据
            handleGetMenuList () {
                GetMenuList().then(res => {
                    this.sourceMenuList = res.list;
                    this.menuList = cloneDeep(this.sourceMenuList);
                    this.handleToggleExpandAll(true);
                });
            },
            // 清空所有已选项
            handleClearSelect () {
                this.selectedData = [];
            },
            // 展开所有树
            handleToggleExpandAll (status) {
                this.toggleExpand = status;
                this.menuList = this.handleToggleExpandNode(this.menuList, status, []);
            },
            /**
             * @description 递归状态
             * @param {Array} menuList 原数据
             * @param {Boolean} isExpand 是否展开
             * @param {Array} lastList 递归数据
             * */
            handleToggleExpandNode (menuList, isExpand, lastList) {
                menuList.forEach(menu => {
                    let newMenu = {};
                    for (let i in menu) {
                        if (i !== 'children') newMenu[i] = cloneDeep(menu[i]);
                    }
                    newMenu.expand = isExpand;
                    newMenu.contextmenu = true;
                    if (menu.children && menu.children.length) newMenu.children = [];

                    lastList.push(newMenu);
                    menu.children && this.handleToggleExpandNode(menu.children, isExpand, newMenu.children);
                });
                return lastList;
            },
            handleSelectNode (item) {
                this.menuInfo = item.length ? item[0] : null;
                this.handleInitEditMenuData();
            },
            handleCheckNode (items) {
                this.selectedData = items;
            },
            handleContextMenu (item) {
                this.contextMenuInfo = item;
            },
            handleContextMenuEdit () {
                this.menuInfo = this.contextMenuInfo;
                this.handleInitEditMenuData();
                this.menuList = this.handleSelectNodeById(this.menuList, this.menuInfo.id, []);
            },
            handleSelectNodeById (menuList, id, lastList) {
                menuList.forEach(menu => {
                    let newMenu = {};
                    for (let i in menu) {
                        if (i !== 'children') newMenu[i] = cloneDeep(menu[i]);
                    }

                    newMenu.selected = newMenu.id === id;
                    if (menu.children && menu.children.length) newMenu.children = [];

                    lastList.push(newMenu);
                    menu.children && this.handleSelectNodeById(menu.children, id, newMenu.children);
                });
                return lastList;
            },
            handleSearch () {
                const query = this.query;
                this.menuInfo = null;
                this.selectedData = [];
                this.contextMenuInfo = null;
                if (query) {
                    this.menuList = this.handleQueryNode(this.sourceMenuList, query, []);
                } else {
                    this.handleInitMenuList();
                }
            },
            handleInitMenuList () {
                this.menuList = cloneDeep(this.sourceMenuList);
                this.handleToggleExpandAll(true);
            },
            handleQueryNode (menuList, query, queryList) {
                menuList.forEach(menu => {
                    let newMenu = {};
                    for (let i in menu) {
                        if (i !== 'children') newMenu[i] = cloneDeep(menu[i]);
                    }
                    if (newMenu.title.indexOf(query) > -1) queryList.push(newMenu);
                    if (menu.children && menu.children.length) newMenu.children = [];
                    menu.children && this.handleQueryNode(menu.children, query, queryList);
                });
                return queryList;
            },
            handleOpenCreateHeader () {
                this.menuData = cloneDeep(headerMenu);
                this.menuDataString = JSON.stringify(this.menuData);
                this.drawer.type = 'header';
                this.drawer.show = true;
            },
            handleOpenCreateSider () {
                if (!this.menuInfo) return;
                this.menuData = cloneDeep(siderMenu);
                this.menuData.header = this.menuInfo.header;
                this.menuDataString = JSON.stringify(this.menuData);
                this.drawer.type = 'sider';
                this.drawer.show = true;
            },
            handleContextMenuNew () {
                this.menuInfo = this.contextMenuInfo;
                this.handleInitEditMenuData();
                this.menuList = this.handleSelectNodeById(this.menuList, this.menuInfo.id, []);
                this.handleOpenCreateSider();
            },
            handleCloseEdit () {
                // 判断内容是否修改，没修改则直接关闭
                const editMenuData = cloneDeep(this.menuData);
                const editMenuDataString = JSON.stringify(editMenuData);

                if (editMenuDataString !== this.menuDataString) {
                    return new Promise((resolve) => {
                        this.$Modal.confirm({
                            title: '关闭确认',
                            content: '您已经编辑了菜单信息，是否直接关闭？',
                            onOk: () => {
                                this.menuData = null;
                                resolve();
                            }
                        });
                    });
                } else {
                    this.menuData = null;
                }
            },
            handleSubmitHeader () {
                this.$refs.menuForm.validate(valid => {
                    if (valid) {
                        if (this.submitting) return;
                        this.submitting = true;
                        CreateHeaderMenu(this.menuData).then(res => {
                            this.submitting = false;
                            this.drawer.show = false;
                            this.menuData = null;
                            this.$Message.error(res.msg);
                            // 完成后刷新数据
                            // this.handleClearSelect();
                            // this.handleGetMenuList();
                        });
                    }
                });
            },
            handleSubmitSider () {
                this.$refs.menuForm.validate(valid => {
                    if (valid) {
                        if (this.submitting) return;
                        this.submitting = true;
                        CreateSiderMenu(this.menuData).then(res => {
                            this.submitting = false;
                            this.drawer.show = false;
                            this.menuData = null;
                            this.$Message.error(res.msg);
                            // 完成后刷新数据
                            // this.handleClearSelect();
                            // this.handleGetMenuList();
                        });
                    }
                });
            },
            handleContextMenuDelete () {
                if (this.submitting) return;
                this.menuInfo = this.contextMenuInfo;
                this.handleInitEditMenuData();
                this.menuList = this.handleSelectNodeById(this.menuList, this.menuInfo.id, []);
                this.$Modal.confirm({
                    title: '删除确认',
                    content: `您确认要删除菜单<strong>${this.menuInfo.title}</strong>吗？`,
                    loading: true,
                    onOk: () => {
                        DeleteMenu({
                            id: this.menuInfo.id
                        }).then(res => {
                            this.$Modal.remove();
                            this.$Message.error(res.msg);
                            // 成功后操作
                            // this.menuInfo = null;
                            // this.editMenuData = null;
                            // this.handleClearSelect();
                            // this.handleGetMenuList();
                        });
                    }
                });
            },
            handleDeleteMultiple () {
                if (this.submitting) return;
                const ids = this.selectedData.map(item => item.id);
                const titles = this.selectedData.map(item => item.title);
                this.$Modal.confirm({
                    title: '删除确认',
                    content: `您确认要删除菜单<strong>${titles}</strong>吗？`,
                    loading: true,
                    onOk: () => {
                        DeleteMenuMultiple({
                            ids
                        }).then(res => {
                            this.$Modal.remove();
                            this.$Message.error(res.msg);
                            // 成功后操作
                            // this.menuInfo = null;
                            // this.editMenuData = null;
                            // this.handleClearSelect();
                            // this.handleGetMenuList();
                        });
                    }
                });
            },
            handleInitEditMenuData () {
                let menuData = null;
                if (this.menuInfo) {
                    if (this.menuInfo.name) {
                        menuData = cloneDeep(headerMenu);
                    } else {
                        menuData = cloneDeep(siderMenu);
                    }
                    for (let i in menuData) {
                        if (i in this.menuInfo) menuData[i] = this.menuInfo[i];
                    }
                }
                this.editMenuData = menuData;
                this.editMenuReady = false;
                this.$nextTick(() => {
                    this.editMenuReady = true;
                });
            },
            // 修改菜单
            handleSubmitUpdate () {
                this.$refs.infoForm.validate(valid => {
                    if (valid) {
                        if (this.submitting) return;
                        this.submitting = true;
                        UpdateMenu({
                            id: this.menuInfo.id,
                            ...this.editMenuData
                        }).then(res => {
                            this.submitting = false;
                            this.$Message.error(res.msg);
                            // 成功后操作
                            // this.handleGetMenuList();
                        });
                    }
                });
            },
            handleResetUpdate () {
                this.$refs.infoForm.resetFields();
            }
        },
        mounted () {
            this.handleGetMenuList();
        }
    }
</script>
<style lang="less">
    .page-sys-menu{
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
        &-icon-select{
            .i-icon-select-transfer{
                width: 280px !important;
            }
            .i-icon-select-drop-main{
                width: 280px !important;
                height: 200px;
                overflow: auto;
            }
        }
    }
</style>
