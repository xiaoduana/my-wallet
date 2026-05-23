import CryptoJS from 'crypto-js'

const SECRET_KEY_PREFIX = 'wallet_extension'

export class CryptoService {
  static encrypt(data: string, password: string) {
    return CryptoJS.AES.encrypt(
      data,
      SECRET_KEY_PREFIX + password
    ).toString()
  }

  static decrypt(cipherText: string, password: string) {
    const bytes = CryptoJS.AES.decrypt(
      cipherText,
      SECRET_KEY_PREFIX + password
    )

    return bytes.toString(CryptoJS.enc.Utf8)
  }
}