import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

// Unit and server-rendered component tests do not need a browser or live credentials.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
})
