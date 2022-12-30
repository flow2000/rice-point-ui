<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="食堂名称" prop="canteenName">
        <el-input
          v-model="queryParams.canteenName"
          placeholder="请输入食堂名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="负责人" prop="leader">
        <el-input
          v-model="queryParams.leader"
          placeholder="请输入负责人"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['canteen:info:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['canteen:info:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['canteen:info:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="el-icon-download"
          size="mini"
          :loading="exportLoading"
          @click="handleExport"
          v-hasPermi="['canteen:info:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="食堂名称" align="center" prop="canteenName" :show-overflow-tooltip="true"/>
      <el-table-column label="食堂图片" align="center" prop="canteenUrl">
        <template slot-scope="scope">
          <el-image :src="getImage(scope.row.canteenUrl)"></el-image>
        </template>
      </el-table-column>
      <el-table-column label="详细地址" align="center" prop="location" :show-overflow-tooltip="true"/>
      <el-table-column label="人均消费(元)" align="center" prop="average">
        <template slot-scope="scope">
          <span v-if="scope.row.average!==null">￥{{scope.row.average}}</span>
        </template>
      </el-table-column>
      <el-table-column label="负责人" align="center" prop="leader"/>
      <el-table-column label="联系电话" align="center" prop="phone"/>
      <el-table-column label="邮箱" align="center" prop="email" :show-overflow-tooltip="true"/>
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-switch
            v-if="scope.row.status"
            v-model="scope.row.status"
            active-value="0"
            inactive-value="1"
            @change="handleStatusChange(scope.row)"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['canteen:info:edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['canteen:info:remove']"
          >删除
          </el-button>
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

    <!-- 添加或修改食堂信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="食堂名称" prop="canteenName">
          <el-input v-model="form.canteenName" placeholder="请输入食堂名称"/>
        </el-form-item>
        <el-form-item label="食堂图片">
          <imageUpload v-model="form.canteenUrl" :limit="1"/>
        </el-form-item>
        <el-form-item label="经纬度" prop="tude" v-show="false">
          <el-input v-model="form.tude" id="tude"/>
        </el-form-item>
        <el-form-item label="详细地址" prop="location">
          <el-input v-model="form.location" placeholder="请获取详细地址"/>
          <el-button type="text" @click="openMap()"><span style="font-size: 13px">地图选点</span></el-button>
          <el-dialog
            title="地址选择"
            width="80%"
            :visible.sync="dialogVisible"
            :append-to-body='true'>
            <div class="my_container">
              <div class="search-box">
                <input
                  v-model="searchKey"
                  type="search"
                  id="search" placeholder="地图选址不明确可尝试手动搜索">
                <button @click="searchByHand">搜索</button>
                <input id="searchTude" v-show="false"></input>
                <div class="tip-box" id="searchTip"></div>
              </div>
              <el-amap class="amap-box"
                       :amap-manager="amapManager"
                       :vid="'amap-vue'"
                       :zoom="zoom"
                       :plugin="plugin"
                       :center="center"
                       :events="events"
              >
                <el-amap-marker v-for="(marker, index) in markers" :position="marker" :key="index"></el-amap-marker>
              </el-amap>
            </div>
            <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitLocation">确 定</el-button>
          </span>
          </el-dialog>

        </el-form-item>
        <el-form-item label="人均消费" prop="average">
          <el-input v-model="form.average" placeholder="请输入人均消费(元)"/>
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="form.leader" placeholder="请输入负责人"/>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"/>
        </el-form-item>
        <el-form-item label="食堂状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :label="dict.dictValue"
            >{{dict.dictLabel}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
  .my_container {
    width: 100%;
    height: 500px;
  }

  .search-box {
    position: absolute;
    z-index: 5;
    width: 70%;
    left: 20%;
    top: 30px;
    height: 30px;
  }

  .search-box input {
    float: left;
    width: 59%;
    height: 100%;
    border: 1px solid #1890FF;
    padding: 0 8px;
    outline: none;
  }

  .search-box button {
    float: left;
    width: 20%;
    height: 100%;
    background: #1890FF;
    border: 1px solid #1890FF;
    color: #fff;
    outline: none;
  }

  .tip-box {
    width: 100%;
    max-height: 260px;
    position: absolute;
    top: 30px;
    overflow-y: auto;
    background-color: #fff;
  }
</style>

<script>
  import { AMapManager, lazyAMapApiLoaderInstance } from 'vue-amap'
  import { listInfo, getInfo, delInfo, addInfo, updateInfo, exportInfo, changeCanteenStatus } from '@/api/canteen/info'

  let amapManager = new AMapManager()

  export default {
    name: 'Info',
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
        // 食堂信息表格数据
        infoList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 状态字典
        statusOptions: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          canteenName: null,
          leader: null
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          canteenName: [
            { required: true, message: '食堂名称不能为空', trigger: 'blur' },
            { min: 2, max: 20, message: '食堂名称长度必须介于 2 和 20 之间', trigger: 'blur' }
          ],
          canteenUrl: [
            { required: true, message: '食堂图片不能为空', trigger: 'blur' }
          ],
          location: [
            { required: true, message: '详细地址不能为空', trigger: 'blur' }
          ],
          average: [
            { pattern: /^(0\.\d{0,1}[1-9]|\+?[1-9][0-9]{0,3})(\.\d{1,2})?$/, message: '请输入0-100之间且小于2位小数的金额', trigger: 'blur' }
          ],
          leader: [
            { required: true, message: '负责人不能为空', trigger: 'blur' }
          ],
          phone: [
            { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
          ],
          email: [
            {
              type: 'email',
              message: '\'请输入正确的邮箱地址',
              trigger: ['blur', 'change']
            }
          ]
        },
        dialogVisible: false,
        address: null,
        searchKey: '',
        amapManager,
        poiPicker: null,
        markers: [],
        searchOption: {
          city: '全国',
          citylimit: true
        },
        center: [108.235746, 22.844274],
        zoom: 17,
        lng: 0,
        lat: 0,
        loaded: false,
        markerEvent: {},
        events: {
          //点击地图自动赋值搜索框
          click(e) {
            self.markers = []
            let { lng, lat } = e.lnglat
            self.lng = lng
            self.lat = lat
            self.center = [lng, lat]
            self.markers.push([lng, lat])
            // 这里通过高德 SDK 完成。
            let geocoder = new AMap.Geocoder({
              radius: 1500,
              extensions: 'all'
            })

            geocoder.getAddress([lng, lat], function(status, result) {
              if (status === 'complete' && result.info === 'OK' && result && result.regeocode) {
                var province = result.regeocode.addressComponent.province //去除省份
                var township = result.regeocode.addressComponent.township //去除街道
                var str = result.regeocode.formattedAddress
                self.searchKey = str.replace(new RegExp(province, 'g'), '')
                  .replace(new RegExp(township, 'g'), '')
                document.getElementById('search').value = self.searchKey
                document.getElementById('searchTude').value = self.lng + ',' + self.lat
              }
            })
          }
        },
        plugin: [
          {
            // 定位
            pName: 'Geolocation',
            events: {
              init(o) {
                // o是高德地图定位插件实例
                o.getCurrentPosition((status, result) => {
                  if (result && result.position) {
                    // 设置经度
                    self.lng = result.position.lng
                    // 设置维度
                    self.lat = result.position.lat
                    // 设置坐标
                    self.center = [self.lng, self.lat]
                    self.markers.push([self.lng, self.lat])
                    // load
                    self.loaded = true
                    // 页面渲染好后
                    self.$nextTick()
                  }
                })
              }
            }
          },
          {
            // 工具栏
            pName: 'ToolBar',
            events: {
              init(instance) {
              }
            }
          },
          {
            // 鹰眼
            pName: 'OverView',
            events: {
              init(instance) {
              }
            }
          },
          {
            // 地图类型
            pName: 'MapType',
            defaultType: 0,
            events: {
              init(instance) {
              }
            }
          },
          {
            // 搜索
            pName: 'PlaceSearch',
            events: {
              init(instance) {
              }
            }
          }
        ]
      }
    },
    created() {
      this.getList()
      this.getDicts('sys_status').then(response => {
        this.statusOptions = response.data
      })
    },
    methods: {
      /** 查询食堂信息列表 */
      getList() {
        this.loading = true
        listInfo(this.queryParams).then(response => {
          this.infoList = response.rows
          this.total = response.total
          this.loading = false
        })
      },
      /** 返回图片地址 */
      getImage(url) {
        return process.env.VUE_APP_FILE_API + url.replace("/profile","");
      },
      // 取消按钮
      cancel() {
        this.open = false
        this.reset()
      },
      // 表单重置
      reset() {
        this.form = {
          canteenName: null,
          canteenUrl: null,
          location: null,
          tude: null,
          average: null,
          leader: null,
          phone: null,
          email: null,
          status: "0",
          createBy: null,
          createTime: null,
          updateBy: null,
          updateTime: null,
          delFlag: null
        }
        this.resetForm('form')
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1
        this.getList()
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm('queryForm')
        this.handleQuery()
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.canteenId)
        this.single = selection.length !== 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset()
        this.open = true
        this.title = '添加食堂信息'
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset()
        const canteenId = row.canteenId || this.ids
        getInfo(canteenId).then(response => {
          this.form = response.data
          this.open = true
          this.title = '修改食堂信息'
        })
      },
      /** 提交按钮 */
      submitForm() {
        this.$refs['form'].validate(valid => {
          if (valid) {
            if (this.form.canteenId != null) {
              updateInfo(this.form).then(response => {
                this.$modal.msgSuccess('修改成功')
                this.open = false
                this.getList()
              })
            } else {
              addInfo(this.form).then(response => {
                this.$modal.msgSuccess('新增成功')
                this.open = false
                this.getList()
              })
            }
          }
        })
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const canteenIds = row.canteenId || this.ids
        const canteenName = row.canteenName || '所选食堂'
        this.$modal.confirm('是否确认删除' + canteenName + '？').then(function() {
          return delInfo(canteenIds)
        }).then(() => {
          this.getList()
          this.$modal.msgSuccess('删除成功')
        }).catch(() => {
        })
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams
        this.$modal.confirm('是否确认导出所有食堂信息数据项？').then(() => {
          this.exportLoading = true
          return exportInfo(queryParams)
        }).then(response => {
          this.$download.name(response.msg)
          this.exportLoading = false
        }).catch(() => {
        })
      },
      /** 状态修改按钮操作 */
      handleStatusChange(row) {
        let text = row.status === '0' ? '启用' : '停用'
        this.$modal.confirm('确认要' + text + '吗?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function() {
          return changeCanteenStatus(row.canteenId, row.status)
        }).then(() => {
          this.$modal.msgSuccess(text + '成功')
        }).catch(function() {
          row.status = row.status === '0' ? '1' : '0'
        })
      },
      /** 打开选择地址对话框 */
      openMap() {
        this.dialogVisible = true
        this.SearchLocation()
      },
      /** 监听下拉条选中信息 */
      SearchLocation() {
        let vm = this
        let map = this.amapManager.getMap()

        AMapUI.loadUI(['misc/PoiPicker'], function(PoiPicker) {

          var poiPicker = new PoiPicker({
            input: 'search',
            placeSearchOptions: {
              map: map,
              pageSize: 10
            },
            suggestContainer: 'searchTip',
            searchResultsContainer: 'searchTip'
          })
          vm.poiPicker = poiPicker

          // 监听poi选中信息
          poiPicker.on('poiPicked', function(poiResult) {
            let source = poiResult.source
            let poi = poiResult.item
            if (source !== 'search') {
              poiPicker.searchByKeyword(poi.name)
            } else {
              poiPicker.clearSearchResults()
              vm.markers = []
              let lng = poi.location.lng
              let lat = poi.location.lat
              let address = poi.cityname + poi.adname + poi.name
              vm.center = [lng, lat]
              vm.markers.push([lng, lat])
              vm.lng = lng
              vm.lat = lat
              vm.address = address
              vm.searchKey = address
            }
          })

        })
      },
      /**地图搜索按钮 */
      searchByHand() {
        if (this.searchKey !== '') {
          this.poiPicker.searchByKeyword(this.searchKey)
        }
      },
      /**提交位置信息 */
      submitLocation() {
        this.dialogVisible = false
        this.$set(this.form, 'location', document.getElementById('search').value)
        this.$set(this.form, 'tude', document.getElementById('searchTude').value)
      }
    }
  }
</script>
