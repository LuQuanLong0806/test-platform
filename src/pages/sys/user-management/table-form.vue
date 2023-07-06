<template>
    <Form ref="form" :model="data" :rules="rules" :label-width="labelWidth" :label-position="labelPosition">
        <Row :gutter="24" type="flex" justify="end">
            <Col v-bind="grid">
                <FormItem label="用户名：" prop="name" label-for="name">
                    <Input v-model="data.name" placeholder="请输入用户名" element-id="name" />
                </FormItem>
            </Col>
            <Col v-bind="grid">
                <FormItem label="手机号：" prop="phone" label-for="phone">
                    <Input v-model="data.phone" maxlength="11" placeholder="请输入手机号" element-id="phone" />
                </FormItem>
            </Col>
            <template v-if="collapse">
                <Col v-bind="grid">
                    <FormItem label="邮箱：" prop="mail" label-for="mail">
                        <Input v-model="data.mail" placeholder="请输入邮箱" element-id="mail" />
                    </FormItem>
                </Col>
                <Col v-bind="grid">
                    <FormItem label="性别：" prop="gender" label-for="gender">
                        <Select v-model="data.gender" placeholder="请选择性别" element-id="gender">
                            <Option :value="0">全部</Option>
                            <Option :value="1">男</Option>
                            <Option :value="2">女</Option>
                        </Select>
                    </FormItem>
                </Col>
                <Col v-bind="grid">
                    <FormItem label="登录账号：" prop="account" label-for="account">
                        <Input v-model="data.account" placeholder="请输入登录账号" element-id="account" />
                    </FormItem>
                </Col>
                <Col v-bind="grid">
                    <FormItem label="用户 ID：" prop="id" label-for="id">
                        <Input v-model="data.id" placeholder="请输入用户 ID" element-id="id" />
                    </FormItem>
                </Col>
                <Col v-bind="grid">
                    <FormItem label="状态：" prop="status" label-for="status">
                        <Select v-model="data.status" placeholder="请选择状态" element-id="status">
                            <Option :value="0">全部</Option>
                            <Option :value="1">正常</Option>
                            <Option :value="2">冻结</Option>
                            <Option :value="3">关闭</Option>
                        </Select>
                    </FormItem>
                </Col>
                <Col v-bind="grid">
                    <FormItem label="创建时间：" prop="date" label-for="date">
                        <DatePicker v-model="data.date" type="daterange" :options="dateOptions" placeholder="请选择创建时间" element-id="date" v-width="'100%'" />
                    </FormItem>
                </Col>
            </template>
            <Col v-bind="grid" class="ivu-text-right">
                <FormItem>
                    <Button type="primary" @click="handleSubmit">查询</Button>
                    <Button class="ivu-ml-8" @click="handleReset">重置</Button>
                    <a v-font="14" class="ivu-ml-8" @click="collapse = !collapse">
                        <template v-if="!collapse">
                            展开 <Icon type="ios-arrow-down" />
                        </template>
                        <template v-else>
                            收起 <Icon type="ios-arrow-up" />
                        </template>
                    </a>
                </FormItem>
            </Col>
        </Row>
    </Form>
</template>
<script>
    import { mapState } from 'vuex';

    export default {
        data () {
            return {
                grid: {
                    xl: 8,
                    lg: 8,
                    md: 12,
                    sm: 24,
                    xs: 24
                },
                collapse: false,
                data: {
                    name: '',
                    phone: '',
                    mail: '',
                    gender: 0,
                    account: '',
                    id: '',
                    status: 0,
                    date: []
                },
                rules: {

                },
                dateOptions: {
                    shortcuts: [
                        {
                            text: '今天',
                            value: () => {
                                const date = this.$Date(new Date()).format('YYYY-MM-DD');
                                return [date, date];
                            }
                        },
                        {
                            text: '昨天',
                            value: () => {
                                let date = new Date();
                                date.setTime(date.getTime() - 3600 * 1000 * 24);
                                date = this.$Date(date).format('YYYY-MM-DD');
                                return [date, date];
                            }
                        },
                        {
                            text: '本周',
                            value: () => {
                                const date = new Date();
                                const start = this.$Date(date).day(1).format('YYYY-MM-DD');
                                const end = this.$Date(date).day(7).format('YYYY-MM-DD');
                                return [start, end];
                            }
                        },
                        {
                            text: '本月',
                            value: () => {
                                const date = new Date();
                                const start = this.$Date(date).date(1).format('YYYY-MM-DD');
                                const end = this.$Date(date).add(1, 'month').date(1).subtract(1, 'day').format('YYYY-MM-DD');
                                return [start, end];
                            }
                        }
                    ]
                }
            }
        },
        computed: {
            ...mapState('admin/layout', [
                'isMobile'
            ]),
            labelWidth () {
                return this.isMobile ? undefined : 100;
            },
            labelPosition () {
                return this.isMobile ? 'top' : 'right';
            }
        },
        methods: {
            handleSubmit () {
                this.$emit('on-submit', this.data);
            },
            handleReset () {
                this.$refs.form.resetFields();
                this.$emit('on-reset');
            }
        }
    }
</script>
