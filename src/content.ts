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
    if (event.source !== window)
      return

    /**
     * 关键
     */
     if (
      event.data?.source !==
      "my-wallet"
    )
      return
    if (
      event.data?.type !==
      "request"
    )
      return

    if (
      event.data?.target !==
      "my-wallet-content"
    )
      return

    try {
      /**
       * 转发给 background
       */
      const response =
        await chrome.runtime.sendMessage({
          type:
            "MY_WALLET_REQUEST",

          args: event.data.args
        })
      /**
       * 返回 inject.js
       */
      window.postMessage(
        {
          source: "my-wallet",
          type: "response",

          id: event.data.id,

          result:
            response.result
        },
        "*"
      )
    } catch (error) {
      window.postMessage(
        {
          source: "my-wallet",
          type: "response",

          id: event.data.id,

          error:
            error.message
        },
        "*"
      )
    }
  }
)