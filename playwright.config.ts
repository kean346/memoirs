import path from "node:path";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.ts",
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, downloadsPath: path.resolve("../work/downloads") },
  },
  workers: 1,
});


