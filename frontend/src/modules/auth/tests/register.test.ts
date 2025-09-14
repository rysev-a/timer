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

test.describe("registration tests", () => {
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

  test("registration with to short password", async () => {
    await page.goto(BROWSER_URL);
    const registerEmail = "customer@mail.com";
    await page.getByRole("link", { name: "Register" }).click();
    await page.getByTestId(authE2eConfig.registerInputEmail).click();
    await page.getByTestId(authE2eConfig.registerInputEmail).fill(registerEmail);
    await page.getByTestId(authE2eConfig.registerInputPassword).fill("password");
    await page.getByTestId(authE2eConfig.registerSubmitButton).click();
    await expect(await page.getByText(/User already exists/)).toBeVisible();
  });

  test("registration with exist email", async () => {
    await page.goto(BROWSER_URL);
    const registerEmail = "rysev-a@yandex.ru";
    await page.getByRole("link", { name: "Register" }).click();
    await page.getByTestId(authE2eConfig.registerInputEmail).click();
    await page.getByTestId(authE2eConfig.registerInputEmail).fill(registerEmail);
    await page.getByTestId(authE2eConfig.registerInputPassword).fill("psswrd");
    await page.getByTestId(authE2eConfig.registerSubmitButton).click();
    await expect(await page.getByText(/Password too short/)).toBeVisible();
  });

  test("registration success", async () => {
    await page.goto(BROWSER_URL);

    const registerEmail = "rysev-a@yandex.ru";

    await page.getByRole("link", { name: "Register" }).click();
    await page.getByTestId(authE2eConfig.registerInputEmail).click();
    await page.getByTestId(authE2eConfig.registerInputEmail).fill(registerEmail);
    await page.getByTestId(authE2eConfig.registerInputPassword).fill("password");
    await page.getByTestId(authE2eConfig.registerSubmitButton).click();

    const registerFormTitle = await page.getByText(/Success register/);
    await expect(registerFormTitle).toBeVisible();

    const {
      data: { code },
    } = await axios.get(`${SERVER_URL}/api/e2e/activate-code/${registerEmail}`);

    await page.getByTestId(authE2eConfig.activateInputCode).fill(code);
    await page.getByTestId(authE2eConfig.activateAccountButton).click();

    const activationSuccess = await page.getByText(/Success activate account!/);
    await expect(activationSuccess).toBeVisible();

    const emailElement = await page.getByTestId(authE2eConfig.userEmailLabel);
    const html = await emailElement.innerHTML();
    expect(html).toEqual(registerEmail);
  });
});
