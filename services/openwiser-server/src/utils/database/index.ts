import { PrismaClient } from "@prisma/client";

export * from "./updateKindleClippings.js";
export * from "./updateSources.js";

export const prisma = new PrismaClient();
