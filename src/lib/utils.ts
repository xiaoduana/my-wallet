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