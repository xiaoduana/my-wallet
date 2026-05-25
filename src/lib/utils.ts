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