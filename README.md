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

## Apps Script Limitations

Since the backend runs on Google Apps Script (free tier), there are quotas and constraints to be aware of.

### Key Quotas

| Limit | Free / Consumer account | Google Workspace account |
|---|---|---|
| Script runtime per day | 6 hours | 6 hours |
| Simultaneous executions | 30 | 30 |
| URL Fetch calls per day | 20,000 | 100,000 |
| Spreadsheet writes per minute | ~30 (soft limit) | ~30 (soft limit) |

### Most Likely Bottleneck: Concurrent Executions

Every call to the web app holds an execution slot for the duration of the request. With a cap of **30 simultaneous executions**, a sudden burst of users (e.g. right after the link is shared) could cause requests to queue or return errors.

### Read Performance

`handleClaim` and `handleDelete` perform a full sheet scan (`getDataRange().getValues()`) on every call. This is fine at small scale but adds latency as the sheet grows, and ties up an execution slot for longer.

### No Idempotency Guard

`handleCreate` uses `appendRow` with no duplicate check — if a user's request is retried (e.g. network hiccup), a duplicate post can be created.

---

## Considerations for Scaling

1. **Debounce / in-flight guard** — prevent users from firing multiple requests simultaneously (e.g. double-clicking a button). Audit all action buttons to ensure only one request is in flight at a time.

2. **Client-side read cache** — `fetchPosts()` is called on every page mount. A short TTL cache (e.g. 30 seconds in memory) would meaningfully reduce read calls during normal use.

3. **Idempotency on create** — consider hashing the post content + poster name + timestamp and checking for an existing row before appending, to prevent accidental duplicates.

4. **Migrate to the Sheets REST API** — if the app ever needs to scale beyond a small group, replacing Apps Script with the [Google Sheets REST API](https://developers.google.com/sheets/api/limits) and a service account provides much higher quotas, proper `429` rate-limit responses, and better observability.

5. **No authentication** — anyone with the URL can create, claim, or delete any post. This is by design for simplicity, but worth noting as a trust boundary.
