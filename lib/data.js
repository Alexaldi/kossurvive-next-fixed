export const CATEGORIES = [
  "pedas",
  "manis",
  "murah",
  "cepat",
  "vegetarian",
  "ayam",
  "ikan",
  "sayur",
  "nasi",
  "mie",
];

export const RECIPES = [
  {
    id: "r1",
    name: "Nasi Telur Ceplok Sambal",
    estCost: 12000,
    categories: ["murah", "cepat", "pedas", "nasi"],
    nutrients: { kalori: 520, protein: 18, karbo: 70, gula: 6, lemak: 18 },
    ingredients: ["Nasi", "Telur", "Sambal", "Minyak", "Garam"],
    howto: "Goreng telur, tuang sambal, sajikan dengan nasi.",
    image:
      "https://img-global.cpcdn.com/recipes/64bb743090e2f2df/1200x630cq70/photo.jpg",
  },
  {
    id: "r2",
    name: "Tumis Sayur Sosis",
    estCost: 15000,
    categories: ["murah", "sayur", "cepat"],
    nutrients: { kalori: 350, protein: 14, karbo: 30, gula: 5, lemak: 16 },
    ingredients: ["Wortel", "Buncis", "Sosis", "Bawang", "Kecap"],
    howto: "Tumis bawang, masukkan sayur & sosis, bumbui.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r3",
    name: "Oat Banana Smoothie",
    estCost: 9000,
    categories: ["murah", "manis", "vegetarian"],
    nutrients: { kalori: 260, protein: 7, karbo: 45, gula: 18, lemak: 5 },
    ingredients: ["Pisang", "Oat", "Susu", "Madu"],
    howto: "Blender semua bahan 30 detik.",
    image:
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "r4",
    name: "Ayam Geprek Hemat",
    estCost: 17000,
    categories: ["ayam", "pedas", "murah"],
    nutrients: { kalori: 480, protein: 24, karbo: 35, gula: 4, lemak: 22 },
    ingredients: ["Ayam", "Tepung", "Cabai", "Bawang", "Nasi"],
    howto: "Goreng ayam tepung, ulek cabai, geprek dan sajikan.",
    image:
      "https://static.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/22/2024/01/27/afsatgdhgdfhfj-3759391209.jpg",
  },
];

export const WORKOUTS = [
  {
    id: "w1",
    name: "5 Menit Full Body",
    moves: [
      "Jumping jack 60s",
      "Push-up 30s",
      "Plank 30s",
      "Squat 45s",
      "Stretch 1m",
    ],
  },
  {
    id: "w2",
    name: "Plank Ladder",
    moves: ["Plank 20s", "Rest 10s", "Plank 30s", "Rest 10s", "Plank 40s"],
  },
  {
    id: "w3",
    name: "Stretching Kamar",
    moves: ["Neck roll", "Shoulder stretch", "Hamstring stretch", "Hip opener"],
  },
];

export const COURSES = [
  {
    id: "c1",
    title: "Desain logo menggunakan canva",
    category: "desain",
    type: "artikel",
    summary: "Cara desain logo modern cuman 5 menit !",
    link: "https://youtu.be/_OTw5Gn-3Es?si=QnlQg-CGrB2AhM5V",
  },
  {
    id: "c2",
    title: "Jualan Online Dasar di shoope",
    category: "jualan",
    type: "video",
    summary: "Tips Jualan laris di shoope untuk shoope seller pemula !",
    link: "https://youtu.be/QLl0IxupfN8?si=HIUU4UH4y1qGdcRq",
  },
  {
    id: "c3",
    title: "Belajar Copywriting",
    category: "copywriting",
    type: "artikel",
    summary: "Belajar Copywriting untuk pemula secara lengkap !",
    link: "https://youtu.be/w7drAXsN8xA?si=H1xLZvI-1cP-904B",
  },
  {
    id: "c4",
    title: "Excel buat Anak Kos",
    category: "produktif",
    type: "video",
    summary:
      "Cara membuat laporan kas masuk dan keluar harian dengan menggunakan Excel !",
    link: "https://youtu.be/hf_RgfZCZ-g?si=WwXd6V85t0fxyOeQ",
  },
  {
    id: "c5",
    title: "Website buat freelancer",
    category: "produktif",
    type: "video",
    summary: "Rekomadasi situs/ website buat nyari kerjaan freelance",
    link: "https://youtu.be/g0k_v-I0P8o?si=EM5LmWXyzyq7m4xN",
  },
];

export function formatLocalDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
