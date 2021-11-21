<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--食堂数据-->
      <el-col :span="4" :xs="24">
        <div class="head-container" style="position: center">
          <div class="btn">
            <el-button style="color: #607188; font-size: 14px" size="mini" type="text" @click="selectCanteen" >
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
      <!--用户数据-->
      <el-col :span="20" :xs="24">
        <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
          <el-form-item label="菜品名称" prop="dishesName">
            <el-input
              v-model="queryParams.dishesName"
              placeholder="请输入菜品名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="菜品类型" prop="dishesType">
            <el-select v-model="queryParams.dishesType" placeholder="请选择菜品类型" clearable size="small">
              <el-option
                v-for="type in dishesType"
                :key="parseInt(type.typeId)"
                :value="type.typeName"
                :disabled="type.status === '1'">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="菜品价格" prop="price">
            <el-input
              v-model="queryParams.price"
              placeholder="请输入菜品价格"
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
              v-hasPermi="['dish:dish:add']"
            >新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="success"
              plain
              icon="el-icon-edit"
              size="mini"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['dish:dish:edit']"
            >修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="danger"
              plain
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['dish:dish:remove']"
            >删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              plain
              icon="el-icon-download"
              size="mini"
              :loading="exportLoading"
              @click="handleExport"
              v-hasPermi="['dish:dish:export']"
            >导出</el-button>
          </el-col>
          <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="dishList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="菜品名称" align="center" prop="dishesName" :show-overflow-tooltip="true" />
          <el-table-column label="菜品类型" align="center" prop="dishesType" />
          <el-table-column label="菜品图片" align="center" prop="url" >
            <template slot-scope="scope">
              <el-image :src="getImage(scope.row.url)" ></el-image>
            </template>
          </el-table-column>
          <el-table-column label="菜品价格" align="center" prop="price" >
            <template slot-scope="scope">
              <span v-if="scope.row.price!==null">￥{{scope.row.price}}</span>
            </template>
          </el-table-column>
          <el-table-column label="月售量" align="center" prop="onsale" />
          <el-table-column label="菜品状态" align="center" prop="status">
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
                v-hasPermi="['dish:dish:edit']"
              >修改</el-button>
              <el-button
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['dish:dish:remove']"
              >删除</el-button>
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
    <!-- 添加或修改菜品对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="菜品名称" prop="dishesName">
          <el-input v-model="form.dishesName" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="菜品类型" prop="typeId">
          <el-select v-model="form.typeId" placeholder="请选择菜品类型">
            <el-option
              v-for="type in dishesType"
              :key="parseInt(type.typeId)"
              :label="type.typeName"
              :value="parseInt(type.typeId)"
              :disabled="type.status === '1'">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="归属食堂" prop="canteenIds">
          <el-select v-model="form.canteenIds" multiple placeholder="请选择">
            <el-option
              v-for="item in canteenOptions"
              :key="item.id"
              :label="item.label"
              :value="item.id"
              :disabled="item.disabled"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜品图片" prop="url">
          <imageUpload v-model="form.url" :limit="1"/>
        </el-form-item>
        <el-form-item label="菜品价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入菜品价格" />
        </el-form-item>
        <el-form-item label="菜品状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in dict.type.sys_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
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

<script>
import { listDish, getDish, delDish, addDish, updateDish, exportDish, changeDishStatus } from "@/api/dish/dish";
import { listType } from "@/api/dish/type";
import { listInfo } from '@/api/canteen/info'
import { treeselect } from  "@/api/canteen/info"
import Treeselect from '@riophae/vue-treeselect'
import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Dish",
  dicts: ['sys_status'],
  components: { Treeselect },
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
      // 状态字典
      statusOptions: [],
      // 菜品表格数据
      dishList: [],
      // 菜品类型数据
      dishesType: [],
      // 菜品类型数量
      typeTotal: 0,
      // 食堂数据
      canteenOptions: [],
      // 食堂数量
      canteenTotal: 0,
      // 食堂名称
      canteenName: undefined,
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        canteenId: null,
        dishesName: null,
        dishesType: null,
        price: null,
      },
      // 表单参数
      form: {},
      defaultProps: {
        children: "children",
        label: "label",
        disabled: "disabled"
      },
      // 表单校验
      rules: {
        dishesName:[
          { required: true, message: '菜品名称不能为空', trigger: 'blur' },
          { min: 2, max: 20, message: '菜品名称长度必须介于 2 和 20 之间', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '菜品价格不能为空', trigger: 'blur' },
          { pattern: /^(0\.\d{0,1}[1-9]|\+?[1-9][0-9]{0,3})(\.\d{1,2})?$/, message: '请输入0-10000之间且小于2位小数的金额', trigger: 'blur' }
        ],
        canteenIds: [
          { required: true, message: '所属食堂不能为空', trigger: 'blur' }
        ],
      }
    };
  },
  created() {
    this.getList();
    this.getDicts('sys_status').then(response => {
      this.statusOptions = response.data
    })
    this.getType();
    this.getCanteen();
    this.getCanteenIds();
  },
  methods: {
    /** 查询菜品列表 */
    getList() {
      this.loading = true;
      listDish(this.queryParams).then(response => {
        this.dishList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    /** 查询菜品类型 */
    getType(){
      listType(this.queryParams).then(response => {
        this.dishesType = response.rows;
        this.typeTotal = response.total;
      });
    },
    /** 查询食堂下拉列表 */
    getCanteen(){
      treeselect().then(response => {
        this.canteenOptions = response.data;
        this.canteenTotal = response.total;
      });
    },
    /** 查询食堂id组 */
    getCanteenIds(){
      treeselect().then(response => {
        this.canteenIds = response.data;
        this.canteenTotal = response.total;
      });
    },
    /** 返回图片地址 */
    getImage(url) {
      return "https://ricepoint-1305004688.cos.ap-nanjing.myqcloud.com"+url;
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        dishId: null,
        dishesName: null,
        dishesType: null,
        canteenIds: null,
        canteenOptions: null,
        url: null,
        price: null,
        onsale: null,
        status: "0",
        delFlag: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.dishId)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加菜品";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const dishId = row.dishId || this.ids
      getDish(dishId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改菜品";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.dishId != null) {
            updateDish(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDish(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const dishIds = row.dishId || this.ids;
      this.$modal.confirm('是否确认删除菜品名称为"' + row.dishesName + '"的数据项？').then(function() {
        return delDish(dishIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$modal.confirm('是否确认导出所有菜品数据项？').then(() => {
        this.exportLoading = true;
        return exportDish(queryParams);
      }).then(response => {
        this.$download.name(response.msg);
        this.exportLoading = false;
      }).catch(() => {});
    },
    /** 状态修改按钮操作 */
    handleStatusChange(row) {
      let text = row.status === '0' ? '启用' : '停用'
      this.$modal.confirm('确认要' + text + '吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return changeDishStatus(row.dishId, row.status)
      }).then(() => {
        this.$modal.msgSuccess(text + '成功')
      }).catch(function() {
        row.status = row.status === '0' ? '1' : '0'
      })
    },
    // 节点单击事件
    handleNodeClick(data) {
      this.queryParams.canteenId = data.id;
      this.getList();
    },
    // 单击全部食堂事件
    selectCanteen(){
      this.queryParams.canteenId = null;
      this.getList();
    },
  }
};
</script>
