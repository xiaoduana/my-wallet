export default {
  manifest: {
    permissions: ["storage"],

    host_permissions: ["<all_urls>"],

    web_accessible_resources: [
      {
        resources: ["contents/inject.js"],

        matches: ["<all_urls>"]
      }
    ]
  }
}