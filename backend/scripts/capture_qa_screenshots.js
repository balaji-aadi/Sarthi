import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/Users/balajiaadesh/.gemini/antigravity-ide/brain/5b3bec2d-4248-4944-957a-261c0d4b86a9';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  console.log('1. Navigating to http://localhost:3000 ...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Current URL:', page.url());

  // Check if on login page
  if (page.url().includes('login')) {
    console.log('Filling credentials on login page...');
    await page.waitForSelector('input[name="email"]', { timeout: 10000 });
    await page.type('input[name="email"]', 'balajiaadi2000@gmail.com');
    await page.type('input[name="password"]', 'India@123');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
    ]);
    await new Promise(r => setTimeout(r, 2500));
    console.log('URL after login:', page.url());
  }

  // If on /branch, enter LLD module
  if (page.url().includes('branch')) {
    console.log('On /branch, entering LLD module...');
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('button')).some(b => b.innerText && b.innerText.includes('Enter Module'));
    }, { timeout: 15000 });

    await page.evaluate(() => {
      const allBtns = Array.from(document.querySelectorAll('button'));
      const enterBtns = allBtns.filter(b => b.innerText && b.innerText.includes('Enter Module'));
      if (enterBtns.length >= 2) {
        enterBtns[1].click();
      } else if (enterBtns.length === 1) {
        enterBtns[0].click();
      }
    });
    await new Promise(r => setTimeout(r, 2500));
  }

  // Wait for sidebar projects to load
  console.log('Waiting for sidebar LLD Phase links to appear...');
  await page.waitForFunction(() => {
    const aside = document.querySelector('aside');
    return aside && aside.textContent.includes('LLD Phase 1') && aside.textContent.includes('LLD Phase 5');
  }, { timeout: 20000 });

  // Helper to switch phase via sidebar
  async function navigateToPhase(phaseNum) {
    console.log(`Navigating to Phase ${phaseNum}...`);
    await page.evaluate((num) => {
      const aside = document.querySelector('aside');
      const divs = Array.from(aside.querySelectorAll('div'));
      const phaseLink = divs.find(d => d.textContent && d.textContent.includes(`LLD Phase ${num}`) && d.onclick);
      if (phaseLink) {
        phaseLink.click();
      } else {
        const any = divs.find(d => d.textContent && d.textContent.includes(`LLD Phase ${num}`));
        if (any) any.click();
      }
    }, phaseNum);

    await page.waitForFunction((num) => {
      return window.location.pathname.includes(`lldp${num}`);
    }, { timeout: 10000 }, phaseNum);

    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('h4')).length > 0;
    }, { timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));
  }

  // Helper to click card by heading text
  async function clickCard(textSnippet) {
    await page.waitForFunction((text) => {
      const h4s = Array.from(document.querySelectorAll('h4'));
      return h4s.some(h => h.textContent && h.textContent.includes(text));
    }, { timeout: 15000 }, textSnippet);

    const handle = await page.evaluateHandle((text) => {
      const h4s = Array.from(document.querySelectorAll('h4'));
      const target = h4s.find(h => h.textContent && h.textContent.includes(text));
      if (target) target.scrollIntoView({ block: 'center', inline: 'center' });
      return target ? target.closest('main') : null;
    }, textSnippet);

    if (handle && handle.asElement()) {
      await handle.click();
    } else {
      await page.evaluate((text) => {
        const h4s = Array.from(document.querySelectorAll('h4'));
        const target = h4s.find(h => h.textContent && h.textContent.includes(text));
        if (target) {
          const main = target.closest('main') || target;
          main.click();
        }
      }, textSnippet);
    }
    await new Promise(r => setTimeout(r, 2500));
  }

  // Helper to close drawer
  async function closeDrawer() {
    await page.evaluate(() => {
      const drawer = document.querySelector('.fixed.inset-0');
      if (drawer) {
        const closeBtn = drawer.querySelector('button[title="Close"]') || drawer.querySelector('button');
        if (closeBtn) closeBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 1200));
  }

  // ==========================================
  // SCREENSHOT A: LLD Board (Phase 1)
  // ==========================================
  await navigateToPhase(1);
  console.log('Capturing Screenshot A: LLD Board...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_a_lld_board.png') });

  // ==========================================
  // SCREENSHOT B: Level A Drill Drawer (Stack vs Heap)
  // ==========================================
  console.log('Opening Level A Drill Drawer (Stack vs Heap)...');
  await clickCard('Stack vs Heap');
  console.log('Capturing Screenshot B: Level A Drill Drawer...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_b_level_a_drawer.png') });
  await closeDrawer();

  // ==========================================
  // SCREENSHOT C: Level B Drill Drawer (Shopping Cart Invariants)
  // ==========================================
  console.log('Opening Level B Drill Drawer (Shopping Cart Invariants)...');
  await clickCard('Shopping Cart');
  console.log('Capturing Screenshot C: Level B Drill Drawer...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_c_level_b_drawer.png') });

  // ==========================================
  // SCREENSHOT G: Create / Edit Drill Form
  // ==========================================
  console.log('Opening Edit Drill Form from drawer header...');
  await page.evaluate(() => {
    const drawer = document.querySelector('.fixed.inset-0');
    if (!drawer) return;
    const btns = Array.from(drawer.querySelectorAll('button'));
    const editBtn = btns.find(b => b.textContent && b.textContent.includes('Edit'));
    if (editBtn) editBtn.click();
  });
  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturing Screenshot G: Create / Edit Drill Form...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_g_edit_drill.png') });

  // Close Edit modal using the Close button in header
  console.log('Closing Edit Drill Modal...');
  await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const closeBtn = allBtns.find(b => b.textContent && b.textContent.trim() === 'Close');
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  await closeDrawer();

  // ==========================================
  // SCREENSHOT D: Level C Drill Drawer (Phase 5 - Foundation Tier Full Mock)
  // ==========================================
  await navigateToPhase(5);
  console.log('Opening Level C Drill Drawer (Foundation Tier Full Mock)...');
  await page.waitForFunction(() => {
    const mains = Array.from(document.querySelectorAll('main'));
    return mains.some(m => {
      const text = m.textContent || '';
      return (text.includes('Foundation Tier') || text.includes('Full Mock')) && (text.includes('Level C') || text.includes('PRACTICAL DRILL') || text.includes('Concept Drill') || text.includes('Simulation'));
    });
  }, { timeout: 15000 });

  await page.evaluate(() => {
    const mains = Array.from(document.querySelectorAll('main'));
    const cCard = mains.find(m => {
      const text = m.textContent || '';
      return (text.includes('Foundation Tier') || text.includes('Full Mock')) && (text.includes('Level C') || text.includes('PRACTICAL DRILL') || text.includes('Concept Drill') || text.includes('Simulation'));
    });
    if (cCard) {
      cCard.scrollIntoView({ block: 'center' });
      cCard.click();
    }
  });
  await new Promise(r => setTimeout(r, 2500));
  console.log('Capturing Screenshot D: Level C Drill Drawer...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_d_level_c_drill.png') });
  await closeDrawer();

  // ==========================================
  // SCREENSHOT E & F: Major Problem Workspace (Phase 2 - Parking Lot)
  // ==========================================
  await navigateToPhase(2);

  console.log('Opening Major Problem Workspace for Parking Lot...');
  await page.waitForFunction(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b => b.textContent && b.textContent.includes('Start Problem'));
  }, { timeout: 15000 });

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find(b => b.textContent && b.textContent.includes('Start Problem'));
    if (startBtn) {
      startBtn.scrollIntoView({ block: 'center' });
      startBtn.click();
    }
  });
  await new Promise(r => setTimeout(r, 3000));
  console.log('Capturing Screenshot E: Major Problem Workspace...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_e_major_problem_workspace.png') });

  // Switch to Version 2 in Workspace
  console.log('Switching to Version 2 (V2)...');
  await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const v2Btn = allBtns.find(b => b.textContent && b.textContent.includes('V2'));
    if (v2Btn) v2Btn.click();
  });
  await new Promise(r => setTimeout(r, 2500));
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
  await new Promise(r => setTimeout(r, 3000));
  console.log('Capturing Screenshot H: Create / Edit Major Problem Form...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'screenshot_h_edit_major_problem.png') });

  await browser.close();
  console.log('🎉 ALL 8 SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

captureScreenshots().catch(err => {
  console.error('Error during screenshot capture:', err);
  process.exit(1);
});
