// pages/timer/timer.js
const app = getApp();
const scrambleUtil = require('../../utils/scramble.js');

let holdTimer = null;
let intervalTimer = null;

Page({
  data: {
    themeClass: 'theme-minimal',
    precision: 2,
    puzzleList: ['3x3', '2x2', '4x4', '5x5', 'Pyraminx', 'Megaminx', 'Skewb', 'SQ1', 'Clock'],
    puzzleIndex: 0,
    scrambleText: '',
    appState: 'IDLE', // IDLE, HOLDING, READY, RUNNING
    timerClass: 'timer-idle',
    displayTime: '0.00',
    startTime: 0,
    elapsedMs: 0,
    showModal: false,
    modalTimeDisplay: '0.00'
  },

  onLoad: function () {
    this.refreshScramble();
  },

  onShow: function () {
    const theme = app.globalData.theme || 'dark';
    const style = app.globalData.themeStyle || 'minimal';
    const themeClass = theme === 'light' ? 'theme-light' : ('theme-' + style);

    this.setData({
      themeClass: themeClass,
      precision: app.globalData.precision || 2
    });
    this.updateDisplayTime(0);
  },

  onPuzzleChange: function (e) {
    const idx = parseInt(e.detail.value);
    this.setData({
      puzzleIndex: idx
    });
    this.refreshScramble();
  },

  refreshScramble: function () {
    const puzzleType = this.data.puzzleList[this.data.puzzleIndex];
    const scramble = scrambleUtil.generateScramble(puzzleType);
    this.setData({
      scrambleText: scramble
    });
  },

  // 格式化时间输出
  formatTime: function (ms, prec) {
    if (ms <= 0) return prec === 3 ? '0.000' : '0.00';
    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(prec);
    
    if (minutes > 0) {
      const secStr = (totalSeconds % 60 < 10 ? '0' : '') + seconds;
      return `${minutes}:${secStr}`;
    }
    return seconds;
  },

  updateDisplayTime: function (ms) {
    const timeStr = this.formatTime(ms, this.data.precision);
    this.setData({
      displayTime: timeStr
    });
  },

  // 触摸逻辑状态机
  onTouchStart: function () {
    if (this.data.showModal) return;

    const state = this.data.appState;
    if (state === 'RUNNING') {
      // 停止计时
      this.stopTimer();
      return;
    }

    if (state === 'IDLE') {
      this.setData({
        appState: 'HOLDING',
        timerClass: 'timer-holding'
      });
      if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });

      // 按住 300ms 进入 READY 就绪
      holdTimer = setTimeout(() => {
        if (this.data.appState === 'HOLDING') {
          this.setData({
            appState: 'READY',
            timerClass: 'timer-ready'
          });
          if (wx.vibrateShort) wx.vibrateShort({ type: 'medium' });
        }
      }, 300);
    }
  },

  onTouchEnd: function () {
    if (this.data.showModal) return;

    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }

    const state = this.data.appState;
    if (state === 'HOLDING') {
      // 未达到就绪时间取消
      this.setData({
        appState: 'IDLE',
        timerClass: 'timer-idle'
      });
    } else if (state === 'READY') {
      // 开始计时
      this.startTimer();
    }
  },

  startTimer: function () {
    const now = Date.now();
    this.setData({
      appState: 'RUNNING',
      timerClass: 'timer-running',
      startTime: now,
      elapsedMs: 0
    });

    intervalTimer = setInterval(() => {
      const currentMs = Date.now() - this.data.startTime;
      this.updateDisplayTime(currentMs);
    }, 10);
  },

  stopTimer: function () {
    if (intervalTimer) {
      clearInterval(intervalTimer);
      intervalTimer = null;
    }

    const finalMs = Date.now() - this.data.startTime;
    this.setData({
      elapsedMs: finalMs,
      appState: 'IDLE',
      timerClass: 'timer-idle',
      showModal: true,
      modalTimeDisplay: this.formatTime(finalMs, this.data.precision)
    });
  },

  // 确认成绩惩罚并保存至微信账号与本地
  confirmPenalty: function (e) {
    const penalty = e.currentTarget.dataset.penalty; // 'OK', '+2', 'DNF'
    let rawMs = this.data.elapsedMs;
    let finalTimeStr = this.formatTime(rawMs, this.data.precision);

    if (penalty === '+2') {
      rawMs += 2000;
      finalTimeStr = this.formatTime(rawMs, this.data.precision) + ' (+2)';
    } else if (penalty === 'DNF') {
      finalTimeStr = 'DNF';
    }

    const solveObj = {
      id: 'solve_' + Date.now(),
      puzzle: this.data.puzzleList[this.data.puzzleIndex],
      scramble: this.data.scrambleText,
      timeMs: rawMs,
      displayTime: finalTimeStr,
      penalty: penalty,
      timestamp: Date.now()
    };

    // 保存成绩 (自动备份至微信账号云数据库)
    app.saveSolve(solveObj);

    this.setData({
      showModal: false
    });

    // 刷新新打乱
    this.refreshScramble();
  }
});
