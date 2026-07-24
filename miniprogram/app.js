// app.js
const cloudDb = require('./utils/cloud_db.js');

App({
  globalData: {
    theme: 'dark', // 'dark' | 'light'
    themeStyle: 'minimal', // 'minimal' | 'cyberpunk' | 'emerald' | 'sakura' | 'ocean' | 'nord' | 'sunset'
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
        console.log("微信云开发 (CloudBase) 环境初始化成功");
      } catch (err) {
        console.warn("未配置云开发环境或使用测试号，默认激活本地高速存储", err);
      }
    }

    // 2. 读取本地基础配置与成绩
    this.initLocalData();
  },

  initLocalData: function () {
    try {
      const theme = wx.getStorageSync('cubeTheme') || 'dark';
      const themeStyle = wx.getStorageSync('cubeThemeStyle') || 'minimal';
      const precision = wx.getStorageSync('cubeTimerPrecision') || 2;
      const solves = wx.getStorageSync('cubeTimerSolves') || [];

      this.globalData.theme = theme;
      this.globalData.themeStyle = themeStyle;
      this.globalData.precision = parseInt(precision);
      this.globalData.solves = solves;

      // 3. 如果启用了云开发，静默合并拉取微信账号云端成绩
      if (this.globalData.cloudEnabled) {
        this.syncCloudData();
      }
    } catch (e) {
      console.error("读取本地存储失败", e);
    }
  },

  // 微信账号云端数据拉取与去重合并
  syncCloudData: function () {
    const that = this;
    cloudDb.fetchSolvesFromCloud().then(cloudSolves => {
      if (cloudSolves && cloudSolves.length > 0) {
        // 本地与云端数据合并去重
        const localSolves = that.globalData.solves || [];
        const solveMap = {};

        localSolves.forEach(item => { if (item.id) solveMap[item.id] = item; });
        cloudSolves.forEach(item => { if (item.id) solveMap[item.id] = item; });

        const mergedList = Object.values(solveMap).sort((a, b) => b.timestamp - a.timestamp);
        that.globalData.solves = mergedList;
        wx.setStorageSync('cubeTimerSolves', mergedList);
        console.log("微信账号云端成绩拉取合并成功，当前共", mergedList.length, "条成绩");
      }
    }).catch(err => {
      console.log("云端静默读取跳过", err);
    });
  },

  // 保存单次成绩 (本地 + 微信账号云数据库)
  saveSolve: function (solveObj) {
    this.globalData.solves.unshift(solveObj);
    wx.setStorageSync('cubeTimerSolves', this.globalData.solves);

    // 写入微信账号云端数据库
    if (this.globalData.cloudEnabled) {
      cloudDb.saveSolveToCloud(solveObj);
    }
  },

  // 删除单次成绩 (本地 + 微信账号云数据库)
  deleteSolve: function (id) {
    this.globalData.solves = this.globalData.solves.filter(item => item.id !== id);
    wx.setStorageSync('cubeTimerSolves', this.globalData.solves);

    if (this.globalData.cloudEnabled) {
      cloudDb.deleteSolveFromCloud(id);
    }
  },

  // 清空历史成绩
  clearAllSolves: function () {
    this.globalData.solves = [];
    wx.setStorageSync('cubeTimerSolves', []);
  }
});
