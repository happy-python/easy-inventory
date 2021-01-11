<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :inline="true" size="medium">
      <el-form-item label="选择日期:">
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

      <el-form-item label="选择产品:">
        <el-select
          v-model="form.product_id"
          placeholder="请选择产品"
          @visible-change="queryProducts"
        >
          <el-option
            :label="item.name"
            :value="item.id"
            v-for="(item, index) in products"
            :key="index"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="search" icon="el-icon-search"
          >搜索</el-button
        >
        <el-button type="warning" icon="el-icon-refresh" @click="reset"
          >清空搜索</el-button
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
  delStorage,
  updateProduct,
  paginationStorage,
  countStorage,
  countStorageSearch,
  paginationStorageSearch,
} from "@/api/database";
import { parseTime } from "@/utils/index";

export default {
  data() {
    return {
      total: 0,
      currentPage: 1,
      list: null,
      listLoading: true,
      searchEnable: false,
      form: {
        date: "",
        product_id: "",
      },
      products: [],
    };
  },
  filters: {
    parseTime,
  },
  created() {
    this.fetchData(this.currentPage);
  },
  methods: {
    reset() {
      this.form.date = "";
      this.form.product_id = "";
      this.searchEnable = false;
      this.currentPage = 1;
      this.handleCurrentChange(1);
    },
    search() {
      this.searchEnable = true;
      this.fetchSearchData(this.currentPage);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      if (this.search) {
        this.fetchSearchData(val);
      } else {
        this.fetchData(val);
      }
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
    fetchSearchData(pageNum) {
      this.listLoading = true;
      countStorageSearch(this.form.date, this.form.product_id).then((res) => {
        this.total = res.total;
      });
      paginationStorageSearch(
        pageNum,
        this.form.date,
        this.form.product_id
      ).then((res) => {
        this.list = res;
        this.listLoading = false;
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
              if (this.searchEnable) {
                this.fetchSearchData(this.currentPage);
              } else {
                this.fetchData(this.currentPage);
              }
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
  },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.pg {
  margin-top: 10px;
}
</style>
