import { NextRequest, NextResponse } from 'next/server';
import { runScheduledSettlementJob, SettlementSchedule } from '@/lib/settlement-automation';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (process.env.NODE_ENV === 'production') {
      if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const schedule = searchParams.get('schedule') as SettlementSchedule;

    if (!schedule || !['instant', 'daily', 'weekly', 'monthly'].includes(schedule)) {
      return NextResponse.json({ success: false, error: 'Invalid schedule' }, { status: 400 });
    }

    await runScheduledSettlementJob(schedule);

    return NextResponse.json({
      success: true,
      message: `Settlement job completed: ${schedule}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
