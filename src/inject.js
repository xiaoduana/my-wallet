
class MyWalletProvider {
  constructor() {
    this.chainId = "0xaa36a7"

    this.selectedAddress = null
    this.pendingRequests = {}
    this.listeners = {}

    window.addEventListener(
      "message",
      this.handleMessage.bind(this)
    )
  }

  on (event, listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    this.listeners[event].push(listener)
  }

  removeListener (event, listener) {
    if (!this.listeners[event]) return

    this.listeners[event] =
      this.listeners[event].filter(
        (l) => l !== listener
      )
  }

  emit (event, payload) {
    if (!this.listeners[event]) return
    this.listeners[event].forEach(
      (listener) => {
        listener(payload)
      }
    )
  }

  async handleMessage (event) {
    const data = event.data

    console.log("inject receive", data)
    console.log("pendingRequests", this.pendingRequests)
    if (data?.source !== "my-wallet") return
    if (data?.type !== "response") return
    if (!data?.requestId) return
    const pending = this.pendingRequests[data.requestId]


    if (!pending) {
      console.log(
        "pending not found",
        data.requestId
      )
      return
    }

    const {
      resolve,
      reject,
      args
    } = pending
    // window.removeEventListener(
    //   "message",
    //   listener
    // )

    if (data.error) {
      reject(data.error)

      delete this.pendingRequests[data.requestId]
      return
    }
    if (
      args.method ===
      "eth_requestAccounts" ||
      args.method ===
      "eth_accounts"
    ) {
      const accounts =
        Array.isArray(
          event.data.result
        )
          ? event.data.result
          : []

      const nextAddress =
        accounts[0] || null

      const previousAddress =
        this.selectedAddress

      /**
       * 更新当前地址
       */
      this.selectedAddress =
        nextAddress

      /**
       * 只有主动连接钱包
       * 且账户变化时
       * 才广播
       */
      if (nextAddress !== previousAddress) {
        this.emit(
          "accountsChanged",
          accounts
        )

        this.emit("connect", {
          chainId: this.chainId
        })
      }
    }
    console.log(
      "handle response",
      data,
      pending
    )
    if (
      event.data?.target ===
      "my-wallet-injected"
    ) {
      console.log(
        "response from content",
        event.data.result
      )
      resolve(
        event.data.result
      )
      delete this.pendingRequests[data.requestId]
      return
    }

    resolve(event.data.result)
  }

  request (args) {
    return new Promise(

      (resolve, reject) => {
        console.log(
          "provider request",
          args.method,
          args
        )
        const requestId =
          crypto.randomUUID()
        /**
         * 保存 promise
         */
        this.pendingRequests[requestId] = {
          resolve,
          reject,
          args
        }

        window.postMessage(
          {
            source: "my-wallet",
            target:
              "my-wallet-content",

            type: "request",

            requestId,

            args
          },
          "*"
        )
      }
    )
  }
}

const provider =
  new MyWalletProvider()

/**
 * EIP-6963
 */
const info = {
  uuid: crypto.randomUUID(),

  name: "MyWallet",

  icon: "https://placehold.co/64x64",

  rdns: "com.mywallet"
}

function announceProvider () {
  window.dispatchEvent(
    new CustomEvent(
      "eip6963:announceProvider",
      {
        detail: {
          info,
          provider
        }
      }
    )
  )
}

window.addEventListener(
  "eip6963:requestProvider",
  announceProvider
)

announceProvider()