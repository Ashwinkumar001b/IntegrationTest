import { test, chromium } from "@playwright/test";
import { log } from "console";
import { ftruncate } from "fs";

const userDataDir = "whatsapp-session-new"; // Directory to save session

function myTest() {
  test("Login to WhatsApp and Save Session", { timeout: 210000 }, async () => {
    const GroupName = process.env.GROUPNAME;
    const PhnNumber = process.env.PHONENUMBER;
    const integrationType = process.env.TYPE;
    // const integrationType = "ADD";
    // // const integrationType = "REMOVE";
    // const GroupName = "Test A";
    // // const PhnNumber = "7639002971,8940766936,9600392639";
    // const PhnNumber = "8940766936";

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
        timeout: 210000,
      });
      console.log("✅ Login successful! Session saved.");
      await page
        .getByRole("textbox", { name: "Search input textbox" })
        .fill(GroupName);
        await page.waitForTimeout(2000);
        await page.keyboard.press("Enter");

      // await page.getByText(GroupName, { exact: true }).nth(1).click();
      await page.waitForTimeout(2000);

      await page.getByRole("button", { name: `${GroupName}` }).click();


      if (integrationType == "ADD") {
        await page
          .getByRole("button", { name: "Add member", exact: true })
          .click();
          await page.waitForTimeout(2000);

        await page
          .getByRole("textbox", { name: "Search name or number" })
          .getByRole("paragraph")
          .click();
        for (let number of phoneNumberArray) {
          await page
            .getByRole("textbox", { name: "Search name or number" })
            .fill(number);
          await page.waitForTimeout(1000);

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
            // await page.waitForTimeout(2000);
            await page.keyboard.press("Enter");
          }
        }
        await page.getByRole("button", { name: "Confirm" }).click();
        await page
          .getByRole("dialog")
          .getByRole("button", { name: "Add member" })
          .click();
        await page.waitForTimeout(4000);
        const invitePeople = await page.getByRole("button", {
          name: "Invite to group",
          exact: true,
        });
        if (await invitePeople.isVisible()) {
          console.log("Invite button is visible, clicking...");
          await invitePeople.click();
          
          // Wait for the "Next" button to appear and be visible
          const nextButton = await page.locator('[data-icon="send"]');
          // const nextButton = await page.locator('[aria-label="Next"]');
          await nextButton.waitFor({ state: 'visible', timeout: 6000 });
        
          if (await nextButton.isEnabled()) {
            console.log("Next button is visible and enabled, clicking...");
            await nextButton.click();
            // await page.waitForTimeout(2000); // Wait for the action to complete
            console.log("Invite sent successfully");
          } else {
            console.log("Next button is not enabled or visible, retrying...");
          }
        } else {
          console.log("Invite button is not visible, skipping...");
        }
        
        await page.waitForTimeout(1000);
  
        log("Added successfully");
        //
        //
      } else if (integrationType == "REMOVE") {
        await page.locator('[role="button"]:has-text("member")').nth(1).click();
        for (let number of phoneNumberArray) {
          await page.getByRole("textbox", { name: "Search contacts" }).fill("");
          await page
            .getByRole("textbox", { name: "Search contacts" })
            .fill(number);
          await page.waitForTimeout(1000);

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
    // await page.pause();
    await browser.close();
  });
}

myTest();
