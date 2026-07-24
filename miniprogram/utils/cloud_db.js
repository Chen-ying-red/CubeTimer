// miniprogram/utils/cloud_db.js
/**
 * 微信云数据库 (CloudBase) 存取封装
 * 自动绑定当前微信账号 OpenID
 */

const DB_COLLECTION = 'solves';

// 1. 初始化并检查云开发
function checkCloudAvailable() {
  return typeof wx !== 'undefined' && wx.cloud && typeof wx.cloud.database === 'function';
}

// 2. 将单条成绩保存至微信云端数据库
function saveSolveToCloud(solveObj) {
  return new Promise((resolve, reject) => {
    if (!checkCloudAvailable()) {
      resolve(null);
      return;
    }
    const db = wx.cloud.database();
    db.collection(DB_COLLECTION).add({
      data: solveObj,
      success: res => resolve(res),
      fail: err => {
        console.warn("微信云开发暂未建表或未开启，成绩已在本地完好保存:", err);
        resolve(null);
      }
    });
  });
}

// 3. 从微信账号云端数据库拉取全部历史成绩
function fetchSolvesFromCloud() {
  return new Promise((resolve, reject) => {
    if (!checkCloudAvailable()) {
      resolve([]);
      return;
    }
    const db = wx.cloud.database();
    db.collection(DB_COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get({
        success: res => resolve(res.data || []),
        fail: err => {
          console.warn("读取云端数据跳过，使用本地缓存数据:", err);
          resolve([]);
        }
      });
  });
}

// 4. 从云端删除指定成绩
function deleteSolveFromCloud(solveId) {
  return new Promise((resolve, reject) => {
    if (!checkCloudAvailable()) {
      resolve(null);
      return;
    }
    const db = wx.cloud.database();
    db.collection(DB_COLLECTION).where({ id: solveId }).remove({
      success: res => resolve(res),
      fail: err => resolve(null)
    });
  });
}

module.exports = {
  saveSolveToCloud,
  fetchSolvesFromCloud,
  deleteSolveFromCloud
};
