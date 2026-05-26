import injectScript from "url:./inject.js"

/**
 * 注入 provider
 */
const script =
  document.createElement("script")

script.src = injectScript
script.type = "text/javascript"

document.documentElement.appendChild(
  script
)

script.onload = () => {
  script.remove()
}

/**
 * inject.js -> content.ts
 */
window.addEventListener(
  "message",
  async (event) => {
    if (event.source !== window) return
    if (event.data?.source !== "my-wallet") return
    if (event.data?.type != "request") return
    if (event.data?.target !== "my-wallet-content") return

    try {
      /**
       * 转发给 background
       */
      const response =
        await chrome.runtime.sendMessage({
          type: "MY_WALLET_REQUEST",
          requestId: event.data.requestId,
          args: event.data.args
        })

      /**
       * 返回 inject.js
       */
      window.postMessage(
        {
          source: "my-wallet",
          type: "response",
          requestId: event.data.requestId,
          result: response.result,
          args: event.data.args
        },
        "*"
      )

      chrome.runtime.onMessage.addListener(
        (message) => {

          if (
            message.type ===
            "TX_APPROVED"
          ) {

            window.postMessage({
              target:
                "my-wallet-injected",

              requestId:
                message.requestId,

              result:
                message.hash
            })
          }
        }
      )
    } catch (error) {
      window.postMessage(
        {
          source: "my-wallet",
          type: "response",
          requestId: event.data.requestId,
          error: error.message
        },
        "*"
      )
    }
  }
)