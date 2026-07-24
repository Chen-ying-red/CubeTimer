// pages/tutorial/tutorial.js
const app = getApp();
const cfopData = require('../../utils/cfop_data.js');

Page({
  data: {
    theme: 'dark',
    activeTab: 'f2l', // 'cross', 'f2l', 'oll', 'pll'
    searchQuery: '',
    crossData: {},
    groupsList: []
  },

  onLoad: function () {
    this.setData({
      crossData: cfopData.CFOP_CROSS
    });
    this.renderList();
  },

  onShow: function () {
    this.setData({
      theme: app.globalData.theme
    });
  },

  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      searchQuery: ''
    });
    this.renderList();
  },

  onSearchInput: function (e) {
    const val = e.detail.value;
    this.setData({
      searchQuery: val
    });
    this.renderList();
  },

  renderList: function () {
    const tab = this.data.activeTab;
    if (tab === 'cross') return;

    let rawList = [];
    if (tab === 'f2l') rawList = cfopData.CFOP_F2L;
    else if (tab === 'oll') rawList = cfopData.CFOP_OLL;
    else if (tab === 'pll') rawList = cfopData.CFOP_PLL;

    const query = this.data.searchQuery.trim().toLowerCase();
    if (query) {
      rawList = rawList.filter(item => 
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.formula.toLowerCase().includes(query)
      );
    }

    // 按 category 分组
    const groupsMap = {};
    rawList.forEach(item => {
      const cat = item.category || '全部公式';
      if (!groupsMap[cat]) groupsMap[cat] = [];
      groupsMap[cat].push(item);
    });

    const groupsList = Object.keys(groupsMap).map(cat => ({
      category: cat,
      list: groupsMap[cat]
    }));

    this.setData({
      groupsList: groupsList
    });
  },

  // 微信原生复制接口
  copyFormula: function (e) {
    const formula = e.currentTarget.dataset.formula;
    wx.setClipboardData({
      data: formula,
      success: function () {
        wx.showToast({
          title: '公式已复制',
          icon: 'success',
          duration: 1500
        });
      }
    });
  }
});
