// app.js
App({
  globalData: {
    theme: 'dark', // 'dark' | 'light'
    precision: 2,  // 2 | 3
    solves: [],
    userInfo: null,
    cloudEnabled: false
  },

  onLaunch: function () {
    // 1. 初始化微信云开发
    if (wx.cloud) {
      try {
        wx.cloud.init({
          traceUser: true
        });
        this.globalData.cloudEnabled = true;
        console.log("微信云开发初始化成功");
      } catch (err) {
        console.warn("未配置云开发环境，将默认使用本地缓存", err);
      }
    }

    // 2. 读取本地基础配置与成绩
    this.initLocalData();
  },

  initLocalData: function () {
    try {
      const theme = wx.getStorageSync('cubeTheme') || 'dark';
      const precision = wx.getStorageSync('cubeTimerPrecision') || 2;
      const solves = wx.getStorageSync('cubeTimerSolves') || [];

      this.globalData.theme = theme;
      this.globalData.precision = parseInt(precision);
      this.globalData.solves = solves;

      // 3. 如果启用了云开发，进行微信账号云端成绩静默拉取与同步
      if (this.globalData.cloudEnabled) {
        this.syncCloudData();
      }
    } catch (e) {
      console.error("读取本地存储失败", e);
    }
  },

  // 微信账号云端数据同步
  syncCloudData: function () {
    const that = this;
    wx.cloud.callFunction({
      name: 'syncSolves',
      data: {
        solves: that.globalData.solves
      },
      success: res => {
        if (res.result && res.result.solves) {
          that.globalData.solves = res.result.solves;
          wx.setStorageSync('cubeTimerSolves', res.result.solves);
          console.log("微信账号云端成绩同步成功，共", res.result.solves.length, "条记录");
        }
      },
      fail: err => {
        console.log("静默云同步，使用本地记录", err);
      }
    });
  },

  // 保存单次成绩
  saveSolve: function (solveObj) {
    this.globalData.solves.unshift(solveObj);
    wx.setStorageSync('cubeTimerSolves', this.globalData.solves);

    // 云端异步备份保存到微信账号数据库
    if (this.globalData.cloudEnabled) {
      const db = wx.cloud.database();
      db.collection('solves').add({
        data: solveObj
      }).catch(err => console.log("云端写入跳过:", err));
    }
  },

  // 删除单次成绩
  deleteSolve: function (id) {
    this.globalData.solves = this.globalData.solves.filter(item => item.id !== id);
    wx.setStorageSync('cubeTimerSolves', this.globalData.solves);

    if (this.globalData.cloudEnabled) {
      const db = wx.cloud.database();
      db.collection('solves').where({ id: id }).remove().catch(err => console.log("云端删除跳过:", err));
    }
  },

  // 清空历史成绩
  clearAllSolves: function () {
    this.globalData.solves = [];
    wx.setStorageSync('cubeTimerSolves', []);
  }
});
