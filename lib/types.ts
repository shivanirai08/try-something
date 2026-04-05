export type SpotifyToken = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

export type PlaylistTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  spotifyTrackId: string | null;
  youtubeVideoId: string | null;
  youtubeUrl: string | null;
  matchStatus: "matched" | "unmatched";
};

export type StoredPlaylist = {
  id: string;
  slug: string;
  name: string;
  source: "spotify";
  syncedAt: string;
  items: PlaylistTrack[];
};
