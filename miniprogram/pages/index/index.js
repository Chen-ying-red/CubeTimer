// pages/index/index.js
const app = getApp();
const cloudDb = require('../../utils/cloud_db.js');

Page({
  data: {
    // 默认加载本地服务或静态资源页面
    webUrl: 'http://localhost:3000/index.html'
  },

  onLoad: function (options) {
    if (options && options.url) {
      this.setData({
        webUrl: decodeURIComponent(options.url)
      });
    }
  },

  // 监听网页发送过来的 postMessage，自动把成绩写入当前微信账号云数据库
  onWebMessage: function (e) {
    if (!e.detail || !e.detail.data) return;
    const msgList = e.detail.data;
    
    msgList.forEach(msg => {
      if (msg && msg.action === 'saveSolve' && msg.solve) {
        console.log("捕获网页成绩，正在备份至微信账号云数据库:", msg.solve);
        app.saveSolve(msg.solve);
      }
    });
  }
});
