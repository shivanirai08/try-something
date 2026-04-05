import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StoredPlaylist } from "@/lib/types";
import { slugify } from "@/lib/slug";

const playlistDirectory = path.join(process.cwd(), "data", "playlists");

export async function ensurePlaylistDirectory() {
  await mkdir(playlistDirectory, { recursive: true });
}

export async function storePlaylist(playlist: Omit<StoredPlaylist, "slug">) {
  await ensurePlaylistDirectory();

  const slug = slugify(playlist.name) || playlist.id;
  const filepath = path.join(playlistDirectory, `${slug}.json`);
  const payload: StoredPlaylist = { ...playlist, slug };

  await writeFile(filepath, JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

export async function getStoredPlaylists() {
  await ensurePlaylistDirectory();
  const files = await readdir(playlistDirectory);
  const playlists = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map(async (file) => {
        const content = await readFile(path.join(playlistDirectory, file), "utf8");
        return JSON.parse(content) as StoredPlaylist;
      }),
  );

  return playlists.sort((a, b) => b.syncedAt.localeCompare(a.syncedAt));
}

export async function getStoredPlaylistBySlug(slug: string) {
  const playlists = await getStoredPlaylists();
  return playlists.find((playlist) => playlist.slug === slug) ?? null;
}
