"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAsyncLoader } from "@/components/RouteLoader";

export default function TambahAktivitas() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [workouts, setWorkouts] = useState([]);
  const router = useRouter();
  const { track } = useAsyncLoader();

  useEffect(() => {
    let isCancelled = false;

    async function loadWorkouts() {
      try {
        const response = await track(() => fetch("/api/workouts"));
        const payload = await response.json();
        if (!isCancelled && response.ok && payload.status === "success") {
          setWorkouts(payload.data?.workouts || []);
        }
      } catch (error) {
        console.error("Failed to load workouts", error);
      }
    }

    loadWorkouts();

    return () => {
      isCancelled = true;
    };
  }, [track]);

  useEffect(() => {
    const d = localStorage.getItem("selectedDate");
    if (d) setSelectedDate(d);
  }, []);

  const saveActivity = async () => {
    if (!selectedWorkout) return alert("Pilih olahraga dulu!");
    if (!selectedDate) return alert("Tanggal tidak valid. Kembali ke kalender dan pilih ulang.");
    const body = {
      date: selectedDate,
      workout: selectedWorkout,
    };

    try {
      const response = await track(() =>
        fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.status !== "success") {
        alert(payload?.message ?? "Gagal menyimpan aktivitas.");
        return;
      }
      router.push("/kalender");
    } catch (error) {
      console.error("Gagal menyimpan aktivitas", error);
      alert("Gagal menyimpan aktivitas.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h1 className="text-2xl font-bold">Tambah Aktivitas</h1>
      <p className="text-gray-300">
        Tanggal dipilih:{" "}
        <span className="text-emerald-400 font-semibold">{selectedDate}</span>
      </p>

      <select
        className="p-2 border rounded-lg bg-gray-800 text-white"
        value={selectedWorkout}
        onChange={(e) => setSelectedWorkout(e.target.value)}
      >
        <option value="">-- Pilih olahraga --</option>
        {workouts.map((w) => (
          <option key={w.id} value={w.name}>
            {w.name}
          </option>
        ))}
      </select>

      <button
        onClick={saveActivity}
        className="bg-emerald-500 px-4 py-2 rounded-lg hover:bg-emerald-600"
      >
        💾 Simpan Aktivitas
      </button>
    </div>
  );
}
