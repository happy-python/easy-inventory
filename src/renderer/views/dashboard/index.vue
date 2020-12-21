<template>
  <div class="app-container">
    <div class="table">
      <el-tag>原煤入洗情况表</el-tag>
      <el-button
        icon="el-icon-download"
        size="small"
        :loading="downloadExcelLoading"
        type="primary"
        @click="downloadExcel"
        >导出</el-button
      >
    </div>
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
      <el-table-column label="入煤种" align="center">
        <template slot-scope="scope">
          {{ scope.row.in_product_name_list }}
        </template>
      </el-table-column>
      <el-table-column label="入洗量" align="center">
        <template slot-scope="scope">
          {{ scope.row.in_product_number_list }}
        </template>
      </el-table-column>
      <el-table-column label="出煤种" align="center">
        <template slot-scope="scope">
          {{ scope.row.out_product_name }}
        </template>
      </el-table-column>
      <el-table-column label="出洗量" align="center">
        <template slot-scope="scope">
          {{ scope.row.out_product_number }}
        </template>
      </el-table-column>
      <el-table-column label="产率" align="center" width="100">
        <template slot-scope="scope"> {{ scope.row.rate * 100 }}% </template>
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

      <div class="table">
        <el-tag>库存结余表</el-tag>
        <el-button icon="el-icon-download" size="small" type="primary"
          >导出</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { paginationWash, countWash, allWash } from "@/api/database";
import { parseTime } from "@/utils/index";
import download from "@/utils/download";

export default {
  data() {
    return {
      total: 0,
      currentPage: 1,
      list: null,
      listLoading: true,
      downloadExcelLoading: false,
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
      countWash().then((res) => {
        this.total = res.total;
      });
      paginationWash(pageNum).then((res) => {
        this.list = res;
        this.listLoading = false;
      });
    },
    // 导出表格
    downloadExcel() {
      if (this.total == 0) {
        this.$message({
          message: "暂无数据，无法导出",
          type: "warning",
        });
        return;
      }
      this.downloadExcelLoading = true;
      try {
        allWash()
          .then((res) => {
            const data = [
              ["日期", "入煤种", "入洗量", "出煤种", "出洗量", "产率"],
            ];
            for (const item of res) {
              data.push([
                item.date,
                item.in_product_name_list,
                item.in_product_number_list,
                item.out_product_name,
                item.out_product_number,
                `${item.rate * 100}%`,
              ]);
            }
            const name = "原煤入洗情况表";
            download
              .excel(name, [
                {
                  name,
                  data,
                },
              ])
              .then((arg) => {
                this.downloadExcelLoading = false;
                this.$message({
                  message: "导出成功",
                  type: "success",
                });
              })
              .catch((err) => {
                console.log(err);
                this.downloadExcelLoading = false;
                this.$message.error("导出失败");
              });
          })
          .catch((err) => {
            console.log(err);
            this.downloadExcelLoading = false;
            this.$message.error("导出失败");
          });
      } catch (err) {
        console.log(err);
        this.downloadExcelLoading = false;
        this.$message.error("导出失败");
      }
    },
  },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.pg {
  margin-top: 10px;
}
.table {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
</style>
