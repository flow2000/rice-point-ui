<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="小程序id" prop="wxappId">
        <el-input
          v-model="queryParams.wxappId"
          placeholder="请输入小程序id"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="openid" prop="openId">
        <el-input
          v-model="queryParams.openId"
          placeholder="请输入openid"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户昵称" prop="nickName">
        <el-input
          v-model="queryParams.nickName"
          placeholder="请输入用户昵称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户类型" prop="userType">
        <el-select v-model="queryParams.userType" placeholder="请选择用户类型" clearable size="small">
          <el-option
            v-for="dict in dict.type.user_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
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
          v-hasPermi="['miniprogram:user:add']"
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
          v-hasPermi="['miniprogram:user:edit']"
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
          v-hasPermi="['miniprogram:user:remove']"
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
          v-hasPermi="['miniprogram:user:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"  />
      <el-table-column label="小程序id" align="center" prop="wxappId" v-if="columns[0].visible"/>
      <el-table-column label="unionid" align="center" prop="unionid" v-if="columns[1].visible" :show-overflow-tooltip="true"/>
      <el-table-column label="openid" align="center" prop="openId" v-if="columns[2].visible"/>
      <el-table-column label="用户昵称" align="center" prop="nickName" v-if="columns[3].visible" :show-overflow-tooltip="true"/>
      <el-table-column label="用户类型" align="center" prop="userType" v-if="columns[4].visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.user_type" :value="scope.row.userType"/>
        </template>
      </el-table-column>
      <el-table-column label="头像" align="center" prop="avatar" v-if="columns[5].visible">
        <template slot-scope="scope">
          <el-image :src="scope.row.avatar" style="width:50px;border-radius: 50px;">
            <div slot="error" class="image-slot">
              <el-image src="https://cdn.panghai.top/d/rice-point/avatar/default-avatar.png"></el-image>
            </div>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column label="用户性别" align="center" prop="sex" v-if="columns[6].visible">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_user_sex" :value="scope.row.sex"/>
        </template>
      </el-table-column>
      <el-table-column label="国家" align="center" prop="country" v-if="columns[7].visible" :show-overflow-tooltip="true"/>
      <el-table-column label="省份" align="center" prop="province" v-if="columns[8].visible" :show-overflow-tooltip="true"/>
      <el-table-column label="城市" align="center" prop="city" v-if="columns[9].visible" :show-overflow-tooltip="true"/>
      <el-table-column label="备注" align="center" prop="remark" v-if="columns[10].visible" :show-overflow-tooltip="true"/>
      <el-table-column label="最后登录时间" align="center" prop="loginDate" width="180" v-if="columns[11].visible">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.loginDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['miniprogram:user:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['miniprogram:user:remove']"
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

    <!-- 添加或修改微信用户对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="小程序id" prop="wxappId">
          <el-input v-model="form.wxappId" placeholder="请输入小程序id" />
        </el-form-item>
        <el-form-item label="unionid" prop="unionid">
          <el-input v-model="form.unionid" placeholder="请输入unionid" />
        </el-form-item>
        <el-form-item label="openid" prop="openId">
          <el-input v-model="form.openId" placeholder="请输入openid" />
        </el-form-item>
        <el-form-item label="用户昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="请输入用户昵称" />
        </el-form-item>
        <el-form-item label="用户类型" prop="userType">
          <el-select v-model="form.userType" placeholder="请选择用户类型">
            <el-option
              v-for="dict in dict.type.user_type"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像">
          <imageUpload v-model="form.avatar" :limit="1"/>
        </el-form-item>
        <el-form-item label="用户性别" prop="sex">
          <el-select v-model="form.sex" placeholder="请选择用户性别">
            <el-option
              v-for="dict in dict.type.sys_user_sex"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="国家" prop="country">
          <el-input v-model="form.country" placeholder="请输入国家" />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input v-model="form.province" placeholder="请输入省份" />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="form.city" placeholder="请输入城市" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
import { listUser, getUser, delUser, addUser, updateUser, exportUser } from "@/api/miniprogram/user";

export default {
  name: "User",
  dicts: ['user_type', 'sys_user_sex'],
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
      // 微信用户表格数据
      userList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        wxappId: null,
        openId: null,
        nickName: null,
        userType: null,
      },
      // 表单参数
      form: {},
      // 列信息
      columns: [
        { key: 0, label: `小程序id`, visible: true },
        { key: 1, label: `unionid`, visible: false },
        { key: 2, label: `openid`, visible: true },
        { key: 3, label: `用户昵称`, visible: true },
        { key: 4, label: `用户类型`, visible: true },
        { key: 5, label: `头像`, visible: true },
        { key: 6, label: `用户性别`, visible: false },
        { key: 7, label: `国家`, visible: false },
        { key: 8, label: `省份`, visible: false },
        { key: 9, label: `城市`, visible: false },
        { key: 10, label: `备注`, visible: true },
        { key: 11, label: `最后登录时间`, visible: true }
      ],
      // 表单校验
      rules: {
        id: [
          { required: true, message: "主键不能为空", trigger: "blur" }
        ],
        wxappId: [
          { required: true, message: "小程序id不能为空", trigger: "blur" }
        ],
        openId: [
          { required: true, message: "openid不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询微信用户列表 */
    getList() {
      this.loading = true;
      listUser(this.queryParams).then(response => {
        this.userList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        wxappId: null,
        unionid: null,
        openId: null,
        nickName: null,
        userType: null,
        avatar: null,
        sex: null,
        country: null,
        province: null,
        city: null,
        createTime: null,
        updateTime: null,
        remark: null,
        loginDate: null
      };
      this.resetForm("form");
    },
    /** 返回图片地址 */
    getImage(url) {
      return process.env.VUE_APP_FILE_API + url.replace("/profile","");
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
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加微信用户";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getUser(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改微信用户";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateUser(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addUser(this.form).then(response => {
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
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除微信用户编号为"' + ids + '"的数据项？').then(function() {
        return delUser(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$modal.confirm('是否确认导出所有微信用户数据项？').then(() => {
        this.exportLoading = true;
        return exportUser(queryParams);
      }).then(response => {
        this.$download.name(response.msg);
        this.exportLoading = false;
      }).catch(() => {});
    }
  }
};
</script>
