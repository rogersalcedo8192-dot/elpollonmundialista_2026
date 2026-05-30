export interface TorneoConfig {
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

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "standard";
  status: "active" | "suspended";
  avatar: string;
  points: number;
  exactCount: number;
  drawCount: number;
  predictCount: number;
  historyPoints: number[];
  emailSubscribed: boolean;
  password?: string;
  groupPoints?: number;
  knockoutPoints?: number;
  finalistPoints?: number;
  subchampionPoints?: number;
  championPoints?: number;
  totalBonusPoints?: number;
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

export interface Ranking {
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

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  urgent: boolean;
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

export interface DashboardStats {
  totalParticipants: number;
  finishedMatches: number;
  pendingMatches: number;
  totalMatchesCount: number;
  totalPredictionsCount: number;
  averagePoints: string;
  distribution: {
    exact15: number;
    draw10: number;
    participation5: number;
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
