"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import {
  FALLBACK_IMAGE_DATA_URL,
  resolveSupabaseImageUrl,
} from "@/lib/supabase/storage";

const initialState = {
  loading: true,
  items: [],
  error: null,
};

export default function ClientGalleryPage() {
  const supabase = useMemo(() => createClient(), []);
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (!supabase) {
      setState({
        loading: false,
        items: [],
        error: "Kurasi rekomendasi belum tersedia. Coba lagi setelah konfigurasi disimpan.",
      });
      return;
    }

    let ignore = false;

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const { data, error } = await supabase
          .from("public_recipe_gallery")
          .select(
            "id, title, description, category, price, image_url, bucket, storage_bucket, path, storage_path, file_path, created_at"
          )
          .order("created_at", { ascending: false })
          .limit(12);

        if (ignore) return;

        if (error) {
          throw error;
        }

        const items = (data ?? []).map((item, index) => {
          const imageDescriptor =
            item.image_url ??
            item.path ??
            item.storage_path ??
            item.file_path ??
            (item.bucket || item.storage_bucket
              ? {
                  bucket: item.bucket ?? item.storage_bucket,
                  path: item.path ?? item.storage_path ?? item.file_path ?? "",
                }
              : null);

          return {
            id: item.id ?? `gallery-${index}`,
            title: item.title ?? "Menu harian",
            description:
              item.description ??
              "Menu pilihan tim KoSurvive buat nemenin minggu kamu. Nikmati rasa terbaik tanpa keluar dari budget.",
            category: item.category ?? "Menu",
            price:
              typeof item.price === "number"
                ? `≈ Rp${Math.round(item.price).toLocaleString("id-ID")}`
                : item.price ?? null,
            imageUrl: resolveSupabaseImageUrl(imageDescriptor, {
              supabase,
              fallback: FALLBACK_IMAGE_DATA_URL,
            }),
          };
        });

        setState({ loading: false, items, error: null });
      } catch (error) {
        if (ignore) return;

        console.warn("Gagal memuat rekomendasi mingguan:", error);
        setState({
          loading: false,
          items: [],
          error:
            error?.message ??
            "Konten rekomendasi belum bisa dimuat. Silakan coba lagi beberapa saat lagi.",
        });
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, [supabase]);

  return (
    <div className="space-y-10">
      <header className="space-y-3 rounded-3xl border border-slate-800/70 bg-slate-950/60 p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
          Rekomendasi Mingguan
        </p>
        <h1 className="text-3xl font-bold text-white">Resep pilihan minggu ini</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-300">
          Kami kurasi menu hemat dan bergizi yang lagi hits di komunitas KoSurvive. Tinggal pilih yang cocok, masak, dan tandai
          favoritmu supaya muncul di dashboard.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-slate-300">
          <Link href="/feed" className="btn btn-primary">
            Jelajahi semua menu
          </Link>
          <Link href="/favorit" className="btn btn-outline border-emerald-400/40 text-slate-100">
            Lihat favoritku
          </Link>
        </div>
      </header>

      {state.loading ? (
        <div className="rounded-3xl border border-slate-800/60 bg-slate-950/50 p-12 text-center text-slate-300">
          Memuat rekomendasi terbaik untukmu...
        </div>
      ) : state.error ? (
        <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-6 text-center text-rose-100">
          {state.error}
        </div>
      ) : state.items.length === 0 ? (
        <div className="rounded-3xl border border-slate-800/60 bg-slate-950/50 p-12 text-center text-slate-300">
          Belum ada rekomendasi terbaru. Tim admin sedang menyiapkan kurasi selanjutnya!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {state.items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-3xl border border-slate-800/70 bg-slate-950/60 shadow-xl shadow-slate-950/40"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  fill
                  src={item.imageUrl}
                  alt={item.title}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.src !== FALLBACK_IMAGE_DATA_URL) {
                      target.src = FALLBACK_IMAGE_DATA_URL;
                    }
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-100">
                    {item.category}
                  </span>
                </div>
              </div>
              <div className="space-y-3 p-6">
                <h2 className="text-xl font-semibold text-white">{item.title}</h2>
                <p className="text-sm leading-relaxed text-slate-300">{item.description}</p>
                {item.price && (
                  <p className="text-sm font-semibold text-emerald-200">{item.price}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
