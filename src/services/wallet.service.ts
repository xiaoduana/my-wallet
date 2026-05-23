import { mnemonicToAccount, privateKeyToAccount } from 'viem/accounts'
import { generateMnemonic } from 'bip39'

export class WalletService {
  static createMnemonic() {
    return generateMnemonic()
  }

  static importMnemonic(mnemonic: string, index = 0) {
    const account = mnemonicToAccount(mnemonic, {
      addressIndex: index
    })

    return {
      address: account.address,
      privateKey: account.getHdKey().privateKey?.toString("hex")
    }
  }

  static importPrivateKey(privateKey: `0x${string}`) {
    const account = privateKeyToAccount(privateKey)

    return {
      address: account.address,
      privateKey
    }
  }
}