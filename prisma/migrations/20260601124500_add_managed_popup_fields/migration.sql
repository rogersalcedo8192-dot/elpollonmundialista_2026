ALTER TABLE "TorneoConfig" ADD COLUMN "popupEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TorneoConfig" ADD COLUMN "popupTitle" TEXT;
ALTER TABLE "TorneoConfig" ADD COLUMN "popupMessage" TEXT;
ALTER TABLE "TorneoConfig" ADD COLUMN "popupCtaLabel" TEXT;
ALTER TABLE "TorneoConfig" ADD COLUMN "popupCtaTab" TEXT;
