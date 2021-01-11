<template>
  <div class="app-container">
    <div class="table">
      <el-tag>原煤入洗情况表</el-tag>
      <el-button
        icon="el-icon-download"
        size="medium"
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
    </div>

    <div class="table">
      <el-tag>库存结余表</el-tag>

      <el-date-picker
        size="medium"
        type="date"
        placeholder="请选择日期"
        v-model="date"
        value-format="yyyy-MM-dd"
        @change="changeDate"
      ></el-date-picker>

      <el-button
        icon="el-icon-download"
        size="medium"
        type="primary"
        @click="downloadExcel2"
        :loading="downloadExcelLoading"
        >导出</el-button
      >
    </div>

    <el-table :data="inventory" style="width: 100%">
      <el-table-column
        label="产品"
        prop="name"
        align="center"
      ></el-table-column>
      <el-table-column label="入库" align="center">
        <el-table-column
          label="调入"
          prop="in"
          align="center"
        ></el-table-column>
        <el-table-column label="配出" prop="match_out" align="center">
        </el-table-column>
        <el-table-column label="出洗" prop="wash_out" align="center">
        </el-table-column>
      </el-table-column>
      <el-table-column label="出库" align="center">
        <el-table-column label="调出" prop="out" align="center">
        </el-table-column>
        <el-table-column label="配入" prop="match_in" align="center">
        </el-table-column>
        <el-table-column label="入洗" prop="wash_in" align="center">
        </el-table-column>
      </el-table-column>
      <el-table-column label="盘盈" prop="inventory" align="center">
      </el-table-column>
      <el-table-column
        label="期末余量"
        prop="remain"
        align="center"
      ></el-table-column>
      <el-table-column
        label="成本"
        prop="cost"
        align="center"
      ></el-table-column>
    </el-table>
  </div>
</template>

<script>
import {
  paginationWash,
  countWash,
  allWash,
  inventoryData,
} from "@/api/database";
import { parseTime } from "@/utils/index";
import download from "@/utils/download";

export default {
  data() {
    return {
      total: 0,
      total2: 0,
      currentPage: 1,
      list: null,
      listLoading: true,
      downloadExcelLoading: false,
      inventory: null,
      date: "",
    };
  },
  filters: {
    parseTime,
  },
  created() {
    this.fetchData(this.currentPage);
    this.date = parseTime(new Date(), "{y}-{m}-{d}");
    inventoryData(this.date).then((res) => {
      this.inventory = res;
    });
  },
  methods: {
    changeDate(date) {
      inventoryData(date).then((res) => {
        this.inventory = res;
      });
    },
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
    // 原煤入洗情况表 导出表格
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
              .excel(
                name,
                [
                  {
                    name,
                    data,
                  },
                ],
                null
              )
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
    // 库存结余表 导出表格
    downloadExcel2() {
      this.downloadExcelLoading = true;
      try {
        const data = [
          [
            "产品",
            "入库",
            null,
            null,
            "出库",
            null,
            null,
            "盘盈",
            "期末余量",
            "成本",
          ],
          [
            null,
            "调入",
            "配出",
            "出洗",
            "调出",
            "配入",
            "入洗",
            null,
            null,
            null,
          ],
        ];

        for (const item of this.inventory) {
          data.push([
            item.name,
            item.in,
            item.match_out,
            item.wash_out,
            item.out,
            item.match_in,
            item.wash_in,
            item.inventory,
            item.remain,
            item.cost,
          ]);
        }
        const name = "库存结余表";

        // 合并单元格
        const range1 = { s: { c: 0, r: 0 }, e: { c: 0, r: 1 } }; // A1:A2
        const range2 = { s: { c: 1, r: 0 }, e: { c: 3, r: 0 } }; // B1:D1
        const range3 = { s: { c: 4, r: 0 }, e: { c: 6, r: 0 } }; // E1:G1
        const range4 = { s: { c: 7, r: 0 }, e: { c: 7, r: 1 } }; // H1:H2
        const range5 = { s: { c: 8, r: 0 }, e: { c: 8, r: 1 } }; // I1:I2
        const range6 = { s: { c: 9, r: 0 }, e: { c: 9, r: 1 } }; // J1:J2
        const options = {
          "!merges": [range1, range2, range3, range4, range5, range6],
        };

        download
          .excel(
            name,
            [
              {
                name,
                data,
              },
            ],
            options
          )
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
