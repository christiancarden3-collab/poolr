# Google Sheets Integration Setup

This guide explains how to set up the Google Sheets backup for PickPoolr picks.

## Overview

When users save their picks (match predictions or special picks), the data is:
1. Saved to Supabase (primary database) ✅
2. Synced to Google Sheets (backup/audit) ✅

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable the **Google Sheets API**:
   - Go to APIs & Services → Library
   - Search "Google Sheets API"
   - Click Enable

### 2. Create Service Account

1. Go to APIs & Services → Credentials
2. Click "Create Credentials" → "Service Account"
3. Name it something like `pickpoolr-sheets`
4. Skip the optional steps, click Done
5. Click on the service account you created
6. Go to "Keys" tab → Add Key → Create new key → JSON
7. Download the JSON file (keep it safe!)

### 3. Create the Master Google Sheet

1. Create a new Google Sheet
2. Name it "PickPoolr Master Data" (or whatever you prefer)
3. Create two sheets (tabs):
   - `Match Picks` - for match predictions
   - `Special Picks` - for champion/scorer/keeper picks

4. Add headers to **Match Picks** sheet (Row 1):
   ```
   Sync Time | Pool ID | Pool Name | Member ID | User ID | User Name | Email | Team Name | Match ID | Match | Home Score | Away Score | Submitted At
   ```

5. Add headers to **Special Picks** sheet (Row 1):
   ```
   Sync Time | Pool ID | Pool Name | Member ID | User ID | User Name | Email | Team Name | Pick Type | Team Code | Team Pick | Player Name | Submitted At
   ```

6. **Share the sheet with your service account:**
   - Click Share
   - Add the service account email (from the JSON file, looks like `xxx@xxx.iam.gserviceaccount.com`)
   - Give it **Editor** access

7. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[THIS_IS_THE_ID]/edit
   ```

### 4. Configure Environment Variables

Add these to your `.env.local` and Vercel environment variables:

```bash
# Google Sheets Integration
GOOGLE_SHEETS_ID=your_spreadsheet_id_here
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...full JSON contents..."}
```

**Important:** The `GOOGLE_SERVICE_ACCOUNT_JSON` value should be the entire JSON file contents on a single line. You can minify it or just ensure there are no line breaks.

### 5. Deploy

1. Update your local `.env.local` with the values
2. Add the same env vars to Vercel:
   - Go to your Vercel project → Settings → Environment Variables
   - Add `GOOGLE_SHEETS_ID`
   - Add `GOOGLE_SERVICE_ACCOUNT_JSON`
3. Redeploy

## Testing

1. Go to your PickPoolr pool
2. Make a match pick and save it
3. Check your Google Sheet - a new row should appear in "Match Picks"
4. Make a special pick (champion, etc.)
5. Check "Special Picks" sheet

## Troubleshooting

**"Sheets sync failed" in console:**
- Check that GOOGLE_SHEETS_ID is correct
- Check that GOOGLE_SERVICE_ACCOUNT_JSON is valid JSON
- Make sure the sheet is shared with the service account email

**No data appearing:**
- Check the API route: `GET /api/sync-sheets` should return `{"configured": true}`
- Check Vercel logs for errors

**Permission denied:**
- Make sure you shared the spreadsheet with the service account email
- Make sure it has Editor (not Viewer) access

## Sheet Structure

### Match Picks
| Column | Description |
|--------|-------------|
| Sync Time | When the sync happened |
| Pool ID | UUID of the pool |
| Pool Name | Name of the pool |
| Member ID | Pool member UUID |
| User ID | User's Supabase ID |
| User Name | User's display name |
| Email | User's email |
| Team Name | User's fantasy team name |
| Match ID | Match identifier |
| Match | e.g., "Mexico vs South Africa" |
| Home Score | Predicted home score |
| Away Score | Predicted away score |
| Submitted At | When the pick was made |

### Special Picks
| Column | Description |
|--------|-------------|
| Sync Time | When the sync happened |
| Pool ID | UUID of the pool |
| Pool Name | Name of the pool |
| Member ID | Pool member UUID |
| User ID | User's Supabase ID |
| User Name | User's display name |
| Email | User's email |
| Team Name | User's fantasy team name |
| Pick Type | champion/runner_up/top_scorer/best_keeper |
| Team Code | Country code (for team picks) |
| Team Pick | Team name (for team picks) |
| Player Name | Player name (for player picks) |
| Submitted At | When the pick was made |
