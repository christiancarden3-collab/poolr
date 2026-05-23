/**
 * Google Sheets API Integration for PickPoolr
 * Syncs picks to a master Google Sheet for backup/audit
 */

// Google Sheets API configuration
const SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_ID,
  matchPicksSheet: 'Match Picks',
  specialPicksSheet: 'Special Picks',
  apiKey: process.env.GOOGLE_SHEETS_API_KEY,
}

// Service account credentials (stored as JSON string in env)
function getServiceAccountCredentials() {
  const credsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!credsJson) {
    console.warn('GOOGLE_SERVICE_ACCOUNT_JSON not configured')
    return null
  }
  try {
    return JSON.parse(credsJson)
  } catch (e) {
    console.error('Failed to parse service account JSON:', e)
    return null
  }
}

// Get access token using service account
async function getAccessToken() {
  const creds = getServiceAccountCredentials()
  if (!creds) return null

  const { client_email, private_key } = creds

  // Create JWT for Google OAuth
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }

  // Sign JWT (using Web Crypto API for Edge compatibility)
  const header = { alg: 'RS256', typ: 'JWT' }
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const signatureInput = `${encodedHeader}.${encodedPayload}`
  
  // Import the private key
  const pemContents = private_key.replace(/-----BEGIN PRIVATE KEY-----/, '').replace(/-----END PRIVATE KEY-----/, '').replace(/\n/g, '')
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signatureInput)
  )
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
  
  const jwt = `${signatureInput}.${encodedSignature}`

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const tokenData = await tokenResponse.json()
  return tokenData.access_token
}

/**
 * Append a row to a specific sheet
 */
async function appendRow(sheetName, values) {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    console.error('Failed to get access token')
    return { success: false, error: 'No access token' }
  }

  const spreadsheetId = SHEETS_CONFIG.spreadsheetId
  if (!spreadsheetId) {
    console.error('GOOGLE_SHEETS_ID not configured')
    return { success: false, error: 'Spreadsheet ID not configured' }
  }

  const range = `'${sheetName}'!A:Z`
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [values],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Sheets API error:', error)
      return { success: false, error }
    }

    const result = await response.json()
    return { success: true, result }
  } catch (error) {
    console.error('Failed to append to sheet:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Sync a match pick to Google Sheets
 */
export async function syncMatchPick({
  poolId,
  poolName,
  poolMemberId,
  userId,
  userName,
  userEmail,
  teamName,
  matchId,
  matchInfo, // e.g., "Mexico vs South Africa"
  homeScore,
  awayScore,
  submittedAt,
}) {
  const values = [
    new Date().toISOString(), // Sync timestamp
    poolId,
    poolName || '',
    poolMemberId,
    userId,
    userName || '',
    userEmail || '',
    teamName || '',
    matchId,
    matchInfo || '',
    homeScore,
    awayScore,
    submittedAt || new Date().toISOString(),
  ]

  return appendRow(SHEETS_CONFIG.matchPicksSheet, values)
}

/**
 * Sync a special pick to Google Sheets
 */
export async function syncSpecialPick({
  poolId,
  poolName,
  poolMemberId,
  userId,
  userName,
  userEmail,
  teamName,
  pickType, // 'champion', 'runner_up', 'top_scorer', 'best_keeper'
  teamCode,
  teamPickName,
  playerName,
  submittedAt,
}) {
  const values = [
    new Date().toISOString(), // Sync timestamp
    poolId,
    poolName || '',
    poolMemberId,
    userId,
    userName || '',
    userEmail || '',
    teamName || '',
    pickType,
    teamCode || '',
    teamPickName || '',
    playerName || '',
    submittedAt || new Date().toISOString(),
  ]

  return appendRow(SHEETS_CONFIG.specialPicksSheet, values)
}

/**
 * Check if Sheets integration is configured
 */
export function isSheetsConfigured() {
  return !!(process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
}

export default {
  syncMatchPick,
  syncSpecialPick,
  isSheetsConfigured,
}
