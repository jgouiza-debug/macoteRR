import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const ARTIFACT_DIR = "/Users/jadgouiza/.gemini/antigravity/brain/ee31fd5c-fa9a-4aa1-8976-c895a6e33626";
const TARGET_URL = "http://localhost:3000";

async function main() {
  console.log("Starting verification run...");
  const browser = await chromium.launch({ headless: true });

  // 1. STATE 1: In-App Browser (Instagram on iOS)
  console.log("Testing State 1: In-App Browser (Instagram)...");
  const ctx1 = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 300.0.0.0",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page1 = await ctx1.newPage();
  await page1.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page1.screenshot({
    path: path.join(ARTIFACT_DIR, "state-1-inapp-browser.png"),
    fullPage: true,
  });

  // Verify Clipboard copy action on State 1
  const copyBtn = page1.locator("button:has-text('Copier le lien')").first();
  if (await copyBtn.isVisible()) {
    await copyBtn.click();
    await page1.waitForTimeout(500);
    const copiedBtn = page1.locator("button:has-text('Lien copié')").first();
    console.log("State 1 Copy button transition verified:", await copiedBtn.isVisible());
    await page1.screenshot({
      path: path.join(ARTIFACT_DIR, "state-1-copied-feedback.png"),
      fullPage: true,
    });
  }
  await ctx1.close();

  // 2. STATE 2: iOS Safari
  console.log("Testing State 2: iOS Safari...");
  const ctx2 = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page2 = await ctx2.newPage();
  await page2.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page2.screenshot({
    path: path.join(ARTIFACT_DIR, "state-2-ios-safari.png"),
    fullPage: true,
  });
  await ctx2.close();

  // 3. STATE 3: iOS Non-Safari (Chrome on iOS)
  console.log("Testing State 3: iOS Non-Safari (CriOS)...");
  const ctx3 = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 CriOS/119.0.0.0 Mobile/15E148 Safari/604.1",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page3 = await ctx3.newPage();
  await page3.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page3.screenshot({
    path: path.join(ARTIFACT_DIR, "state-3-ios-chrome.png"),
    fullPage: true,
  });
  await ctx3.close();

  // 4. STATE 4: Android / Desktop Chromium with Install Event
  console.log("Testing State 4: Android / Chromium install prompt...");
  const ctx4 = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36",
    viewport: { width: 412, height: 915 },
    deviceScaleFactor: 2.6,
  });
  const page4 = await ctx4.newPage();
  await page4.goto(TARGET_URL, { waitUntil: "networkidle" });

  // Dispatch beforeinstallprompt event
  await page4.evaluate(() => {
    const event = new CustomEvent("beforeinstallprompt", { cancelable: true });
    const installEvent = event as Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string; platform: string }>;
    };
    installEvent.prompt = async () => {};
    installEvent.userChoice = Promise.resolve({ outcome: "accepted", platform: "web" });
    window.dispatchEvent(event);
  });
  await page4.waitForTimeout(300);

  await page4.screenshot({
    path: path.join(ARTIFACT_DIR, "state-4-android-installable.png"),
    fullPage: true,
  });
  await ctx4.close();

  // 5. STATE 5: Already Installed (Standalone Mode)
  console.log("Testing State 5: Already Installed (Standalone)...");
  const ctx5 = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page5 = await ctx5.newPage();
  await page5.addInitScript(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: query.includes("display-mode: standalone"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    });
    (navigator as Navigator & { standalone?: boolean }).standalone = true;
  });
  await page5.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page5.screenshot({
    path: path.join(ARTIFACT_DIR, "state-5-already-installed.png"),
    fullPage: true,
  });
  await ctx5.close();

  // 6. DESKTOP FALLBACK: Standard Desktop Viewport with QR code
  console.log("Testing Desktop Fallback with QR Code...");
  const ctx6 = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page6 = await ctx6.newPage();
  await page6.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page6.screenshot({
    path: path.join(ARTIFACT_DIR, "site-desktop-verified.png"),
    fullPage: true,
  });

  // Measure LCP with CDP CPU throttling & network emulation
  console.log("Measuring LCP under 3G + 4x CPU slowdown...");
  const client = await ctx6.newCDPSession(page6);
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150, // 150ms RTT for Fast 3G
    downloadThroughput: 1.6 * 1024 * 1024 / 8, // 1.6 Mbps
    uploadThroughput: 750 * 1024 / 8, // 750 Kbps
  });

  await page6.reload({ waitUntil: "networkidle" });

  const lcp = await page6.evaluate(() => {
    return new Promise<number>((resolve) => {
      let lcpValue = 0;
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          lcpValue = lastEntry.startTime;
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });
      setTimeout(() => {
        observer.disconnect();
        resolve(lcpValue || performance.now());
      }, 1000);
    });
  });

  console.log(`LCP Measured: ${lcp.toFixed(2)}ms`);
  fs.writeFileSync(
    path.join(ARTIFACT_DIR, "lcp-report.json"),
    JSON.stringify({ lcpMs: parseFloat(lcp.toFixed(2)), throttled: true }, null, 2)
  );

  await ctx6.close();
  await browser.close();
  console.log("Verification run complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
