import { prisma } from '../db.js'

export interface SourceData {
  title: string
  content: string
}

export interface SourceResponse {
  id: string
  title: string
  content: string
  createdAt: Date
}

export async function createSource(data: SourceData): Promise<SourceResponse> {
  return prisma.source.create({ data })
}

export async function getAllSources(): Promise<SourceResponse[]> {
  return prisma.source.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function getSourceById(id: string): Promise<SourceResponse | null> {
  return prisma.source.findUnique({ where: { id } })
}

export async function deleteSource(id: string): Promise<SourceResponse> {
  return prisma.source.delete({ where: { id } })
}
