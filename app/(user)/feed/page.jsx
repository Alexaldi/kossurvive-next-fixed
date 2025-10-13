"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  ChefHat,
  Flame,
  Heart,
  Leaf,
  Sparkles,
  Timer,
  UtensilsCrossed,
} from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import { useAsyncLoader } from "@/components/RouteLoader";
import { createClient } from "@/lib/supabase/client";
import { FALLBACK_IMAGE_DATA_URL, resolveSupabaseImageUrl } from "@/lib/supabase/storage";

function useUser() {
  const { track } = useAsyncLoader();
  const [user, setUser] = useState(null);
  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const response = await track(() => fetch("/api/user"))
        const payload = await response.json()
        if (!response.ok || payload.status !== "success") {
          if (!cancelled) setUser(null)
          return
        }
        if (!cancelled) setUser(payload.data)
      } catch (error) {
        if (!cancelled) setUser(null)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [track]);
  return [user, setUser];
}

export default function Feed() {
  const { track } = useAsyncLoader();
  const supabase = useMemo(() => createClient(), []);
  const [user] = useUser();
  const [items, setItems] = useState([]);
  const [score, setScore] = useState({});
  const [pendingAction, setPendingAction] = useState(null);
  const [gallery, setGallery] = useState({ loading: true, items: [], error: null });
  const observer = useRef(null);

  const topCategories = useMemo(() => {
    const ranked = Object.entries(score || {})
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([label, value]) => ({ label, value }));

    if (ranked.length > 0) {
      return ranked;
    }

    if (items.length > 0) {
      return items[0].categories.slice(0, 3).map((label) => ({ label, value: 0 }));
    }

    return [];
  }, [items, score]);

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const response = await track(() => fetch("/api/recommend"));
        const payload = await response.json();
        if (!response.ok || payload.status !== "success") return;
        if (cancelled) return;
        setScore(payload.data?.score || {});
        setItems(payload.data?.recipes || []);
      } catch (error) {
        console.error("Gagal memuat rekomendasi:", error);
      }
    }
    init();

    return () => {
      cancelled = true;
    };
  }, [track]);

  useEffect(() => {
    if (!supabase) {
      setGallery({
        loading: false,
        items: [],
        error:
          "Supabase belum dikonfigurasi. Tambahkan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY untuk menampilkan galeri storage.",
      });
      return;
    }

    let ignore = false;

    setGallery((prev) => ({ ...prev, loading: true, error: null }));

    const loadGallery = async () => {
      try {
        const { data, error } = await supabase
          .from("public_recipe_gallery")
          .select(
            "id, title, description, image_url, imageUrl, path, storage_path, file_path, bucket, storage_bucket, price, category, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(6);

        if (ignore) return;

        if (error) {
          throw error;
        }

        const hydrated = (data ?? []).map((item, index) => {
          const descriptor =
            item.image_url ??
            item.imageUrl ??
            item.path ??
            item.storage_path ??
            item.file_path ??
            (item.bucket || item.storage_bucket
              ? {
                  bucket: item.bucket ?? item.storage_bucket,
                  path:
                    item.path ??
                    item.storage_path ??
                    item.file_path ??
                    "",
                }
              : null);

          const numericPrice =
            typeof item.price === "number"
              ? item.price
              : typeof item.price === "string" &&
                  item.price.trim() !== "" &&
                  !Number.isNaN(Number(item.price))
              ? Number(item.price)
              : null;

          const priceLabel =
            numericPrice !== null
              ? `≈ Rp${Math.round(numericPrice).toLocaleString("id-ID")}`
              : typeof item.price === "string" && item.price.trim() !== ""
              ? item.price
              : null;

          return {
            id: item.id ?? `gallery-${index}`,
            title: item.title ?? "Menu unggulan",
            description: item.description ?? "",
            category: item.category ?? "Menu",
            priceLabel,
            imageUrl: resolveSupabaseImageUrl(descriptor, {
              supabase,
              fallback: FALLBACK_IMAGE_DATA_URL,
            }),
          };
        });

        setGallery({
          loading: false,
          items: hydrated,
          error:
            hydrated.length === 0
              ? "Belum ada data di tabel public_recipe_gallery. Upload gambar melalui aplikasi admin untuk menampilkannya di sini."
              : null,
        });
      } catch (error) {
        if (ignore) return;
        console.warn("Gagal memuat galeri Supabase:", error);
        setGallery({
          loading: false,
          items: [],
          error:
            error?.message ??
            "Gagal memuat konten dari Supabase. Pastikan tabel public_recipe_gallery tersedia dan akses storage publik sudah diberikan.",
        });
      }
    };

    loadGallery();

    return () => {
      ignore = true;
    };
  }, [supabase]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (e) => {
          if (e.isIntersecting) {
            const id = e.target.getAttribute("data-id");
            const response = await fetch("/api/recommend/view", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ recipeId: id }),
            });
            const payload = await response.json().catch(() => null);
            if (response.ok && payload?.status === "success") {
              setScore(payload.data?.score || {});
              setItems(payload.data?.recipes || []);
            }
            e.target.classList.add("ring-2", "ring-emerald-600");
            setTimeout(
              () => e.target.classList.remove("ring-2", "ring-emerald-600"),
              800
            );
          }
        });
      },
      { threshold: 0.8 }
    );
    document
      .querySelectorAll(".recipe-card")
      .forEach((el) => observer.current.observe(el));
    return () => observer.current?.disconnect();
  }, [items]);

  async function act(id, action) {
    const target = items.find((recipe) => recipe.id === id);
    const isSaveAction = action === "save";
    const method = isSaveAction && target?.saved ? "DELETE" : "POST";
    const actionKey = `${id}:${action}`;

    setPendingAction(actionKey);
    await track(async () => {
      try {
        const response = await fetch("/api/recommend/" + action, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId: id }),
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.status !== "success") return;
        setScore(payload.data?.score || {});
        setItems(payload.data?.recipes || []);
      } finally {
        setPendingAction((current) => (current === actionKey ? null : current));
      }
    });
  }

  function scrollToRecipes() {
    document.getElementById("resep-harian")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="space-y-12">
      <PageHero
        eyebrow="Rekomendasi harian"
        title={`Resep pilihan untuk ${user?.name ? user.name.split(" ")[0] : "kamu"}`}
        description="Temukan menu hemat bernutrisi yang disusun dari preferensi kamu. Simpan favorit, beri like, dan lihat bagaimana skor personalmu makin presisi setiap kali kamu berinteraksi."
        actions={
          <>
            <button onClick={scrollToRecipes} className="btn btn-primary">
              Mulai jelajah resep
            </button>
            <Link
              href="/feed"
              className="btn btn-outline border-emerald-400/40 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
            >
              Reset rekomendasi
            </Link>
          </>
        }
      >
        <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-6 shadow-inner shadow-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-200">
              <ChefHat className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/80">Kategori favorit</p>
              <p className="text-lg font-semibold text-white">{topCategories.map((c) => c.label).join(" • ") || "Menunggu data"}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            {topCategories.length > 0 ? (
              topCategories.map(({ label, value }) => (
                <li
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-950/60 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-200">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="font-medium text-slate-100">{label}</span>
                  </div>
                  <span className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">
                    Skor {value}
                  </span>
                </li>
              ))
            ) : (
              <li className="rounded-2xl border border-slate-800/60 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                Interaksi kamu akan muncul di sini begitu kami mengenal selera kamu.
              </li>
            )}
          </ul>
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-800/60 bg-slate-900/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            <span className="flex items-center gap-2 text-emerald-200">
              <Leaf className="h-4 w-4" aria-hidden="true" />
              Masak hemat & sehat
            </span>
            <span>{items.length} resep aktif</span>
          </div>
        </div>
      </PageHero>

      <section className="rounded-3xl border border-slate-800/70 bg-slate-950/60 p-6 shadow-inner shadow-slate-950/40">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">Konten terbaru dari Supabase Storage</h2>
            <p className="text-sm text-slate-300">
              Semua gambar di bawah ini diambil langsung dari bucket publik Supabase. Admin cukup mengunggah file dari aplikasi
              pengelola untuk memperbarui konten tanpa deploy ulang.
            </p>
          </div>
          <span className="inline-flex items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
            Sinkron otomatis
          </span>
        </div>

        {gallery.loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3).keys()].map((index) => (
              <div
                key={`gallery-skeleton-${index}`}
                className="animate-pulse space-y-3 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-4"
              >
                <div className="aspect-[4/3] w-full rounded-2xl bg-slate-800/60" />
                <div className="h-4 w-3/4 rounded bg-slate-800/60" />
                <div className="h-3 w-1/2 rounded bg-slate-800/60" />
              </div>
            ))}
          </div>
        ) : gallery.error ? (
          <p className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            {gallery.error}
          </p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.items.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/60 shadow-inner shadow-slate-950/40 transition hover:border-emerald-400/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.src !== FALLBACK_IMAGE_DATA_URL) {
                        event.currentTarget.src = FALLBACK_IMAGE_DATA_URL;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-semibold text-slate-200">
                    <span className="rounded-full bg-slate-950/80 px-3 py-1 uppercase tracking-[0.3em] text-emerald-200">
                      {item.category}
                    </span>
                    {item.priceLabel && (
                      <span className="rounded-full bg-slate-950/80 px-3 py-1 text-emerald-100">{item.priceLabel}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="text-base font-semibold text-white">{item.title}</h3>
                  {item.description && <p className="text-sm text-slate-300">{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="resep-harian" className="space-y-6 scroll-mt-28">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-white">Pilihan resep untuk hari ini</h2>
            <p className="text-sm text-slate-300">
              Resep kami disusun agar pas buat dapur kos: bahan sederhana, waktu masak singkat, dan nutrisi tetap terjaga.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-400">
            <Timer className="h-4 w-4 text-emerald-200" aria-hidden="true" />
            {""}
            update realtime
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {items.map((r) => {
            const preferenceScore = r.categories.reduce(
              (total, category) => total + (score?.[category] || 0),
              0
            );
            const imageSrc = resolveSupabaseImageUrl(r.image, {
              supabase,
              fallback: FALLBACK_IMAGE_DATA_URL,
            });

            return (
              <article
                key={r.id}
                data-id={r.id}
                className="recipe-card group relative overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/60 shadow-xl shadow-slate-950/40 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-emerald-400/40"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={r.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(event) => {
                      if (event.currentTarget.src !== FALLBACK_IMAGE_DATA_URL) {
                        event.currentTarget.src = FALLBACK_IMAGE_DATA_URL;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                      <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
                      {r.categories[0] || "Resep"}
                    </span>
                    <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-200">
                      Kecocokan {preferenceScore}
                    </span>
                  </div>
                </div>

                <div className="space-y-6 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold text-white">{r.name}</h3>
                      <p className="text-sm text-slate-300">
                        {r.categories.join(" • ")} · {r.ingredients.length} bahan utama
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100">
                      <Flame className="h-4 w-4" aria-hidden="true" />≈ Rp{r.estCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Bahan utama</p>
                      <ul className="space-y-2 text-sm text-slate-200">
                        {r.ingredients.map((i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {i}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Langkah singkat</p>
                      <p className="text-sm leading-relaxed text-slate-300">{r.howto}</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(r.nutrients).map(([key, value]) => (
                          <span
                            key={key}
                            className="inline-flex items-center gap-1 rounded-full border border-slate-800/60 bg-slate-950/60 px-3 py-1 text-xs font-medium text-slate-200"
                          >
                            <Leaf className="h-3.5 w-3.5 text-emerald-200" aria-hidden="true" />
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-slate-800/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {r.categories.map((category) => (
                        <span
                          key={category}
                          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold text-emerald-100"
                        >
                          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => act(r.id, "like")}
                        className={`btn transition ${
                          r.liked
                            ? "border-rose-400/40 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                            : "btn-outline border-emerald-400/40 bg-slate-900/60 text-slate-100 hover:bg-emerald-500/10"
                        }`}
                        aria-pressed={r.liked}
                        disabled={pendingAction === `${r.id}:like`}
                      >
                        <Heart
                          className="h-4 w-4"
                          aria-hidden="true"
                          fill={r.liked ? "currentColor" : "none"}
                        />
                        {r.liked ? "Disukai" : "Suka"}
                      </button>
                      <button
                        onClick={() => act(r.id, "save")}
                        className={`btn btn-primary transition ${
                          r.saved ? "border-emerald-400 bg-emerald-500/20 text-emerald-100" : ""
                        }`}
                        aria-pressed={r.saved}
                        disabled={pendingAction === `${r.id}:save`}
                      >
                        <Bookmark
                          className="h-4 w-4"
                          aria-hidden="true"
                          fill={r.saved ? "currentColor" : "none"}
                        />
                        {r.saved ? "Tersimpan" : "Simpan"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
