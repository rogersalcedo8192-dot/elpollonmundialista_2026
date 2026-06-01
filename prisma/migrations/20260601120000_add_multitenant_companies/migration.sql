-- Multitenant companies and invitations.
-- Reversible: this migration only adds nullable fields and new tables.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "companyId" TEXT;

CREATE TABLE IF NOT EXISTS "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logo" TEXT,
  "adminId" TEXT,
  "maxPlayers" INTEGER NOT NULL DEFAULT 50,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CompanyInvitation" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL,
  "usedBy" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "usedAt" TIMESTAMP(3),
  CONSTRAINT "CompanyInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Company_slug_key" ON "Company"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Company_adminId_key" ON "Company"("adminId");
CREATE UNIQUE INDEX IF NOT EXISTS "CompanyInvitation_token_key" ON "CompanyInvitation"("token");

ALTER TABLE "User"
  ADD CONSTRAINT "User_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Company"
  ADD CONSTRAINT "Company_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CompanyInvitation"
  ADD CONSTRAINT "CompanyInvitation_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyInvitation"
  ADD CONSTRAINT "CompanyInvitation_createdBy_fkey"
  FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompanyInvitation"
  ADD CONSTRAINT "CompanyInvitation_usedBy_fkey"
  FOREIGN KEY ("usedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
