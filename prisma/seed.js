import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const seedUser = await prisma.userProfile.upsert({
        where: { supabaseId: "00000000-0000-0000-0000-000000000000" },
        update: {
            displayName: "Contoh Pengguna",
            email: "user@example.com",
        },
        create: {
            supabaseId: "00000000-0000-0000-0000-000000000000",
            displayName: "Contoh Pengguna",
            email: "user@example.com",
            role: "user",
        },
    })

    await prisma.wellnessEntry.deleteMany({ where: { userId: seedUser.id } })

    const sampleEntries = [
        {
            title: "Sarapan oatmeal hemat",
            description: "Oat instan + susu UHT + pisang, siap dalam 6 menit.",
            mood: "energized",
            occurredAt: new Date(),
            userId: seedUser.id,
        },
        {
            title: "Workout kardio ringan",
            description: "Jogging 20 menit keliling komplek kos.",
            mood: "motivated",
            occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
            userId: seedUser.id,
        },
        {
            title: "Belajar sesi malam",
            description: "Review materi kalkulus selama 45 menit.",
            mood: "focused",
            occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            userId: seedUser.id,
        },
    ]

    await prisma.wellnessEntry.createMany({
        data: sampleEntries,
    })
}

main()
    .catch((error) => {
        console.error("Gagal menjalankan seed Prisma:", error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
