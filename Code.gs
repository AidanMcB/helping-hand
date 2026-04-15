// ─────────────────────────────────────────────
//  Helping Hand — Google Apps Script backend
//  Deploy as: Execute as Me, Access: Anyone
// ─────────────────────────────────────────────

const SHEET_NAME = 'Posts'
const COLS = ['id', 'type', 'title', 'description', 'posterName', 'contact', 'claimerName', 'createdAt']

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
}

function corsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}

// ── GET: return all posts as JSON ──────────────
function doGet() {
  const sheet = getSheet()
  const rows = sheet.getDataRange().getValues()
  if (rows.length <= 1) return corsResponse([])

  const posts = rows.slice(1).map(row => {
    const obj = {}
    COLS.forEach((col, i) => { obj[col] = row[i] })
    return obj
  })
  return corsResponse(posts)
}

// ── POST: create / claim / delete ─────────────
function doPost(e) {
  const params = e.parameter
  const action = params.action

  if (action === 'create') return handleCreate(params)
  if (action === 'claim')  return handleClaim(params)
  if (action === 'delete') return handleDelete(params)

  return corsResponse({ error: 'Unknown action' })
}

function handleCreate(params) {
  const sheet = getSheet()
  const id = Utilities.getUuid()
  const now = new Date().toISOString()

  const row = [
    id,
    params.type        || '',
    params.title       || '',
    params.description || '',
    params.posterName  || '',
    params.contact     || '',
    '',                       // claimerName (empty on create)
    now,
  ]
  sheet.appendRow(row)

  const post = {}
  COLS.forEach((col, i) => { post[col] = row[i] })
  return corsResponse(post)
}

function handleClaim(params) {
  const sheet = getSheet()
  const id = params.id
  const claimerName = params.claimerName || ''

  const data = sheet.getDataRange().getValues()
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      // claimerName is column index 6 (1-based: 7)
      sheet.getRange(i + 1, 7).setValue(claimerName)
      const post = {}
      COLS.forEach((col, j) => { post[col] = data[i][j] })
      post.claimerName = claimerName
      return corsResponse(post)
    }
  }
  return corsResponse({ error: 'Post not found' })
}

function handleDelete(params) {
  const sheet = getSheet()
  const id = params.id

  const data = sheet.getDataRange().getValues()
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1)
      return corsResponse({ success: true, id })
    }
  }
  return corsResponse({ error: 'Post not found' })
}

// ── One-time setup: rename first tab to "Posts" and write header row ─────────
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  if (!ss) throw new Error('No active spreadsheet — open this script via Extensions → Apps Script from inside your Google Sheet.')
  console.log('Spreadsheet: ' + ss.getName())

  let sheet = ss.getSheetByName(SHEET_NAME)

  if (!sheet) {
    sheet = ss.getSheets()[0]
    console.log('Renaming "' + sheet.getName() + '" → "' + SHEET_NAME + '"')
    sheet.setName(SHEET_NAME)
  } else {
    console.log('Found existing tab: ' + SHEET_NAME)
  }

  // Always overwrite row 1 with the correct headers
  sheet.getRange(1, 1, 1, COLS.length).setValues([COLS])
  console.log('Header row written: ' + COLS.join(', '))
}
