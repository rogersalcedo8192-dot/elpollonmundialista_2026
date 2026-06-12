export interface TorneoConfig {
  title: string;
  description: string;
  timezone: string;
  allowPublicRegistration: boolean;
  welcomeMessage: string;
  rulesText: string;
  prizesText: string;
  popupEnabled?: boolean;
  popupTitle?: string;
  popupMessage?: string;
  popupImageUrl?: string;
  popupCtaLabel?: string;
  popupCtaTab?: string;
  rulesImageUrl?: string;
  rulesImageUrlEn?: string;
  notificationConfig: {
    reminders: boolean;
    results: boolean;
    rankingChanges: boolean;
    announcements: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  country?: string;
  role: "admin" | "superadmin" | "company_admin" | "standard";
  companyId?: string;
  status: "active" | "suspended";
  avatar: string;
  points: number;
  exactCount: number;
  drawCount: number;
  predictCount: number;
  historyPoints: number[];
  emailSubscribed: boolean;
  password?: string;
  paymentStatus?: "pending" | "paid" | "failed";
  paidAt?: string;
  paymentProvider?: "stripe" | "wompi";
  paymentReference?: string;
  paymentTransactionId?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  groupPoints?: number;
  knockoutPoints?: number;
  finalistPoints?: number;
  subchampionPoints?: number;
  championPoints?: number;
  totalBonusPoints?: number;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  prizesText?: string;
  adminId?: string;
  maxPlayers: number;
  status: "active" | "suspended" | "pending_activation";
  createdAt: string;
}

export interface CompanyInvitation {
  id: string;
  companyId: string;
  token: string;
  url?: string;
  createdBy: string;
  usedBy?: string;
  status: "active" | "used" | "revoked";
  createdAt: string;
  usedAt?: string;
}

export interface TournamentPredictions {
  userId: string;
  groupWinners: Record<string, string>; // Group name: team name
  octavosTeams: string[]; // 16 teams
  cuartosTeams: string[]; // 8 teams
  semifinalTeams: string[]; // 4 teams
  finalists: string[]; // 2 teams
  subchampion: string;
  champion: string;
  lastUpdated: string;
}

export interface TournamentOutcomes {
  groupWinners: Record<string, string>;
  octavosTeams: string[];
  cuartosTeams: string[];
  semifinalTeams: string[];
  finalists: string[];
  subchampion: string;
  champion: string;
}

export interface Match {
  id: number;
  stage: string;
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

export interface KnockoutFixture {
  id: number;
  stage: "16avos de Final" | "Octavos de Final" | "Cuartos de Final" | "Semifinal" | "Tercer Puesto" | "Final";
  dateLabel: string;
  localSlot: string;
  visitorSlot: string;
  stadium: string;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: number;
  localScore: number;
  visitorScore: number;
  pointsEarned: number | null;
  reason: "exact" | "draw" | "participation" | null;
  dateCreated: string;
}

export interface PublicPredictionEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  userCountry?: string;
  position?: number;
  localScore: number;
  visitorScore: number;
  pointsEarned: number | null;
}

export interface PublicPredictionMatch {
  id: number;
  stage: string;
  local: string;
  visitor: string;
  date: string;
  status: "in_progress" | "finished";
  localScore: number | null;
  visitorScore: number | null;
  predictions: PublicPredictionEntry[];
}

export interface Ranking {
  userId: string;
  userName: string;
  userAvatar: string;
  userCountry?: string;
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

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  urgent: boolean;
  companyId?: string;
  authorId?: string;
  publishAt?: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "reminder" | "result" | "ranking" | "announcement";
  date: string;
  read: boolean;
}

export interface PublicPrizePool {
  entryFeeCop: number;
  paidParticipants: number;
  grossPool: number;
  bankCommissionRate: number;
  bankCommission: number;
  ownerProfitRate: number;
  ownerGrossProfit: number;
  ownerProfit: number;
  prizeSeed: number;
  prizePoolRate: number;
  prizePool: number;
  payouts: {
    first: number;
    second: number;
    third: number;
  };
  payoutRates: {
    first: number;
    second: number;
    third: number;
  };
}

export interface DashboardStats {
  totalParticipants: number;
  finishedMatches: number;
  pendingMatches: number;
  totalMatchesCount: number;
  totalPredictionsCount: number;
  averagePoints: string;
  distribution: {
    exact25or35: number;
    outcome15: number;
    participation5: number;
  };
  prizePool: PublicPrizePool & {
    bankCommissionRate: number;
    bankCommission: number;
    netPool: number;
    ownerProfitRate: number;
    ownerGrossProfit: number;
    ownerProfit: number;
  };
  stagesList: string[];
}

export interface UploadedAsset {
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

export interface SponsorBanner {
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
