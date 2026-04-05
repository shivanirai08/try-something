import crypto from "node:crypto";
import { getRequiredEnv } from "@/lib/env";
import type { SpotifyToken } from "@/lib/types";

type SpotifyPlaylistResponse = {
  items: Array<{
    id: string;
    name: string;
  }>;
  next: string | null;
};

type SpotifyTracksResponse = {
  items: Array<{
    track: {
      id: string | null;
      name: string;
      album: { name: string };
      artists: Array<{ name: string }>;
    } | null;
  }>;
  next: string | null;
};

export function createSpotifyState() {
  return crypto.randomBytes(24).toString("hex");
}

export async function exchangeSpotifyCode(code: string): Promise<SpotifyToken> {
  const clientId = getRequiredEnv("SPOTIFY_CLIENT_ID");
  const clientSecret = getRequiredEnv("SPOTIFY_CLIENT_SECRET");
  const redirectUri = getRequiredEnv("SPOTIFY_REDIRECT_URI");

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Spotify authorization code.");
  }

  return response.json();
}

export async function refreshSpotifyToken(
  refreshToken: string,
): Promise<SpotifyToken> {
  const clientId = getRequiredEnv("SPOTIFY_CLIENT_ID");
  const clientSecret = getRequiredEnv("SPOTIFY_CLIENT_SECRET");
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Spotify token.");
  }

  const refreshed = (await response.json()) as SpotifyToken;
  return {
    ...refreshed,
    refresh_token: refreshed.refresh_token ?? refreshToken,
  };
}

export async function fetchSpotifyPlaylists(accessToken: string) {
  const playlists: Array<{ id: string; name: string }> = [];
  let nextUrl: string | null = "https://api.spotify.com/v1/me/playlists?limit=50";

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Spotify playlists.");
    }

    const data = (await response.json()) as SpotifyPlaylistResponse;
    playlists.push(...data.items.map((item) => ({ id: item.id, name: item.name })));
    nextUrl = data.next;
  }

  return playlists;
}

export async function fetchSpotifyPlaylistTracks(
  accessToken: string,
  playlistId: string,
) {
  const tracks: Array<{
    id: string;
    title: string;
    artist: string;
    album: string;
    spotifyTrackId: string | null;
  }> = [];

  let nextUrl: string | null = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tracks for playlist ${playlistId}.`);
    }

    const data = (await response.json()) as SpotifyTracksResponse;

    tracks.push(
      ...data.items
        .filter((item) => item.track)
        .map((item) => ({
          id: item.track?.id ?? crypto.randomUUID(),
          title: item.track?.name ?? "Unknown track",
          artist:
            item.track?.artists.map((artist) => artist.name).join(", ") ??
            "Unknown artist",
          album: item.track?.album.name ?? "Unknown album",
          spotifyTrackId: item.track?.id ?? null,
        })),
    );

    nextUrl = data.next;
  }

  return tracks;
}
