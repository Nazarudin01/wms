import { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const auth = NextAuth(authOptions);

export async function GET(request: NextRequest) {
  return auth(request);
}

export async function POST(request: NextRequest) {
  return auth(request);
} 