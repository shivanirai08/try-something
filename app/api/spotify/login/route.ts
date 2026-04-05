import { NextResponse } from "next/server";
import { getRequiredEnv, getSpotifyScopes } from "@/lib/env";
import { createSpotifyState } from "@/lib/spotify";

export async function GET() {
  const clientId = getRequiredEnv("SPOTIFY_CLIENT_ID");
  const redirectUri = getRequiredEnv("SPOTIFY_REDIRECT_URI");
  const state = createSpotifyState();

  const search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: getSpotifyScopes().join(" "),
    state,
  });

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${search.toString()}`,
  );

  response.cookies.set("spotify_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  });

  return response;
}
