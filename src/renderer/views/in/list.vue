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

      <el-form-item label="入库数量:" prop="quantity">
        <el-input
          v-model.number="form.quantity"
          placeholder="请输入入库数量"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="煤单价:" prop="price">
        <el-input
          v-model.number="form.price"
          placeholder="请输入煤单价"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="运费单价:" prop="fee">
        <el-input
          v-model.number="form.fee"
          placeholder="请输入运费单价"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="create" icon="el-icon-edit"
          >立即入库</el-button
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
      <el-table-column label="入库数量" align="center">
        <template slot-scope="scope">
          {{ scope.row.quantity }}
        </template>
      </el-table-column>
      <el-table-column label="煤单价" align="center">
        <template slot-scope="scope">
          {{ scope.row.price }}
        </template>
      </el-table-column>
      <el-table-column label="运费单价" align="center">
        <template slot-scope="scope">
          {{ scope.row.fee }}
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center">
        <template slot-scope="scope">
          {{ scope.row.notes }}
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
  createStorage,
  delStorage,
  updateProduct,
  paginationStorage,
  countStorage,
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
        quantity: "",
        price: "",
        fee: "",
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
        quantity: [
          { required: true, message: "请填写入库数量", trigger: "blur" },
          { type: "number", message: "入库数量必须为数字值", trigger: "blur" },
        ],
        price: [
          { required: true, message: "请填写煤单价", trigger: "blur" },
          { type: "number", message: "煤单价必须为数字值", trigger: "blur" },
        ],
        fee: [
          { required: true, message: "请填写运费单价", trigger: "blur" },
          { type: "number", message: "运费单价必须为数字值", trigger: "blur" },
        ],
      },
    };
  },
  filters: {
    parseTime,
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
      countStorage().then((res) => {
        this.total = res.total;
      });
      paginationStorage(pageNum).then((res) => {
        this.list = res;
        this.listLoading = false;
      });
    },
    create() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          createStorage(this.form)
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
              this.$message.error(err);
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
          delStorage(id, product_id).then(() => {
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
    queryProducts(show) {
      if (show) {
        listProduct().then((res) => {
          this.products = res;
        });
      }
    },
    changeProduct(id) {
      let p = this.products.filter((item) => item.id == id);
      if (p.length > 0) {
        this.form.product_name = p[0].name;
      }
    },
    resetForm() {
      this.form = {
        date: "",
        product_id: "",
        product_name: "",
        quantity: "",
        price: "",
        fee: "",
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
