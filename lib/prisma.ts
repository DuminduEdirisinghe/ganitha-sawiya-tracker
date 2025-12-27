import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma_ganitha: PrismaClient }

export const prisma = globalForPrisma.prisma_ganitha || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_ganitha = prisma
