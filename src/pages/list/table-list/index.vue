<template>
    <div>
        <div class="i-layout-page-header">
            <PageHeader title="查询表格" content="表格查询的复杂示例" hidden-breadcrumb />
        </div>
        <Card :bordered="false" dis-hover class="list-table-list-card ivu-mt" ref="card">
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
        name: 'list-table-list',
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
<style lang="less">
    .list-table-list{
        &-card{
            &:fullscreen{
                overflow: auto;
                background: #fff;
            }
        }
    }
</style>
