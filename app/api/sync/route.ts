import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { syncSpotifyLibrary } from "@/lib/sync";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("spotify_token")?.value;

  if (!rawToken) {
    return NextResponse.redirect(new URL("/?error=connect-spotify", request.url));
  }

  const nextToken = await syncSpotifyLibrary(rawToken);
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("spotify_token", JSON.stringify(nextToken), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: nextToken.expires_in,
  });

  return response;
}
