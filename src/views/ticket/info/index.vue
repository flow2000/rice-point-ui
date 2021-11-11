<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="期数" prop="time">
        <el-select
          v-model="queryParams.time"
          placeholder="请选择期数"
          clearable
          prefix-icon="el-icon-search"
          size="small"
          style="width: 100%"
          @clear="handClearPeriodsClick"
        >
          <el-option
            v-for="item in totalTime"
            :key="item"
            :label="item"
            :value="item"
            @click.native="handlePeriodsClick(item)"
          />
        </el-select>
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
          v-hasPermi="['ticket:info:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="RenderChart"></right-toolbar>
    </el-row>

    <div>
      <div id="main" class="main_container"></div>
    </div>

    <template>
      <div id="app">
        <div id="barChart" style="width: 100%;height:500px;"></div>
      </div>
    </template>
    <!--  投票信息折线图  -->
    <el-dialog @open="openLine" :title="chartTitle" :visible.sync="chartOpen" width="800px" append-to-body>
      <div>
        <div id="lineChart" style="width: 100%;height:500px;"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { exportInfo, listInfo, getDishTicketInfo, getTotalTime } from "@/api/ticket/info";
import theme from '@/assets/theme/echartsTheme'

export default {
  name: "Info",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 导出遮罩层
      exportLoading: false,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 投票信息表格数据
      infoList: [],
      // 柱状图
      barChart: null,
      // 线性图
      lineChart: null,
      // 柱状图数据
      barOption: null,
      // 线性图数据
      lineOption: null,
      // 折线图弹出层标题
      chartTitle: "",
      // 是否显示折线弹出层
      chartOpen :false,
      // 查询参数
      queryParams: {
        time: null,
        dishesName: null,
      },
      //总共几期
      totalTime: null,
    };
  },
  created() {
    getTotalTime().then((response) => {
      this.totalTime = response.data;
    })
  },
  mounted() {
    this.drawChart()
  },
  methods: {
    // 设置柱状图数据
    setBarOption(list){
      var xdata = [];
      var ydata = [];
      for (let i = 0; i < list.length; i++) {
        xdata.push(list[i].dishesName)
        ydata.push(list[i].ticketNumber)
      }
      this.barOption = {
        title: {
          text: "第" + list[0].time + "期菜品投票信息",
          left: 50,
        },
        tooltip: {},
        legend: {
          data: ["票数"]
        },
        xAxis: {
          data: xdata
        },
        yAxis: {},
        series: [
          {
            name: "票数",
            type: "bar",
            data: ydata
          }
        ]
      };
    },
    // 设置折线图图数据
    setLineOption(list){
      var xdata = [];
      var ydata = [];
      for (let i = 0; i < list.length; i++) {
        xdata.push("第" + list[i].time + "期")
        ydata.push(list[i].ticketNumber)
      }
      this.lineOption = {
        xAxis: {
          type: 'category',
          data: xdata
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: ydata,
            type: 'line',
            smooth: true,
            label: {
              show: true,	// 是否可见
              rotate: 0 	// 旋转角度
            },
            areaStyle: {
              color: '#409EFF'
            }
          }
        ]
      };
    },
    // 渲染柱状图
    drawChart() {
      listInfo(this.queryParams).then(response => {
        this.setBarOption(response.rows);
        this.barChart = this.$echarts.init(document.getElementById("barChart"),'theme');
        this.barChart.setOption(this.barOption, true);
        const that = this
        this.barChart.on('click', function(params) {
          that.chartOpen = true;
          that.chartTitle = params.name + "近几期投票图"
          that.queryParams.dishesName = params.name
        })
      })
    },
    // 重新渲染柱状图
    RenderChart(){
      this.barChart = this.$echarts.init(document.getElementById("barChart"),'theme');
      this.barChart.showLoading();
      listInfo(this.queryParams).then((response) => {
        this.setBarOption(response.rows);
        this.barChart.setOption(this.barOption, true);
        this.barChart.hideLoading();
      })
    },
    // 打开折线图函数
    openLine(){
      this.$nextTick(() =>{
        this.lineChart = this.$echarts.init(document.getElementById("lineChart"),'theme')
        this.lineChart.showLoading();
        getDishTicketInfo(this.queryParams).then((response) => {
          this.setLineOption(response.data);
          this.lineChart.setOption(this.lineOption)
          this.lineChart.hideLoading();
        })
      })
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$modal.confirm('是否确认导出所有投票信息数据项？').then(() => {
        this.exportLoading = true;
        return exportInfo(queryParams);
      }).then(response => {
        this.$download.name(response.msg);
        this.exportLoading = false;
      }).catch(() => {});
    },
    // 期数单击事件
    handlePeriodsClick(data) {
      this.queryParams.time = data
      this.RenderChart()
    },
    // 清空期数事件
    handClearPeriodsClick(){
      this.queryParams.time = undefined;
      this.RenderChart()
    },
  }
};
</script>
