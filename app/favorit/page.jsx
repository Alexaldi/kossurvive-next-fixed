"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  ChefHat,
  Heart,
  Loader2,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";

import PageHero from "@/components/ui/PageHero";
import { useAsyncLoader } from "@/components/RouteLoader";

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-slate-800/70 bg-slate-950/60 p-10 text-center text-slate-300">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-200">
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="max-w-md text-sm leading-relaxed text-slate-300">{description}</p>
      {action}
    </div>
  );
}

function RecipeCollection({
  items,
  title,
  subtitle,
  empty,
  onToggleLike,
  onToggleSave,
  pendingAction,
}) {
  if (!items.length) {
    return empty;
  }

  return (
    <div className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="text-sm text-slate-300">{subtitle}</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        {items.map((item) => {
          const lastInteracted = item.lastInteracted ? new Date(item.lastInteracted) : null;

          return (
            <article
              key={`${title}-${item.id}`}
              className="relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/60 shadow-xl shadow-slate-950/40 backdrop-blur-xl"
            >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                  <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                  {item.categories?.[0] || "Resep"}
                </span>
                <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-200">
                  {lastInteracted
                    ? `Interaksi terakhir ${lastInteracted.toLocaleDateString()}`
                    : "Belum ada interaksi"}
                </span>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-white">{item.name}</h3>
                  <p className="text-sm text-slate-300">
                    {item.categories?.join(" • ")} · {item.ingredients?.length ?? 0} bahan utama
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                  <ChefHat className="h-4 w-4" aria-hidden="true" />≈ Rp{item.estCost?.toLocaleString()}
                </span>
              </div>

              <div className="space-y-3 text-sm leading-relaxed text-slate-300">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Langkah ringkas</p>
                <p>{item.howto}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                {item.categories?.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold text-emerald-100"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    {category}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 border-t border-slate-800/60 pt-4">
                <button
                  onClick={() => onToggleLike(item.id)}
                  className={`btn transition ${
                    item.liked
                      ? "border-rose-400/40 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                      : "btn-outline border-emerald-400/40 bg-slate-900/60 text-slate-100 hover:bg-emerald-500/10"
                  }`}
                  aria-pressed={item.liked}
                  disabled={pendingAction === `${item.id}:like`}
                >
                  <Heart
                    className="h-4 w-4"
                    aria-hidden="true"
                    fill={item.liked ? "currentColor" : "none"}
                  />
                  {item.liked ? "Disukai" : "Suka"}
                </button>
                <button
                  onClick={() => onToggleSave(item.id)}
                  className={`btn btn-primary transition ${
                    item.saved ? "border-emerald-400 bg-emerald-500/20 text-emerald-100" : ""
                  }`}
                  aria-pressed={item.saved}
                  disabled={pendingAction === `${item.id}:save`}
                >
                  <Bookmark
                    className="h-4 w-4"
                    aria-hidden="true"
                    fill={item.saved ? "currentColor" : "none"}
                  />
                  {item.saved ? "Tersimpan" : "Simpan"}
                </button>
              </div>
            </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function FavoriteRecipesPage() {
  const { track } = useAsyncLoader();
  const [state, setState] = useState({
    loading: true,
    liked: [],
    saved: [],
    error: null,
  });
  const [pendingAction, setPendingAction] = useState(null);

  const loadFavorites = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await track(() => fetch("/api/recipes/favorites"));
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.status !== "success") {
        throw new Error(payload?.message || "Gagal memuat data favorit");
      }
      setState({
        loading: false,
        liked: payload.data?.liked ?? [],
        saved: payload.data?.saved ?? [],
        error: null,
      });
    } catch (error) {
      console.error("Gagal memuat favorit:", error);
      setState({ loading: false, liked: [], saved: [], error: error.message });
    }
  }, [track]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggle = useCallback(
    async (recipeId, action) => {
      setPendingAction(`${recipeId}:${action}`);
      try {
        const response = await track(() =>
          fetch(`/api/recommend/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipeId }),
          })
        );
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.status !== "success") {
          throw new Error(payload?.message || "Gagal memperbarui interaksi");
        }
        await loadFavorites();
      } catch (error) {
        console.error("Gagal memperbarui interaksi resep:", error);
        setState((prev) => ({ ...prev, error: error.message }));
      } finally {
        setPendingAction(null);
      }
    },
    [loadFavorites, track]
  );

  const summary = useMemo(() => {
    const liked = state.liked.length;
    const saved = state.saved.length;
    if (!liked && !saved) {
      return "Belum ada koleksi favorit. Mulai jelajahi resep dan tandai yang kamu suka.";
    }
    if (liked && saved) {
      return `Kamu menyukai ${liked} resep dan menyimpan ${saved} untuk dicoba nanti.`;
    }
    if (liked) {
      return `Kamu telah menyukai ${liked} resep. Simpan resep favorit agar mudah ditemukan.`;
    }
    return `Kamu menyimpan ${saved} resep untuk dicoba. Beri like untuk memperkuat rekomendasi.`;
  }, [state.liked.length, state.saved.length]);

  return (
    <div className="space-y-12">
      <PageHero
        eyebrow="Koleksi pribadi"
        title="Semua resep favorit kamu"
        description="Lihat kembali resep yang sudah kamu like atau simpan. Gunakan daftar ini untuk merencanakan menu mingguan dan lanjutkan eksplorasi rasa."
        actions={
          <>
            <Link href="/feed" className="btn btn-primary">
              Cari resep baru
            </Link>
            <Link
              href="/onboarding"
              className="btn btn-outline border-emerald-400/40 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              Atur ulang preferensi
            </Link>
          </>
        }
      >
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-6 text-sm text-slate-200">
          {state.loading ? (
            <span className="inline-flex items-center gap-2 text-emerald-200">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Memuat ringkasan koleksi kamu...
            </span>
          ) : (
            summary
          )}
        </div>
      </PageHero>

      {state.error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      )}

      {state.loading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-200" aria-hidden="true" />
        </div>
      ) : (
        <div className="space-y-12">
          <RecipeCollection
            items={state.liked}
            title="Resep yang Disukai"
            subtitle="Like membantu mesin rekomendasi kami mengenali selera kamu."
            empty={
              <EmptyState
                icon={Heart}
                title="Belum ada resep yang disukai"
                description="Beri like pada resep yang menarik di halaman rekomendasi supaya muncul kembali di sini."
                action={
                  <Link href="/feed" className="btn btn-primary">
                    Jelajahi rekomendasi
                  </Link>
                }
              />
            }
            onToggleLike={(id) => toggle(id, "like")}
            onToggleSave={(id) => toggle(id, "save")}
            pendingAction={pendingAction}
          />

          <RecipeCollection
            items={state.saved}
            title="Resep yang Disimpan"
            subtitle="Kumpulkan resep pilihanmu untuk dimasak kapan saja."
            empty={
              <EmptyState
                icon={Bookmark}
                title="Belum ada resep tersimpan"
                description="Simpan resep favorit dari halaman rekomendasi agar mudah ditemukan kembali."
                action={
                  <Link
                    href="/feed"
                    className="btn btn-outline border-emerald-400/40 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
                  >
                    Cari resep
                  </Link>
                }
              />
            }
            onToggleLike={(id) => toggle(id, "like")}
            onToggleSave={(id) => toggle(id, "save")}
            pendingAction={pendingAction}
          />
        </div>
      )}
    </div>
  );
}
