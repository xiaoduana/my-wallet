import { ethers } from "ethers"
import { getWallet } from "./wallet"

export async function sendTransaction(
  tx
) {

  try {

    const wallet =
      await getWallet()

    console.log(
      "wallet:",
      wallet.address
    )

    /**
     * chainId
     */
    const network =
      await wallet.provider
        .getNetwork()

    console.log(
      "network:",
      network
    )

    /**
     * nonce
     */
    const nonce =
      await wallet.provider
        .getTransactionCount(
          wallet.address,
          "pending"
        )

    /**
     * normalize tx
     */
    const txRequest = {

      to:
        tx.to,

      data:
        tx.data || "0x",

      value:
        tx.value
          ? BigInt(tx.value)
          : 0n,

      nonce,

      chainId:
        Number(network.chainId)
    }

    /**
     * estimate gas
     */
    const gasLimit =
      await wallet.provider
        .estimateGas({
          ...txRequest,
          from: wallet.address
        })

    /**
     * fee data
     */
    const feeData =
      await wallet.provider
        .getFeeData()

    const finalTx = {

      ...txRequest,

      gasLimit,

      maxFeePerGas:
        feeData.maxFeePerGas,

      maxPriorityFeePerGas:
        feeData.maxPriorityFeePerGas
    }

    console.log(
      "finalTx:",
      finalTx
    )

    /**
     * send tx
     */
    const txResponse =
      await wallet.sendTransaction(
        finalTx
      )

    console.log(
      "tx hash:",
      txResponse.hash
    )

    /**
     * wait receipt
     */
    const receipt =
      await txResponse.wait()

    console.log(
      "receipt:",
      receipt
    )

    /**
     * tx reverted
     */
    if (
      receipt.status !== 1
    ) {

      throw new Error(
        "Transaction reverted"
      )
    }

    return {
      hash:
        txResponse.hash,

      receipt
    }

  } catch (err) {

    console.error(
      "sendTransaction error:",
      err
    )

    throw err
  }
}