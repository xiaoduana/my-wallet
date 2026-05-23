// inject.js - 注入到页面的脚本
(function () {
  // 1. 创建提供者实例
  console.log("23423534534")
  const provider = new YourWalletProvider();

  // 2. 定义钱包元数据（必须严格遵守格式）
  const walletInfo = {
    uuid: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx', // 生成 UUID v4
    name: '我的钱包',                              // 显示名称
    icon: 'data:image/svg+xml,...',               // Base64 编码的图标
    rdns: 'com.mycompany.mywallet'                // 唯一反向域名标识符
  };

  // 3. 创建声明事件对象（必须使用 Object.freeze）
  const announceEvent = new CustomEvent('eip6963:announceProvider', {
    detail: Object.freeze({
      info: walletInfo,
      provider: provider
    })
  });

  // 4. 监听 DApp 的请求事件
  window.addEventListener('eip6963:requestProvider', () => {
    // 重新派发声明事件
    window.dispatchEvent(announceEvent);
  });

  // 5. 钱包加载完成后立即声明
  window.dispatchEvent(announceEvent);

  // 6. 可选：同时注入传统 window.ethereum（向后兼容旧 DApp）
  if (!window.ethereum) {
    window.ethereum = provider;
  } else if (!window.ethereum.providers) {
    // 处理多钱包共存
    window.ethereum = provider;
  }

  console.log('钱包已通过 EIP-6963 注册');
})();