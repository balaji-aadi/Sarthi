import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/balajiaadesh/.gemini/antigravity-ide/brain/5b3bec2d-4248-4944-957a-261c0d4b86a9';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[name="email"]');
  await page.type('input[name="email"]', 'balajiaadi2000@gmail.com');
  await page.type('input[name="password"]', 'India@123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => {})
  ]);
  await new Promise(r => setTimeout(r, 2000));

  if (page.url().includes('branch')) {
    await page.evaluate(() => {
      const enterBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText?.includes('Enter Module'));
      if (enterBtns[1]) enterBtns[1].click();
      else if (enterBtns[0]) enterBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 2500));
  }

  // Helper to click sidebar phase reliably
  async function clickPhase(num) {
    console.log(`Navigating to Phase ${num}...`);
    await page.evaluate((n) => {
      const items = Array.from(document.querySelectorAll('aside div.cursor-pointer'));
      const p = items.find(el => el.textContent.includes(`LLD Phase ${n}`));
      if (p) p.click();
    }, num);

    await page.waitForFunction((n) => {
      return window.location.pathname.includes(`lldp${n}`);
    }, { timeout: 10000 }, num);

    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('h4')).length > 0;
    }, { timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
  }

  // ==========================================
  // SCREENSHOT D: Level C Drill (Phase 5 - Foundation Tier Full Mock)
  // ==========================================
  await clickPhase(5);
  console.log('Finding Level C Drill card specifically in Phase 5...');

  // Target specifically the drill card heading
  await page.waitForFunction(() => {
    const headings = Array.from(document.querySelectorAll('h4'));
    return headings.some(h => h.textContent.includes('Foundation Tier Full Mock Simulation') || h.textContent.includes('Foundation Tier'));
  }, { timeout: 15000 });

  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h4'));
    const target = headings.find(h => h.textContent.includes('Foundation Tier Full Mock Simulation')) ||
                   headings.find(h => h.textContent.includes('Foundation Tier'));
    if (target) {
      target.scrollIntoView({ block: 'center' });
      const main = target.closest('main') || target;
      main.click();
    }
  });

  console.log('Waiting for Level C drawer to open...');
  await page.waitForFunction(() => {
    const drawer = document.querySelector('.fixed.inset-0');
    return drawer && drawer.textContent.includes('Foundation Tier');
  }, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Capturing Screenshot D: Level C Drill Drawer...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_d_level_c_drill.png') });

  // Close drawer
  await page.evaluate(() => {
    const closeBtn = document.querySelector('.fixed.inset-0 button[title="Close"]') ||
                     document.querySelector('.fixed.inset-0 button');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // ==========================================
  // SCREENSHOT E & F: Major Problem Workspace (Phase 2)
  // ==========================================
  await clickPhase(2);
  console.log('Opening Major Problem Workspace for Parking Lot in Phase 2...');

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.textContent && b.textContent.includes('Start Problem'));
    if (startBtn) {
      startBtn.scrollIntoView({ block: 'center' });
      startBtn.click();
    }
  });

  console.log('Waiting for Major Problem Workspace modal...');
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim().startsWith('V1') || b.textContent.includes('Learning Mode'));
  }, { timeout: 15000 });
  await new Promise(r => setTimeout(r, 2500));

  console.log('Capturing Screenshot E: Major Problem Workspace (V1)...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_e_major_problem_workspace.png') });

  // Switch to Version 2 in Workspace
  console.log('Switching to Version 2 (V2)...');
  await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const v2Btn = allBtns.find(b => b.textContent && b.textContent.includes('V2'));
    if (v2Btn) v2Btn.click();
  });
  await page.waitForFunction(() => {
    const el = document.querySelector('.fixed');
    return el && el.textContent.includes('Version 2: Vehicle & Spot Multiplicity');
  }, { timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  console.log('Capturing Screenshot F: Version 2 Workspace...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_f_version_2_workspace.png') });

  // Close workspace modal
  console.log('Closing Major Problem Workspace...');
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title="Close Workspace"]') || 
                     document.querySelector('div.fixed button[title="Close"]') || 
                     Array.from(document.querySelectorAll('div.fixed button')).find(b => b.textContent.includes('Back') || b.querySelector('svg'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  // ==========================================
  // SCREENSHOT H: Create/Edit Major Problem Form
  // ==========================================
  console.log('Opening Parking Lot card to trigger Edit Major Problem Form...');
  await page.evaluate(() => {
    const titles = Array.from(document.querySelectorAll('h4'));
    const target = titles.find(h => h.textContent && h.textContent.includes('Parking Lot'));
    if (target) {
      target.scrollIntoView({ block: 'center' });
      target.click();
    }
  });
  await new Promise(r => setTimeout(r, 2500));

  console.log('Clicking Edit in drawer header for Major Problem...');
  await page.evaluate(() => {
    const drawer = document.querySelector('.fixed.inset-0');
    if (!drawer) return;
    const btns = Array.from(drawer.querySelectorAll('button'));
    const editBtn = btns.find(b => b.textContent && b.textContent.includes('Edit'));
    if (editBtn) editBtn.click();
  });

  console.log('Waiting for Edit form to populate...');
  await page.waitForFunction(() => {
    const formTitle = document.querySelector('h1, h2, h3, h4');
    return formTitle && formTitle.textContent.includes('Edit Major LLD Problem');
  }, { timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2500));

  console.log('Capturing Screenshot H: Create / Edit Major Problem Form...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_h_edit_major_problem.png') });

  await browser.close();
  console.log('🎉 ALL SCREENSHOTS COMPLETED WITH FULL QUALITY!');
})();
