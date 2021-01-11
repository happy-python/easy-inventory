import fs from "fs";
import fse from "fs-extra";
import xlsx from "node-xlsx";
import path from "path";
import os from "os";
import day from "dayjs";
import { ipcRenderer } from "electron";

const tmpPath = path.join(os.tmpdir(), "easy-inventory");
fse.ensureDirSync(tmpPath);
/**
 * 导出excel
 * @param {String} filename 文件名
 * @param {Object} excelOption 表格配置([{name:<String>,data:<Array>}])
 * @return {Promise} 导出回调
 */
const excel = (filename, sheet, excelOption) => {
  return new Promise((resolve, reject) => {
    const buffer = xlsx.build(sheet, excelOption);
    const fileName = `${day().format("YYYY-MM-DD_HH-mm-ss")}_${filename}.xlsx`;
    const filePath = path.join(tmpPath, fileName);

    fs.writeFileSync(filePath, buffer);
    // 本地文件下载
    ipcRenderer.send("download", `file://${filePath}`);
    ipcRenderer.on("download complete", (event, file) => {
      fse.remove(filePath);
      console.log(file);
      resolve();
    });
  });
};

export default {
  excel,
};
