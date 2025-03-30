import { test, chromium } from "@playwright/test";
import { log } from "console";
import { ftruncate } from "fs";
import { execSync } from "child_process"; // To execute git commands
const userDataDir = "whatsapp-session-new"; // Directory to save session


function myTest() {
  test("Login to WhatsApp and Save Session", { timeout: 210000 }, async () => {
    // const GroupName = process.env.GROUPNAME;
    // const PhnNumber = process.env.PHONENUMBER;
    // const integrationType = process.env.TYPE;
    const integrationType = "ADD";
    // const integrationType = "REMOVE";
    const GroupName = "Testing F";
    // const PhnNumber = "7639002971,8940766936,9600392639";
    const PhnNumber = "9940338789";

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
      await page.waitForTimeout(3000);

      const secondChatsLocator = page
        .locator('div[aria-label="Search results."]')
        .locator('div:has-text("Chats")')
        .nth(1);

      await page.waitForTimeout(1000);

      const isChatsHidden = await secondChatsLocator.isHidden();

      if (isChatsHidden) {
        await page
          .locator("span")
          .filter({ hasText: "new-chat-outlinemenu" })
          .getByLabel("Menu")
          .click();
        await page.getByRole("button", { name: "New group" }).click();
        for (let number of phoneNumberArray) {
          await page.getByPlaceholder(" ").click();
          await page.getByPlaceholder(" ").fill(number);
          await page.waitForTimeout(1000);
          await page.keyboard.press("Enter");
        }

        await page.getByRole("button", { name: "Next" }).click();
        await page
          .getByRole("textbox", { name: "Group subject (optional)" })
          .fill(GroupName);
        await page.getByRole("button", { name: "Create group" }).click();
      } else {
        await page.keyboard.press("Enter");
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
          await page.waitForTimeout(2000);
          const invitePeople = await page.getByRole("button", {
            name: "Invite to group",
            exact: true,
          });
          

          await page.waitForTimeout(1000);

          if (await invitePeople.isVisible()) {
            console.log("Invite button is visible, clicking...");
             

            // await invitePeople.click();
            await page
              .getByRole("button", {
                name: "Invite to group",
                exact: true,
              })
              .click();

            // Wait for the "Next" button to appear and be visible
            const nextButton = await page.locator('[data-icon="send"]');

            // const nextButton = await page.locator('[aria-label="Next"]');
            await nextButton.waitFor({ state: "visible", timeout: 6000 });
             

            if (await nextButton.isEnabled()) {
              console.log("Next button is visible and enabled, clicking...");
              // await nextButton.click();
              await page.locator('[data-icon="send"]').click();
             

              console.log("Invite sent successfully");
            } else {
              console.log("Next button is not enabled or visible, retrying...");
            }
          } else {
            console.log("Invite button is not visible, skipping...");
          }

          await page.waitForTimeout(1000);
          

          await commitAndPushAll();
          log("Added successfully");

          //
          //
        } else if (integrationType == "REMOVE") {
          await page
            .locator('[role="button"]:has-text("member")')
            .nth(1)
            .click();
          for (let number of phoneNumberArray) {
            await page
              .getByRole("textbox", { name: "Search contacts" })
              .fill("");
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
      }
    } catch (error) {
      console.log("⚠️ Login check failed. Please verify manually.");
    }
    // await page.pause();
    await browser.close();
 
    execSync('git config --global user.email "ashwinkumarbaskar9840@gmail.com"');
            execSync('git config --global user.name "Ashwinkumar001b"');
    try {
      const specificFolder = './whatsapp-session-new';// Replace this with the path to the folder you want to commit
      
      console.log(`Pushing changes from folder ${specificFolder} to GitHub...`);
      
      execSync(`git add ${specificFolder}`); // Stage the specific folder
      execSync('git commit -m "Auto commit for specific folder"'); // Commit changes with a message
      execSync('git push origin main'); // Push to the main branch (change 'main' if you're using another branch)
      
      console.log("✅ Folder pushed to GitHub successfully!");
    } catch (gitError) {
      console.error("⚠️ Failed to push folder to GitHub:", gitError.message);
    }
   
    

  });
}

myTest();
