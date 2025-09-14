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

const loginUserEmail = "login@mail.com";
const notEnabledUserEmail = "login-not-enabled@mail.com";

test.describe("login tests", () => {
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

  test("login invalid email", async () => {
    await page.goto(BROWSER_URL);
    await page.getByTestId(authE2eConfig.loginInputEmail).fill(`${loginUserEmail}2`);
    await page.getByTestId(authE2eConfig.loginInputPassword).fill("password");
    await page.getByTestId(authE2eConfig.loginSubmitButton).click();

    const errorElement = await page.getByText(/User with email login@mail.com2 not found/);
    await errorElement.waitFor();
    await expect(errorElement).toBeVisible();
  });

  test("login invalid password", async () => {
    await page.goto(BROWSER_URL);
    await page.getByTestId(authE2eConfig.loginInputEmail).fill(loginUserEmail);
    await page.getByTestId(authE2eConfig.loginInputPassword).fill("password invalid");
    await page.getByTestId(authE2eConfig.loginSubmitButton).click();

    const errorElement = await page.getByText(/Invalid password/);
    await errorElement.waitFor();
    await expect(errorElement).toBeVisible();
  });

  test("login success", async () => {
    await page.goto(BROWSER_URL);
    await page.getByTestId(authE2eConfig.loginInputEmail).fill(loginUserEmail);
    await page.getByTestId(authE2eConfig.loginInputPassword).fill("password");
    await page.getByTestId(authE2eConfig.loginSubmitButton).click();

    const emailElement = await page.getByTestId(authE2eConfig.userEmailLabel);
    const html = await emailElement.innerHTML();
    expect(html).toEqual(loginUserEmail);

    await emailElement.click();
    const logoutButton = await page.getByText(/Выйти/);
    await logoutButton.click();
  });

  test("login not active user", async () => {
    await page.goto(BROWSER_URL);

    await page.getByTestId(authE2eConfig.loginInputEmail).fill(notEnabledUserEmail);
    await page.getByTestId(authE2eConfig.loginInputPassword).fill("password");
    await page.getByTestId(authE2eConfig.loginSubmitButton).click();

    const activateFormDescription = await page.getByText(/Enter code to activate account/);
    await expect(activateFormDescription).toBeVisible();

    const {
      data: { code },
    } = await axios.get(`${SERVER_URL}/api/e2e/activate-code/${notEnabledUserEmail}`);

    await page.getByTestId(authE2eConfig.activateInputCode).fill(code);
    await page.getByTestId(authE2eConfig.activateAccountButton).click();

    const emailElement = await page.getByTestId(authE2eConfig.userEmailLabel);
    const html = await emailElement.innerHTML();
    expect(html).toEqual(notEnabledUserEmail);
  });

  test("logout success", async () => {
    const emailElement = await page.getByTestId(authE2eConfig.userEmailLabel);
    await emailElement.click();
    const logoutButton = await page.getByText(/Выйти/);
    await logoutButton.click();

    const loginFormTitle = await page.getByText(/Enter your email below to login to your account/);
    await expect(loginFormTitle).toBeVisible();
  });
});
