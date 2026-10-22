# CineScope — Classroom & Project Review Demonstration Script

This document provides a step-by-step, repeatable script to demonstrate **CineScope** during an academic project review or live grading demonstration.

---

## Academic Conceptual Primer: Database Updates vs. CI/CD Code Deployments

Before presenting the three demonstrations, understand this key distinction:

| Criterion | Dynamic Database Operation (MongoDB) | CI/CD Code Deployment (Jenkins Pipeline) |
| :--- | :--- | :--- |
| **Trigger** | User/Admin interacts with the running web application via browser UI or REST API | Developer commits code or configuration changes to the GitHub repository |
| **Pipeline Invoked?** | **NO.** Jenkins does not run. | **YES.** Automated 8-stage Jenkins pipeline executes. |
| **Lifecycle** | Data is written directly to the persistent MongoDB volume (`cinescope-mongo-data`) | Code is pulled, tested, compiled into static assets, and packaged into new Docker images |
| **Examples** | Submitting a review, recalculating a movie's average rating, adding a movie via the Admin Dashboard | Modifying a UI banner, updating a React component, changing an API validation rule, adding an automated test |
| **Downtime** | Zero downtime; immediate live update via React state and REST API | Rolling container update with zero data loss |

---

## Demonstration Overview

```
+-----------------------------------------------------------------------------------------+
| DEMO A: Full Functional Platform & Data Persistence (No CI/CD Trigger)                 |
| - Browse, Search & Filter Movies                                                        |
| - Submit Review & Observe Instant Average Rating Recalculation                          |
| - Admin Movie Addition via Web Portal                                                   |
| - Container Restart to Prove MongoDB Persistence in Named Volume                        |
+-----------------------------------------------------------------------------------------+
| DEMO B: Successful CI/CD Pipeline Execution (Automated Delivery)                        |
| - Make Visible Code Change & Push to GitHub                                             |
| - Watch Jenkins Execute 8 Pipeline Stages & Smoke Tests                                 |
| - Verify New Build Live on http://localhost:3000 with Zero Data Loss                     |
+-----------------------------------------------------------------------------------------+
| DEMO C: Automated Safety Guardrails (Catching Broken Code Early)                        |
| - Introduce Controlled Failing Test on a Demo Branch                                    |
| - Show Jenkins Stage 3 (Backend Tests) Catching Bug & Aborting Deployment               |
| - Fix Test, Re-run Pipeline, and Verify Healthy Deployment                              |
+-----------------------------------------------------------------------------------------+
```

---

## DEMO A — Functional Application & Live Dynamic Updates

**Objective:** Prove that user reviews, ratings recalculation, and admin catalog management work seamlessly through the REST API and persist across container restarts without triggering a CI/CD build.

### Step 1: Start the Platform
In PowerShell:
```powershell
docker compose up -d --build
```
Verify all 3 containers are healthy:
```powershell
docker compose ps
```

### Step 2: Browse and Search the Catalog
1. Open your browser to [http://localhost:3000](http://localhost:3000).
2. Type `Nolan` or `Inception` into the search bar. Observe instant client-side filtering.
3. Select **Sci-Fi** in the genre dropdown, then sort by **Highest Rated**.
4. Click **Reset** to return to the full catalog.

### Step 3: Open Movie Details and Submit a Review
1. Click on **Interstellar**.
2. Notice the current average rating (e.g. `10.0 / 10` based on 1 initial review).
3. Scroll down to the **Write a CineScope Review** form:
   - **Reviewer Name:** `Professor Higgins`
   - **Rating:** Click the 8th star (`8/10`)
   - **Review Title:** `Stunning relativity physics and soundtrack`
   - **Detailed Review:** `The black hole Gargantua visualization was scientifically groundbreaking and the docking scene was sheer adrenaline.`
4. Click **Post Review & Recalculate Rating**.

### Step 4: Verify Live Recalculation
- **Observe:** The review appears immediately in the reviews list.
- **Observe:** The average rating updates dynamically to `9.0 / 10` and review count updates to `2 reviews`.
- **Explain to Evaluator:** *"This review was submitted via `POST /api/movies/:id/reviews`, stored in MongoDB, and the new average was computed by a Mongoose aggregation pipeline. Notice that Jenkins was NOT triggered because this is dynamic runtime data."*

### Step 5: Add a Movie via the Admin Dashboard
1. Click **Admin Login** in the navbar (or go to [http://localhost:3000/login](http://localhost:3000/login)).
2. Log in with the pre-filled credentials:
   - Email: `admin@cinescope.com`
   - Password: `Admin@12345`
3. Click **Add New Movie** in the admin dashboard:
   - **Title:** `Blade Runner 2049`
   - **Release Year:** `2017`
   - **Runtime:** `164`
   - **Genres:** `Sci-Fi, Mystery, Action`
   - **Director:** `Denis Villeneuve`
   - **Cast:** `Ryan Gosling, Harrison Ford, Ana de Armas`
   - **Poster Image URL:** `https://upload.wikimedia.org/wikipedia/en/9/9b/Blade_Runner_2049_poster.png`
   - **Synopsis:** `A young blade runner's discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.`
4. Click **Create Movie**.
5. Return to the home page ([http://localhost:3000](http://localhost:3000)). Observe `Blade Runner 2049` is live immediately!

### Step 6: Demonstrate Database Persistence
Restart the application containers to prove the database is persistent:
```powershell
docker compose restart
```
Refresh [http://localhost:3000](http://localhost:3000).  
**Outcome:** Both `Blade Runner 2049` and `Professor Higgins`'s review on *Interstellar* remain intact because MongoDB records reside inside the named volume `cinescope-mongo-data`.

---

## DEMO B — Successful CI/CD Pipeline (Automated Delivery)

**Objective:** Demonstrate that pushing new version-controlled application code to GitHub automatically triggers Jenkins to run tests, build Docker images, deploy the update, and run smoke tests.

### Step 1: Make a Visible Code Change
In your code editor, open `frontend/src/components/Navbar.jsx`.  
Locate the brand badge:
```jsx
// Change "PRO" to "CI/CD v2.0"
<span className="brand-badge">CI/CD v2.0</span>
```

### Step 2: Commit and Push the Change
In PowerShell:
```powershell
git add frontend/src/components/Navbar.jsx
git commit -m "feat(ui): update CineScope navbar badge to CI/CD v2.0"
git push origin main
```

### Step 3: Observe the Jenkins Pipeline
1. Open Jenkins at [http://localhost:8080](http://localhost:8080) and click on `CineScope-Pipeline`.
2. Notice the build starts automatically (via Webhook or within 5 minutes via SCM polling).
3. Walk through each stage in the pipeline view:
   - **Stage 1 (Checkout):** Clones the exact Git commit SHA.
   - **Stage 2 (Install Dependencies):** Runs reproducible `npm ci`.
   - **Stage 3 (Backend Tests):** Executes the 25 isolated API tests in memory.
   - **Stage 4 (Frontend Validation):** Tests UI components and executes `vite build`.
   - **Stage 5 (Docker Build):** Tags Docker images with `${BUILD_NUMBER}`.
   - **Stage 6 (Deploy):** Executes `docker compose up -d --no-deps --build backend frontend`.
   - **Stage 7 (Smoke Test):** Executes `scripts/smoke-test.js` validating HTTP 200 on `/api/health` and `/api/movies`.
   - **Stage 8 (Post-Build):** Prints SUCCESS status and cleans temporary test files.

### Step 4: Verify the Live Deployment
1. Refresh [http://localhost:3000](http://localhost:3000).
2. The navbar now proudly displays **`CI/CD v2.0`**.
3. Inspect `Blade Runner 2049` and the reviews: **All database records are still intact!**

---

## DEMO C — Safety Guardrails (Preventing Broken Code from Deploying)

**Objective:** Prove that the CI/CD pipeline acts as a quality gatekeeper. If broken code or failing tests are pushed, Jenkins halts the pipeline **BEFORE** deployment, protecting the production/demo environment.

### Step 1: Switch to a Demo Branch
In PowerShell:
```powershell
git checkout -b demo/failing-test
```

### Step 2: Introduce a Controlled Failing Test
Open `backend/tests/health.test.js` and change an assertion to intentionally fail:
```javascript
// Intentionally broken test for demonstration
it('GET /api/health should return 200 OK and UP status', async () => {
  const res = await request(app).get('/api/health');
  expect(res.body.status).toBe('DOWN'); // <-- This will fail because status is 'UP'
});
```

### Step 3: Commit and Push the Branch
```powershell
git add backend/tests/health.test.js
git commit -m "test(failure-demo): introduce deliberate failing test"
git push origin demo/failing-test
```

### Step 4: Observe Jenkins Catching the Failure
1. In Jenkins, trigger a build on the `demo/failing-test` branch (or select **Build with Parameters** / switch branch specifier).
2. **Observe:** The pipeline stops at **Stage 3 (Backend Tests)** with a red `FAILED` status.
3. Open the console log for Stage 3:
   ```
   AssertionError: expected 'UP' to be 'DOWN'
   ```
4. **Observe:** Stages 5 (Docker Build), 6 (Deploy), and 7 (Smoke Test) **NEVER RAN**.
5. Check [http://localhost:3000](http://localhost:3000): The platform remains online and completely unaffected.

### Step 5: Fix the Test and Recover
Revert the change in `backend/tests/health.test.js`:
```javascript
expect(res.body.status).toBe('UP');
```
Push the correction:
```powershell
git add backend/tests/health.test.js
git commit -m "fix(health): restore correct UP assertion"
git push origin demo/failing-test
```
Re-run the build in Jenkins &rarr; All stages turn green &rarr; Deployment succeeds!
```powershell
# Return to main branch
git checkout main
```

---

## Demonstration Checklist Summary

| Verification Step | Target | Status |
| :--- | :--- | :--- |
| Dynamic Review Submission | Rating recalculated in MongoDB without redeployment | Verified |
| Admin Movie Creation | New movie created via API without Jenkins build | Verified |
| Volume Persistence | Data survives `docker compose restart` | Verified |
| Code Push Automated Build | Jenkins pulls commit, runs tests, and builds images | Verified |
| Deployment Verification | Live website updates with zero data loss | Verified |
| Negative Testing Guardrail | Failing test halts pipeline before deployment | Verified |
