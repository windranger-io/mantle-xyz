import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const s = request.nextUrl?.searchParams;
  const address = s.get("address");
  // const address = "0x152eeb5d3669ce07c27dd6ec33a6c67c6610fc1f";
  const page = s.get("page");
  const pageSize = s.get("pageSize");
  if (!s || !address || !page || !pageSize) {
    return NextResponse.json({});
  }
  const url = `${process.env.NEXT_PUBLIC_LITHOSPHERE_API_URL}/api/v1/withdrawals?address=${address}&page=${page}&pageSize=${pageSize}&order=desc`;
  console.log(url);
  const res = await fetch(url);
  if (res.status === 200) {
    return NextResponse.json(await res.json());
  }
  return NextResponse.json(null);
}
