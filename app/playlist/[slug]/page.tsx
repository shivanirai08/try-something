import { notFound } from "next/navigation";
import { getStoredPlaylistBySlug } from "@/lib/storage";

type PlaylistPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PlaylistPage({ params }: PlaylistPageProps) {
  const { slug } = await params;
  const playlist = await getStoredPlaylistBySlug(slug);

  if (!playlist) {
    notFound();
  }

  const firstPlayable = playlist.items.find((item) => item.youtubeVideoId);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#07111f_0%,_#04070d_100%)] px-6 py-10 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/6 p-8 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
            Playlist view
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {playlist.name}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Embedded playback uses YouTube video pages or embeds for matched
            tracks. Unmatched items remain in the library so you can review them
            later.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-4">
            {firstPlayable ? (
              <iframe
                className="aspect-video w-full rounded-[1.25rem] border border-white/10"
                src={`https://www.youtube.com/embed/${firstPlayable.youtubeVideoId}`}
                title={firstPlayable.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-[1.25rem] border border-dashed border-white/15 text-sm text-slate-400">
                No matched video is available for preview yet.
              </div>
            )}
          </div>
          <div className="grid gap-3">
            {playlist.items.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-medium text-white">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.artist} · {item.album}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">
                      {item.matchStatus}
                    </p>
                  </div>
                  {item.youtubeUrl ? (
                    <a
                      className="secondary-button shrink-0"
                      href={item.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Watch
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
