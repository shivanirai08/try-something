import Link from "next/link";
import { InstallPrompt } from "@/components/install-prompt";
import { getStoredPlaylists } from "@/lib/storage";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function Home() {
  const playlists = await getStoredPlaylists();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(42,122,226,0.28),_transparent_45%),linear-gradient(180deg,_#07111f_0%,_#04070d_100%)] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 sm:px-8 lg:px-10">
        <section className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/6 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur md:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-1 text-sm tracking-[0.24em] text-cyan-100 uppercase">
              PWA music workspace
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Bring your Spotify playlists into one installable player.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                This starter connects to Spotify, matches tracks with the
                official YouTube Data API, stores each synced playlist as a
                local JSON library, and plays matched videos inside the app.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link className="primary-button" href="/api/spotify/login">
                Connect Spotify
              </Link>
              <Link className="secondary-button" href="#library">
                Open library
              </Link>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-400">
              The current build uses official APIs and embedded playback. It
              does not scrape or download YouTube media, and it does not remove
              ads from YouTube playback.
            </p>
          </div>
          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <div className="rounded-[1.25rem] border border-emerald-300/20 bg-emerald-300/10 p-4">
              <p className="text-sm font-medium text-emerald-100">
                What sync saves
              </p>
              <p className="mt-2 text-sm leading-7 text-emerald-50/80">
                Each playlist is written under <code>data/playlists</code> with
                the Spotify name, original tracks, and matched YouTube video
                metadata.
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-cyan-300/20 bg-cyan-300/10 p-4">
              <p className="text-sm font-medium text-cyan-100">
                What you need
              </p>
              <p className="mt-2 text-sm leading-7 text-cyan-50/80">
                Add Spotify OAuth credentials and a YouTube Data API key in
                <code>.env.local</code>, then use the sync endpoint after
                connecting.
              </p>
            </div>
            <InstallPrompt />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="panel">
            <p className="panel-kicker">1. Authenticate</p>
            <h2 className="panel-title">Spotify OAuth flow</h2>
            <p className="panel-copy">
              Secure login is handled with route handlers and an HTTP-only token
              cookie.
            </p>
          </article>
          <article className="panel">
            <p className="panel-kicker">2. Match</p>
            <h2 className="panel-title">Search YouTube API</h2>
            <p className="panel-copy">
              Tracks are searched by title and artist, then the best candidate
              is saved for playback.
            </p>
          </article>
          <article className="panel">
            <p className="panel-kicker">3. Play</p>
            <h2 className="panel-title">Install as a PWA</h2>
            <p className="panel-copy">
              Your matched playlist library is browseable on desktop and mobile.
            </p>
          </article>
        </section>

        <section
          id="library"
          className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 backdrop-blur"
        >
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                Local library
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Synced playlists
              </h2>
            </div>
            <form action="/api/sync" method="post">
              <button className="secondary-button" type="submit">
                Sync from Spotify
              </button>
            </form>
          </div>

          <div className="mt-6 grid gap-4">
            {playlists.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-6 text-sm leading-7 text-slate-300">
                No playlists have been synced yet. Connect Spotify, add your
                API keys, and run sync to create local playlist folders.
              </div>
            ) : (
              playlists.map((playlist) => (
                <article
                  key={playlist.slug}
                  className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Synced {formatDate(playlist.syncedAt)} - {playlist.items.length} tracks
                      </p>
                    </div>
                    <Link
                      className="secondary-button w-fit"
                      href={`/playlist/${playlist.slug}`}
                    >
                      Open playlist
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
