CREATE TABLE "LigaMillonariosModule" (
    "id" TEXT NOT NULL DEFAULT 'liga-betplay-ii-2026-millonarios',
    "state" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LigaMillonariosModule_pkey" PRIMARY KEY ("id")
);
