import { test, chromium } from "@playwright/test";
import { log } from "console";
import { ftruncate } from "fs";


const userDataDir = "whatsapp-session-new"; // Directory to save session

function myTest(){
test("Login to WhatsApp and Save Session", async () => {
   const GroupName = process.env.GROUPNAME
   const PhnNumber = process.env.PHONENUMBER
  // const GroupName = "Testing A";
  // const PhnNumber =["7639002971","7092310772","9940338789"];
  log("PhnNumber", PhnNumber);
  log("GroupName", GroupName);
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: true, // Open browser visibly
  });

  const page = await browser.newPage();
  await page.goto("https://web.whatsapp.com/");

  console.log(" Scan the QR code to log in...");
 // Wait until the WhatsApp chat list loads
  try {
    await page.waitForSelector("div[aria-label='Chat list']",{
      timeout: 120000,
    });
    console.log("✅ Login successful! Session saved.");
    await page
      .getByRole("textbox", { name: "Search input textbox" })
      .fill(GroupName);
    await page.getByTitle(GroupName, { exact: true }).click();

    await page.getByRole("button", { name: GroupName }).click();
    await page.getByRole("button", { name: "Add member", exact: true }).click();
    await page
      .getByRole("textbox", { name: "Search name or number" })
      .getByRole("paragraph")
      .click();
      for (let number of PhnNumber) {
    await page
      .getByRole("textbox", { name: "Search name or number" })
      .fill(number);
      await page.waitForTimeout(3000);
    await page.keyboard.press('Enter')

      }
    // await page.getByRole("button", { name: Name }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Add member" })
      .click();
  } catch (error) {
    console.log("⚠️ Login check failed. Please verify manually.");
  }
  await page.pause();

  await browser.close();
  
});
}

myTest()