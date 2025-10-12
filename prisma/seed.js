import { PrismaClient } from "@prisma/client"
import { COURSES, RECIPES, WORKOUTS } from "../lib/data.js"

function resolveSeedDatabaseUrl() {
    const seedUrl =
        process.env.PRISMA_SEED_DATABASE_URL ||
        process.env.DIRECT_URL ||
        process.env.DATABASE_URL

    if (!seedUrl) {
        throw new Error(
            "DATABASE_URL tidak ditemukan. Pastikan variabel lingkungan Prisma sudah diatur sebelum menjalankan seed."
        )
    }

    try {
        const parsed = new URL(seedUrl)

        // Supabase (dan sebagian besar Postgres terkelola) memerlukan SSL.
        if (parsed.hostname.includes("supabase.com") && !parsed.searchParams.has("sslmode")) {
            parsed.searchParams.set("sslmode", "require")
        }

        // Saat memakai port pooler Supabase (6543), tambahkan flag pgbouncer agar koneksi stabil.
        if (parsed.hostname.includes("supabase.com") && parsed.port === "6543" && !parsed.searchParams.has("pgbouncer")) {
            parsed.searchParams.set("pgbouncer", "true")
        }

        return parsed.toString()
    } catch (error) {
        // Jika URL tidak valid, tetap kembalikan nilai awal supaya Prisma yang melemparkan error deskriptif.
        return seedUrl
    }
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: resolveSeedDatabaseUrl(),
        },
    },
})

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
            preferences: ["murah", "cepat"],
        },
    })

    await Promise.all(
        RECIPES.map((recipe) =>
            prisma.recipe.upsert({
                where: { id: recipe.id },
                update: {
                    name: recipe.name,
                    estCost: recipe.estCost,
                    categories: recipe.categories,
                    nutrients: recipe.nutrients,
                    ingredients: recipe.ingredients,
                    howto: recipe.howto,
                    image: recipe.image,
                },
                create: {
                    id: recipe.id,
                    name: recipe.name,
                    estCost: recipe.estCost,
                    categories: recipe.categories,
                    nutrients: recipe.nutrients,
                    ingredients: recipe.ingredients,
                    howto: recipe.howto,
                    image: recipe.image,
                },
            })
        )
    )

    await Promise.all(
        WORKOUTS.map((workout) =>
            prisma.workout.upsert({
                where: { id: workout.id },
                update: {
                    name: workout.name,
                    moves: workout.moves,
                },
                create: {
                    id: workout.id,
                    name: workout.name,
                    moves: workout.moves,
                },
            })
        )
    )

    await Promise.all(
        COURSES.map((course) =>
            prisma.learningResource.upsert({
                where: { id: course.id },
                update: {
                    title: course.title,
                    category: course.category,
                    type: course.type,
                    summary: course.summary,
                    link: course.link,
                },
                create: {
                    id: course.id,
                    title: course.title,
                    category: course.category,
                    type: course.type,
                    summary: course.summary,
                    link: course.link,
                },
            })
        )
    )

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
