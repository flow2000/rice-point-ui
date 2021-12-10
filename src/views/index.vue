<template>
  <div class="dashboard-editor-container">

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="24">
        <div class="chart-wrapper">
          <pie-chart />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './dashboard/PanelGroup'
import LineChart from './dashboard/LineChart'
import RaddarChart from './dashboard/RaddarChart'
import PieChart from './dashboard/PieChart'
import BarChart from './dashboard/BarChart'
import { initLine } from '@/api/dashboard/info'

let lineChartData = {}
export default {
  name: "Index",
  components: {
    PanelGroup,
    LineChart,
    RaddarChart,
    PieChart,
    BarChart,
  },
  data() {
    return {
      lineChartData: null,
    }
  },
  created() {
    this.initLine()
  },
  methods: {
    initLine(){
      initLine().then((response) =>{
        this.lineChartData = response.visitisInWeek;
        lineChartData.visitisInWeek = response.visitisInWeek;
        lineChartData.ticketInWeek = response.ticketInWeek;
        lineChartData.orderAmountInWeek = response.orderAmountInWeek;
        lineChartData.orderMoneyAmountInWeek = response.orderMoneyAmountInWeek;
      })
    },
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
  }
};
</script>
<style lang="scss" scoped>
  .dashboard-editor-container {
    padding: 32px;
    background-color: rgb(240, 242, 245);
    position: relative;

    .github-corner {
      position: absolute;
      top: 0;
      border: 0;
      right: 0;
    }

    .chart-wrapper {
      background: #fff;
      padding: 16px 16px 0;
      margin-bottom: 32px;
    }
  }

  @media (max-width:1024px) {
    .chart-wrapper {
      padding: 8px;
    }
  }
</style>
