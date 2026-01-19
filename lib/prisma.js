import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log("✅ Prisma successfully connected to database"))
  .catch((error) => console.error("❌ Prisma connection error", error));

export default prisma;