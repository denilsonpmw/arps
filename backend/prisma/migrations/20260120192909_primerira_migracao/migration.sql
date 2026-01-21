-- CreateTable
CREATE TABLE "Ata" (
    "id" TEXT NOT NULL,
    "nup" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "arpNumero" TEXT NOT NULL,
    "orgaoGerenciador" TEXT NOT NULL,
    "objeto" TEXT NOT NULL,
    "vigenciaFinal" TIMESTAMP(3) NOT NULL,
    "valorTotal" DECIMAL(65,30) NOT NULL,
    "valorAdesao" DECIMAL(65,30) NOT NULL,
    "saldoDisponivel" DECIMAL(65,30) NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adesao" (
    "id" TEXT NOT NULL,
    "ataId" TEXT NOT NULL,
    "numeroIdentificador" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "orgaoAderente" TEXT NOT NULL,
    "valorAderido" DECIMAL(65,30) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Adesao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Ata_nup_key" ON "Ata"("nup");

-- CreateIndex
CREATE UNIQUE INDEX "Ata_arpNumero_key" ON "Ata"("arpNumero");

-- CreateIndex
CREATE INDEX "Ata_orgaoGerenciador_idx" ON "Ata"("orgaoGerenciador");

-- CreateIndex
CREATE INDEX "Ata_vigenciaFinal_idx" ON "Ata"("vigenciaFinal");

-- CreateIndex
CREATE INDEX "Ata_ativa_idx" ON "Ata"("ativa");

-- CreateIndex
CREATE INDEX "Adesao_ataId_idx" ON "Adesao"("ataId");

-- CreateIndex
CREATE INDEX "Adesao_orgaoAderente_idx" ON "Adesao"("orgaoAderente");

-- CreateIndex
CREATE INDEX "Adesao_data_idx" ON "Adesao"("data");

-- CreateIndex
CREATE UNIQUE INDEX "Adesao_ataId_numeroIdentificador_key" ON "Adesao"("ataId", "numeroIdentificador");

-- AddForeignKey
ALTER TABLE "Adesao" ADD CONSTRAINT "Adesao_ataId_fkey" FOREIGN KEY ("ataId") REFERENCES "Ata"("id") ON DELETE CASCADE ON UPDATE CASCADE;
