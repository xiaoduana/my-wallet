import {
  Wallet,
  JsonRpcProvider
} from "ethers"
import CryptoJS from "crypto-js"
import { getWalletState } from "@/lib/utils"
import { parsePrivateKey } from "@/lib/utils"

export async function getWallet() {
  try {
    const walletStore =
      await getWalletState()

    const state =
      walletStore?.state ||
      walletStore

    const currentAccount =
      state?.currentAccount

    const currentNetwork =
      state?.currentNetwork

    const originPassword =
      state?.originPassword

    if (!currentAccount) {
      throw new Error(
        "No account"
      )
    }

    if (!originPassword) {
      throw new Error(
        "Wallet locked"
      )
    }
    /**
     * decrypt private key
     */
    const privateKey =
      parsePrivateKey(
        currentAccount.privateKey,
        originPassword
      )

    if (!privateKey) {
      throw new Error(
        "Decrypt private key failed"
      )
    }

    /**
     * provider
     */
    const provider =
      new JsonRpcProvider(
        currentNetwork.rpcUrl
      )

    /**
     * signer
     */
    const wallet =
      new Wallet(
        privateKey,
        provider
      )

    return wallet
  } catch (err) {

    console.error(
      "getWallet error:",
      err
    )
  }

}