# Helping Hand

A bare-bones "need a hand, lend a hand" app for sharing offers and requests among friends.

## Stack

- **Frontend**: Vue 3 + Vite + TailwindCSS → hosted on GitHub Pages (free)
- **API**: Google Apps Script web app (free)
- **Database**: Google Sheets (free)

## Local Development

```bash
cp .env.example .env.local
# Edit .env.local with your Apps Script URL (see setup below)

npm install
npm run dev
```

## Setup (one-time)

### 1. Google Sheet

1. Create a new Google Sheet
2. Rename the first tab to `Posts`
3. Leave it empty (the script will add the header row)

### 2. Google Apps Script

1. In your Sheet, go to **Extensions → Apps Script**
2. Delete the default `myFunction` code
3. Paste the contents of `Code.gs` from this repo
4. Run `setupSheet()` once to write the header row (Run → Run function → setupSheet)
5. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Copy the web app URL

### 3. GitHub Repository

1. Push this project to a GitHub repo named `helping-hand`
2. Go to **Settings → Secrets and variables → Actions**
3. Add a secret: `VITE_APPS_SCRIPT_URL` = your Apps Script URL from step 2
4. Go to **Settings → Pages**, set source to **GitHub Actions**
5. Push to `main` — the workflow builds and deploys automatically

Your app will be live at `https://<your-username>.github.io/helping-hand/`

## How It Works

- Anyone can post an **offer** (things to give/share) or a **request** (things needed)
- Posts show the poster's name (no account needed)
- Anyone can **claim** a post by leaving their name
- The poster (or anyone) can **remove** a post once it's done
# helping-hand
