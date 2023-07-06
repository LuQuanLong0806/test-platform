<template>
    <div>
        <div class="i-layout-page-header">
            <PageHeader title="用户管理" content="页面数据为 Mock 示例数据，非真实数据。" hidden-breadcrumb />
        </div>
        <Card :bordered="false" dis-hover class="ivu-mt" ref="card">
            <table-form ref="form" @on-submit="getData" @on-reset="getData" />
            <table-list ref="table" @on-fullscreen="handleFullscreen" />
        </Card>
    </div>
</template>
<script>
    import screenfull from 'screenfull';
    import tableForm from './table-form';
    import tableList from './table-list';

    export default {
        name: 'system-user',
        components: { tableForm, tableList },
        data () {
            return {

            }
        },
        methods: {
            getData () {
                this.$refs.table.getData();
            },
            handleFullscreen (state) {
                if (state) {
                    screenfull.request(this.$refs.card.$el);
                } else {
                    screenfull.exit();
                }
            }
        },
        mounted () {
            this.getData();
        }
    }
</script>
