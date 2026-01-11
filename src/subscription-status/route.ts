import { NextResponse } from 'next/server';
import { hasValidUnlockKey } from '@/lib/unlock';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    const user = String(address || '').trim();

    if (!user || !user.startsWith('0x')) {
      return NextResponse.json({ ok: false, error: 'Invalid address' }, { status: 400 });
    }

    const lockObserverPlus = process.env.NEXT_PUBLIC_UNLOCK_LOCK_OBSERVER_PLUS as `0x${string}` | undefined;
    const lockAnalyst = process.env.NEXT_PUBLIC_UNLOCK_LOCK_ANALYST as `0x${string}` | undefined;
    const lockArchitect = process.env.NEXT_PUBLIC_UNLOCK_LOCK_ARCHITECT as `0x${string}` | undefined;

    if (!lockObserverPlus || !lockAnalyst || !lockArchitect) {
      return NextResponse.json({ ok: false, error: 'Unlock locks not configured' }, { status: 500 });
    }

    const [observerPlus, analyst, architect] = await Promise.all([
      hasValidUnlockKey(lockObserverPlus, user as `0x${string}`),
      hasValidUnlockKey(lockAnalyst, user as `0x${string}`),
      hasValidUnlockKey(lockArchitect, user as `0x${string}`),
    ]);

    return NextResponse.json({ ok: true, observerPlus, analyst, architect });
  } catch (e: any) {
    console.error('subscription-status error:', e);
    return NextResponse.json({ ok: false, error: e?.message || 'Failed' }, { status: 500 });
  }
}
