import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory store for demo (replace with DB in production)
const userWalletStore: Record<string, string> = {};

export async function POST(req: NextRequest) {
  const { username, credentialId, walletAddress } = await req.json();
  if (!username || !credentialId || !walletAddress) {
    return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });
  }
  // Save wallet for user
  userWalletStore[credentialId] = walletAddress;
  userWalletStore[username] = walletAddress;
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const credentialId = searchParams.get('credentialId');
  const username = searchParams.get('username');
  let wallet = null;
  if (credentialId && userWalletStore[credentialId]) {
    wallet = userWalletStore[credentialId];
  } else if (username && userWalletStore[username]) {
    wallet = userWalletStore[username];
  }
  if (!wallet) {
    return NextResponse.json({ success: false, error: 'Wallet not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, walletAddress: wallet });
}
