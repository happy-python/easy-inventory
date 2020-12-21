<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :inline="true">
      <el-form-item label="产品名称:">
        <el-input
          v-model="form.name"
          placeholder="请输入产品名称"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="create" icon="el-icon-edit"
          >立即创建</el-button
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
      <el-table-column label="产品名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="产品数量" align="center">
        <template slot-scope="scope">
          {{ scope.row.quantity }}
        </template>
      </el-table-column>
      <el-table-column label="成本" align="center">
        <template slot-scope="scope">
          {{ scope.row.cost }}
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
              @click="del(scope.row.id)"
              icon="el-icon-delete"
              >删除</el-button
            ></span
          >
          <!-- <span
            ><el-button
              size="mini"
              @click="edit(scope.row.id, scope.row.name)"
              icon="el-icon-edit"
              >编辑</el-button
            ></span
          > -->
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
  paginationProduct,
  createProduct,
  delProduct,
  updateProduct,
  countProduct,
} from "@/api/database";
import { parseTime } from "@/utils/index";

export default {
  data() {
    return {
      total: 0,
      currentPage: 1,
      list: [],
      listLoading: true,
      form: {
        name: "",
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
      this.list = [];
      this.currentPage = val;
      this.fetchData(val);
    },
    fetchData(pageNum) {
      this.listLoading = true;
      countProduct().then((res) => {
        this.total = res.total;
      });
      paginationProduct(pageNum).then((res) => {
        this.list = res;
        this.listLoading = false;
      });
    },
    create() {
      createProduct(this.form.name)
        .then(() => {
          this.$message({
            message: "创建成功",
            type: "success",
          });
          this.form.name = "";
          setTimeout(() => {
            this.fetchData(this.currentPage);
          }, 2000);
        })
        .catch((err) => {
          this.$message.error(err);
        });
    },
    del(id) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delProduct(id).then(() => {
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
    edit(id, name) {
      this.$prompt("请输入产品名称", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPlaceholder: `${name}`,
      })
        .then(({ value }) => {
          updateProduct(id, value)
            .then(() => {
              this.$message({
                type: "success",
                message: "更新成功",
              });
              this.form.name = "";
              setTimeout(() => {
                this.fetchData(this.currentPage);
              }, 2000);
            })
            .catch((err) => {
              this.$message.error("更新失败");
            });
        })
        .catch((err) => {});
    },
  },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.pg {
  margin-top: 10px;
}
</style>
