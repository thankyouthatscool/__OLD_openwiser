import { PrismaClient } from "@prisma/client";

export * from "./updateDatabaseClippings.js";
export * from "./updateDatabaseSources.js";

export const prisma = new PrismaClient();
