import {
  type Browser,
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";
import { rolesTestConfig } from "@/modules/admin/auth/tests/adminAuth.e2e.config";
import { authE2eConfig } from "@/modules/auth/tests/auth.e2e.config";

const BROWSER_URL = (process.env.BROWSER_URL as string) || "http://localhost:5173";

test.describe("roles test", () => {
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

    await page.getByRole("button", { name: "Персонал" }).click();
    await page.getByRole("link", { name: "Роли" }).click();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test("show roles", async () => {
    // wait while roles loaded
    const customer = await page.getByText(/Customer/);
    await customer.waitFor({ state: "visible" });

    // check roles count
    expect(await page.getByTestId(rolesTestConfig.roleTableItem).count()).toBe(4);
  });

  test("create role", async () => {
    await page.getByText(/Создать роль/).click();

    await page.getByTestId(rolesTestConfig.newRoleNameInput).fill("power_user");
    await page.getByTestId(rolesTestConfig.newRoleLabelInput).fill("power user");

    await page.getByTestId(rolesTestConfig.newRoleSubmitButton).click();
    await expect(page.getByText(/Success create role!/)).toBeVisible();

    const customer = await page.getByText(/power user/);
    await customer.waitFor({ state: "visible" });
    expect(await page.getByTestId(rolesTestConfig.roleTableItem).count()).toBe(5);
  });

  test("can't create exist role", async () => {
    await page.getByText(/Создать роль/).click();

    await page.getByTestId(rolesTestConfig.newRoleNameInput).fill("admin");
    await page.getByTestId(rolesTestConfig.newRoleSubmitButton).click();
    await expect(page.getByText(/Can't create role/)).toBeVisible();
  });

  test("edit role", async () => {
    await page
      .getByRole("row", { name: "tester" })
      .getByTestId(rolesTestConfig.roleTableItemEdit)
      .click();

    await page.getByTestId(rolesTestConfig.editRoleNameInput).fill("super tester");
    await page.getByTestId(rolesTestConfig.editRoleLabelInput).fill("Super tester");

    await page.getByTestId(rolesTestConfig.rolePermissionsMultiselect).click();
    await page.getByRole("option", { name: "delete permissions" }).getByRole("checkbox").click();
    await page.getByRole("option", { name: "delete roles" }).getByRole("checkbox").click();
    await page.getByRole("option", { name: "delete users" }).getByRole("checkbox").click();
    await page.getByRole("option", { name: "create users" }).getByRole("checkbox").click();
    await page.getByRole("option", { name: "update roles" }).getByRole("checkbox").click();

    await page.getByTestId(rolesTestConfig.rolePermissionsMultiselect).click();
    await page.getByTestId(rolesTestConfig.editRoleSubmitButton).click();

    await page
      .getByRole("row", { name: "Super tester" })
      .getByTestId(rolesTestConfig.roleTableItemEdit)
      .click();

    await page.getByTestId(rolesTestConfig.rolePermissionsMultiselect).click();

    expect(
      await page
        .getByRole("option", { name: "create users" })
        .getByRole("checkbox")
        .getAttribute("data-state"),
    ).toBe("checked");

    expect(
      await page
        .getByRole("option", { name: "update roles" })
        .getByRole("checkbox")
        .getAttribute("data-state"),
    ).toBe("checked");
  });
});
