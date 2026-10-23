const appUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const maxAttempts = 10;
const retryDelayMs = 3000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkApp() {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(appUrl);
      const html = await response.text();

      if (response.ok && html.includes('<div id="root">')) {
        console.log(`[PASS] CineScope is serving at ${appUrl} (HTTP ${response.status}).`);
        return;
      }

      console.warn(`[Attempt ${attempt}/${maxAttempts}] Unexpected HTTP ${response.status} or app HTML.`);
    } catch (error) {
      console.warn(`[Attempt ${attempt}/${maxAttempts}] ${error.message}`);
    }

    if (attempt < maxAttempts) {
      await sleep(retryDelayMs);
    }
  }

  throw new Error(`CineScope did not become available at ${appUrl}.`);
}

checkApp().catch((error) => {
  console.error(`[FAIL] ${error.message}`);
  process.exitCode = 1;
});
