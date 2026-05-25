import { getWalletState } from "@/lib/utils"
import { session } from "@/background/session";
let pendingRequest = null
let unlockWindowId = null
chrome.runtime.onMessage.addListener(
  (
    message,
    sender,
    sendResponse
  ) => {
    if (
      message.type ===
      "WALLET_UNLOCKED"
    ) {
      console.log(session)
      session.password = message.password
      console.log("Wallet unlocked with password:", session.password)
      ; (async () => {

        const state =
          await getWalletState()

        const currentAccount =
          state?.currentAccount

        if (pendingRequest) {

          pendingRequest({
            result: currentAccount
              ? [
                currentAccount.address
              ]
              : []
          })

          pendingRequest = null
          unlockWindowId = null
        }
      })()

      return true
    }
    if (
      message.type !==
      "MY_WALLET_REQUEST"
    ) {
      return
    }

    (async () => {
      const { method, params } =
        message.args

      const state = await getWalletState()

      const currentAccount = state?.currentAccount

      const currentNetwork = state?.currentNetwork

      const isLocked = state?.isLocked
      try {
        switch (method) {
          /**
           * 连接钱包
           */
          case "eth_requestAccounts": {
            if (isLocked) {
              /**
               * 保存请求
               */
              pendingRequest = sendResponse

              /**
               * 打开解锁页面
               */
              if (!unlockWindowId) {

                const win =
                  await chrome.windows.create({
                    url: "popup.html",

                    type: "popup",

                    width: 380,

                    height: 700
                  })

                unlockWindowId = win.id
              }
              return
            }
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