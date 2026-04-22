import { NextResponse } from 'next/server'
export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete('alphaops-token')
  res.cookies.delete('alphaops-role')
  return res
}
