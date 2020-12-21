import fse from "fs-extra";
import path from "path";
import os from "os";

// 将数据存至系统用户目录，防止用户误删程序
const docDir = path.join(os.homedir(), "easy-inventory");
const dbPath = path.join(docDir, "data.sqlite3");
fse.ensureFileSync(dbPath);
console.log("数据存储位置：", dbPath);

const Database = require("better-sqlite3");
const db = new Database(dbPath, { verbose: console.log });

try {
  // 产品
  db.exec(`CREATE TABLE product(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name VARCHAR(255) NOT NULL UNIQUE,
  create_time INTEGER NOT NULL,
  quantity INTEGER DEFAULT 0,
  cost DECIMAL(15,2) DEFAULT 0.00,
  deleted BOOLEAN DEFAULT 0 CHECK (deleted IN (0,1))
  )`);
} catch (err) {
  console.log(err);
}

try {
  // 入库
  db.exec(`CREATE TABLE storage(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  date VARCHAR(255) NOT NULL,
  product_id INTEGER NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  fee DECIMAL(15,2) NOT NULL,
  cost DECIMAL(15,2) DEFAULT 0.00,
  create_time INTEGER NOT NULL,
  deleted BOOLEAN DEFAULT 0 CHECK (deleted IN (0,1)),
  notes VARCHAR(255)
  )`);
} catch (err) {
  console.log(err);
}

try {
  // 出库
  db.exec(`CREATE TABLE outbound(
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  date VARCHAR(255) NOT NULL,
  product_id INTEGER NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  create_time INTEGER NOT NULL,
  deleted BOOLEAN DEFAULT 0 CHECK (deleted IN (0,1)),
  notes VARCHAR(255)
  )`);
} catch (err) {
  console.log(err);
}

try {
  // 盈亏记录
  db.exec(`CREATE TABLE inventory(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    date VARCHAR(255) NOT NULL,
    product_id INTEGER NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    status INTEGER NOT NULL,
    data INTEGER NOT NULL,
    create_time INTEGER NOT NULL,
    deleted BOOLEAN DEFAULT 0 CHECK (deleted IN (0,1)),
    quantity INTEGER NOT NULL
    )`);
} catch (err) {
  console.log(err);
}

try {
  // 洗煤
  db.exec(`CREATE TABLE wash(
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      date VARCHAR(255) NOT NULL,
      in_product_number_list VARCHAR(255) NOT NULL,
      in_product_id_list VARCHAR(255) NOT NULL,
      in_product_name_list VARCHAR(255) NOT NULL,
      out_product_number INTEGER NOT NULL,
      out_product_id VARCHAR(255) NOT NULL,
      out_product_name VARCHAR(255) NOT NULL,
      cost DECIMAL(15,2) DEFAULT 0.00,
      create_time INTEGER NOT NULL,
      deleted BOOLEAN DEFAULT 0 CHECK (deleted IN (0,1)),
      rate DECIMAL(15,2) DEFAULT 0.00
      )`);
} catch (err) {
  console.log(err);
}

try {
  // 配煤
  db.exec(`CREATE TABLE match(
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    date VARCHAR(255) NOT NULL,
    in_product_number_list VARCHAR(255) NOT NULL,
    in_product_id_list VARCHAR(255) NOT NULL,
    in_product_name_list VARCHAR(255) NOT NULL,
    out_product_number INTEGER NOT NULL,
    out_product_id VARCHAR(255) NOT NULL,
    out_product_name VARCHAR(255) NOT NULL,
    cost DECIMAL(15,2) DEFAULT 0.00,
    create_time INTEGER NOT NULL,
    deleted BOOLEAN DEFAULT 0 CHECK (deleted IN (0,1))
    )`);
} catch (err) {
  console.log(err);
}

const begin = db.prepare("BEGIN");
const commit = db.prepare("COMMIT");
const rollback = db.prepare("ROLLBACK");

// 入库出库计算方法
function _calculate(product_id) {
  try {
    // 查入库
    const stmt = db.prepare(
      `select * from storage where product_id=${product_id} and deleted=0 order by create_time asc`
    );
    const res = stmt.all();

    let quantity = 0;
    let last_total = 0;
    let last_quantity = 0;

    for (let index = 0; index < res.length; index++) {
      const data = res[index];
      quantity += data.quantity;

      if (index == res.length - 1) {
        last_total = data.quantity * (data.price + data.fee);
        last_quantity = data.quantity;
      }
    }

    // 查出库
    const stmt2 = db.prepare(
      `select quantity from outbound where product_id=${product_id} and deleted=0 order by create_time asc`
    );
    const res2 = stmt2.all();
    // 出库
    let out = 0;

    for (let index = 0; index < res2.length; index++) {
      out += res2[index].quantity;
    }

    // 查询产品当前成本
    const stmt3 = db.prepare(`select cost from product where id=${product_id}`);
    const res3 = stmt3.get();
    // 更新产品数量及成本
    let cost = 0;
    if (quantity - out != 0) {
      cost = (
        ((quantity - last_quantity - out) * res3.cost + last_total) /
        (quantity - out)
      ).toFixed(2);
    }

    // 更新产品数量及成本
    const stmt4 = db.prepare(
      `update product set quantity=${quantity -
        out}, cost=${cost} where id=${product_id}`
    );
    stmt4.run();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export function createProduct(name) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `insert into product(name, create_time) VALUES(?,?)`
      );
      const res = stmt.run(name, Date.parse(new Date()) / 1000);
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("新增产品失败，该产品名称已存在");
    }
  });
}

export function paginationProduct(pageNum) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select * from product where deleted=0 order by create_time desc limit 10 offset ${(pageNum -
          1) *
          10}`
      );
      const res = stmt.all();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询产品失败");
    }
  });
}

export function listProduct() {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        "select * from product where deleted=0 order by create_time desc"
      );
      const res = stmt.all();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询产品失败");
    }
  });
}

export function countProduct() {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select count(id) as total from product where deleted=0`
      );
      const res = stmt.get();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询产品失败");
    }
  });
}

export function delProduct(id) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`update product set deleted=1 where id=${id}`);
      const res = stmt.run();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("删除产品失败");
    }
  });
}

export function updateProduct(id, name) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`update product set name=${name} where id=${id}`);
      const res = stmt.run();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("更新产品失败");
    }
  });
}

function _createStorage(form) {
  // 计算当前入库的成本
  let cost = (
    (form.quantity * (form.price + form.fee)) /
    form.quantity
  ).toFixed(2);

  try {
    const stmt = db.prepare(
      `insert into storage(date, product_id, product_name, quantity, price, fee, cost, create_time, notes) VALUES(?,?,?,?,?,?,?,?,?)`
    );
    stmt.run(
      form.date,
      form.product_id,
      form.product_name,
      form.quantity,
      form.price,
      form.fee,
      cost,
      Date.parse(new Date()) / 1000,
      form.notes
    );
    _calculate(form.product_id);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// 新增入库记录重新计算
export function createStorage(form) {
  return new Promise((resolve, reject) => {
    begin.run();
    try {
      _createStorage(form);
      commit.run();
      resolve();
    } catch (err) {
      console.log(err);
      rollback.run();
      reject("新增入库记录失败");
    }
  });
}

export function paginationStorage(pageNum) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select * from storage where deleted=0 order by create_time desc limit 10 offset ${(pageNum -
          1) *
          10}`
      );
      const res = stmt.all();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询入库记录失败");
    }
  });
}

export function countStorage() {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select count(id) AS total from storage where deleted=0`
      );
      const res = stmt.get();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询入库记录总数失败");
    }
  });
}

// 删除入库记录重新计算
export function delStorage(id, product_id) {
  return new Promise((resolve, reject) => {
    begin.run();

    try {
      const stmt = db.prepare(`update storage set deleted=1 where id=${id}`);
      stmt.run();

      _calculate(product_id);

      commit.run();
      resolve();
    } catch (err) {
      console.log(err);
      rollback.run();
      reject("删除入库记录失败");
    }
  });
}

export function paginationOutbound(pageNum) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select * from outbound where deleted=0 order by create_time desc limit 10 offset ${(pageNum -
          1) *
          10}`
      );
      const res = stmt.all();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询出库记录失败");
    }
  });
}

export function countOutbound() {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select count(id) as total from outbound where deleted=0`
      );
      const res = stmt.get();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询出库记录总数失败");
    }
  });
}

function _createOutbound(form) {
  try {
    const stmt = db.prepare(
      `insert into outbound(date, product_id, product_name, quantity, price, create_time, notes) VALUES(?,?,?,?,?,?,?)`
    );
    stmt.run(
      form.date,
      form.product_id,
      form.product_name,
      form.quantity,
      form.price,
      Date.parse(new Date()) / 1000,
      form.notes
    );

    const stmt2 = db.prepare(
      `select quantity from product where id=${form.product_id}`
    );
    const res = stmt2.get();

    // 更新产品数量
    const stmt3 = db.prepare(
      `update product set quantity=${(res.quantity - form.quantity).toFixed(
        2
      )} where id=${form.product_id}`
    );
    stmt3.run();
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// 出库时产品数量减少
export function createOutbound(form) {
  return new Promise((resolve, reject) => {
    begin.run();
    try {
      _createOutbound(form);
      commit.run();
      resolve();
    } catch (err) {
      console.log(err);
      rollback.run();
      reject("新增出库记录失败");
    }
  });
}

// 删除出库记录产品数量增加
export function delOutbound(id, product_id, quantity) {
  return new Promise((resolve, reject) => {
    begin.run();

    try {
      const stmt = db.prepare(`update outbound set deleted=1 where id=${id}`);
      stmt.run();

      const stmt2 = db.prepare(
        `select quantity from product where id=${product_id}`
      );
      const res = stmt2.get();

      // 更新产品数量
      const stmt3 = db.prepare(
        `update product set quantity=${(res.quantity + quantity).toFixed(
          2
        )} where id=${product_id}`
      );
      stmt3.run();
      commit.run();
      resolve();
    } catch (err) {
      console.log(err);
      rollback.run();
      reject("删除出库记录失败");
    }
  });
}

export function paginationCheck(pageNum) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select * from inventory where deleted=0 order by create_time desc limit 10 offset ${(pageNum -
          1) *
          10}`
      );
      const res = stmt.all();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询盈亏记录失败");
    }
  });
}

export function countCheck() {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select count(id) as total from inventory where deleted=0`
      );
      const res = stmt.get();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询盈亏记录失败");
    }
  });
}

export function createCheck(form) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select quantity from product where id=${form.product_id}`
      );
      const res = stmt.get();

      const stmt2 = db.prepare(
        `insert into inventory(date, product_id, product_name, status, data, create_time, quantity) VALUES(?,?,?,?,?,?,?)`
      );
      const res2 = stmt2.run(
        form.date,
        form.product_id,
        form.product_name,
        form.status,
        form.data,
        Date.parse(new Date()) / 1000,
        res.quantity
      );
      resolve(res2);
    } catch (err) {
      console.log(err);
      reject("新增盈亏记录失败");
    }
  });
}

export function delCheck(id) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`update inventory set deleted=1 where id=${id}`);
      const res = stmt.run();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("删除盈亏记录失败");
    }
  });
}

export function paginationWash(pageNum) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select * from wash where deleted=0 order by create_time desc limit 10 offset ${(pageNum -
          1) *
          10}`
      );
      const res = stmt.all();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询洗煤记录失败");
    }
  });
}

export function countWash() {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select count(id) as total from wash where deleted=0`
      );
      const res = stmt.get();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询洗煤记录失败");
    }
  });
}

export function createWash(form) {
  return new Promise((resolve, reject) => {
    let create_time = Date.parse(new Date()) / 1000;

    begin.run();

    try {
      let id_list = form.in_product_id_list.split("、");
      let number_list = form.in_product_number_list.split("、");
      let name_list = form.in_product_name_list.split("、");

      let total_cost = 0;
      let total_number = 0;

      // 增加出库记录
      for (let index = 0; index < id_list.length; index++) {
        const id = id_list[index];
        const name = name_list[index];
        const number = parseFloat(number_list[index]);

        total_number += number;

        const stmt = db.prepare(`select cost from product where id=${id}`);
        const res = stmt.get();

        total_cost += parseFloat(
          (number * parseFloat(`${res.cost}`)).toFixed(2)
        );

        let f = {
          date: form.date,
          product_id: id,
          product_name: name,
          quantity: number,
          price: parseFloat(`${res.cost}`).toFixed(2),
          create_time: create_time,
          notes: "洗煤",
        };
        _createOutbound(f);
      }

      let cost = (total_cost / total_number).toFixed(2);

      // 增加入库记录
      let f = {
        date: form.date,
        product_id: form.out_product_id,
        product_name: form.out_product_name,
        quantity: form.out_product_number,
        price: cost,
        fee: 0,
        create_time: create_time,
        notes: "洗煤",
      };

      _createStorage(f);

      // 计算产率
      const rate = (
        parseFloat(form.out_product_number) / parseFloat(total_number)
      ).toFixed(2);

      const stmt = db.prepare(
        `insert into wash(date, in_product_number_list, in_product_id_list, in_product_name_list, 
          out_product_number, out_product_id, out_product_name, cost, create_time, rate) VALUES(?,?,?,?,?,?,?,?,?,?)`
      );
      stmt.run(
        form.date,
        form.in_product_number_list,
        form.in_product_id_list,
        form.in_product_name_list,
        form.out_product_number,
        form.out_product_id,
        form.out_product_name,
        cost,
        create_time,
        rate
      );
      commit.run();
      resolve();
    } catch (err) {
      console.log(err);
      rollback.run();
      reject("新增洗煤记录失败");
    }
  });
}

export function delWash(id) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`update wash set deleted=1 where id=${id}`);
      const res = stmt.run();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("删除洗煤记录失败");
    }
  });
}

export function paginationMatch(pageNum) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select * from match where deleted=0 order by create_time desc limit 10 offset ${(pageNum -
          1) *
          10}`
      );
      const res = stmt.all();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询配煤记录失败");
    }
  });
}

export function countMatch() {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(
        `select count(id) as total from match where deleted=0`
      );
      const res = stmt.get();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("查询配煤记录失败");
    }
  });
}

export function createMatch(form) {
  return new Promise((resolve, reject) => {
    let create_time = Date.parse(new Date()) / 1000;

    begin.run();

    try {
      let id_list = form.in_product_id_list.split("、");
      let number_list = form.in_product_number_list.split("、");
      let name_list = form.in_product_name_list.split("、");

      let total_cost = 0;
      let total_number = 0;

      // 增加出库记录
      for (let index = 0; index < id_list.length; index++) {
        const id = id_list[index];
        const name = name_list[index];
        const number = parseFloat(number_list[index]);

        total_number += number;

        const stmt = db.prepare(`select cost from product where id=${id}`);
        const res = stmt.get();

        total_cost += parseFloat(
          (number * parseFloat(`${res.cost}`)).toFixed(2)
        );

        let f = {
          date: form.date,
          product_id: id,
          product_name: name,
          quantity: number,
          price: parseFloat(`${res.cost}`).toFixed(2),
          create_time: create_time,
          notes: "配煤",
        };
        _createOutbound(f);
      }

      let cost = (total_cost / total_number).toFixed(2);

      // 增加入库记录
      let f = {
        date: form.date,
        product_id: form.out_product_id,
        product_name: form.out_product_name,
        quantity: form.out_product_number,
        price: cost,
        fee: 0,
        create_time: create_time,
        notes: "配煤",
      };

      _createStorage(f);

      const stmt = db.prepare(
        `insert into match(date, in_product_number_list, in_product_id_list, in_product_name_list, 
          out_product_number, out_product_id, out_product_name, cost, create_time) VALUES(?,?,?,?,?,?,?,?,?)`
      );
      stmt.run(
        form.date,
        form.in_product_number_list,
        form.in_product_id_list,
        form.in_product_name_list,
        form.out_product_number,
        form.out_product_id,
        form.out_product_name,
        cost,
        create_time
      );
      commit.run();
      resolve();
    } catch (err) {
      console.log(err);
      rollback.run();
      reject("新增配煤记录失败");
    }
  });
}

export function delMatch(id) {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`update match set deleted=1 where id=${id}`);
      const res = stmt.run();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("删除配煤记录失败");
    }
  });
}

// 洗煤数据导出
export function allWash() {
  return new Promise((resolve, reject) => {
    try {
      const stmt = db.prepare(`select * from wash where deleted=0`);
      const res = stmt.all();
      resolve(res);
    } catch (err) {
      console.log(err);
      reject("洗煤数据导出失败");
    }
  });
}
