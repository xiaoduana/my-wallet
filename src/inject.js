
class MyWalletProvider {
  constructor() {
    this.chainId = "0xaa36a7"

    this.selectedAddress = null

    this.listeners = {}
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

  async request (args) {
    return new Promise(
      (resolve, reject) => {
        const requestId =
          crypto.randomUUID()
        /**
         * 保存 promise
         */
        this.pendingRequests ??= {}

        this.pendingRequests[
          requestId
        ] = {
          resolve,
          reject
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

        const listener = (event) => {
          /**
           * 关键
           */
          if (event.data?.source !== "my-wallet") return
          if (event.data?.type !== "response") return
          if (event.data?.requestId !== requestId) return

          window.removeEventListener(
            "message",
            listener
          )

          if (event.data.error) {
            reject(event.data.error)

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

          if (
            event.data?.target ===
            "my-wallet-injected"
          ) {
            const pending =
              this.pendingRequests?.[
              event.data.requestId
              ]

            if (!pending) return

            pending.resolve(
              event.data.result
            )

            delete this.pendingRequests[
              event.data.requestId
            ]
          }

          resolve(event.data.result)
        }

        window.addEventListener(
          "message",
          listener
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