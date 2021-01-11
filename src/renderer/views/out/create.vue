<template>
  <div class="app-container">
    <el-form
      ref="form"
      :model="form"
      :rules="rules"
      size="medium"
      label-width="150px"
    >
      <el-form-item label="选择日期:" prop="date">
        <el-col>
          <el-date-picker
            style="width:40%"
            type="date"
            placeholder="请选择日期"
            v-model="form.date"
            value-format="yyyy-MM-dd"
            @change="changeDate"
          ></el-date-picker>
        </el-col>
      </el-form-item>

      <el-form-item label="选择产品:" prop="product_id">
        <el-select
          style="width:40%"
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

      <el-form-item label="出库数量:" prop="quantity">
        <el-input
          style="width:40%"
          v-model.number="form.quantity"
          placeholder="请输入出库数量"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="煤单价:" required>
        <el-input
          style="width:40%"
          v-model.number="form.price"
          placeholder="煤单价"
          clearable
          :disabled="true"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="create" icon="el-icon-edit"
          >立即出库</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { createOutbound, listProduct, calculatePrice } from "@/api/database";
import { parseTime } from "@/utils/index";

export default {
  data() {
    return {
      quantity: 0,
      form: {
        date: "",
        product_id: "",
        product_name: "",
        quantity: "",
        price: "",
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
          { required: true, message: "请填写出库数量", trigger: "blur" },
          { type: "number", message: "出库数量必须为数字值", trigger: "blur" },
        ],
      },
    };
  },
  filters: {
    parseTime,
  },
  methods: {
    create() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.quantity > this.quantity) {
            this.$message({
              message: `该产品最大可出库数量为${this.quantity}`,
              type: "warning",
            });
            return;
          }

          if (this.form.price === "") {
            this.$message({
              message: `当前选择的产品煤单价有误`,
              type: "warning",
            });
            return;
          }

          createOutbound(this.form)
            .then(() => {
              this.$message({
                message: "创建成功",
                type: "success",
              });

              setTimeout(() => {
                this.$router.push({ path: "/out/list" });
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
        this.calculate();
        this.quantity = p[0].quantity;
      }
    },
    changeDate(date) {
      if (this.form.product_id != "") {
        this.calculate();
      }
    },
    calculate() {
      if (this.form.product_id != "" && this.form.date != "") {
        calculatePrice(this.form.product_id, this.form.date)
          .then((cost) => {
            this.form.price = cost;
            if (isNaN(cost)) {
              this.$notify({
                title: "警告",
                message: "当前选择的产品煤单价有误",
                type: "warning",
              });
              this.form.price = "";
            }
          })
          .catch((err) => {
            console.log(err);
            this.$message.error(err);
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
