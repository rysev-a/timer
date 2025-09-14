import {
  type Browser,
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";
import { permissionsTestConfig } from "@/modules/admin/auth/tests/adminAuth.e2e.config";
import { authE2eConfig } from "@/modules/auth/tests/auth.e2e.config";

const BROWSER_URL = (process.env.BROWSER_URL as string) || "http://localhost:5173";

test.describe("permissions test", () => {
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
    await page.getByRole("link", { name: "Права доступа" }).click();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test("show permissions", async () => {
    // wait while permissions loaded
    const getUserPermission = page.getByRole("row", { name: "get users" });
    await getUserPermission.waitFor({ state: "visible" });

    // check permissions count
    expect(await page.getByTestId(permissionsTestConfig.permissionTableItem).count()).toBe(12);
  });

  test("create permission", async () => {
    await page.getByText(/Создать право доступа/).click();

    await page
      .getByTestId(permissionsTestConfig.newPermissionLabelInput)
      .fill("New permission label");

    await page
      .getByTestId(permissionsTestConfig.newPermissionNameInput)
      .fill("new-permission-name");
    await page.getByTestId(permissionsTestConfig.newPermissionAppInput).fill("new-permission-app");
    await page
      .getByTestId(permissionsTestConfig.newPermissionActionInput)
      .fill("new-permission-action");

    await page.getByTestId(permissionsTestConfig.newPermissionSubmitButton).click();
    await expect(page.getByText(/Success create permission!/)).toBeVisible();

    const newPermission = await page.getByText(/New permission label/);
    await newPermission.waitFor({ state: "visible" });
    expect(await page.getByTestId(permissionsTestConfig.permissionTableItem).count()).toBe(13);
  });

  test("can't create permission with same name and app", async () => {
    await page.getByText(/Создать право доступа/).click();

    await page.getByTestId(permissionsTestConfig.newPermissionLabelInput).fill("Create users");
    await page.getByTestId(permissionsTestConfig.newPermissionNameInput).fill("create_users");
    await page.getByTestId(permissionsTestConfig.newPermissionAppInput).fill("users");
    await page.getByTestId(permissionsTestConfig.newPermissionActionInput).fill("create");

    await page.getByTestId(permissionsTestConfig.newPermissionSubmitButton).click();
    await expect(page.getByText(/Can't create permission/)).toBeVisible();
  });

  test("update permission", async () => {
    const updatedPermissionName = "updated-permission-name";
    const updatedPermissionApp = "updated-permission-app";
    const updatedPermissionLabel = "Updated label";

    await page
      .getByRole("row", { name: "get users" })
      .getByTestId(permissionsTestConfig.editPermissionTableItem)
      .click();

    await page
      .getByTestId(permissionsTestConfig.editPermissionNameInput)
      .fill(updatedPermissionName);

    await page.getByTestId(permissionsTestConfig.editPermissionAppInput).fill(updatedPermissionApp);
    await page
      .getByTestId(permissionsTestConfig.editPermissionLabelInput)
      .fill(updatedPermissionLabel);

    await page.getByTestId(permissionsTestConfig.editPermissionSubmitButton).click();

    const updatedPermissionTableItem = page.getByRole("row", {
      name: updatedPermissionLabel,
    });

    await expect(updatedPermissionTableItem).toBeVisible();
  });
});
