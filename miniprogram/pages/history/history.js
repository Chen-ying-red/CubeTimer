// pages/history/history.js
const app = getApp();

Page({
  data: {
    theme: 'dark',
    solves: [],
    pbDisplay: '--',
    totalCount: 0,
    ao5Display: '--',
    ao12Display: '--'
  },

  onShow: function () {
    this.loadHistoryData();
  },

  onPullDownRefresh: function () {
    this.loadHistoryData();
    wx.stopPullDownRefresh();
  },

  loadHistoryData: function () {
    const solves = app.globalData.solves || [];
    const prec = app.globalData.precision || 2;
    const theme = app.globalData.theme;
    const style = app.globalData.themeStyle || 'minimal';
    const themeClass = theme === 'light' ? 'theme-light' : ('theme-' + style);

    this.setData({
      themeClass: themeClass,
      solves: solves,
      totalCount: solves.length
    });

    this.calculateStats(solves, prec);
  },

  calculateStats: function (solves, prec) {
    if (!solves || solves.length === 0) {
      this.setData({
        pbDisplay: '--',
        ao5Display: '--',
        ao12Display: '--'
      });
      return;
    }

    // 1. 计算 PB (仅考虑有效成绩)
    const validSolves = solves.filter(s => s.penalty !== 'DNF');
    if (validSolves.length > 0) {
      const minMs = Math.min(...validSolves.map(s => s.timeMs));
      this.setData({
        pbDisplay: this.formatTime(minMs, prec)
      });
    } else {
      this.setData({ pbDisplay: 'DNF' });
    }

    // 2. 计算 Ao5
    if (solves.length >= 5) {
      const last5 = solves.slice(0, 5);
      const ao5 = this.calcAverage(last5, prec);
      this.setData({ ao5Display: ao5 });
    } else {
      this.setData({ ao5Display: '--' });
    }

    // 3. 计算 Ao12
    if (solves.length >= 12) {
      const last12 = solves.slice(0, 12);
      const ao12 = this.calcAverage(last12, prec);
      this.setData({ ao12Display: ao12 });
    } else {
      this.setData({ ao12Display: '--' });
    }
  },

  calcAverage: function (list, prec) {
    const dnfCount = list.filter(s => s.penalty === 'DNF').length;
    if (dnfCount >= 2) return 'DNF';

    const times = list.map(s => s.penalty === 'DNF' ? Infinity : s.timeMs);
    times.sort((a, b) => a - b);

    // 去掉最高和最低，计算其余均值
    times.pop();
    times.shift();

    const sum = times.reduce((acc, curr) => acc + curr, 0);
    const avg = sum / times.length;
    return this.formatTime(avg, prec);
  },

  formatTime: function (ms, prec) {
    if (ms <= 0 || ms === Infinity) return 'DNF';
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(prec);
    
    if (minutes > 0) {
      const secStr = (totalSeconds % 60 < 10 ? '0' : '') + seconds;
      return `${minutes}:${secStr}`;
    }
    return seconds;
  },

  deleteSolve: function (e) {
    const id = e.currentTarget.dataset.id;
    const that = this;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条成绩记录吗？',
      success: function (res) {
        if (res.confirm) {
          app.deleteSolve(id);
          that.loadHistoryData();
        }
      }
    });
  },

  clearHistory: function () {
    const that = this;
    wx.showModal({
      title: '清空历史',
      content: '警告：确定要清空全部历史成绩吗？（数据同步后可通过微信账号再次拉取）',
      confirmColor: '#ef4444',
      success: function (res) {
        if (res.confirm) {
          app.clearAllSolves();
          that.loadHistoryData();
        }
      }
    });
  }
});
