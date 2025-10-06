"use client";
import { useEffect, useMemo, useState } from "react";
import { useAsyncLoader } from "@/components/RouteLoader";

export default function Belajar() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [watched, setWatched] = useState({});
  const [toast, setToast] = useState(false); // ✅ state untuk notifikasi
  const { track } = useAsyncLoader();

  // ✅ Ambil data dari API
  useEffect(() => {
    async function loadCourses() {
      const data = await track(() =>
        fetch("/api/courses").then((r) => r.json())
      );
      setItems(data);
    }
    loadCourses();
  }, [track]);

  // ✅ Load progress dari localStorage saat pertama kali
  useEffect(() => {
    const saved = localStorage.getItem("watchedCourses");
    if (saved) {
      setWatched(JSON.parse(saved));
    }
  }, []);

  // ✅ Simpan progress ke localStorage setiap kali berubah
  useEffect(() => {
    localStorage.setItem("watchedCourses", JSON.stringify(watched));
  }, [watched]);

  // ✅ Tambahkan konfirmasi saat user close / refresh tab
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue =
        "Apakah Anda yakin ingin menutup aplikasi website ini?";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const categoryMatch =
        i.category && i.category.toLowerCase().includes(q.toLowerCase());
      const titleMatch =
        i.title && i.title.toLowerCase().includes(q.toLowerCase());
      return categoryMatch || titleMatch;
    });
  }, [items, q]);

  // ✅ Tandai sudah ditonton + tampilkan popup
  const markAsWatched = (id) => {
    setWatched((prev) => ({ ...prev, [id]: true }));
    setToast(true); // popup aktif dan tetap tampil
  };

  // ✅ Hitung progress global
  const totalCourses = items.length;
  const watchedCount = Object.keys(watched).filter((id) => watched[id]).length;
  const progressPercent =
    totalCourses > 0 ? Math.round((watchedCount / totalCourses) * 100) : 0;

  return (
    <div className="grid gap-6 relative">
      {/* ✅ Popup di tengah, blur background */}
      {toast && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-gray-800 text-white px-6 py-4 rounded-xl shadow-lg flex flex-col items-center animate-fade-in">
            {/* Animasi loading */}
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-center font-medium">Sedang membuka video...</p>
            {/* Tombol manual untuk menutup popup */}
            <button
              className="mt-4 px-3 py-1 bg-red-500 hover:bg-red-600 text-sm rounded"
              onClick={() => setToast(false)}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="input"
          placeholder="Cari pembelajaran..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {/* ✅ Progress Global */}
      {totalCourses > 0 && (
        <div className="p-4 bg-gray-800 rounded-lg shadow-md">
          <p className="text-sm font-medium mb-2">
            Progress Belajar: {watchedCount}/{totalCourses} sudah ditonton (
            {progressPercent}%)
          </p>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {filtered.map((c) => (
          <article
            key={c.id}
            className="card p-5 border border-transparent transition-all duration-300 transform 
             hover:scale-105 hover:shadow-xl hover:bg-gray-700 hover:border-blue-500 
             hover:shadow-blue-500/30 cursor-pointer"
          >
            <h3 className="text-xl font-semibold">{c.title}</h3>
            <p className="text-gray-300">{c.summary}</p>
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
              <span className="badge capitalize">{c.category}</span>
              <span className="badge">{c.type}</span>
            </div>

            <p className="text-xs mt-3">
              {watched[c.id] ? "✅ Sudah ditonton" : "❌ Belum ditonton"}
            </p>

            <a
              className="btn btn-outline mt-3 hover:bg-blue-600 hover:text-white transition-all duration-300 hover:scale-105"
              href={c.link}
              target="_blank"
              onClick={() => markAsWatched(c.id)}
            >
              Nonton
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
