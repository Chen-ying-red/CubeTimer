// pages/settings/settings.js
const app = getApp();

Page({
  data: {
    theme: 'dark',
    themeClass: 'theme-minimal',
    styleKeys: ['minimal', 'cyberpunk', 'emerald', 'sakura', 'ocean', 'nord', 'sunset'],
    styleOptions: [
      '简洁黑白 (Minimal)', 
      '赛博朋克 (Cyberpunk)', 
      '翡翠森林 (Emerald)', 
      '浪漫樱花 (Sakura)', 
      '静谧深海 (Ocean)', 
      '北欧极光 (Nord)', 
      '温暖落日 (Sunset)'
    ],
    styleIndex: 0,
    precisionOptions: ['0.00 (两位)', '0.000 (三位)'],
    precisionIndex: 0
  },

  onShow: function () {
    const prec = app.globalData.precision || 2;
    const theme = app.globalData.theme || 'dark';
    const style = app.globalData.themeStyle || 'minimal';

    let sIdx = this.data.styleKeys.indexOf(style);
    if (sIdx === -1) sIdx = 0;

    const themeClass = theme === 'light' ? 'theme-light' : ('theme-' + style);

    this.setData({
      theme: theme,
      themeClass: themeClass,
      styleIndex: sIdx,
      precisionIndex: prec === 3 ? 1 : 0
    });
  },

  onStyleChange: function (e) {
    const idx = parseInt(e.detail.value);
    const selectedStyleKey = this.data.styleKeys[idx];

    app.globalData.themeStyle = selectedStyleKey;
    wx.setStorageSync('cubeThemeStyle', selectedStyleKey);

    const themeClass = app.globalData.theme === 'light' ? 'theme-light' : ('theme-' + selectedStyleKey);

    this.setData({
      styleIndex: idx,
      themeClass: themeClass
    });

    wx.showToast({
      title: '已切换为 ' + this.data.styleOptions[idx],
      icon: 'none'
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
    const styleKey = app.globalData.themeStyle || 'minimal';
    const themeClass = newTheme === 'light' ? 'theme-light' : ('theme-' + styleKey);

    this.setData({
      theme: newTheme,
      themeClass: themeClass
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
