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
        <el-date-picker
          style="width:40%"
          type="date"
          placeholder="请选择日期"
          v-model="form.date"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>

      <el-form-item label="配入产品:" prop="in_product_id_list">
        <el-select
          style="width:40%"
          multiple
          v-model="form.in_product_id_list"
          placeholder="请选择配入产品（支持多选）"
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

      <el-form-item label="配入数量:" prop="in_product_number_list">
        <el-input
          style="width:40%"
          v-model="form.in_product_number_list"
          placeholder="请依次输入配入数量（使用、分割，如：100、200）"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="配出产品:" required>
        <el-select
          style="width:40%"
          v-model="form.out_product_id"
          placeholder="请选择配出产品"
          @visible-change="queryProducts"
          @change="changeOutProduct"
        >
          <el-option
            :label="item.name"
            :value="item.id"
            v-for="(item, index) in products"
            :key="index"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="配出数量:" prop="out_product_number">
        <el-input
          style="width:40%"
          v-model.number="form.out_product_number"
          placeholder="请输入配出数量"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="warning" icon="el-icon-refresh" @click="reset"
          >重置</el-button
        >
        <el-button type="primary" @click="create" icon="el-icon-edit"
          >立即提交</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { listProduct, createMatch } from "@/api/database";
import { parseTime } from "@/utils/index";

export default {
  data() {
    return {
      form: {
        date: "",
        in_product_number_list: "",
        in_product_id_list: [],
        in_product_name_list: "",
        out_product_number: "",
        out_product_id: "",
        out_product_name: "",
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
        in_product_id_list: [
          { required: true, message: "请选择产品", trigger: "change" },
        ],
        in_product_number_list: [
          { required: true, message: "请填写洗入数量", trigger: "blur" },
        ],
        out_product_number: [
          { required: true, message: "请填写洗出数量", trigger: "blur" },
          { type: "number", message: "洗出数量必须为数字值", trigger: "blur" },
        ],
      },
    };
  },
  filters: {
    parseTime,
  },
  methods: {
    reset() {
      this.form = {
        date: "",
        in_product_number_list: "",
        in_product_id_list: [],
        in_product_name_list: "",
        out_product_number: "",
        out_product_id: "",
        out_product_name: "",
      };
    },
    create() {
      if (
        this.form.in_product_id_list.length >= 2 &&
        this.form.in_product_number_list.indexOf("、") == -1
      ) {
        this.$message.error("配入数量格式有误，请重新输入");
        return;
      }

      const number_list = this.form.in_product_number_list.split("、");

      if (number_list.length != this.form.in_product_id_list.length) {
        this.$message.error(
          `配入产品个数${this.form.in_product_id_list.length}不等于配入数量个数${number_list.length}，请重新输入`
        );
        return;
      }

      let form = Object.assign({}, this.form);
      let in_product_name_list = [];
      for (
        let index = 0;
        index < this.form.in_product_id_list.length;
        index++
      ) {
        const id = this.form.in_product_id_list[index];

        let p = this.products.filter((item) => item.id == id);
        if (p.length > 0) {
          const name = p[0].name;
          // 检查数量
          if (parseFloat(p[0].quantity) < parseFloat(number_list[index])) {
            this.$message.error(
              `${name}的配入数量${number_list[index]}超过最大可使用数量${p[0].quantity}，请重新输入`
            );
            return;
          }
          in_product_name_list.push(name);
        }
      }

      form.in_product_name_list = in_product_name_list.join("、");
      form.in_product_id_list = this.form.in_product_id_list.join("、");

      this.$refs["form"].validate((valid) => {
        if (valid) {
          createMatch(form)
            .then(() => {
              this.$message({
                message: "创建成功",
                type: "success",
              });

              setTimeout(() => {
                this.$router.push({ path: "/match/list" });
              }, 2000);
            })
            .catch((err) => {
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
    queryProducts(show) {
      if (show) {
        listProduct().then((res) => {
          this.products = res;
        });
      }
    },
    changeOutProduct(id) {
      let p = this.products.filter((item) => item.id == id);
      if (p.length > 0) {
        this.form.out_product_name = p[0].name;
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
