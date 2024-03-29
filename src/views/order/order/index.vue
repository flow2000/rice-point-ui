<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--食堂数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container" style="position: center">
          <div class="btn">
            <el-button v-if="isShow" style="color: #607188; font-size: 14px" size="mini" type="text" @click="selectCanteen" >
              全部食堂
            </el-button>
          </div>
          <el-tree
            :data="canteenOptions"
            :props="defaultProps"
            :expand-on-click-node="false"
            ref="tree"
            default-expand-all
            @node-click="handleNodeClick"
          />
        </div>
      </el-col>
      <!--订单数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="订单号" prop="orderCode">
            <el-input
              v-model="queryParams.orderCode"
              placeholder="请输入订单号"
              @keyup.native="listenInput"
              @keydown.native="listenInput"
              clearable
              size="small"
              prefix-icon="el-icon-search"
              style="margin-bottom: 20px"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="取餐号" prop="mealNumber">
            <el-input
              v-model="queryParams.mealNumber"
              placeholder="请输入取餐号"
              @keyup.native="listenInput"
              @keydown.native="listenInput"
              clearable
              size="small"
              prefix-icon="el-icon-search"
              @keyup.enter.native="handleQuery"
              style="margin-bottom: 20px"
            />
          </el-form-item>
          <el-form-item label="订单状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable size="small">
              <el-option
                v-for="s in statusOptions"
                :value="s.dictValue"
                :label="s.dictLabel">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="创建时间" prop="timeList">
            <el-date-picker
              v-model="queryParams.timeList"
              type="datetimerange"
              value-format="yyyy-MM-dd HH:mm:ss"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              :loading="exportLoading"
              @click="handleExport"
              v-hasPermi="['order:order:export']"
            >导出
            </el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="orderList" :show-header="false">
          <el-table-column prop="name">
            <template slot-scope="scope">
              <div class="tab_header">
                <span>{{scope.row.createTime}}</span>
                <span>订单号：{{scope.row.orderCode}}</span>
                <span><b>取餐号：{{scope.row.mealNumber}}</b></span>
                <el-tag v-if="scope.row.status === '0'" type="warning">未处理</el-tag>
                <el-tag v-if="scope.row.status === '1'" type="success">已完成</el-tag>
                <el-tag v-if="scope.row.status === '2'" type="danger">处理失败</el-tag>
                <el-tag v-if="scope.row.status === '3'" type="info">已取消</el-tag>
                <div>
                  <div v-if="scope.row.status === '0'">
                    <el-button size="mini"
                               type="primary"
                               icon="el-icon-edit"
                               @click="handleEdit(scope.row)"
                               v-hasPermi="['order:order:edit']"
                    >处理订单
                    </el-button>
                  </div>
                  <div v-if="scope.row.status !== '0'">
                    <el-button size="mini"
                               type="success"
                               icon="el-icon-s-claim"
                               @click="handleEdit(scope.row)"
                               v-hasPermi="['order:order:edit']"
                    >查看订单
                    </el-button>
                  </div>
                </div>
              </div>
              <el-table :data="scope.row.dishOrders" show-summary :summary-method="getSummaries">
                <el-table-column align="center" label="菜品名称" prop="dishesName"></el-table-column>
                <el-table-column align="center" label="价格">
                  <template slot-scope="scope"><span>{{parseFloat(scope.row.price).toFixed(1)}}元/份</span></template>
                </el-table-column>
                <el-table-column align="center" label="数量">
                  <template slot-scope="scope"><span>{{scope.row.number}}份</span></template>
                </el-table-column>
                <el-table-column align="center" label="小计">
                  <template slot-scope="scope"><span>{{parseFloat(scope.row.number*scope.row.price).toFixed(1)}}元</span></template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageNum"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />
      </el-col>
    </el-row>
    <!-- 处理订单对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="取餐号码" prop="mealNumber">
          <el-input v-model="form.mealNumber" disabled/>
        </el-form-item>
        <el-table :data="form.dishOrders" show-summary :summary-method="getSummaries">
          <el-table-column align="center" label="菜品名称" prop="dishesName"></el-table-column>
          <el-table-column align="center" label="价格">
            <template slot-scope="scope"><span>{{parseFloat(scope.row.price).toFixed(1)}}元/份</span></template>
          </el-table-column>
          <el-table-column align="center" label="数量">
            <template slot-scope="scope"><span>{{scope.row.number}}份</span></template>
          </el-table-column>
          <el-table-column align="center" label="小计">
            <template slot-scope="scope"><span>{{parseFloat(scope.row.number*scope.row.price).toFixed(1)}}元</span></template>
          </el-table-column>
        </el-table>
        <el-form-item/>
        <el-form-item label="处理选项">
          <el-radio-group v-model="form.status">
            <el-radio-button
              v-for="dict in dict.type.order_status"
              v-if="dict.value!=='0'&&dict.value!=='3'"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="失败理由" prop="errorReason" v-show="form.status==='2'">
          <el-autocomplete
            v-model="form.errorReason"
            placeholder="请输入失败理由"
            :trigger-on-focus="true"
            :fetch-suggestions="querySearchAsync"
          ></el-autocomplete>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">
          取 消
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { listOrder, getOrder, updateOrder, exportOrder } from '@/api/order/order'
  import { treeselect } from  "@/api/canteen/info"

  export default {
    name: 'Order',
    dicts: ['order_status'],
    data() {
      return {
        // 遮罩层
        loading: true,
        // 导出遮罩层
        exportLoading: false,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 食堂数据
        canteenOptions: [],
        // 食堂数量
        canteenTotal: 0,
        // 订单表格数据
        orderList: [],
        // 订单失败提示原因数组
        orderError: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 是否显示全部食堂
        isShow: false,
        // 订单状态数组
        statusOptions: null,
        // 查询参数
        queryParams: {
          pageNum: 1,
          canteenId: 0,
          pageSize: 10,
          orderCode: null,
          createTime: null,
          timeList: null,
          mealNumber: null
        },
        // 表单参数
        form: {},
        defaultProps: {
          children: "children",
          label: "label",
          disabled: "disabled"
        },
        // 表单校验
        rules: {},
      }
    },
    created() {
      this.getCanteen();
      this.getDicts('order_error').then(response => {
        this.orderError = response.data
      })
      this.getDicts('order_status').then(response => {
        this.statusOptions = response.data
      })
    },
    methods: {
      /** 查询订单列表 */
      getList() {
        this.loading = true
        const number = this.queryParams.mealNumber;
        var patrn = /^[0-9]*$/;
        if (number === "" || number === undefined || number === " " || !patrn.test(number)) {
          this.queryParams.mealNumber = null
        }
        listOrder(this.queryParams).then(response => {
          this.orderList = response.rows
          this.total = response.total
          this.loading = false
        })
      },
      /** 查询食堂下拉列表 */
      getCanteen(){
        treeselect().then(response => {
          this.canteenOptions = response.data;
          if(this.canteenOptions!==null && this.canteenOptions.length>1){
            this.isShow=true
          }else if(this.canteenOptions!==null && this.canteenOptions.length===1){
            this.queryParams.canteenId = this.canteenOptions[0].id;
          }
          this.canteenTotal = response.total;
          this.getList()
        });
      },
      // 节点单击事件
      handleNodeClick(data) {
        this.queryParams.canteenId = data.id;
        this.getList();
      },
      // 单击全部食堂事件
      selectCanteen(){
        this.queryParams.canteenId = 0;
        this.getList();
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.reset()
      },
      // 表单重置
      reset() {
        this.form = {
          orderId: null,
          orderCode: null,
          canteenId: null,
          orderPrice: null,
          status: '0',
          delFlag: null,
          createTime: null,
          errorReason: null
        }
        this.resetForm('form')
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1
        this.getList()
        console.log(this.queryParams)
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm('queryForm')
        this.handleQuery()
      },
      /** 提交按钮 */
      submitForm() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.orderId != null) {
              updateOrder(this.form).then(response => {
                this.$modal.msgSuccess('操作成功')
                this.open = false
                this.getList()
              })
            }
          }
        })
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams
        this.$modal.confirm('是否确认导出所有订单数据项？').then(() => {
          this.exportLoading = true
          return exportOrder(queryParams)
        }).then(response => {
          this.$download.name(response.msg)
          this.exportLoading = false
        }).catch(() => {
        })
      },
      // 动态查询订单处理失败原因
      querySearchAsync(queryString, cb) {
        let errorList = this.orderError
        //增加value属性
        for (let i = 0; i < errorList.length; i++) {
          errorList[i]['value'] = errorList[i].dictLabel
        }
        var results = queryString ? errorList.filter(this.createStateFilter(queryString)) : errorList
        cb(results)
      },
      // 创建一个过滤器
      createStateFilter(queryString) {
        return (state) => {
          return state.dictLabel.indexOf(queryString) === 0 && state.dictLabel !== queryString
        }
      },
      /** 订单处理操作 */
      handleEdit(row) {
        this.reset()
        const orderId = row.orderId || this.ids
        getOrder(orderId).then(response => {
          this.form = response.data
          this.open = true
          this.form.status === '0'?this.title = '处理订单':this.title = '查看订单'
        })
      },
      /** 合并列操作 */
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex === 3) {
          return {
            colspan: 0
          }
        }
      },
      /** 合计行操作 */
      getSummaries(param) {
        const data = param.data
        const sums = []
        let sum = 0
        sums[0] = '总价'
        for (let i = 0; i < data.length; i++) {
          sum += data[i].number * data[i].price
        }
        sums[3] = sum + '元'
        return sums
      },
      // 监听取餐号
      listenInput(e){
        e.target.value = e.target.value.replace(/[^\d]/g,"");
      },
    }
  }
</script>
<style lang="scss">
  .tab_header {
    color: #333;
    padding: 0 5px 0 5px;
    height: 45px;
    line-height: 45px;
    border: 1px solid #F8F8F9;
    display: flex;
    justify-content: space-between;
    background: #F8F8F9;
  }

  .el-table__footer-wrapper tbody td {
    background-color: #FFFFFF;
    color: #000000;
    font-weight: bold;
  }

  .el-range-editor--medium.el-input__inner{
    height: 32px;
  }
</style>

