import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export async function getWalletState() {

  const storage =
    await chrome.storage.local.get(
      "wallet-store"
    )

  const rawWalletStore =
    storage["wallet-store"]

  const walletStore =
    typeof rawWalletStore ===
    "string"
      ? JSON.parse(
          rawWalletStore
        )
      : rawWalletStore

  return walletStore?.state
}
export function sanitizeTx(tx: any) {

  return {

    to:
      tx.to,

    data:
      tx.data || "0x",

    value:
      tx.value || "0x0",

    gasLimit:
      tx.gas ||
      tx.gasLimit,

    maxFeePerGas:
      tx.maxFeePerGas ||
      undefined,

    maxPriorityFeePerGas:
      tx.maxPriorityFeePerGas ||
      undefined,

    nonce:
      tx.nonce ??
      undefined,

    chainId:
      tx.chainId
        ? Number(tx.chainId)
        : undefined
  }
}
import CryptoJS from "crypto-js"

/**
 * 判断是否是原始 privateKey
 */
export function isRawPrivateKey(
  value: string
) {

  if (!value) {
    return false
  }

  /**
   * 必须:
   * 0x + 64位 hex
   */
  return /^0x[a-fA-F0-9]{64}$/
    .test(value)
}

/**
 * 判断是否是 AES 加密数据
 */
export function isEncryptedData(
  value: string
) {

  if (!value) {
    return false
  }

  /**
   * CryptoJS AES 默认特征
   */
  return value.startsWith(
    "U2FsdGVkX1"
  )
}

/**
 * 自动解析 privateKey
 */
export function parsePrivateKey(
  value: string,
  password?: string
) {

  /**
   * 原始 pk
   */
  if (
    isRawPrivateKey(value)
  ) {

    return value
  }

  /**
   * AES encrypted
   */
  if (
    isEncryptedData(value)
  ) {

    if (!password) {

      throw new Error(
        "Password required"
      )
    }

    const decrypted =
      CryptoJS.AES.decrypt(
        value,
        password
      ).toString(
        CryptoJS.enc.Utf8
      )

    if (
      !isRawPrivateKey(
        decrypted
      )
    ) {

      throw new Error(
        "Decrypt failed"
      )
    }

    return decrypted
  }

  throw new Error(
    "Unknown private key format"
  )
}
