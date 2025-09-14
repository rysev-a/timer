import { defineConfig } from "@playwright/test";

export default defineConfig({
  globalSetup: "./src/e2e/setup-db.ts",
  testMatch: /.*\.test.ts/,
});
