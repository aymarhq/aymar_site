import { NextResponse } from 'next/server';

const checkoutUrl = 'https://pay.cakto.com.br/35i4ijs_1256672';

export async function GET() {
  return NextResponse.redirect(checkoutUrl, { status: 302 });
}

export async function POST() {
  return NextResponse.redirect(checkoutUrl, { status: 303 });
}
