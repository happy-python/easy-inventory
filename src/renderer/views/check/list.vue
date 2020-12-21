<template>
  <div class="app-container">
    <el-form
      ref="form"
      :model="form"
      :inline="true"
      :rules="rules"
      size="medium"
    >
      <el-form-item label="选择日期:" prop="date">
        <el-col>
          <el-date-picker
            type="date"
            placeholder="选择日期"
            v-model="form.date"
            style="width: 100%;"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-col>
      </el-form-item>

      <el-form-item label="选择产品:" prop="product_id">
        <el-select
          v-model="form.product_id"
          placeholder="请选择产品"
          @visible-change="queryProducts"
          @change="changeProduct"
        >
          <el-option
            :label="item.name"
            :value="item.id"
            v-for="(item, index) in products"
            :key="index"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="选择盈亏:" prop="check">
        <el-select v-model="form.status" placeholder="请选择盈亏">
          <el-option label="盈" value="1"></el-option>
          <el-option label="亏" value="-1"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="盈亏数量:" prop="data">
        <el-input
          v-model.number="form.data"
          placeholder="请输入盘盈、盘亏数量"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="create" icon="el-icon-edit"
          >提交</el-button
        >
      </el-form-item>
    </el-form>

    <el-table
      :data="list"
      v-loading.body="listLoading"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="日期" align="center">
        <template slot-scope="scope">
          {{ scope.row.date }}
        </template>
      </el-table-column>
      <el-table-column label="产品名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.product_name }}
        </template>
      </el-table-column>
      <el-table-column label="产品数量" align="center">
        <template slot-scope="scope">
          {{ scope.row.quantity }}
        </template>
      </el-table-column>
      <el-table-column label="盈亏状态" align="center">
        <template slot-scope="scope">
          {{ scope.row.status | statusFilter }}
        </template>
      </el-table-column>
      <el-table-column label="盈亏数量" align="center">
        <template slot-scope="scope">
          {{ scope.row.data }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{ scope.row.create_time | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200">
        <template slot-scope="scope">
          <span
            ><el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="del(scope.row.id, scope.row.product_id)"
              >删除</el-button
            ></span
          >
        </template>
      </el-table-column>
    </el-table>

    <div class="pg">
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        background
        layout="total, prev, pager, next"
        :total="total"
        :page-size="10"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import {
  listProduct,
  createCheck,
  delCheck,
  paginationCheck,
  countCheck,
} from "@/api/database";
import { parseTime } from "@/utils/index";

export default {
  data() {
    return {
      total: 0,
      currentPage: 1,
      list: null,
      listLoading: true,
      form: {
        date: "",
        product_id: "",
        product_name: "",
        status: "",
        data: "",
      },
      products: [],
      rules: {
        date: [
          {
            required: true,
            message: "请选择日期",
            trigger: "blur",
          },
        ],
        product_id: [
          { required: true, message: "请选择产品", trigger: "change" },
        ],
        status: [{ required: true, message: "请选择盈亏", trigger: "change" }],
        data: [
          { required: true, message: "请填写盈亏数量", trigger: "blur" },
          { type: "number", message: "盈亏数量必须为数字值", trigger: "blur" },
        ],
      },
    };
  },
  filters: {
    parseTime,
    statusFilter: function(value) {
      if (value == 1) return "盈";
      return "亏";
    },
  },
  created() {
    this.fetchData(this.currentPage);
  },
  methods: {
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchData(val);
    },
    fetchData(pageNum) {
      this.listLoading = true;
      countCheck().then((res) => {
        this.total = res.total;
      });
      paginationCheck(pageNum).then((res) => {
        this.list = res;
        this.listLoading = false;
      });
    },
    create() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          createCheck(this.form)
            .then(() => {
              this.$message({
                message: "创建成功",
                type: "success",
              });
              this.resetForm();
              setTimeout(() => {
                this.fetchData(this.currentPage);
              }, 2000);
            })
            .catch((err) => {
              console.log(err);
              this.$message.error("创建失败");
            });
        } else {
          this.$notify({
            title: "警告",
            message: "请检查提交的内容是否完整",
            type: "warning",
          });
          return false;
        }
      });
    },
    del(id, product_id) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delCheck(id, product_id).then(() => {
            this.$message({
              message: "删除成功",
              type: "success",
            });
            setTimeout(() => {
              this.fetchData(this.currentPage);
            }, 2000);
          });
        })
        .catch(() => {});
    },
    changeProduct(id) {
      let p = this.products.filter((item) => item.id == id);
      if (p.length > 0) {
        this.form.product_name = p[0].name;
      }
    },
    queryProducts(show) {
      if (show) {
        listProduct().then((res) => {
          this.products = res;
        });
      }
    },
    resetForm() {
      this.form = {
        date: "",
        product_id: "",
        product_name: "",
        status: "",
        data: "",
      };
    },
  },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.pg {
  margin-top: 10px;
}
</style>
