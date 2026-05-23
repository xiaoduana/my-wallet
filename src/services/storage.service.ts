export class StorageService {
  static async set(key: string, value: any) {
    await chrome.storage.local.set({
      [key]: value
    })
  }

  static async get(key: string) {
    const result = await chrome.storage.local.get(key)
    return result[key]
  }

  static async remove(key: string) {
    await chrome.storage.local.remove(key)
  }
}