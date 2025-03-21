import { test, chromium } from "@playwright/test";
import { log } from "console";
import { ftruncate } from "fs";


const userDataDir = "whatsapp-session-new"; // Directory to save session

function myTest(){

test("Login to WhatsApp and Save Session", async () => {
   const Name = process.env.NAME
   const PhnNumber = process.env.PHONENUMBER
  const phoneNumber = 7092310772;
  const contactName = "Ashwin";
  log("Name", Name);
  log("PhnNumber", PhnNumber);
  log("contactName", contactName);
  if (!phoneNumber || !contactName) {
    console.log("⚠️ Please provide both phone number and contact name.");
    return;
  }
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
      .fill("Test A");
    await page.getByTitle("Test A", { exact: true }).click();

    await page.getByRole("button", { name: "Test A" }).click();
    await page.getByRole("button", { name: "Add member", exact: true }).click();
    await page
      .getByRole("textbox", { name: "Search name or number" })
      .getByRole("paragraph")
      .click();
    await page
      .getByRole("textbox", { name: "Search name or number" })
      .fill(phoneNumber);
    await page.getByRole("button", { name: contactName }).click();
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