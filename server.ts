import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

interface TorneoConfig {
  title: string;
  description: string;
  timezone: string;
  allowPublicRegistration: boolean;
  welcomeMessage: string;
  rulesText: string;
  prizesText: string;
  rulesImageUrl?: string;
  rulesImageUrlEn?: string;
  notificationConfig: {
    reminders: boolean;
    results: boolean;
    rankingChanges: boolean;
    announcements: boolean;
  };
}

interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: "admin" | "standard";
  status: "active" | "suspended";
  avatar: string;
  points: number;
  exactCount: number;
  drawCount: number;
  predictCount: number;
  historyPoints: number[]; // Points over time (e.g. index represents matches finalized)
  emailSubscribed: boolean;
  paymentStatus?: "pending" | "paid" | "failed";
  paidAt?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  groupPoints?: number;
  knockoutPoints?: number;
  finalistPoints?: number;
  subchampionPoints?: number;
  championPoints?: number;
  totalBonusPoints?: number;
}

interface TournamentPredictions {
  userId: string;
  groupWinners: Record<string, string>;
  octavosTeams: string[];
  cuartosTeams: string[];
  semifinalTeams: string[];
  finalists: string[];
  subchampion: string;
  champion: string;
  lastUpdated: string;
}

interface TournamentOutcomes {
  groupWinners: Record<string, string>;
  octavosTeams: string[];
  cuartosTeams: string[];
  semifinalTeams: string[];
  finalists: string[];
  subchampion: string;
  champion: string;
}

interface Match {
  id: number;
  stage: string; // 'Grupo A', '16avos de Final', etc.
  local: string;
  visitor: string;
  date: string; // ISO String UTC
  stadium: string;
  status: "pending" | "in_progress" | "finished";
  localScore: number | null;
  visitorScore: number | null;
  externalSource?: string;
  externalSourceId?: string;
}

interface KnockoutFixture {
  id: number;
  stage: "16avos de Final" | "Octavos de Final" | "Cuartos de Final" | "Semifinal" | "Tercer Puesto" | "Final";
  dateLabel: string;
  localSlot: string;
  visitorSlot: string;
  stadium: string;
}

interface Prediction {
  id: string;
  userId: string;
  matchId: number;
  localScore: number;
  visitorScore: number;
  pointsEarned: number | null;
  reason: "exact" | "draw" | "participation" | null;
  dateCreated: string;
}

interface Ranking {
  userId: string;
  userName: string;
  userAvatar: string;
  points: number;
  exactCount: number;
  drawCount: number;
  predictCount: number;
  position: number;
  prevPosition: number;
  shift: "up" | "down" | "equal";
  groupPoints?: number;
  knockoutPoints?: number;
  finalistPoints?: number;
  subchampionPoints?: number;
  championPoints?: number;
  totalBonusPoints?: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  urgent: boolean;
  publishAt?: string; // Optional scheduling date
}

interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "reminder" | "result" | "ranking" | "announcement";
  date: string;
  read: boolean;
}

interface UploadedAsset {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  type: "image" | "video" | "pdf" | "document" | "other";
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  storageProvider?: "local" | "cloudinary";
  publicId?: string;
  resourceType?: "image" | "video" | "raw";
}

interface SponsorBanner {
  id: string;
  title: string;
  sponsorName: string;
  imageUrl: string;
  linkUrl?: string;
  placement: "home_top" | "sidebar" | "rules";
  active: boolean;
  rotationSeconds: 5 | 10;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseSchema {
  torneo: TorneoConfig;
  users: User[];
  matches: Match[];
  predictions: Prediction[];
  rankings: Ranking[];
  announcements: Announcement[];
  notifications: AppNotification[];
  sentReminders: string[]; // key: userId + "_" + matchId
  tournamentPredictions?: TournamentPredictions[];
  tournamentOutcomes?: TournamentOutcomes;
  assets?: UploadedAsset[];
  sponsorBanners?: SponsorBanner[];
}

const DB_FILE = path.join(process.cwd(), "db_store.json");
const ASSETS_DIR = path.join(process.cwd(), "assets", "assets");
const prisma = process.env.DATABASE_URL ? new PrismaClient() : null;
let postgresPersistTimer: NodeJS.Timeout | null = null;

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const FOOTBALL_DATA_SOURCE = "football-data.org";
const ENTRY_FEE_USD = 25;
const ENTRY_FEE_CENTS = ENTRY_FEE_USD * 100;
const BANK_COMMISSION_RATE = 0.035;
const PRIZE_POOL_RATE = 0.7;
const OWNER_PROFIT_RATE = 0.3;
const FIRST_PLACE_RATE = 0.8;
const SECOND_PLACE_RATE = 0.15;
const THIRD_PLACE_RATE = 0.05;

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function calculatePrizePool(paidParticipants: number) {
  const grossPool = paidParticipants * ENTRY_FEE_USD;
  const bankCommission = grossPool * BANK_COMMISSION_RATE;
  const prizePool = grossPool * PRIZE_POOL_RATE;
  const ownerGrossProfit = grossPool * OWNER_PROFIT_RATE;
  const ownerNetProfit = ownerGrossProfit - bankCommission;

  return {
    entryFeeUsd: ENTRY_FEE_USD,
    paidParticipants,
    grossPool: roundMoney(grossPool),
    bankCommissionRate: BANK_COMMISSION_RATE,
    bankCommission: roundMoney(bankCommission),
    netPool: roundMoney(grossPool - bankCommission),
    prizePoolRate: PRIZE_POOL_RATE,
    prizePool: roundMoney(prizePool),
    ownerProfitRate: OWNER_PROFIT_RATE,
    ownerGrossProfit: roundMoney(ownerGrossProfit),
    ownerProfit: roundMoney(ownerNetProfit),
    payouts: {
      first: roundMoney(prizePool * FIRST_PLACE_RATE),
      second: roundMoney(prizePool * SECOND_PLACE_RATE),
      third: roundMoney(prizePool * THIRD_PLACE_RATE)
    },
    payoutRates: {
      first: FIRST_PLACE_RATE,
      second: SECOND_PLACE_RATE,
      third: THIRD_PLACE_RATE
    }
  };
}

function getRequestOrigin(req: express.Request) {
  const configuredUrl = process.env.PUBLIC_APP_URL || process.env.APP_URL || process.env.RAILWAY_PUBLIC_DOMAIN;
  if (configuredUrl) {
    return configuredUrl.startsWith("http") ? configuredUrl : `https://${configuredUrl}`;
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  return `${proto}://${req.get("host")}`;
}

async function stripeRequest(pathname: string, params?: URLSearchParams, method = "POST") {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Falta configurar STRIPE_SECRET_KEY en Railway.");
  }

  const response = await fetch(`https://api.stripe.com/v1/${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      ...(params ? { "Content-Type": "application/x-www-form-urlencoded" } : {})
    },
    body: params
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || "Stripe no pudo procesar la solicitud.");
  }
  return payload;
}

function markUserAsPaid(user: User, session: any) {
  user.paymentStatus = "paid";
  user.paidAt = new Date().toISOString();
  user.stripeCheckoutSessionId = session.id || user.stripeCheckoutSessionId;
  user.stripePaymentIntentId = session.payment_intent || user.stripePaymentIntentId;
}

const KNOCKOUT_FIXTURES: KnockoutFixture[] = [
  { id: 73, stage: "16avos de Final", dateLabel: "Domingo, 28 de junio 2026", localSlot: "2º Grupo A", visitorSlot: "2º Grupo B", stadium: "Estadio Los Ángeles" },
  { id: 74, stage: "16avos de Final", dateLabel: "Lunes, 29 de junio 2026", localSlot: "1º Grupo E", visitorSlot: "3º Grupo A/B/C/D/F", stadium: "Estadio Boston" },
  { id: 75, stage: "16avos de Final", dateLabel: "Lunes, 29 de junio 2026", localSlot: "1º Grupo F", visitorSlot: "2º Grupo C", stadium: "Estadio Monterrey" },
  { id: 76, stage: "16avos de Final", dateLabel: "Lunes, 29 de junio 2026", localSlot: "1º Grupo C", visitorSlot: "2º Grupo F", stadium: "Estadio Houston" },
  { id: 77, stage: "16avos de Final", dateLabel: "Martes, 30 de junio 2026", localSlot: "1º Grupo I", visitorSlot: "3º Grupo C/D/F/G/H", stadium: "Estadio Nueva York Nueva Jersey" },
  { id: 78, stage: "16avos de Final", dateLabel: "Martes, 30 de junio 2026", localSlot: "2º Grupo E", visitorSlot: "2º Grupo I", stadium: "Estadio Dallas" },
  { id: 79, stage: "16avos de Final", dateLabel: "Martes, 30 de junio 2026", localSlot: "1º Grupo A", visitorSlot: "3º Grupo C/E/F/H/I", stadium: "Estadio Ciudad de México" },
  { id: 80, stage: "16avos de Final", dateLabel: "Miércoles, 1 de julio 2026", localSlot: "1º Grupo L", visitorSlot: "3º Grupo E/H/I/J/K", stadium: "Estadio Atlanta" },
  { id: 81, stage: "16avos de Final", dateLabel: "Miércoles, 1 de julio 2026", localSlot: "1º Grupo D", visitorSlot: "3º Grupo B/E/F/I/J", stadium: "Estadio Bahía de San Francisco" },
  { id: 82, stage: "16avos de Final", dateLabel: "Miércoles, 1 de julio 2026", localSlot: "1º Grupo G", visitorSlot: "3º Grupo A/E/H/I/J", stadium: "Estadio Seattle" },
  { id: 83, stage: "16avos de Final", dateLabel: "Jueves, 2 de julio 2026", localSlot: "2º Grupo K", visitorSlot: "2º Grupo L", stadium: "Estadio Toronto" },
  { id: 84, stage: "16avos de Final", dateLabel: "Jueves, 2 de julio 2026", localSlot: "1º Grupo H", visitorSlot: "2º Grupo J", stadium: "Estadio Los Ángeles" },
  { id: 85, stage: "16avos de Final", dateLabel: "Jueves, 2 de julio 2026", localSlot: "1º Grupo B", visitorSlot: "3º Grupo E/F/G/I/J", stadium: "Estadio BC Place Vancouver" },
  { id: 86, stage: "16avos de Final", dateLabel: "Viernes, 3 de julio 2026", localSlot: "1º Grupo J", visitorSlot: "2º Grupo H", stadium: "Estadio Miami" },
  { id: 87, stage: "16avos de Final", dateLabel: "Viernes, 3 de julio 2026", localSlot: "1º Grupo K", visitorSlot: "3º Grupo D/E/I/J/L", stadium: "Estadio Kansas City" },
  { id: 88, stage: "16avos de Final", dateLabel: "Viernes, 3 de julio 2026", localSlot: "2º Grupo D", visitorSlot: "2º Grupo G", stadium: "Estadio Dallas" },
  { id: 89, stage: "Octavos de Final", dateLabel: "Sábado, 4 de julio 2026", localSlot: "Ganador Partido 74", visitorSlot: "Ganador Partido 77", stadium: "Estadio Filadelfia" },
  { id: 90, stage: "Octavos de Final", dateLabel: "Sábado, 4 de julio 2026", localSlot: "Ganador Partido 73", visitorSlot: "Ganador Partido 75", stadium: "Estadio Houston" },
  { id: 91, stage: "Octavos de Final", dateLabel: "Domingo, 5 de julio 2026", localSlot: "Ganador Partido 76", visitorSlot: "Ganador Partido 78", stadium: "Estadio Nueva York Nueva Jersey" },
  { id: 92, stage: "Octavos de Final", dateLabel: "Domingo, 5 de julio 2026", localSlot: "Ganador Partido 79", visitorSlot: "Ganador Partido 80", stadium: "Estadio Ciudad de México" },
  { id: 93, stage: "Octavos de Final", dateLabel: "Lunes, 6 de julio 2026", localSlot: "Ganador Partido 83", visitorSlot: "Ganador Partido 84", stadium: "Estadio Dallas" },
  { id: 94, stage: "Octavos de Final", dateLabel: "Lunes, 6 de julio 2026", localSlot: "Ganador Partido 81", visitorSlot: "Ganador Partido 82", stadium: "Estadio Seattle" },
  { id: 95, stage: "Octavos de Final", dateLabel: "Martes, 7 de julio 2026", localSlot: "Ganador Partido 86", visitorSlot: "Ganador Partido 88", stadium: "Estadio Atlanta" },
  { id: 96, stage: "Octavos de Final", dateLabel: "Martes, 7 de julio 2026", localSlot: "Ganador Partido 85", visitorSlot: "Ganador Partido 87", stadium: "Estadio BC Place Vancouver" },
  { id: 97, stage: "Cuartos de Final", dateLabel: "Jueves, 9 de julio 2026", localSlot: "Ganador Partido 89", visitorSlot: "Ganador Partido 90", stadium: "Estadio Boston" },
  { id: 98, stage: "Cuartos de Final", dateLabel: "Viernes, 10 de julio 2026", localSlot: "Ganador Partido 93", visitorSlot: "Ganador Partido 94", stadium: "Estadio Los Ángeles" },
  { id: 99, stage: "Cuartos de Final", dateLabel: "Sábado, 11 de julio 2026", localSlot: "Ganador Partido 91", visitorSlot: "Ganador Partido 92", stadium: "Estadio Miami" },
  { id: 100, stage: "Cuartos de Final", dateLabel: "Sábado, 11 de julio 2026", localSlot: "Ganador Partido 95", visitorSlot: "Ganador Partido 96", stadium: "Estadio Kansas City" },
  { id: 101, stage: "Semifinal", dateLabel: "Martes, 14 de julio 2026", localSlot: "Ganador Partido 97", visitorSlot: "Ganador Partido 98", stadium: "Estadio Dallas" },
  { id: 102, stage: "Semifinal", dateLabel: "Miércoles, 15 de julio 2026", localSlot: "Ganador Partido 99", visitorSlot: "Ganador Partido 100", stadium: "Estadio Atlanta" },
  { id: 103, stage: "Tercer Puesto", dateLabel: "Sábado, 18 de julio 2026", localSlot: "Perdedor Partido 101", visitorSlot: "Perdedor Partido 102", stadium: "Estadio Miami" },
  { id: 104, stage: "Final", dateLabel: "Domingo, 19 de julio 2026", localSlot: "Ganador Partido 101", visitorSlot: "Ganador Partido 102", stadium: "Estadio Nueva York Nueva Jersey" }
];

const FOOTBALL_DATA_TEAM_NAME_MAP: Record<string, string> = {
  "Argentina": "Argentina",
  "Australia": "Australia",
  "Austria": "Austria",
  "Belgium": "Bélgica",
  "Brazil": "Brasil",
  "Cameroon": "Camerún",
  "Canada": "Canadá",
  "Cape Verde Islands": "Cabo Verde",
  "Cape Verde": "Cabo Verde",
  "Chile": "Chile",
  "Colombia": "Colombia",
  "Costa Rica": "Costa Rica",
  "Côte d'Ivoire": "Costa de Marfil",
  "Cote d'Ivoire": "Costa de Marfil",
  "Ivory Coast": "Costa de Marfil",
  "Croatia": "Croacia",
  "Czechia": "Rep. Checa",
  "Czech Republic": "Rep. Checa",
  "Denmark": "Dinamarca",
  "Ecuador": "Ecuador",
  "Egypt": "Egipto",
  "England": "Inglaterra",
  "France": "Francia",
  "Germany": "Alemania",
  "Ghana": "Ghana",
  "Iran": "RI de Irán",
  "IR Iran": "RI de Irán",
  "Iraq": "Irak",
  "Italy": "Italia",
  "Japan": "Japón",
  "Jordan": "Jordania",
  "Korea Republic": "Rep. de Corea",
  "Korea, Republic of": "Rep. de Corea",
  "South Korea": "Rep. de Corea",
  "Mexico": "México",
  "Morocco": "Marruecos",
  "Netherlands": "Países Bajos",
  "New Zealand": "Nueva Zelanda",
  "Nigeria": "Nigeria",
  "Norway": "Noruega",
  "Panama": "Panamá",
  "Paraguay": "Paraguay",
  "Poland": "Polonia",
  "Portugal": "Portugal",
  "Qatar": "Catar",
  "Saudi Arabia": "Arabia Saudí",
  "Scotland": "Escocia",
  "Senegal": "Senegal",
  "South Africa": "Sudáfrica",
  "Spain": "España",
  "Sweden": "Suecia",
  "Switzerland": "Suiza",
  "Tunisia": "Túnez",
  "Turkey": "Turquía",
  "Türkiye": "Turquía",
  "Ukraine": "Ucrania",
  "Uzbekistan": "Uzbekistán",
  "United States": "Estados Unidos",
  "USA": "Estados Unidos",
  "Uruguay": "Uruguay",
  "Venezuela": "Venezuela",
  "Bosnia-Herzegovina": "Bosnia y Herzegovina",
  "Bosnia and Herzegovina": "Bosnia y Herzegovina",
  "Haiti": "Haití",
  "Curaçao": "Curazao",
  "Curacao": "Curazao",
  "Algeria": "Argelia",
  "Congo DR": "RD Congo",
  "DR Congo": "RD Congo",
  "Democratic Republic of the Congo": "RD Congo"
};

function normalizeExternalTeamName(name: string | null | undefined) {
  if (!name) return "Por definir";
  return FOOTBALL_DATA_TEAM_NAME_MAP[name] || name;
}

function normalizeFixtureTeamName(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.\-]/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

  const aliases: Record<string, string> = {
    "uzbekistan": "uzbekistan",
    "congo dr": "rd congo",
    "dr congo": "rd congo",
    "rd congo": "rd congo",
    "democratic republic of the congo": "rd congo",
    "cote d ivoire": "costa de marfil",
    "costa de marfil": "costa de marfil",
    "ivory coast": "costa de marfil",
    "usa": "estados unidos",
    "united states": "estados unidos",
    "usmnt": "estados unidos",
    "korea republic": "rep de corea",
    "republica de corea": "rep de corea",
    "corea del sur": "rep de corea",
    "iran": "ri de iran",
    "ir iran": "ri de iran",
    "paises bajos": "paises bajos",
    "netherlands": "paises bajos",
    "saudi arabia": "arabia saudi",
    "arabia saudi": "arabia saudi",
    "turkiye": "turquia",
    "turkey": "turquia"
  };

  return aliases[normalized] || normalized;
}

function getFixtureKey(match: Match) {
  const matchTime = new Date(match.date).getTime();
  const dateKey = Number.isFinite(matchTime) ? new Date(matchTime).toISOString().slice(0, 16) : match.date.slice(0, 16);
  return [
    dateKey,
    match.stage,
    normalizeFixtureTeamName(match.local),
    normalizeFixtureTeamName(match.visitor)
  ].join("|");
}

function mapFootballDataStage(stage?: string | null, group?: string | null) {
  if (stage === "GROUP_STAGE") {
    const groupLetter = group?.match(/GROUP_([A-L])/i)?.[1] || "";
    return groupLetter ? `Grupo ${groupLetter.toUpperCase()}` : "Grupo A";
  }

  const stageMap: Record<string, string> = {
    LAST_32: "16avos de Final",
    ROUND_OF_32: "16avos de Final",
    ROUND_OF_16: "Octavos de Final",
    LAST_16: "Octavos de Final",
    QUARTER_FINALS: "Cuartos de Final",
    SEMI_FINALS: "Semifinal",
    THIRD_PLACE: "Tercer Puesto",
    FINAL: "Final"
  };

  return stageMap[stage || ""] || stage || "Grupo A";
}

function mapFootballDataStatus(status?: string | null): Match["status"] {
  if (status === "FINISHED") return "finished";
  if (status === "LIVE" || status === "IN_PLAY" || status === "PAUSED") return "in_progress";
  return "pending";
}

function getFootballDataScore(match: any) {
  const fullTime = match?.score?.fullTime || {};
  return {
    localScore: typeof fullTime.home === "number" ? fullTime.home : null,
    visitorScore: typeof fullTime.away === "number" ? fullTime.away : null
  };
}

function isSameFixtureCandidate(existing: Match, incoming: Match) {
  const existingDate = new Date(existing.date).getTime();
  const incomingDate = new Date(incoming.date).getTime();
  const withinSameWindow = Number.isFinite(existingDate) && Number.isFinite(incomingDate) && Math.abs(existingDate - incomingDate) < 12 * 60 * 60 * 1000;
  return (
    withinSameWindow &&
    existing.stage === incoming.stage &&
    normalizeFixtureTeamName(existing.local) === normalizeFixtureTeamName(incoming.local) &&
    normalizeFixtureTeamName(existing.visitor) === normalizeFixtureTeamName(incoming.visitor)
  );
}

function mergeDuplicateMatches(db: DatabaseSchema) {
  const groupedMatches = new Map<string, Match[]>();
  db.matches.forEach((match) => {
    const key = getFixtureKey(match);
    const list = groupedMatches.get(key) || [];
    list.push(match);
    groupedMatches.set(key, list);
  });

  const idsToRemove = new Set<number>();
  let merged = 0;

  groupedMatches.forEach((duplicates) => {
    if (duplicates.length <= 1) return;

    duplicates.sort((a, b) => {
      const aPredictionCount = db.predictions.filter((p) => p.matchId === a.id).length;
      const bPredictionCount = db.predictions.filter((p) => p.matchId === b.id).length;
      if (aPredictionCount !== bPredictionCount) return bPredictionCount - aPredictionCount;
      const aHasVenue = a.stadium && a.stadium !== "Por definir" ? 1 : 0;
      const bHasVenue = b.stadium && b.stadium !== "Por definir" ? 1 : 0;
      if (aHasVenue !== bHasVenue) return bHasVenue - aHasVenue;
      return a.id - b.id;
    });

    const keeper = duplicates[0];
    duplicates.slice(1).forEach((duplicate) => {
      if ((!keeper.externalSource || !keeper.externalSourceId) && duplicate.externalSource && duplicate.externalSourceId) {
        keeper.externalSource = duplicate.externalSource;
        keeper.externalSourceId = duplicate.externalSourceId;
      }
      if ((!keeper.stadium || keeper.stadium === "Por definir") && duplicate.stadium && duplicate.stadium !== "Por definir") {
        keeper.stadium = duplicate.stadium;
      }
      if (duplicate.status === "finished" && keeper.status !== "finished") {
        keeper.status = duplicate.status;
        keeper.localScore = duplicate.localScore;
        keeper.visitorScore = duplicate.visitorScore;
      }

      db.predictions.forEach((prediction) => {
        if (prediction.matchId !== duplicate.id) return;
        const existingPredictionForKeeper = db.predictions.find((candidate) =>
          candidate.matchId === keeper.id && candidate.userId === prediction.userId
        );
        if (existingPredictionForKeeper) {
          prediction.matchId = -1;
        } else {
          prediction.matchId = keeper.id;
        }
      });

      idsToRemove.add(duplicate.id);
      merged += 1;
    });
  });

  if (idsToRemove.size) {
    db.matches = db.matches.filter((match) => !idsToRemove.has(match.id));
    db.predictions = db.predictions.filter((prediction) => prediction.matchId !== -1);
  }

  return merged;
}

function pruneNonApiMatches(db: DatabaseSchema) {
  const idsToRemove = new Set(
    db.matches
      .filter((match) => match.externalSource !== FOOTBALL_DATA_SOURCE || !match.externalSourceId)
      .map((match) => match.id)
  );

  if (!idsToRemove.size) {
    return { pruned: 0, predictionsRemoved: 0 };
  }

  const previousPredictionCount = db.predictions.length;
  db.matches = db.matches.filter((match) => !idsToRemove.has(match.id));
  db.predictions = db.predictions.filter((prediction) => !idsToRemove.has(prediction.matchId));

  return {
    pruned: idsToRemove.size,
    predictionsRemoved: previousPredictionCount - db.predictions.length
  };
}

function replaceMatchesWithApiSource(db: DatabaseSchema, incomingMatches: Match[]) {
  const oldMatches = [...db.matches];
  const usedOldIds = new Set<number>();
  const idRemap = new Map<number, number>();

  const matchedIncoming = [...incomingMatches]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((incoming) => {
    const existing = oldMatches.find((match) =>
      !usedOldIds.has(match.id) &&
      match.externalSource === FOOTBALL_DATA_SOURCE &&
      match.externalSourceId === incoming.externalSourceId
    ) || oldMatches.find((match) =>
      !usedOldIds.has(match.id) &&
      isSameFixtureCandidate(match, incoming)
    );

    if (!existing) {
      return { incoming, oldId: null as number | null };
    }

    usedOldIds.add(existing.id);
    return { incoming, oldId: existing.id };
  });

  const authoritativeMatches = matchedIncoming.map(({ incoming, oldId }, index) => {
    const nextId = index + 1;
    if (oldId !== null) idRemap.set(oldId, nextId);
    return { ...incoming, id: nextId };
  });

  oldMatches.forEach((oldMatch) => {
    if (usedOldIds.has(oldMatch.id)) return;
    const replacement = authoritativeMatches.find((match) => isSameFixtureCandidate(oldMatch, match));
    if (replacement) idRemap.set(oldMatch.id, replacement.id);
  });

  let predictionsRemoved = 0;
  const seenPredictions = new Set<string>();
  db.predictions = db.predictions.flatMap((prediction) => {
    const remappedMatchId = idRemap.get(prediction.matchId);
    if (!remappedMatchId) {
      predictionsRemoved += 1;
      return [];
    }

    const predictionKey = `${prediction.userId}:${remappedMatchId}`;
    if (seenPredictions.has(predictionKey)) {
      predictionsRemoved += 1;
      return [];
    }
    seenPredictions.add(predictionKey);

    return [{ ...prediction, matchId: remappedMatchId }];
  });

  const previousCount = db.matches.length;
  db.matches = authoritativeMatches;

  return {
    previousCount,
    finalCount: db.matches.length,
    removed: Math.max(0, previousCount - db.matches.length),
    predictionsRemoved
  };
}

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function ensureAssetsDir() {
  if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
  }
}

function getAssetType(mimeType: string, fileName: string): UploadedAsset["type"] {
  const lower = fileName.toLowerCase();
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType === "application/pdf" || lower.endsWith(".pdf")) return "pdf";
  if (
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".ppt") ||
    lower.endsWith(".pptx")
  ) {
    return "document";
  }
  return "other";
}

function getCloudinaryResourceType(assetType: UploadedAsset["type"]): UploadedAsset["resourceType"] {
  if (assetType === "image") return "image";
  if (assetType === "video") return "video";
  return "raw";
}

function getCloudinaryErrorMessage(err: unknown) {
  if (err instanceof Error && err.message) return err.message;
  if (err && typeof err === "object") {
    const anyErr = err as any;
    const message =
      anyErr.message ||
      anyErr.error?.message ||
      anyErr.response?.body?.error?.message ||
      anyErr.response?.text ||
      anyErr.http_code && `HTTP ${anyErr.http_code}`;

    if (message) return String(message);

    try {
      return JSON.stringify(anyErr);
    } catch {
      return String(anyErr);
    }
  }
  return String(err || "Error desconocido de Cloudinary");
}

function sanitizeFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  const base = path.basename(fileName, ext)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "asset";
  return `${base}${ext}`;
}

function createAssetRecordFromFile(fileName: string, uploadedBy = "system"): UploadedAsset {
  const filePath = path.join(ASSETS_DIR, fileName);
  const stat = fs.statSync(filePath);
  const ext = path.extname(fileName).toLowerCase();
  const mimeMap: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  };
  const mimeType = mimeMap[ext] || "application/octet-stream";
  return {
    id: `asset-${Buffer.from(fileName).toString("base64url")}`,
    originalName: fileName,
    fileName,
    mimeType,
    type: getAssetType(mimeType, fileName),
    size: stat.size,
    url: `/uploads/${encodeURIComponent(fileName)}`,
    uploadedBy,
    uploadedAt: stat.mtime.toISOString(),
    storageProvider: "local",
    resourceType: getCloudinaryResourceType(getAssetType(mimeType, fileName))
  };
}

function dateToIso(value: Date | string | null | undefined) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
}

async function loadDbFromPostgres(): Promise<DatabaseSchema | null> {
  if (!prisma) return null;

  const [
    torneo,
    users,
    matches,
    predictions,
    rankings,
    announcements,
    notifications,
    sentReminders,
    tournamentPredictions,
    tournamentOutcome,
    assets,
    sponsorBanners
  ] = await Promise.all([
    prisma.torneoConfig.findUnique({ where: { id: "default" } }),
    prisma.user.findMany(),
    prisma.match.findMany(),
    prisma.prediction.findMany(),
    prisma.ranking.findMany(),
    prisma.announcement.findMany(),
    prisma.notification.findMany(),
    prisma.sentReminder.findMany(),
    prisma.tournamentPrediction.findMany(),
    prisma.tournamentOutcome.findUnique({ where: { id: "default" } }),
    prisma.asset.findMany(),
    prisma.sponsorBanner.findMany()
  ]);

  if (!torneo) return null;

  return {
    torneo: {
      title: torneo.title,
      description: torneo.description,
      timezone: torneo.timezone,
      allowPublicRegistration: torneo.allowPublicRegistration,
      welcomeMessage: torneo.welcomeMessage,
      rulesText: torneo.rulesText,
      prizesText: torneo.prizesText,
      rulesImageUrl: torneo.rulesImageUrl || undefined,
      rulesImageUrlEn: torneo.rulesImageUrlEn || undefined,
      notificationConfig: torneo.notificationConfig as TorneoConfig["notificationConfig"]
    },
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      password: u.password || undefined,
      name: u.name,
      role: u.role as User["role"],
      status: u.status as User["status"],
      avatar: u.avatar,
      points: u.points,
      exactCount: u.exactCount,
      drawCount: u.drawCount,
      predictCount: u.predictCount,
      historyPoints: u.historyPoints as number[],
      emailSubscribed: u.emailSubscribed,
      paymentStatus: (u.paymentStatus as User["paymentStatus"]) || "pending",
      paidAt: dateToIso(u.paidAt) || undefined,
      stripeCheckoutSessionId: u.stripeCheckoutSessionId || undefined,
      stripePaymentIntentId: u.stripePaymentIntentId || undefined,
      groupPoints: u.groupPoints || undefined,
      knockoutPoints: u.knockoutPoints || undefined,
      finalistPoints: u.finalistPoints || undefined,
      subchampionPoints: u.subchampionPoints || undefined,
      championPoints: u.championPoints || undefined,
      totalBonusPoints: u.totalBonusPoints || undefined
    })),
    matches: matches.map((m) => ({
      id: m.id,
      stage: m.stage,
      local: m.local,
      visitor: m.visitor,
      date: m.date.toISOString(),
      stadium: m.stadium,
      status: m.status as Match["status"],
      localScore: m.localScore,
      visitorScore: m.visitorScore,
      externalSource: m.externalSource || undefined,
      externalSourceId: m.externalSourceId || undefined
    })),
    predictions: predictions.map((p) => ({
      id: p.id,
      userId: p.userId,
      matchId: p.matchId,
      localScore: p.localScore,
      visitorScore: p.visitorScore,
      pointsEarned: p.pointsEarned,
      reason: p.reason as Prediction["reason"],
      dateCreated: p.dateCreated.toISOString()
    })),
    rankings: rankings.map((r) => ({
      userId: r.userId,
      userName: r.userName,
      userAvatar: r.userAvatar,
      points: r.points,
      exactCount: r.exactCount,
      drawCount: r.drawCount,
      predictCount: r.predictCount,
      position: r.position,
      prevPosition: r.prevPosition,
      shift: r.shift as Ranking["shift"],
      groupPoints: r.groupPoints || undefined,
      knockoutPoints: r.knockoutPoints || undefined,
      finalistPoints: r.finalistPoints || undefined,
      subchampionPoints: r.subchampionPoints || undefined,
      championPoints: r.championPoints || undefined,
      totalBonusPoints: r.totalBonusPoints || undefined
    })),
    announcements: announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      date: a.date.toISOString(),
      urgent: a.urgent,
      publishAt: dateToIso(a.publishAt) || undefined
    })),
    notifications: notifications.map((n) => ({
      id: n.id,
      userId: n.userId,
      title: n.title,
      message: n.message,
      type: n.type as AppNotification["type"],
      date: n.date.toISOString(),
      read: n.read
    })),
    sentReminders: sentReminders.map((r) => r.key),
    tournamentPredictions: tournamentPredictions.map((tp) => ({
      userId: tp.userId,
      groupWinners: tp.groupWinners as Record<string, string>,
      octavosTeams: tp.octavosTeams as string[],
      cuartosTeams: tp.cuartosTeams as string[],
      semifinalTeams: tp.semifinalTeams as string[],
      finalists: tp.finalists as string[],
      subchampion: tp.subchampion,
      champion: tp.champion,
      lastUpdated: dateToIso(tp.lastUpdated)
    })),
    tournamentOutcomes: tournamentOutcome ? {
      groupWinners: tournamentOutcome.groupWinners as Record<string, string>,
      octavosTeams: tournamentOutcome.octavosTeams as string[],
      cuartosTeams: tournamentOutcome.cuartosTeams as string[],
      semifinalTeams: tournamentOutcome.semifinalTeams as string[],
      finalists: tournamentOutcome.finalists as string[],
      subchampion: tournamentOutcome.subchampion,
      champion: tournamentOutcome.champion
    } : {
      groupWinners: {},
      octavosTeams: [],
      cuartosTeams: [],
      semifinalTeams: [],
      finalists: [],
      subchampion: "",
      champion: ""
    },
    assets: assets.map((asset) => ({
      id: asset.id,
      originalName: asset.originalName,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      type: asset.type as UploadedAsset["type"],
      size: asset.size,
      url: asset.url,
      uploadedBy: asset.uploadedBy || "system",
      uploadedAt: asset.uploadedAt.toISOString(),
      storageProvider: asset.storageProvider as UploadedAsset["storageProvider"],
      publicId: asset.publicId || undefined,
      resourceType: asset.resourceType as UploadedAsset["resourceType"]
    })),
    sponsorBanners: sponsorBanners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      sponsorName: banner.sponsorName,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || undefined,
      placement: banner.placement as SponsorBanner["placement"],
      active: banner.active,
      rotationSeconds: banner.rotationSeconds === 10 ? 10 : 5,
      startsAt: dateToIso(banner.startsAt) || undefined,
      endsAt: dateToIso(banner.endsAt) || undefined,
      createdAt: banner.createdAt.toISOString(),
      updatedAt: banner.updatedAt.toISOString()
    }))
  };
}

async function persistDbToPostgres(schema: DatabaseSchema) {
  if (!prisma) return;
  const userIds = new Set(schema.users.map((user) => user.id));

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
        title: schema.torneo.title,
        description: schema.torneo.description,
        timezone: schema.torneo.timezone,
        allowPublicRegistration: schema.torneo.allowPublicRegistration,
        welcomeMessage: schema.torneo.welcomeMessage,
        rulesText: schema.torneo.rulesText,
        prizesText: schema.torneo.prizesText,
        rulesImageUrl: schema.torneo.rulesImageUrl || null,
        rulesImageUrlEn: schema.torneo.rulesImageUrlEn || null,
        notificationConfig: schema.torneo.notificationConfig
      }
    });

    if (schema.users.length) {
      await tx.user.createMany({
        data: schema.users.map((u) => ({
          id: u.id,
          email: u.email,
          password: u.password || null,
          name: u.name,
          role: u.role,
          status: u.status,
          avatar: u.avatar,
          points: u.points,
          exactCount: u.exactCount,
          drawCount: u.drawCount,
          predictCount: u.predictCount,
          historyPoints: u.historyPoints,
          emailSubscribed: u.emailSubscribed,
          paymentStatus: u.paymentStatus || "pending",
          paidAt: u.paidAt ? new Date(u.paidAt) : null,
          stripeCheckoutSessionId: u.stripeCheckoutSessionId || null,
          stripePaymentIntentId: u.stripePaymentIntentId || null,
          groupPoints: u.groupPoints ?? null,
          knockoutPoints: u.knockoutPoints ?? null,
          finalistPoints: u.finalistPoints ?? null,
          subchampionPoints: u.subchampionPoints ?? null,
          championPoints: u.championPoints ?? null,
          totalBonusPoints: u.totalBonusPoints ?? null
        }))
      });
    }

    if (schema.matches.length) {
      await tx.match.createMany({
        data: schema.matches.map((m) => ({
          id: m.id,
          stage: m.stage,
          local: m.local,
          visitor: m.visitor,
          date: new Date(m.date),
          stadium: m.stadium,
          status: m.status,
          localScore: m.localScore,
          visitorScore: m.visitorScore,
          externalSource: m.externalSource || null,
          externalSourceId: m.externalSourceId || null
        }))
      });
    }

    if (schema.predictions.length) {
      await tx.prediction.createMany({
        data: schema.predictions.map((p) => ({
          id: p.id,
          userId: p.userId,
          matchId: p.matchId,
          localScore: p.localScore,
          visitorScore: p.visitorScore,
          pointsEarned: p.pointsEarned,
          reason: p.reason,
          dateCreated: new Date(p.dateCreated)
        }))
      });
    }

    if (schema.rankings.length) {
      await tx.ranking.createMany({
        data: schema.rankings.map((r) => ({
          id: `ranking-${r.userId}`,
          userId: r.userId,
          userName: r.userName,
          userAvatar: r.userAvatar,
          points: r.points,
          exactCount: r.exactCount,
          drawCount: r.drawCount,
          predictCount: r.predictCount,
          position: r.position,
          prevPosition: r.prevPosition,
          shift: r.shift,
          groupPoints: r.groupPoints ?? null,
          knockoutPoints: r.knockoutPoints ?? null,
          finalistPoints: r.finalistPoints ?? null,
          subchampionPoints: r.subchampionPoints ?? null,
          championPoints: r.championPoints ?? null,
          totalBonusPoints: r.totalBonusPoints ?? null
        }))
      });
    }

    if (schema.announcements.length) {
      await tx.announcement.createMany({
        data: schema.announcements.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          date: new Date(a.date),
          urgent: a.urgent,
          publishAt: a.publishAt ? new Date(a.publishAt) : null
        }))
      });
    }

    if (schema.notifications.length) {
      await tx.notification.createMany({
        data: schema.notifications.map((n) => ({
          id: n.id,
          userId: n.userId,
          title: n.title,
          message: n.message,
          type: n.type,
          date: new Date(n.date),
          read: n.read
        }))
      });
    }

    if (schema.sentReminders.length) {
      await tx.sentReminder.createMany({
        data: schema.sentReminders.map((key) => ({ key }))
      });
    }

    if (schema.tournamentPredictions?.length) {
      await tx.tournamentPrediction.createMany({
        data: schema.tournamentPredictions.map((tp) => ({
          userId: tp.userId,
          groupWinners: tp.groupWinners,
          octavosTeams: tp.octavosTeams,
          cuartosTeams: tp.cuartosTeams,
          semifinalTeams: tp.semifinalTeams,
          finalists: tp.finalists,
          subchampion: tp.subchampion,
          champion: tp.champion,
          lastUpdated: tp.lastUpdated ? new Date(tp.lastUpdated) : null
        }))
      });
    }

    if (schema.tournamentOutcomes) {
      await tx.tournamentOutcome.create({
        data: {
          id: "default",
          groupWinners: schema.tournamentOutcomes.groupWinners,
          octavosTeams: schema.tournamentOutcomes.octavosTeams,
          cuartosTeams: schema.tournamentOutcomes.cuartosTeams,
          semifinalTeams: schema.tournamentOutcomes.semifinalTeams,
          finalists: schema.tournamentOutcomes.finalists,
          subchampion: schema.tournamentOutcomes.subchampion,
          champion: schema.tournamentOutcomes.champion
        }
      });
    }

    if (schema.assets?.length) {
      await tx.asset.createMany({
        data: schema.assets.map((asset) => ({
          id: asset.id,
          originalName: asset.originalName,
          fileName: asset.fileName,
          mimeType: asset.mimeType,
          type: asset.type,
          size: asset.size,
          url: asset.url,
          uploadedBy: userIds.has(asset.uploadedBy) ? asset.uploadedBy : null,
          uploadedAt: new Date(asset.uploadedAt),
          storageProvider: asset.storageProvider || "local",
          publicId: asset.publicId || null,
          resourceType: asset.resourceType || getCloudinaryResourceType(asset.type)
        }))
      });
    }

    if (schema.sponsorBanners?.length) {
      await tx.sponsorBanner.createMany({
        data: schema.sponsorBanners.map((banner) => ({
          id: banner.id,
          title: banner.title,
          sponsorName: banner.sponsorName,
          imageUrl: banner.imageUrl,
          linkUrl: banner.linkUrl || null,
          placement: banner.placement,
          active: banner.active,
          rotationSeconds: banner.rotationSeconds || 5,
          startsAt: banner.startsAt ? new Date(banner.startsAt) : null,
          endsAt: banner.endsAt ? new Date(banner.endsAt) : null,
          createdAt: new Date(banner.createdAt),
          updatedAt: new Date(banner.updatedAt)
        }))
      });
    }
  });
}

function queuePostgresPersist(schema: DatabaseSchema) {
  if (!prisma) return;
  if (postgresPersistTimer) clearTimeout(postgresPersistTimer);

  const snapshot = JSON.parse(JSON.stringify(schema)) as DatabaseSchema;
  postgresPersistTimer = setTimeout(() => {
    postgresPersistTimer = null;
    persistDbToPostgres(snapshot).catch((err) => {
      console.error("Error syncing PostgreSQL:", err);
    });
  }, 250);
}

async function initializeDb() {
  if (prisma) {
    try {
      const postgresDb = await loadDbFromPostgres();
      if (postgresDb) {
        dbState = postgresDb;
        return;
      }
      console.warn("PostgreSQL esta vacio. Se cargara db_store.json y se sincronizara como seed inicial.");
    } catch (err) {
      console.error("No se pudo cargar PostgreSQL. Se usara db_store.json como fallback:", err);
    }
  }

  loadDb();
  if (prisma) {
    await persistDbToPostgres(dbState);
  }
}

// Helper to seed matches and initial state
function createDefaultDb(): DatabaseSchema {
  const torneo: TorneoConfig = {
    title: "Polla Mundialista 2026",
    description: "Gestiona tus pronósticos, compite con amigos y sigue las estadísticas del Mundial FIFA 2026 en tiempo real.",
    timezone: "Bogotá (UTC-5)",
    allowPublicRegistration: true,
    welcomeMessage: "¡Bienvenido a la Polla Mundialista FIFA 2026! Predice y demuestra tus dotes como estratega del fútbol.",
    rulesText: "REGLAS DE PUNTUACIÓN DE PARTIDOS:\n- Si aciertas un EMPATE EXACTO (marcador correcto), ¡obtienes 25 puntos!\n- Si aciertas el MARCADOR EXACTO de un partido con ganador, ¡obtienes 15 puntos!\n- Si NO aciertas el marcador exacto pero sí el RESULTADO FINAL (ganador local, empate o ganador visitante), obtienes un BONUS de +10 puntos.\n- De lo contrario, obtienes 5 puntos por participación.\n- Partido sin marcador: 0 puntos.\n\nREGLAS DE PREMIACIÓN FAVORITOS REALES (DEBE ENVIARSE HASTA 24 HORAS ANTES DEL PRIMER PARTIDO):\n- Acierta favorito por grupo: gane 100 puntos.\n- Acierta quien clasifica en cada fase eliminatoria (sin contar grupos): gana 200 puntos.\n- Acierta los 1 finalista de la gran final: gana 300 puntos.\n- Acierta subcampeón: gana 500 puntos.\n- Acierta campeón: gana 1000 puntos.",
    prizesText: "PREMIACIONES Y RECONOCIMIENTOS:\n- 1er Lugar: Camiseta Autografiada + Copa de Campeón de la Polla.\n- 2do Lugar: Balón Adidas Al Rihla Edición 2026.\n- 3er Lugar: Suscripción VIP de streaming deportivo.",
    rulesImageUrl: "/uploads/reglas.png",
    rulesImageUrlEn: "/src/assets/images/polla_rules_en_1780083217819.png",
    notificationConfig: {
      reminders: true,
      results: true,
      rankingChanges: true,
      announcements: true
    }
  };

  const users: User[] = [
    {
      id: "user-admin",
      email: "rasalcedo76@gmail.com",
      password: "admin", // Simple plaintext passwords for ease of prototype auth
      name: "Admin Polla",
      role: "admin",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120",
      points: 45,
      exactCount: 2,
      drawCount: 1,
      predictCount: 5,
      historyPoints: [0, 5, 20, 25, 40, 45],
      emailSubscribed: true
    },
    {
      id: "player-1",
      email: "luis.diaz@polla.com",
      password: "user",
      name: "Luis Fernando Díaz",
      role: "standard",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      points: 40,
      exactCount: 1,
      drawCount: 2,
      predictCount: 5,
      historyPoints: [0, 10, 15, 25, 35, 40],
      emailSubscribed: true
    },
    {
      id: "player-2",
      email: "james.rod@polla.com",
      password: "user",
      name: "James Rodríguez",
      role: "standard",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
      points: 35,
      exactCount: 2,
      drawCount: 0,
      predictCount: 5,
      historyPoints: [0, 15, 20, 25, 30, 35],
      emailSubscribed: false
    },
    {
      id: "player-3",
      email: "linda.caicedo@polla.com",
      password: "user",
      name: "Linda Caicedo",
      role: "standard",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
      points: 30,
      exactCount: 0,
      drawCount: 2,
      predictCount: 5,
      historyPoints: [0, 10, 15, 20, 25, 30],
      emailSubscribed: true
    },
    {
      id: "player-4",
      email: "shakira@polla.com",
      password: "user",
      name: "Shakira Ripoll",
      role: "standard",
      status: "active",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
      points: 20,
      exactCount: 0,
      drawCount: 1,
      predictCount: 5,
      historyPoints: [0, 5, 15, 20, 20, 20],
      emailSubscribed: true
    }
  ];

  // Load parsed real World Cup 2026 matches
  const parsedMatchesPath = path.join(process.cwd(), "parsed_matches.json");
  let matches: Match[] = [];
  try {
    if (fs.existsSync(parsedMatchesPath)) {
      const data = fs.readFileSync(parsedMatchesPath, "utf-8");
      matches = JSON.parse(data);
    } else {
      console.error("parsed_matches.json not found, seeding empty matches array");
    }
  } catch (error) {
    console.error("Error loading parsed matches:", error);
  }

  // Predictions for initial finalized games (Matches 1 to 5) for mock users
  const predictions: Prediction[] = [];
  const mockPredictionsData = [
    // format: [user, matchId, localScore, visitorScore, points, reason]
    ["user-admin", 1, 1, 0, 15, "exact"], // real score: 1-0. Exact! (15 pts)
    ["user-admin", 2, 2, 0, 5, "participation"], // real score: 0-0. (Draw real, wait! "REGLA CLAVE: Si el resultado real es empate, todos los usuarios obtienen 10 puntos sin importar su predicción." So real score 2 (0-0) is draw, meaning admin gets 10 pts actually!) Let's align this on points recalculation below
    ["user-admin", 3, 1, 1, 10, "draw"], // real score: 1-1. Draw! (10 pts)
    ["user-admin", 4, 1, 0, 15, "exact"], // real score: 1-0. Exact! (15 pts)
    ["user-admin", 5, 2, 1, 5, "participation"], // real score: 2-0. No hit, no draw. (5 pts)
    
    ["player-1", 1, 1, 1, 5, "participation"], // real: 1-0. No. (5 pts)
    ["player-1", 2, 1, 1, 10, "draw"], // real: 0-0. Draw real! (10 pts)
    ["player-1", 3, 1, 1, 10, "draw"], // real: 1-1. Draw real! (10 pts)
    ["player-1", 4, 1, 0, 15, "exact"], // real: 1-0. Exact! (15 pts)
    ["player-1", 5, 1, 0, 5, "participation"], // real: 2-0. No. (5 pts)

    ["player-2", 1, 1, 0, 15, "exact"], // real: 1-0. 15 pts
    ["player-2", 2, 3, 1, 10, "draw"], // real: 0-0. Is draw -> 10 pts
    ["player-2", 3, 2, 0, 10, "draw"], // real: 1-1. Is draw -> 10 pts
    ["player-2", 4, 0, 2, 5, "participation"], // real: 1-0. No -> 5 pts
    ["player-2", 5, 2, 1, 5, "participation"], // real: 2-0. No -> 5 pts

    ["player-3", 1, 0, 2, 5, "participation"], // 5 pts
    ["player-3", 2, 0, 0, 10, "draw"], // 10 pts
    ["player-3", 3, 2, 2, 10, "draw"], // 10 pts
    ["player-3", 4, 3, 1, 5, "participation"], // 5 pts
    ["player-3", 5, 1, 1, 10, "draw"], // real is 2-0 (not a draw), user predicted draw. So incorrect! Should be 10 only if real is draw! Wait, if real is 2-0, and prediction is 1-1, points are 5! Let's check rule: "Si el resultado real es empate, todos... obtienen 10. Si no es empate, y acertó exacto, obtiene 15. En cualquier otro caso, obtiene 5." Since real (2-0) is NOT empate, and prediction is wrong (1-1 != 2-0), user gets 5 pts! This is perfect. Let's recalculate points accurately for all seeded data.
  ];

  // We populate predictions
  users.forEach((u) => {
    // Generate forecasts for matches 1 to 5 to avoid empty rankings
    for (let m = 1; m <= 5; m++) {
      const matchObj = matches.find((mt) => mt.id === m);
      if (!matchObj) continue;
      
      let localPred = 1;
      let visitorPred = 0;
      if (u.id === "user-admin") {
        localPred = m === 3 ? 1 : (m === 2 ? 2 : 1);
        visitorPred = m === 3 ? 1 : 0;
      } else if (u.id === "player-1") {
        localPred = m === 1 ? 1 : (m === 2 ? 1 : (m === 3 ? 1 : 1));
        visitorPred = m === 1 ? 1 : (m === 2 ? 1 : (m === 3 ? 1 : 0));
      } else if (u.id === "player-2") {
        localPred = m === 4 ? 0 : 2;
        visitorPred = m === 4 ? 2 : 1;
      } else {
        localPred = m % 2;
        visitorPred = m % 3 === 0 ? 1 : 0;
      }

      // calculate correct status
      const realLocal = matchObj.localScore!;
      const realVisitor = matchObj.visitorScore!;
      let pts = 5;
      let reason: "exact" | "draw" | "participation" = "participation";

      if (localPred === realLocal && visitorPred === realVisitor) {
        if (realLocal === realVisitor) {
          pts = 35;
          reason = "exact";
        } else {
          pts = 25;
          reason = "exact";
        }
      } else {
        const predictedWin = localPred > visitorPred ? "local" : (localPred < visitorPred ? "visitor" : "draw");
        const realWin = realLocal > realVisitor ? "local" : (realLocal < realVisitor ? "visitor" : "draw");
        if (predictedWin === realWin) {
          pts = 15;
          reason = "draw";
        } else {
          pts = 5;
          reason = "participation";
        }
      }

      predictions.push({
        id: `pred_${u.id}_${m}`,
        userId: u.id,
        matchId: m,
        localScore: localPred,
        visitorScore: visitorPred,
        pointsEarned: pts,
        reason,
        dateCreated: new Date().toISOString()
      });
    }
  });

  // Initial ranking list
  const rankings: Ranking[] = users.map((u, index) => {
    // Exact lists of calculations dynamically
    const userPreds = predictions.filter((p) => p.userId === u.id && p.pointsEarned !== null);
    const totPoints = userPreds.reduce((sum, p) => sum + (p.pointsEarned || 0), 0);
    const exactCount = userPreds.filter((p) => p.reason === "exact").length;
    const drawCount = userPreds.filter((p) => p.reason === "draw").length;
    const predictCount = userPreds.length;

    u.points = totPoints;
    u.exactCount = exactCount;
    u.drawCount = drawCount;
    u.predictCount = predictCount;
    u.historyPoints = [0, 5, 15, 25, 35, totPoints]; // Seed incremental history for visual charts

    return {
      userId: u.id,
      userName: u.name,
      userAvatar: u.avatar,
      points: totPoints,
      exactCount,
      drawCount,
      predictCount,
      position: index + 1,
      prevPosition: index + 1,
      shift: "equal"
    };
  });

  // Sort rankings properly
  rankings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.exactCount !== a.exactCount) return b.exactCount - a.exactCount;
    return b.drawCount - a.drawCount;
  });

  rankings.forEach((r, idx) => {
    r.position = idx + 1;
    r.prevPosition = idx + 1;
  });

  const announcements: Announcement[] = [
    {
      id: "announce-1",
      title: "⚽ ¡Bienvenidos a la Gran Polla del Mundial 2026!",
      content: "La Polla Oficial está oficialmente inaugurada. Recuerda que puedes ingresar o editar tus predicciones para cada partido hasta 15 minutos antes del silbatazo inicial. Hemos cargado los 104 partidos del torneo completo. ¡A por la victoria!",
      date: new Date().toISOString(),
      urgent: true
    },
    {
      id: "announce-2",
      title: "🏆 Conoce las Reglas y Premios",
      content: "No olvides revisar el panel de políticas en el menú. Recuerda que si el partido resulta en un EMPATE REAL, el sistema te asigna automáticamente 10 puntos, ¡así que todos ganamos en los empates difíciles!",
      date: new Date(Date.now() - 3600000).toISOString(),
      urgent: false
    }
  ];

  const notifications: AppNotification[] = [];

  return {
    torneo,
    users,
    matches,
    predictions,
    rankings,
    announcements,
    notifications,
    sentReminders: [],
    tournamentPredictions: [],
    tournamentOutcomes: {
      groupWinners: {},
      octavosTeams: [],
      cuartosTeams: [],
      semifinalTeams: [],
      finalists: [],
      subchampion: "",
      champion: ""
    }
  };
}

// Database reading/saving utilities
let dbState: DatabaseSchema;

function loadDb(): DatabaseSchema {
  if (dbState) return dbState;
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      dbState = JSON.parse(data);
      // Ensure all fields exist
      if (!dbState.sentReminders) dbState.sentReminders = [];
      if (!dbState.tournamentPredictions) dbState.tournamentPredictions = [];
      if (!dbState.sponsorBanners) dbState.sponsorBanners = [];
      ensureAssetsDir();
      if (!dbState.assets) {
        dbState.assets = fs.readdirSync(ASSETS_DIR)
          .filter((fileName) => !fileName.startsWith("~$"))
          .map((fileName) => createAssetRecordFromFile(fileName));
        saveDb(dbState);
      }
      if (!dbState.tournamentOutcomes) {
        dbState.tournamentOutcomes = {
          groupWinners: {},
          octavosTeams: [],
          cuartosTeams: [],
          semifinalTeams: [],
          finalists: [],
          subchampion: "",
          champion: ""
        };
      }
      
      if (dbState.torneo) {
        if (
          !dbState.torneo.rulesImageUrl ||
          dbState.torneo.rulesImageUrl === "/src/assets/images/polla_rules_flyer_1780082976931.png" ||
          dbState.torneo.rulesImageUrl === "/src/assets/images/polla_rules_es_1780083238640.png"
        ) {
          dbState.torneo.rulesImageUrl = "/uploads/reglas.png";
        }
        if (!dbState.torneo.rulesImageUrlEn) {
          dbState.torneo.rulesImageUrlEn = "/src/assets/images/polla_rules_en_1780083217819.png";
        }
        
        if (!dbState.torneo.rulesText || !dbState.torneo.rulesText.includes("FAVORITOS REALES")) {
          dbState.torneo.rulesText = "REGLAS DE PUNTUACIÓN DE PARTIDOS:\n- Si aciertas un EMPATE EXACTO (marcador correcto), ¡obtienes 25 puntos!\n- Si aciertas el MARCADOR EXACTO de un partido con ganador, ¡obtienes 15 puntos!\n- Si NO aciertas el marcador exacto pero sí el RESULTADO FINAL (ganador local, empate o ganador visitante), obtienes un BONUS de +10 puntos.\n- De lo contrario, obtienes 5 puntos por participación.\n- Partido sin marcador: 0 puntos.\n\nREGLAS DE PREMIACIÓN FAVORITOS REALES (DEBE ENVIARSE HASTA 24 HORAS ANTES DEL PRIMER PARTIDO):\n- Acierta favorito por grupo: gane 100 puntos.\n- Acierta quien clasifica en cada fase eliminatoria (sin contar grupos): gana 200 puntos.\n- Acierta los 1 finalista de la gran final: gana 300 puntos.\n- Acierta subcampeón: gana 500 puntos.\n- Acierta campeón: gana 1000 puntos.";
        }
        saveDb(dbState);
      }
      
      // Enforce rasalcedo76@gmail.com as admin
      const targetAdminEmail = "rasalcedo76@gmail.com";
      const hasAdmin = dbState.users.find((u) => u.email.toLowerCase() === targetAdminEmail);
      if (!hasAdmin) {
        dbState.users.push({
          id: "user-admin",
          email: targetAdminEmail,
          password: "admin",
          name: "Admin Polla",
          role: "admin",
          status: "active",
          avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120",
          points: 60,
          exactCount: 2,
          drawCount: 3,
          predictCount: 5,
          historyPoints: [0, 15, 25, 35, 45, 60],
          emailSubscribed: true
        });
        saveDb(dbState);
      } else if (hasAdmin.role !== "admin") {
        hasAdmin.role = "admin";
        saveDb(dbState);
      }

      return dbState;
    }
  } catch (err) {
    console.error("Error reading db file, seeding new one:", err);
  }
  dbState = createDefaultDb();
  dbState.sponsorBanners = [];
  ensureAssetsDir();
  dbState.assets = fs.readdirSync(ASSETS_DIR)
    .filter((fileName) => !fileName.startsWith("~$"))
    .map((fileName) => createAssetRecordFromFile(fileName));
  saveDb(dbState);
  return dbState;
}

function saveDb(schema: DatabaseSchema) {
  dbState = schema;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(schema, null, 2), "utf-8");
    queuePostgresPersist(schema);
  } catch (err) {
    console.error("Error writing db file:", err);
  }
}

// Recalculates all scores and rankings
function recalculateScoresAndRankings() {
  const db = loadDb();
  
  // 1. Loop through users and reset calculations
  const userStats = db.users.map((u) => {
    const userPredictions = db.predictions.filter((p) => p.userId === u.id);
    
    let totalPoints = 0;
    let exactHits = 0;
    let drawHits = 0;
    let totalPredicted = 0;
    const history: number[] = [0];

    // Sort predictions by match ID to compute chronological history
    const sortedPredictions = [...userPredictions].sort((a, b) => a.matchId - b.matchId);
    
    sortedPredictions.forEach((p) => {
      const m = db.matches.find((match) => match.id === p.matchId);
      if (m && m.status === "finished") {
        totalPredicted++;
        const realLocal = m.localScore!;
        const realVisitor = m.visitorScore!;
        
        let pts = 5;
        let reason: "exact" | "draw" | "participation" = "participation";

        if (p.localScore === realLocal && p.visitorScore === realVisitor) {
          if (realLocal === realVisitor) {
            pts = 35;
            reason = "exact";
          } else {
            pts = 25;
            reason = "exact";
          }
          exactHits++;
        } else {
          const predictedWin = p.localScore > p.visitorScore ? "local" : (p.localScore < p.visitorScore ? "visitor" : "draw");
          const realWin = realLocal > realVisitor ? "local" : (realLocal < realVisitor ? "visitor" : "draw");
          if (predictedWin === realWin) {
            pts = 15;
            reason = "draw";
            drawHits++;
          } else {
            pts = 5;
            reason = "participation";
          }
        }

        p.pointsEarned = pts;
        p.reason = reason;
        
        totalPoints += pts;
        history.push(totalPoints);
      }
    });

    // Calculate tournament bonus points
    let groupPoints = 0;
    let knockoutPoints = 0;
    let finalistPoints = 0;
    let subchampionPoints = 0;
    let championPoints = 0;

    const ut = db.tournamentPredictions?.find((tp) => tp.userId === u.id);
    const outcomes = db.tournamentOutcomes;

    if (ut && outcomes) {
      // 1. Group Winners (A to L) -> 100 points each
      const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
      groups.forEach((g) => {
        const pWin = ut.groupWinners?.[g];
        const rWin = outcomes.groupWinners?.[g];
        if (pWin && rWin && pWin.trim().toLowerCase() === rWin.trim().toLowerCase()) {
          groupPoints += 100;
        }
      });

      // 2. Knockout Classifiers -> 200 points each
      if (ut.octavosTeams && outcomes.octavosTeams) {
        ut.octavosTeams.forEach((t) => {
          if (outcomes.octavosTeams.map(o => o.toLowerCase().trim()).includes(t.toLowerCase().trim())) {
            knockoutPoints += 200;
          }
        });
      }
      if (ut.cuartosTeams && outcomes.cuartosTeams) {
        ut.cuartosTeams.forEach((t) => {
          if (outcomes.cuartosTeams.map(o => o.toLowerCase().trim()).includes(t.toLowerCase().trim())) {
            knockoutPoints += 200;
          }
        });
      }
      if (ut.semifinalTeams && outcomes.semifinalTeams) {
        ut.semifinalTeams.forEach((t) => {
          if (outcomes.semifinalTeams.map(o => o.toLowerCase().trim()).includes(t.toLowerCase().trim())) {
            knockoutPoints += 200;
          }
        });
      }

      // 3. Finalists -> 300 points each
      if (ut.finalists && outcomes.finalists) {
        ut.finalists.forEach((t) => {
          if (outcomes.finalists.map(o => o.toLowerCase().trim()).includes(t.toLowerCase().trim())) {
            finalistPoints += 300;
          }
        });
      }

      // 4. Subchampion -> 500 points
      if (ut.subchampion && outcomes.subchampion && ut.subchampion.trim().toLowerCase() === outcomes.subchampion.trim().toLowerCase()) {
        subchampionPoints += 500;
      }

      // 5. Champion -> 1000 points
      if (ut.champion && outcomes.champion && ut.champion.trim().toLowerCase() === outcomes.champion.trim().toLowerCase()) {
        championPoints += 1000;
      }
    }

    const totalBonusPoints = groupPoints + knockoutPoints + finalistPoints + subchampionPoints + championPoints;
    totalPoints += totalBonusPoints;

    u.points = totalPoints;
    u.exactCount = exactHits;
    u.drawCount = drawHits;
    u.predictCount = totalPredicted;
    u.groupPoints = groupPoints;
    u.knockoutPoints = knockoutPoints;
    u.finalistPoints = finalistPoints;
    u.subchampionPoints = subchampionPoints;
    u.championPoints = championPoints;
    u.totalBonusPoints = totalBonusPoints;
    u.historyPoints = history.length > 1 ? history : [0, 0];
    
    return {
      userId: u.id,
      name: u.name,
      avatar: u.avatar,
      points: totalPoints,
      exactCount: exactHits,
      drawCount: drawHits,
      predictCount: totalPredicted,
      groupPoints,
      knockoutPoints,
      finalistPoints,
      subchampionPoints,
      championPoints,
      totalBonusPoints
    };
  });

  // 2. Compute rankings and previous ranking positions to handle arrows up/down
  // Save old position map
  const oldRankingsMap = new Map<string, number>();
  db.rankings.forEach((r) => {
    oldRankingsMap.set(r.userId, r.position);
  });

  // Generate new rankings sorted list
  const rankedUsers = [...userStats].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.exactCount !== a.exactCount) return b.exactCount - a.exactCount;
    return b.drawCount - a.drawCount;
  });

  const updatedRankings: Ranking[] = rankedUsers.map((ru, index) => {
    const newPos = index + 1;
    const oldPos = oldRankingsMap.get(ru.userId) || newPos; // default to newPos if didn't exist
    
    let shift: "up" | "down" | "equal" = "equal";
    if (oldPos > newPos) {
      shift = "up"; // gained positions (e.g. 5th down to 2nd is "up")
    } else if (oldPos < newPos) {
      shift = "down"; // dropped positions (e.g. 2nd to 5th is "down")
    }

    // Trigger ranking change notification
    if (shift !== "equal" && ru.userId.indexOf("player") === -1 && ru.userId !== "user-admin") {
      // Create notification for active regular user
      const diffWord = shift === "up" ? "subido" : "bajado";
      db.notifications.push({
        id: `not_rank_${Date.now()}_${ru.userId}`,
        userId: ru.userId,
        title: "⚡ Cambio en el Ranking",
        message: `¡Has ${diffWord} posiciones! Ahora ocupas el puesto #${newPos} en la clasificación general de la Polla.`,
        type: "ranking",
        date: new Date().toISOString(),
        read: false
      });
    }

    return {
      userId: ru.userId,
      userName: ru.name,
      userAvatar: ru.avatar,
      points: ru.points,
      exactCount: ru.exactCount,
      drawCount: ru.drawCount,
      predictCount: ru.predictCount,
      position: newPos,
      prevPosition: oldPos,
      shift,
      groupPoints: ru.groupPoints,
      knockoutPoints: ru.knockoutPoints,
      finalistPoints: ru.finalistPoints,
      subchampionPoints: ru.subchampionPoints,
      championPoints: ru.championPoints,
      totalBonusPoints: ru.totalBonusPoints
    };
  });

  db.rankings = updatedRankings;
  saveDb(db);
}

// REST Server API Init
const app = express();
const PORT = Number(process.env.PORT || 3000);

ensureAssetsDir();
app.use(express.json({ limit: "100mb" }));
app.use("/uploads", express.static(ASSETS_DIR));

// API: Authentication middleware simulation
function getAuthenticatedUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const userId = authHeader.split(" ")[1];
  const db = loadDb();
  return db.users.find((u) => u.id === userId) || null;
}

function canSubmitPredictions(user: User) {
  return user.role === "admin" || user.paymentStatus === "paid";
}

function requirePaidParticipant(user: User, res: express.Response) {
  if (canSubmitPredictions(user)) return false;
  res.status(402).json({ error: "Debes pagar la inscripcion antes de registrar pronosticos." });
  return true;
}

// API: Welcome / Config Torneo
app.get("/api/torneo", (req, res) => {
  const db = loadDb();
  res.json(db.torneo);
});

app.post("/api/torneo", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") {
    return res.status(403).json({ error: "No autorizado." });
  }

  const db = loadDb();
  db.torneo = { ...db.torneo, ...req.body };
  saveDb(db);
  res.json({ message: "Configuración del torneo guardada con éxito.", torneo: db.torneo });
});

// API: Sponsor Banners
function isBannerVisible(banner: SponsorBanner) {
  if (!banner.active) return false;
  const now = Date.now();
  if (banner.startsAt && now < new Date(banner.startsAt).getTime()) return false;
  if (banner.endsAt && now > new Date(banner.endsAt).getTime()) return false;
  return true;
}

app.get("/api/banners", (req, res) => {
  const db = loadDb();
  const placement = req.query.placement as string | undefined;
  let banners = (db.sponsorBanners || []).filter(isBannerVisible);
  if (placement) banners = banners.filter((banner) => banner.placement === placement);
  res.json(banners.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
});

// API: User Auths
app.post("/api/auth/register", (req, res) => {
  const db = loadDb();
  if (!db.torneo.allowPublicRegistration) {
    return res.status(400).json({ error: "El registro público de nuevos participantes está desactivado por el administrador." });
  }

  const { email, password, name, avatar } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Todos los campos obligatorios (nombre, correo, contraseña) son necesarios." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return res.status(400).json({ error: "Ingrese un correo electrónico válido." });
  }
  if (String(name).trim().length < 3) {
    return res.status(400).json({ error: "El nombre público debe tener al menos 3 caracteres." });
  }
  if (
    String(password).length < 8 ||
    !/[A-ZÁÉÍÓÚÑ]/.test(String(password)) ||
    !/[a-záéíóúñ]/.test(String(password)) ||
    !/\d/.test(String(password))
  ) {
    return res.status(400).json({ error: "La contraseña debe tener 8 caracteres, mayúscula, minúscula y número." });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Este correo electrónico ya está registrado en la polla." });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    password,
    name,
    role: "standard",
    status: "active",
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
    points: 0,
    exactCount: 0,
    drawCount: 0,
    predictCount: 0,
    historyPoints: [0],
    emailSubscribed: true,
    paymentStatus: "pending"
  };

  db.users.push(newUser);
  saveDb(db);
  recalculateScoresAndRankings();

  // Send register notifications
  const successDb = loadDb();
  successDb.notifications.push({
    id: `not_welcome_${Date.now()}_${newUser.id}`,
    userId: newUser.id,
    title: "🎉 ¡Registro exitoso!",
    message: successDb.torneo.welcomeMessage || "¡Bienvenido a la Polla Mundialista FIFA 2026!",
    type: "announcement",
    date: new Date().toISOString(),
    read: false
  });
  saveDb(successDb);

  // Return session (omit password)
  const { password: _, ...cleanUser } = newUser;
  res.json({ user: cleanUser });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Introduzca correo y contraseña." });
  }

  const db = loadDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Credenciales de ingreso incorrectas. Inténtelo de nuevo." });
  }

  if (user.status === "suspended") {
    return res.status(403).json({ error: "Su cuenta ha sido suspendida. Contacte al administrador." });
  }

  const { password: _, ...cleanUser } = user;
  res.json({ user: cleanUser });
});

// Get Current User Profile
app.get("/api/auth/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });
  const { password: _, ...cleanUser } = user;
  res.json({ user: cleanUser });
});

// Update Profile
app.put("/api/auth/profile", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  const { name, avatar, emailSubscribed, newPassword } = req.body;
  
  const db = loadDb();
  const dbUser = db.users.find((u) => u.id === user.id);
  if (!dbUser) return res.status(404).json({ error: "Usuario no encontrado." });

  if (name) dbUser.name = name;
  if (avatar) dbUser.avatar = avatar;
  if (emailSubscribed !== undefined) dbUser.emailSubscribed = emailSubscribed;
  if (newPassword) dbUser.password = newPassword;

  saveDb(db);
  recalculateScoresAndRankings();
  
  const refreshed = db.users.find((u) => u.id === user.id)!;
  const { password: _, ...cleanUser } = refreshed;
  res.json({ message: "Perfil actualizado con éxito.", user: cleanUser });
});

// Recover Password
app.post("/api/auth/recover-password", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Ingrese su correo." });

  const db = loadDb();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: "No se encontró ninguna cuenta asociada a este correo electrónico." });
  }

  // Create a visual/notifications confirmation
  db.notifications.push({
    id: `not_recover_${Date.now()}_${user.id}`,
    userId: user.id,
    title: "🔑 Solicitud de Recuperación",
    message: `Hemos recibido tu solicitud de recuperación. Tu contraseña actual es: "${user.password}". Por seguridad, te sugerimos cambiarla en tu perfil.`,
    type: "announcement",
    date: new Date().toISOString(),
    read: false
  });
  saveDb(db);

  res.json({ message: "Se ha enviado un código de recuperación simulado a su dirección de correo y se registró una alerta en su panel." });
});

app.post("/api/payments/create-checkout-session", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });
  if (user.role === "admin") return res.status(400).json({ error: "El administrador no necesita pagar inscripcion." });
  if (user.paymentStatus === "paid") return res.status(400).json({ error: "Tu inscripcion ya esta pagada." });

  const origin = getRequestOrigin(req);
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("customer_email", user.email);
  params.set("success_url", `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/?payment=cancelled`);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(ENTRY_FEE_CENTS));
  params.set("line_items[0][price_data][product_data][name]", "Inscripcion Polla Mundialista 2026");
  params.set("line_items[0][price_data][product_data][description]", "Participacion oficial en la Polla Mundialista 2026");
  params.set("metadata[userId]", user.id);
  params.set("metadata[email]", user.email);

  try {
    const session = await stripeRequest("checkout/sessions", params);
    const db = loadDb();
    const dbUser = db.users.find((u) => u.id === user.id);
    if (dbUser) {
      dbUser.paymentStatus = "pending";
      dbUser.stripeCheckoutSessionId = session.id;
      saveDb(db);
    }
    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "No se pudo crear la pasarela de pago." });
  }
});

app.post("/api/payments/confirm-checkout-session", async (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "Falta el identificador de sesion de Stripe." });

  try {
    const session = await stripeRequest(`checkout/sessions/${encodeURIComponent(String(sessionId))}`, undefined, "GET");
    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "El pago todavia no aparece confirmado en Stripe." });
    }

    const metadataUserId = session.metadata?.userId;
    if (metadataUserId && metadataUserId !== user.id) {
      return res.status(403).json({ error: "Esta sesion de pago no pertenece a tu usuario." });
    }

    const db = loadDb();
    const dbUser = db.users.find((u) => u.id === user.id);
    if (!dbUser) return res.status(404).json({ error: "Usuario no encontrado." });

    markUserAsPaid(dbUser, session);
    saveDb(db);
    const { password: _, ...cleanUser } = dbUser;
    res.json({ message: "Pago confirmado. Ya estas participando oficialmente.", user: cleanUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "No se pudo confirmar el pago." });
  }
});

// Admin: Retrieve Users List
app.get("/api/admin/users", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const db = loadDb();
  // Safe mapping (omit passwords details unless specifically requesting for manual reset view)
  res.json(db.users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    status: u.status,
    avatar: u.avatar,
    points: u.points,
    exactCount: u.exactCount,
    drawCount: u.drawCount,
    predictCount: u.predictCount,
    paymentStatus: u.paymentStatus || "pending",
    paidAt: u.paidAt,
    stripeCheckoutSessionId: u.stripeCheckoutSessionId,
    password: u.password // accessible for administrator manual reset view
  })));
});

// Admin: Create User Account
app.post("/api/admin/users", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { name, email, password, role, status, avatar } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Datos del usuario incompletos." });
  }

  const db = loadDb();
  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) return res.status(400).json({ error: "El correo ya está registrado." });

  const newUser: User = {
    id: `user-${Date.now()}`,
    email: email.toLowerCase(),
    password,
    name,
    role: role || "standard",
    status: status || "active",
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
    points: 0,
    exactCount: 0,
    drawCount: 0,
    predictCount: 0,
    historyPoints: [0],
    emailSubscribed: true,
    paymentStatus: role === "admin" ? "paid" : "pending",
    paidAt: role === "admin" ? new Date().toISOString() : undefined
  };

  db.users.push(newUser);
  saveDb(db);
  recalculateScoresAndRankings();

  res.json({ message: "Cuenta de usuario creada con éxito.", user: newUser });
});

// Admin: Edit User details
app.put("/api/admin/users/:id", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { id } = req.params;
  const { name, email, role, status, password, avatar } = req.body;

  const db = loadDb();
  const dbUser = db.users.find((u) => u.id === id);
  if (!dbUser) return res.status(404).json({ error: "Usuario no encontrado." });

  if (name) dbUser.name = name;
  if (email) dbUser.email = email.toLowerCase();
  if (role) dbUser.role = role;
  if (status) dbUser.status = status;
  if (password) dbUser.password = password;
  if (avatar) dbUser.avatar = avatar;

  saveDb(db);
  recalculateScoresAndRankings();

  res.json({ message: "Usuario modificado con éxito.", user: dbUser });
});

// Admin: Delete User account
app.delete("/api/admin/users/:id", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { id } = req.params;
  if (id === admin.id) return res.status(400).json({ error: "No puedes eliminar tu propia cuenta de Administrador." });

  const db = loadDb();
  const originalLen = db.users.length;
  db.users = db.users.filter((u) => u.id !== id);
  db.predictions = db.predictions.filter((p) => p.userId !== id);
  db.rankings = db.rankings.filter((r) => r.userId !== id);

  if (db.users.length === originalLen) {
    return res.status(404).json({ error: "Usuario no encontrado." });
  }

  saveDb(db);
  recalculateScoresAndRankings();

  res.json({ message: "Cuenta y predicciones del usuario eliminadas correctamente." });
});

// Admin: Assets Library
app.get("/api/admin/assets", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const db = loadDb();
  res.json([...(db.assets || [])].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()));
});

app.post("/api/admin/assets", async (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { fileName, mimeType, data } = req.body;
  if (!fileName || !mimeType || !data) {
    return res.status(400).json({ error: "Archivo incompleto. Selecciona una imagen, video, PDF o documento valido." });
  }

  const allowedTypes = [
    "image/",
    "video/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument",
    "application/vnd.ms-"
  ];

  if (!allowedTypes.some((type) => mimeType.startsWith(type))) {
    return res.status(400).json({ error: "Tipo de archivo no permitido." });
  }

  const base64Data = String(data).includes(",") ? String(data).split(",").pop()! : String(data);
  const buffer = Buffer.from(base64Data, "base64");
  const maxBytes = 75 * 1024 * 1024;
  if (buffer.length > maxBytes) {
    return res.status(400).json({ error: "El archivo supera el limite de 75 MB." });
  }

  const safeName = sanitizeFileName(fileName);
  const assetType = getAssetType(mimeType, fileName);
  let resourceType = getCloudinaryResourceType(assetType);
  let finalFileName = `${Date.now()}-${safeName}`;
  let url = `/uploads/${encodeURIComponent(finalFileName)}`;
  let publicId: string | undefined;
  let storageProvider: UploadedAsset["storageProvider"] = "local";

  if (hasCloudinaryConfig) {
    try {
      if (
        !process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
        !process.env.CLOUDINARY_API_KEY?.trim() ||
        !process.env.CLOUDINARY_API_SECRET?.trim()
      ) {
        return res.status(500).json({ error: "Cloudinary no esta configurado correctamente en Railway." });
      }

      const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(data, {
        folder: "polla-mundialista-2026/assets",
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
        overwrite: false
      } as any);

      finalFileName = uploadResult.original_filename || safeName;
      url = uploadResult.secure_url;
      publicId = uploadResult.public_id;
      resourceType = (uploadResult.resource_type as UploadedAsset["resourceType"]) || resourceType;
      storageProvider = "cloudinary";
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      const cloudinaryMessage = getCloudinaryErrorMessage(err);
      return res.status(500).json({ error: `No se pudo cargar el archivo en Cloudinary: ${cloudinaryMessage}` });
    }
  } else {
    ensureAssetsDir();
    const targetPath = path.join(ASSETS_DIR, finalFileName);
    fs.writeFileSync(targetPath, buffer);
  }

  const db = loadDb();
  if (!db.assets) db.assets = [];

  const asset: UploadedAsset = {
    id: `asset-${Date.now()}`,
    originalName: fileName,
    fileName: finalFileName,
    mimeType,
    type: assetType,
    size: buffer.length,
    url,
    uploadedBy: admin.id,
    uploadedAt: new Date().toISOString(),
    storageProvider,
    publicId,
    resourceType
  };

  db.assets.push(asset);
  saveDb(db);

  res.json({ message: "Archivo cargado correctamente.", asset });
});

app.delete("/api/admin/assets/:id", async (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const db = loadDb();
  const asset = db.assets?.find((item) => item.id === req.params.id);
  if (!asset) return res.status(404).json({ error: "Archivo no encontrado." });

  if (asset.storageProvider === "cloudinary" && asset.publicId && hasCloudinaryConfig) {
    try {
      await cloudinary.uploader.destroy(asset.publicId, {
        resource_type: asset.resourceType || getCloudinaryResourceType(asset.type)
      });
    } catch (err) {
      console.error("Error deleting Cloudinary asset:", err);
      return res.status(500).json({ error: "No se pudo eliminar el archivo en Cloudinary." });
    }
  } else {
    const targetPath = path.resolve(ASSETS_DIR, asset.fileName);
    if (!targetPath.startsWith(path.resolve(ASSETS_DIR))) {
      return res.status(400).json({ error: "Ruta de archivo invalida." });
    }

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
  }

  db.assets = (db.assets || []).filter((item) => item.id !== asset.id);
  saveDb(db);

  res.json({ message: "Archivo eliminado correctamente." });
});

// Admin: Sponsor Banners
app.get("/api/admin/banners", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const db = loadDb();
  res.json([...(db.sponsorBanners || [])].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
});

app.post("/api/admin/banners", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { title, sponsorName, imageUrl, linkUrl, placement, active, rotationSeconds, startsAt, endsAt } = req.body;
  if (!title || !sponsorName || !imageUrl) {
    return res.status(400).json({ error: "Titulo, anunciante e imagen son obligatorios." });
  }

  const allowedPlacements: SponsorBanner["placement"][] = ["home_top", "sidebar", "rules"];
  const normalizedPlacement = allowedPlacements.includes(placement) ? placement : "home_top";
  const now = new Date().toISOString();

  const banner: SponsorBanner = {
    id: `banner-${Date.now()}`,
    title,
    sponsorName,
    imageUrl,
    linkUrl: linkUrl || undefined,
    placement: normalizedPlacement,
    active: active !== false,
    rotationSeconds: Number(rotationSeconds) === 10 ? 10 : 5,
    startsAt: startsAt || undefined,
    endsAt: endsAt || undefined,
    createdAt: now,
    updatedAt: now
  };

  const db = loadDb();
  if (!db.sponsorBanners) db.sponsorBanners = [];
  db.sponsorBanners.push(banner);
  saveDb(db);

  res.json({ message: "Banner publicitario creado correctamente.", banner });
});

app.put("/api/admin/banners/:id", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const db = loadDb();
  const banner = db.sponsorBanners?.find((item) => item.id === req.params.id);
  if (!banner) return res.status(404).json({ error: "Banner no encontrado." });

  const { title, sponsorName, imageUrl, linkUrl, placement, active, rotationSeconds, startsAt, endsAt } = req.body;
  if (title !== undefined) banner.title = title;
  if (sponsorName !== undefined) banner.sponsorName = sponsorName;
  if (imageUrl !== undefined) banner.imageUrl = imageUrl;
  if (linkUrl !== undefined) banner.linkUrl = linkUrl || undefined;
  if (["home_top", "sidebar", "rules"].includes(placement)) banner.placement = placement;
  if (active !== undefined) banner.active = Boolean(active);
  if (rotationSeconds !== undefined) banner.rotationSeconds = Number(rotationSeconds) === 10 ? 10 : 5;
  if (startsAt !== undefined) banner.startsAt = startsAt || undefined;
  if (endsAt !== undefined) banner.endsAt = endsAt || undefined;
  banner.updatedAt = new Date().toISOString();

  saveDb(db);
  res.json({ message: "Banner actualizado correctamente.", banner });
});

app.delete("/api/admin/banners/:id", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const db = loadDb();
  const before = db.sponsorBanners?.length || 0;
  db.sponsorBanners = (db.sponsorBanners || []).filter((item) => item.id !== req.params.id);
  if (db.sponsorBanners.length === before) return res.status(404).json({ error: "Banner no encontrado." });

  saveDb(db);
  res.json({ message: "Banner eliminado correctamente." });
});

// Admin: Reset Tournament to Real Pre-Tournament State (Pre-Mundial)
app.post("/api/admin/reset-tournament", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const db = loadDb();
  
  // 1. Reset all matches to pending with null scores
  db.matches.forEach((m) => {
    m.status = "pending";
    m.localScore = null;
    m.visitorScore = null;
  });

  // 2. Clear predictions so user predictions are empty for a fresh real tournament
  db.predictions = [];
  db.tournamentPredictions = [];
  db.tournamentOutcomes = {
    groupWinners: {},
    octavosTeams: [],
    cuartosTeams: [],
    semifinalTeams: [],
    finalists: [],
    subchampion: "",
    champion: ""
  };
  
  if (db.torneo) {
    db.torneo.rulesText = "REGLAS DE PUNTUACIÓN DE PARTIDOS:\n- Si aciertas un EMPATE EXACTO (marcador correcto), ¡obtienes 25 puntos!\n- Si aciertas el MARCADOR EXACTO de un partido con ganador, ¡obtienes 15 puntos!\n- Si NO aciertas el marcador exacto pero sí el RESULTADO FINAL (ganador local, empate o ganador visitante), obtienes un BONUS de +10 puntos.\n- De lo contrario, obtienes 5 puntos por participación.\n- Partido sin marcador: 0 puntos.\n\nREGLAS DE PREMIACIÓN FAVORITOS REALES (DEBE ENVIARSE HASTA 24 HORAS ANTES DEL PRIMER PARTIDO):\n- Acierta favorito por grupo: gane 100 puntos.\n- Acierta quien clasifica en cada fase eliminatoria (sin contar grupos): gana 200 puntos.\n- Acierta los 1 finalista de la gran final: gana 300 puntos.\n- Acierta subcampeón: gana 500 puntos.\n- Acierta campeón: gana 1000 puntos.";
  }
  
  // 3. Reset notifications and reminders
  db.notifications = [];
  db.sentReminders = [];

  saveDb(db);

  // 4. Recalculate will automatically reset all users points, exact hits, history to [0, 0] or [0]
  recalculateScoresAndRankings();

  res.json({ message: "¡El torneo ha sido reiniciado con éxito al Estado Inicial Real! Todos los partidos están pendientes sin marcadores y los puntos se han establecido en 0." });
});

// API: Matches Endpoints
app.get("/api/matches", (req, res) => {
  const db = loadDb();
  res.json(db.matches);
});

app.get("/api/knockout-fixtures", (req, res) => {
  res.json(KNOCKOUT_FIXTURES);
});

// Admin: Add or Edit Match
app.post("/api/matches", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { stage, local, visitor, date, stadium } = req.body;
  if (!stage || !local || !visitor || !date || !stadium) {
    return res.status(400).json({ error: "Todos los campos son requeridos para programar el partido." });
  }

  const db = loadDb();
  const nextId = db.matches.reduce((max, m) => m.id > max ? m.id : max, 0) + 1;

  const newMatch: Match = {
    id: nextId,
    stage,
    local,
    visitor,
    date,
    stadium,
    status: "pending",
    localScore: null,
    visitorScore: null
  };

  db.matches.push(newMatch);
  saveDb(db);
  res.json({ message: "Partido registrado exitosamente.", match: newMatch });
});

app.post("/api/admin/matches/sync-football-data", async (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });
  const apiOnly = Boolean(req.body?.apiOnly);

  const token = process.env.FOOTBALL_DATA_API_TOKEN;
  if (!token) {
    return res.status(400).json({
      error: "Falta configurar FOOTBALL_DATA_API_TOKEN en las variables de entorno."
    });
  }

  const competitionCode = process.env.FOOTBALL_DATA_COMPETITION || "WC";
  const season = process.env.FOOTBALL_DATA_SEASON || "2026";
  const url = new URL(`https://api.football-data.org/v4/competitions/${competitionCode}/matches`);
  url.searchParams.set("season", season);

  try {
    const apiRes = await fetch(url, {
      headers: {
        "X-Auth-Token": token,
        "Accept": "application/json"
      }
    });

    const payload = await apiRes.json().catch(() => ({}));
    if (!apiRes.ok) {
      return res.status(apiRes.status).json({
        error: payload.message || payload.error || "No se pudo consultar football-data.org."
      });
    }

    const apiMatches = Array.isArray(payload.matches) ? payload.matches : [];
    const db = loadDb();
    let created = 0;
    let updated = 0;
    let ignored = 0;
    let resultChanged = false;
    let nextId = db.matches.reduce((max, match) => Math.max(max, match.id), 0) + 1;
    const incomingMatches: Match[] = [];

    apiMatches.forEach((apiMatch: any) => {
      const homeName = normalizeExternalTeamName(apiMatch?.homeTeam?.name);
      const awayName = normalizeExternalTeamName(apiMatch?.awayTeam?.name);
      if (!apiMatch?.id || homeName === "Por definir" || awayName === "Por definir") {
        ignored += 1;
        return;
      }

      const scores = getFootballDataScore(apiMatch);
      const incoming: Match = {
        id: nextId,
        stage: mapFootballDataStage(apiMatch.stage, apiMatch.group),
        local: homeName,
        visitor: awayName,
        date: apiMatch.utcDate || new Date().toISOString(),
        stadium: apiMatch.venue || "Por definir",
        status: mapFootballDataStatus(apiMatch.status),
        localScore: scores.localScore,
        visitorScore: scores.visitorScore,
        externalSource: FOOTBALL_DATA_SOURCE,
        externalSourceId: String(apiMatch.id)
      };
      incomingMatches.push(incoming);

      const existing = db.matches.find((match) =>
        match.externalSource === FOOTBALL_DATA_SOURCE &&
        match.externalSourceId === incoming.externalSourceId
      ) || db.matches.find((match) => isSameFixtureCandidate(match, incoming));

      if (!existing) {
        db.matches.push({ ...incoming, id: nextId });
        nextId += 1;
        created += 1;
        if (incoming.status === "finished") resultChanged = true;
        return;
      }

      const previousResult = `${existing.status}:${existing.localScore ?? ""}:${existing.visitorScore ?? ""}`;
      existing.stage = incoming.stage;
      existing.local = incoming.local;
      existing.visitor = incoming.visitor;
      existing.date = incoming.date;
      existing.stadium = incoming.stadium;
      existing.status = incoming.status;
      existing.localScore = incoming.localScore;
      existing.visitorScore = incoming.visitorScore;
      existing.externalSource = FOOTBALL_DATA_SOURCE;
      existing.externalSourceId = incoming.externalSourceId;
      updated += 1;

      const nextResult = `${existing.status}:${existing.localScore ?? ""}:${existing.visitorScore ?? ""}`;
      if (previousResult !== nextResult && existing.status === "finished") {
        resultChanged = true;
      }
    });

    const strictApiReplacement = apiOnly
      ? replaceMatchesWithApiSource(db, incomingMatches)
      : null;
    const merged = apiOnly ? 0 : mergeDuplicateMatches(db);
    const apiOnlyCleanup = apiOnly
      ? { pruned: strictApiReplacement?.removed || 0, predictionsRemoved: strictApiReplacement?.predictionsRemoved || 0 }
      : { pruned: 0, predictionsRemoved: 0 };
    saveDb(db);
    if (resultChanged || merged > 0 || apiOnlyCleanup.pruned > 0) recalculateScoresAndRankings();

    res.json({
      message: apiOnly
        ? `API oficial aplicada: ${created} creados, ${updated} actualizados, ${merged} duplicados fusionados, ${apiOnlyCleanup.pruned} partidos manuales eliminados.`
        : `Sincronizacion completada: ${created} creados, ${updated} actualizados, ${ignored} omitidos, ${merged} duplicados fusionados.`,
      created,
      updated,
      ignored,
      merged,
      pruned: apiOnlyCleanup.pruned,
      predictionsRemoved: apiOnlyCleanup.predictionsRemoved,
      finalCount: strictApiReplacement?.finalCount ?? db.matches.length,
      recalculated: resultChanged || merged > 0 || apiOnlyCleanup.pruned > 0
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Error sincronizando partidos desde football-data.org." });
  }
});

app.post("/api/admin/matches/dedupe", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const db = loadDb();
  const merged = mergeDuplicateMatches(db);
  if (merged > 0) {
    saveDb(db);
    recalculateScoresAndRankings();
  }

  res.json({
    message: merged > 0 ? `Se fusionaron ${merged} partidos duplicados.` : "No se encontraron partidos duplicados.",
    merged
  });
});

app.put("/api/matches/:id", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { id } = req.params;
  const matchIdNum = parseInt(id, 10);
  const { stage, local, visitor, date, stadium, status, localScore, visitorScore } = req.body;

  const db = loadDb();
  const m = db.matches.find((match) => match.id === matchIdNum);
  if (!m) return res.status(404).json({ error: "Partido no encontrado." });

  if (stage) m.stage = stage;
  if (local) m.local = local;
  if (visitor) m.visitor = visitor;
  if (date) m.date = date;
  if (stadium) m.stadium = stadium;
  
  const wasFinished = m.status === "finished";

  if (status) m.status = status;
  
  if (localScore !== undefined && localScore !== null) {
    m.localScore = parseInt(localScore, 10);
  } else if (localScore === null) m.localScore = null;

  if (visitorScore !== undefined && visitorScore !== null) {
    m.visitorScore = parseInt(visitorScore, 10);
  } else if (visitorScore === null) m.visitorScore = null;

  saveDb(db);

  // If match was transitioned to finished, or result was modified, trigger ranking scores update!
  if (m.status === "finished") {
    recalculateScoresAndRankings();
    
    // Add result notification to affected users
    const updatedDb = loadDb();
    if (updatedDb.torneo.notificationConfig.results) {
      updatedDb.users.forEach((u) => {
        const pred = updatedDb.predictions.find((p) => p.userId === u.id && p.matchId === m.id);
        const ptsEarned = pred ? (pred.pointsEarned || 0) : 0;
        let diffReason = "no participaste";
        if (pred) {
          if (pred.reason === "exact") diffReason = "acertar marcador exacto (15 pts)";
          else if (pred.reason === "draw") diffReason = "empate real (10 pts)";
          else diffReason = "participación (5 pts)";
        }

        updatedDb.notifications.push({
          id: `not_res_${Date.now()}_${u.id}_${m.id}`,
          userId: u.id,
          title: "📌 Resultado del Partido Publicado",
          message: `El partido ${m.local} vs ${m.visitor} finalizó con marcador real ${m.localScore}-${m.visitorScore}. ${pred ? `Tu predicción fue ${pred.localScore}-${pred.visitorScore}. Ganaste ${ptsEarned} puntos por ${diffReason}.` : "No tenías ninguna predicción registrada para este partido."}`,
          type: "result",
          date: new Date().toISOString(),
          read: false
        });
      });
      saveDb(updatedDb);
    }
  } else if (wasFinished) {
    // If Admin changed back to pending or in_progress, clear scored calculations!
    recalculateScoresAndRankings();
  }

  res.json({ message: "Partido modificado correctamente.", match: m });
});

// Fast score mock simulate for testing
app.post("/api/matches/:id/simulate", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { id } = req.params;
  const matchIdNum = parseInt(id, 10);
  const { localScore, visitorScore } = req.body;

  const db = loadDb();
  const m = db.matches.find((match) => match.id === matchIdNum);
  if (!m) return res.status(404).json({ error: "Partido no encontrado." });

  m.status = "finished";
  m.localScore = localScore !== undefined ? parseInt(localScore, 10) : Math.floor(Math.random() * 4);
  m.visitorScore = visitorScore !== undefined ? parseInt(visitorScore, 10) : Math.floor(Math.random() * 4);
  
  saveDb(db);
  recalculateScoresAndRankings();

  // Seed notification
  const notifyDb = loadDb();
  notifyDb.users.forEach((u) => {
    const pred = notifyDb.predictions.find((p) => p.userId === u.id && p.matchId === m.id);
    const pts = pred ? (pred.pointsEarned || 0) : 0;
    let reasonText = "participación (5 pts)";
    if (pred) {
      if (pred.reason === "exact") reasonText = "marcador exacto (15 pts)";
      else if (pred.reason === "draw") reasonText = "empate real (10 pts)";
    }

    notifyDb.notifications.push({
      id: `not_sim_${Date.now()}_${u.id}_${m.id}`,
      userId: u.id,
      title: "⚽ Simulación: Resultado Oficial",
      message: `El administrador simuló el partido ${m.local} vs ${m.visitor}. Marcador real final: ${m.localScore}-${m.visitorScore}. Obtuviste ${pred ? `${pts} pts por ${reasonText}` : "0 pts por no tener pronóstico"}.`,
      type: "result",
      date: new Date().toISOString(),
      read: false
    });
  });
  saveDb(notifyDb);

  res.json({ message: "Simulación de partido aplicada y ranking recalculado.", match: m });
});

// API: Predictions
app.get("/api/predictions", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  const db = loadDb();
  const queryUserId = req.query.userId as string;

  // Normal users can only retrieve their own predictions. Admin can load anyone's forecasts.
  if (user.role !== "admin" && queryUserId && queryUserId !== user.id) {
    return res.status(403).json({ error: "No autorizado para ver predicciones de otros usuarios." });
  }

  const targetUserId = queryUserId || user.id;
  const userPredictions = db.predictions.filter((p) => p.userId === targetUserId);
  res.json(userPredictions);
});

// Input/Modify forecasts
app.post("/api/predictions", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });
  if (requirePaidParticipant(user, res)) return;

  const { matchId, localScore, visitorScore } = req.body;
  if (matchId === undefined || localScore === undefined || visitorScore === undefined) {
    return res.status(400).json({ error: "Faltan campos para registrar el pronóstico." });
  }

  const db = loadDb();
  const m = db.matches.find((match) => match.id === matchId);
  if (!m) return res.status(404).json({ error: "Partido no encontrado." });

  // REGLA: Bloquear predicciones 15 minutos antes
  const matchTime = new Date(m.date).getTime();
  const lockTime = matchTime - 15 * 60 * 1000; // 15 mins before kick-off
  const now = Date.now();

  if (now > lockTime) {
    return res.status(400).json({ error: "La predicción para este partido ya está cerrada (se bloquea 15 minutos antes del partido)." });
  }

  if (m.status !== "pending") {
    return res.status(400).json({ error: "Este partido ya se está jugando o ha finalizado." });
  }

  const parsedLocalScore = parseInt(localScore, 10);
  const parsedVisitorScore = parseInt(visitorScore, 10);
  if (
    !Number.isInteger(parsedLocalScore) ||
    !Number.isInteger(parsedVisitorScore) ||
    parsedLocalScore < 0 ||
    parsedVisitorScore < 0
  ) {
    return res.status(400).json({ error: "Ingresa marcadores validos para ambos equipos." });
  }

  let existing = db.predictions.find((p) => p.userId === user.id && p.matchId === matchId);
  if (existing) {
    existing.localScore = parsedLocalScore;
    existing.visitorScore = parsedVisitorScore;
    existing.dateCreated = new Date().toISOString();
  } else {
    existing = {
      id: `pred_${user.id}_${matchId}`,
      userId: user.id,
      matchId,
      localScore: parsedLocalScore,
      visitorScore: parsedVisitorScore,
      pointsEarned: null,
      reason: null,
      dateCreated: new Date().toISOString()
    };
    db.predictions.push(existing);
  }

  saveDb(db);
  res.json({ message: "Predicción guardada exitosamente.", prediction: existing });
});

app.delete("/api/predictions/:matchId", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });
  if (requirePaidParticipant(user, res)) return;

  const matchId = Number(req.params.matchId);
  if (!Number.isInteger(matchId)) {
    return res.status(400).json({ error: "Partido invalido." });
  }

  const db = loadDb();
  const m = db.matches.find((match) => match.id === matchId);
  if (!m) return res.status(404).json({ error: "Partido no encontrado." });

  const matchTime = new Date(m.date).getTime();
  const lockTime = matchTime - 15 * 60 * 1000;
  if (Date.now() > lockTime) {
    return res.status(400).json({ error: "La prediccion para este partido ya esta cerrada." });
  }

  if (m.status !== "pending") {
    return res.status(400).json({ error: "Este partido ya se esta jugando o ha finalizado." });
  }

  const before = db.predictions.length;
  db.predictions = db.predictions.filter((p) => !(p.userId === user.id && p.matchId === matchId));
  saveDb(db);

  res.json({
    message: before === db.predictions.length ? "El marcador ya estaba limpio." : "Marcador limpiado correctamente."
  });
});

// Tournament Lock Time and long term predictions APIs
const TOURNAMENT_PREDICTIONS_LOCK_TIME = new Date("2026-06-10T19:00:00.000Z").getTime();

// Get tournament predictions for a user
app.get("/api/tournament-predictions", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  const queryUserId = req.query.userId as string;
  if (user.role !== "admin" && queryUserId && queryUserId !== user.id) {
    return res.status(403).json({ error: "No autorizado para ver predicciones de otros usuarios." });
  }

  const targetUserId = queryUserId || user.id;
  const db = loadDb();
  let found = db.tournamentPredictions?.find((tp) => tp.userId === targetUserId);
  if (!found) {
    found = {
      userId: targetUserId,
      groupWinners: {},
      octavosTeams: [],
      cuartosTeams: [],
      semifinalTeams: [],
      finalists: [],
      subchampion: "",
      champion: "",
      lastUpdated: ""
    };
  }
  res.json(found);
});

// Save tournament predictions for self
app.post("/api/tournament-predictions", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });
  if (requirePaidParticipant(user, res)) return;

  const now = Date.now();
  if (now > TOURNAMENT_PREDICTIONS_LOCK_TIME) {
    return res.status(400).json({ error: "Las predicciones de favoritos ya están cerradas (vencieron 24 horas antes del inicio del mundial)." });
  }

  const { groupWinners, octavosTeams, cuartosTeams, semifinalTeams, finalists, subchampion, champion } = req.body;

  const db = loadDb();
  if (!db.tournamentPredictions) db.tournamentPredictions = [];

  let existing = db.tournamentPredictions.find((tp) => tp.userId === user.id);
  if (existing) {
    existing.groupWinners = groupWinners || {};
    existing.octavosTeams = octavosTeams || [];
    existing.cuartosTeams = cuartosTeams || [];
    existing.semifinalTeams = semifinalTeams || [];
    existing.finalists = finalists || [];
    existing.subchampion = subchampion || "";
    existing.champion = champion || "";
    existing.lastUpdated = new Date().toISOString();
  } else {
    existing = {
      userId: user.id,
      groupWinners: groupWinners || {},
      octavosTeams: octavosTeams || [],
      cuartosTeams: cuartosTeams || [],
      semifinalTeams: semifinalTeams || [],
      finalists: finalists || [],
      subchampion: subchampion || "",
      champion: champion || "",
      lastUpdated: new Date().toISOString()
    };
    db.tournamentPredictions.push(existing);
  }

  saveDb(db);
  recalculateScoresAndRankings();

  res.json({ message: "Predicciones de favoritos guardadas exitosamente.", prediction: existing });
});

// Get official tournament outcomes
app.get("/api/tournament-outcomes", (req, res) => {
  const db = loadDb();
  const outcomes = db.tournamentOutcomes || {
    groupWinners: {},
    octavosTeams: [],
    cuartosTeams: [],
    semifinalTeams: [],
    finalists: [],
    subchampion: "",
    champion: ""
  };
  res.json(outcomes);
});

// Save official tournament outcomes (Admin Only)
app.post("/api/tournament-outcomes", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { groupWinners, octavosTeams, cuartosTeams, semifinalTeams, finalists, subchampion, champion } = req.body;

  const db = loadDb();
  db.tournamentOutcomes = {
    groupWinners: groupWinners || {},
    octavosTeams: octavosTeams || [],
    cuartosTeams: cuartosTeams || [],
    semifinalTeams: semifinalTeams || [],
    finalists: finalists || [],
    subchampion: subchampion || "",
    champion: champion || ""
  };

  saveDb(db);
  recalculateScoresAndRankings();

  res.json({ message: "Resultados oficiales del torneo actualizados. Rankings recalculados.", outcomes: db.tournamentOutcomes });
});

// API: Leaderboards
app.get("/api/rankings", (req, res) => {
  const db = loadDb();
  res.json(db.rankings);
});

// API: Announcements / Comunicados
app.get("/api/announcements", (req, res) => {
  const db = loadDb();
  const now = new Date();
  // Safe filtering of announcement publication schedules
  const visible = db.announcements.filter((ann) => {
    if (!ann.publishAt) return true;
    return new Date(ann.publishAt).getTime() <= now.getTime();
  });
  res.json(visible);
});

app.post("/api/announcements", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { title, content, urgent, publishAt } = req.body;
  if (!title || !content) return res.status(400).json({ error: "El título y el mensaje son requeridos." });

  const db = loadDb();
  const newAnn: Announcement = {
    id: `announce-${Date.now()}`,
    title,
    content,
    date: new Date().toISOString(),
    urgent: !!urgent,
    publishAt: publishAt || undefined
  };

  db.announcements.unshift(newAnn); // Add to beginning
  saveDb(db);

  // Send communication notifications if not scheduled for future or if ready immediately
  const isScheduledInFuture = publishAt && new Date(publishAt).getTime() > Date.now();
  if (!isScheduledInFuture && db.torneo.notificationConfig.announcements) {
    db.users.forEach((u) => {
      db.notifications.push({
        id: `not_ann_${Date.now()}_${u.id}`,
        userId: u.id,
        title: urgent ? "🚨 Comunicado Urgente" : "📢 Nuevo Comunicado",
        message: `El administrador ha publicado un anuncio: "${title}". Consúltalo en la sección de anuncios.`,
        type: "announcement",
        date: new Date().toISOString(),
        read: false
      });
    });
    saveDb(db);
  }

  res.json({ message: "Anuncio publicado correctamente.", announcement: newAnn });
});

app.delete("/api/announcements/:id", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const { id } = req.params;
  const db = loadDb();
  const len = db.announcements.length;
  db.announcements = db.announcements.filter((ann) => ann.id !== id);

  if (db.announcements.length === len) {
    return res.status(404).json({ error: "Anuncio no encontrado." });
  }

  saveDb(db);
  res.json({ message: "Anuncio eliminado correctamente." });
});

// API: Notifications
app.get("/api/notifications/:userId", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  const { userId } = req.params;
  if (user.role !== "admin" && userId !== user.id) {
    return res.status(403).json({ error: "No autorizado." });
  }

  const db = loadDb();
  const userNotifications = db.notifications.filter((n) => n.userId === userId);
  res.json(userNotifications);
});

app.post("/api/notifications/:id/read", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  const { id } = req.params;
  const db = loadDb();
  const n = db.notifications.find((notify) => notify.id === id);
  if (!n) return res.status(404).json({ error: "Notificación no encontrada." });

  if (n.userId !== user.id) return res.status(403).json({ error: "No autorizado." });

  n.read = true;
  saveDb(db);
  res.json({ message: "Notificación marcada como leída." });
});

app.post("/api/notifications/read-all", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "No autenticado." });

  const db = loadDb();
  db.notifications.forEach((n) => {
    if (n.userId === user.id) n.read = true;
  });
  saveDb(db);
  res.json({ message: "Todas las notificaciones fueron marcadas como leídas." });
});

// Statistics API
app.get("/api/admin/stats", (req, res) => {
  const admin = getAuthenticatedUser(req);
  if (!admin || admin.role !== "admin") return res.status(403).json({ error: "No autorizado." });

  const db = loadDb();
  const totalUsers = db.users.filter((u) => u.role !== "admin").length;
  const totalMatchesCount = db.matches.length;
  
  // Predictions: total vs pending
  const totalPredictionsCount = db.predictions.length;
  const pendingMatches = db.matches.filter((m) => m.status === "pending").length;
  const finishedMatches = db.matches.filter((m) => m.status === "finished").length;
  
  // Points distribution: count amount of exact (25/35), outcome (15), participation (5)
  let pts25or35Count = 0;
  let pts15Count = 0;
  let pts5Count = 0;

  db.predictions.forEach((p) => {
    if (p.pointsEarned === 25 || p.pointsEarned === 35) pts25or35Count++;
    else if (p.pointsEarned === 15) pts15Count++;
    else if (p.pointsEarned === 5) pts5Count++;
  });

  // Average points per standard user
  const standardUsers = db.users.filter((u) => u.role === "standard");
  const averagePoints = standardUsers.length > 0 
    ? (standardUsers.reduce((sum, u) => sum + u.points, 0) / standardUsers.length).toFixed(1)
    : "0.0";
  const paidUsers = standardUsers.filter((u) => u.paymentStatus === "paid");
  const prizePool = calculatePrizePool(paidUsers.length);

  // Match phase breakdowns for nice filter previews
  const stagesList = Array.from(new Set(db.matches.map((m) => m.stage)));

  res.json({
    totalParticipants: totalUsers,
    finishedMatches,
    pendingMatches,
    totalMatchesCount,
    totalPredictionsCount,
    averagePoints,
    distribution: {
      exact15: pts25or35Count,
      draw10: pts15Count,
      participation5: pts5Count
    },
    prizePool,
    stagesList
  });
});

// Background scheduler running every 30 seconds
// 1. Locks predictions 15 minutes before kick-off (simulated - can inspect match statuses)
// 2. Looks up matches airing in approximately 24 hours. Sends alert notification to users without registered prediction.
setInterval(() => {
  try {
    const db = loadDb();
    const now = Date.now();
    let updated = false;

    db.matches.forEach((m) => {
      // Automatic locked states based on time
      const matchTime = new Date(m.date).getTime();
      const lockThreshold = matchTime - 15 * 60 * 1000;
      
      // Auto locked checks for reminders (24h alert interval check)
      const warningThresholdStart = matchTime - 24 * 60 * 60 * 1000 - 30 * 60 * 1000; // 24h & 30 min before
      const warningThresholdEnd = matchTime - 24 * 60 * 60 * 1000; // 24h before kick-off

      // If within 24 hours warning check, alert users of pending predictions!
      if (now >= warningThresholdStart && now <= (warningThresholdEnd + 5 * 60 * 1000)) {
        if (db.torneo.notificationConfig.reminders) {
          db.users.forEach((u) => {
            if (u.role === "admin") return;
            const predKey = `${u.id}_${m.id}`;
            // If reminder already sent, neglect
            if (db.sentReminders.indexOf(predKey) !== -1) return;

            // Check if user already predicted
            const hasPrediction = db.predictions.some((p) => p.userId === u.id && p.matchId === m.id);
            if (!hasPrediction) {
              db.notifications.push({
                id: `not_remind_${Date.now()}_${u.id}_${m.id}`,
                userId: u.id,
                title: "⏰ Recordatorio de Pronóstico",
                message: `Quedan menos de 24 horas para el inicio del partido ${m.local} vs ${m.visitor}. Recuerda ingresar tu marcador pronosticado antes de que cierre el plazo.`,
                type: "reminder",
                date: new Date().toISOString(),
                read: false
              });
              db.sentReminders.push(predKey);
              updated = true;
            }
          });
        }
      }
    });

    if (updated) {
      saveDb(db);
    }
  } catch (err) {
    console.error("Error running scheduler:", err);
  }
}, 30000);

// Set up server listening and Vite configuration
async function startServer() {
  await initializeDb();
  recalculateScoresAndRankings();

  if (process.env.NODE_ENV !== "production") {
    // Development Mode: Mount Vite in middleware Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: static files bundle serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server initiated. Routing traffic on port http://localhost:${PORT}`);
  });
}

startServer();
