import { test, chromium } from "@playwright/test";
import { log } from "console";
import { ftruncate } from "fs";

const userDataDir = "whatsapp-session-new"; // Directory to save session

function myTest() {
  test("Login to WhatsApp and Save Session", async () => {
    const GroupName = process.env.GROUPNAME;
    const PhnNumber = process.env.PHONENUMBER;
    const integrationType = process.env.TYPE;
    // const integrationType = "ADD";
    // // const integrationType = "REMOVE";
    // const GroupName = "Testing A";
    // const PhnNumber = "7639002971,8940766936,9600392639";
    const phoneNumberArray = PhnNumber.split(",");

    log("GroupName", GroupName);
    log("PhnNumber", phoneNumberArray);
    log("integrationType", integrationType);

    const browser = await chromium.launchPersistentContext(userDataDir, {
      headless: true, // Open browser visibly
    });

    const page = await browser.newPage();
    await page.goto("https://web.whatsapp.com/");

    console.log(" Scan the QR code to log in...");
    // Wait until the WhatsApp chat list loads
    try {
      await page.waitForSelector("div[aria-label='Chat list']", {
        timeout: 120000,
      });
      console.log("✅ Login successful! Session saved.");
      await page
        .getByRole("textbox", { name: "Search input textbox" })
        .fill(GroupName);
      await page.getByTitle(GroupName, { exact: true }).click();

      await page.getByRole("button", { name: GroupName }).click();

      if (integrationType === "ADD") {
        await page
          .getByRole("button", { name: "Add member", exact: true })
          .click();

        await page
          .getByRole("textbox", { name: "Search name or number" })
          .getByRole("paragraph")
          .click();
        for (let number of phoneNumberArray) {
          await page
            .getByRole("textbox", { name: "Search name or number" })
            .fill(number);
          await page.waitForTimeout(2000);

          log("number", number);
          const alreadyInTheGroup = await page.locator(
            "text=Already added to group"
          );

          const noContactAdd = await page.locator(
            "text=No chats, contacts or messages found"
          );
          await page.waitForTimeout(2000);

          if (
            (await alreadyInTheGroup.isHidden()) &&
            (await noContactAdd.isHidden())
          ) {
            await page.waitForTimeout(2000);
            await page.keyboard.press("Enter");
          }
        }
        await page.getByRole("button", { name: "Confirm" }).click();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Add member" })
          .click();
        await page.waitForTimeout(2000);

        const invitePeople = await page.getByRole("button", {
          name: "Invite to group",
          exact: true,
        });
        if (await invitePeople.isVisible()) {
          await page
            .getByRole("button", { name: "Invite to group", exact: true })
            .click();
          await page.getByRole("button", { name: "Next" }).click();
        }
        log("Added successfully");
        //
        //
      } else if (integrationType === "REMOVE") {
        await page.locator('[role="button"]:has-text("member")').nth(1).click();
        for (let number of phoneNumberArray) {
          await page.getByRole("textbox", { name: "Search contacts" }).fill("");
          await page
            .getByRole("textbox", { name: "Search contacts" })
            .fill(number);
          await page.waitForTimeout(2000);

          const noContact = await page.locator("text=No contacts found");

          if (await noContact.isHidden()) {
            await page
              .getByRole("textbox", { name: "Search contacts" })
              .press("ArrowDown");

            await page.keyboard.press("Enter");
            await page.getByRole("button", { name: "Remove" }).click();
          }
        }
        log("Removed successfully");
      }
    } catch (error) {
      console.log("⚠️ Login check failed. Please verify manually.");
    }
    await page.pause();
    await browser.close();
  });
}

myTest();
