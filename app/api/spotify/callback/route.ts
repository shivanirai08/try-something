import { NextRequest, NextResponse } from "next/server";
import { exchangeSpotifyCode } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get("spotify_oauth_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/?error=spotify-auth", request.url));
  }

  const token = await exchangeSpotifyCode(code);
  const response = NextResponse.redirect(new URL("/", request.url));

  response.cookies.set("spotify_token", JSON.stringify(token), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: token.expires_in,
  });
  response.cookies.delete("spotify_oauth_state");

  return response;
}
