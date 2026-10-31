import { NextResponse } from 'next/server';
import { productAccessCookieName } from '../../../../lib/product-access';

export async function DELETE() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.set(productAccessCookieName, '', { path: '/', maxAge: 0 });
  response.cookies.set('aymar_formatos_access', '', { path: '/', maxAge: 0 });
  return response;
}
