import {
  type Browser,
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";
import i18n from "@/core/i18n";
import { authE2eConfig } from "@/modules/auth/tests/auth.e2e.config";
import { projectsTestConfig } from "@/modules/serm/tests/serm.e2e.config";

const BROWSER_URL = (process.env.BROWSER_URL as string) || "http://localhost:5173";

test.describe("users test", () => {
  let page: Page;
  let browser: Browser;

  test.beforeAll(async () => {
    browser = await chromium.launch();
    const context: BrowserContext = await browser.newContext();
    page = await context.newPage();

    await page.goto(BROWSER_URL);
    await page.getByTestId(authE2eConfig.loginInputEmail).fill("admin@mail.com");
    await page.getByTestId(authE2eConfig.loginInputPassword).fill("password");
    await page.getByTestId(authE2eConfig.loginSubmitButton).click();

    await page.getByRole("button", { name: i18n.t("navMenu.projects") }).click();
    await page.getByRole("link", { name: i18n.t("navMenu.projectsAll") }).click();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test("show projects", async () => {
    const projectTableItems = await page.getByTestId(projectsTestConfig.projectTableItem);
    const projectsCount = await projectTableItems.count();
    expect(projectsCount).toBeGreaterThan(0);
  });

  test("remove project", async () => {
    const tableItems = await page.getByTestId(projectsTestConfig.projectTableItem);
    const firstTableItem = await page.getByTestId(projectsTestConfig.projectTableItem).first();
    const text = await firstTableItem.locator("td").nth(2).textContent();

    const count = await tableItems.count();
    await page.getByTestId(projectsTestConfig.projectTableItemDelete).first().click();
    await page.getByRole("row", { name: text as string }).waitFor({ state: "detached" });

    const countAfterDelete = await tableItems.count();
    expect(countAfterDelete).toEqual(count - 1);
  });
});
