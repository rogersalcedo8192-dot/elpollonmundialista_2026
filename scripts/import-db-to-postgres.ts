import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dbFile = path.join(process.cwd(), "db_store.json");

function asDate(value: string | undefined | null, fallback = new Date()) {
  if (!value) return fallback;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL no esta configurada. Copia la URL de Postgres de Railway en tu .env.local o entorno.");
  }

  if (!fs.existsSync(dbFile)) {
    throw new Error(`No se encontro ${dbFile}`);
  }

  const raw = fs.readFileSync(dbFile, "utf-8");
  const db = JSON.parse(raw);
  const users = db.users || [];
  const userIds = new Set(users.map((user: any) => user.id));

  await prisma.$transaction(async (tx) => {
    await tx.asset.deleteMany();
    await tx.sponsorBanner.deleteMany();
    await tx.tournamentPrediction.deleteMany();
    await tx.tournamentOutcome.deleteMany();
    await tx.sentReminder.deleteMany();
    await tx.notification.deleteMany();
    await tx.announcement.deleteMany();
    await tx.ranking.deleteMany();
    await tx.prediction.deleteMany();
    await tx.match.deleteMany();
    await tx.user.deleteMany();
    await tx.torneoConfig.deleteMany();

    await tx.torneoConfig.create({
      data: {
        id: "default",
        title: db.torneo.title,
        description: db.torneo.description,
        timezone: db.torneo.timezone,
        allowPublicRegistration: Boolean(db.torneo.allowPublicRegistration),
        welcomeMessage: db.torneo.welcomeMessage,
        rulesText: db.torneo.rulesText,
        prizesText: db.torneo.prizesText,
        rulesImageUrl: db.torneo.rulesImageUrl || null,
        rulesImageUrlEn: db.torneo.rulesImageUrlEn || null,
        notificationConfig: db.torneo.notificationConfig || {}
      }
    });

    if (users.length > 0) {
      await tx.user.createMany({
        data: users.map((user: any) => ({
          id: user.id,
          email: user.email,
          password: user.password || null,
          name: user.name,
          role: user.role,
          status: user.status,
          avatar: user.avatar,
          points: user.points || 0,
          exactCount: user.exactCount || 0,
          drawCount: user.drawCount || 0,
          predictCount: user.predictCount || 0,
          historyPoints: user.historyPoints || [0],
          emailSubscribed: Boolean(user.emailSubscribed),
          paymentStatus: user.paymentStatus || "pending",
          paidAt: user.paidAt ? asDate(user.paidAt) : null,
          stripeCheckoutSessionId: user.stripeCheckoutSessionId || null,
          stripePaymentIntentId: user.stripePaymentIntentId || null,
          groupPoints: user.groupPoints ?? null,
          knockoutPoints: user.knockoutPoints ?? null,
          finalistPoints: user.finalistPoints ?? null,
          subchampionPoints: user.subchampionPoints ?? null,
          championPoints: user.championPoints ?? null,
          totalBonusPoints: user.totalBonusPoints ?? null
        }))
      });
    }

    if ((db.matches || []).length > 0) {
      await tx.match.createMany({
        data: db.matches.map((match: any) => ({
          id: match.id,
          stage: match.stage,
          local: match.local,
          visitor: match.visitor,
          date: asDate(match.date),
          stadium: match.stadium,
          status: match.status,
          localScore: match.localScore ?? null,
          visitorScore: match.visitorScore ?? null,
          externalSource: match.externalSource || null,
          externalSourceId: match.externalSourceId || null
        }))
      });
    }

    if ((db.predictions || []).length > 0) {
      await tx.prediction.createMany({
        data: db.predictions.map((prediction: any) => ({
          id: prediction.id,
          userId: prediction.userId,
          matchId: prediction.matchId,
          localScore: prediction.localScore,
          visitorScore: prediction.visitorScore,
          pointsEarned: prediction.pointsEarned ?? null,
          reason: prediction.reason ?? null,
          dateCreated: asDate(prediction.dateCreated)
        }))
      });
    }

    if ((db.rankings || []).length > 0) {
      await tx.ranking.createMany({
        data: db.rankings.map((ranking: any) => ({
          id: `ranking-${ranking.userId}`,
          userId: ranking.userId,
          userName: ranking.userName,
          userAvatar: ranking.userAvatar,
          points: ranking.points,
          exactCount: ranking.exactCount,
          drawCount: ranking.drawCount,
          predictCount: ranking.predictCount,
          position: ranking.position,
          prevPosition: ranking.prevPosition,
          shift: ranking.shift,
          groupPoints: ranking.groupPoints ?? null,
          knockoutPoints: ranking.knockoutPoints ?? null,
          finalistPoints: ranking.finalistPoints ?? null,
          subchampionPoints: ranking.subchampionPoints ?? null,
          championPoints: ranking.championPoints ?? null,
          totalBonusPoints: ranking.totalBonusPoints ?? null
        }))
      });
    }

    if ((db.announcements || []).length > 0) {
      await tx.announcement.createMany({
        data: db.announcements.map((announcement: any) => ({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          date: asDate(announcement.date),
          urgent: Boolean(announcement.urgent),
          publishAt: announcement.publishAt ? asDate(announcement.publishAt) : null
        }))
      });
    }

    if ((db.notifications || []).length > 0) {
      await tx.notification.createMany({
        data: db.notifications.map((notification: any) => ({
          id: notification.id,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          date: asDate(notification.date),
          read: Boolean(notification.read)
        }))
      });
    }

    if ((db.sentReminders || []).length > 0) {
      await tx.sentReminder.createMany({
        data: db.sentReminders.map((key: string) => ({ key }))
      });
    }

    if ((db.tournamentPredictions || []).length > 0) {
      await tx.tournamentPrediction.createMany({
        data: db.tournamentPredictions.map((prediction: any) => ({
          userId: prediction.userId,
          groupWinners: prediction.groupWinners || {},
          octavosTeams: prediction.octavosTeams || [],
          cuartosTeams: prediction.cuartosTeams || [],
          semifinalTeams: prediction.semifinalTeams || [],
          finalists: prediction.finalists || [],
          subchampion: prediction.subchampion || "",
          champion: prediction.champion || "",
          lastUpdated: prediction.lastUpdated ? asDate(prediction.lastUpdated) : null
        }))
      });
    }

    if (db.tournamentOutcomes) {
      await tx.tournamentOutcome.create({
        data: {
          id: "default",
          groupWinners: db.tournamentOutcomes.groupWinners || {},
          octavosTeams: db.tournamentOutcomes.octavosTeams || [],
          cuartosTeams: db.tournamentOutcomes.cuartosTeams || [],
          semifinalTeams: db.tournamentOutcomes.semifinalTeams || [],
          finalists: db.tournamentOutcomes.finalists || [],
          subchampion: db.tournamentOutcomes.subchampion || "",
          champion: db.tournamentOutcomes.champion || ""
        }
      });
    }

    if ((db.assets || []).length > 0) {
      await tx.asset.createMany({
        data: db.assets.map((asset: any) => ({
          id: asset.id,
          originalName: asset.originalName,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          type: asset.type,
          size: asset.size,
          url: asset.url,
          uploadedBy: userIds.has(asset.uploadedBy) ? asset.uploadedBy : null,
          uploadedAt: asDate(asset.uploadedAt),
          storageProvider: asset.storageProvider || "local",
          publicId: asset.publicId || null,
          resourceType: asset.resourceType || null
        }))
      });
    }

    if ((db.sponsorBanners || []).length > 0) {
      await tx.sponsorBanner.createMany({
        data: db.sponsorBanners.map((banner: any) => ({
          id: banner.id,
          title: banner.title,
          sponsorName: banner.sponsorName,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl || null,
          placement: banner.placement,
          active: Boolean(banner.active),
          rotationSeconds: banner.rotationSeconds === 10 ? 10 : 5,
          startsAt: banner.startsAt ? asDate(banner.startsAt) : null,
          endsAt: banner.endsAt ? asDate(banner.endsAt) : null,
          createdAt: asDate(banner.createdAt),
          updatedAt: asDate(banner.updatedAt)
        }))
      });
    }
  });

  console.log("Importacion completada: db_store.json -> PostgreSQL");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
