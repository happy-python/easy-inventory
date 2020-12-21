<template>
  <div class="app-container">
    <el-table
      :data="list"
      v-loading.body="listLoading"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="日期" align="center" width="100">
        <template slot-scope="scope">
          {{ scope.row.date }}
        </template>
      </el-table-column>
      <el-table-column label="配入产品名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.in_product_name_list }}
        </template>
      </el-table-column>
      <el-table-column label="配入数量" align="center">
        <template slot-scope="scope">
          {{ scope.row.in_product_number_list }}
        </template>
      </el-table-column>
      <el-table-column label="配出产品名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.out_product_name }}
        </template>
      </el-table-column>
      <el-table-column label="配出数量" align="center">
        <template slot-scope="scope">
          {{ scope.row.out_product_number }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="200">
        <template slot-scope="scope">
          <i class="el-icon-time"></i>
          <span>{{ scope.row.create_time | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template slot-scope="scope">
          <span
            ><el-button
              type="danger"
              @click="del(scope.row.id)"
              icon="el-icon-delete"
              size="mini"
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
import { delMatch, paginationMatch, countMatch } from "@/api/database";
import { parseTime } from "@/utils/index";

export default {
  data() {
    return {
      total: 0,
      currentPage: 1,
      list: null,
      listLoading: true,
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
      countMatch().then((res) => {
        this.total = res.total;
      });
      paginationMatch(pageNum).then((res) => {
        this.list = res;
        this.listLoading = false;
      });
    },
    del(id) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          delMatch(id).then(() => {
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
  },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.pg {
  margin-top: 10px;
}
</style>
