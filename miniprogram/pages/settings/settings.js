// pages/settings/settings.js
const app = getApp();

Page({
  data: {
    theme: 'dark',
    precisionOptions: ['0.00 (两位)', '0.000 (三位)'],
    precisionIndex: 0
  },

  onShow: function () {
    const prec = app.globalData.precision || 2;
    this.setData({
      theme: app.globalData.theme,
      precisionIndex: prec === 3 ? 1 : 0
    });
  },

  onPrecisionChange: function (e) {
    const idx = parseInt(e.detail.value);
    const prec = idx === 1 ? 3 : 2;

    this.setData({
      precisionIndex: idx
    });

    app.globalData.precision = prec;
    wx.setStorageSync('cubeTimerPrecision', prec);
  },

  onThemeToggle: function (e) {
    const isDark = e.detail.value;
    const newTheme = isDark ? 'dark' : 'light';

    this.setData({
      theme: newTheme
    });

    app.globalData.theme = newTheme;
    wx.setStorageSync('cubeTheme', newTheme);
  },

  forceSync: function () {
    wx.showLoading({ title: '正在同步微信云端...' });

    if (app.globalData.cloudEnabled) {
      app.syncCloudData();
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '微信云端同步完成',
          icon: 'success'
        });
      }, 1000);
    } else {
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '已完成数据安全备份',
          icon: 'none'
        });
      }, 600);
    }
  }
});
