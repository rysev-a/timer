import {
  type Browser,
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";
import i18n from "@/core/i18n";
import { usersTestConfig } from "@/modules/admin/auth/tests/adminAuth.e2e.config";
import { authE2eConfig } from "@/modules/auth/tests/auth.e2e.config";

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

    await page.getByRole("button", { name: i18n.t("navMenu.auth") }).click();
    await page.getByRole("link", { name: i18n.t("navMenu.users") }).click();
  });

  test.afterAll(async () => {
    await browser.close();
  });

  test("show users", async () => {
    const moderatorEmailElement = await page.getByText(/moderator@mail.com/);
    await expect(moderatorEmailElement).toBeVisible();
  });

  test("remove user", async () => {
    const userTableItems = await page.getByTestId(usersTestConfig.userTableItem);
    await page.getByRole("row", { name: "user-to-remove" }).isVisible();
    const usersCount = await userTableItems.count();

    await page.getByRole("row", { name: "user-to-remove" }).getByTestId("deleteUserButton").click();

    const deleteMessage = await page.getByText(/Success delete/);
    await expect(deleteMessage).toBeVisible();
    const userTableItemsAfterDelete = await page.getByTestId(usersTestConfig.userTableItem);
    const usersCountAfterDelete = await userTableItemsAfterDelete.count();

    expect(usersCountAfterDelete).toBe(usersCount - 1);
  });

  test("edit user", async () => {
    const userToEdit = page
      .getByTestId(usersTestConfig.editUserButton)
      .getByText(/moderator@mail.com/);
    await userToEdit.click();

    await page.getByTestId(usersTestConfig.editUserInputEmail).fill("newmoderator@mail.com");

    // await page.getByRole("button", { name: "moderator" }).getByRole("button").nth(1).click();
    await page.getByTestId("popover-trigger").click();

    const enabledModeratorOption = page
      .getByRole("option", { name: "Модератор" })
      .getByRole("checkbox");
    expect(await enabledModeratorOption.getAttribute("data-state")).toBe("checked");

    await page.getByRole("option", { name: "Очистить всё" }).click();
    await page.getByTestId(usersTestConfig.editUserSaveButton).click();

    const successMessage = await page.getByText(/Update user success!/);

    const newUserToEdit = page
      .getByTestId(usersTestConfig.editUserButton)
      .getByText(/newmoderator@mail.com/);
    await newUserToEdit.click();

    await page.getByRole("button", { name: "Роли пользователя" }).click();

    const specialistOption = page.getByRole("option", { name: "Специалист" }).getByRole("checkbox");

    const adminOption = await page
      .getByRole("option", { name: "Администратор" })
      .getByRole("checkbox");
    const moderatorOption = await page
      .getByRole("option", { name: "Модератор" })
      .getByRole("checkbox");

    expect(await specialistOption.getAttribute("data-state")).toBe("unchecked");
    expect(await adminOption.getAttribute("data-state")).toBe("unchecked");
    expect(await moderatorOption.getAttribute("data-state")).toBe("unchecked");

    await expect(successMessage).toBeVisible();
  });
});
