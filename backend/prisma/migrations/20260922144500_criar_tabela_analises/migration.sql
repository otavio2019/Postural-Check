-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "StatusAnalise" AS ENUM ('IMAGENS_ARMAZENADAS', 'PROCESSANDO', 'CONCLUIDA', 'ERRO');

-- CreateTable
CREATE TABLE "analises" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "idade" INTEGER NOT NULL,
    "observacoes" VARCHAR(500),
    "imagemFrentePath" VARCHAR(255) NOT NULL,
    "imagemLateralPath" VARCHAR(255) NOT NULL,
    "imagemCostasPath" VARCHAR(255) NOT NULL,
    "status" "StatusAnalise" NOT NULL DEFAULT 'IMAGENS_ARMAZENADAS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analises_status_idx" ON "analises"("status");

-- CreateIndex
CREATE INDEX "analises_createdAt_idx" ON "analises"("createdAt");

