import { NextResponse, NextRequest } from "next/server";
import {
  IP_RESTRICTION_ENABLED,
  RESTRICTED_COUNTRY_CODES,
} from "@config/constants";

export async function GET(request: NextRequest) {
  if (!IP_RESTRICTION_ENABLED) {
    return NextResponse.json({
      ipAddress: "",
      location: "",
      isRestricted: false,
    });
  }

  const country = request.geo?.country;
  if (!country) {
    return NextResponse.json({
      ipAddress: "",
      location: "",
      isRestricted: false,
    });
  }

  const restricted = RESTRICTED_COUNTRY_CODES.includes(country);
  return NextResponse.json({
    ipAddress: request.ip,
    location: "TEST",
    isRestricted: restricted,
  });
}
