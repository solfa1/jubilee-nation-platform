import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const event = await prisma.event.upsert({
    where: {
      slug: "festival-of-glory-2026",
    },
    update: {},
    create: {
      name: "Festival of Glory 2026",
      slug: "festival-of-glory-2026",
      description:
        "Festival of Glory 2026 is a Jubilee Nation programme for worship, testimonies, community engagement, and spiritual growth.",
      startDate: new Date("2026-01-01T00:00:00.000Z"),
      endDate: new Date("2026-01-01T23:59:59.000Z"),
      status: "PUBLISHED",
    },
  });

  console.log("Event created:", event);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });