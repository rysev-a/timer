import {
  type Browser,
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";
import axios from "axios";
import { authE2eConfig } from "./auth.e2e.config";

const BROWSER_URL = (process.env.BROWSER_URL as string) || "http://localhost:5173";
const SERVER_URL = (process.env.SERVER_URL as string) || "http://localhost:8000";

const resetPasswordEmail = "admin@mail.com";
const resetPasswordValue = "new password";

test.describe("reset password tests", () => {
  let page: Page;
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch();
    const context: BrowserContext = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test("reset password success", async () => {
    await page.goto(BROWSER_URL);
    await page.getByRole("link", { name: "Forgot your password?" }).click();
    await page.getByTestId(authE2eConfig.startResetPasswordInput).fill(resetPasswordEmail);
    await page.getByTestId(authE2eConfig.startResetPasswordButton).click();

    const resetPasswordFormDescription = page.getByText(/Enter code from email and new password/);
    await expect(resetPasswordFormDescription).toBeVisible();

    const {
      data: { code },
    } = await axios.get(`${SERVER_URL}/api/e2e/activate-code/${resetPasswordEmail}`);

    await page.getByTestId(authE2eConfig.resetPasswordInput).fill(resetPasswordValue);
    await page.getByTestId(authE2eConfig.resetPasswordCodeInput).fill(code);
    await page.getByTestId(authE2eConfig.resetPasswordButton).click();

    const emailElement = await page.getByTestId(authE2eConfig.userEmailLabel);
    const html = await emailElement.innerHTML();
    expect(html).toEqual(resetPasswordEmail);
  });
});
