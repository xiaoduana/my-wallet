
chrome.runtime.onMessage.addListener(
  (
    message,
    sender,
    sendResponse
  ) => {
    if (
      message.type !==
      "MY_WALLET_REQUEST"
    ) {
      return
    }

    (async () => {
      const { method, params } =
        message.args

      const storage =
        await chrome.storage.local.get(
          "wallet-store"
        )

      const rawWalletStore =
        storage["wallet-store"]


      /**
       * 关键
       */
      const walletStore =
        typeof rawWalletStore ===
          "string"
          ? JSON.parse(
            rawWalletStore
          )
          : rawWalletStore


      const state =
        walletStore?.state

      const currentAccount =
        state?.currentAccount

      const currentNetwork =
        state?.currentNetwork

      try {
        switch (method) {
          /**
           * 连接钱包
           */
          case "eth_requestAccounts": {
            sendResponse({
              result: currentAccount
                ? [
                  currentAccount.address
                ]
                : []
            })

            break
          }

          /**
           * 获取账户
           */
          case "eth_accounts": {
            sendResponse({
              result: currentAccount
                ? [
                  currentAccount.address
                ]
                : []
            })

            break
          }

          /**
           * 获取 chainId
           */
          case "eth_chainId": {
            sendResponse({
              result:
                currentNetwork
                  ?.chainId || "0x1"
            })

            break
          }

          default: {
            sendResponse({
              error:
                "Method not implemented"
            })
          }
        }
      } catch (err) {
        sendResponse({
          error: err.message
        })
      }
    })()

    return true
  }
)