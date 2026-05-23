import { NextResponse } from 'next/server'
import { syncMatchPick, syncSpecialPick, isSheetsConfigured } from '@/lib/sheets'

export async function POST(request) {
  try {
    // Check if Sheets is configured
    if (!isSheetsConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Google Sheets integration not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing type or data' },
        { status: 400 }
      )
    }

    let result

    if (type === 'match_pick') {
      result = await syncMatchPick({
        poolId: data.poolId,
        poolName: data.poolName,
        poolMemberId: data.poolMemberId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        teamName: data.teamName,
        matchId: data.matchId,
        matchInfo: data.matchInfo,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        submittedAt: data.submittedAt,
      })
    } else if (type === 'special_pick') {
      result = await syncSpecialPick({
        poolId: data.poolId,
        poolName: data.poolName,
        poolMemberId: data.poolMemberId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        teamName: data.teamName,
        pickType: data.pickType,
        teamCode: data.teamCode,
        teamPickName: data.teamPickName,
        playerName: data.playerName,
        submittedAt: data.submittedAt,
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid type. Use "match_pick" or "special_pick"' },
        { status: 400 }
      )
    }

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Sync sheets error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    configured: isSheetsConfigured(),
    status: isSheetsConfigured() ? 'ready' : 'not_configured',
  })
}
