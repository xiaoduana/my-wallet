import { getWalletState, sanitizeTx } from "@/lib/utils"
import { session } from "@/background/session";
import { sendTransaction } from "@/lib/sendTransaction";
import { StorageService } from "@/services/storage.service"
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


    (async () => {
      const state = await getWalletState()
      const currentAccount = state?.currentAccount
      const currentNetwork = state?.currentNetwork
      const isLocked = state?.isLocked
      const key = `approval_${message.approvalId}`
      const approval = await StorageService.get(key)
      try {
        /**
       * approval data
       */
        if (
          message.type ===
          "GET_APPROVAL"
        ) {
          sendResponse(approval)

          return
        }

        /**
         * approve tx
         */
        if (
          message.type ===
          "APPROVE_TX"
        ) {
          const approval =
            await StorageService.get(
              `approval_${message.approvalId}`
            )

          const tx =
            await sendTransaction(
              approval.tx
            )

          chrome.tabs.sendMessage(
            approval.tabId,
            {
              type: "TX_APPROVED",

              requestId:
                approval.requestId,

              hash:
                tx.hash,
            }
          )

          await StorageService.remove(
            `approval_${message.approvalId}`
          )

          sendResponse({
            success: true,
          })
        }

        /**
         * reject tx
         */
        if (
          message.type ===
          "REJECT_TX"
        ) {

          if (approval) {

            approval.sendResponse({
              error:
                "User rejected"
            })

            StorageService.remove(
              message.approvalId
            )
          }

          sendResponse({
            success: true
          })

          return
        }

        /**
         * dapp rpc request
         */
        if (
          message.type !==
          "MY_WALLET_REQUEST"
        ) {

          sendResponse({
            error:
              "Unknown message type"
          })

          return
        }

        const { method, params } =
          message.args

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
                  ?.chainId || "0xaa36a7"
            })

            break
          }

          /**
         * send tx
         */
          case "eth_sendTransaction": {

            const approvalId = crypto.randomUUID()

            await StorageService.set(`approval_${approvalId}`, {
              tx: message.args.params[0],
              requestId: message.requestId,
              tabId: sender.tab.id
            })

            /**
             * open approval popup
             */
            chrome.windows.create({
              url:
                `popup.html?page=approval&id=${approvalId}`,

              type: "popup",

              width: 380,

              height: 700
            })
            sendResponse({
              pending: true,
              approvalId,
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