// background.js
// 监听来自 DApp 的连接请求
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CONNECT_WALLET') {
    // 获取请求连接的 DApp 信息
    const dappUrl = sender.url || message.origin;
    const dappOrigin = new URL(dappUrl).origin;

    console.log(`收到连接请求，来自: ${dappOrigin}`);

    // 打开授权弹窗让用户确认
    chrome.windows.create({
      url: chrome.runtime.getURL(`popup.html?dapp=${encodeURIComponent(dappOrigin)}&requestId=${Date.now()}`),
      type: 'popup',
      width: 400,
      height: 600,
      focused: true
    });

    // 保存请求上下文，等待用户授权
    savePendingRequest(message.requestId, {
      dappOrigin,
      sender,
      sendResponse
    });

    return true; // 保持消息通道
  }

  // 处理用户授权后的确认
  if (message.type === 'CONNECT_APPROVED') {
    const { requestId, accounts, chainId } = message;
    const pending = getPendingRequest(requestId);

    if (pending) {
      // 返回授权后的账户地址给 DApp
      pending.sendResponse({
        success: true,
        accounts,
        chainId,
        message: '连接成功'
      });

      // 保存已连接的 DApp 白名单
      saveConnectedDApp(pending.dappOrigin, accounts[0], Date.now());

      removePendingRequest(requestId);
    }
  }

  // 处理用户拒绝
  if (message.type === 'CONNECT_REJECTED') {
    const { requestId } = message;
    const pending = getPendingRequest(requestId);

    if (pending) {
      pending.sendResponse({
        success: false,
        error: '用户拒绝了连接请求'
      });
      removePendingRequest(requestId);
    }
  }
});

// 管理待处理的请求
const pendingRequests = new Map();

function savePendingRequest (id, data) {
  pendingRequests.set(id, data);
}

function getPendingRequest (id) {
  return pendingRequests.get(id);
}

function removePendingRequest (id) {
  pendingRequests.delete(id);
}

function saveConnectedDApp (origin, account, timestamp) {
  chrome.storage.local.get('connectedDApps', (result) => {
    const dapps = result.connectedDApps || {};
    dapps[origin] = { account, timestamp, connected: true };
    chrome.storage.local.set({ connectedDApps: dapps });
  });
}