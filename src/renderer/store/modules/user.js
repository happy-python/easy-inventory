import { login, logout, getInfo } from "@/api/login";
import { getToken, setToken, removeToken } from "@/utils/auth";

const user = {
  state: {
    token: getToken(),
    name: "",
    avatar: "",
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_NAME: (state, name) => {
      state.name = name;
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar;
    },
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim();
      return new Promise((resolve, reject) => {
        if (username == "admin" && userInfo.password == "sun666") {
          commit("SET_TOKEN", "123");
          resolve();
        } else {
          reject("用户名或者密码错误！");
        }
        // login(username, userInfo.password).then(response => {
        //   const data = response.data
        //   setToken(data.token)
        //   commit('SET_TOKEN', data.token)
        //   resolve()
        // }).catch(error => {
        //   reject(error)
        // })
      });
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        resolve();
        // getInfo(state.token)
        //   .then((response) => {
        //     const data = response.data;
        //     if (data.roles && data.roles.length > 0) {
        //       // 验证返回的roles是否是一个非空数组
        //       commit("SET_ROLES", data.roles);
        //     } else {
        //       reject("getInfo: roles must be a non-null array !");
        //     }
        //     commit("SET_NAME", data.name);
        //     commit("SET_AVATAR", data.avatar);
        //     resolve(response);
        //   })
        //   .catch((error) => {
        //     reject(error);
        //   });
      });
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token)
          .then(() => {
            commit("SET_TOKEN", "");
            commit("SET_ROLES", []);
            removeToken();
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      });
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise((resolve) => {
        removeToken();
        commit("SET_TOKEN", "");
        resolve();
      });
    },
  },
};

export default user;
