// provider.js - 实现 EIP-1193 标准接口
class YourWalletProvider {
  constructor() {
    this.listeners = new Map();
    this.isConnected = false;
    this.chainId = '0x1'; // 默认 Ethereum Mainnet
    this.accounts = [];
  }

  // 核心方法：处理所有 RPC 请求
  async request (args) {
    const { method, params } = args;

    switch (method) {
      case 'eth_requestAccounts':
        // 触发钱包 UI 请求用户授权
        return this.connectWallet();

      case 'eth_accounts':
        return this.accounts;

      case 'eth_chainId':
        return this.chainId;

      case 'personal_sign':
        return this.signMessage(params[0], params[1]);

      case 'eth_sendTransaction':
        return this.sendTransaction(params[0]);

      case 'wallet_switchEthereumChain':
        return this.switchChain(params[0].chainId);

      case 'wallet_addEthereumChain':
        return this.addChain(params[0]);

      default:
        throw new Error(`Method ${method} not supported`);
    }
  }

  // 事件监听（EIP-1193 要求）
  on (eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);
  }

  removeListener (eventName, callback) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  // 触发内部事件
  emit (eventName, ...args) {
    const callbacks = this.listeners.get(eventName);
    if (callbacks) {
      callbacks.forEach(cb => cb(...args));
    }
  }

  // 你的钱包逻辑实现
  async connectWallet () {
    // 这里实现你的钱包连接逻辑
    // 可以通过 chrome.runtime 与 background script 通信
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'CONNECT_WALLET' },
        (response) => {
          if (response.success) {
            this.accounts = [response.account];
            this.isConnected = true;
            this.emit('accountsChanged', this.accounts);
            resolve(this.accounts);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }

  async signMessage (message, address) {
    // 签名逻辑
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'SIGN_MESSAGE', message, address },
        (response) => {
          if (response.success) {
            resolve(response.signature);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }

  async sendTransaction (tx) {
    // 发送交易逻辑
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'SEND_TRANSACTION', tx },
        (response) => {
          if (response.success) {
            resolve(response.txHash);
          } else {
            reject(new Error(response.error));
          }
        }
      );
    });
  }
}