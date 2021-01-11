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
            placeholder="选择日期"
            v-model="form.date"
            value-format="yyyy-MM-dd"
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

      <el-form-item label="入库数量:" prop="quantity">
        <el-input
          style="width:40%"
          v-model.number="form.quantity"
          placeholder="请输入入库数量"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="煤单价:" prop="price">
        <el-input
          style="width:40%"
          v-model.number="form.price"
          placeholder="请输入煤单价"
          clearable
        ></el-input>
      </el-form-item>

      <el-form-item label="运费单价:" prop="fee">
        <el-input
          style="width:40%"
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
  </div>
</template>

<script>
import { createStorage, listProduct } from "@/api/database";
import { parseTime } from "@/utils/index";

export default {
  data() {
    return {
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
  methods: {
    create() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          createStorage(this.form)
            .then(() => {
              this.$message({
                message: "创建成功",
                type: "success",
              });

              setTimeout(() => {
                this.$router.push({ path: "/in/list" });
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
  },
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.pg {
  margin-top: 10px;
}
</style>
