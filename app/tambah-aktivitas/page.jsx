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
        const data = await track(() => fetch("/api/workouts").then((r) => r.json()));
        if (!isCancelled) {
          setWorkouts(data);
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

  const saveActivity = () => {
    if (!selectedWorkout) return alert("Pilih olahraga dulu!");
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem("activities")) || [];
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }

    existing.push({ date: selectedDate, workout: selectedWorkout });
    localStorage.setItem("activities", JSON.stringify(existing));
    router.push("/kalender");
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
