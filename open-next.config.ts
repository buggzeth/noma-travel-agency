import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // We provide a minimal implementation that satisfies the IncrementalCache interface
  // This effectively disables caching but allows the build to proceed without R2.
  incrementalCache: async () => ({
    name: "disabled-cache",
    get: async (key) => null,
    set: async (key, value) => {},
    delete: async (key) => {},
  }),
});