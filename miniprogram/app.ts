App({
  onLaunch() {
    // 微信云开发环境初始化
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // ⚠️ 非常重要：请务必将下方单引号里的内容替换为您自己的微信云开发环境 ID！
        // 环境 ID 可以在微信开发者工具顶部点击“云开发” -> “设置” 中找到。
        env: 'your-env-id', 
        traceUser: true,
      })
    }
  },
  globalData: {
    userInfo: null
  }
})