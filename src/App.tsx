import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
  Award,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Bell,
  Lock,
  Edit2,
  Trash2,
  Plus,
  Tv,
  Check,
  LogOut,
  Mail,
  TrendingUp,
  UserPlus,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  Globe,
  Download,
  Eye,
  EyeOff,
  Maximize2,
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  Megaphone,
  ExternalLink,
  Copy,
  Share2,
  CreditCard,
  Eraser,
  Menu,
  X
} from "lucide-react";
import { User, Match, Prediction, PublicPredictionMatch, Ranking, Announcement, AppNotification, TorneoConfig, DashboardStats, TournamentPredictions, TournamentOutcomes, UploadedAsset, SponsorBanner, KnockoutFixture, PublicPrizePool, Company, CompanyInvitation } from "./types";
import { TournamentPredictionsView } from "./components/TournamentPredictionsView";
import { AdminTournamentOutcomes } from "./components/AdminTournamentOutcomes";
import { MatchResultsTicker } from "./components/MatchResultsTicker";

const createEmojiAvatar = (emoji: string, background: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="32" fill="${background}"/>
      <circle cx="60" cy="60" r="46" fill="rgba(255,255,255,0.18)"/>
      <text x="60" y="73" text-anchor="middle" font-size="56" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const hasManagedPopupContent = (torneo?: TorneoConfig | null) => {
  if (!torneo?.popupEnabled) return false;
  const hasPopupContent = Boolean(torneo.popupMessage?.trim() || torneo.popupImageUrl || torneo.popupTitle?.trim());
  if (!hasPopupContent) return false;
  return true;
};

const AVATARS = [
  createEmojiAvatar("⚽", "#059669"),
  createEmojiAvatar("🏆", "#f59e0b"),
  createEmojiAvatar("🦁", "#d97706"),
  createEmojiAvatar("🐯", "#ea580c"),
  createEmojiAvatar("🦅", "#2563eb"),
  createEmojiAvatar("🐺", "#475569"),
  createEmojiAvatar("🐼", "#111827"),
  createEmojiAvatar("🦊", "#f97316"),
  createEmojiAvatar("🐵", "#a16207"),
  createEmojiAvatar("🐸", "#16a34a"),
  createEmojiAvatar("🐙", "#7c3aed"),
  createEmojiAvatar("🦈", "#0284c7"),
  createEmojiAvatar("🐉", "#15803d"),
  createEmojiAvatar("🦄", "#c026d3"),
  createEmojiAvatar("🐲", "#047857"),
  createEmojiAvatar("🐻", "#92400e"),
  createEmojiAvatar("🐨", "#64748b"),
  createEmojiAvatar("🐶", "#b45309"),
  createEmojiAvatar("🐱", "#db2777"),
  createEmojiAvatar("🐰", "#e11d48"),
  createEmojiAvatar("🤖", "#334155"),
  createEmojiAvatar("👽", "#65a30d"),
  createEmojiAvatar("🚀", "#4f46e5"),
  createEmojiAvatar("🌎", "#0f766e"),
  createEmojiAvatar("🔥", "#dc2626")
];

const COUNTRY_OPTIONS = [
  { name: "Colombia", flag: "🇨🇴" },
  { name: "México", flag: "🇲🇽" },
  { name: "Sudáfrica", flag: "🇿🇦" },
  { name: "Rep. de Corea", flag: "🇰🇷" },
  { name: "Rep. Checa", flag: "🇨🇿" },
  { name: "Canadá", flag: "🇨🇦" },
  { name: "Bosnia y Herzegovina", flag: "🇧🇦" },
  { name: "Estados Unidos", flag: "🇺🇸" },
  { name: "Paraguay", flag: "🇵🇾" },
  { name: "Catar", flag: "🇶🇦" },
  { name: "Suiza", flag: "🇨🇭" },
  { name: "Brasil", flag: "🇧🇷" },
  { name: "Marruecos", flag: "🇲🇦" },
  { name: "Haití", flag: "🇭🇹" },
  { name: "Escocia", flag: "🏴" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Turquía", flag: "🇹🇷" },
  { name: "Alemania", flag: "🇩🇪" },
  { name: "Curazao", flag: "🇨🇼" },
  { name: "Países Bajos", flag: "🇳🇱" },
  { name: "Japón", flag: "🇯🇵" },
  { name: "Costa de Marfil", flag: "🇨🇮" },
  { name: "Ecuador", flag: "🇪🇨" },
  { name: "Suecia", flag: "🇸🇪" },
  { name: "Túnez", flag: "🇹🇳" },
  { name: "España", flag: "🇪🇸" },
  { name: "Cabo Verde", flag: "🇨🇻" },
  { name: "Bélgica", flag: "🇧🇪" },
  { name: "Egipto", flag: "🇪🇬" },
  { name: "Arabia Saudí", flag: "🇸🇦" },
  { name: "Uruguay", flag: "🇺🇾" },
  { name: "Irán", flag: "🇮🇷" },
  { name: "Nueva Zelanda", flag: "🇳🇿" },
  { name: "Francia", flag: "🇫🇷" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Irak", flag: "🇮🇶" },
  { name: "Noruega", flag: "🇳🇴" },
  { name: "Argentina", flag: "🇦🇷" },
  { name: "Argelia", flag: "🇩🇿" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Jordania", flag: "🇯🇴" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "RD Congo", flag: "🇨🇩" },
  { name: "Inglaterra", flag: "🏴" },
  { name: "Croacia", flag: "🇭🇷" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Panamá", flag: "🇵🇦" },
  { name: "Uzbekistán", flag: "🇺🇿" },
  { name: "Otro", flag: "🌍" }
];

const COUNTRY_FLAGS = Object.fromEntries(COUNTRY_OPTIONS.map((country) => [country.name, country.flag]));

const COUNTRY_ALIASES: Record<string, string> = {
  CO: "Colombia",
  COL: "Colombia",
  US: "Estados Unidos",
  USA: "Estados Unidos",
  MX: "México",
  MEX: "México",
  BR: "Brasil",
  BRA: "Brasil",
  AR: "Argentina",
  ARG: "Argentina",
  ES: "España",
  ESP: "España"
};

const normalizeCountryName = (country?: string) => {
  const value = String(country || "").trim();
  if (!value) return "Colombia";
  return COUNTRY_ALIASES[value.toUpperCase()] || value;
};

const getCountryFlag = (country?: string) => COUNTRY_FLAGS[normalizeCountryName(country)] || "🌍";

const COUNTRY_SHORT_CODES: Record<string, string> = {
  Colombia: "COL",
  México: "MEX",
  Sudáfrica: "ZAF",
  "Rep. de Corea": "KOR",
  "Rep. Checa": "CZE",
  Canadá: "CAN",
  "Bosnia y Herzegovina": "BIH",
  "Estados Unidos": "USA",
  Paraguay: "PAR",
  Catar: "QAT",
  Suiza: "SUI",
  Brasil: "BRA",
  Marruecos: "MAR",
  Haití: "HAI",
  Escocia: "SCO",
  Australia: "AUS",
  Turquía: "TUR",
  Alemania: "GER",
  Curazao: "CUW",
  "Países Bajos": "NED",
  Japón: "JPN",
  "Costa de Marfil": "CIV",
  Ecuador: "ECU",
  Suecia: "SWE",
  Túnez: "TUN",
  España: "ESP",
  "Cabo Verde": "CPV",
  Bélgica: "BEL",
  Egipto: "EGY",
  "Arabia Saudí": "KSA",
  Uruguay: "URU",
  Irán: "IRN",
  "Nueva Zelanda": "NZL",
  Francia: "FRA",
  Senegal: "SEN",
  Irak: "IRQ",
  Noruega: "NOR",
  Argentina: "ARG",
  Argelia: "ALG",
  Austria: "AUT",
  Jordania: "JOR",
  Portugal: "POR",
  "RD Congo": "COD",
  Inglaterra: "ENG",
  Croacia: "CRO",
  Ghana: "GHA",
  Panamá: "PAN",
  Uzbekistán: "UZB",
  Otro: "OTR"
};

const getCountryShortCode = (country?: string) => {
  const normalized = normalizeCountryName(country);
  return COUNTRY_SHORT_CODES[normalized] || normalized.slice(0, 3).toUpperCase();
};

const getCountryOptionLabel = (country: { name: string; flag: string }) => `${country.flag} ${getCountryShortCode(country.name)}`;

const STAGES = [
  "Todos",
  "Grupo A", "Grupo B", "Grupo C", "Grupo D",
  "Grupo E", "Grupo F", "Grupo G", "Grupo H",
  "Grupo I", "Grupo J", "Grupo K", "Grupo L",
  "16avos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal", "Tercer Puesto", "Final"
];

const GROUP_STAGE_NAMES = STAGES.filter((stage) => stage.startsWith("Grupo "));
const KNOCKOUT_STAGE_ORDER = ["16avos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal", "Tercer Puesto", "Final"];

const DATE_LOCALES: Record<string, string> = {
  es: "es-CO",
  en: "en-US",
  pt: "pt-BR",
  fr: "fr-FR",
  it: "it-IT",
  de: "de-DE",
  ar: "ar",
  ja: "ja-JP",
  ko: "ko-KR",
  ru: "ru-RU"
};

const UI_COPY_BY_LANG: Record<string, Record<string, string>> = {
  es: {
    all: "Todos",
    group: "Grupo",
    round32: "16avos de Final",
    round16: "Octavos de Final",
    quarterfinal: "Cuartos de Final",
    semifinal: "Semifinal",
    third_place: "Tercer Puesto",
    final: "Final",
    finished: "Finalizado",
    live_locked: "En curso / Bloqueado",
    locked: "Bloqueado",
    closes_in_min: "Cierra en {value} min",
    closes_in_hours: "Cierra en {value} horas",
    closes_in_days: "Cierra en {value} días",
    next_3_matches: "Próximos 3 Partidos",
    live_ticker: "En Vivo",
    match_number: "Partido #{id}",
    exact_score: "Marcador Exacto",
    real_draw: "Resultado Acertado",
    participation: "Participación",
    unknown: "Desconocido",
    bogota: "Bogotá"
  },
  en: {
    all: "All",
    group: "Group",
    round32: "Round of 32",
    round16: "Round of 16",
    quarterfinal: "Quarterfinals",
    semifinal: "Semifinal",
    third_place: "Third Place",
    final: "Final",
    finished: "Finished",
    live_locked: "Live / Locked",
    locked: "Locked",
    closes_in_min: "Closes in {value} min",
    closes_in_hours: "Closes in {value} hours",
    closes_in_days: "Closes in {value} days",
    next_3_matches: "Next 3 Matches",
    live_ticker: "Live Ticker",
    match_number: "Match #{id}",
    exact_score: "Exact Score",
    real_draw: "Correct Outcome",
    participation: "Participation",
    unknown: "Unknown",
    bogota: "Bogota"
  },
  pt: {
    all: "Todos",
    group: "Grupo",
    round32: "16 avos de final",
    round16: "Oitavas de final",
    quarterfinal: "Quartas de final",
    semifinal: "Semifinal",
    third_place: "Terceiro lugar",
    final: "Final",
    finished: "Finalizado",
    live_locked: "Em andamento / Bloqueado",
    locked: "Bloqueado",
    closes_in_min: "Fecha em {value} min",
    closes_in_hours: "Fecha em {value} horas",
    closes_in_days: "Fecha em {value} dias",
    next_3_matches: "Próximas 3 partidas",
    live_ticker: "Ao vivo",
    match_number: "Partida #{id}",
    exact_score: "Placar exato",
    real_draw: "Resultado correto",
    participation: "Participação",
    unknown: "Desconhecido",
    bogota: "Bogotá"
  },
  fr: {
    all: "Tous",
    group: "Groupe",
    round32: "Seizièmes de finale",
    round16: "Huitièmes de finale",
    quarterfinal: "Quarts de finale",
    semifinal: "Demi-finale",
    third_place: "Troisième place",
    final: "Finale",
    finished: "Terminé",
    live_locked: "En cours / Verrouillé",
    locked: "Verrouillé",
    closes_in_min: "Ferme dans {value} min",
    closes_in_hours: "Ferme dans {value} h",
    closes_in_days: "Ferme dans {value} jours",
    next_3_matches: "3 prochains matchs",
    live_ticker: "En direct",
    match_number: "Match #{id}",
    exact_score: "Score exact",
    real_draw: "Résultat correct",
    participation: "Participation",
    unknown: "Inconnu",
    bogota: "Bogotá"
  },
  it: {
    all: "Tutti",
    group: "Gruppo",
    round32: "Sedicesimi di finale",
    round16: "Ottavi di finale",
    quarterfinal: "Quarti di finale",
    semifinal: "Semifinale",
    third_place: "Terzo posto",
    final: "Finale",
    finished: "Terminato",
    live_locked: "In corso / Bloccato",
    locked: "Bloccato",
    closes_in_min: "Chiude tra {value} min",
    closes_in_hours: "Chiude tra {value} ore",
    closes_in_days: "Chiude tra {value} giorni",
    next_3_matches: "Prossime 3 partite",
    live_ticker: "Live",
    match_number: "Partita #{id}",
    exact_score: "Risultato esatto",
    real_draw: "Esito corretto",
    participation: "Partecipazione",
    unknown: "Sconosciuto",
    bogota: "Bogotà"
  },
  de: {
    all: "Alle",
    group: "Gruppe",
    round32: "Runde der 32",
    round16: "Achtelfinale",
    quarterfinal: "Viertelfinale",
    semifinal: "Halbfinale",
    third_place: "Spiel um Platz 3",
    final: "Finale",
    finished: "Beendet",
    live_locked: "Live / Gesperrt",
    locked: "Gesperrt",
    closes_in_min: "Schließt in {value} Min.",
    closes_in_hours: "Schließt in {value} Std.",
    closes_in_days: "Schließt in {value} Tagen",
    next_3_matches: "Nächste 3 Spiele",
    live_ticker: "Live",
    match_number: "Spiel #{id}",
    exact_score: "Exaktes Ergebnis",
    real_draw: "Richtiges Ergebnis",
    participation: "Teilnahme",
    unknown: "Unbekannt",
    bogota: "Bogotá"
  },
  ar: {
    all: "الكل",
    group: "المجموعة",
    round32: "دور الـ32",
    round16: "دور الـ16",
    quarterfinal: "ربع النهائي",
    semifinal: "نصف النهائي",
    third_place: "المركز الثالث",
    final: "النهائي",
    finished: "انتهت",
    live_locked: "جارية / مقفلة",
    locked: "مقفلة",
    closes_in_min: "يغلق خلال {value} دقيقة",
    closes_in_hours: "يغلق خلال {value} ساعة",
    closes_in_days: "يغلق خلال {value} يوم",
    next_3_matches: "المباريات الثلاث القادمة",
    live_ticker: "مباشر",
    match_number: "المباراة #{id}",
    exact_score: "نتيجة دقيقة",
    real_draw: "نتيجة صحيحة",
    participation: "مشاركة",
    unknown: "غير معروف",
    bogota: "بوغوتا"
  },
  ja: {
    all: "すべて",
    group: "グループ",
    round32: "ラウンド32",
    round16: "ラウンド16",
    quarterfinal: "準々決勝",
    semifinal: "準決勝",
    third_place: "3位決定戦",
    final: "決勝",
    finished: "終了",
    live_locked: "進行中 / ロック中",
    locked: "ロック中",
    closes_in_min: "{value}分で締切",
    closes_in_hours: "{value}時間で締切",
    closes_in_days: "{value}日で締切",
    next_3_matches: "次の3試合",
    live_ticker: "ライブ",
    match_number: "試合 #{id}",
    exact_score: "スコア的中",
    real_draw: "結果的中",
    participation: "参加",
    unknown: "不明",
    bogota: "ボゴタ"
  },
  ko: {
    all: "전체",
    group: "조",
    round32: "32강",
    round16: "16강",
    quarterfinal: "8강",
    semifinal: "준결승",
    third_place: "3위 결정전",
    final: "결승",
    finished: "종료",
    live_locked: "진행 중 / 잠김",
    locked: "잠김",
    closes_in_min: "{value}분 후 마감",
    closes_in_hours: "{value}시간 후 마감",
    closes_in_days: "{value}일 후 마감",
    next_3_matches: "다음 3경기",
    live_ticker: "라이브",
    match_number: "경기 #{id}",
    exact_score: "정확한 점수",
    real_draw: "정확한 결과",
    participation: "참여",
    unknown: "알 수 없음",
    bogota: "보고타"
  },
  ru: {
    all: "Все",
    group: "Группа",
    round32: "1/16 финала",
    round16: "1/8 финала",
    quarterfinal: "Четвертьфинал",
    semifinal: "Полуфинал",
    third_place: "Матч за 3-е место",
    final: "Финал",
    finished: "Завершен",
    live_locked: "Идет / Закрыто",
    locked: "Закрыто",
    closes_in_min: "Закроется через {value} мин",
    closes_in_hours: "Закроется через {value} ч",
    closes_in_days: "Закроется через {value} дн.",
    next_3_matches: "Следующие 3 матча",
    live_ticker: "Онлайн",
    match_number: "Матч #{id}",
    exact_score: "Точный счет",
    real_draw: "Верный исход",
    participation: "Участие",
    unknown: "Неизвестно",
    bogota: "Богота"
  }
};

const TEAM_COUNTRY_CODES: Record<string, string> = {
  "alemania": "DE",
  "arabia saudita": "SA",
  "arabia saudi": "SA",
  "argelia": "DZ",
  "argentina": "AR",
  "australia": "AU",
  "austria": "AT",
  "belgica": "BE",
  "bosnia y herzegovina": "BA",
  "brasil": "BR",
  "cabo verde": "CV",
  "camerun": "CM",
  "canada": "CA",
  "catar": "QA",
  "chile": "CL",
  "colombia": "CO",
  "corea del sur": "KR",
  "costa de marfil": "CI",
  "costa rica": "CR",
  "croacia": "HR",
  "curazao": "CW",
  "dinamarca": "DK",
  "ecuador": "EC",
  "egipto": "EG",
  "espana": "ES",
  "estados unidos": "US",
  "francia": "FR",
  "ghana": "GH",
  "haiti": "HT",
  "honduras": "HN",
  "irak": "IQ",
  "iran": "IR",
  "jamaica": "JM",
  "japon": "JP",
  "jordania": "JO",
  "marruecos": "MA",
  "mexico": "MX",
  "nigeria": "NG",
  "noruega": "NO",
  "nueva zelanda": "NZ",
  "paises bajos": "NL",
  "panama": "PA",
  "paraguay": "PY",
  "polonia": "PL",
  "portugal": "PT",
  "rd congo": "CD",
  "republica checa": "CZ",
  "rep de corea": "KR",
  "rep checa": "CZ",
  "ri de iran": "IR",
  "senegal": "SN",
  "sudafrica": "ZA",
  "suecia": "SE",
  "suiza": "CH",
  "tunez": "TN",
  "turquia": "TR",
  "ucrania": "UA",
  "uruguay": "UY",
  "uzbekistan": "UZ",
  "venezuela": "VE"
};

const TEAM_MANUAL_TRANSLATIONS: Record<string, Record<string, string>> = {
  england: { es: "Inglaterra", en: "England", pt: "Inglaterra", fr: "Angleterre", it: "Inghilterra", de: "England", ar: "إنجلترا", ja: "イングランド", ko: "잉글랜드", ru: "Англия" },
  scotland: { es: "Escocia", en: "Scotland", pt: "Escócia", fr: "Écosse", it: "Scozia", de: "Schottland", ar: "اسكتلندا", ja: "スコットランド", ko: "스코틀랜드", ru: "Шотландия" }
};

const normalizeLookupKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .toLowerCase()
    .trim();

const FLAGS_MAP: Record<string, string> = {
  "Estados Unidos": "🇺🇸",
  "Panamá": "🇵🇦",
  "Austria": "🇦🇹",
  "Camerún": "🇨🇲",
  "Canadá": "🇨🇦",
  "Costa de Marfil": "🇨🇮",
  "Escocia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Irak": "🇮🇶",
  "México": "🇲🇽",
  "Suecia": "🇸🇪",
  "Ghana": "🇬🇭",
  "Jamaica": "🇯🇲",
  "Argentina": "🇦🇷",
  "Polonia": "🇵🇱",
  "Ecuador": "🇪🇨",
  "Nueva Zelanda": "🇳🇿",
  "Brasil": "🇧🇷",
  "Corea del Sur": "🇰🇷",
  "Turquía": "🇹🇷",
  "Egipto": "🇪🇬",
  "Francia": "🇫🇷",
  "Colombia": "🇨🇴",
  "Ucrania": "🇺🇦",
  "Australia": "🇦🇺",
  "España": "🇪🇸",
  "Japón": "🇯🇵",
  "Argelia": "🇩🇿",
  "Honduras": "🇭🇳",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Chile": "🇨🇱",
  "Noruega": "🇳🇴",
  "Arabia Saudita": "🇸🇦",
  "Portugal": "🇵🇹",
  "Países Bajos": "🇳🇱",
  "Senegal": "🇸🇳",
  "Costa Rica": "🇨🇷",
  "Bélgica": "🇧🇪",
  "Suiza": "🇨🇭",
  "Irán": "🇮🇷",
  "Venezuela": "🇻🇪",
  "Italia": "🇮🇹",
  "Paraguay": "🇵🇾",
  "Dinamarca": "🇩🇰",
  "Marruecos": "🇲🇦",
  "Alemania": "🇩🇪",
  "Uruguay": "🇺🇾",
  "Croacia": "🇭🇷",
  "Nigeria": "🇳🇬",
  "Arabia Saudí": "🇸🇦",
  "RI de Irán": "🇮🇷",
  "Rep. de Corea": "🇰🇷",
  "Rep. Checa": "🇨🇿",
  "República Checa": "🇨🇿",
  "República de Corea": "🇰🇷",
  "Sudáfrica": "🇿🇦",
  "Bosnia y Herzegovina": "🇧🇦",
  "Cabo Verde": "🇨🇻",
  "Catar": "🇶🇦",
  "Curazao": "🇨🇼",
  "Haití": "🇭🇹",
  "Jordania": "🇯🇴",
  "RD Congo": "🇨🇩",
  "Túnez": "🇹🇳",
  "Uzbekistán": "🇺🇿"
};

const FLAGS_CODE_MAP: Record<string, string> = {
  "Estados Unidos": "us",
  "Panamá": "pa",
  "Austria": "at",
  "Camerún": "cm",
  "Canadá": "ca",
  "Costa de Marfil": "ci",
  "Escocia": "gb-sct",
  "Irak": "iq",
  "México": "mx",
  "Suecia": "se",
  "Ghana": "gh",
  "Jamaica": "jm",
  "Argentina": "ar",
  "Polonia": "pl",
  "Ecuador": "ec",
  "Nueva Zelanda": "nz",
  "Brasil": "br",
  "Corea del Sur": "kr",
  "Turquía": "tr",
  "Egipto": "eg",
  "Francia": "fr",
  "Colombia": "co",
  "Ucrania": "ua",
  "Australia": "au",
  "España": "es",
  "Japón": "jp",
  "Argelia": "dz",
  "Honduras": "hn",
  "Inglaterra": "gb-eng",
  "Chile": "cl",
  "Noruega": "no",
  "Arabia Saudita": "sa",
  "Portugal": "pt",
  "Países Bajos": "nl",
  "Senegal": "sn",
  "Costa Rica": "cr",
  "Bélgica": "be",
  "Suiza": "ch",
  "Irán": "ir",
  "Venezuela": "ve",
  "Italia": "it",
  "Paraguay": "py",
  "Dinamarca": "dk",
  "Marruecos": "ma",
  "Alemania": "de",
  "Uruguay": "uy",
  "Croacia": "hr",
  "Nigeria": "ng",
  "Arabia Saudí": "sa",
  "RI de Irán": "ir",
  "Rep. de Corea": "kr",
  "Rep. Checa": "cz",
  "República Checa": "cz",
  "República de Corea": "kr",
  "Sudáfrica": "za",
  "Bosnia y Herzegovina": "ba",
  "Cabo Verde": "cv",
  "Catar": "qa",
  "Curazao": "cw",
  "Haití": "ht",
  "Jordania": "jo",
  "RD Congo": "cd",
  "Túnez": "tn",
  "Uzbekistán": "uz"
};

const FLAGS_CODE_ALIAS_MAP: Record<string, string> = {
  "south korea": "kr",
  "korea republic": "kr",
  "rep de corea": "kr",
  "republica de corea": "kr",
  "czech republic": "cz",
  "czechia": "cz",
  "rep checa": "cz",
  "bosnia herzegovina": "ba",
  "bosnia and herzegovina": "ba",
  "bosnia y herzegovina": "ba",
  "cape verde islands": "cv",
  "cape verde": "cv",
  "cabo verde": "cv",
  "qatar": "qa",
  "catar": "qa",
  "haiti": "ht",
  "rd congo": "cd",
  "congo dr": "cd",
  "dr congo": "cd",
  "tunisia": "tn",
  "curacao": "cw",
  "curazao": "cw",
  "ivory coast": "ci",
  "cote d ivoire": "ci",
  "costa de marfil": "ci",
  "jordan": "jo",
  "jordania": "jo",
  "algeria": "dz",
  "argelia": "dz",
  "uzbekistan": "uz"
};

export function getTeamFlag(teamName: string): React.ReactNode {
  if (!teamName) return <span className="select-none">🏳️</span>;
  const norm = teamName.trim();
  const code = FLAGS_CODE_MAP[norm] || FLAGS_CODE_ALIAS_MAP[normalizeLookupKey(norm)];
  if (code) {
    return (
      <span className="inline-flex items-center justify-center select-none" style={{ verticalAlign: "middle" }}>
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          alt={norm}
          className="inline-block w-5 h-3.5 object-cover rounded-xs border border-slate-200/60"
          style={{ display: "inline-block", verticalAlign: "middle" }}
          referrerPolicy="no-referrer"
          onError={(e) => {
            // fallback
            (e.currentTarget as HTMLImageElement).style.display = "none";
            const sibling = e.currentTarget.nextElementSibling;
            if (sibling) {
              (sibling as HTMLElement).style.display = "inline";
            }
          }}
        />
        <span className="hidden select-none">{FLAGS_MAP[norm] || "🏳️"}</span>
      </span>
    );
  }
  return <span className="select-none">{FLAGS_MAP[norm] || "🏳️"}</span>;
}

// Custom Soccer Ball SVG Icon
export function SoccerBallIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} fill="currentColor">
      <path d="M256,0C114.6,0,0,114.6,0,256s114.6,256,256,256s256-114.6,256-256S397.4,0,256,0z M176,144h160v32l-32,32h-96l-32-32V144z M112,240l48-48h32l32,32v64l-32,32h-48L112,240z M208,368h96l32-32v-32l-32-32h-96l-32,32v32L208,368z M352,252l48-48h16l16,16v80l-32,32h-16l-32-32V252z" />
      <circle cx="256" cy="256" r="236" fill="none" stroke="currentColor" strokeWidth="24" />
      <polygon points="256,180 310,220 290,280 222,280 202,220" fill="currentColor" />
      <line x1="256" y1="180" x2="256" y2="120" stroke="currentColor" strokeWidth="12" />
      <line x1="310" y1="220" x2="368" y2="195" stroke="currentColor" strokeWidth="12" />
      <line x1="290" y1="280" x2="330" y2="335" stroke="currentColor" strokeWidth="12" />
      <line x1="222" y1="280" x2="182" y2="335" stroke="currentColor" strokeWidth="12" />
      <line x1="202" y1="220" x2="144" y2="195" stroke="currentColor" strokeWidth="12" />
    </svg>
  );
}

// Translations map for multilingual support (10 languages)
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  es: {
    title: "Polla Mundialista 2026",
    subtitle: "Consigue puntos prediciendo resultados reales",
    welcome: "¡Bienvenido de nuevo!",
    points: "PUNTUACIÓN",
    predictions: "PRONÓSTICOS",
    menu_user: "Menú Usuario",
    tab_dashboard: "Mi Resumen & Estadísticas",
    tab_predictions: "Calendario & Pronósticos",
    tab_ranking: "Tabla de Clasificación",
    tab_rules: "Reglas y Premiaciones",
    admin_title: "ADMINISTRACIÓN",
    admin_stats: "Dashboard & Métricas",
    admin_users: "Gestión de Usuarios",
    admin_matches: "Gestión de Partidos",
    admin_announcement: "Publicar Comunicados",
    admin_config: "Políticas de la Polla",
    next_match: "Próximo Partido",
    notif_title: "Alertas",
    mark_read: "Marcar todo leído",
    logout: "Cerrar Sesión",
    change_theme: "Tema",
    theme_light: "Claro",
    theme_dark: "Oscuro",
    theme_system: "Sistema",
    search_team: "Buscar equipo",
    stage: "Etapa",
    status: "Estado",
    db_title: "Mi Resumen & Evolución de Puntos",
    db_desc: "Sigue tu progreso, aciertos y estadísticas particulares",
    db_my_points: "MIS PUNTOS TOTALES",
    db_my_points_sub: "🏅 Clasificación actual",
    db_exact: "MARCADOR EXACTO (25/35 pts)",
    db_exact_hits: "aciertos",
    db_exact_sub: "Aciertos exactos oficiales",
    db_draw: "RESULTADO ACERTADO (15 pts)",
    db_draw_hits: "aciertos",
    db_draw_sub: "Resultados acertados sin marcador exacto",
    db_estimated: "PARTIDOS ESTIMADOS",
    db_estimated_sub: "Pronósticos realizados",
    db_evolution: "Gráfico de Evolución Temporal",
    db_evolution_cron: "Cronológico",
    db_evolution_desc: "Muestra la acumulación de puntos tras finalizar partidos",
    db_no_predictions: "Inicia a registrar pronósticos para registrar tu avance temporal.",
    db_phase_init: "Fase Inicial",
    db_phase_end: "Fase Finalizada",
    db_admin_announcements: "Avisos del Administrador 📢",
    db_admin_official: "Boletín Oficial",
    db_no_announcements: "No hay comunicados oficiales activos en este momento.",
    db_account_pref: "Mi Cuenta & Preferencias",
    db_label_name: "Nombre para clasificación",
    db_label_pass: "Nueva Contraseña (Dejar vacío para conservar actual)",
    db_label_pass_placeholder: "Mínimo 4 caracteres",
    db_email_notif: "Deseo suscribirme y autorizo envío de notificaciones de mi ranking por correo electrónico",
    db_btn_save: "Guardar Perfil"
  },
  en: {
    title: "World Cup Bracket 2026",
    subtitle: "Earn points by predicting real-life results",
    welcome: "Welcome back!",
    points: "TOTAL POINTS",
    predictions: "PREDICTIONS",
    menu_user: "User Menu",
    tab_dashboard: "My Summary & Stats",
    tab_predictions: "Schedule & Predictions",
    tab_ranking: "Leaderboard Ranking",
    tab_rules: "Rules and Prizes",
    admin_title: "ADMINISTRATION",
    admin_stats: "Dashboard & Metrics",
    admin_users: "Manage Users",
    admin_matches: "Manage Matches",
    admin_announcement: "Publish Announcements",
    admin_config: "Tournament Policies",
    next_match: "Next Match",
    notif_title: "Alerts",
    mark_read: "Mark all read",
    logout: "Sign Out",
    change_theme: "Theme",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_system: "System",
    search_team: "Search team",
    stage: "Stage",
    status: "Status",
    db_title: "My Summary & Points Evolution",
    db_desc: "Track your progress, details, and personal stats",
    db_my_points: "MY TOTAL POINTS",
    db_my_points_sub: "🏅 Current standing",
    db_exact: "EXACT SCORE (25/35 pts)",
    db_exact_hits: "hits",
    db_exact_sub: "Official exact predictions",
    db_draw: "CORRECT OUTCOME (15 pts)",
    db_draw_hits: "hits",
    db_draw_sub: "Guessed winners or draws (non-exact)",
    db_estimated: "PREDICTED MATCHES",
    db_estimated_sub: "Registered submissions",
    db_evolution: "Points Progress Timeline",
    db_evolution_cron: "Timeline",
    db_evolution_desc: "Shows accumulated points as matches end",
    db_no_predictions: "Start making predictions to track your progress over time.",
    db_phase_init: "Initial Stage",
    db_phase_end: "Completed Stage",
    db_admin_announcements: "Administrator Bulletins 📢",
    db_admin_official: "Official Bulletin",
    db_no_announcements: "No official active announcements at the moment.",
    db_account_pref: "My Account & Settings",
    db_label_name: "Display Name for leaderboards",
    db_label_pass: "New Password (Leave blank to keep current)",
    db_label_pass_placeholder: "Minimum 4 characters",
    db_email_notif: "I consent to subscribe and receive ranking notifications via email",
    db_btn_save: "Save Profile Settings"
  },
  pt: {
    title: "Bolão da Copa 2026",
    subtitle: "Ganhe pontos prevendo resultados reais",
    welcome: "Bem-vindo de volta!",
    points: "PONTOS TOTAIS",
    predictions: "PALPITES",
    menu_user: "Menu do Usuário",
    tab_dashboard: "Meu Resumo e Estatísticas",
    tab_predictions: "Calendário e Palpites",
    tab_ranking: "Classificação Geral",
    tab_rules: "Regras e Prêmios",
    admin_title: "ADMINISTRAÇÃO",
    admin_stats: "Painel e Métricas",
    admin_users: "Gerenciar Usuários",
    admin_matches: "Gerenciar Partidas",
    admin_announcement: "Publicar Comunicados",
    admin_config: "Políticas do Bolão",
    next_match: "Próxima Partida",
    notif_title: "Alertas",
    mark_read: "Marcar lidas",
    logout: "Sair",
    change_theme: "Tema",
    theme_light: "Claro",
    theme_dark: "Escuro",
    theme_system: "Sistema",
    search_team: "Buscar time",
    stage: "Fase",
    status: "Status",
    db_title: "Meu Resumo e Evolução de Pontos",
    db_desc: "Acompanhe seu progresso, acertos e estatísticas",
    db_my_points: "MEUS PONTOS TOTAIS",
    db_my_points_sub: "🏅 Posição atual",
    db_exact: "PLACAR EXATO (25/35 pts)",
    db_exact_hits: "acertos",
    db_exact_sub: "Palpites com placar exato",
    db_draw: "RESULTADO CORRETO (15 pts)",
    db_draw_hits: "empates",
    db_draw_sub: "Empates resultantes",
    db_estimated: "PALPITES REALIZADOS",
    db_estimated_sub: "Palpites salvos",
    db_evolution: "Histórico de Pontos",
    db_evolution_cron: "Cronológico",
    db_evolution_desc: "Mostra o acúmulo de pontos conforme os jogos terminam",
    db_no_predictions: "Comece a fazer palpites para acompanhar seu progresso.",
    db_phase_init: "Fase Inicial",
    db_phase_end: "Concluído",
    db_admin_announcements: "Avisos do Administrador 📢",
    db_admin_official: "Boletim Oficial",
    db_no_announcements: "Sem comunicados oficiais ativos no momento.",
    db_account_pref: "Minha Conta e Preferências",
    db_label_name: "Nome de exibição",
    db_label_pass: "Nova senha (deixe em branco para não alterar)",
    db_label_pass_placeholder: "Mínimo de 4 caracteres",
    db_email_notif: "Quero receber notificações do ranking por e-mail",
    db_btn_save: "Salvar Perfil"
  },
  fr: {
    title: "Prono Coupe du Monde 2026",
    subtitle: "Gagnez des points en prédisant les résultats réels",
    welcome: "Bon retour !",
    points: "POINTS TOTAUX",
    predictions: "PRONOSTICS",
    menu_user: "Menu Utilisateur",
    tab_dashboard: "Mon Résumé & Stats",
    tab_predictions: "Calendrier & Pronostics",
    tab_ranking: "Classement Général",
    tab_rules: "Règles & Prix",
    admin_title: "ADMINISTRATION",
    admin_stats: "Tableau de Bord & Métriques",
    admin_users: "Gérer les Utilisateurs",
    admin_matches: "Gérer les Matchs",
    admin_announcement: "Publier des Bulletins",
    admin_config: "Règles du Jeu",
    next_match: "Prochain Match",
    notif_title: "Alertes",
    mark_read: "Tout marquer lu",
    logout: "Déconnexion",
    change_theme: "Thème",
    theme_light: "Clair",
    theme_dark: "Sombre",
    theme_system: "Système",
    search_team: "Chercher équipe",
    stage: "Étape",
    status: "Statut",
    db_title: "Mon Résumé & Évolution des Points",
    db_desc: "Suivez votre progression, réussites et statistiques",
    db_my_points: "MES POINTS TOTAUX",
    db_my_points_sub: "🏅 Classement actuel",
    db_exact: "SCORE EXACT (25/35 pts)",
    db_exact_hits: "exacts",
    db_exact_sub: "Scores exacts réussis",
    db_draw: "RESULTAT CORRECT (15 pts)",
    db_draw_hits: "nuls",
    db_draw_sub: "Matchs nuls enregistrés",
    db_estimated: "MATCHS PRÉDITS",
    db_estimated_sub: "Pronostics soumis",
    db_evolution: "Progression des Points",
    db_evolution_cron: "Chronologique",
    db_evolution_desc: "Affiche le cumul des points après les matchs",
    db_no_predictions: "Commencez à pronostiquer pour voir votre évolution.",
    db_phase_init: "Étape Initiale",
    db_phase_end: "Terminé",
    db_admin_announcements: "Bulletins de l'Admin 📢",
    db_admin_official: "Bulletin Officiel",
    db_no_announcements: "Aucune annonce active pour le moment.",
    db_account_pref: "Compte & Préférences",
    db_label_name: "Nom d'affichage pour les classements",
    db_label_pass: "Nouveau mot de passe (laisser vide pour conserver)",
    db_label_pass_placeholder: "Minimum 4 caractères",
    db_email_notif: "Je souhaite recevoir les rapports de classement par courriel",
    db_btn_save: "Enregistrer le Profil"
  },
  it: {
    title: "Fanta Mondiale 2026",
    subtitle: "Guadagna punti indovinando i risultati reali",
    welcome: "Bentornato !",
    points: "PUNTI TOTALI",
    predictions: "PRONOSTICI",
    menu_user: "Menu Utente",
    tab_dashboard: "Mio Riepilogo e Statistiche",
    tab_predictions: "Calendario e Pronostici",
    tab_ranking: "Classifica Generale",
    tab_rules: "Regole e Premi",
    admin_title: "AMMINISTRAZIONE",
    admin_stats: "Cruscotto e Metriche",
    admin_users: "Gestione Utenti",
    admin_matches: "Gestione Partite",
    admin_announcement: "Invia Annunci",
    admin_config: "Regole del Pop",
    next_match: "Prossima Partita",
    notif_title: "Avvisi",
    mark_read: "Segna letti",
    logout: "Esci",
    change_theme: "Tema",
    theme_light: "Chiaro",
    theme_dark: "Scuro",
    theme_system: "Sistema",
    search_team: "Cerca squadra",
    stage: "Fase",
    status: "Stato",
    db_title: "Mio Riepilogo & Evoluzione Punti",
    db_desc: "Segui i tuoi progressi, pronostici e statistiche",
    db_my_points: "MIEI PUNTI TOTALI",
    db_my_points_sub: "🏅 Posizione attuale",
    db_exact: "RISULTATO ESATTO (15 pt)",
    db_exact_hits: "centrati",
    db_exact_sub: "Risultati esatti ufficiali",
    db_draw: "PAREGGIO INDOVINATO (10 pt)",
    db_draw_hits: "pareggi",
    db_draw_sub: "Pareggi registrati",
    db_estimated: "PARTITE ESTIMATE",
    db_estimated_sub: "Pronostici salvati",
    db_evolution: "Grafico dei Punti",
    db_evolution_cron: "Cronologico",
    db_evolution_desc: "Mostra l'accumulo dei punti dopo ogni partita",
    db_no_predictions: "Fai i tuoi pronostici per visualizzare la progressione.",
    db_phase_init: "Fase Iniziale",
    db_phase_end: "Fase Finale",
    db_admin_announcements: "Avvisi dell'Amministratore 📢",
    db_admin_official: "Bollettino Ufficiale",
    db_no_announcements: "Nessun annuncio attivo al momento.",
    db_account_pref: "Profilo & Preferenze",
    db_label_name: "Nome da mostrare in classifica",
    db_label_pass: "Nuova password (lascia vuoto per mantenere)",
    db_label_pass_placeholder: "Minimo 4 caratteri",
    db_email_notif: "Desidero ricevere via email gli aggiornamenti della classifica",
    db_btn_save: "Salva Profilo"
  },
  de: {
    title: "WM Tippspiel 2026",
    subtitle: "Sammle Punkte durch die Vorhersage echter Ergebnisse",
    welcome: "Willkommen zurück !",
    points: "PUNKTE GESAMT",
    predictions: "TIPPS REISEN",
    menu_user: "Benutzermenu",
    tab_dashboard: "Mein Dashboard & Statistiken",
    tab_predictions: "Spielplan & Tipps",
    tab_ranking: "Rangliste",
    tab_rules: "Regeln & Preise",
    admin_title: "ADMINISTRATION",
    admin_stats: "Dashboard & Kennzahlen",
    admin_users: "Benutzer verwalten",
    admin_matches: "Spiele verwalten",
    admin_announcement: "Mitteilungen veröffentlichen",
    admin_config: "Regeln & Einstellungen",
    next_match: "Nächstes Spiel",
    notif_title: "Benachrichtigungen",
    mark_read: "Alle lesen",
    logout: "Abmelden",
    change_theme: "Design",
    theme_light: "Hell",
    theme_dark: "Dunkel",
    theme_system: "System",
    search_team: "Team suchen",
    stage: "Phase",
    status: "Status",
    db_title: "Mein Überblick & Punkteentwicklung",
    db_desc: "Verfolge deinen Fortschritt, Treffer und Statistiken",
    db_my_points: "MEINE GESAMTPUNKTE",
    db_my_points_sub: "🏅 Aktuelle Platzierung",
    db_exact: "EXAKTES ERGEBNIS (15 Pkt)",
    db_exact_hits: "Treffer",
    db_exact_sub: "Offizielle exakte Vorhersagen",
    db_draw: "RICHTIGES UNENTSCHIEDEN (10 Pkt)",
    db_draw_hits: "Unentschieden",
    db_draw_sub: "Erzielte Unentschieden",
    db_estimated: "TIPP-SPIELE",
    db_estimated_sub: "Abgegebene Tipps",
    db_evolution: "Punkteverlauf",
    db_evolution_cron: "Chronologisch",
    db_evolution_desc: "Zeigt die Punkteentwicklung nach Spielende",
    db_no_predictions: "Gib Tipps ab, um deine Punkteentwicklung zu sehen.",
    db_phase_init: "Startphase",
    db_phase_end: "Finalrunde",
    db_admin_announcements: "Mitteilungen der Forumsleitung 📢",
    db_admin_official: "Offizielles Bulletin",
    db_no_announcements: "Zurzeit gibt es keine offiziellen Mitteilungen.",
    db_account_pref: "Mein Konto & Einstellungen",
    db_label_name: "Anzeigename auf dem Leaderboard",
    db_label_pass: "Neues Passwort (leer lassen für altes Passwort)",
    db_label_pass_placeholder: "Mindestens 4 Zeichen",
    db_email_notif: "Ranglistenübermittlung per E-Mail abonnieren",
    db_btn_save: "Profil speichern"
  },
  ar: {
    title: "توقع كأس العالم 2026",
    subtitle: "اكسب النقاط من خلال توقع النتائج الحقيقية",
    welcome: "مرحباً بعودتك !",
    points: "مجموع النقاط",
    predictions: "التوقعات الحقيقية",
    menu_user: "قائمة المستخدم",
    tab_dashboard: "ملخصي وإحصائياتي",
    tab_predictions: "الجدول والتوقعات",
    tab_ranking: "جدول الترتيب العام",
    tab_rules: "القواعد والجوائز",
    admin_title: "الإدارة والنظام",
    admin_stats: "لوحة التحكم والمقاييس",
    admin_users: "إدارة المستخدمين",
    admin_matches: "إدارة المباريات",
    admin_announcement: "نشر الإعلانات العامة",
    admin_config: "سياسات التوقع",
    next_match: "المباراة القادمة",
    notif_title: "التنبيهات",
    mark_read: "تحديد الكل كمقروء",
    logout: "تسجيل الخروج",
    change_theme: "المظهر الحالي",
    theme_light: "فاتح",
    theme_dark: "داكن",
    theme_system: "النظام",
    search_team: "البحث عن فريق",
    stage: "المرحلة",
    status: "الحالة",
    db_title: "ملخصي وتطور النقاط العام",
    db_desc: "تابع تقدمك، توقعاتك الصحيحة وإحصاءاتك الخاصة",
    db_my_points: "إجمالي نقاطي الكلية",
    db_my_points_sub: "🏅 الترتيب والمركز الحالي",
    db_exact: "النتيجة الدقيقة (15 نقطة)",
    db_exact_hits: "توقع صحيح",
    db_exact_sub: "التوقعات الدقيقة الرسمية المسجلة",
    db_draw: "تعادل صحيح (10 نقاط)",
    db_draw_hits: "تعادل",
    db_draw_sub: "التعادلات الناتجة",
    db_estimated: "المباريات المتوقعة",
    db_estimated_sub: "التوقعات المقدمة والمسجلة",
    db_evolution: "رسم بياني لتطور النقاط",
    db_evolution_cron: "زمني",
    db_evolution_desc: "يوضح تراكم النقاط بعد انتهاء المباريات",
    db_no_predictions: "ابدأ في تسجيل التوقعات لتتبع تقدمك بمرور الوقت.",
    db_phase_init: "المرحلة الأولى",
    db_phase_end: "المرحلة النهائية المكتملة",
    db_admin_announcements: "تنبيهات وإعلانات المسؤول 📢",
    db_admin_official: "النشرة الرسمية المعتمدة",
    db_no_announcements: "لا توجد إعلانات رسمية نشطة حالياً.",
    db_account_pref: "حسابي وإعداداتي المفضلة",
    db_label_name: "الاسم المعروض في اللوائح",
    db_label_pass: "كلمة مرور جديدة (اتركها فارغة للمحافظة على الحالية)",
    db_label_pass_placeholder: "4 رموز على الأقل",
    db_email_notif: "أرغب في الاشتراك وأصرح بإرسال تنبيهات الترتيب عبر البريد الإلكتروني",
    db_btn_save: "حفظ بيانات الملف الشخصي"
  },
  ja: {
    title: "ワールドカップ予想 2026",
    subtitle: "実際の試合結果を予想してポイントを獲得",
    welcome: "おかえりなさい !",
    points: "トータルポイント",
    predictions: "予想一覧",
    menu_user: "ユーザーメニュー",
    tab_dashboard: "ダッシュボードと統計",
    tab_predictions: "日程と予想登録",
    tab_ranking: "リーダーボード",
    tab_rules: "ルールと賞品案内",
    admin_title: "管理者システム",
    admin_stats: "ダッシュボードと指標",
    admin_users: "ユーザー管理",
    admin_matches: "試合データの管理",
    admin_announcement: "お知らせ掲載システム",
    admin_config: "予測ポリシーの設定",
    next_match: "次の対戦カード",
    notif_title: "通知アラート",
    mark_read: "すべて既読にする",
    logout: "ログアウトする",
    change_theme: "表示テーマ設定",
    theme_light: "ライトモード",
    theme_dark: "ダークモード",
    theme_system: "システム設定に同期",
    search_team: "チームを探す",
    stage: "ステージ",
    status: "試合ステータス",
    db_title: "ポイント獲得推移と概要サマリー",
    db_desc: "進捗、的中率、個別統計の確認はこちら",
    db_my_points: "獲得ポイント合計",
    db_my_points_sub: "🏅 現在の順位ランキング",
    db_exact: "スコア的中 (15点)",
    db_exact_hits: "的中",
    db_exact_sub: "公式に反映されたスコア的中数",
    db_draw: "引き分け的中 (10点)",
    db_draw_hits: "引き分け",
    db_draw_sub: "引き分け予想的中数",
    db_estimated: "予想済み試合サマリー",
    db_estimated_sub: "登録が完了した予想件数",
    db_evolution: "獲得ポイント推移グラフ",
    db_evolution_cron: "時系列",
    db_evolution_desc: "試合終了後の累計ポイント推移を表します",
    db_no_predictions: "時間経過に伴う統計を確認するために、まずは結果を予想してみましょう。",
    db_phase_init: "初期グループフェーズ",
    db_phase_end: "終了フェーズ",
    db_admin_announcements: "管理者からのお知らせ 📢",
    db_admin_official: "公式情報速報",
    db_no_announcements: "現在、アクティブな公式お知らせはありません。",
    db_account_pref: "アカウント設定 & 個人設定",
    db_label_name: "ランキング公開用ネーム",
    db_label_pass: "新しいパスワード（変更しない場合は空欄のままに）",
    db_label_pass_placeholder: "最低4文字以上で指定してください",
    db_email_notif: "ランキング変動結果を電子メールで受け取ることに同意します",
    db_btn_save: "プロフィール設定を更新"
  },
  ko: {
    title: "월드컵 예측 2026",
    subtitle: "실제 경기 결과를 예측하고 포인트를 획득하세요",
    welcome: "다시 오신 것을 환영합니다 !",
    points: "총 누적 포인트",
    predictions: "예측 기록",
    menu_user: "사용자 메뉴",
    tab_dashboard: "내 요약 및 통계 정보",
    tab_predictions: "일정 및 예측 등록",
    tab_ranking: "순위표 및 전적",
    tab_rules: "가이드 및 상금 정보",
    admin_title: "시스템 관리자 설정",
    admin_stats: "대시보드 및 통계 메트릭",
    admin_users: "사용자 정보 관리",
    admin_matches: "일정 및 결과 관리",
    admin_announcement: "공지사항 즉시 게시",
    admin_config: "경기 정보 정책 설정",
    next_match: "다음 오늘의 경기",
    notif_title: "실시간 알림",
    mark_read: "모두 읽음으로 표시",
    logout: "안전하게 로그아웃",
    change_theme: "테마 옵션 설정",
    theme_light: "라이트 모드",
    theme_dark: "다크 모드",
    theme_system: "시스템 테마에 맞춤",
    search_team: "특정 팀 검색",
    stage: "경기 단계",
    status: "결과 상태",
    db_title: "내 요약 분석 & 포인트 획득 그래프",
    db_desc: "진행 상황, 정확한 예측 및 개인 통계를 확인하세요",
    db_my_points: "내 총 포인트",
    db_my_points_sub: "🏅 실시간 내 순위 정보",
    db_exact: "정확한 스코어 (15점)",
    db_exact_hits: "맞춤",
    db_exact_sub: "공식 매칭된 정확한 스코어 기록",
    db_draw: "무승부 예측 적중 (10점)",
    db_draw_hits: "무승부 건",
    db_draw_sub: "최종 적중된 무승부 수",
    db_estimated: "예측을 등록한 경기",
    db_estimated_sub: "정상 제출 완료된 예측 수",
    db_evolution: "획득 포인트 누적 분석",
    db_evolution_cron: "날짜순 정렬",
    db_evolution_desc: "경기가 종료된 후 누적된 포인트를 보여줍니다",
    db_no_predictions: "데이터 추적을 시작하기 위해 첫 예측 기록 카드를 작성해 주세요.",
    db_phase_init: "시작 리그 상태",
    db_phase_end: "토너먼트 완료",
    db_admin_announcements: "시스템 공지사항 보드 📢",
    db_admin_official: "공식 브리핑",
    db_no_announcements: "현재 새로운 공지사항이 준비되지 않았습니다.",
    db_account_pref: "내 정보 관리 & 개인 설정",
    db_label_name: "가칭 닉네임 설정",
    db_label_pass: "새 비밀번호 (기존 정보 유지 시 공란)",
    db_label_pass_placeholder: "최소 4자 이상 입력해 주세요",
    db_email_notif: "매 판이 완료될 때마다 랭킹 상태를 이메일 알림으로 발송 허용",
    db_btn_save: "프로필 계정 정보 저장"
  },
  ru: {
    title: "Прогнозы ЧМ 2026",
    subtitle: "Получайте очки, угадывая реальные результаты",
    welcome: "С возвращением !",
    points: "НАБРАННЫЕ ОЧКИ",
    predictions: "ВАШИ ПРОГНОЗЫ",
    menu_user: "Меню пользователя",
    tab_dashboard: "Мои достижения и статистика",
    tab_predictions: "Расписание и прогнозы",
    tab_ranking: "Таблица участников",
    tab_rules: "Правила и призы",
    admin_title: "АДМИНИСТРИРОВАНИЕ",
    admin_stats: "Метрики и статистика",
    admin_users: "Управление пользователями",
    admin_matches: "Редактирование матчей",
    admin_announcement: "Опубликовать объявление",
    admin_config: "Политика турнира",
    next_match: "Следующий матч",
    notif_title: "Уведомления",
    mark_read: "Прочитать все",
    logout: "Выйти из системы",
    change_theme: "Оформление страницы",
    theme_light: "Светлая тема",
    theme_dark: "Темная тема",
    theme_system: "Системное оформление",
    search_team: "Поиск команды",
    stage: "Этап турнира",
    status: "Статус матча",
    db_title: "Мои достижения и динамика очков",
    db_desc: "Следите за своим прогрессом, попаданиями и личной статистикой",
    db_my_points: "МОИ ВСЕГО ОЧКОВ",
    db_my_points_sub: "🏅 Текущая позиция в рейтинге",
    db_exact: "ТОЧНЫЙ СЧЕТ (15 очков)",
    db_exact_hits: "угадал",
    db_exact_sub: "Точно угаданные счета",
    db_draw: "УГАНАННАЯ НИЧЬЯ (10 очков)",
    db_draw_hits: "ничьих",
    db_draw_sub: "Сыгранные вничью матчи",
    db_estimated: "ПРОГНОЗЫ НА МАТЧИ",
    db_estimated_sub: "Сделанные вами прогнозы",
    db_evolution: "График накопления очков",
    db_evolution_cron: "Хронология",
    db_evolution_desc: "Показывает изменение набранных очков по окончании матчей",
    db_no_predictions: "Сделайте свой первый прогноз, чтобы начать строить кривую очков.",
    db_phase_init: "Групповой этап",
    db_phase_end: "Завершено",
    db_admin_announcements: "Объявления администрации 📢",
    db_admin_official: "Официальный вестник",
    db_no_announcements: "В настоящий момент нет активных важных новостей.",
    db_account_pref: "Мой аккаунт и настройки предпочтений",
    db_label_name: "Отображаемое имя в рейтинге",
    db_label_pass: "Новый пароль (оставьте пустым для сохранения)",
    db_label_pass_placeholder: "Минимум 4 знака",
    db_email_notif: "Я согласен получать изменения рейтинга по электронной почте",
    db_btn_save: "Сохранить профиль"
  }
};

const AUTH_COPY_BY_LANG: Record<string, Record<string, string>> = {
  es: {
    auth_box_title: "Inicia Sesión o Regístrate",
    auth_box_subtitle: "Escribe tu correo para participar en la Polla del Mundial 2026",
    auth_public_name: "Nombre público para el ranking",
    auth_public_name_hint: "Será el nombre visible en la tabla de posiciones.",
    auth_country: "País",
    auth_country_hint: "Se mostrará en la tabla de clasificación.",
    auth_choose_avatar: "Elige un Avatar",
    auth_email: "Correo Electrónico",
    auth_password: "Contraseña",
    auth_confirm_password: "Confirmar contraseña",
    auth_confirm_placeholder: "Repite tu contraseña",
    auth_forgot: "¿Olvidó su contraseña?",
    auth_btn_login: "Ingresar a la Polla",
    auth_btn_register: "Crear Cuenta de Participante",
    auth_btn_recover: "Recuperar Contraseña",
    auth_no_account: "¿No tienes una cuenta aún?",
    auth_btn_register_now: "Regístrate gratis",
    auth_has_account: "¿Ya tienes una cuenta registrada?",
    auth_btn_login_now: "Inicia Sesión"
  },
  en: {
    auth_box_title: "Sign In or Register",
    auth_box_subtitle: "Enter your email to join the 2026 World Cup pool",
    auth_public_name: "Public leaderboard name",
    auth_public_name_hint: "This name will be visible in the standings.",
    auth_country: "Country",
    auth_country_hint: "It will be shown in the leaderboard.",
    auth_choose_avatar: "Choose an avatar",
    auth_email: "Email",
    auth_password: "Password",
    auth_confirm_password: "Confirm password",
    auth_confirm_placeholder: "Repeat your password",
    auth_forgot: "Forgot your password?",
    auth_btn_login: "Enter the Pool",
    auth_btn_register: "Create Participant Account",
    auth_btn_recover: "Recover Password",
    auth_no_account: "Don't have an account yet?",
    auth_btn_register_now: "Register free",
    auth_has_account: "Already registered?",
    auth_btn_login_now: "Sign in"
  },
  pt: {
    auth_box_title: "Entrar ou Registrar",
    auth_box_subtitle: "Digite seu e-mail para participar do Bolão da Copa 2026",
    auth_public_name: "Nome público no ranking",
    auth_public_name_hint: "Esse nome aparecerá na classificação.",
    auth_country: "País",
    auth_country_hint: "Será exibido na classificação.",
    auth_choose_avatar: "Escolha um avatar",
    auth_email: "E-mail",
    auth_password: "Senha",
    auth_confirm_password: "Confirmar senha",
    auth_confirm_placeholder: "Repita sua senha",
    auth_forgot: "Esqueceu sua senha?",
    auth_btn_login: "Entrar no Bolão",
    auth_btn_register: "Criar Conta",
    auth_btn_recover: "Recuperar Senha",
    auth_no_account: "Ainda não tem conta?",
    auth_btn_register_now: "Registre-se grátis",
    auth_has_account: "Já tem conta?",
    auth_btn_login_now: "Entrar"
  },
  fr: {
    auth_box_title: "Connexion ou Inscription",
    auth_box_subtitle: "Entrez votre e-mail pour participer au prono Coupe du Monde 2026",
    auth_public_name: "Nom public au classement",
    auth_public_name_hint: "Ce nom sera visible dans le classement.",
    auth_country: "Pays",
    auth_country_hint: "Il sera affiché dans le classement.",
    auth_choose_avatar: "Choisir un avatar",
    auth_email: "E-mail",
    auth_password: "Mot de passe",
    auth_confirm_password: "Confirmer le mot de passe",
    auth_confirm_placeholder: "Répétez votre mot de passe",
    auth_forgot: "Mot de passe oublié ?",
    auth_btn_login: "Entrer",
    auth_btn_register: "Créer un compte",
    auth_btn_recover: "Récupérer le mot de passe",
    auth_no_account: "Pas encore de compte ?",
    auth_btn_register_now: "Inscription gratuite",
    auth_has_account: "Déjà inscrit ?",
    auth_btn_login_now: "Se connecter"
  }
};

// Tool to shorten long names to brief counterparts
export function getTeamDisplayName(name: string, lang: string = "es"): string {
  if (!name) return "";
  const norm = normalizeLookupKey(name);
  const manualKey = norm === "inglaterra" ? "england" : norm === "escocia" ? "scotland" : "";
  if (manualKey) return TEAM_MANUAL_TRANSLATIONS[manualKey]?.[lang] || TEAM_MANUAL_TRANSLATIONS[manualKey]?.en || name;

  const countryCode = TEAM_COUNTRY_CODES[norm];
  if (!countryCode || lang === "es") return name;

  try {
    const displayNames = new Intl.DisplayNames([DATE_LOCALES[lang] || lang], { type: "region" });
    return displayNames.of(countryCode) || name;
  } catch {
    return name;
  }
}

export function getShortTeamName(name: string, lang: string = "es"): string {
  if (!name) return "";
  const norm = name.trim();
  const displayName = getTeamDisplayName(name, lang);
  
  const translations: Record<string, { es: string; en: string }> = {
    "Estados Unidos": { es: "USA", en: "USA" },
    "Costa de Marfil": { es: "C. Marfil", en: "Ivory Coast" },
    "Corea del Sur": { es: "Corea S.", en: "South Korea" },
    "Arabia Saudita": { es: "A. Saudita", en: "Saudi Arabia" },
    "Nueva Zelanda": { es: "N. Zelanda", en: "New Zealand" },
    "Países Bajos": { es: "P. Bajos", en: "Netherlands" },
    "Inglaterra": { es: "Inglaterra", en: "England" },
    "Alemania": { es: "Alemania", en: "Germany" },
    "Francia": { es: "Francia", en: "France" },
    "España": { es: "España", en: "Spain" },
    "Bélgica": { es: "Bélgica", en: "Belgium" },
    "Polonia": { es: "Polonia", en: "Poland" },
    "Camerún": { es: "Camerún", en: "Cameroon" },
    "Croacia": { es: "Croacia", en: "Croatia" },
    "Japón": { es: "Japón", en: "Japan" },
    "Turquía": { es: "Turquía", en: "Turkey" },
    "Egipto": { es: "Egipto", en: "Egypt" },
    "Marruecos": { es: "Marruecos", en: "Morocco" },
    "Costa Rica": { es: "Costa Rica", en: "Costa Rica" },
    "Argelia": { es: "Argelia", en: "Algeria" },
    "Suecia": { es: "Suecia", en: "Sweden" },
    "Noruega": { es: "Noruega", en: "Norway" },
    "Austria": { es: "Austria", en: "Austria" },
    "Panamá": { es: "Panamá", en: "Panama" },
    "Canadá": { es: "Canadá", en: "Canada" },
    "Ecuador": { es: "Ecuador", en: "Ecuador" },
    "Brasil": { es: "Brasil", en: "Brazil" },
    "México": { es: "México", en: "Mexico" },
    "Escocia": { es: "Escocia", en: "Scotland" },
    "Irak": { es: "Irak", en: "Iraq" },
    "Colombia": { es: "Colombia", en: "Colombia" },
    "Venezuela": { es: "Venezuela", en: "Venezuela" },
    "Paraguay": { es: "Paraguay", en: "Paraguay" },
    "Nigeria": { es: "Nigeria", en: "Nigeria" },
    "Australia": { es: "Australia", en: "Australia" },
    "Chile": { es: "Chile", en: "Chile" }
  };

  const item = translations[norm];
  if (item) {
    return lang === "es" ? item.es : item.en;
  }
  return displayName.length > 16 ? displayName.slice(0, 14).trimEnd() + "." : displayName;
}

const TEAM_SHORT_CODES: Record<string, string> = {
  "Estados Unidos": "USA",
  "Rep. de Corea": "KOR",
  "Corea del Sur": "KOR",
  "Rep. Checa": "CZE",
  "Costa de Marfil": "CIV",
  "Arabia Saudita": "KSA",
  "Arabia Saudí": "KSA",
  "Nueva Zelanda": "NZL",
  "Países Bajos": "NED",
  "RD Congo": "COD",
  "RI de Irán": "IRN",
  "Bosnia y Herzegovina": "BIH",
  "Cabo Verde": "CPV"
};

const getTeamShortCode = (name: string) => {
  const normalized = name.trim();
  return TEAM_SHORT_CODES[normalized] || getCountryShortCode(normalized);
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("polla_user_session");
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    const saved = localStorage.getItem("polla_theme");
    return (saved as "light" | "dark" | "system") || "system";
  });

  const [lang, setLang] = useState<"es" | "en" | "pt" | "fr" | "it" | "de" | "ar" | "ja" | "ko" | "ru">(() => {
    const saved = localStorage.getItem("polla_lang");
    return (saved as any) || "es";
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Translation helper function
  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[lang];
    if (!dict) return fallback || key;
    return dict[key] || TRANSLATIONS.es[key] || fallback || key;
  };

  const authT = (key: string) => {
    return AUTH_COPY_BY_LANG[lang]?.[key] || AUTH_COPY_BY_LANG.es[key] || AUTH_COPY_BY_LANG.en[key] || key;
  };

  const ui = (key: string, replacements: Record<string, string | number> = {}) => {
    const dict = UI_COPY_BY_LANG[lang] || UI_COPY_BY_LANG.es;
    let value = dict[key] || UI_COPY_BY_LANG.es[key] || UI_COPY_BY_LANG.en[key] || key;
    Object.entries(replacements).forEach(([token, replacement]) => {
      value = value.replace(`{${token}}`, String(replacement));
    });
    return value;
  };

  const getStageLabel = (stage: string) => {
    const groupMatch = stage.match(/^Grupo\s+([A-L])$/i);
    if (groupMatch) return `${ui("group")} ${groupMatch[1]}`;
    const stageKeyMap: Record<string, string> = {
      Todos: "all",
      "16avos de Final": "round32",
      "Octavos de Final": "round16",
      "Cuartos de Final": "quarterfinal",
      Semifinal: "semifinal",
      "Tercer Puesto": "third_place",
      Final: "final"
    };
    return ui(stageKeyMap[stage] || stage);
  };

  const getPredictionReasonLabel = (reason: Prediction["reason"]) => {
    if (reason === "exact") return ui("exact_score");
    if (reason === "draw") return ui("real_draw");
    return ui("participation");
  };

  const formatCop = (value: number) =>
    `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value || 0)}`;
  const formatEntryFeeLabel = (value?: number) => `${formatCop(value || 20000)} pesos`;

  const [activeTab, setActiveTab] = useState<string>("predictions");
  const [rulesImageZoom, setRulesImageZoom] = useState(false);
  const [rulesFlyerPreviewLang, setRulesFlyerPreviewLang] = useState<"es" | "en">("es");
  const [managedPopupOpen, setManagedPopupOpen] = useState(false);
  const [publicManagedPopupShown, setPublicManagedPopupShown] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [accountSection, setAccountSection] = useState<"profile" | "avatar" | "preferences" | "security" | "session">("profile");
  const [aboutPollonOpen, setAboutPollonOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [torneo, setTorneo] = useState<TorneoConfig | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [knockoutFixtures, setKnockoutFixtures] = useState<KnockoutFixture[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [publicPredictionMatches, setPublicPredictionMatches] = useState<PublicPredictionMatch[]>([]);
  const [selectedPublicMatchId, setSelectedPublicMatchId] = useState<number | null>(null);
  const [publicPredictionsLoading, setPublicPredictionsLoading] = useState(false);
  const [publicPredictionsError, setPublicPredictionsError] = useState("");
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sponsorBanners, setSponsorBanners] = useState<SponsorBanner[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [publicPrizePool, setPublicPrizePool] = useState<PublicPrizePool | null>(null);
  const [winnerCertificate, setWinnerCertificate] = useState<Ranking | null>(null);
  const [winnerEmailPreviewPosition, setWinnerEmailPreviewPosition] = useState<1 | 2 | 3>(1);
  const [winnerEmailPosterByPosition, setWinnerEmailPosterByPosition] = useState<Record<1 | 2 | 3, string>>({ 1: "", 2: "", 3: "" });
  const [winnerEmailSendingPosition, setWinnerEmailSendingPosition] = useState<1 | 2 | 3 | null>(null);
  const [rankingShareBusy, setRankingShareBusy] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [isUserLoading, setIsUserLoading] = useState(false);
  const [appMode, setAppMode] = useState<"FREE" | "PAID">("PAID");
  const [paymentProvider, setPaymentProvider] = useState<"stripe" | "wompi">("stripe");
  const [temporaryFavoritesAccessDeadline, setTemporaryFavoritesAccessDeadline] = useState("2026-06-12T18:00:00.000Z");
  const [temporaryFavoritesAccessOpen, setTemporaryFavoritesAccessOpen] = useState(false);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  const [companies, setCompanies] = useState<Array<Company & { playersCount?: number; availableSlots?: number }>>([]);
  const [companyInvitations, setCompanyInvitations] = useState<CompanyInvitation[]>([]);
  const [companyRanking, setCompanyRanking] = useState<Array<Ranking & { companyPosition?: number }>>([]);
  const [companyForm, setCompanyForm] = useState({ name: "", slug: "", logo: "", prizesText: "", maxPlayers: 50, adminId: "", status: "active" });
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [companyPrizePolicy, setCompanyPrizePolicy] = useState("");
  const [companyInvitationSummary, setCompanyInvitationSummary] = useState({ companyId: "", playersCount: 0, availableSlots: 0, maxPlayers: 50 });
  const [groupPoolName, setGroupPoolName] = useState("");
  const [groupPoolBusy, setGroupPoolBusy] = useState(false);
  const [groupPoolModalOpen, setGroupPoolModalOpen] = useState(false);
  const [groupPoolStatus, setGroupPoolStatus] = useState<{
    status: "none" | "pending" | "active" | "suspended";
    company?: Company;
    remainingSeconds?: number;
  }>({ status: "none" });

  // Tournament Favorites states
  const [predictionsMode, setPredictionsMode] = useState<"matches" | "knockout" | "favorites">("matches");
  const [tournamentPredictions, setTournamentPredictions] = useState<TournamentPredictions | null>(null);
  const [tournamentOutcomes, setTournamentOutcomes] = useState<TournamentOutcomes | null>(null);

  // Authentication Fields
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authCountry, setAuthCountry] = useState("Colombia");
  const [authAvatar, setAuthAvatar] = useState(AVATARS[0]);
  const [authMode, setAuthMode] = useState<"login" | "register" | "recover">("login");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showAuthConfirmPassword, setShowAuthConfirmPassword] = useState(false);
  const [showAuthAvatarModal, setShowAuthAvatarModal] = useState(false);
  const [showPrivacyNoticeModal, setShowPrivacyNoticeModal] = useState(false);
  const [authPrivacyAccepted, setAuthPrivacyAccepted] = useState(false);
  
  // Forecast Forms
  const [predScores, setPredScores] = useState<Record<number, { local: number | ""; visitor: number | "" }>>({});
  
  // Filters
  const [selectedStage, setSelectedStage] = useState("Todos");
  const [selectedMatchDateKey, setSelectedMatchDateKey] = useState("Todas");
  const [matchStatusFilter, setMatchStatusFilter] = useState<"all" | "pending" | "finished">("all");
  const [teamSearch, setTeamSearch] = useState("");
  const [matchFiltersOpen, setMatchFiltersOpen] = useState(false);

  // Manage Profiles states
  const [profileName, setProfileName] = useState("");
  const [profileCountry, setProfileCountry] = useState("Colombia");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileEmailSubscribed, setProfileEmailSubscribed] = useState(true);
  const [profileNewPass, setProfileNewPass] = useState("");
  const [notificationSoundEnabled, setNotificationSoundEnabled] = useState(() => localStorage.getItem("polla_notification_sound") !== "off");
  const [lastLoginAt, setLastLoginAt] = useState("");
  const previousUnreadCountRef = useRef(0);

  // Admin users state list
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [uploadedAssets, setUploadedAssets] = useState<UploadedAsset[]>([]);
  const [adminBanners, setAdminBanners] = useState<SponsorBanner[]>([]);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    sponsorName: "",
    imageUrl: "",
    linkUrl: "",
    placement: "home_top" as SponsorBanner["placement"],
    active: true,
    rotationSeconds: 5 as 5 | 10,
    startsAt: "",
    endsAt: ""
  });
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerRotationIndex, setBannerRotationIndex] = useState<Record<SponsorBanner["placement"], number>>({
    home_top: 0,
    sidebar: 0,
    rules: 0
  });
  const [assetUploadBusy, setAssetUploadBusy] = useState(false);
  const [matchSyncBusy, setMatchSyncBusy] = useState(false);
  const [matchDedupeBusy, setMatchDedupeBusy] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [selectedUserForPredictions, setSelectedUserForPredictions] = useState<User | null>(null);
  const [userPredictionsView, setUserPredictionsView] = useState<Prediction[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [predictionImportEmail, setPredictionImportEmail] = useState("dir.comercial@millonarios.com.co");
  const [predictionImportFile, setPredictionImportFile] = useState<File | null>(null);
  const [predictionImportBusy, setPredictionImportBusy] = useState(false);
  const [predictionImportResult, setPredictionImportResult] = useState<any>(null);

  // Admin Matches Create/Edit Info
  const [matchForm, setMatchForm] = useState<any>(null);

  // Admin Announcements
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "", urgent: false, publishAt: "" });

  // Notifications bell toggle
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // General Toast notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // API Client Call Setup
  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      ...(currentUser ? { Authorization: `Bearer ${currentUser.id}` } : {})
    };
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getLastLoginKey = (userId: string) => `polla_last_login_${userId}`;

  const recordUserLogin = (user: User) => {
    const loginAt = new Date().toISOString();
    localStorage.setItem(getLastLoginKey(user.id), loginAt);
    setLastLoginAt(loginAt);
  };

  const openAccountSection = (section: typeof accountSection) => {
    setAccountSection(section);
    setActiveTab("account");
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const passwordChecks = [
    { label: "Mínimo 8 caracteres", valid: authPassword.length >= 8 },
    { label: "Una mayúscula", valid: /[A-ZÁÉÍÓÚÑ]/.test(authPassword) },
    { label: "Una minúscula", valid: /[a-záéíóúñ]/.test(authPassword) },
    { label: "Un número", valid: /\d/.test(authPassword) },
    { label: "Las contraseñas coinciden", valid: authConfirmPassword.length > 0 && authPassword === authConfirmPassword }
  ];
  const isRegisterPasswordValid = passwordChecks.every((check) => check.valid);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail);
  const isRegisterSubmitDisabled = !isEmailValid || !isRegisterPasswordValid || authName.trim().length < 3 || !authPrivacyAccepted;
  const privacyNoticeSections = [
    {
      title: "Responsable del tratamiento",
      body: "El Pollón Mundialista, operado por M&P Enterprise Marketing y Publicidad SAS, es responsable del tratamiento de los datos personales recolectados en esta plataforma. Canales de contacto: admin@elpollonmundialista.com y WhatsApp +57 313 578 1020."
    },
    {
      title: "Datos que podemos recolectar",
      body: "Podemos tratar datos de registro y cuenta como nombre, correo electrónico, país, avatar, empresa asociada, estado de pago, predicciones, puntajes, ranking, historial de participación, comunicaciones enviadas por la plataforma, datos necesarios para soporte y datos requeridos para gestionar pagos, premios o verificaciones administrativas."
    },
    {
      title: "Finalidades",
      body: "Usamos tus datos para crear y administrar tu cuenta, permitir tu participación en El Pollón Mundialista, calcular resultados y rankings, gestionar inscripciones, pagos, premios, recordatorios, recuperación de acceso, notificaciones, comunicaciones del administrador, soporte al usuario, seguridad de la plataforma, auditoría de predicciones y cumplimiento de obligaciones legales o contractuales."
    },
    {
      title: "Comunicaciones",
      body: "Podremos enviarte correos, mensajes o notificaciones relacionados con tu cuenta, recuperación de contraseña, actividad del torneo, cambios en ranking, resultados, recordatorios de pronósticos, comunicados importantes, pagos, premios y soporte. Puedes administrar algunas preferencias de notificación desde tu perfil cuando la plataforma lo permita."
    },
    {
      title: "Pagos, premios y verificación",
      body: "Cuando participes en modalidades con pago o premios, podremos tratar la información necesaria para validar tu inscripción, confirmar transacciones, prevenir fraude, verificar identidad, contactar ganadores y coordinar la entrega de premios. No solicitaremos datos bancarios sensibles dentro de formularios públicos no seguros."
    },
    {
      title: "Encargados y terceros",
      body: "Podemos apoyarnos en proveedores tecnológicos para alojamiento, base de datos, almacenamiento de archivos, correo transaccional, analítica operativa y pasarelas de pago. Estos terceros solo deben tratar la información necesaria para prestar sus servicios. También podremos compartir datos cuando sea requerido por autoridad competente o por obligaciones legales."
    },
    {
      title: "Conservación",
      body: "Conservaremos los datos mientras exista una cuenta activa, mientras sean necesarios para operar el torneo, resolver solicitudes, auditar resultados, atender reclamaciones, cumplir obligaciones legales o conservar soportes administrativos. Cuando proceda, podrás solicitar supresión o actualización de tus datos."
    },
    {
      title: "Tus derechos",
      body: "Como titular puedes conocer, actualizar, rectificar, solicitar prueba de autorización, ser informado sobre el uso de tus datos, presentar reclamos, revocar la autorización y solicitar la supresión de datos cuando no exista una obligación legal o contractual que impida hacerlo."
    },
    {
      title: "Autorización",
      body: "Al registrarte aceptas de manera previa, expresa e informada esta política de tratamiento de datos personales y autorizas la recolección, almacenamiento, uso, circulación, actualización y supresión de tus datos para las finalidades descritas, conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas colombianas aplicables."
    },
    {
      title: "Contacto y vigencia",
      body: "Para consultas, solicitudes o reclamos sobre datos personales escribe a admin@elpollonmundialista.com o al WhatsApp +57 313 578 1020. Esta política rige desde junio de 2026 y cualquier actualización relevante será publicada en la plataforma."
    }
  ];
  const faqItems = [
    {
      question: "¿Qué es www.elpollonmundialista.com?",
      answer: "Es una plataforma social para pronosticar los partidos del Mundial 2026, sumar puntos por tus aciertos y competir en rankings con amigos, familia, empresas o comunidades."
    },
    {
      question: "¿Cómo puedo participar?",
      answer: "Puedes registrarte en la plataforma, crear tu usuario y participar en la modalidad disponible. También puedes ingresar por invitación de una empresa cuando exista una polla empresarial activa."
    },
    {
      question: "¿Cuánto cuesta participar en la Polla REAL?",
      answer: "La participación individual en la Polla REAL tiene un valor de 20.000 pesos colombianos. Ese pago habilita la participación por premios monetarios, sujeto a las reglas publicadas en la plataforma."
    },
    {
      question: "¿Cómo se calcula la bolsa de premios de la Polla REAL?",
      answer: "El 100% del valor recaudado por las inscripciones confirmadas de usuarios pagos se destina a la bolsa de premios. Actualmente no se descuenta comisión bancaria ni comisión de administración de la polla. La bolsa se distribuye 80% para el primer puesto, 15% para el segundo y 5% para el tercero."
    },
    {
      question: "¿Los pagos son seguros?",
      answer: "Sí. Los pagos se procesan mediante Wompi Pagos Seguros. El Pollón Mundialista no almacena datos sensibles de tarjetas en la plataforma."
    },
    {
      question: "¿Puedo participar gratis por empresa?",
      answer: "Sí. Las empresas pueden crear o gestionar grupos internos de participación. Esa modalidad puede permitir jugar gratis dentro del ranking empresarial, según las condiciones definidas para cada empresa."
    },
    {
      question: "¿Tengo una empresa, cómo participo?",
      answer: "Regístrate, entra a Crear Polla Grupal y solicita tu grupo para familia, empresa, amigos o comunidad. La activación es automática y después podrás compartir un enlace de invitación con tus participantes."
    },
    {
      question: "¿Cómo se ganan puntos?",
      answer: "Sumas puntos por registrar pronósticos, acertar el resultado del partido y acertar marcadores exactos. También pueden existir puntos por favoritos del torneo, clasificados, finalistas, subcampeón y campeón, según las reglas vigentes."
    },
    {
      question: "¿Hasta cuándo puedo enviar un pronóstico?",
      answer: "Cada pronóstico se cierra automáticamente 5 minutos antes del inicio del partido. Después del cierre no se puede crear ni modificar ese marcador."
    },
    {
      question: "¿Cómo se paga el premio?",
      answer: "Los premios se pagan al ganador validado después de revisar el ranking final, la identidad del participante, la documentación requerida y los datos bancarios. El pago se realiza por el medio definido por la administración."
    },
    {
      question: "¿Cómo reclamo mi premio?",
      answer: "Debes enviar tu certificado de ganador al correo admin@elpollonmundialista.com, junto con fotos de tu cédula o pasaporte y certificación bancaria. En el asunto escribe: QUIERO MI PREMIO. En el cuerpo del correo escribe: Señor Admin de El Pollón Mundialista soy el ganador de uno de los premios, adjunto mis documentos para que me envíe mi premio."
    },
    {
      question: "¿Qué pasa si hay empate en el ranking?",
      answer: "La plataforma usa los criterios de desempate definidos en las reglas, como puntos, aciertos exactos y aciertos de resultado. Si persiste una situación especial, la administración revisará el caso según las reglas publicadas."
    },
    {
      question: "¿A quién contacto si tengo problemas con mi cuenta, pago o premio?",
      answer: "Puedes escribir a admin@elpollonmundialista.com. Incluye tu nombre, correo registrado, descripción del problema y, si aplica, soporte de pago o captura del error."
    }
  ];

  const fetchGlobalData = async () => {
    setIsGlobalLoading(true);
    try {
      const cfgRes = await fetch("/api/app-config");
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        setAppMode(cfg.appMode === "FREE" ? "FREE" : "PAID");
        setPaymentProvider(cfg.paymentProvider === "wompi" ? "wompi" : "stripe");
        setTemporaryFavoritesAccessDeadline(cfg.temporaryFavoritesAccessDeadline || "2026-06-12T18:00:00.000Z");
        setTemporaryFavoritesAccessOpen(Boolean(cfg.temporaryFavoritesAccessOpen));
      }

      const trRes = await fetch("/api/torneo");
      if (trRes.ok) setTorneo(await trRes.json());

      const mRes = await fetch("/api/matches");
      if (mRes.ok) {
        const matchesData: Match[] = await mRes.json();
        setMatches(matchesData);
      }

      const kRes = await fetch("/api/knockout-fixtures");
      if (kRes.ok) setKnockoutFixtures(await kRes.json());

      const rRes = await fetch("/api/rankings", { headers: getHeaders() });
      if (rRes.ok) setRankings(await rRes.json());

      const aRes = await fetch("/api/announcements");
      if (aRes.ok) setAnnouncements(await aRes.json());

      const bRes = await fetch("/api/banners");
      if (bRes.ok) setSponsorBanners(await bRes.json());

      const toRes = await fetch("/api/tournament-outcomes");
      if (toRes.ok) setTournamentOutcomes(await toRes.json());
    } catch (err) {
      console.error("Error loading static global datas:", err);
    } finally {
      setIsGlobalLoading(false);
    }
  };

  const fetchUserSpecificData = async () => {
    if (!currentUser) return;
    setIsUserLoading(true);
    try {
      const pRes = await fetch(`/api/predictions?userId=${currentUser.id}`, { headers: getHeaders() });
      if (pRes.ok) {
        const pList: Prediction[] = await pRes.json();
        setPredictions(pList);
        const map: Record<number, { local: number | ""; visitor: number | "" }> = {};
        pList.forEach((p) => {
          map[p.matchId] = { local: p.localScore, visitor: p.visitorScore };
        });
        setPredScores(map);
      }

      const nRes = await fetch(`/api/notifications/${currentUser.id}`, { headers: getHeaders() });
      if (nRes.ok) {
        setNotifications(await nRes.json());
      }

      const aRes = await fetch("/api/announcements", { headers: getHeaders() });
      if (aRes.ok) setAnnouncements(await aRes.json());

      const rRes = await fetch("/api/rankings", { headers: getHeaders() });
      if (rRes.ok) setRankings(await rRes.json());

      const tpRes = await fetch(`/api/tournament-predictions?userId=${currentUser.id}`, { headers: getHeaders() });
      if (tpRes.ok) {
        setTournamentPredictions(await tpRes.json());
      }

      const prizeRes = await fetch("/api/prize-pool", { headers: getHeaders() });
      if (prizeRes.ok) {
        setPublicPrizePool(await prizeRes.json());
      }

      const policyRes = await fetch("/api/company-policy", { headers: getHeaders() });
      if (policyRes.ok) {
        const policy = await policyRes.json();
        setCompanyPrizePolicy(policy.prizesText || "");
      }

      // Check if Admin to render dynamic reports
      if (currentUser.role === "admin" || currentUser.role === "superadmin") {
        fetchAdminStats();
        fetchAdminUsers();
        fetchAdminAssets();
        fetchAdminBanners();
      }
      if (currentUser.role === "admin" || currentUser.role === "superadmin" || currentUser.role === "company_admin") {
        fetchAdminAnnouncements();
      }
      if (currentUser.role === "admin" || currentUser.role === "superadmin" || currentUser.role === "company_admin") {
        fetchCompanies();
      }
    } catch (err) {
      console.error("Error loading user explicit data:", err);
    } finally {
      setIsUserLoading(false);
    }
  };

  const refreshPrizePool = async () => {
    if (!currentUser) return;
    try {
      const prizeRes = await fetch("/api/prize-pool", { headers: getHeaders() });
      if (prizeRes.ok) setPublicPrizePool(await prizeRes.json());
    } catch (err) {
      console.error("Error refreshing prize pool:", err);
    }
  };

  const refreshNotifications = async () => {
    if (!currentUser) return;
    try {
      const nRes = await fetch(`/api/notifications/${currentUser.id}`, { headers: getHeaders() });
      if (nRes.ok) setNotifications(await nRes.json());
    } catch (err) {
      console.error("Error refreshing notifications:", err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const sRes = await fetch("/api/admin/stats", { headers: getHeaders() });
      if (sRes.ok) setStats(await sRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const uRes = await fetch("/api/admin/users", { headers: getHeaders() });
      if (uRes.ok) setAdminUsers(await uRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies", { headers: getHeaders() });
      if (!res.ok) return;
      const list = await res.json();
      setCompanies(list);
      const firstCompanyId = selectedCompanyId || currentUser?.companyId || list[0]?.id || "";
      if (firstCompanyId) {
        setSelectedCompanyId(firstCompanyId);
        fetchCompanyDetails(firstCompanyId);
        fetchCompanyRanking(firstCompanyId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanyDetails = async (companyId: string) => {
    try {
      const res = await fetch(`/api/companies/${companyId}/invitations`, { headers: getHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setCompanyInvitations(data.invitations || []);
      setCompanyPrizePolicy(data.company?.prizesText || "");
      setCompanyInvitationSummary({
        companyId,
        playersCount: Number(data.playersCount) || 0,
        availableSlots: Number(data.availableSlots) || 0,
        maxPlayers: Number(data.company?.maxPlayers) || 50
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanyRanking = async (companyId: string) => {
    try {
      const res = await fetch(`/api/rankings/company/${companyId}`, { headers: getHeaders() });
      if (res.ok) setCompanyRanking(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPublicPredictions = async () => {
    if (!currentUser) return;
    setPublicPredictionsLoading(true);
    setPublicPredictionsError("");
    try {
      const res = await fetch("/api/public-predictions", { headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron cargar los pronósticos públicos.");
      const publicMatches: PublicPredictionMatch[] = data.matches || [];
      setPublicPredictionMatches(publicMatches);
      setSelectedPublicMatchId((currentId) =>
        currentId && publicMatches.some((match) => match.id === currentId)
          ? currentId
          : publicMatches[0]?.id || null
      );
    } catch (err: any) {
      setPublicPredictionsError(err.message || "No se pudieron cargar los pronósticos públicos.");
    } finally {
      setPublicPredictionsLoading(false);
    }
  };

  const fetchGroupPoolStatus = async () => {
    if (!currentUser || currentUser.role === "admin" || currentUser.role === "superadmin") return;
    try {
      const res = await fetch("/api/group-pools/status", { headers: getHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      const previousStatus = groupPoolStatus.status;
      setGroupPoolStatus({
        status: data.status || "none",
        company: data.company,
        remainingSeconds: data.remainingSeconds
      });

      if (data.user && (
        data.user.role !== currentUser.role ||
        data.user.companyId !== currentUser.companyId ||
        data.user.paymentStatus !== currentUser.paymentStatus
      )) {
        localStorage.setItem("polla_user_session", JSON.stringify(data.user));
        setCurrentUser(data.user);
      }

      if (data.status === "active" && data.company) {
        setSelectedCompanyId(data.company.id);
        if (previousStatus === "pending") {
          showToast("Tu Polla Grupal ya está activa. Ya puedes administrarla e invitar participantes.", "success");
          setGroupPoolModalOpen(false);
          setActiveTab("admin-companies");
        }
      }
    } catch (err) {
      console.error("Error consulting group pool status:", err);
    }
  };

  const fetchAdminAssets = async () => {
    try {
      const res = await fetch("/api/admin/assets", { headers: getHeaders() });
      if (res.ok) setUploadedAssets(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners", { headers: getHeaders() });
      if (res.ok) setAdminBanners(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdminAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements", { headers: getHeaders() });
      if (res.ok) setAnnouncements(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const syncCurrentUserProfile = async () => {
    const saved = localStorage.getItem("polla_user_session");
    if (!saved) return;
    try {
      const savedUser = JSON.parse(saved);
      const res = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${savedUser.id}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("polla_user_session", JSON.stringify(data.user));
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error("Error syncing current user:", err);
    }
  };

  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      
      if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        root.classList.add("dark");
      } else {
        root.classList.add("light");
      }
    };
    
    applyTheme();
    localStorage.setItem("polla_theme", theme);

    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("polla_lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("polla_notification_sound", notificationSoundEnabled ? "on" : "off");
  }, [notificationSoundEnabled]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get("invite");
    if (invite) {
      setInviteToken(invite);
      setAuthMode("register");
    }
    fetchGlobalData();
    syncCurrentUserProfile();
  }, []);

  useEffect(() => {
    const refreshMatches = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch("/api/matches", { cache: "no-store" });
        if (response.ok) setMatches(await response.json());
      } catch (err) {
        console.error("Error refreshing match ticker:", err);
      }
    };

    const timer = window.setInterval(refreshMatches, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserSpecificData();
      setProfileName(currentUser.name);
      setProfileCountry(normalizeCountryName(currentUser.country));
      setProfileAvatar(currentUser.avatar);
      setProfileEmailSubscribed(currentUser.emailSubscribed || false);
      setLastLoginAt(localStorage.getItem(getLastLoginKey(currentUser.id)) || "");
    } else {
      setPredictions([]);
      setNotifications([]);
      setStats(null);
      setAdminUsers([]);
      setUploadedAssets([]);
      setAdminBanners([]);
      setUserMenuOpen(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setGroupPoolStatus({ status: "none" });
      return;
    }
    if (currentUser.role === "admin" || currentUser.role === "superadmin") return;

    fetchGroupPoolStatus();
    if (groupPoolStatus.status !== "pending") return;
    const timer = window.setInterval(fetchGroupPoolStatus, 15000);
    return () => window.clearInterval(timer);
  }, [currentUser?.id, currentUser?.role, currentUser?.companyId, groupPoolStatus.status]);

  useEffect(() => {
    if (currentUser) {
      setManagedPopupOpen(false);
      return;
    }
    if (publicManagedPopupShown) return;
    openPublicManagedPopupIfNeeded(torneo);
  }, [
    torneo?.popupEnabled,
    torneo?.popupTitle,
    torneo?.popupMessage,
    torneo?.popupImageUrl,
    torneo?.popupCtaLabel,
    currentUser?.id,
    publicManagedPopupShown
  ]);

  useEffect(() => {
    if (!currentUser) return;
    const timer = window.setInterval(refreshPrizePool, 15000);
    return () => window.clearInterval(timer);
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;
    const timer = window.setInterval(refreshNotifications, 30000);
    return () => window.clearInterval(timer);
  }, [currentUser?.id]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [userMenuOpen]);

  useEffect(() => {
    if (!currentUser) return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");
    const provider = params.get("provider") === "wompi" ? "wompi" : params.get("provider") === "stripe" ? "stripe" : paymentProvider;
    const transactionId = params.get("id") || params.get("transaction_id");
    const sessionId = params.get("session_id") || transactionId || params.get("reference");
    const reference = params.get("reference") || sessionId;

    if (paymentStatus === "cancelled") {
      showToast("Pago cancelado. Puedes intentarlo nuevamente cuando quieras.", "info");
      window.history.replaceState({}, "", window.location.pathname);
      setActiveTab("participate");
      return;
    }

    if (paymentStatus !== "success" || !sessionId) return;

    const confirmPayment = async () => {
      setPaymentBusy(true);
      try {
        const res = await fetch("/api/payments/confirm-checkout-session", {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify({ sessionId, reference, transactionId, provider })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "No se pudo confirmar el pago.");

        localStorage.setItem("polla_user_session", JSON.stringify(data.user));
        setCurrentUser(data.user);
        showToast(data.message, "success");
        setActiveTab("predictions");
        setPredictionsMode("favorites");
        const tpRes = await fetch(`/api/tournament-predictions?userId=${data.user.id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.user.id}`
          }
        });
        if (tpRes.ok) setTournamentPredictions(await tpRes.json());
        fetchGlobalData();
      } catch (err: any) {
        showToast(err.message, "error");
      } finally {
        setPaymentBusy(false);
        window.history.replaceState({}, "", window.location.pathname);
      }
    };

    confirmPayment();
  }, [currentUser?.id, paymentProvider]);

  // Actions implementations
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de inicio de sesión");

      localStorage.setItem("polla_user_session", JSON.stringify(data.user));
      setCurrentUser(data.user);
      recordUserLogin(data.user);
      setActiveTab("predictions");
      showToast(`¡Bienvenido de nuevo, ${data.user.name}!`, "success");
      setAuthPassword("");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid) {
      showToast("Ingresa un correo válido.", "error");
      return;
    }
    if (!authName.trim() || authName.trim().length < 3) {
      showToast("El nombre público debe tener al menos 3 caracteres.", "error");
      return;
    }
    if (!isRegisterPasswordValid) {
      showToast("Revisa los requisitos de la contraseña antes de registrarte.", "error");
      return;
    }
    if (!authPrivacyAccepted) {
      showToast("Debes aceptar el aviso de privacidad y la política de tratamiento de datos.", "error");
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          name: authName,
          country: normalizeCountryName(authCountry),
          avatar: authAvatar,
          inviteToken: inviteToken || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de registro");

      localStorage.setItem("polla_user_session", JSON.stringify(data.user));
      setCurrentUser(data.user);
      recordUserLogin(data.user);
      setActiveTab("predictions");
      showToast(`¡Tu cuenta ha sido creada y registrada! Bienvenido, ${data.user.name}.`, "success");
      setAuthPassword("");
      setAuthConfirmPassword("");
      setAuthEmail("");
      setAuthName("");
      setAuthCountry("Colombia");
      setAuthPrivacyAccepted(false);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: authEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      showToast(data.message, "info");
      setAuthMode("login");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("polla_user_session");
    setCurrentUser(null);
    setActiveTab("rules-prizes");
    showToast("Sesión cerrada correctamente", "info");
  };

  const handleStartPayment = async (realUpgrade: boolean | React.MouseEvent = false) => {
    const shouldUpgradeToReal = realUpgrade === true;
    setPaymentBusy(true);
    try {
      const res = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ realUpgrade: shouldUpgradeToReal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo iniciar el pago.");
      if (!data.url) throw new Error("La pasarela no devolvio una URL de pago.");
      window.location.href = data.url;
    } catch (err: any) {
      showToast(err.message, "error");
      setPaymentBusy(false);
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Selecciona una imagen valida para tu perfil.", "error");
      e.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("La imagen debe pesar maximo 2 MB.", "error");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setProfileAvatar(reader.result);
    };
    reader.onerror = () => showToast("No se pudo cargar la imagen de perfil.", "error");
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reqPayload: any = {
        name: profileName,
        country: normalizeCountryName(profileCountry),
        avatar: profileAvatar,
        emailSubscribed: profileEmailSubscribed
      };
      if (profileNewPass.trim() !== "") {
        reqPayload.newPassword = profileNewPass;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(reqPayload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar perfil");

      localStorage.setItem("polla_user_session", JSON.stringify(data.user));
      setCurrentUser(data.user);
      setProfileNewPass("");
      showToast("¡Tu perfil de usuario ha sido actualizado correctamente!", "success");
      fetchGlobalData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // Forecast submissions
  const handleSavePrediction = async (matchId: number) => {
    if (!canSubmitPredictions) {
      showToast("Debes pagar la inscripción antes de registrar pronósticos.", "error");
      setActiveTab("participate");
      return;
    }

    const score = predScores[matchId];
    if (!score || score.local === "" || score.visitor === "") {
      showToast("Por favor ingresa un marcador válido", "error");
      return;
    }

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          matchId,
          localScore: score.local,
          visitorScore: score.visitor
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar la predicción");

      showToast("Pronóstico guardado con éxito.", "success");
      fetchUserSpecificData();
      fetchGlobalData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleClearPrediction = async (matchId: number) => {
    if (!canSubmitPredictions) {
      showToast("Debes pagar la inscripción antes de modificar pronósticos.", "error");
      setActiveTab("participate");
      return;
    }

    try {
      const res = await fetch(`/api/predictions/${matchId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo limpiar el marcador");

      setPredScores((prev) => {
        const next = { ...prev };
        delete next[matchId];
        return next;
      });
      showToast(data.message, "success");
      fetchUserSpecificData();
      fetchGlobalData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveTournamentPredictions = async (draft: {
    groupWinners: Record<string, string>;
    octavosTeams: string[];
    cuartosTeams: string[];
    semifinalTeams: string[];
    finalists: string[];
    subchampion: string;
    champion: string;
  }) => {
    if (!currentUser) return;
    if (!canSaveTournamentFavorites) {
      showToast("Debes pagar la inscripción antes de guardar favoritos.", "error");
      setActiveTab("participate");
      return;
    }

    const res = await fetch("/api/tournament-predictions", {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(draft)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al guardar tus favoritos.");
    }

    const data = await res.json();
    setTournamentPredictions(data.prediction);
    
    // Reload rankings
    const rRes = await fetch("/api/rankings", { headers: getHeaders() });
    if (rRes.ok) setRankings(await rRes.json());
  };

  const handleSaveTournamentOutcomes = async (outcomes: TournamentOutcomes) => {
    const res = await fetch("/api/tournament-outcomes", {
      method: "POST",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(outcomes)
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "No se pudo actualizar los resultados del torneo.");
    }

    const data = await res.json();
    setTournamentOutcomes(data.outcomes);
    showToast(data.message, "success");
    fetchGlobalData();
    fetchUserSpecificData();
  };

  // Notifications read Actions
  const handleReadNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST", headers: getHeaders() });
      if (currentUser) {
        const nRes = await fetch(`/api/notifications/${currentUser.id}`, { headers: getHeaders() });
        if (nRes.ok) setNotifications(await nRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAllNotifications = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "POST", headers: getHeaders() });
      if (res.ok && currentUser) {
        const nRes = await fetch(`/api/notifications/${currentUser.id}`, { headers: getHeaders() });
        if (nRes.ok) setNotifications(await nRes.json());
        showToast("Todas las alertas han sido marcadas como leídas", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ADMIN ACTION: TORNEO PREFERENCES
  const handleSaveTorneoPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!torneo) return;
    try {
      const res = await fetch("/api/torneo", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(torneo)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar");

      showToast(data.message, "success");
      fetchGlobalData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSendWinnerEmail = async (position: 1 | 2 | 3) => {
    const ranking = rankings.find((row) => row.position === position);
    const posterUrl = winnerEmailPosterByPosition[position];
    if (!ranking) {
      showToast("Todavia no existe un ganador confirmado para ese puesto.", "error");
      return;
    }
    if (!posterUrl) {
      showToast("Selecciona primero el poster que se incluira en el correo.", "error");
      return;
    }
    if (!certificatesEnabled) {
      showToast("El envio se habilitara cuando la final este cerrada y validada.", "error");
      return;
    }
    if (!window.confirm(`Se enviara el correo real del ${getWinnerPlaceLabel(position)} a ${ranking.userName}. ¿Deseas continuar?`)) {
      return;
    }

    setWinnerEmailSendingPosition(position);
    try {
      const res = await fetch("/api/admin/winner-email", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ position, imageUrl: posterUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.detail || "No se pudo enviar el correo.");
      showToast(data.message, "success");
    } catch (err: any) {
      showToast(err.message || "No se pudo enviar el correo.", "error");
    } finally {
      setWinnerEmailSendingPosition(null);
    }
  };

  // ADMIN ACTION: RESET TOURNAMENT TO REAL INITIAL PRE-TOURNAMENT STATE
  const handleResetTournament = async () => {
    if (!window.confirm("¿Estás seguro de que deseas REINICIAR LA POLLA? Esto borrará predicciones, resultados, puntajes y pondrá en cero los saldos del premio acumulado. No elimina usuarios ni empresas, pero los jugadores quedarán con pago pendiente. Esta acción es irreversible.")) {
      return;
    }
    try {
      const res = await fetch("/api/admin/reset-tournament", {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo reiniciar el torneo");
      showToast(data.message, "success");
      
      // Update global states and reload everything
      await fetchGlobalData();
      await syncCurrentUserProfile();
      setActiveTab("dashboard");
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // ADMIN ACTION: USER CREATE / EDIT / SUSPEND / RESET
  const handleSaveAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const isNew = !editingUser.id;
      const url = isNew ? "/api/admin/users" : `/api/admin/users/${editingUser.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(editingUser)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de gestión user");

      showToast(data.message, "success");
      setEditingUser(null);
      fetchAdminUsers();
      fetchGlobalData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteAdminUser = async (userId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar permanentemente este usuario, sus predicciones y su puntaje?")) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE", headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      showToast(data.message, "success");
      fetchAdminUsers();
      fetchGlobalData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleResetUserPassword = (user: User) => {
    const pass = prompt(`Establece la nueva contraseña para ${user.name}:`, "mundial2026");
    if (pass === null) return;
    setEditingUser({ ...user, password: pass });
    showToast(`Preparado para resetear contraseña. Da clic en guardar cambios.`, "info");
  };

  const handleCreateGroupPool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (groupPoolName.trim().length < 3) {
      showToast("Escribe un nombre de al menos 3 caracteres para tu grupo.", "error");
      return;
    }

    setGroupPoolBusy(true);
    try {
      const res = await fetch("/api/group-pools", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name: groupPoolName.trim() })
      });
      const data = await res.json();
      if (!res.ok && res.status !== 202) throw new Error(data.error || data.message || "No se pudo crear la solicitud.");

      setGroupPoolStatus({
        status: data.status || "pending",
        company: data.company,
        remainingSeconds: data.remainingSeconds
      });
      setGroupPoolName(data.company?.name || groupPoolName.trim());
      setGroupPoolModalOpen(true);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setGroupPoolBusy(false);
    }
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(companyForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar la empresa.");
      showToast(data.message, "success");
      setCompanyForm({ name: "", slug: "", logo: "", prizesText: "", maxPlayers: 50, adminId: "", status: "active" });
      fetchCompanies();
      fetchAdminUsers();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSaveCompanyPrizePolicy = async () => {
    if (!selectedCompanyId) return;
    try {
      const res = await fetch(`/api/companies/${selectedCompanyId}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ prizesText: companyPrizePolicy })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el texto de premiaciones.");
      showToast("Texto de premiaciones de la empresa guardado.", "success");
      fetchCompanies();
      fetchUserSpecificData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleCreateCompanyInvitation = async () => {
    if (!selectedCompanyId) return;
    try {
      const res = await fetch(`/api/companies/${selectedCompanyId}/invitations`, {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear la invitación.");
      await copyTextToClipboard(data.url, `Enlace copiado. Compártelo con tus jugadores; quedan ${data.availableSlots || 0} cupos disponibles.`);
      fetchCompanies();
      fetchCompanyDetails(selectedCompanyId);
      fetchCompanyRanking(selectedCompanyId);
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  // ADMIN ACTION: EXPORT DATA TO CSV
  const handleExportRankingCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Posicion,Nombre,Pais,Puntos,Marcadores exactos,Resultados 1X2,Partidos Predichos\n";
      rankings.forEach((r) => {
        csvContent += `${r.position},"${r.userName}","${normalizeCountryName(r.userCountry)}",${r.points},${r.exactCount},${r.drawCount},${r.predictCount}\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "ranking_polla_mundialista_2026.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Ranking exportado a CSV exitosamente", "success");
    } catch (err) {
      showToast("Error al exportar CSV", "error");
    }
  };

  const getRankingShareText = () => {
    const position = currentRanking?.position ? `#${currentRanking.position}` : "sin posición asignada";
    const exactCount = currentRanking?.exactCount ?? currentUser?.exactCount ?? 0;
    const points = currentRanking?.points ?? currentUser?.points ?? 0;
    return `Estoy en el puesto ${position} de ${rankingTitle} en El Pollón Mundialista FIFA 2026, con ${points} puntos y ${exactCount} marcadores exactos. ¿Puedes superarme?`;
  };

  const loadShareImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

  const createRankingShareCard = async () => {
    if (!currentUser) throw new Error("Debes iniciar sesión para compartir tu ranking.");

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("No se pudo generar la tarjeta.");

    const position = currentRanking?.position || "-";
    const points = currentRanking?.points ?? currentUser.points;
    const exactCount = currentRanking?.exactCount ?? currentUser.exactCount;
    const outcomeCount = currentRanking?.drawCount ?? currentUser.drawCount;
    const predictedCount = currentRanking?.predictCount ?? currentUser.predictCount;
    const appUrl = window.location.origin;

    const gradient = ctx.createLinearGradient(0, 0, 1080, 1350);
    gradient.addColorStop(0, "#020617");
    gradient.addColorStop(0.58, "#064e3b");
    gradient.addColorStop(1, "#022c22");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(930, 160, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 1190, 240, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 38px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EL POLLÓN MUNDIALISTA FIFA 2026", 540, 100);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 58px Arial, sans-serif";
    ctx.fillText("MI POSICIÓN EN EL RANKING", 540, 180);

    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.beginPath();
    ctx.roundRect(90, 240, 900, 860, 44);
    ctx.fill();
    ctx.strokeStyle = "rgba(251,191,36,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();

    const avatarX = 540;
    const avatarY = 390;
    const avatarRadius = 112;
    let avatarDrawn = false;
    try {
      const avatar = await loadShareImage(currentUser.avatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
      ctx.restore();
      avatarDrawn = true;
    } catch {
      avatarDrawn = false;
    }

    if (!avatarDrawn) {
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#022c22";
      ctx.font = "900 82px Arial, sans-serif";
      ctx.fillText(currentUser.name.trim().slice(0, 2).toUpperCase(), avatarX, avatarY + 28);
    }
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 48px Arial, sans-serif";
    ctx.fillText(currentUser.name.slice(0, 30), 540, 570);
    ctx.fillStyle = "#a7f3d0";
    ctx.font = "700 27px Arial, sans-serif";
    ctx.fillText(rankingTitle.toUpperCase(), 540, 620);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "900 184px Arial, sans-serif";
    ctx.fillText(`#${position}`, 540, 805);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 31px Arial, sans-serif";
    ctx.fillText("POSICIÓN ACTUAL", 540, 855);

    const stats = [
      { value: points, label: "PUNTOS" },
      { value: exactCount, label: "EXACTOS" },
      { value: outcomeCount, label: "RESULTADOS 1X2" },
      { value: predictedCount, label: "PARTIDOS" }
    ];
    stats.forEach((stat, index) => {
      const x = 180 + index * 240;
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 40px Arial, sans-serif";
      ctx.fillText(String(stat.value), x, 990);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 18px Arial, sans-serif";
      ctx.fillText(stat.label, x, 1025);
    });

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 38px Arial, sans-serif";
    ctx.fillText("¿PUEDES SUPERARME?", 540, 1170);
    ctx.fillStyle = "#a7f3d0";
    ctx.font = "700 26px Arial, sans-serif";
    ctx.fillText(appUrl.replace(/^https?:\/\//, ""), 540, 1225);
    ctx.fillStyle = "#64748b";
    ctx.font = "600 18px Arial, sans-serif";
    ctx.fillText("Comparte tu posición. No incluye correo, pagos ni pronósticos privados.", 540, 1290);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo exportar la tarjeta.")), "image/png", 0.95);
    });
  };

  const downloadRankingShareCard = async () => {
    setRankingShareBusy(true);
    try {
      const blob = await createRankingShareCard();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mi-ranking-pollon-${currentUser?.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "usuario"}.png`;
      link.click();
      URL.revokeObjectURL(url);
      showToast("Tarjeta de ranking descargada.", "success");
    } catch (err: any) {
      showToast(err.message || "No se pudo descargar la tarjeta.", "error");
    } finally {
      setRankingShareBusy(false);
    }
  };

  const shareCurrentRanking = async () => {
    setRankingShareBusy(true);
    try {
      const text = getRankingShareText();
      const url = window.location.origin;
      const blob = await createRankingShareCard();
      const file = new File([blob], "mi-ranking-pollon.png", { type: "image/png" });
      const shareData = { title: "Mi ranking en El Pollón Mundialista", text, url, files: [file] };

      if (navigator.share) {
        if (!navigator.canShare || navigator.canShare({ files: [file] })) {
          await navigator.share(shareData);
        } else {
          await navigator.share({ title: shareData.title, text, url });
        }
      } else {
        await copyTextToClipboard(`${text}\n${url}`, "Texto y enlace del ranking copiados.");
        await downloadRankingShareCard();
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") showToast(err.message || "No se pudo compartir el ranking.", "error");
    } finally {
      setRankingShareBusy(false);
    }
  };

  // ADMIN ACTION: MATCH CRUD / SCORES
  const handleSaveMatchForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchForm) return;
    try {
      const isNew = !matchForm.id;
      const url = isNew ? "/api/matches" : `/api/matches/${matchForm.id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(matchForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar partido");

      showToast(data.message, "success");
      setMatchForm(null);
      fetchGlobalData();
      fetchUserSpecificData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSimulateMatch = async (matchId: number) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/simulate`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          localScore: Math.floor(Math.random() * 4),
          visitorScore: Math.floor(Math.random() * 4)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(`¡Partido Simulado! ${data.match.local} ${data.match.localScore} - ${data.match.visitorScore} ${data.match.visitor}. Ranking recalculado.`, "success");
      fetchGlobalData();
      fetchUserSpecificData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleSyncMatchesFromApi = async () => {
    if (!confirm("Esto dejará football-data.org como fuente oficial, actualizará partidos desde la API y eliminará partidos manuales que sobren. ¿Continuar?")) return;
    setMatchSyncBusy(true);
    try {
      const res = await fetch("/api/admin/matches/sync-football-data", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ apiOnly: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo sincronizar la API de partidos.");

      showToast(data.message, "success");
      fetchGlobalData();
      fetchAdminStats();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setMatchSyncBusy(false);
    }
  };

  const handleDedupeMatches = async () => {
    if (!confirm("Esto fusionará partidos duplicados por fecha, etapa y equipos equivalentes. ¿Continuar?")) return;
    setMatchDedupeBusy(true);
    try {
      const res = await fetch("/api/admin/matches/dedupe", {
        method: "POST",
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron limpiar duplicados.");

      showToast(data.message, "success");
      fetchGlobalData();
      fetchUserSpecificData();
      fetchAdminStats();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setMatchDedupeBusy(false);
    }
  };

  // ADMIN ACTION: CREATE ANNOUNCEMENT / COMUNICADOS
  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(announcementForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");

      showToast(data.message, "success");
      setAnnouncementForm({ title: "", content: "", urgent: false, publishAt: "" });
      fetchAdminAnnouncements();
      fetchGlobalData();
      fetchUserSpecificData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm("¿Desea eliminar este comunicado?")) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: "DELETE", headers: getHeaders() });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast(data.message, "success");
      fetchAdminAnnouncements();
      fetchGlobalData();
      fetchUserSpecificData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const readFileAsDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const handleUploadAsset = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAssetUploadBusy(true);
    try {
      const data = await readFileAsDataUrl(file);
      const res = await fetch("/api/admin/assets", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          data
        })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "No se pudo cargar el archivo.");

      showToast(payload.message, "success");
      fetchAdminAssets();
      e.target.value = "";
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setAssetUploadBusy(false);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm("¿Desea eliminar este archivo de la biblioteca?")) return;
    try {
      const res = await fetch(`/api/admin/assets/${assetId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar el archivo.");

      showToast(data.message, "success");
      fetchAdminAssets();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const formatAssetSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAssetIcon = (asset: UploadedAsset) => {
    if (asset.type === "image") return <ImageIcon className="w-4 h-4 text-emerald-600" />;
    if (asset.type === "video") return <Video className="w-4 h-4 text-indigo-600" />;
    return <FileText className="w-4 h-4 text-amber-600" />;
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerForm({
      title: "",
      sponsorName: "",
      imageUrl: "",
      linkUrl: "",
      placement: "home_top",
      active: true,
      rotationSeconds: 5,
      startsAt: "",
      endsAt: ""
    });
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBannerId ? `/api/admin/banners/${editingBannerId}` : "/api/admin/banners";
      const res = await fetch(url, {
        method: editingBannerId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(bannerForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo guardar el banner.");

      showToast(data.message, "success");
      resetBannerForm();
      fetchAdminBanners();
      fetchGlobalData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const handleEditBanner = (banner: SponsorBanner) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      title: banner.title,
      sponsorName: banner.sponsorName,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      placement: banner.placement,
      active: banner.active,
      rotationSeconds: banner.rotationSeconds || 5,
      startsAt: banner.startsAt ? banner.startsAt.slice(0, 16) : "",
      endsAt: banner.endsAt ? banner.endsAt.slice(0, 16) : ""
    });
  };

  const copyTextToClipboard = async (text: string, successMessage = "URL copiada al portapapeles") => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMessage, "success");
    } catch {
      showToast("No se pudo copiar automaticamente. Selecciona y copia la URL manualmente.", "error");
    }
  };

  const imageAssets = uploadedAssets.filter((asset) => asset.type === "image");

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm("¿Desea eliminar este banner publicitario?")) return;
    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar el banner.");

      showToast(data.message, "success");
      fetchAdminBanners();
      fetchGlobalData();
    } catch (err: any) {
      showToast(err.message, "error");
    }
  };

  const renderSponsorBanner = (banner: SponsorBanner) => {
    const content = (
      <div className="group relative overflow-hidden rounded-xl border border-amber-200 dark:border-amber-900 bg-slate-950 shadow-sm">
        <img src={banner.imageUrl} alt={banner.title} className="w-full h-44 sm:h-52 md:h-36 object-cover opacity-95 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-3 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[9px] uppercase tracking-widest text-amber-300 font-bold">Pauta patrocinada</span>
              <h3 className="text-sm font-black truncate">{banner.title}</h3>
              <p className="text-[10px] text-slate-300 truncate">{banner.sponsorName}</p>
            </div>
            {banner.linkUrl && <ExternalLink className="w-4 h-4 text-amber-300 shrink-0" />}
          </div>
        </div>
      </div>
    );

    if (!banner.linkUrl) return content;
    return (
      <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    );
  };

  const handleLoadUserPredictions = async (user: User) => {
    try {
      const res = await fetch(`/api/predictions?userId=${user.id}`, { headers: getHeaders() });
      if (res.ok) {
        setUserPredictionsView(await res.json());
        setSelectedUserForPredictions(user);
      }
    } catch (err) {
      showToast("No se pudieron cargar las predicciones del usuario", "error");
    }
  };

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("No se pudo leer el archivo Excel."));
      reader.readAsDataURL(file);
    });

  const handlePredictionExcelImport = async (apply: boolean) => {
    if (!predictionImportFile) {
      showToast("Selecciona el archivo Excel con los pronósticos.", "error");
      return;
    }
    if (!predictionImportEmail.trim()) {
      showToast("Ingresa el correo del participante.", "error");
      return;
    }
    if (
      apply &&
      !window.confirm(
        "Se importarán únicamente los pronósticos de partidos todavía abiertos. Los partidos iniciados o finalizados serán omitidos. ¿Deseas continuar?"
      )
    ) {
      return;
    }

    setPredictionImportBusy(true);
    try {
      const fileBase64 = await fileToBase64(predictionImportFile);
      const response = await fetch("/api/admin/predictions/import-excel", {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          email: predictionImportEmail.trim().toLowerCase(),
          fileBase64,
          apply
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "No se pudo procesar el Excel.");
      setPredictionImportResult(data);
      if (apply) {
        showToast(`Importación completada: ${data.imported} pronósticos guardados.`, "success");
        fetchAdminUsers();
      } else {
        showToast("Vista previa lista. Revisa el resumen antes de importar.", "info");
      }
    } catch (error: any) {
      setPredictionImportResult(null);
      showToast(error.message || "No se pudo procesar el Excel.", "error");
    } finally {
      setPredictionImportBusy(false);
    }
  };

  // Helper date conversions
  const formatMatchDate = (isoString: string) => {
    const d = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Bogota"
    };
    return d.toLocaleString(DATE_LOCALES[lang] || "es-CO", options) + ` (${ui("bogota")})`;
  };

  const getMatchDateKey = (isoString: string) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date(isoString));
    const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${byType.year}-${byType.month}-${byType.day}`;
  };

  const formatMatchDateOnly = (isoString: string) =>
    new Date(isoString).toLocaleDateString(DATE_LOCALES[lang] || "es-CO", {
      timeZone: "America/Bogota",
      weekday: "short",
      month: "short",
      day: "numeric"
    });

  // Checks block 5 mins before kick-off
  const isMatchPredictionLocked = (match: Match) => {
    if (match.status !== "pending") return true;
    const matchTime = new Date(match.date).getTime();
    const lockTime = matchTime - 5 * 60 * 1000;
    return nowMs >= lockTime;
  };

  const getMatchClosingCountdown = (match: Match) => {
    if (match.status === "finished") return "Evento finalizado";
    if (match.status === "in_progress") return "Evento en curso";

    const lockTime = new Date(match.date).getTime() - 5 * 60 * 1000;
    const remainingMs = Math.max(lockTime - nowMs, 0);
    if (remainingMs === 0) return "Cerrado";

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const time = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");

    return days > 0 ? `${days}d ${time}` : time;
  };

  const getMatchTimeRemainingLabel = (match: Match) => {
    const matchTime = new Date(match.date).getTime();
    const diff = matchTime - nowMs;
    if (diff < 0) {
      return match.status === "finished" ? ui("finished") : ui("live_locked");
    }
    const diffMinutes = Math.floor(diff / 60000);
    if (diffMinutes < 5) return `🔒 ${ui("locked")}`;
    if (diffMinutes < 60) return ui("closes_in_min", { value: diffMinutes });
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return ui("closes_in_hours", { value: diffHours });
    return ui("closes_in_days", { value: Math.floor(diffHours / 24) });
  };

  const getPredictionResultPick = (local: number | "", visitor: number | ""): "1" | "X" | "2" | "" => {
    if (local === "" || visitor === "") return "";
    if (local > visitor) return "1";
    if (local === visitor) return "X";
    return "2";
  };

  const updatePredictionScore = (matchId: number, side: "local" | "visitor", delta: number) => {
    if (!canSubmitPredictions) return;
    setPredScores((prev) => {
      const current = prev[matchId] || { local: "", visitor: "" };
      const rawValue = current[side] === "" ? 0 : Number(current[side]);
      const nextValue = Math.max(0, Math.min(30, rawValue + delta));
      return { ...prev, [matchId]: { ...current, [side]: nextValue } };
    });
  };

  const setPredictionScoreValue = (matchId: number, side: "local" | "visitor", value: number | "") => {
    setPredScores((prev) => ({
      ...prev,
      [matchId]: { local: prev[matchId]?.local ?? "", visitor: prev[matchId]?.visitor ?? "", [side]: value }
    }));
  };

  const normalizeSearchText = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // Filtered lists
  const matchPhaseById = new Map<number, { key: string; label: string; detail: string; sortOrder: number }>();
  GROUP_STAGE_NAMES.forEach((stage) => {
    const groupMatches = matches
      .filter((match) => match.stage === stage)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id);

    groupMatches.forEach((match, index) => {
      const groupDate = Math.min(Math.floor(index / 2) + 1, 3);
      matchPhaseById.set(match.id, {
        key: `grupo-fecha-${groupDate}`,
        label: `Fecha ${groupDate}`,
        detail: "Fase de grupos",
        sortOrder: groupDate
      });
    });
  });

  matches.forEach((match) => {
    if (matchPhaseById.has(match.id)) return;
    const knockoutIndex = KNOCKOUT_STAGE_ORDER.indexOf(match.stage);
    matchPhaseById.set(match.id, {
      key: `fase-${normalizeSearchText(match.stage).replace(/\s+/g, "-")}`,
      label: getStageLabel(match.stage),
      detail: "Eliminatorias",
      sortOrder: knockoutIndex >= 0 ? 10 + knockoutIndex : 99
    });
  });

  const matchDateOptions = Array.from(
    new Map(
      Array.from(matchPhaseById.values())
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((phase) => [phase.key, phase])
    ).values()
  );

  const filteredMatches = matches.filter((m) => {
    const stageMatch = selectedStage === "Todos" || m.stage === selectedStage;
    const phaseMatch = selectedMatchDateKey === "Todas" || matchPhaseById.get(m.id)?.key === selectedMatchDateKey;
    const statusMatch =
      matchStatusFilter === "all" ||
      (matchStatusFilter === "pending" && m.status === "pending") ||
      (matchStatusFilter === "finished" && m.status === "finished");
    const searchText = normalizeSearchText(teamSearch);
    const searchableContent = normalizeSearchText([
      m.local,
      m.visitor,
      getTeamDisplayName(m.local, lang),
      getTeamDisplayName(m.visitor, lang),
      getStageLabel(m.stage),
      m.stadium,
      m.stage
    ].join(" "));
    const contentMatch = !searchText || searchText.split(/\s+/).every((term) => searchableContent.includes(term));
    return stageMatch && phaseMatch && statusMatch && contentMatch;
  });
  const hasMatchFilters = selectedStage !== "Todos" || selectedMatchDateKey !== "Todas" || matchStatusFilter !== "all" || teamSearch.trim().length > 0;
  const clearMatchFilters = () => {
    setSelectedStage("Todos");
    setSelectedMatchDateKey("Todas");
    setMatchStatusFilter("all");
    setTeamSearch("");
  };
  const canSubmitPredictions = appMode === "FREE" || Boolean(currentUser?.companyId) || currentUser?.role === "admin" || currentUser?.role === "superadmin" || currentUser?.role === "company_admin" || currentUser?.paymentStatus === "paid";
  const matchIds = new Set(matches.map((m) => m.id));
  const registeredPredictionsCount = predictions.filter((p) => matchIds.has(p.matchId)).length;
  const pendingPredictionsCount = Math.max(matches.length - registeredPredictionsCount, 0);
  const currentRanking = currentUser ? rankings.find((r) => r.userId === currentUser.id) : null;
  const finalMatch = matches.find((m) => m.stage === "Final");
  const finalClosedByMatch = finalMatch?.status === "finished" && nowMs >= new Date(finalMatch.date).getTime() + 60 * 1000;
  const finalClosedByOutcome = Boolean(tournamentOutcomes?.champion);
  const certificatesEnabled = finalClosedByMatch || finalClosedByOutcome;
  const isSuperAdminUser = currentUser?.role === "admin" || currentUser?.role === "superadmin";
  const isCompanyAdminUser = currentUser?.role === "company_admin";
  const canCreateGroupPool = Boolean(currentUser?.role === "standard" && !currentUser.companyId);
  const canSaveTournamentFavorites = Boolean(
    temporaryFavoritesAccessOpen ||
    currentUser?.role === "admin" ||
    currentUser?.role === "superadmin" ||
    currentUser?.role === "company_admin" ||
    currentUser?.companyId ||
    currentUser?.paymentStatus === "paid"
  );
  const canManageUsers = Boolean(isSuperAdminUser || isCompanyAdminUser);
  const manageableAnnouncements = announcements.filter((ann) => {
    if (isSuperAdminUser) return true;
    return Boolean(isCompanyAdminUser && currentUser?.companyId && ann.companyId === currentUser.companyId);
  });
  const isFreeOrCompanyUser = appMode === "FREE" || Boolean(currentUser?.companyId);
  const hasRealPrizeAccess = Boolean(
    currentUser?.paymentStatus === "paid" &&
    (currentUser.paymentProvider || currentUser.paymentReference || currentUser.paymentTransactionId || currentUser.stripeCheckoutSessionId || currentUser.stripePaymentIntentId)
  );
  const rankingTitle = hasRealPrizeAccess || isSuperAdminUser
    ? "Ranking general de usuarios pagos"
    : currentUser?.companyId
      ? "Ranking gratuito de tu empresa"
      : "Ranking de usuarios gratuitos";
  const rankingDescription = hasRealPrizeAccess || isSuperAdminUser
    ? "Incluye únicamente participantes con pago real confirmado, aunque pertenezcan a una empresa."
    : currentUser?.companyId
      ? "Incluye al administrador y los invitados de tu empresa que no hayan pagado Polla REAL."
      : "Esta clasificación es independiente del ranking de usuarios pagos.";
  const activeNavigationKey =
    onboardingOpen
      ? "how-to-play"
      : activeTab === "predictions" && predictionsMode === "favorites"
      ? "favorites"
      : activeTab;
  const navigateToMenuItem = (key: string) => {
    if (key === "how-to-play") {
      setOnboardingOpen(true);
    } else if (key === "favorites") {
      setActiveTab("predictions");
      setPredictionsMode("favorites");
    } else if (key === "predictions") {
      setActiveTab("predictions");
      setPredictionsMode("matches");
    } else {
      setActiveTab(key);
      if (key === "public-predictions") void fetchPublicPredictions();
    }
    setMobileMenuOpen(false);
  };
  const selectedPublicPredictionMatch = publicPredictionMatches.find((match) => match.id === selectedPublicMatchId) || null;
  const selectedCompany = companies.find((company) => company.id === selectedCompanyId);
  const hasFreshCompanyInviteSummary = companyInvitationSummary.companyId === selectedCompanyId;
  const companyInviteSlots = {
    playersCount: hasFreshCompanyInviteSummary ? companyInvitationSummary.playersCount : selectedCompany?.playersCount ?? 0,
    availableSlots: hasFreshCompanyInviteSummary ? companyInvitationSummary.availableSlots : selectedCompany?.availableSlots ?? selectedCompany?.maxPlayers ?? 0,
    maxPlayers: hasFreshCompanyInviteSummary ? companyInvitationSummary.maxPlayers : selectedCompany?.maxPlayers ?? 50
  };
  const getCompanyInvitationUrl = (invitation: CompanyInvitation) =>
    invitation.url || `${window.location.origin}/?invite=${encodeURIComponent(invitation.token)}`;
  const getWinnerPrize = (position: number) => {
    if (position === 1) return publicPrizePool?.payouts.first || 0;
    if (position === 2) return publicPrizePool?.payouts.second || 0;
    if (position === 3) return publicPrizePool?.payouts.third || 0;
    return 0;
  };
  const getWinnerPlaceLabel = (position: number) => {
    if (position === 1) return "1er puesto";
    if (position === 2) return "2do puesto";
    if (position === 3) return "3er puesto";
    return `puesto ${position}`;
  };
  const winnerEmailPreviewRanking = rankings.find((ranking) => ranking.position === winnerEmailPreviewPosition);
  const winnerEmailPreviewUser = adminUsers.find((user) => user.id === winnerEmailPreviewRanking?.userId);
  const winnerEmailPreviewName = winnerEmailPreviewRanking?.userName || `Participante del ${getWinnerPlaceLabel(winnerEmailPreviewPosition)}`;
  const winnerEmailPreviewPrize = getWinnerPrize(winnerEmailPreviewPosition);
  const renderPrizePodium = (
    payouts: { first: number; second: number; third: number },
    payoutRates = { first: 0.8, second: 0.15, third: 0.05 },
    variant: "dark" | "light" | "solid" = "light"
  ) => {
    const places = [
      {
        key: "second",
        label: "2do puesto",
        medal: "2",
        amount: payouts.second,
        rate: payoutRates.second,
        order: "order-2 sm:order-1",
        height: "min-h-24 sm:min-h-28",
        tone: variant === "dark"
          ? "bg-white/10 border-white/10 text-white"
          : variant === "solid"
            ? "bg-slate-200 border-slate-300 text-slate-950"
            : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white"
      },
      {
        key: "first",
        label: "1er puesto",
        medal: "1",
        amount: payouts.first,
        rate: payoutRates.first,
        order: "order-1 col-span-2 sm:order-2 sm:col-span-1 sm:-translate-y-3",
        height: "min-h-28 sm:min-h-32",
        tone: variant === "dark"
          ? "bg-amber-300/15 border-amber-300/30 text-amber-100"
          : "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-slate-950 dark:text-amber-100"
      },
      {
        key: "third",
        label: "3er puesto",
        medal: "3",
        amount: payouts.third,
        rate: payoutRates.third,
        order: "order-3",
        height: "min-h-20 sm:min-h-24",
        tone: variant === "dark"
          ? "bg-orange-300/10 border-orange-300/20 text-white"
          : variant === "solid"
            ? "bg-orange-200 border-orange-300 text-slate-950"
            : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900 text-slate-950 dark:text-orange-100"
      }
    ];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 items-end pt-3">
        {places.map((place) => (
          <div
            key={place.key}
            className={`${place.order} ${place.height} ${place.tone} min-w-0 rounded-xl border p-3 flex flex-col items-center justify-center text-center shadow-sm`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-amber-300 text-xs font-black shadow-sm">
              {place.medal}
            </span>
            <span className="mt-2 block text-[9px] uppercase font-black tracking-wide">{place.label}</span>
            <span className="mt-1 block w-full max-w-full text-[clamp(0.82rem,4.2vw,1.125rem)] sm:text-base lg:text-lg font-black leading-tight tracking-[-0.035em] [overflow-wrap:anywhere]">
              {formatCop(place.amount)}
            </span>
            <span className="mt-1 block text-[9px] opacity-70">{Math.round(place.rate * 100)}% del premio</span>
          </div>
        ))}
      </div>
    );
  };
  const getUserRoleLabel = (user: User) => {
    if (user.role === "admin" || user.role === "superadmin") return t("admin_title", "Administrador");
    if (user.role === "company_admin") return "Admin empresa";
    const participantLabels: Record<string, string> = {
      es: "Participante Oficial",
      en: "Official Participant",
      pt: "Participante oficial",
      fr: "Participant officiel",
      it: "Partecipante ufficiale",
      de: "Offizieller Teilnehmer",
      ar: "مشارك رسمي",
      ja: "公式参加者",
      ko: "공식 참가자",
      ru: "Официальный участник"
    };
    return participantLabels[lang] || participantLabels.es;
  };
  const getHeaderUserBadge = (user: User) => {
    if (user.role === "admin" || user.role === "superadmin") return "SUPER ADMIN";
    if (user.role === "company_admin") return "ADMIN EMPRESA";
    if (user.companyId) {
      const company = companies.find((item) => item.id === user.companyId);
      return `INVITADO - ${company?.name || "EMPRESA"}`;
    }
    if (user.paymentStatus === "paid") return "USUARIO PAGO";
    return "USUARIO FREE";
  };
  const getAdminUserType = (user: User) => {
    if (user.role === "superadmin") return { label: "SUPERADMIN", tone: "bg-violet-100 text-violet-800" };
    if (user.role === "admin") return { label: "ADMINISTRADOR", tone: "bg-indigo-100 text-indigo-800" };
    if (user.role === "company_admin") return { label: "ADMIN EMPRESA", tone: "bg-sky-100 text-sky-800" };
    if (user.companyId) return { label: "INVITADO EMPRESA", tone: "bg-cyan-100 text-cyan-800" };
    if (user.paymentStatus === "paid") return { label: "USUARIO PAGO", tone: "bg-emerald-100 text-emerald-800" };
    return { label: "USUARIO FREE", tone: "bg-slate-100 text-slate-700" };
  };
  const getAdminUserRoleLabel = (user: User) => {
    if (user.role === "superadmin") return "Superadmin";
    if (user.role === "admin") return "Administrador";
    if (user.role === "company_admin") return "Admin empresa";
    return "Usuario estándar";
  };
  const getUserCompanyName = (user: User) =>
    companies.find((company) => company.id === user.companyId)?.name || (user.companyId ? "Empresa asignada" : "Sin empresa");
  const formatHeaderPoints = (value?: number) => new Intl.NumberFormat("es-CO").format(value || 0);

  const unreadNotifications = notifications.filter((n) => !n.read);
  const topBanners = sponsorBanners.filter((banner) => banner.placement === "home_top");
  const sidebarBanners = sponsorBanners.filter((banner) => banner.placement === "sidebar");
  const rulesBanners = sponsorBanners.filter((banner) => banner.placement === "rules");

  const openPublicManagedPopupIfNeeded = (popupTorneo: TorneoConfig | null) => {
    if (!hasManagedPopupContent(popupTorneo)) return;
    setPublicManagedPopupShown(true);
    setManagedPopupOpen(true);
  };

  const closeManagedPopup = () => {
    setManagedPopupOpen(false);
  };

  const handleManagedPopupCta = () => {
    if (!currentUser) {
      setManagedPopupOpen(false);
      return;
    }
    setActiveTab(torneo?.popupCtaTab || "dashboard");
    setManagedPopupOpen(false);
  };

  const handlePublicRegisterClick = () => {
    setAuthMode("register");
  };

  useEffect(() => {
    if (!managedPopupOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeManagedPopup();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [managedPopupOpen, torneo, currentUser?.id]);

  useEffect(() => {
    const unreadCount = unreadNotifications.length;
    if (notificationSoundEnabled && unreadCount > previousUnreadCountRef.current && previousUnreadCountRef.current > 0) {
      try {
        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextCtor();
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        gain.gain.setValueAtTime(0.001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, audioContext.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.22);
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.24);
      } catch {
        // Browsers can block audio until the user has interacted with the page.
      }
    }
    previousUnreadCountRef.current = unreadCount;
  }, [unreadNotifications.length, notificationSoundEnabled]);

  useEffect(() => {
    const placements: SponsorBanner["placement"][] = ["home_top", "sidebar", "rules"];
    const timers = placements.map((placement) => {
      const bannersForPlacement = sponsorBanners.filter((banner) => banner.placement === placement);
      if (bannersForPlacement.length <= 1) return null;

      const currentIndex = bannerRotationIndex[placement] % bannersForPlacement.length;
      const currentBanner = bannersForPlacement[currentIndex];
      const delay = (currentBanner.rotationSeconds || 5) * 1000;

      return window.setTimeout(() => {
        setBannerRotationIndex((prev) => ({
          ...prev,
          [placement]: ((prev[placement] || 0) + 1) % bannersForPlacement.length
        }));
      }, delay);
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) window.clearTimeout(timer);
      });
    };
  }, [sponsorBanners, bannerRotationIndex]);

  useEffect(() => {
    if (!showNotificationPanel) return;

    const closeOnOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && notificationPanelRef.current?.contains(target)) return;
      setShowNotificationPanel(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowNotificationPanel(false);
    };

    document.addEventListener("mousedown", closeOnOutsideInteraction);
    document.addEventListener("touchstart", closeOnOutsideInteraction);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideInteraction);
      document.removeEventListener("touchstart", closeOnOutsideInteraction);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showNotificationPanel]);

  const getRotatingBanner = (banners: SponsorBanner[], placement: SponsorBanner["placement"]) => {
    if (banners.length === 0) return null;
    return banners[bannerRotationIndex[placement] % banners.length];
  };

  const activeTopBanner = getRotatingBanner(topBanners, "home_top");
  const activeSidebarBanner = getRotatingBanner(sidebarBanners, "sidebar");
  const activeRulesBanner = getRotatingBanner(rulesBanners, "rules");

  // SVG Sparkline drawing helper for User evolution points chart
  const renderSparkline = (pointsArray: number[]) => {
    if (!pointsArray || pointsArray.length < 2) return null;
    const padding = 15;
    const width = 280;
    const height = 90;
    const maxVal = Math.max(...pointsArray, 15);
    const minVal = 0;
    
    const pointsStr = pointsArray.map((v, i) => {
      const x = padding + (i / (pointsArray.length - 1)) * (width - padding * 2);
      const valDiff = maxVal - minVal;
      const y = height - padding - (valDiff === 0 ? 0 : ((v - minVal) / valDiff) * (height - padding * 2));
      return `${x},${y}`;
    }).join(" ");

    return (
      <svg className="w-full h-24 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0"/>
          </linearGradient>
        </defs>
        <path
          d={`M ${padding},${height - padding} L ${pointsStr} L ${width - padding},${height - padding} Z`}
          fill="url(#sparkGrad)"
        />
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={pointsStr}
        />
        {pointsArray.map((v, i) => {
          const x = padding + (i / (pointsArray.length - 1)) * (width - padding * 2);
          const valDiff = maxVal - minVal;
          const y = height - padding - (valDiff === 0 ? 0 : ((v - minVal) / valDiff) * (height - padding * 2));
          return (
            <g key={i} className="group cursor-pointer">
              <circle cx={x} cy={y} r="4" fill="#047857" className="transition-all group-hover:r-6" />
              <text x={x} y={y - 8} fontSize="10" fontWeight="bold" fill="#334155" textAnchor="middle" className="hidden group-hover:block bg-white p-1 rounded">
                Pt: {v}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderFormattedText = (text?: string, fallback = "") => {
    const value = text || fallback;
    return value.split("\n").map((line, lineIndex) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const isBullet = line.trim().startsWith("-");
      const cleanLine = isBullet ? line.replace(/^\s*-\s*/, "") : line;
      const cleanParts = cleanLine.split(/(\*\*[^*]+\*\*)/g);

      return (
        <p key={`${lineIndex}-${line}`} className={`${line.trim() === "" ? "h-2" : ""} ${isBullet ? "pl-4 relative" : ""}`}>
          {isBullet && <span className="absolute left-0 text-emerald-600 dark:text-emerald-400">-</span>}
          {(isBullet ? cleanParts : parts).map((part, partIndex) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={partIndex} className="font-black text-slate-950 dark:text-white">{part.slice(2, -2)}</strong>;
            }
            return <React.Fragment key={partIndex}>{part}</React.Fragment>;
          })}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans relative antialiased selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-xl transition-all duration-300 flex items-center gap-3 border max-w-sm ${
          toast.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
          toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" :
          "bg-blue-50 border-blue-200 text-blue-800"
        }`}>
          <div className={`w-3 h-3 rounded-full shrink-0 ${
            toast.type === "success" ? "bg-emerald-500" :
            toast.type === "error" ? "bg-rose-500" :
            "bg-blue-500"
          }`} />
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Hero Header */}
      <header className="bg-slate-900 text-white shadow-md border-b border-emerald-800 shrink-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-2.5">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 w-full md:flex-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-xl shadow-inner border border-emerald-400 overflow-hidden flex items-center justify-center shrink-0">
              <img
                src="/favicon.png"
                alt="El Pollon Mundialista"
                className="w-full h-full object-contain p-1"
                id="header_trophy_icon"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[11px] min-[390px]:text-xs sm:text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2 leading-tight uppercase whitespace-nowrap">
                <span className="sm:hidden block truncate">
                  EL POLLÓN MUNDIALISTA FIFA 2026
                </span>
                <span className="hidden sm:block truncate">
                  {torneo?.title || t("title", "Polla Mundialista 2026")}
                </span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-normal hidden sm:inline">
                  Mundial FIFA 2026
                </span>
              </h1>
              <span className="mt-1 inline-flex sm:hidden w-fit text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold leading-none">
                Mundial FIFA 2026
              </span>
              <p className="hidden sm:block text-[11px] md:text-[13px] text-slate-200 leading-snug max-w-2xl xl:max-w-3xl">
                {torneo?.description || t("subtitle", "Consigue puntos prediciendo resultados reales")}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto shrink-0">
            {/* Language Selector (10 Languages) */}
            <div className="hidden">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="min-h-10 md:min-h-0 appearance-none bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-all text-xs font-bold py-1.5 pl-8 pr-3.5 outline-none cursor-pointer shadow-sm focus:ring-1 focus:ring-emerald-500"
                title="Cambiar idioma / Change language"
              >
                <option value="es" className="bg-slate-900 text-white">🇪🇸 ES</option>
                <option value="en" className="bg-slate-900 text-white">🇺🇸 EN</option>
                <option value="pt" className="bg-slate-900 text-white">🇧🇷 PT</option>
                <option value="fr" className="bg-slate-900 text-white">🇫🇷 FR</option>
                <option value="it" className="bg-slate-900 text-white">🇮🇹 IT</option>
                <option value="de" className="bg-slate-900 text-white">🇩🇪 DE</option>
                <option value="ar" className="bg-slate-900 text-white">🇸🇦 AR</option>
                <option value="ja" className="bg-slate-900 text-white">🇯🇵 JA</option>
                <option value="ko" className="bg-slate-900 text-white">🇰🇷 KO</option>
                <option value="ru" className="bg-slate-900 text-white">🇷🇺 RU</option>
              </select>
              <div className="pointer-events-none absolute left-2.5 flex items-center text-emerald-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Aesthetic Segmented Theme Picker */}
            <div className="hidden">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-lg transition-all ${theme === "light" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                title={t("theme_light", "Claro")}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-lg transition-all ${theme === "dark" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                title={t("theme_dark", "Oscuro")}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-1.5 rounded-lg transition-all ${theme === "system" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400 hover:text-white"}`}
                title={t("theme_system", "Sistema")}
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentUser ? (
              <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile_header_nav"
                  className="md:hidden h-10 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 shadow-sm border border-slate-700/60 shrink-0"
                  title="Abrir navegacion"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  Menú
                </button>

                {/* Notification Bell Trigger */}
                <div className="relative ml-auto md:ml-0" ref={notificationPanelRef}>
                  <button
                    onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    className="h-9 w-9 sm:h-10 sm:w-10 p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors relative flex items-center justify-center"
                    id="bell_notification_trigger"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </button>

                  {/* Dropdown notifications list */}
                  {showNotificationPanel && (
                    <div className="fixed right-4 left-4 md:absolute md:right-0 md:left-auto md:w-80 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-40 text-slate-800 dark:text-slate-200 overflow-hidden">
                      <div className="p-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                        <span className="font-semibold text-xs flex items-center gap-1">
                          <Bell className="w-4 h-4 text-emerald-400" /> {t("notif_title", "Alertas")} ({notifications.length})
                        </span>
                        {unreadNotifications.length > 0 && (
                          <button
                            onClick={handleReadAllNotifications}
                            className="text-[10px] font-bold text-emerald-400 hover:underline"
                          >
                            {t("mark_read", "Marcar todo leído")}
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-center text-xs text-slate-500">No tienes alertas o avisos registrados.</p>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 transition-colors ${n.read ? "bg-white dark:bg-slate-900" : "bg-emerald-50/50 dark:bg-slate-800/50"}`}
                              onClick={() => !n.read && handleReadNotification(n.id)}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <span className="font-semibold text-[11px] text-slate-900 dark:text-slate-100">{n.title}</span>
                                {!n.read && (
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-tight">{n.message}</p>
                              <span className="text-[9px] text-slate-400 block mt-1">{new Date(n.date).toLocaleDateString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Widget */}
                <div className="relative flex items-center gap-1.5 min-w-0" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen((open) => !open);
                      setMobileMenuOpen(false);
                    }}
                    className="h-12 max-w-[178px] sm:max-w-none rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 pl-1.5 pr-2 sm:pr-2 md:pr-3 flex items-center gap-1.5 sm:gap-2 transition-colors overflow-hidden"
                    title="Abrir configuracion de usuario"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                  >
                    <div className="relative w-[72px] sm:w-[86px] h-10 shrink-0 flex items-start justify-center">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-emerald-500 object-cover shrink-0"
                      />
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 max-w-[72px] sm:max-w-[86px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[8px] sm:text-[9px] font-black leading-none truncate shadow-sm">
                        {currentUser.name}
                      </span>
                    </div>
                    <div className="block text-left min-w-0 sm:min-w-[150px] md:min-w-[180px]">
                      <span className="hidden sm:block text-xs font-semibold leading-tight max-w-44 truncate">{currentUser.name}</span>
                      <span className="block mt-0.5 sm:mt-1 truncate text-[8px] sm:text-[9px] font-black text-emerald-300 uppercase leading-tight max-w-[120px] sm:max-w-44">
                        {getHeaderUserBadge(currentUser)}
                      </span>
                      <span className="block text-[8px] sm:text-[10px] text-slate-300 font-mono mt-0.5 leading-tight whitespace-nowrap truncate max-w-[120px] sm:max-w-44">
                        <span className="sm:hidden">#{currentRanking?.position || "-"} · {formatHeaderPoints(currentRanking?.points ?? currentUser.points)} pts</span>
                        <span className="hidden sm:inline">POS: #{currentRanking?.position || "-"} · Puntaje: {formatHeaderPoints(currentRanking?.points ?? currentUser.points)}</span>
                      </span>
                      <span className="hidden">
                        POS: #{currentRanking?.position || "-"} · #Pts: {formatHeaderPoints(currentRanking?.points ?? currentUser.points)}
                      </span>
                      <span className="hidden">
                        POS: #{currentRanking?.position || "-"} · PUNTAJE: {formatHeaderPoints(currentUser.points)}
                      </span>
                    <span className="hidden">
                      {currentUser.role === "admin" || currentUser.role === "superadmin" || currentUser.role === "company_admin" ? getUserRoleLabel(currentUser) : `${t("points", "PUNTUACIÓN")}: ${currentUser.points} pts`}
                    </span>
                  </div>
                    <ChevronDown className={`hidden sm:block w-4 h-4 text-slate-400 shrink-0 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-[min(92vw,320px)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden" role="menu">
                      <div className="p-4 bg-slate-950 text-white">
                        <p className="text-sm font-black truncate">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-300 mt-0.5 truncate">{getHeaderUserBadge(currentUser)}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        {[
                          { section: "profile" as const, label: "Datos de perfil", icon: Settings },
                          { section: "avatar" as const, label: "Avatar o imagen", icon: ImageIcon },
                          { section: "preferences" as const, label: "Idioma, tema y sonido", icon: Laptop },
                          { section: "security" as const, label: "Cambiar contrasena", icon: Lock },
                          { section: "session" as const, label: "Sesion y salida", icon: LogOut }
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.section}
                              type="button"
                              role="menuitem"
                              onClick={() => openAccountSection(item.section)}
                              className="w-full min-h-11 px-3 rounded-xl flex items-center gap-2 text-left text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                            >
                              <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400 hidden lg:block">{t("subtitle", "Consigue puntos prediciendo resultados reales")}</span>
            )}
          </div>
        </div>
      </header>

      {currentUser && mobileMenuOpen && (
        <nav
          id="mobile_header_nav"
          aria-label="Menú principal móvil"
          className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-emerald-800 shadow-xl"
        >
          <div className="px-4 py-3 grid grid-cols-2 gap-2">
            {[
              { key: "how-to-play", label: "¿Cómo Jugar?", icon: Info },
              { key: "dashboard", label: "Resumen", icon: BarChart3 },
              { key: "predictions", label: "Mis Pronósticos", icon: Calendar },
              ...(canCreateGroupPool ? [{ key: "group-pool", label: "Crear Polla Grupal", icon: Users }] : []),
              { key: "favorites", label: "Favoritos", icon: Trophy },
              { key: "participate", label: "Partidos", icon: CreditCard },
              { key: "ranking", label: "Clasificación", icon: Trophy },
              { key: "public-predictions", label: "Pronósticos Públicos", icon: Eye },
              { key: "rules-prizes", label: "Premios", icon: Info },
              ...(isSuperAdminUser ? [{ key: "admin-stats", label: "Métricas", icon: BarChart3 }] : []),
              ...(canManageUsers ? [{ key: "admin-users", label: "Usuarios", icon: Users }] : []),
              ...(canManageUsers ? [{ key: "admin-companies", label: isCompanyAdminUser ? "Administrador Grupal" : "Empresas", icon: Tv }] : []),
              ...(isSuperAdminUser ? [{ key: "admin-matches", label: "Partidos Admin", icon: Calendar }] : []),
              ...(isSuperAdminUser || isCompanyAdminUser ? [{ key: "admin-announcements", label: "Comunicados", icon: Megaphone }] : []),
              ...(isSuperAdminUser ? [{ key: "admin-assets", label: "Biblioteca", icon: ImageIcon }] : []),
              ...(isSuperAdminUser ? [{ key: "admin-banners", label: "Pauta", icon: ExternalLink }] : []),
              ...(isSuperAdminUser ? [{ key: "admin-config", label: "Configuración", icon: Settings }] : [])
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNavigationKey === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateToMenuItem(item.key)}
                  className={`min-h-12 rounded-xl px-3 flex items-center gap-2 text-left text-xs font-black transition-colors ${
                    isActive
                      ? "bg-emerald-500 text-emerald-950"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-5 md:py-6 flex flex-col md:flex-row gap-5 md:gap-6">

        {!currentUser ? (
          /* Authentication Screen */
          <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden my-6">
            <div className="p-6 bg-slate-900 border-b border-emerald-800 text-center text-white">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold">{authT("auth_box_title")}</h2>
              <p className="text-xs text-slate-300 mt-1">{authT("auth_box_subtitle")}</p>
            </div>
            
            <form onSubmit={authMode === "login" ? handleLogin : authMode === "register" ? handleRegister : handleRecover} className="p-6 space-y-4">
              
              {authMode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{authT("auth_public_name")}</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Ej. PipeDiaz10"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      minLength={3}
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">{authT("auth_public_name_hint")}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{authT("auth_country")}</label>
                    <select
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      value={normalizeCountryName(authCountry)}
                      onChange={(e) => setAuthCountry(e.target.value)}
                      required
                    >
                      {COUNTRY_OPTIONS.map((country) => (
                        <option key={country.name} value={country.name}>{getCountryOptionLabel(country)}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">{authT("auth_country_hint")}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{authT("auth_choose_avatar")}</label>
                    <button
                      type="button"
                      onClick={() => setShowAuthAvatarModal(true)}
                      className="w-full min-h-14 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-700 flex items-center justify-between gap-3 transition-colors"
                    >
                      <span className="flex items-center gap-3 text-left">
                        <img src={authAvatar} alt="Avatar seleccionado" className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500" referrerPolicy="no-referrer" />
                        <span>
                          <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">Avatar seleccionado</span>
                          <span className="block text-[10px] text-slate-400">Cambiar avatar</span>
                        </span>
                      </span>
                      <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </button>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{authT("auth_email")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="correo@ejemplo.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {authMode !== "recover" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{authT("auth_password")}</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showAuthPassword ? "text" : "password"}
                      className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title={showAuthPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    >
                      {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {authMode === "register" && (
                    <>
                      <div className="mt-3">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{authT("auth_confirm_password")}</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type={showAuthConfirmPassword ? "text" : "password"}
                            className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder={authT("auth_confirm_placeholder")}
                            value={authConfirmPassword}
                            onChange={(e) => setAuthConfirmPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthConfirmPassword(!showAuthConfirmPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title={showAuthConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                          >
                            {showAuthConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                        {passwordChecks.map((check) => (
                          <div key={check.label} className={`flex items-center gap-2 text-[11px] font-medium ${check.valid ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"}`}>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${check.valid ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700" : "bg-slate-200 dark:bg-slate-800 text-slate-500"}`}>
                              {check.valid ? "✓" : "•"}
                            </span>
                            {check.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => setAuthMode("recover")}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-1.5 block font-medium cursor-pointer"
                    >
                      {authT("auth_forgot")}
                    </button>
                  )}
                </div>
              )}

              {authMode === "register" && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3">
                  <input
                    id="auth_privacy_accepted"
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500"
                    checked={authPrivacyAccepted}
                    onChange={(e) => setAuthPrivacyAccepted(e.target.checked)}
                    required
                  />
                  <span className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    <label htmlFor="auth_privacy_accepted" className="font-semibold cursor-pointer">
                      Acepto el{" "}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPrivacyNoticeModal(true)}
                      className="font-black text-emerald-700 dark:text-emerald-300 underline underline-offset-2 hover:text-emerald-800 dark:hover:text-emerald-200"
                    >
                      Aviso de Privacidad
                    </button>
                    <span> y la política de tratamiento de datos.</span>
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={authMode === "register" && isRegisterSubmitDisabled}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold shadow-md transition-colors ${authMode === "register" && isRegisterSubmitDisabled ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"}`}
              >
                {authMode === "login" ? authT("auth_btn_login") : authMode === "register" ? authT("auth_btn_register") : authT("auth_btn_recover")}
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
                {authMode === "login" ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {authT("auth_no_account")}{" "}
                    <button type="button" onClick={handlePublicRegisterClick} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer">
                      {authT("auth_btn_register_now")}
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {authT("auth_has_account")}{" "}
                    <button type="button" onClick={() => setAuthMode("login")} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer">
                      {authT("auth_btn_login_now")}
                    </button>
                  </p>
                )}
              </div>
            </form>
          </div>
        ) : (
          /* Logged In Portal Layout */
          <>
            {/* Sidebar Navigation */}
            <aside className="hidden md:flex w-full md:w-64 shrink-0 flex-col gap-4">
              
              {/* Soccer Ball Toggle Button (Only visible on responsive mobile viewports) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-controls="sidebar_nav"
                className="md:hidden w-full min-h-[106px] flex items-start justify-between bg-slate-50 hover:bg-white text-slate-950 px-6 py-5 rounded-[22px] shadow-sm border border-slate-100 transition-all duration-200"
              >
                <span className="relative inline-flex min-w-[145px] flex-col gap-1 px-3 py-2 font-mono text-[12px] leading-5 text-left">
                  <span className="absolute left-0 top-0 h-2 w-2 border-l border-t border-slate-950" />
                  <span className="absolute right-0 top-0 h-2 w-2 border-r border-t border-slate-950" />
                  <span className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-slate-950" />
                  <span className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-slate-950" />
                  <span>El Pollón Mundialista</span>
                  <span className="flex items-center justify-between">
                    <span aria-hidden="true">|</span>
                    <span className="text-lg leading-none" aria-hidden="true">≡</span>
                  </span>
                </span>
                <Copy className="mt-0.5 h-4 w-4 text-slate-950" aria-hidden="true" />
              </button>

              {/* Collapsible Content wrapper */}
              <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col gap-4 w-full`}>
                
                {/* Profile Card Summary */}
                <div className="hidden md:block bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-850">
                  <div className="flex items-center gap-3">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
                    <div>
                      <h3 className="font-bold text-sm leading-tight">{currentUser.name}</h3>
                      <p className="text-[10px] text-slate-400 capitalize">{getUserRoleLabel(currentUser)}</p>
                      <p className="text-[10px] text-slate-300 mt-1 flex items-center gap-1.5">
                        <span className="text-sm leading-none">{getCountryFlag(currentUser.country)}</span>
                        <span className="truncate max-w-[120px]">{normalizeCountryName(currentUser.country)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                    <div className="bg-slate-800/40 p-2 rounded-lg">
                      <span className="block text-[8px] md:text-[9px] text-slate-400 uppercase font-semibold">{t("points", "PUNTUACIÓN")}</span>
                      <span className="text-base font-bold text-amber-400">{currentUser.points}</span>
                    </div>
                    <div className="bg-slate-800/40 p-2 rounded-lg">
                      <span className="block text-[8px] md:text-[9px] text-slate-400 uppercase font-semibold">{t("predictions", "PRONÓSTICOS")}</span>
                      <span className="text-base font-bold text-emerald-400">{currentUser.predictCount}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("ranking")}
                      className="bg-slate-800/40 hover:bg-slate-800/70 p-2 rounded-lg transition-colors"
                    >
                      <span className="block text-[8px] md:text-[9px] text-slate-400 uppercase font-semibold">Ranking</span>
                      <span className="text-base font-bold text-sky-300">#{currentRanking?.position || "-"}</span>
                    </button>
                  </div>
                </div>

                {/* Navigation Actions Menu */}
                <nav className="flex flex-col gap-0.5 p-5 md:p-2 bg-slate-50 md:bg-white dark:bg-slate-900 rounded-[22px] md:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm font-mono md:font-sans" id="sidebar_nav">
                  
                  <span className="hidden md:block text-[9px] font-bold text-slate-400 dark:text-slate-500 px-3 pt-2 pb-1 uppercase tracking-wider">{t("menu_user", "Menú Usuario")}</span>
                  
                  <button
                    type="button"
                    onClick={() => navigateToMenuItem("how-to-play")}
                    className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "how-to-play" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <span className="md:hidden" aria-hidden="true">?</span>
                    <Info className="hidden md:block w-4 h-4 shrink-0" />
                    <span>Cómo jugar</span>
                  </button>

                  <button
                    onClick={() => navigateToMenuItem("dashboard")}
                    className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "dashboard" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <span className="md:hidden" aria-hidden="true">🏠</span>
                    <BarChart3 className="hidden md:block w-4 h-4 shrink-0" />
                    <span className="md:hidden">Resumen</span>
                    <span className="hidden md:inline">{t("tab_dashboard", "Mi Resumen & Estadísticas")}</span>
                  </button>

                  <button
                    onClick={() => navigateToMenuItem("predictions")}
                    className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "predictions" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <span className="md:hidden" aria-hidden="true">🌐</span>
                    <Calendar className="hidden md:block w-4 h-4 shrink-0" />
                    <span className="md:hidden">Mis Pronósticos</span>
                    <span className="hidden md:inline">{t("tab_predictions", "Calendario & Pronósticos")}</span>
                  </button>

                  {canCreateGroupPool && (
                    <button
                      type="button"
                      onClick={() => navigateToMenuItem("group-pool")}
                      className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "group-pool" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                    >
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Crear Polla Grupal</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigateToMenuItem("favorites")}
                    className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "favorites" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <span className="md:hidden" aria-hidden="true">★</span>
                    <Trophy className="hidden md:block w-4 h-4 shrink-0" />
                    <span>Favoritos del Torneo</span>
                  </button>

                  <button
                    onClick={() => navigateToMenuItem("participate")}
                    className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "participate" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <span className="md:hidden" aria-hidden="true">🧾</span>
                    <CreditCard className="hidden md:block w-4 h-4 shrink-0" />
                    <span className="md:hidden">Partidos</span>
                    <span className="hidden md:inline">Participar en Polla</span>
                    {currentUser.paymentStatus === "paid" && (
                      <span className="hidden md:inline ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">Pago</span>
                    )}
                  </button>

                  <button
                    onClick={() => navigateToMenuItem("ranking")}
                    className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "ranking" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <span className="md:hidden" aria-hidden="true">🏆</span>
                    <Trophy className="hidden md:block w-4 h-4 shrink-0" />
                    <span className="md:hidden">Clasificación</span>
                    <span className="hidden md:inline">{t("tab_ranking", "Tabla de Clasificación")}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateToMenuItem("public-predictions")}
                    className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "public-predictions" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <Eye className="w-4 h-4 shrink-0" />
                    <span>Pronósticos Públicos</span>
                  </button>

                  <button
                    onClick={() => navigateToMenuItem("rules-prizes")}
                    className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "rules-prizes" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <span className="md:hidden" aria-hidden="true">💰</span>
                    <Info className="hidden md:block w-4 h-4 shrink-0" />
                    <span className="md:hidden">Premios</span>
                    <span className="hidden md:inline">{t("tab_rules", "Reglas y Premiaciones")}</span>
                  </button>

                  {/* ADMINS MODULE ENTRY CHANGER */}
                  {canManageUsers && (
                    <>
                      <span className="hidden md:block text-[9px] font-bold text-slate-400 dark:text-slate-500 px-3 pt-3 pb-1 uppercase tracking-wider border-t border-slate-100 dark:border-slate-800 mt-2">{t("admin_title", "ADMINISTRACIÓN")}</span>

                      {isSuperAdminUser && <button
                        onClick={() => navigateToMenuItem("admin-stats")}
                        className={`hidden md:flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "admin-stats" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <BarChart3 className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        {t("admin_stats", "Dashboard & Métricas")}
                      </button>}

                      <button
                        onClick={() => navigateToMenuItem("admin-users")}
                        className={`hidden md:flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "admin-users" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <Users className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        {t("admin_users", "Gestión de Usuarios")}
                      </button>

                      <button
                        onClick={() => navigateToMenuItem("admin-companies")}
                        className={`hidden md:flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "admin-companies" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <Tv className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        {isCompanyAdminUser ? "Administrador Grupal" : "Empresas e invitaciones"}
                      </button>

                      {isSuperAdminUser && <button
                        onClick={() => navigateToMenuItem("admin-matches")}
                        className={`hidden md:flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "admin-matches" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <Calendar className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        {t("admin_matches", "Gestión de Partidos")}
                      </button>}

                      <button
                        onClick={() => navigateToMenuItem("admin-announcements")}
                        className={`hidden md:flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeNavigationKey === "admin-announcements" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <Bell className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        {isCompanyAdminUser ? "Comunicados empresa" : t("admin_announcement", "Publicar Comunicados")}
                      </button>

                      <button
                        disabled={!isSuperAdminUser}
                        onClick={() => navigateToMenuItem("admin-assets")}
                        className={`hidden md:flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${!isSuperAdminUser ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-75" : activeNavigationKey === "admin-assets" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                        title={!isSuperAdminUser ? "Disponible solo para SuperAdmin" : undefined}
                      >
                        <FileText className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        Biblioteca de Assets
                        {!isSuperAdminUser && <Lock className="ml-auto w-3.5 h-3.5 text-slate-400" />}
                      </button>

                      <button
                        disabled={!isSuperAdminUser}
                        onClick={() => navigateToMenuItem("admin-banners")}
                        className={`hidden md:flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${!isSuperAdminUser ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-75" : activeNavigationKey === "admin-banners" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                        title={!isSuperAdminUser ? "Disponible solo para SuperAdmin" : undefined}
                      >
                        <Megaphone className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        Banners de Pauta
                        {!isSuperAdminUser && <Lock className="ml-auto w-3.5 h-3.5 text-slate-400" />}
                      </button>

                      <button
                        disabled={!isSuperAdminUser}
                        onClick={() => navigateToMenuItem("admin-config")}
                        className={`flex min-h-12 items-center gap-2.5 px-3 py-2 text-[12px] md:text-xs font-semibold rounded-xl text-left transition-colors ${!isSuperAdminUser ? "text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-75" : activeNavigationKey === "admin-config" ? "md:bg-emerald-50 dark:md:bg-slate-800 text-slate-950 md:text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-950 md:text-slate-600 dark:text-slate-300 hover:bg-white md:hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                        title={!isSuperAdminUser ? "Disponible solo para SuperAdmin" : undefined}
                      >
                        <span className="md:hidden" aria-hidden="true">⚙️</span>
                        <Settings className="hidden md:block w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
                        <span className="md:hidden">Configuración</span>
                        <span className="hidden md:inline">{t("admin_config", "Políticas de la Polla")}</span>
                        {!isSuperAdminUser && <Lock className="ml-auto w-3.5 h-3.5 text-slate-400" />}
                      </button>
                    </>
                  )}
                </nav>

                {/* Countdown Next Match Info Widget */}
                {(() => {
                  const pendingMatches = matches.filter((m) => m.status === "pending").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  const fallbackMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                  const displayMatches = pendingMatches.length > 0 ? pendingMatches.slice(0, 3) : fallbackMatches.slice(0, 3);

                  if (displayMatches.length === 0) return null;

                  return (
                    <div className="hidden md:block bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-emerald-800/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-extrabold text-amber-350 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> 
                          {ui("next_3_matches")}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold uppercase tracking-wider">
                          {ui("live_ticker")}
                        </span>
                      </div>

                      <div className="space-y-3 divide-y divide-slate-800/60">
                        {displayMatches.map((m, index) => {
                          const localShort = getShortTeamName(m.local, lang);
                          const visitorShort = getShortTeamName(m.visitor, lang);
                          const timeLabel = getMatchTimeRemainingLabel(m);
                          const isPending = m.status === "pending";

                          return (
                            <div 
                              key={m.id} 
                              className={`text-xs space-y-1.5 ${index !== 0 ? "pt-3" : ""}`}
                            >
                              <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                                <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-[8px] font-semibold tracking-wider uppercase text-emerald-300 border border-slate-705">
                                  {getStageLabel(m.stage)}
                                </span>
                                <span className="truncate max-w-[110px] text-slate-400 font-mono" title={m.stadium}>
                                  📍 {m.stadium}
                                </span>
                              </div>

                              <div className="font-bold flex items-center justify-between bg-slate-950/40 p-2 rounded-xl border border-slate-805 hover:bg-slate-950/60 transition-colors">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="inline-block text-sm shrink-0 select-none">{getTeamFlag(m.local)}</span>
                                  <span className="truncate text-slate-100">{localShort}</span>
                                </div>
                                
                                {m.status === "finished" ? (
                                  <div className="mx-2 px-1.5 py-0.5 rounded bg-slate-850 border border-slate-700 font-mono text-[9px] text-amber-400 font-bold shrink-0">
                                    {m.localScore} - {m.visitorScore}
                                  </div>
                                ) : (
                                  <span className="text-emerald-400 font-normal text-[10px] mx-2 shrink-0">vs</span>
                                )}

                                <div className="flex items-center gap-1.5 text-right justify-end min-w-0">
                                  <span className="truncate text-slate-100">{visitorShort}</span>
                                  <span className="inline-block text-sm shrink-0 select-none">{getTeamFlag(m.visitor)}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-[9px] px-0.5">
                                <span className="text-emerald-300 font-medium font-mono">
                                  📅 {formatMatchDate(m.date).replace(` (${ui("bogota")})`, "")}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded-full font-bold uppercase text-[8px] tracking-wide ${
                                  isPending 
                                    ? (timeLabel.includes("🔒") ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25")
                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                                }`}>
                                  {timeLabel}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {activeSidebarBanner && (
                  <div className="space-y-3">
                    {renderSponsorBanner(activeSidebarBanner)}
                  </div>
                )}
                
              </div>
            </aside>

            {/* Content Area */}
            <section className="flex-1 min-w-0 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 md:p-6 overflow-hidden transition-colors">
              {activeTopBanner && activeTab !== "admin-banners" && (
                <div className="mb-5">
                  {renderSponsorBanner(activeTopBanner)}
                </div>
              )}
              
              {activeTab === "account" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Settings className="text-emerald-600 w-5 h-5" /> Configuracion de usuario
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Usa este menu para editar perfil, avatar, preferencias, seguridad y sesion.</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2">
                    {[
                      { section: "profile" as const, label: "Perfil", icon: Settings },
                      { section: "avatar" as const, label: "Avatar", icon: ImageIcon },
                      { section: "preferences" as const, label: "Preferencias", icon: Laptop },
                      { section: "security" as const, label: "Contrasena", icon: Lock },
                      { section: "session" as const, label: "Sesion", icon: LogOut }
                    ].map((item) => {
                      const Icon = item.icon;
                      const selected = accountSection === item.section;
                      return (
                        <button
                          key={item.section}
                          type="button"
                          onClick={() => setAccountSection(item.section)}
                          className={`min-h-11 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black transition-colors ${selected ? "bg-emerald-600 text-white shadow-sm" : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                        >
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  <form onSubmit={handleUpdateProfile} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                    {accountSection === "profile" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <img src={profileAvatar || currentUser.avatar} alt={profileName || currentUser.name} className="w-16 h-16 rounded-full object-cover border-4 border-emerald-500 shadow-sm" />
                          <div>
                            <h3 className="text-sm font-black text-slate-950 dark:text-white">Datos de perfil</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Nombre, pais y estado visible dentro de la polla.</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre de usuario</label>
                            <input type="text" className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Pais</label>
                            <select className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100" value={normalizeCountryName(profileCountry)} onChange={(e) => setProfileCountry(e.target.value)} required>
                              {COUNTRY_OPTIONS.map((country) => <option key={country.name} value={country.name}>{getCountryOptionLabel(country)}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-600 dark:text-slate-300">
                          <span className="font-black text-slate-900 dark:text-white">{getHeaderUserBadge(currentUser)}</span> - POS #{currentRanking?.position || "-"} - {formatHeaderPoints(currentUser.points)} pts
                        </div>
                      </div>
                    )}

                    {accountSection === "avatar" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <img src={profileAvatar || currentUser.avatar} alt={profileName || currentUser.name} className="w-20 h-20 rounded-full object-cover border-4 border-emerald-500 shadow-sm" />
                          <div className="space-y-2">
                            <h3 className="text-sm font-black text-slate-950 dark:text-white">Avatar o imagen</h3>
                            <label htmlFor="account_profile_image_upload_new" className="min-h-10 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 cursor-pointer">
                              <Upload className="w-4 h-4" /> Cargar imagen
                            </label>
                            <input id="account_profile_image_upload_new" type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2">Avatares disponibles</p>
                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                            {AVATARS.slice(0, 10).map((avatar, idx) => (
                              <button key={idx} type="button" onClick={() => setProfileAvatar(avatar)} className={`rounded-full border-2 p-0.5 transition-all ${profileAvatar === avatar ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"}`} aria-label={`Usar avatar ${idx + 1}`}>
                                <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full aspect-square rounded-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {accountSection === "preferences" && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-black text-slate-950 dark:text-white">Idioma, tema y sonido</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ajustes personales de experiencia.</p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Idioma</label>
                          <select className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100" value={lang} onChange={(e) => setLang(e.target.value as any)}>
                            <option value="es">ES - Espanol</option><option value="en">EN - English</option><option value="pt">PT - Portugues</option><option value="fr">FR - Francais</option><option value="it">IT - Italiano</option><option value="de">DE - Deutsch</option><option value="ar">AR</option><option value="ja">JA</option><option value="ko">KO</option><option value="ru">RU</option>
                          </select>
                        </div>
                        <div>
                          <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">Tema</span>
                          <div className="grid grid-cols-3 gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
                            {[{ value: "light", label: "Claro", icon: Sun }, { value: "dark", label: "Oscuro", icon: Moon }, { value: "system", label: "Sistema", icon: Laptop }].map((item) => {
                              const Icon = item.icon;
                              const selected = theme === item.value;
                              return <button key={item.value} type="button" onClick={() => setTheme(item.value as "light" | "dark" | "system")} className={`min-h-11 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-colors ${selected ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}><Icon className="w-4 h-4" />{item.label}</button>;
                            })}
                          </div>
                        </div>
                        <label className="min-h-12 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 cursor-pointer">
                          <input type="checkbox" checked={notificationSoundEnabled} onChange={(e) => setNotificationSoundEnabled(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 border-slate-300" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sonido de notificaciones</span>
                        </label>
                        <label className="min-h-12 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 cursor-pointer">
                          <input type="checkbox" checked={profileEmailSubscribed} onChange={(e) => setProfileEmailSubscribed(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 border-slate-300" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notificaciones por correo</span>
                        </label>
                      </div>
                    )}

                    {accountSection === "security" && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-black text-slate-950 dark:text-white">Cambiar contrasena</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Deja el campo vacio si no quieres cambiarla.</p>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Nueva contrasena</label>
                          <input type="password" className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100" placeholder="Dejar vacio para conservar actual" value={profileNewPass} onChange={(e) => setProfileNewPass(e.target.value)} />
                        </div>
                      </div>
                    )}

                    {accountSection === "session" && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-black text-slate-950 dark:text-white">Sesion de usuario</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Consulta tu ultimo inicio y cierra la sesion desde aqui.</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
                          <span className="block text-[10px] uppercase font-black text-slate-500 dark:text-slate-400">Ultima vez de inicio de sesion</span>
                          <span className="block text-sm font-black text-slate-950 dark:text-white mt-1">
                            {lastLoginAt ? new Date(lastLoginAt).toLocaleString("es-CO") : "No registrado en este dispositivo"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="min-h-11 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black flex items-center justify-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          {t("logout", "Cerrar Sesion")}
                        </button>
                      </div>
                    )}

                    {accountSection !== "session" && (
                      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button type="submit" className="min-h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm">
                          <Check className="w-4 h-4" /> Guardar cambios
                        </button>
                      </div>
                    )}
                  </form>

                  <div className="hidden p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
                        <div className="flex flex-col items-center text-center gap-3">
                          <img src={profileAvatar || currentUser.avatar} alt={profileName || currentUser.name} className="w-28 h-28 rounded-full object-cover border-4 border-emerald-500 shadow-sm" />
                          <div>
                            <p className="text-sm font-black text-slate-950 dark:text-white">{profileName || currentUser.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">POS: #{currentRanking?.position || "-"} · {formatHeaderPoints(currentUser.points)}</p>
                            <span className="mt-2 inline-flex px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">{getHeaderUserBadge(currentUser)}</span>
                          </div>
                          <label htmlFor="account_profile_image_upload" className="w-full min-h-10 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" /> Cargar imagen
                          </label>
                          <input id="account_profile_image_upload" type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2">Avatares disponibles</p>
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                              {AVATARS.slice(0, 10).map((avatar, idx) => (
                                <button key={idx} type="button" onClick={() => setProfileAvatar(avatar)} className={`rounded-full border-2 p-0.5 transition-all ${profileAvatar === avatar ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"}`} aria-label={`Usar avatar ${idx + 1}`}>
                                  <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full aspect-square rounded-full object-cover" />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Nombre de usuario</label>
                              <input type="text" className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Pais</label>
                              <select className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100" value={normalizeCountryName(profileCountry)} onChange={(e) => setProfileCountry(e.target.value)} required>
                                {COUNTRY_OPTIONS.map((country) => <option key={country.name} value={country.name}>{getCountryOptionLabel(country)}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Idioma</label>
                              <select className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100" value={lang} onChange={(e) => setLang(e.target.value as any)}>
                                <option value="es">ES - Espanol</option><option value="en">EN - English</option><option value="pt">PT - Portugues</option><option value="fr">FR - Francais</option><option value="it">IT - Italiano</option><option value="de">DE - Deutsch</option><option value="ar">AR</option><option value="ja">JA</option><option value="ko">KO</option><option value="ru">RU</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Nueva contrasena</label>
                              <input type="password" className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100" placeholder="Dejar vacio para conservar actual" value={profileNewPass} onChange={(e) => setProfileNewPass(e.target.value)} />
                            </div>
                          </div>

                          <div>
                            <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">Tema</span>
                            <div className="grid grid-cols-3 gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
                              {[{ value: "light", label: "Claro", icon: Sun }, { value: "dark", label: "Oscuro", icon: Moon }, { value: "system", label: "Sistema", icon: Laptop }].map((item) => {
                                const Icon = item.icon;
                                const selected = theme === item.value;
                                return <button key={item.value} type="button" onClick={() => setTheme(item.value as "light" | "dark" | "system")} className={`min-h-11 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-colors ${selected ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"}`}><Icon className="w-4 h-4" />{item.label}</button>;
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <label className="min-h-12 flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 cursor-pointer">
                              <input type="checkbox" checked={notificationSoundEnabled} onChange={(e) => setNotificationSoundEnabled(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 border-slate-300" />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sonido de notificaciones</span>
                            </label>
                            <label className="min-h-12 flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 cursor-pointer">
                              <input type="checkbox" checked={profileEmailSubscribed} onChange={(e) => setProfileEmailSubscribed(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 border-slate-300" />
                              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Notificaciones por correo</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button type="submit" className="min-h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-sm">
                          <Check className="w-4 h-4" /> Guardar perfil
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="hidden p-4 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900 flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-rose-900 dark:text-rose-100">Sesion de usuario</h3>
                      <p className="text-xs text-rose-700 dark:text-rose-200 mt-1">Sal de tu cuenta cuando termines de usar la plataforma.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="min-h-11 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t("logout", "Cerrar Sesion")}
                    </button>
                  </div>
                </div>
              )}

              {/* 1. MÓDULO USER: DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <BarChart3 className="text-emerald-600 w-5 h-5" /> {t("db_title", "Mi Resumen & Evolución de Puntos")}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">{t("db_desc", "Sigue tu progreso, aciertos y estadísticas particulares")}</p>
                  </div>

                  {(isGlobalLoading || isUserLoading) && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Cargando resumen">
                      {[0, 1, 2, 3].map((item) => (
                        <div key={item} className="h-24 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 animate-pulse">
                          <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-800" />
                          <div className="mt-4 h-7 w-14 rounded bg-slate-200 dark:bg-slate-800" />
                          <div className="mt-3 h-2 w-24 rounded bg-slate-100 dark:bg-slate-800/70" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="md:hidden bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-sm p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-black text-emerald-300">Tu estado</span>
                        <div className="mt-1 flex items-end gap-2">
                          <span className="text-3xl font-black leading-none">{currentUser.points}</span>
                          <span className="text-xs text-slate-300 mb-1">pts</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab("ranking")}
                        className="min-h-12 px-4 rounded-xl bg-white/10 border border-white/10 text-left"
                      >
                        <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Posición</span>
                        <span className="text-xl font-black text-amber-300">#{currentRanking?.position || "-"}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveTab("predictions")}
                        className="min-h-12 rounded-xl bg-emerald-500 text-emerald-950 font-black shadow-sm"
                      >
                        Pronosticar
                      </button>
                      <button
                        type="button"
                        onClick={() => setOnboardingOpen(true)}
                        className="min-h-12 rounded-xl bg-white/10 border border-white/10 text-white font-black"
                      >
                        Cómo jugar
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("ranking")}
                        className="min-h-12 rounded-xl bg-white/10 border border-white/10 text-white font-black"
                      >
                        Ver ranking
                      </button>
                    </div>

                  </div>

                  {(() => {
                    const pendingMatches = matches
                      .filter((m) => m.status === "pending")
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const fallbackMatches = [...matches].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    const displayMatches = pendingMatches.length > 0 ? pendingMatches.slice(0, 3) : fallbackMatches.slice(0, 3);

                    if (displayMatches.length === 0) return null;

                    return (
                      <button
                        type="button"
                        onClick={() => setActiveTab("predictions")}
                        className="md:hidden w-full bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-emerald-800/40 space-y-3 text-left"
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            {ui("next_3_matches")}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold uppercase tracking-wider">
                            {ui("live_ticker")}
                          </span>
                        </span>

                        <span className="block space-y-2 divide-y divide-slate-800/60">
                          {displayMatches.map((m, index) => {
                            const timeLabel = getMatchTimeRemainingLabel(m);
                            const isPending = m.status === "pending";

                            return (
                              <span key={m.id} className={`block space-y-1.5 ${index !== 0 ? "pt-2" : ""}`}>
                                <span className="flex items-center justify-between gap-2 text-[9px]">
                                  <span className="shrink-0 bg-slate-800/80 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase text-emerald-300 border border-slate-700">
                                    {getStageLabel(m.stage)}
                                  </span>
                                  <span className="truncate text-slate-400 font-mono" title={m.stadium}>
                                    {m.stadium}
                                  </span>
                                </span>

                                <span className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800">
                                  <span className="flex items-center gap-1.5 min-w-0">
                                    <span className="text-sm shrink-0 select-none">{getTeamFlag(m.local)}</span>
                                    <span className="truncate text-xs font-bold text-slate-100">{getShortTeamName(m.local, lang)}</span>
                                  </span>
                                  <span className="text-emerald-400 text-[10px] font-bold">
                                    {m.status === "finished" ? `${m.localScore} - ${m.visitorScore}` : "vs"}
                                  </span>
                                  <span className="flex items-center justify-end gap-1.5 min-w-0">
                                    <span className="truncate text-xs font-bold text-slate-100">{getShortTeamName(m.visitor, lang)}</span>
                                    <span className="text-sm shrink-0 select-none">{getTeamFlag(m.visitor)}</span>
                                  </span>
                                </span>

                                <span className="flex items-center justify-between gap-2 text-[9px]">
                                  <span className="truncate text-emerald-300 font-mono">
                                    {formatMatchDate(m.date).replace(` (${ui("bogota")})`, "")}
                                  </span>
                                  <span className={`shrink-0 px-1.5 py-0.5 rounded-full font-bold uppercase text-[8px] ${
                                    isPending
                                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                                      : "bg-slate-800 text-slate-400 border border-slate-700"
                                  }`}>
                                    {timeLabel}
                                  </span>
                                </span>
                              </span>
                            );
                          })}
                        </span>
                      </button>
                    );
                  })()}

                  {publicPrizePool && (
                    <div className="bg-slate-950 text-white rounded-xl border border-slate-800 shadow-sm overflow-hidden">
                      <div className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-amber-300">
                            <Trophy className="w-3.5 h-3.5" />
                            Premio acumulado
                          </span>
                          <span className="inline-flex w-fit rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-amber-200">
                            Premios para usuarios pagos
                          </span>
                          <div className="flex items-end gap-3 flex-wrap">
                            <span className="text-3xl md:text-4xl font-black tracking-tight text-white">
                              {formatCop(publicPrizePool.prizePool)}
                            </span>
                            <span className="mb-1 text-[11px] font-semibold text-slate-300">
                              {Math.round(publicPrizePool.prizePoolRate * 1000) / 10}% de la bolsa de participantes pagos
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-300">
                            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">
                              {publicPrizePool.paidParticipants} pagos confirmados
                            </span>
                            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">
                              Inscripcion {formatCop(publicPrizePool.entryFeeCop)}
                            </span>
                            <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">
                              Recaudo bruto {formatCop(publicPrizePool.grossPool)}
                            </span>
                          </div>
                        </div>

                        <div className="min-w-full lg:min-w-[390px]">
                          {renderPrizePodium(publicPrizePool.payouts, publicPrizePool.payoutRates, "dark")}
                        </div>
                      </div>
                      {!hasRealPrizeAccess && currentUser.companyId && (
                        <div className="px-4 md:px-5 pb-4 md:pb-5 -mt-1">
                          <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-[11px] font-semibold text-amber-100">
                            Este acumulado corresponde a la Polla REAL y solo aplica para usuarios con pago confirmado. Tu modalidad de empresa conserva sus propios premios o beneficios.
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Top Stats Cards metrics panel */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">{t("db_my_points", "MIS PUNTOS TOTALES")}</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{currentUser.points}</span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">{t("db_my_points_sub", "🏅 Clasificación actual")}</span>
                    </div>

                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block uppercase">{t("db_exact", "MARCADOR EXACTO (25/35 pts)")}</span>
                      <span className="text-2xl font-black text-emerald-950 dark:text-emerald-200 mt-1 block">{currentUser.exactCount} {t("db_exact_hits", "aciertos")}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{t("db_exact_sub", "Aciertos exactos oficiales")}</span>
                    </div>

                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold block uppercase">{t("db_draw", "RESULTADO ACERTADO (10 pts)")}</span>
                      <span className="text-2xl font-black text-indigo-950 dark:text-indigo-200 mt-1 block">{currentUser.drawCount} {t("db_draw_hits", "aciertos")}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{t("db_draw_sub", "Resultados correctos no exactos")}</span>
                    </div>

                    <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900 rounded-xl">
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block uppercase">{t("db_estimated", "PARTIDOS ESTIMADOS")}</span>
                      <span className="text-2xl font-black text-amber-950 dark:text-amber-200 mt-1 block">{currentUser.predictCount}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">{t("db_estimated_sub", "Pronósticos realizados")}</span>
                    </div>
                  </div>

                  {/* Dual Grid: Sparkline history chart and Announcement alerts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Points evolution timeline SVG */}
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase flex items-center justify-between">
                          <span>{t("db_evolution", "Gráfico de Evolución Temporal")}</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 normal-case">{t("db_evolution_cron", "Cronológico")}</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{t("db_evolution_desc", "Muestra la acumulación de puntos tras finalizar partidos")}</p>
                      </div>

                      <div className="my-3 py-2 bg-slate-50/40 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                        {currentUser.historyPoints && currentUser.historyPoints.length >= 2 ? (
                          renderSparkline(currentUser.historyPoints)
                        ) : (
                          <span className="text-xs text-slate-400 py-6 text-center">{t("db_no_predictions", "Inicia a registrar pronósticos para registrar tu avance temporal.")}</span>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-850 p-2 rounded flex justify-between font-mono">
                        <span>{t("db_phase_init", "Fase Inicial")}</span>
                        <span>{t("db_phase_end", "Fase Finalizada")}</span>
                      </div>
                    </div>

                    {/* Announcement Bulletin Board */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase flex items-center justify-between border-b dark:border-slate-800 pb-2">
                        <span>{t("db_admin_announcements", "Avisos del Administrador 📢")}</span>
                        <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">{t("db_admin_official", "Boletín Oficial")}</span>
                      </h3>
                      <div className="space-y-3 mt-3 max-h-48 overflow-y-auto pr-1">
                        {announcements.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">{t("db_no_announcements", "No hay comunicados oficiales activos en este momento.")}</p>
                        ) : (
                          announcements.map((a) => (
                            <div key={a.id} className={`p-3 rounded-lg border ${a.urgent ? "bg-rose-50/70 border-rose-200 text-rose-950 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-200" : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}>
                              <h4 className="font-bold text-xs flex items-center gap-1">
                                {a.urgent && <span className="bg-rose-600 text-white text-[9px] px-1.5 py-0.2 rounded uppercase">Urgente</span>}
                                {a.companyId && <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded uppercase">Empresa</span>}
                                {a.title}
                              </h4>
                              <p className="text-[11px] mt-1 whitespace-pre-wrap">{a.content}</p>
                              <span className="block text-[9px] text-slate-400 mt-1.5 font-mono">Publicado: {new Date(a.date).toLocaleDateString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile & Password form settings embedded directly in dashboard */}
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase border-b dark:border-slate-800 pb-2 mb-3">{t("db_account_pref", "Mi Cuenta & Preferencias")}</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
                        <div className="flex flex-col items-center text-center gap-3">
                          <img src={profileAvatar || currentUser.avatar} alt={profileName || currentUser.name} className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500 shadow-sm" />
                          <div>
                            <p className="text-sm font-black text-slate-950 dark:text-white">{profileName || currentUser.name}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">{getCountryFlag(profileCountry)} {normalizeCountryName(profileCountry)} · #{currentRanking?.position || "-"}</p>
                          </div>
                          <label htmlFor="profile_image_upload" className="w-full min-h-10 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer">
                            <Upload className="w-4 h-4" />
                            Cargar imagen
                          </label>
                          <input id="profile_image_upload" type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
                        </div>

                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-2">Avatares disponibles</p>
                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                            {AVATARS.slice(0, 10).map((avatar, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setProfileAvatar(avatar)}
                                className={`rounded-full border-2 p-0.5 transition-all ${profileAvatar === avatar ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"}`}
                                aria-label={`Usar avatar ${idx + 1}`}
                              >
                                <img src={avatar} alt={`Avatar ${idx + 1}`} className="w-full aspect-square rounded-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("db_label_name", "Nombre para clasificación")}</label>
                          <input
                            type="text"
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">País</label>
                          <select
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                            value={normalizeCountryName(profileCountry)}
                            onChange={(e) => setProfileCountry(e.target.value)}
                            required
                          >
                            {COUNTRY_OPTIONS.map((country) => (
                              <option key={country.name} value={country.name}>{getCountryOptionLabel(country)}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("db_label_pass", "Nueva Contraseña (Dejar vacío para conservar actual)")}</label>
                          <input
                            type="password"
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                            placeholder={t("db_label_pass_placeholder", "Mínimo 4 caracteres")}
                            value={profileNewPass}
                            onChange={(e) => setProfileNewPass(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Idioma</label>
                          <select
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                            value={lang}
                            onChange={(e) => setLang(e.target.value as any)}
                          >
                            <option value="es">ES - Espanol</option>
                            <option value="en">EN - English</option>
                            <option value="pt">PT - Portugues</option>
                            <option value="fr">FR - Francais</option>
                            <option value="it">IT - Italiano</option>
                            <option value="de">DE - Deutsch</option>
                            <option value="ar">AR</option>
                            <option value="ja">JA</option>
                            <option value="ko">KO</option>
                            <option value="ru">RU</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <span className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-2">{t("change_theme", "Tema")}</span>
                        <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1">
                          {[
                            { value: "light", label: t("theme_light", "Claro"), icon: Sun },
                            { value: "dark", label: t("theme_dark", "Oscuro"), icon: Moon },
                            { value: "system", label: t("theme_system", "Sistema"), icon: Laptop }
                          ].map((item) => {
                            const Icon = item.icon;
                            const selected = theme === item.value;
                            return (
                              <button
                                key={item.value}
                                type="button"
                                onClick={() => setTheme(item.value as "light" | "dark" | "system")}
                                className={`min-h-11 rounded-lg text-xs font-black flex items-center justify-center gap-2 transition-colors ${selected ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"}`}
                              >
                                <Icon className="w-4 h-4" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 py-1">
                        <input
                          type="checkbox"
                          id="notif_sound"
                          checked={notificationSoundEnabled}
                          onChange={(e) => setNotificationSoundEnabled(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300"
                        />
                        <label htmlFor="notif_sound" className="text-xs text-slate-600 dark:text-slate-400">Activar sonido de notificaciones</label>
                      </div>

                      <div className="flex items-center gap-3 py-1">
                        <input
                          type="checkbox"
                          id="notif_email"
                          checked={profileEmailSubscribed}
                          onChange={(e) => setProfileEmailSubscribed(e.target.checked)}
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300"
                        />
                        <label htmlFor="notif_email" className="text-xs text-slate-600 dark:text-slate-400">{t("db_email_notif", "Deseo suscribirme y autorizo envío de notificaciones de mi ranking por correo electrónico")}</label>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button type="submit" className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Check className="w-3.5 h-3.5" /> {t("db_btn_save", "Guardar Perfil")}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* 2. MÓDULO USER: CALENDAR & FORECASTS TAB */}
              {activeTab === "participate" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <CreditCard className="text-emerald-600 w-5 h-5" /> Participar en Polla
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Activa tu inscripción oficial para competir por la bolsa de premios.</p>
                  </div>

                  {isFreeOrCompanyUser && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-black">Modalidad con premios en dinero</span>
                              <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-1">Participar en Polla REAL</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl">Participa por premios en efectivo y compite contra otros participantes de la comunidad.</p>
                            </div>
                            <div className="flex flex-col items-start sm:items-end gap-2">
                              <span className="px-2.5 py-1 rounded-full bg-slate-950 text-amber-300 dark:bg-amber-300 dark:text-slate-950 text-[10px] font-black uppercase tracking-wider">
                                Premios para usuarios pagos
                              </span>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${hasRealPrizeAccess ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}>
                                {hasRealPrizeAccess ? "Polla REAL activa" : "Requiere pago"}
                              </span>
                            </div>
                          </div>

                          {!hasRealPrizeAccess && (
                            <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-200">
                              Los valores de dinero de esta tarjeta aplican unicamente a usuarios con inscripcion pagada en Polla REAL.
                            </div>
                          )}

                          {renderPrizePodium(
                            publicPrizePool?.payouts || { first: 0, second: 0, third: 0 },
                            publicPrizePool?.payoutRates
                          )}

                          {hasRealPrizeAccess ? (
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-sm text-emerald-800 dark:text-emerald-300 font-semibold">
                              Tu inscripción a Polla REAL está confirmada. Participas por premios en dinero.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-xs text-slate-500 dark:text-slate-400">El acceso a premios monetarios requiere inscripción en la modalidad Polla REAL.</p>
                              <button
                                onClick={() => handleStartPayment(true)}
                                disabled={paymentBusy}
                                className={`w-full sm:w-auto min-h-12 px-5 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow ${paymentBusy ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                              >
                                <CreditCard className="w-4 h-4" />
                                {paymentBusy ? `Conectando con ${paymentProvider === "wompi" ? "Wompi" : "Stripe"}...` : "Pagar para acceder a premios en dinero"}
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-black">INSCRIPCIÓN OFICIAL</span>
                              <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-1">$0 COP</h3>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Estás participando gratuitamente con los compañeros de tu empresa.</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase">Modalidad gratuita</span>
                          </div>

                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            En esta modalidad podrás realizar tus pronósticos y competir dentro del ranking corporativo, pero no participarás en los premios en efectivo de la Polla REAL.
                          </p>

                          <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500" /> Premios y beneficios de tu modalidad
                            </h3>
                            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                              {renderFormattedText(currentUser.companyId ? companyPrizePolicy : torneo?.prizesText, currentUser.companyId ? "Premiaciones por definir por el administrador de la empresa." : "Premiaciones por definir en el Libro de Premiaciones.")}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-950 text-white rounded-xl p-5 border border-slate-800 shadow-sm space-y-4">
                        <h3 className="text-sm font-black flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          Bolsa Polla REAL
                        </h3>
                        <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                          Premios para usuarios pagos
                        </span>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between border-b border-white/10 pb-2"><span>🏆 Total Recaudado</span><b>{formatCop(publicPrizePool?.grossPool || 0)}</b></div>
                          <div className="flex justify-between border-b border-white/10 pb-2 text-slate-400"><span>👨‍💼 Administración Polla <span className="line-through text-slate-500">(-10%)</span></span><b>{formatCop(publicPrizePool?.ownerGrossProfit || 0)}</b></div>
                          <div className="flex justify-between border-b border-white/10 pb-2 text-slate-400"><span>🏦 Comisión bancaria <span className="line-through text-slate-500">(-3.5%)</span></span><b>{formatCop(publicPrizePool?.bankCommission || 0)}</b></div>
                          <div className="flex justify-between border-b border-white/10 pb-2"><span>👥 Participantes de Pago</span><b>{publicPrizePool?.paidParticipants || 0}</b></div>
                          <div className="flex justify-between"><span>💰 Premio acumulado (100%)</span><b className="text-emerald-300">{formatCop(publicPrizePool?.prizePool || 0)}</b></div>
                          {(publicPrizePool?.prizeSeed || 0) > 0 && <div className="flex justify-between text-emerald-200"><span>Aporte inicial administrador</span><b>+{formatCop(publicPrizePool?.prizeSeed || 0)}</b></div>}
                        </div>
                        <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                          <h4 className="font-black text-amber-300">Distribución de Premios</h4>
                          <div className="flex justify-between gap-3"><span>🥇 1er Puesto</span><b className="min-w-0 max-w-[58%] text-right [overflow-wrap:anywhere]">{formatCop(publicPrizePool?.payouts.first || 0)}</b></div>
                          <div className="flex justify-between gap-3"><span>🥈 2do Puesto</span><b className="min-w-0 max-w-[58%] text-right [overflow-wrap:anywhere]">{formatCop(publicPrizePool?.payouts.second || 0)}</b></div>
                          <div className="flex justify-between gap-3"><span>🥉 3er Puesto</span><b className="min-w-0 max-w-[58%] text-right [overflow-wrap:anywhere]">{formatCop(publicPrizePool?.payouts.third || 0)}</b></div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">El 100% de lo recaudado por usuarios pagos se destina a premios. Esta bolsa aplica solo para participantes inscritos en Polla REAL.</p>
                      </div>
                    </div>
                  )}

                  {!isFreeOrCompanyUser && <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-black">Inscripción oficial</span>
                          <h3 className="text-2xl font-black text-slate-950 dark:text-white mt-1">{formatEntryFeeLabel(publicPrizePool?.entryFeeCop)}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pago único para entrar a la Polla Mundialista 2026.</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${appMode === "FREE" || currentUser.paymentStatus === "paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}>
                          {appMode === "FREE" ? "Acceso gratuito" : currentUser.paymentStatus === "paid" ? "Pago confirmado" : "Pago pendiente"}
                        </span>
                      </div>

                      {currentUser.role === "standard" && currentUser.companyId && companyPrizePolicy ? (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                          <h3 className="text-sm font-black text-amber-900 dark:text-amber-100 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Premios de tu empresa
                          </h3>
                          <div className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed space-y-1">
                            {renderFormattedText(companyPrizePolicy, "Premiaciones por definir por el administrador de la empresa.")}
                          </div>
                        </div>
                      ) : (
                        renderPrizePodium(
                          publicPrizePool?.payouts || { first: 0, second: 0, third: 0 },
                          publicPrizePool?.payoutRates
                        )
                      )}

                      {appMode === "FREE" || currentUser.paymentStatus === "paid" ? (
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-sm text-emerald-800 dark:text-emerald-300 font-semibold">
                          {appMode === "FREE" ? "La plataforma está en modo gratuito. Ya puedes registrar pronósticos." : "Tu inscripción ya está confirmada. Ya puedes registrar pronósticos y competir por premios."}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartPayment(false)}
                          disabled={paymentBusy}
                          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow ${paymentBusy ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                        >
                          <CreditCard className="w-4 h-4" />
                          {paymentBusy ? `Conectando con ${paymentProvider === "wompi" ? "Wompi" : "Stripe"}...` : `Pagar inscripción con ${paymentProvider === "wompi" ? "Wompi" : "Stripe"}`}
                        </button>
                      )}
                    </div>

                    <div className="bg-slate-950 text-white rounded-xl p-5 border border-slate-800 shadow-sm space-y-4">
                      <h3 className="text-sm font-black flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Resumen del Premio
                      </h3>
                      <span className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                        Premios para usuarios pagos
                      </span>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between border-b border-white/10 pb-2"><span>🏆 Total Recaudado</span><b>{formatCop(publicPrizePool?.grossPool || 0)}</b></div>
                        <div className="flex justify-between border-b border-white/10 pb-2 text-slate-400"><span>👨‍💼 Administración Polla <span className="line-through text-slate-500">(-10%)</span></span><b>{formatCop(publicPrizePool?.ownerGrossProfit || 0)}</b></div>
                        <div className="flex justify-between border-b border-white/10 pb-2 text-slate-400"><span>🏦 Comisión bancaria <span className="line-through text-slate-500">(-3.5%)</span></span><b>{formatCop(publicPrizePool?.bankCommission || 0)}</b></div>
                        <div className="flex justify-between border-b border-white/10 pb-2"><span>👥 Participantes de Pago</span><b>{publicPrizePool?.paidParticipants || 0}</b></div>
                        <div className="flex justify-between"><span>💰 Premio acumulado (100%)</span><b className="text-emerald-300">{formatCop(publicPrizePool?.prizePool || 0)}</b></div>
                        {(publicPrizePool?.prizeSeed || 0) > 0 && <div className="flex justify-between text-emerald-200"><span>Aporte inicial administrador</span><b>+{formatCop(publicPrizePool?.prizeSeed || 0)}</b></div>}
                      </div>
                      <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                        <h4 className="font-black text-amber-300">Distribución de Premios</h4>
                        <div className="flex justify-between gap-3"><span>🥇 1er Puesto</span><b className="min-w-0 max-w-[58%] text-right [overflow-wrap:anywhere]">{formatCop(publicPrizePool?.payouts.first || 0)}</b></div>
                        <div className="flex justify-between gap-3"><span>🥈 2do Puesto</span><b className="min-w-0 max-w-[58%] text-right [overflow-wrap:anywhere]">{formatCop(publicPrizePool?.payouts.second || 0)}</b></div>
                        <div className="flex justify-between gap-3"><span>🥉 3er Puesto</span><b className="min-w-0 max-w-[58%] text-right [overflow-wrap:anywhere]">{formatCop(publicPrizePool?.payouts.third || 0)}</b></div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">La bolsa recibe el 100% de cada inscripción pagada y se actualiza con los pagos confirmados.</p>
                    </div>
                  </div>}
                </div>
              )}

              {activeTab === "predictions" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-emerald-600 w-5 h-5" id="user_predictions_calendar_icon" /> {t("tab_predictions", "Calendario & Pronósticos")}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {t("pred_desc", "Introduce marcadores. Se bloquea el registro 5 minutos antes del partido. UTC-5 Bogotá Base.")}
                      </p>
                    </div>

                    {/* Stats summary of predictions */}
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 flex gap-4">
                      <span>{t("pred_registered", "Registrados")}: <b>{registeredPredictionsCount}</b></span>
                      <span>{t("pred_pending", "Pendientes")}: <b>{pendingPredictionsCount}</b></span>
                    </div>
                  </div>

                  {!canSubmitPredictions && (
                    <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200 text-xs font-semibold flex items-center justify-between gap-3 flex-wrap">
                      <span>Para guardar, actualizar o limpiar pronósticos debes confirmar tu pago de inscripción.</span>
                      <button
                        onClick={() => setActiveTab("participate")}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black"
                      >
                        Ir a pagar
                      </button>
                    </div>
                  )}

                  {/* Mode Selector for Predictions */}
                  <div className="flex gap-2 border-b border-slate-105 dark:border-slate-800 pb-2 overflow-x-auto snap-x">
                    <button
                      onClick={() => setPredictionsMode("matches")}
                      className={`min-h-12 shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        predictionsMode === "matches"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {t("mode_individual_matches", "Partidos Individuales")}
                    </button>
                    <button
                      onClick={() => setPredictionsMode("knockout")}
                      className={`min-h-12 shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        predictionsMode === "knockout"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      Eliminación directa
                    </button>
                    <button
                      onClick={() => setPredictionsMode("favorites")}
                      className={`min-h-12 shrink-0 snap-start px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        predictionsMode === "favorites"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      {t("mode_tournament_favorites", "Favoritos del Torneo")}
                    </button>
                  </div>

                  {predictionsMode === "favorites" ? (
                    <TournamentPredictionsView
                      lang={lang as any}
                      currentUser={currentUser}
                      tournamentPredictions={tournamentPredictions}
                      tournamentOutcomes={tournamentOutcomes}
                      canSave={canSaveTournamentFavorites}
                      lockTime={temporaryFavoritesAccessDeadline}
                      temporaryAccessOpen={temporaryFavoritesAccessOpen}
                      onSave={handleSaveTournamentPredictions}
                    />
                  ) : predictionsMode === "knockout" ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          Fixture de eliminación directa
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Cruces oficiales de partidos 73 al 104 según el documento base. Se muestran aparte porque dependen de posiciones de grupo y mejores terceros.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {knockoutFixtures.map((fixture) => (
                          <div key={fixture.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Partido #{fixture.id} • {fixture.stage}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono text-right">{fixture.dateLabel}</span>
                            </div>

                            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs">
                              <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-100 text-right">
                                {fixture.localSlot}
                              </div>
                              <span className="text-slate-400 font-black">vs</span>
                              <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800 font-semibold text-slate-800 dark:text-slate-100">
                                {fixture.visitorSlot}
                              </div>
                            </div>

                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{fixture.stadium}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Filters bar */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-xs">
                        <div className="flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setMatchFiltersOpen((open) => !open)}
                            className={`min-h-11 px-3 rounded-xl text-xs font-black flex items-center gap-2 transition-colors ${
                              matchFiltersOpen || hasMatchFilters
                                ? "bg-emerald-600 text-white"
                                : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                            }`}
                            aria-expanded={matchFiltersOpen}
                          >
                            {matchFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            Filtros
                            {hasMatchFilters && <span className="ml-1 rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">activos</span>}
                          </button>
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {filteredMatches.length} de {matches.length} partidos
                          </span>
                        </div>

                        {matchFiltersOpen && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[minmax(150px,190px)_minmax(150px,210px)_minmax(150px,210px)_1fr] gap-3">
                          <label className="block">
                            <span className="block font-bold text-slate-600 dark:text-slate-300 mb-1">{t("stage", "Etapa")}</span>
                            <select
                              className="w-full min-h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              value={selectedStage}
                              onChange={(e) => setSelectedStage(e.target.value)}
                            >
                              {STAGES.map((s) => <option key={s} value={s}>{getStageLabel(s)}</option>)}
                            </select>
                          </label>

                          <label className="block">
                            <span className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Fase / fecha</span>
                            <select
                              className="w-full min-h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              value={selectedMatchDateKey}
                              onChange={(e) => setSelectedMatchDateKey(e.target.value)}
                            >
                              <option value="Todas">Todas las fases y fechas</option>
                              {matchDateOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                  {option.label} - {option.detail}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className="block">
                            <span className="block font-bold text-slate-600 dark:text-slate-300 mb-1">{t("status", "Estado")}</span>
                            <select
                              className="w-full min-h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                              value={matchStatusFilter}
                              onChange={(e) => setMatchStatusFilter(e.target.value as any)}
                            >
                              <option value="all">{t("pred_status_all", "Ver Todos")}</option>
                              <option value="pending">{t("pred_status_open", "Abiertos")}</option>
                              <option value="finished">{t("pred_status_finished", "Finalizados")}</option>
                            </select>
                          </label>

                          <label className="block">
                            <span className="block font-bold text-slate-600 dark:text-slate-300 mb-1">Buscar</span>
                            <input
                              type="search"
                              autoComplete="off"
                              placeholder={t("pred_search_placeholder", "Equipo, estadio o etapa...")}
                              className="w-full min-h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              value={teamSearch}
                              onChange={(e) => setTeamSearch(e.target.value)}
                            />
                          </label>
                        </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {matchFiltersOpen ? "Ajusta la lista con etapa, fase/fecha, estado o busqueda." : hasMatchFilters ? "Hay filtros activos aplicados a la lista." : "Pulsa Filtros para acotar los partidos."}
                          </span>
                          {hasMatchFilters && (
                            <button
                              type="button"
                              onClick={clearMatchFilters}
                              className="min-h-10 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-black"
                            >
                              Limpiar filtros
                            </button>
                          )}
                        </div>
                      </div>

                  {/* Core Matches Prediction Loop */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl md:max-h-[850px] lg:max-h-[950px] xl:max-h-[1050px] overflow-y-auto bg-white dark:bg-slate-900 shadow-sm">
                    {filteredMatches.length === 0 ? (
                      <p className="p-8 text-center text-xs text-slate-400">{t("pred_no_results", "No se encontraron partidos programados con los filtros indicados.")}</p>
                    ) : (
                      filteredMatches.map((m) => {
                        const isLocked = isMatchPredictionLocked(m);
                        const hasEnded = m.status === "finished";
                        const isLive = m.status === "in_progress";
                        
                        const pred = predictions.find((p) => p.matchId === m.id);
                        
                        // Local score values mapping from state
                        const localVal = predScores[m.id]?.local ?? "";
                        const visVal = predScores[m.id]?.visitor ?? "";
                        const resultPick = getPredictionResultPick(localVal, visVal);
                        const isExpanded = expandedMatchId === m.id;

                        return (
                          <div
                            key={m.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setExpandedMatchId(isExpanded ? null : m.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") setExpandedMatchId(isExpanded ? null : m.id);
                            }}
                            className={`p-4 transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/30 flex flex-col md:flex-row md:flex-wrap items-center justify-between gap-4 ${isExpanded ? "bg-emerald-50/40 dark:bg-emerald-950/10 ring-1 ring-emerald-200 dark:ring-emerald-900" : ""} ${hasEnded ? "bg-slate-50/20 dark:bg-slate-850/10" : ""}`}
                          >
                            
                            {/* Match Header stage & details */}
                            <div className="w-full md:w-1/3 space-y-1">
                              <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {ui("match_number", { id: m.id })} • {getStageLabel(m.stage)}
                              </span>
                              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatMatchDate(m.date)}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{m.stadium}</p>
                            </div>

                            {/* Teams & Prediction Scoring Board Inputs */}
                            <div className="w-full md:w-2/5 flex flex-col items-center justify-center gap-3">
                              <div className="flex items-center justify-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
                                {(["1", "X", "2"] as const).map((pick) => (
                                  <span
                                    key={pick}
                                    className={`w-9 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                                      resultPick === pick
                                        ? "bg-emerald-600 text-white shadow"
                                        : "text-slate-500 dark:text-slate-400"
                                    }`}
                                    title={pick === "1" ? `Gana ${getTeamDisplayName(m.local, lang)}` : pick === "X" ? "Empate" : `Gana ${getTeamDisplayName(m.visitor, lang)}`}
                                  >
                                    {pick}
                                  </span>
                                ))}
                              </div>
                              <div className="w-full min-w-0">
                              {isExpanded && (
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <span className="min-w-0 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-center text-[10px] leading-tight font-bold text-slate-700 dark:text-slate-200 break-words">
                                    {getTeamDisplayName(m.local, lang)}
                                  </span>
                                  <span className="min-w-0 rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-1 text-center text-[10px] leading-tight font-bold text-slate-700 dark:text-slate-200 break-words">
                                    {getTeamDisplayName(m.visitor, lang)}
                                  </span>
                                </div>
                              )}
                              <div className="w-full min-w-0 flex items-center justify-center gap-1 sm:gap-3">
                              {/* HOME TEAM */}
                              <div className="w-12 sm:w-16 shrink-0 flex flex-col items-end text-right font-black text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 tabular-nums" title={getTeamDisplayName(m.local, lang)}>
                                <span className="whitespace-nowrap">{getTeamShortCode(m.local)} <span className="ml-0.5 sm:ml-1 text-sm select-none">{getTeamFlag(m.local)}</span></span>
                              </div>
                              
                              {/* INPUT SCORES CONTAINER */}
                              {isLocked ? (
                                /* LOCKED STATE OR OFFICIAL RESULT VIEW */
                                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                  {pred ? (
                                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400" title={t("pred_your_prediction", "Tu pronóstico")}>
                                      {pred.localScore} - {pred.visitorScore}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">{t("pred_none", "Sin pronóstico")}</span>
                                  )}
                                  
                                  {/* Official match scores display */}
                                  {hasEnded ? (
                                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-200/70 dark:bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-600">
                                      {t("pred_real", "Real:")} {m.localScore} - {m.visitorScore}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] bg-amber-500/10 text-amber-600 border border-amber-500/20 px-1 rounded uppercase font-bold">
                                      {ui("locked")}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                /* INPUT ACTIVE STATE VIEW */
                                <div className="min-w-0 flex items-center gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                                  {isExpanded && (
                                    <div className="flex flex-col gap-1">
                                      <button type="button" onClick={() => updatePredictionScore(m.id, "local", 1)} disabled={!canSubmitPredictions} className="w-8 sm:w-10 h-9 rounded-xl bg-emerald-600 text-white font-black disabled:bg-slate-300">+</button>
                                      <button type="button" onClick={() => updatePredictionScore(m.id, "local", -1)} disabled={!canSubmitPredictions} className="w-8 sm:w-10 h-9 rounded-xl bg-slate-100 text-slate-700 font-black border disabled:text-slate-300">-</button>
                                    </div>
                                  )}
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    min="0"
                                    placeholder="?"
                                    disabled={!canSubmitPredictions}
                                    className={`w-10 sm:w-12 h-12 text-center border border-slate-200 dark:border-slate-705 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-base md:text-xs font-bold font-mono ${canSubmitPredictions ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}
                                    value={localVal}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                                      setPredictionScoreValue(m.id, "local", val as number | "");
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <span className="text-slate-400 font-bold">-</span>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    min="0"
                                    placeholder="?"
                                    disabled={!canSubmitPredictions}
                                    className={`w-10 sm:w-12 h-12 text-center border border-slate-200 dark:border-slate-705 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-base md:text-xs font-bold font-mono ${canSubmitPredictions ? "bg-white dark:bg-slate-800 text-slate-800 dark:text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"}`}
                                    value={visVal}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                                      setPredictionScoreValue(m.id, "visitor", val as number | "");
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  {isExpanded && (
                                    <div className="flex flex-col gap-1">
                                      <button type="button" onClick={() => updatePredictionScore(m.id, "visitor", 1)} disabled={!canSubmitPredictions} className="w-8 sm:w-10 h-9 rounded-xl bg-emerald-600 text-white font-black disabled:bg-slate-300">+</button>
                                      <button type="button" onClick={() => updatePredictionScore(m.id, "visitor", -1)} disabled={!canSubmitPredictions} className="w-8 sm:w-10 h-9 rounded-xl bg-slate-100 text-slate-700 font-black border disabled:text-slate-300">-</button>
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* VISITOR TEAM */}
                              <div className="w-12 sm:w-16 shrink-0 flex flex-col items-start text-left font-black text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 tabular-nums" title={getTeamDisplayName(m.visitor, lang)}>
                                <span className="whitespace-nowrap"><span className="mr-0.5 sm:mr-1 text-sm select-none">{getTeamFlag(m.visitor)}</span> {getTeamShortCode(m.visitor)}</span>
                              </div>
                              </div>
                              </div>
                              {!isLocked && !isExpanded && (
                                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Toca para ajustar marcador</span>
                              )}
                            </div>

                            {/* Scoring details / Save Button Action */}
                            <div className="w-full md:w-1/4 flex flex-col items-center md:items-end justify-center">
                              {!isLocked ? (
                                <div className="flex items-center justify-center md:justify-end gap-2 flex-wrap">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleClearPrediction(m.id);
                                    }}
                                    disabled={!canSubmitPredictions || (!pred && localVal === "" && visVal === "")}
                                    className={`min-h-12 px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 border ${
                                      !canSubmitPredictions || (!pred && localVal === "" && visVal === "")
                                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700"
                                        : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                                    }`}
                                  >
                                    <Eraser className="w-3 h-3" /> Limpiar
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSavePrediction(m.id);
                                    }}
                                    disabled={!canSubmitPredictions}
                                    className={`min-h-12 px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1 shadow-sm ${
                                      canSubmitPredictions
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                        : "bg-slate-300 text-slate-500 cursor-not-allowed"
                                    }`}
                                  >
                                    <Check className="w-3 h-3" /> {pred ? t("pred_update", "Actualizar") : t("pred_save", "Guardar")}
                                  </button>
                                </div>
                              ) : (
                                <div className="text-center md:text-right">
                                  {hasEnded ? (
                                    <div>
                                      {pred ? (
                                        <div className="text-right">
                                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                            +{pred.pointsEarned} Pts!!
                                          </span>
                                          <span className="block text-[9px] text-slate-400 capitalize">
                                            {pred.reason === "exact" ? "🎯 " : pred.reason === "draw" ? "🤝 " : "⚽ "}{getPredictionReasonLabel(pred.reason)}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-slate-400">{t("pred_no_points", "Sin puntos (no participaste)")}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-mono">
                                      {getMatchTimeRemainingLabel(m)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div
                              className={`basis-full w-full pt-3 border-t flex items-center justify-center gap-2 text-xs ${
                                isLocked
                                  ? "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                                  : "border-emerald-100 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300"
                              }`}
                              aria-live="off"
                            >
                              <Clock className="w-3.5 h-3.5 shrink-0" />
                              <span className="font-semibold">El evento cierra en:</span>
                              <span className="font-mono font-black tabular-nums">{getMatchClosingCountdown(m)}</span>
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                    </>
                  )}
                </div>
              )}

              {/* 3. MÓDULO USER: TABLA DE POSICIONES RANKING */}
              {activeTab === "ranking" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="text-emerald-600 w-5 h-5" id="user_ranking_sidebar_trophy" /> {rankingTitle}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">{rankingDescription}</p>
                    </div>

                    <button
                      onClick={handleExportRankingCSV}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> {t("rank_export", "Exportar CSV")}
                    </button>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/20 p-4 md:p-5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase tracking-widest font-black text-emerald-700 dark:text-emerald-300">Comparte tu avance</span>
                          <h3 className="text-base font-black text-slate-950 dark:text-white truncate">
                            Puesto #{currentRanking?.position || "-"} · {currentRanking?.points ?? currentUser.points} puntos
                          </h3>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                            La tarjeta muestra tu nombre público, avatar, ranking, puntos y aciertos. No incluye datos privados.
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={shareCurrentRanking}
                          disabled={rankingShareBusy}
                          className="min-h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Share2 className="w-4 h-4" />
                          {rankingShareBusy ? "Preparando..." : "Compartir"}
                        </button>
                        <button
                          type="button"
                          onClick={downloadRankingShareCard}
                          disabled={rankingShareBusy}
                          className="min-h-11 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-black flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Descargar
                        </button>
                        <button
                          type="button"
                          onClick={() => copyTextToClipboard(`${getRankingShareText()}\n${window.location.origin}`, "Texto y enlace del ranking copiados.")}
                          className="min-h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black flex items-center justify-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copiar enlace
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Leaderboard Table Grid */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3 w-12 text-center">{t("rank_col_pos", "Pos")}</th>
                            <th className="py-2.5 px-3">{t("rank_col_name", "Nombre")}</th>
                            <th className="py-2.5 px-3 hidden md:table-cell">País</th>
                            <th className="py-2.5 px-3 text-center">{t("rank_col_pts", "Pts Totales")}</th>
                            <th className="py-2.5 px-3 text-center hidden sm:table-cell">{t("rank_col_exact", "Marcadores exactos")}</th>
                            <th className="py-2.5 px-3 text-center hidden sm:table-cell">{t("rank_col_draw", "Resultados 1X2")}</th>
                            <th className="py-2.5 px-3 text-center">{t("rank_col_matches", "Partidos")}</th>
                            <th className="py-2.5 px-3 text-center">{t("rank_col_trend", "Tendencia")}</th>
                            <th className="py-2.5 px-3 text-center">Certificado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {rankings.map((r) => {
                            const isSelf = r.userId === currentUser.id;
                            const isTopThree = r.position <= 3;

                            return (
                              <tr key={r.userId} className={`transition-colors ${isSelf ? "bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-200 font-semibold" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/10"}`}>
                                <td className="py-3 px-3 text-center text-xs font-bold">
                                  {isTopThree ? (
                                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] ${
                                      r.position === 1 ? "bg-amber-400 text-amber-950" :
                                      r.position === 2 ? "bg-slate-300 text-slate-900" :
                                      "bg-amber-600 text-white"
                                    }`}>
                                      {r.position}
                                    </span>
                                  ) : (
                                    r.position
                                  )}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="flex items-center gap-2">
                                    <img src={r.userAvatar} alt="user" className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700" referrerPolicy="no-referrer" />
                                    <span>
                                      {r.userName} {isSelf && <span className="bg-emerald-600 text-white text-[9px] px-1 rounded ml-1">{t("rank_you", "Tú (Mi Cuenta)")}</span>}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                                    <span className="text-sm leading-none">{getCountryFlag(r.userCountry)}</span>
                                    <span title={normalizeCountryName(r.userCountry)}>{getCountryShortCode(r.userCountry)}</span>
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white">{r.points}</td>
                                <td className="py-2.5 px-3 text-center hidden sm:table-cell text-emerald-700 dark:text-emerald-400">{r.exactCount}</td>
                                <td className="py-2.5 px-3 text-center hidden sm:table-cell text-indigo-700 dark:text-indigo-400">{r.drawCount}</td>
                                <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400">{r.predictCount}</td>
                                <td className="py-2.5 px-3 text-center">
                                  {r.shift === "up" && (
                                    <span className="inline-flex items-center justify-center gap-0.5 whitespace-nowrap text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold" title="Subió posición" aria-label={t("rank_status_up", "Subió")}>
                                      <ChevronUp className="w-4 h-4 shrink-0 stroke-[3]" aria-hidden="true" />
                                      <span className="hidden sm:inline">{t("rank_status_up", "Subió")}</span>
                                    </span>
                                  )}
                                  {r.shift === "down" && (
                                    <span className="inline-flex items-center justify-center gap-0.5 whitespace-nowrap text-rose-500 text-[10px] font-mono font-bold" title="Bajó posición" aria-label={t("rank_status_down", "Bajó")}>
                                      <ChevronDown className="w-4 h-4 shrink-0 stroke-[3]" aria-hidden="true" />
                                      <span className="hidden sm:inline">{t("rank_status_down", "Bajó")}</span>
                                    </span>
                                  )}
                                  {r.shift === "equal" && (
                                    <span className="text-slate-400 font-bold" title="Igual">═ {t("rank_status_equal", "Mantener")}</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  {isTopThree ? (
                                    <button
                                      type="button"
                                      onClick={() => setWinnerCertificate(r)}
                                      disabled={!certificatesEnabled}
                                      title={certificatesEnabled ? "Ver certificado de ganador" : "Disponible 60 segundos despues de finalizar la gran final"}
                                      className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border transition-colors ${
                                        certificatesEnabled
                                          ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:hover:bg-amber-950/50 dark:text-amber-200 dark:border-amber-900"
                                          : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700"
                                      }`}
                                    >
                                      <FileText className="w-3.5 h-3.5" />
                                      <span className="hidden lg:inline">Certificado</span>
                                    </button>
                                  ) : (
                                    <span className="text-slate-300 dark:text-slate-600">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {winnerCertificate && (
                    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setWinnerCertificate(null)}>
                      <div
                        className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-amber-200 dark:border-amber-900 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-slate-950 text-white p-5 border-b border-amber-500/30">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-amber-300">
                                <FileText className="w-4 h-4" />
                                Certificado de ganador
                              </span>
                              <h3 className="text-2xl font-black mt-2">Polla Mundialista 2026</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => setWinnerCertificate(null)}
                              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-black"
                              title="Cerrar certificado"
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        <div className="p-6 space-y-5">
                          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
                            <p className="text-xs uppercase tracking-widest font-black text-amber-700 dark:text-amber-300">Felicitaciones</p>
                            <p className="text-lg md:text-xl font-black text-slate-950 dark:text-white mt-1">
                              {winnerCertificate.userName}, eres ganador del {getWinnerPlaceLabel(winnerCertificate.position)}.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="block text-[10px] uppercase font-black text-slate-400">Premio asignado</span>
                              <span className="block text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                                {formatCop(getWinnerPrize(winnerCertificate.position))}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <span className="block text-[10px] uppercase font-black text-slate-400">Puesto final</span>
                              <span className="block text-2xl font-black text-slate-950 dark:text-white mt-1">
                                #{winnerCertificate.position}
                              </span>
                            </div>
                          </div>

                          <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-3">
                            <p>
                              Este certificado reconoce tu posicion final en la tabla oficial de la Polla Mundialista 2026, calculada con los resultados registrados y las reglas de puntuacion vigentes.
                            </p>
                            <p>
                              En poco tiempo nuestro equipo de soporte se contactará contigo por el correo registrado en tu cuenta para solicitar la información necesaria de identidad y cuenta bancaria para gestionar la entrega del premio.
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              La entrega del premio está sujeta a verificación de identidad, confirmación de datos bancarios y validación final del ranking.
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-mono">
                            <span>Emitido: {new Date().toLocaleDateString()}</span>
                            <span>ID participante: {winnerCertificate.userId}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 4. MÓDULO USER: PRONÓSTICOS PÚBLICOS */}
              {activeTab === "public-predictions" && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Eye className="text-emerald-600 w-5 h-5" /> Pronósticos Públicos
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Consulta los marcadores pronosticados por los participantes de tu misma modalidad cuando el partido ya está en curso o finalizó.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void fetchPublicPredictions()}
                      disabled={publicPredictionsLoading}
                      className="min-h-10 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-black inline-flex items-center gap-2 disabled:opacity-60"
                    >
                      <RefreshCw className={`w-4 h-4 ${publicPredictionsLoading ? "animate-spin" : ""}`} />
                      Actualizar
                    </button>
                  </div>

                  <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-xs text-amber-900 dark:text-amber-200">
                    Los pronósticos permanecen privados antes del inicio de cada partido. Esta pantalla no muestra correos ni información privada.
                  </div>

                  {publicPredictionsError ? (
                    <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 p-4 text-sm text-rose-700 dark:text-rose-300">
                      {publicPredictionsError}
                    </div>
                  ) : publicPredictionsLoading && publicPredictionMatches.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-sm text-slate-500">
                      Cargando pronósticos públicos...
                    </div>
                  ) : publicPredictionMatches.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
                      <Eye className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700 dark:text-slate-200">Todavía no hay partidos disponibles.</p>
                      <p className="text-xs text-slate-500 mt-1">Los pronósticos aparecerán cuando un partido comience.</p>
                    </div>
                  ) : (
                    <>
                      <label className="block">
                        <span className="block text-xs font-black text-slate-600 dark:text-slate-300 mb-1.5">Selecciona un partido</span>
                        <select
                          value={selectedPublicMatchId || ""}
                          onChange={(event) => setSelectedPublicMatchId(Number(event.target.value))}
                          className="w-full min-h-11 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100"
                        >
                          {publicPredictionMatches.map((match) => (
                            <option key={match.id} value={match.id}>
                              {match.local} vs {match.visitor} · {match.status === "finished" ? "Finalizado" : "En curso"}
                            </option>
                          ))}
                        </select>
                      </label>

                      {selectedPublicPredictionMatch && (
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                          <div className="p-4 md:p-5 bg-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-widest font-black text-emerald-300">{selectedPublicPredictionMatch.stage}</p>
                              <h3 className="text-lg font-black mt-1">
                                {getTeamFlag(selectedPublicPredictionMatch.local)} {selectedPublicPredictionMatch.local}
                                <span className="mx-2 text-slate-400">vs</span>
                                {getTeamFlag(selectedPublicPredictionMatch.visitor)} {selectedPublicPredictionMatch.visitor}
                              </h3>
                            </div>
                            <div className="text-left sm:text-right">
                              <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                                selectedPublicPredictionMatch.status === "finished"
                                  ? "bg-slate-700 text-slate-100"
                                  : "bg-rose-500 text-white"
                              }`}>
                                {selectedPublicPredictionMatch.status === "finished" ? "Finalizado" : "En curso"}
                              </span>
                              {selectedPublicPredictionMatch.status === "finished" && (
                                <p className="text-xl font-black mt-1">
                                  {selectedPublicPredictionMatch.localScore} - {selectedPublicPredictionMatch.visitorScore}
                                </p>
                              )}
                            </div>
                          </div>

                          {selectedPublicPredictionMatch.predictions.length === 0 ? (
                            <p className="p-6 text-center text-sm text-slate-500">Ningún participante visible registró pronóstico para este partido.</p>
                          ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {selectedPublicPredictionMatch.predictions.map((prediction) => (
                                <div key={prediction.userId} className="p-3 md:p-4 flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={prediction.userAvatar}
                                      alt={prediction.userName}
                                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                      referrerPolicy="no-referrer"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                                        {prediction.userName}
                                        {prediction.userId === currentUser.id && <span className="ml-1 text-[9px] text-emerald-600">(Tú)</span>}
                                      </p>
                                      <p className="text-[10px] text-slate-500">
                                        {prediction.userCountry ? `${getCountryFlag(prediction.userCountry)} ` : ""}
                                        {prediction.position ? `Puesto #${prediction.position}` : "Participante"}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <p className="text-xl font-black tabular-nums text-slate-950 dark:text-white">
                                      {prediction.localScore} - {prediction.visitorScore}
                                    </p>
                                    {selectedPublicPredictionMatch.status === "finished" && prediction.pointsEarned !== null && (
                                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">+{prediction.pointsEarned} pts</p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* 5. MÓDULO USER: REGLAS Y PREMIACIONES TAB */}
              {activeTab === "rules-prizes" && (() => {
                const selectedRulesImageUrl = rulesFlyerPreviewLang === "en" 
                  ? (torneo?.rulesImageUrlEn || "/src/assets/images/polla_rules_en_1780083217819.png")
                  : (torneo?.rulesImageUrl || "/uploads/reglas.png");
                const selectedRulesFallbackUrl = rulesFlyerPreviewLang === "en"
                  ? "/src/assets/images/polla_rules_en_1780083217819.png"
                  : "/uploads/reglas.png";
                const selectedRulesDownloadName = rulesFlyerPreviewLang === "en"
                  ? "rules_flyer_2026.png"
                  : "reglamento_polla_2026.png";
                const isUsingDefaultEnglishFlyer = rulesFlyerPreviewLang === "en" && !torneo?.rulesImageUrlEn;
                const canSeeCompanyPrizePolicy = Boolean(currentUser.companyId && (currentUser.role === "standard" || currentUser.role === "company_admin"));
                const canSeeMoneyPrizePolicy = Boolean(!currentUser.companyId || hasRealPrizeAccess || isSuperAdminUser);
                const currentCompanyName = companies.find((company) => company.id === currentUser.companyId)?.name || "tu empresa";
                const prizePolicyCards = [
                  ...(canSeeMoneyPrizePolicy ? [{
                    key: "money",
                    title: "Políticas de premios en dinero",
                    badge: "Usuarios pagos",
                    text: torneo?.prizesText,
                    fallback: t("rules_no_prizes", "Por definir por el administrador.")
                  }] : []),
                  ...(canSeeCompanyPrizePolicy ? [{
                    key: "company",
                    title: `Políticas de premios de ${currentCompanyName}`,
                    badge: "Empresa",
                    text: companyPrizePolicy,
                    fallback: "Premiaciones por definir por el administrador de la empresa."
                  }] : [])
                ];

                return (
                  <div className="space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <Info className="text-emerald-600 w-5 h-5" /> {t("rules_title", "Reglas Oficiales y Premiaciones de la Polla")}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">{t("rules_desc", "Conoce las bases para calcular puntajes y llevar los reconocimientos del torneo")}</p>
                      </div>
                    </div>

                    {activeRulesBanner && (
                      <div>
                        {renderSponsorBanner(activeRulesBanner)}
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                      {/* COLUMNS 1 & 2: TEXT DETAILS */}
                      <div className="order-2 space-y-6">
                        <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/15 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/40 space-y-3 shadow-sm">
                          <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-350 flex items-center gap-2">
                            <Trophy className="w-4.5 h-4.5 text-emerald-600" /> {t("rules_dist_pt", "Distribución de Puntos")}
                          </h3>
                          <div className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed space-y-1">
                            {renderFormattedText(torneo?.rulesText, "REGLAS DE PUNTUACION:\n- **Empate exacto:** 35 puntos\n- **Marcador exacto con ganador:** 25 puntos\n- **Resultado 1X2 acertado:** 15 puntos\n- **Participacion:** 5 puntos\n- **Sin pronostico:** 0 puntos")}
                          </div>
                        </div>

                        <div className="space-y-4">
                          {prizePolicyCards.length === 0 ? (
                            <div className="p-5 bg-slate-50/80 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> {t("rules_prizes_rec", "Premios & Reconocimientos")}
                              </h3>
                              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                                {renderFormattedText("", t("rules_no_prizes", "Por definir por el administrador."))}
                              </div>
                            </div>
                          ) : (
                            prizePolicyCards.map((policy) => (
                              <div key={policy.key} className="p-5 bg-slate-50/80 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> {policy.title}
                                  </h3>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-black uppercase">
                                    {policy.badge}
                                  </span>
                                </div>
                                {policy.key === "money" && (
                                  <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-[11px] font-semibold text-amber-800 dark:text-amber-200">
                                    Premios para usuarios pagos: esta politica aplica a participantes con inscripcion confirmada en Polla REAL.
                                  </div>
                                )}
                                <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-1">
                                  {renderFormattedText(policy.text, policy.fallback)}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* COLUMN 3: GRAPHICAL BROCHURE / FLYER DOWNLOAD */}
                      <div className="order-1">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> {lang === "es" ? "Reglamento Gráfico" : "Graphic Brochure"}
                            </h3>
                            <div className="flex items-center gap-1 rounded-full bg-slate-800/90 p-1 border border-slate-700">
                              {(["es", "en"] as const).map((previewLang) => (
                                <button
                                  key={previewLang}
                                  type="button"
                                  onClick={() => setRulesFlyerPreviewLang(previewLang)}
                                  className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest transition-colors ${
                                    rulesFlyerPreviewLang === previewLang
                                      ? "bg-emerald-400 text-slate-950"
                                      : "text-slate-300 hover:text-white hover:bg-slate-700"
                                  }`}
                                >
                                  {previewLang}
                                </button>
                              ))}
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-350 leading-relaxed">
                            {lang === "es" 
                              ? "Descarga o amplía la infografía con las reglas de asignación del Mundial de la FIFA de forma atractiva para enviar por canales de chat o WhatsApp de amigos."
                              : "Download or expand the official infoguide with prediction scoring rules to share via chat or WhatsApp with friends and pool sub-leagues."}
                          </p>

                          <div className="flex items-center justify-between gap-2 text-[10px] text-slate-300 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2">
                            <span className="font-semibold">
                              {rulesFlyerPreviewLang === "en" ? "English flyer preview" : "Vista previa en espanol"}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold tracking-widest leading-none">
                              {isUsingDefaultEnglishFlyer ? "Demo" : (lang === "es" ? "Oficial" : "Official")}
                            </span>
                          </div>

                          {isUsingDefaultEnglishFlyer && (
                            <p className="text-[10px] text-amber-200 leading-relaxed bg-amber-500/10 border border-amber-400/20 rounded-xl px-3 py-2">
                              Todavia no hay flyer en ingles personalizado. Puedes subirlo en Assets, copiar la URL de Cloudinary y pegarla en Configuracion.
                            </p>
                          )}

                          {/* Image Preview Container */}
                          <div 
                            onClick={() => setRulesImageZoom(true)}
                            className="relative aspect-[3/4] max-w-md mx-auto rounded-xl overflow-hidden group cursor-zoom-in border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 shadow-inner bg-slate-910"
                          >
                            <img 
                              src={selectedRulesImageUrl} 
                              alt="Folleto Oficial" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = selectedRulesFallbackUrl;
                              }}
                            />
                            <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-3 text-center">
                              <div className="bg-emerald-600 p-2 rounded-full shadow-lg">
                                <Maximize2 className="w-5 h-5 text-white" />
                              </div>
                              <span className="text-[10px] font-bold tracking-wide text-white drop-shadow-sm">
                                {lang === "es" ? "Ver en Grande" : "Zoom Image"}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2 max-w-md mx-auto">
                            <button
                              onClick={() => setRulesImageZoom(true)}
                              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-300" />
                              {lang === "es" ? "Previsualizar Reglamento" : "Preview Rules Flyer"}
                            </button>

                            <a
                              href={selectedRulesImageUrl}
                              download={selectedRulesDownloadName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-emerald-900/10 active:scale-[0.98]"
                            >
                              <Download className="w-4 h-4 stroke-[2.5]" />
                              {lang === "es" ? "Descargar Flyer Oficial" : "Download Official Flyer"}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* LIGHTBOX OVERLAY / MODAL ZOOM */}
                    {rulesImageZoom && (
                      <div 
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in"
                        onClick={() => setRulesImageZoom(false)}
                      >
                        <div 
                          className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl space-y-4 p-4 animate-scale-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold text-white uppercase tracking-wider">
                                {lang === "es" ? "Reglamento Oficial Infografía" : "Official Infographic Rules"}
                              </span>
                            </div>
                            <button 
                              onClick={() => setRulesImageZoom(false)}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-xs font-bold"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="overflow-auto max-h-[75vh] flex justify-center bg-slate-950 rounded-xl border border-slate-800/60 p-1">
                            <img 
                              src={selectedRulesImageUrl} 
                              alt="Rules Flyer" 
                              className="max-w-full h-auto object-contain rounded"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = selectedRulesFallbackUrl;
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-1">
                            <span className="text-[10px] text-slate-400 italic">
                              {lang === "es" ? "Haz clic fuera para cerrar" : "Click anywhere outside to close"}
                            </span>
                            <a
                              href={selectedRulesImageUrl}
                              download={selectedRulesDownloadName}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow"
                            >
                              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                              {lang === "es" ? "Guardar Imagen" : "Save Image"}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* 5. MÓDULO ADMIN: CORE REPORTS & METRIC STATS */}
              {activeTab === "admin-stats" && isSuperAdminUser && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <BarChart3 className="text-amber-500 w-5 h-5" /> Dashboard de Métricas y Estadísticas Generales
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Monitorea la actividad global, repartición de puntos y fase del torneo</p>
                  </div>

                  {stats ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-500 block font-bold leading-none">PARTICIPANTES</span>
                          <span className="text-xl font-bold text-slate-900 block mt-1.5">{stats.totalParticipants}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-500 block font-bold leading-none">TOTAL PRONÓSTICOS</span>
                          <span className="text-xl font-bold text-slate-900 block mt-1.5">{stats.totalPredictionsCount}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-500 block font-bold leading-none">PROMEDIO PUNTOS</span>
                          <span className="text-xl font-bold text-emerald-700 block mt-1.5">{stats.averagePoints} pts</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-500 block font-bold leading-none">FINALIZADOS / PENDIENTES</span>
                          <span className="text-sm font-bold block mt-2 font-mono text-slate-700">
                            {stats.finishedMatches} / {stats.pendingMatches}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-950 text-white rounded-xl border border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="text-sm font-black flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-400" />
                              Bolsa de premios estimada
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Cuota fija {formatCop(stats.prizePool.entryFeeCop)} por participante. El 100% de lo recaudado se destina a premios; administración y comisión bancaria están en $0.
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Participantes cobrados</span>
                            <span className="text-2xl font-black text-emerald-300">{stats.prizePool.paidParticipants}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center">
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Bruto</span>
                            <span className="text-sm font-black">{formatCop(stats.prizePool.grossPool)}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Comisión bancaria <span className="line-through text-slate-500">(-3.5%)</span></span>
                            <span className="text-sm font-black text-slate-200">{formatCop(stats.prizePool.bankCommission)}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                            <span className="text-[9px] text-slate-400 uppercase font-bold block">Administración Polla <span className="line-through text-slate-500">(-10%)</span></span>
                            <span className="text-sm font-black text-slate-200">{formatCop(stats.prizePool.ownerGrossProfit)}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <span className="text-[9px] text-emerald-300 uppercase font-bold block">Premios {Math.round(stats.prizePool.prizePoolRate * 1000) / 10}%</span>
                            <span className="text-sm font-black text-emerald-300">{formatCop(stats.prizePool.prizePool)}</span>
                          </div>
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <span className="text-[9px] text-amber-300 uppercase font-bold block">Ganancia administración</span>
                            <span className="text-sm font-black text-amber-300">{formatCop(stats.prizePool.ownerProfit)}</span>
                          </div>
                        </div>

                        {renderPrizePodium(stats.prizePool.payouts, stats.prizePool.payoutRates, "solid")}
                      </div>

                      {/* Score distribution indicators */}
                      <div className="p-4 bg-white border rounded-xl space-y-4">
                        <h3 className="text-xs font-bold text-slate-700 uppercase">Gráfico de Distribución de Puntos (Volumen de hits)</h3>
                        <div className="space-y-3 font-mono text-xs">
                          {/* 15 pts chart */}
                          <div>
                            <div className="flex justify-between mb-1 text-[11px] font-bold">
                              <span className="text-emerald-700">Marcadores exactos (25 o 35 pts)</span>
                              <span>{stats.distribution.exact25or35} ocurrencias</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-2.5 rounded-full"
                                style={{ width: `${Math.min(100, stats.totalPredictionsCount > 0 ? (stats.distribution.exact25or35 / stats.totalPredictionsCount) * 100 : 0)}%` }}
                              />
                            </div>
                          </div>

                          {/* 10 pts chart */}
                          <div>
                            <div className="flex justify-between mb-1 text-[11px] font-bold">
                              <span className="text-indigo-700">Resultados 1X2 acertados (15 pts)</span>
                              <span>{stats.distribution.outcome15} ocurrencias</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-500 h-2.5 rounded-full"
                                style={{ width: `${Math.min(100, stats.totalPredictionsCount > 0 ? (stats.distribution.outcome15 / stats.totalPredictionsCount) * 100 : 0)}%` }}
                              />
                            </div>
                          </div>

                          {/* 5 pts chart */}
                          <div>
                            <div className="flex justify-between mb-1 text-[11px] font-bold">
                              <span className="text-slate-700">Puntos de Participación Básica (5 pts)</span>
                              <span>{stats.distribution.participation5} ocurrencias</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-slate-400 h-2.5 rounded-full"
                                style={{ width: `${Math.min(100, stats.totalPredictionsCount > 0 ? (stats.distribution.participation5 / stats.totalPredictionsCount) * 100 : 0)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">Cargando métricas de administración...</p>
                  )}
                </div>
              )}

              {/* 6. MÓDULO ADMIN: MANAGE USER ACCOUNTS */}
              {activeTab === "group-pool" && canCreateGroupPool && (
                <div className="space-y-6">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h2 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      Crear Polla Grupal
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Organiza un grupo privado para tu familia, empresa, amigos o comunidad.
                    </p>
                  </div>

                  {groupPoolStatus.status === "pending" ? (
                    <div className="border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-5 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-black text-amber-950 dark:text-amber-100">Configuración en proceso</h3>
                          <p className="mt-1 text-sm text-amber-900 dark:text-amber-200">
                            {groupPoolStatus.company?.name || "Tu Polla Grupal"} estará disponible aproximadamente en{" "}
                            {Math.max(1, Math.ceil((groupPoolStatus.remainingSeconds || 0) / 60))} minutos.
                          </p>
                          <button
                            type="button"
                            onClick={fetchGroupPoolStatus}
                            className="mt-4 min-h-11 px-4 rounded-lg bg-slate-900 text-white text-sm font-black inline-flex items-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Revisar estado
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateGroupPool} className="max-w-xl space-y-4">
                      <div>
                        <label htmlFor="group_pool_name" className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                          Nombre de la Polla Grupal
                        </label>
                        <input
                          id="group_pool_name"
                          type="text"
                          value={groupPoolName}
                          onChange={(event) => setGroupPoolName(event.target.value)}
                          minLength={3}
                          maxLength={80}
                          required
                          placeholder="Ej. Familia Salcedo o Empresa Mundialista"
                          className="w-full min-h-12 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                        <p>Hasta 50 participantes.</p>
                        <p>Acceso gratuito dentro del grupo y ranking independiente.</p>
                      </div>
                      <button
                        type="submit"
                        disabled={groupPoolBusy}
                        className="min-h-12 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-black inline-flex items-center gap-2"
                      >
                        {groupPoolBusy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Crear Polla Grupal
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeTab === "admin-companies" && canManageUsers && (
                <div className="space-y-5">
                  <div className="border-b pb-3 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Tv className="text-amber-500 w-5 h-5" /> {isCompanyAdminUser ? "Administrador Grupal" : "Empresas e Invitaciones"}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Maximo 50 jugadores por empresa. El ranking empresarial es una vista independiente del ranking global.</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black">Modo {appMode}</span>
                  </div>

                  {isSuperAdminUser && (
                    <form onSubmit={handleSaveCompany} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-slate-50 border rounded-xl text-xs">
                      <input className="min-h-11 px-3 rounded-lg border" placeholder="Nombre empresa" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} required />
                      <input className="min-h-11 px-3 rounded-lg border" placeholder="slug-opcional" value={companyForm.slug} onChange={(e) => setCompanyForm({ ...companyForm, slug: e.target.value })} />
                      <input className="min-h-11 px-3 rounded-lg border" placeholder="Logo URL" value={companyForm.logo} onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.value })} />
                      <select className="min-h-11 px-3 rounded-lg border" value={companyForm.adminId} onChange={(e) => setCompanyForm({ ...companyForm, adminId: e.target.value })}>
                        <option value="">Admin principal</option>
                        {adminUsers.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}
                      </select>
                      <button className="min-h-11 rounded-lg bg-emerald-600 text-white font-black">Crear empresa</button>
                      <textarea
                        className="md:col-span-5 min-h-24 px-3 py-2 rounded-lg border"
                        placeholder="Texto Libro de Premiaciones específico para esta empresa"
                        value={companyForm.prizesText}
                        onChange={(e) => setCompanyForm({ ...companyForm, prizesText: e.target.value })}
                      />
                    </form>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1 space-y-3">
                      {companies.length === 0 ? (
                        <div className="p-4 rounded-xl border text-xs text-slate-500">Aun no hay empresas creadas.</div>
                      ) : companies.map((company) => (
                        <button
                          key={company.id}
                          type="button"
                          onClick={() => {
                            setSelectedCompanyId(company.id);
                            fetchCompanyDetails(company.id);
                            fetchCompanyRanking(company.id);
                          }}
                          className={`w-full min-h-16 p-3 rounded-xl border text-left transition ${selectedCompanyId === company.id ? "bg-emerald-50 border-emerald-200" : "bg-white hover:bg-slate-50"}`}
                        >
                          <span className="block text-sm font-black text-slate-950">{company.name}</span>
                          <span className="block text-[11px] text-slate-500">{company.playersCount || 0}/{company.maxPlayers} jugadores · disponibles {company.availableSlots ?? company.maxPlayers}</span>
                        </button>
                      ))}
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <div className="p-4 rounded-xl border bg-white flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="text-sm font-black">Invitaciones</h3>
                          <p className="text-xs text-slate-500">
                            Genera un enlace reusable para registrar jugadores de la empresa seleccionada. El mismo link sirve hasta llenar los cupos disponibles.
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black uppercase">
                            <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {companyInviteSlots.playersCount}/{companyInviteSlots.maxPlayers} registrados
                            </span>
                            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                              {companyInviteSlots.availableSlots} cupos disponibles
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCreateCompanyInvitation}
                          disabled={!selectedCompanyId || companyInviteSlots.availableSlots <= 0}
                          className="min-h-11 px-4 rounded-lg bg-slate-900 text-white font-black text-xs disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          Generar enlace reusable
                        </button>
                      </div>

                      {selectedCompanyId && (
                        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 text-xs text-emerald-900">
                          <h3 className="font-black">Cómo usar el enlace</h3>
                          <p className="mt-1 leading-relaxed">
                            Copia el enlace y envíalo por WhatsApp, correo o chat interno. Cada jugador debe abrirlo, crear su cuenta y quedará asociado automáticamente a esta empresa. El enlace deja de aceptar registros cuando la empresa llega a {companyInviteSlots.maxPlayers} jugadores.
                          </p>
                        </div>
                      )}

                      {selectedCompanyId && (
                        <div className="p-4 rounded-xl border bg-white space-y-3">
                          <div>
                            <h3 className="text-sm font-black">Texto Libro de Premiaciones</h3>
                            <p className="text-xs text-slate-500">Este texto reemplaza el libro global solo para los usuarios de esta empresa.</p>
                          </div>
                          <textarea
                            className="w-full min-h-36 rounded-xl border px-3 py-2 text-xs"
                            value={companyPrizePolicy}
                            onChange={(e) => setCompanyPrizePolicy(e.target.value)}
                            placeholder={torneo?.prizesText || "Premiaciones por definir..."}
                          />
                          <button
                            type="button"
                            onClick={handleSaveCompanyPrizePolicy}
                            className="inline-flex min-h-12 items-center justify-center gap-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:translate-y-px text-white font-black text-xs shadow-md shadow-emerald-900/15 border border-emerald-500 transition-all"
                          >
                            <Check className="w-4 h-4" />
                            Guardar premiaciones de empresa
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl border bg-white">
                          <h3 className="text-xs font-black uppercase text-slate-500 mb-3">Invitaciones recientes</h3>
                          <div className="space-y-2 max-h-56 overflow-y-auto">
                            {companyInvitations.length === 0 ? <p className="text-xs text-slate-400">Sin invitaciones.</p> : companyInvitations.map((inv) => (
                              <div key={inv.id} className="p-3 rounded-lg bg-slate-50 text-xs space-y-2">
                                <div className="flex justify-between gap-2">
                                  <span className="font-mono truncate" title={getCompanyInvitationUrl(inv)}>{getCompanyInvitationUrl(inv)}</span>
                                  <span className={`font-black uppercase ${inv.status === "active" ? "text-emerald-700" : "text-slate-500"}`}>{inv.status}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyTextToClipboard(getCompanyInvitationUrl(inv), "Enlace de invitación copiado. Compártelo con los jugadores de la empresa.")}
                                  className="min-h-9 w-full rounded-lg bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 font-black flex items-center justify-center gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                  Copiar enlace
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 rounded-xl border bg-white">
                          <h3 className="text-xs font-black uppercase text-slate-500 mb-1">Ranking empresarial gratuito</h3>
                          <p className="text-[10px] text-slate-400 mb-3">No incluye usuarios de la empresa que pagaron Polla REAL.</p>
                          <div className="space-y-2 max-h-56 overflow-y-auto">
                            {companyRanking.length === 0 ? <p className="text-xs text-slate-400">Sin ranking para esta empresa.</p> : companyRanking.map((row) => (
                              <div key={row.userId} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-50 text-xs">
                                <span className="font-bold">#{row.companyPosition} {row.userName}</span>
                                <span className="font-black">{row.points} pts</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "admin-users" && canManageUsers && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="text-amber-500 w-5 h-5" /> Gestión de Cuentas de Participantes
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Crear, editar, suspender cuentas oficiales, resetear contraseñas y auditar predicciones</p>
                    </div>

                    <button
                      onClick={() => setEditingUser({ name: "", email: "", country: "Colombia", password: "user", role: "standard", status: "active", avatar: AVATARS[0] })}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Registrar Participante
                    </button>
                  </div>

                  {isSuperAdminUser && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900 p-4 md:p-5 space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                          <FileSpreadsheet className="w-4 h-4" />
                          Importar pronósticos desde Excel
                        </h3>
                        <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                          Lee las hojas A-L, valida 72 partidos de grupos y guarda únicamente los que continúan abiertos.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3">
                        <label>
                          <span className="block text-[10px] uppercase font-black text-slate-500 mb-1">Correo del participante</span>
                          <input
                            type="email"
                            value={predictionImportEmail}
                            onChange={(event) => {
                              setPredictionImportEmail(event.target.value);
                              setPredictionImportResult(null);
                            }}
                            className="w-full min-h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs"
                          />
                        </label>
                        <label>
                          <span className="block text-[10px] uppercase font-black text-slate-500 mb-1">Archivo Excel</span>
                          <input
                            type="file"
                            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            onChange={(event) => {
                              setPredictionImportFile(event.target.files?.[0] || null);
                              setPredictionImportResult(null);
                            }}
                            className="block w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs file:mr-3 file:border-0 file:bg-slate-900 file:text-white file:rounded-lg file:px-3 file:py-1"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => void handlePredictionExcelImport(false)}
                          disabled={predictionImportBusy || !predictionImportFile}
                          className="md:self-end min-h-11 px-4 rounded-xl bg-slate-900 text-white text-xs font-black disabled:bg-slate-300"
                        >
                          {predictionImportBusy ? "Procesando..." : "Vista previa"}
                        </button>
                      </div>

                      {predictionImportResult && (
                        <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <p className="text-sm font-black text-slate-950 dark:text-white">
                                {predictionImportResult.user.name}
                              </p>
                              <p className="text-[11px] text-slate-500">{predictionImportResult.user.email}</p>
                            </div>
                            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                              Pago confirmado
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                            <div className="rounded-lg bg-emerald-50 p-2">
                              <span className="block text-xl font-black text-emerald-700">
                                {(predictionImportResult.summary.ready_to_create || 0) + (predictionImportResult.summary.ready_to_update || 0)}
                              </span>
                              <span className="text-[9px] uppercase font-black text-emerald-800">Listos</span>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-2">
                              <span className="block text-xl font-black text-amber-700">{predictionImportResult.summary.closed || 0}</span>
                              <span className="text-[9px] uppercase font-black text-amber-800">Cerrados</span>
                            </div>
                            <div className="rounded-lg bg-slate-100 p-2">
                              <span className="block text-xl font-black text-slate-700">{predictionImportResult.summary.already_equal || 0}</span>
                              <span className="text-[9px] uppercase font-black text-slate-600">Ya iguales</span>
                            </div>
                            <div className="rounded-lg bg-blue-50 p-2">
                              <span className="block text-xl font-black text-blue-700">{predictionImportResult.total}</span>
                              <span className="text-[9px] uppercase font-black text-blue-800">Total Excel</span>
                            </div>
                          </div>

                          {predictionImportResult.mode === "preview" && (
                            <button
                              type="button"
                              onClick={() => void handlePredictionExcelImport(true)}
                              disabled={
                                predictionImportBusy ||
                                ((predictionImportResult.summary.ready_to_create || 0) + (predictionImportResult.summary.ready_to_update || 0) === 0)
                              }
                              className="w-full min-h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black disabled:bg-slate-300"
                            >
                              Importar únicamente los pronósticos válidos y abiertos
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Search box filters on user list */}
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full text-xs px-3 py-2 border rounded-xl"
                      placeholder="Buscar por nombre o correo electrónico de participante..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                    />
                  </div>

                  {/* User Form pop-up panel if editing/creating */}
                  {editingUser && (
                    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
                      <h3 className="font-bold text-xs text-amber-950">{editingUser.id ? `EDITANDO PARTICIPANTE: ${editingUser.name}` : "REGISTRAR NUEVO PARTICIPANTE"}</h3>
                      <form onSubmit={handleSaveAdminUser} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Nombre</label>
                          <input
                            type="text"
                            required
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={editingUser.name || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Correo Electrónico</label>
                          <input
                            type="email"
                            required
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={editingUser.email || ""}
                            onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">País</label>
                          <select
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={normalizeCountryName(editingUser.country)}
                            onChange={(e) => setEditingUser({ ...editingUser, country: e.target.value })}
                          >
                            {COUNTRY_OPTIONS.map((country) => (
                              <option key={country.name} value={country.name}>{getCountryOptionLabel(country)}</option>
                            ))}
                          </select>
                        </div>

                        {!editingUser.id && (
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-500">Contraseña Inicial</label>
                            <input
                              type="text"
                              required
                              className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                              value={editingUser.password || ""}
                              onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Rol</label>
                          <select
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={editingUser.role || "standard"}
                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                          >
                            <option value="standard">Usuario estándar</option>
                            {isSuperAdminUser && <option value="company_admin">Admin empresa</option>}
                            {isSuperAdminUser && <option value="admin">Administrador</option>}
                            {isSuperAdminUser && <option value="superadmin">Superadmin</option>}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Estado de la cuenta</label>
                          <select
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={editingUser.status || "active"}
                            onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                          >
                            <option value="active">Activa</option>
                            <option value="suspended">🔒 SUSPENDIDA (Bloquear Login)</option>
                          </select>
                        </div>

                        <div className="md:col-span-3 flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingUser(null)}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded text-xs"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1 bg-emerald-600 font-bold text-white rounded text-xs hover:bg-emerald-700"
                          >
                            Guardar Cambios
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Mobile user cards */}
                  <div className="md:hidden space-y-3">
                    {adminUsers
                      .filter((u) =>
                        u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                        u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
                        normalizeCountryName(u.country).toLowerCase().includes(searchUser.toLowerCase()) ||
                        getCountryShortCode(u.country).toLowerCase().includes(searchUser.toLowerCase())
                      )
                      .map((u) => {
                        const userType = getAdminUserType(u);
                        return (
                          <article key={u.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
                            <div className="flex items-start gap-3">
                              <img src={u.avatar} alt={u.name} className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <h3 className="font-black text-sm text-slate-950 truncate">{u.name}</h3>
                                <p className="text-[11px] text-slate-500 break-all mt-0.5">{u.email}</p>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  <span className={`px-2 py-1 rounded-full text-[9px] font-black ${userType.tone}`}>
                                    {userType.label}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-[9px] font-black ${
                                    u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                  }`}>
                                    {u.status === "active" ? "ACTIVA" : "SUSPENDIDA"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <dl className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-[11px]">
                              <div>
                                <dt className="font-bold uppercase text-[9px] text-slate-400">Rol</dt>
                                <dd className="font-bold text-slate-800 mt-0.5">{getAdminUserRoleLabel(u)}</dd>
                              </div>
                              <div>
                                <dt className="font-bold uppercase text-[9px] text-slate-400">País</dt>
                                <dd className="font-bold text-slate-800 mt-0.5">{getCountryFlag(u.country)} {normalizeCountryName(u.country)}</dd>
                              </div>
                              <div>
                                <dt className="font-bold uppercase text-[9px] text-slate-400">Empresa</dt>
                                <dd className="font-bold text-slate-800 mt-0.5">{getUserCompanyName(u)}</dd>
                              </div>
                              <div>
                                <dt className="font-bold uppercase text-[9px] text-slate-400">Puntos</dt>
                                <dd className="font-black text-slate-950 mt-0.5">{u.points}</dd>
                              </div>
                            </dl>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => handleLoadUserPredictions(u)}
                                className="min-h-11 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black"
                              >
                                Predicciones ({u.predictCount})
                              </button>
                              <button
                                onClick={() => setEditingUser(u)}
                                className="min-h-11 px-3 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 text-[10px] font-black flex items-center justify-center gap-1.5"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Editar
                              </button>
                              <button
                                onClick={() => handleResetUserPassword(u)}
                                className="min-h-11 px-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-black"
                              >
                                Resetear clave
                              </button>
                              <button
                                onClick={() => handleDeleteAdminUser(u.id)}
                                className="min-h-11 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 text-[10px] font-black flex items-center justify-center gap-1.5"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                              </button>
                            </div>
                          </article>
                        );
                      })}
                  </div>

                  {/* Desktop users audit table */}
                  <div className="hidden md:block bg-white border rounded-xl overflow-x-auto">
                    <table className="w-full min-w-[1050px] text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Participante</th>
                          <th className="py-2.5 px-3">País</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3 text-center">Estatus Cuenta</th>
                          <th className="py-2.5 px-3 text-center">Rol</th>
                          <th className="py-2.5 px-3 text-center">Tipo de usuario</th>
                          <th className="py-2.5 px-3 text-center">Pts</th>
                          <th className="py-2.5 px-3 text-center">Acciones y Reset</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminUsers
                          .filter((u) =>
                            u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                            u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
                            normalizeCountryName(u.country).toLowerCase().includes(searchUser.toLowerCase()) ||
                            getCountryShortCode(u.country).toLowerCase().includes(searchUser.toLowerCase())
                          )
                          .map((u) => {
                            const userType = getAdminUserType(u);
                            return (
                            <tr key={u.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <img src={u.avatar} alt="user" className="w-7 h-7 rounded-full object-cover" />
                                  <span className="font-semibold text-slate-900">{u.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-slate-600">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="text-sm leading-none">{getCountryFlag(u.country)}</span>
                                  <span title={normalizeCountryName(u.country)}>{getCountryShortCode(u.country)}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{u.email}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                }`}>
                                  {u.status === "active" ? "Activa" : "Suspendida"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-700">{getAdminUserRoleLabel(u)}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`inline-flex px-2 py-1 rounded-full text-[9px] font-black whitespace-nowrap ${userType.tone}`}>
                                  {userType.label}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-black text-slate-950">{u.points}</td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  <button
                                    onClick={() => handleLoadUserPredictions(u)}
                                    className="p-1 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-medium"
                                    title="Ver historial predicciones de este usuario"
                                  >
                                    Predicciones ({u.predictCount})
                                  </button>
                                  <button
                                    onClick={() => setEditingUser(u)}
                                    className="p-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
                                    title="Editar datos básicos de cuenta"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleResetUserPassword(u)}
                                    className="p-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[10px]"
                                    title="Resetear contraseña manualmente"
                                  >
                                    Reset Pass
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAdminUser(u.id)}
                                    className="p-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded"
                                    title="Eliminar usuario definitivamente"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {/* History predictions audit viewer popup */}
                  {selectedUserForPredictions && (
                    <div className="p-4 bg-slate-100 border border-slate-300 rounded-2xl relative">
                      <button
                        onClick={() => setSelectedUserForPredictions(null)}
                        className="absolute top-2 right-2 px-2 py-0.5 bg-slate-300 hover:bg-slate-400 text-xs rounded"
                      >
                        Cerrar vista
                      </button>
                      <h3 className="font-bold text-xs text-slate-800 mb-2">
                        Historial de Predicciones del Usuario: <span className="text-emerald-700">{selectedUserForPredictions.name}</span>
                      </h3>
                      {userPredictionsView.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 text-center">No tiene registrados pronósticos activos.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                          {userPredictionsView.map((up) => {
                            const mt = matches.find((m) => m.id === up.matchId);
                            return (
                              <div key={up.id} className="p-2 bg-white rounded border border-slate-200 text-xs flex justify-between items-center">
                                <div>
                                  <span className="font-bold block">Partido #{up.matchId}: {mt ? `${mt.local} vs ${mt.visitor}` : "Desconocido"}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">Pronóstico: {up.localScore}-{up.visitorScore}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-emerald-700 block">+{up.pointsEarned || 0} pts</span>
                                  <span className="text-[9px] text-slate-400 capitalize">{up.reason || "Pendiente"}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* 7. MÓDULO ADMIN: MATCH CRUD / SCHEDULES / REGISTER RESULTS */}
              {activeTab === "admin-matches" && isSuperAdminUser && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-amber-500 w-5 h-5" /> Gestión de Partidos & Resultados Reales
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Los partidos y resultados de football-data.org se actualizan automáticamente cada 5 minutos. También puedes sincronizar o corregir un resultado manualmente.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={handleSyncMatchesFromApi}
                        disabled={matchSyncBusy}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow ${matchSyncBusy ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                        title="Reemplaza el calendario manual y deja football-data.org como fuente oficial"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${matchSyncBusy ? "animate-spin" : ""}`} /> {matchSyncBusy ? "Sincronizando..." : "Usar solo API"}
                      </button>
                      <button
                        onClick={handleDedupeMatches}
                        disabled={matchDedupeBusy}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 shadow ${matchDedupeBusy ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-slate-800 hover:bg-slate-700 text-white"}`}
                        title="Fusiona partidos duplicados creados por diferencias de nombres entre proveedores"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${matchDedupeBusy ? "animate-spin" : ""}`} /> {matchDedupeBusy ? "Limpiando..." : "Limpiar duplicados"}
                      </button>
                    </div>
                  </div>

                  {/* Edit/Add Match Form panel */}
                  {matchForm && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                      <h3 className="font-bold text-xs">{(matchForm.id ? `EDITAR PARTIDO #${matchForm.id}` : "REGISTRAR NUEVO PARTIDO")}</h3>
                      <form onSubmit={handleSaveMatchForm} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Etapa / Fase</label>
                          <select
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={matchForm.stage || "Grupo A"}
                            onChange={(e) => setMatchForm({ ...matchForm, stage: e.target.value })}
                          >
                            {STAGES.filter((s) => s != "Todos").map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Equipo Local</label>
                          <input
                            type="text"
                            required
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={matchForm.local || ""}
                            onChange={(e) => setMatchForm({ ...matchForm, local: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Equipo Visitante</label>
                          <input
                            type="text"
                            required
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={matchForm.visitor || ""}
                            onChange={(e) => setMatchForm({ ...matchForm, visitor: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Estadio / Sede</label>
                          <input
                            type="text"
                            required
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={matchForm.stadium || ""}
                            onChange={(e) => setMatchForm({ ...matchForm, stadium: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Fecha y hora (UTC-5 Bogotá local)</label>
                          <input
                            type="datetime-local"
                            required
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            onChange={(e) => {
                              const d = new Date(e.target.value);
                              setMatchForm({ ...matchForm, date: d.toISOString() });
                            }}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500">Estado Partido</label>
                          <select
                            className="bg-white border rounded p-1.5 text-xs w-full mt-1"
                            value={matchForm.status || "pending"}
                            onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })}
                          >
                            <option value="pending">Pendiente / Abierto</option>
                            <option value="in_progress">En Curso</option>
                            <option value="finished">Finalizado / Calcular tabla</option>
                          </select>
                        </div>

                        {matchForm.status === "finished" && (
                          <>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500">Marcador Local Real</label>
                              <input
                                type="number"
                                required
                                min="0"
                                className="bg-white border rounded p-1.5 text-xs w-full mt-1 font-mono font-bold"
                                value={matchForm.localScore ?? ""}
                                onChange={(e) => setMatchForm({ ...matchForm, localScore: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-slate-500">Marcador Visitante Real</label>
                              <input
                                type="number"
                                required
                                min="0"
                                className="bg-white border rounded p-1.5 text-xs w-full mt-1 font-mono font-bold"
                                value={matchForm.visitorScore ?? ""}
                                onChange={(e) => setMatchForm({ ...matchForm, visitorScore: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        <div className="md:col-span-4 flex items-center justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setMatchForm(null)}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 rounded text-xs"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1 bg-emerald-600 font-bold text-white rounded text-xs hover:bg-emerald-700"
                          >
                            Guardar Cambios
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Match stage and status filters on admin calendar */}
                  <div className="p-3 bg-slate-50 rounded-xl border flex items-center gap-3 flex-wrap text-xs">
                    <span>Filtrar por Etapa:</span>
                    <select
                      className="bg-white border rounded p-1 text-xs"
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                    >
                      {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Scrollable match records loop */}
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-[400px] overflow-y-auto bg-white">
                    {matches
                      .filter((m) => selectedStage === "Todos" || m.stage === selectedStage)
                      .map((m) => (
                        <div key={m.id} className="p-3 transition-colors hover:bg-slate-50 flex items-center justify-between gap-4 flex-wrap text-xs">
                          <div>
                            <span className="font-bold text-slate-900">Partido #{m.id} ({m.stage})</span>
                            {m.externalSource && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold uppercase">
                                API
                              </span>
                            )}
                            <span className="block text-[10px] text-slate-400 italic mt-0.5">{m.stadium} • {formatMatchDate(m.date)}</span>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <span className="text-sm select-none">{getTeamFlag(m.local)}</span>
                              <span>{m.local}</span>
                            </span>
                            {m.status === "finished" ? (
                              <span className="bg-slate-800 text-amber-300 font-mono font-bold px-2 py-0.5 rounded text-sm select-auto border border-amber-900/30">
                                {m.localScore} - {m.visitorScore}
                              </span>
                            ) : (
                              <span className="text-[10px] bg-indigo-50 text-indigo-700 border px-1.5 py-0.5 rounded uppercase font-bold">
                                {m.status === "in_progress" ? "⚽ En curso" : "Pendiente"}
                              </span>
                            )}
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <span>{m.visitor}</span>
                              <span className="text-sm select-none">{getTeamFlag(m.visitor)}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setMatchForm(m)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" /> Editar
                            </button>
                            <button
                              onClick={() => handleSimulateMatch(m.id)}
                              className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-500/30 rounded font-semibold flex items-center gap-1"
                              title="Simular marcador al azar y recalcular rankings reales"
                            >
                              <RefreshCw className="w-3 h-3" /> Auto Sim
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>

                </div>
              )}

              {/* 8. MÓDULO ADMIN: COMMUNICADOS BROADCAST PUBLISHER */}
              {activeTab === "admin-announcements" && (isSuperAdminUser || isCompanyAdminUser) && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Bell className="text-amber-500 w-5 h-5" /> Tablón de Comunicados y Mensajes del Admin
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Envía anuncios de premios, recordatorios generales o alertas urgentes visibles para todos</p>
                  </div>

                  {isCompanyAdminUser && (
                    <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-800">
                      Estos comunicados solo se notifican dentro de la plataforma a los usuarios de tu empresa. No se envían correos.
                    </div>
                  )}

                  <form onSubmit={handleSaveAnnouncement} className="p-4 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-4">
                    <h3 className="font-bold text-xs text-slate-800">PUBLICAR COMUNICADO</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Título del mensaje (asunto del correo)</label>
                        <input
                          type="text"
                          required
                          className="w-full bg-white border rounded p-1.5"
                          placeholder="Ej. ¡Lanzamiento y Premiaciones Oficiales!"
                          value={announcementForm.title}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Cuerpo o Contenido del Anuncio</label>
                        <textarea
                          required
                          rows={3}
                          className="w-full bg-white border rounded p-1.5 leading-tight"
                          placeholder="Escribe el mensaje visible para todos los participantes..."
                          value={announcementForm.content}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fijación de hora publicación programada (Opcional)</label>
                        <input
                          type="datetime-local"
                          className="w-full bg-white border rounded p-1.5"
                          value={announcementForm.publishAt}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, publishAt: e.target.value })}
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="urgent_ch"
                          checked={announcementForm.urgent}
                          onChange={(e) => setAnnouncementForm({ ...announcementForm, urgent: e.target.checked })}
                          className="w-4 h-4 text-emerald-600 border-slate-300 rounded"
                        />
                        <label htmlFor="urgent_ch" className="font-semibold text-slate-700">Destacar como URGENTE (Alerta distintiva)</label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs flex items-center gap-1 shadow"
                      >
                        <Check className="w-3.5 h-3.5" /> Publicar Anuncio
                      </button>
                    </div>
                  </form>

                  {/* Admin visible bulletins loop */}
                  <div className="space-y-2 mt-4 text-xs">
                    <h3 className="font-bold uppercase text-slate-500 text-[10px]">Lista de Boletines Publicados</h3>
                    {manageableAnnouncements.map((ann) => {
                      const scheduledAt = ann.publishAt ? new Date(ann.publishAt) : null;
                      const isScheduled = Boolean(scheduledAt && scheduledAt.getTime() > nowMs);
                      return (
                      <div key={ann.id} className="p-3 bg-white border rounded-xl flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            {ann.urgent && <span className="bg-rose-600 text-white text-[9px] px-1 rounded uppercase">Urgente</span>}
                            {ann.companyId && <span className="bg-emerald-600 text-white text-[9px] px-1 rounded uppercase">Empresa</span>}
                            <span className={`text-[9px] px-1 rounded uppercase ${isScheduled ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                              {isScheduled ? "Programado" : "Visible"}
                            </span>
                            {ann.title}
                          </h4>
                          <p className="text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                          <span className="block text-[9px] text-slate-400 font-mono mt-1">Registrado el: {new Date(ann.date).toLocaleString()}</span>
                          {scheduledAt && (
                            <span className="block text-[9px] text-amber-700 font-mono mt-1">Publicacion: {scheduledAt.toLocaleString()}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-1 bg-rose-50 text-rose-700 rounded hover:bg-rose-100"
                          title="Eliminar boletín"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                    })}
                  </div>
                </div>
              )}

              {/* 9. MÓDULO ADMIN: POLÍTICAS Y CONFIGURACIONES TORNEO TAB */}
              {/* 9. MODULO ADMIN: BIBLIOTECA DE ASSETS */}
              {activeTab === "admin-assets" && isSuperAdminUser && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="text-amber-500 w-5 h-5" /> Biblioteca de Assets
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Carga imagenes, videos, PDF y documentos para usarlos dentro de la polla.</p>
                    </div>
                    <label className={`px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-sm ${assetUploadBusy ? "bg-slate-400 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"}`}>
                      <Upload className="w-4 h-4" />
                      {assetUploadBusy ? "Cargando..." : "Cargar archivo"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        disabled={assetUploadBusy}
                        onChange={handleUploadAsset}
                      />
                    </label>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-600 dark:text-slate-400">
                    Los archivos se guardan físicamente en <strong>assets/assets</strong> y quedan registrados en la base actual <strong>db_store.json</strong>. La URL pública sirve para referenciarlos desde reglas, comunicados o futuras secciones.
                  </div>

                  {uploadedAssets.length === 0 ? (
                    <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl py-12 text-center text-sm text-slate-500">
                      No hay assets registrados todavia.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {uploadedAssets.map((asset) => (
                        <div key={asset.id} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
                          <div className="h-36 bg-slate-100 dark:bg-slate-950 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                            {asset.type === "image" ? (
                              <img src={asset.url} alt={asset.originalName} className="w-full h-full object-contain" />
                            ) : asset.type === "video" ? (
                              <video src={asset.url} className="w-full h-full object-contain" controls />
                            ) : (
                              <div className="flex flex-col items-center gap-2 text-slate-500">
                                {getAssetIcon(asset)}
                                <span className="font-bold uppercase text-[10px]">{asset.type}</span>
                              </div>
                            )}
                          </div>

                          <div className="p-3 space-y-3">
                            <div>
                              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                                {getAssetIcon(asset)}
                                <span className="truncate" title={asset.originalName}>{asset.originalName}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">{asset.url}</p>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500">
                              <span>{formatAssetSize(asset.size)}</span>
                              <span>{asset.storageProvider === "cloudinary" ? "Cloudinary" : "Local"} · {new Date(asset.uploadedAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={asset.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> Abrir
                              </a>
                              <a
                                href={asset.url}
                                download={asset.originalName}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold"
                                title="Descargar"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                              <button
                                type="button"
                                onClick={() => copyTextToClipboard(asset.url)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-xs font-bold"
                                title="Copiar URL"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "admin-banners" && isSuperAdminUser && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Megaphone className="text-amber-500 w-5 h-5" /> Banners de Pauta
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Crea espacios publicitarios para patrocinadores. Usa URLs de imagen de Cloudinary desde la Biblioteca de Assets.</p>
                  </div>

                  <form onSubmit={handleSaveBanner} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Titulo del banner</label>
                        <input className="w-full bg-white dark:bg-slate-900 border rounded p-2" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} required placeholder="Ej. Promo Mundialista" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Anunciante</label>
                        <input className="w-full bg-white dark:bg-slate-900 border rounded p-2" value={bannerForm.sponsorName} onChange={(e) => setBannerForm({ ...bannerForm, sponsorName: e.target.value })} required placeholder="Nombre de la marca" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">URL de imagen</label>
                        <div className="flex gap-2">
                          <input className="w-full bg-white dark:bg-slate-900 border rounded p-2 font-mono" value={bannerForm.imageUrl} onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })} required placeholder="https://res.cloudinary.com/..." />
                          <button type="button" onClick={() => bannerForm.imageUrl && copyTextToClipboard(bannerForm.imageUrl)} className="px-3 py-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200" title="Copiar URL">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        {imageAssets.length > 0 && (
                          <select
                            className="mt-2 w-full bg-white dark:bg-slate-900 border rounded p-2 text-[11px]"
                            value=""
                            onChange={(e) => {
                              const selected = imageAssets.find((asset) => asset.id === e.target.value);
                              if (selected) setBannerForm({ ...bannerForm, imageUrl: selected.url });
                            }}
                          >
                            <option value="">Usar imagen ya subida...</option>
                            {imageAssets.map((asset) => (
                              <option key={asset.id} value={asset.id}>{asset.originalName} - {asset.storageProvider === "cloudinary" ? "Cloudinary" : "Local"}</option>
                            ))}
                          </select>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Link destino</label>
                        <input className="w-full bg-white dark:bg-slate-900 border rounded p-2 font-mono" value={bannerForm.linkUrl} onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })} placeholder="https://marca.com" />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Ubicacion</label>
                        <select className="w-full bg-white dark:bg-slate-900 border rounded p-2" value={bannerForm.placement} onChange={(e) => setBannerForm({ ...bannerForm, placement: e.target.value as SponsorBanner["placement"] })}>
                          <option value="home_top">Superior principal</option>
                          <option value="sidebar">Lateral</option>
                          <option value="rules">Reglas y premiaciones</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Rotacion</label>
                        <select className="w-full bg-white dark:bg-slate-900 border rounded p-2" value={bannerForm.rotationSeconds} onChange={(e) => setBannerForm({ ...bannerForm, rotationSeconds: Number(e.target.value) as 5 | 10 })}>
                          <option value={5}>Cada 5 segundos</option>
                          <option value={10}>Cada 10 segundos</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Inicio opcional</label>
                        <input type="datetime-local" className="w-full bg-white dark:bg-slate-900 border rounded p-2" value={bannerForm.startsAt} onChange={(e) => setBannerForm({ ...bannerForm, startsAt: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Fin opcional</label>
                        <input type="datetime-local" className="w-full bg-white dark:bg-slate-900 border rounded p-2" value={bannerForm.endsAt} onChange={(e) => setBannerForm({ ...bannerForm, endsAt: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <label className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-300">
                        <input type="checkbox" checked={bannerForm.active} onChange={(e) => setBannerForm({ ...bannerForm, active: e.target.checked })} />
                        Activo
                      </label>
                      <div className="flex gap-2">
                        {editingBannerId && <button type="button" onClick={resetBannerForm} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">Cancelar</button>}
                        <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" /> {editingBannerId ? "Actualizar banner" : "Crear banner"}
                        </button>
                      </div>
                    </div>
                  </form>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adminBanners.length === 0 ? (
                      <div className="md:col-span-2 border border-dashed rounded-xl p-8 text-center text-sm text-slate-500">Todavia no hay banners creados.</div>
                    ) : adminBanners.map((banner) => (
                      <div key={banner.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                        {renderSponsorBanner(banner)}
                        <div className="p-3 text-xs space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-bold text-slate-900 dark:text-slate-100">{banner.sponsorName}</p>
                              <p className="text-[10px] text-slate-500">{banner.placement} · {banner.active ? "Activo" : "Inactivo"} · {banner.rotationSeconds || 5}s</p>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleEditBanner(banner)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800" title="Editar">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => handleDeleteBanner(banner.id)} className="p-2 rounded-lg bg-rose-50 text-rose-700" title="Eliminar">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "admin-config" && isSuperAdminUser && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Settings className="text-amber-500 w-5 h-5" /> Configuración de Políticas del Torneo
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Personaliza el nombre, descripciones, zona horaria base, mensaje de bienvenida y habilitación de notificaciones</p>
                  </div>

                  <section className="rounded-2xl border border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/10 p-4 md:p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-amber-700 dark:text-amber-300">
                          <Mail className="w-4 h-4" />
                          Vista previa, sin envio
                        </span>
                        <h3 className="text-lg font-black text-slate-950 dark:text-white mt-1">Correo final para los tres ganadores</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          Simula el mensaje que recibiria cada ganador cuando el ranking final sea validado.
                        </p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-white dark:bg-slate-950 dark:border-amber-900 px-3 py-2 text-[10px] font-bold text-amber-800 dark:text-amber-200">
                        Esta pantalla no envia correos
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {([1, 2, 3] as const).map((position) => (
                        <button
                          key={position}
                          type="button"
                          onClick={() => setWinnerEmailPreviewPosition(position)}
                          className={`min-h-11 rounded-xl border px-2 text-xs font-black transition-colors ${
                            winnerEmailPreviewPosition === position
                              ? "bg-slate-950 border-slate-950 text-amber-300 dark:bg-amber-300 dark:border-amber-300 dark:text-slate-950"
                              : "bg-white border-slate-200 text-slate-600 hover:border-amber-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {getWinnerPlaceLabel(position)}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                      <label className="block">
                        <span className="block text-[10px] uppercase tracking-wider font-black text-slate-500 dark:text-slate-400 mb-1.5">
                          Poster para el {getWinnerPlaceLabel(winnerEmailPreviewPosition)}
                        </span>
                        <select
                          value={winnerEmailPosterByPosition[winnerEmailPreviewPosition]}
                          onChange={(event) => setWinnerEmailPosterByPosition((current) => ({
                            ...current,
                            [winnerEmailPreviewPosition]: event.target.value
                          }))}
                          className="w-full min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-slate-900 dark:border-slate-700"
                        >
                          <option value="">Selecciona una imagen de Assets</option>
                          {uploadedAssets.filter((asset) => asset.type === "image").map((asset) => (
                            <option key={asset.id} value={asset.url}>{asset.originalName}</option>
                          ))}
                        </select>
                        <span className="block text-[10px] text-slate-500 mt-1">
                          Sube primero el poster en Assets. Puedes elegir una imagen diferente para cada puesto.
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => void handleSendWinnerEmail(winnerEmailPreviewPosition)}
                        disabled={
                          !certificatesEnabled ||
                          !winnerEmailPreviewRanking ||
                          !winnerEmailPosterByPosition[winnerEmailPreviewPosition] ||
                          winnerEmailSendingPosition !== null
                        }
                        className="min-h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center justify-center gap-2"
                        title={!certificatesEnabled ? "Disponible cuando la final este cerrada y validada" : "Enviar correo real al ganador"}
                      >
                        <Mail className="w-4 h-4" />
                        {winnerEmailSendingPosition === winnerEmailPreviewPosition ? "Enviando..." : "Enviar al ganador"}
                      </button>
                    </div>

                    <div className="max-w-2xl mx-auto rounded-2xl bg-slate-100 dark:bg-slate-900 p-3 md:p-5 shadow-inner">
                      <div className="mb-3 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 p-3 text-xs space-y-1">
                        <p><strong>Para:</strong> {winnerEmailPreviewUser?.email || "correo registrado del ganador"}</p>
                        <p><strong>Asunto:</strong> Felicitaciones: ganaste el {getWinnerPlaceLabel(winnerEmailPreviewPosition)} en El Pollon Mundialista 2026</p>
                      </div>

                      <div className="overflow-hidden rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        <div className="bg-slate-950 text-white px-5 py-5 border-b-4 border-emerald-500">
                          <p className="text-[10px] uppercase tracking-widest font-black text-emerald-300">El Pollon Mundialista FIFA 2026</p>
                          <h4 className="text-xl md:text-2xl font-black mt-2">Eres uno de nuestros ganadores</h4>
                        </div>
                        <div className="p-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 space-y-4">
                          <p>Hola <strong className="text-slate-950 dark:text-white">{winnerEmailPreviewName}</strong>,</p>
                          <p>
                            Finalizo el Mundial y, despues de calcular los resultados y validar el ranking de participantes pagos,
                            ocupaste el <strong>{getWinnerPlaceLabel(winnerEmailPreviewPosition)}</strong> de El Pollon Mundialista 2026.
                          </p>

                          {winnerEmailPosterByPosition[winnerEmailPreviewPosition] ? (
                            <img
                              src={winnerEmailPosterByPosition[winnerEmailPreviewPosition]}
                              alt={`Poster del ${getWinnerPlaceLabel(winnerEmailPreviewPosition)}`}
                              className="block w-full h-auto rounded-xl border border-slate-200 dark:border-slate-800"
                            />
                          ) : (
                            <div className="min-h-40 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center p-5 text-slate-400">
                              <ImageIcon className="w-8 h-8 mb-2" />
                              <p className="text-xs font-bold">El poster seleccionado aparecera aqui y dentro del correo.</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900 p-3">
                              <span className="block text-[9px] uppercase font-black text-emerald-700 dark:text-emerald-300">Premio asignado</span>
                              <strong className="block text-xl text-emerald-800 dark:text-emerald-200 mt-1">{formatCop(winnerEmailPreviewPrize)}</strong>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800 p-3">
                              <span className="block text-[9px] uppercase font-black text-slate-500">Puntaje final</span>
                              <strong className="block text-xl text-slate-950 dark:text-white mt-1">{winnerEmailPreviewRanking?.points ?? 0} pts</strong>
                            </div>
                          </div>

                          <p>
                            Para gestionar la entrega, responde a este correo con tu certificado de ganador, documento de identidad
                            y certificacion bancaria. El premio se entregara despues de verificar tu identidad, los datos bancarios y el ranking final.
                          </p>
                          <p className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3 text-xs text-amber-900 dark:text-amber-200">
                            No envies contrasenas, claves bancarias ni datos de tarjetas. El equipo de El Pollon Mundialista nunca solicitara esa informacion.
                          </p>
                          <div>
                            <span className="inline-flex min-h-11 items-center rounded-lg bg-emerald-600 px-4 text-white font-black">
                              Ver ranking y certificado
                            </span>
                          </div>
                        </div>
                        <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400">
                          Recibes este correo por tu participacion en El Pollon Mundialista FIFA 2026.
                        </div>
                      </div>
                    </div>
                  </section>

                  {torneo && (
                    <form onSubmit={handleSaveTorneoPreferences} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nombre Oficial del Torneo</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-white border rounded p-1.5"
                            value={torneo.title}
                            onChange={(e) => setTorneo({ ...torneo, title: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Zona Horaria Base</label>
                          <select
                            className="w-full bg-white border rounded p-1.5"
                            value={torneo.timezone}
                            onChange={(e) => setTorneo({ ...torneo, timezone: e.target.value })}
                          >
                            <option value="Bogotá (UTC-5)">América/Bogotá (UTC-5)</option>
                            <option value="México Local (UTC-6)">América/Mexico_City (UTC-6)</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Descripción del Torneo</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-white border rounded p-1.5"
                            value={torneo.description}
                            onChange={(e) => setTorneo({ ...torneo, description: e.target.value })}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Mensaje de Bienvenida (Registro éxitos)</label>
                          <textarea
                            rows={2}
                            className="w-full bg-white border rounded p-1.5"
                            value={torneo.welcomeMessage}
                            onChange={(e) => setTorneo({ ...torneo, welcomeMessage: e.target.value })}
                          />
                        </div>

                        <div className="md:col-span-2 rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 space-y-3">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                              <h3 className="text-xs font-black text-emerald-900">Popup administrable</h3>
                              <p className="text-[11px] text-emerald-800/80">Muestra un aviso modal a los usuarios cuando publiques un mensaje nuevo.</p>
                            </div>
                            <label className="min-h-11 flex items-center gap-2 text-xs font-bold text-emerald-900">
                              <input type="checkbox" checked={Boolean(torneo.popupEnabled)} onChange={(e) => setTorneo({ ...torneo, popupEnabled: e.target.checked })} />
                              Activo
                            </label>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input type="text" className="w-full bg-white border rounded p-2" placeholder="Titulo del popup" value={torneo.popupTitle || ""} onChange={(e) => setTorneo({ ...torneo, popupTitle: e.target.value })} />
                            <input type="text" className="w-full bg-white border rounded p-2" placeholder="Texto del boton" value={torneo.popupCtaLabel || ""} onChange={(e) => setTorneo({ ...torneo, popupCtaLabel: e.target.value })} />
                            <select className="w-full bg-white border rounded p-2" value={torneo.popupCtaTab || "rules-prizes"} onChange={(e) => setTorneo({ ...torneo, popupCtaTab: e.target.value })}>
                              <option value="dashboard">Resumen</option>
                              <option value="predictions">Mis Pronósticos</option>
                              <option value="participate">Partidos</option>
                              <option value="ranking">Clasificacion</option>
                              <option value="rules-prizes">Premios</option>
                            </select>
                            <textarea
                              rows={4}
                              className="md:col-span-2 w-full bg-white border rounded p-2 font-mono text-[11px]"
                              placeholder="Mensaje del popup. Puedes usar **negrilla** y saltos de linea."
                              value={torneo.popupMessage || ""}
                              onChange={(e) => setTorneo({ ...torneo, popupMessage: e.target.value })}
                            />
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-[1fr_120px] gap-3 items-start">
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-emerald-900 mb-1">Imagen desde biblioteca</label>
                                <select
                                  className="w-full min-h-11 bg-white border rounded p-2"
                                  value={torneo.popupImageUrl || ""}
                                  onChange={(e) => setTorneo({ ...torneo, popupImageUrl: e.target.value })}
                                >
                                  <option value="">Sin imagen</option>
                                  {imageAssets.map((asset) => (
                                    <option key={asset.id} value={asset.url}>{asset.originalName}</option>
                                  ))}
                                </select>
                                <p className="text-[10px] text-emerald-800/70 mt-1">Sube imagenes en Assets y luego seleccionalas aqui.</p>
                              </div>
                              {torneo.popupImageUrl && (
                                <div className="aspect-[4/5] sm:aspect-video rounded-xl overflow-hidden border bg-white">
                                  <img src={torneo.popupImageUrl} alt="Preview popup" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Texto Libro de Premiaciones</label>
                          <textarea
                            rows={3}
                            className="w-full bg-white border rounded p-1.5 font-mono text-[11px]"
                            value={torneo.prizesText}
                            onChange={(e) => setTorneo({ ...torneo, prizesText: e.target.value })}
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Puedes usar **negrilla** para resaltar nombres, porcentajes o premios.
                          </span>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Instrucciones Básicas de Reglas</label>
                          <textarea
                            rows={3}
                            className="w-full bg-white border rounded p-1.5 font-mono text-[11px]"
                            value={torneo.rulesText}
                            onChange={(e) => setTorneo({ ...torneo, rulesText: e.target.value })}
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Tambien soporta **negrilla** y saltos de linea para mejorar lectura.
                          </span>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                            URL Imagen Reglamento Gráfico (Flyer de Reglas)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="w-full bg-white border rounded p-1.5 font-mono text-[11px]"
                              placeholder="/src/assets/images/polla_rules_flyer_1780082976931.png"
                              value={torneo.rulesImageUrl || ""}
                              onChange={(e) => setTorneo({ ...torneo, rulesImageUrl: e.target.value })}
                            />
                            {torneo.rulesImageUrl && (
                              <a
                                href={torneo.rulesImageUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center justify-center border"
                              >
                                Ver
                              </a>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Permite a tus participantes descargar este folleto físico/gráfico para enterarse de las reglas en WhatsApp.
                          </span>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                            URL Imagen Reglamento Grafico en Ingles
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className="w-full bg-white border rounded p-1.5 font-mono text-[11px]"
                              placeholder="https://res.cloudinary.com/.../rules_en.png"
                              value={torneo.rulesImageUrlEn || ""}
                              onChange={(e) => setTorneo({ ...torneo, rulesImageUrlEn: e.target.value })}
                            />
                            {torneo.rulesImageUrlEn && (
                              <a
                                href={torneo.rulesImageUrlEn}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center justify-center border"
                              >
                                Ver
                              </a>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Sube el poster en ingles desde Assets, copia su URL de Cloudinary y pegala aqui. Se usara automaticamente cuando el idioma sea English.
                          </span>
                          {torneo.rulesImageUrlEn && (
                            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">
                                  Preview flyer ingles
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveTab("rules-prizes");
                                    setRulesFlyerPreviewLang("en");
                                  }}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                                >
                                  Previsualizar en reglas
                                </button>
                              </div>
                              <div className="max-w-[180px] aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                <img
                                  src={torneo.rulesImageUrlEn}
                                  alt="Preview flyer ingles"
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  onError={(e) => {
                                    e.currentTarget.src = "/src/assets/images/polla_rules_en_1780083217819.png";
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl space-y-3 mt-4 border">
                        <h3 className="font-bold text-[10px] uppercase text-slate-600 block">Canales & Notificaciones Habilitados</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="not_remind_ch"
                              checked={torneo.notificationConfig.reminders}
                              onChange={(e) => setTorneo({
                                ...torneo,
                                notificationConfig: { ...torneo.notificationConfig, reminders: e.target.checked }
                              })}
                            />
                            <label htmlFor="not_remind_ch">Alerta de predicción faltante (30 min antes)</label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="not_results_ch"
                              checked={torneo.notificationConfig.results}
                              onChange={(e) => setTorneo({
                                ...torneo,
                                notificationConfig: { ...torneo.notificationConfig, results: e.target.checked }
                              })}
                            />
                            <label htmlFor="not_results_ch">Alertas de resultados publicados</label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="not_ranking_ch"
                              checked={torneo.notificationConfig.rankingChanges}
                              onChange={(e) => setTorneo({
                                ...torneo,
                                notificationConfig: { ...torneo.notificationConfig, rankingChanges: e.target.checked }
                              })}
                            />
                            <label htmlFor="not_ranking_ch">Alertas de subidas/bajadas en el Ranking general</label>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="not_com_ch"
                              checked={torneo.notificationConfig.announcements}
                              onChange={(e) => setTorneo({
                                ...torneo,
                                notificationConfig: { ...torneo.notificationConfig, announcements: e.target.checked }
                              })}
                            />
                            <label htmlFor="not_com_ch">Notificar comunicados como alertas de panel</label>
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="allow_pub"
                              checked={torneo.allowPublicRegistration}
                              onChange={(e) => setTorneo({ ...torneo, allowPublicRegistration: e.target.checked })}
                            />
                            <label htmlFor="allow_pub" className="font-bold text-slate-800">Habilitar registro público de nuevos participantes estándar en la home</label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-2">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                        >
                          Guardar Políticas Globales
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Cargar Resultados Oficiales */}
                  <AdminTournamentOutcomes
                    currentOutcomes={tournamentOutcomes}
                    onSave={handleSaveTournamentOutcomes}
                  />

                  {/* Danger zone to reset tournament simulation results manually */}
                  <div className="mt-8 border border-rose-100 bg-rose-50/20 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-rose-50 text-rose-600 shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-950">Reiniciar polla</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Limpia resultados, predicciones, puntajes, notificaciones y saldos del premio acumulado para volver a iniciar la competencia desde cero.
                        </p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          No elimina usuarios, empresas ni configuraciones de pasarela. Los jugadores estandar vuelven a pago pendiente para que la bolsa acumulada quede en cero.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-rose-100">
                      <button
                        type="button"
                        onClick={handleResetTournament}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Reiniciar polla y saldos en cero
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </section>
          </>
        )}
      </main>

      {!currentUser && authMode === "register" && showAuthAvatarModal && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-950/60 px-4 py-4"
          onClick={() => setShowAuthAvatarModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">{authT("auth_choose_avatar")}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Elige cómo quieres aparecer en el ranking.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuthAvatarModal(false)}
                className="w-11 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-500"
                aria-label="Cerrar selector de avatar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                {AVATARS.map((av, idx) => {
                  const selected = authAvatar === av;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAuthAvatar(av);
                        setShowAuthAvatarModal(false);
                      }}
                      className={`relative rounded-full overflow-hidden border-2 transition-all p-0.5 ${selected ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 scale-105" : "border-slate-200 dark:border-slate-800 hover:border-emerald-300"}`}
                      aria-label={`Seleccionar avatar ${idx + 1}`}
                    >
                      <img src={av} alt={`Avatar ${idx + 1}`} className="w-full aspect-square object-cover rounded-full" referrerPolicy="no-referrer" />
                      {selected && (
                        <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white dark:border-slate-950">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {!currentUser && authMode === "register" && showPrivacyNoticeModal && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-950/60 px-4 py-4"
          onClick={() => setShowPrivacyNoticeModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-950 dark:text-white">Aviso de Privacidad</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">El Pollón Mundialista - M&P Enterprise Marketing y Publicidad SAS</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyNoticeModal(false)}
                className="w-11 h-11 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 flex items-center justify-center text-slate-500"
                aria-label="Cerrar aviso de privacidad"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-[55vh] overflow-y-auto space-y-4">
              {privacyNoticeSections.map((section) => (
                <section key={section.title} className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-slate-900 dark:text-slate-100">{section.title}</h4>
                  <p>{section.body}</p>
                </section>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyNoticeModal(false)}
                className="min-h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthPrivacyAccepted(true);
                  setShowPrivacyNoticeModal(false);
                }}
                className="min-h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black"
              >
                Aceptar aviso
              </button>
            </div>
          </div>
        </div>
      )}

      {groupPoolModalOpen && groupPoolStatus.status === "pending" && (
        <div
          className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-slate-950/70 px-3 py-3 sm:px-4 sm:py-6"
          role="presentation"
          onMouseDown={() => setGroupPoolModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl sm:rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-pool-request-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3">
              <span className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </span>
              <div>
                <h3 id="group-pool-request-title" className="text-base font-black text-slate-950 dark:text-white">
                  SE HA RECIBIDO TU SOLICITUD
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Polla Grupal: {groupPoolStatus.company?.name}
                </p>
              </div>
            </div>
            <div className="p-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Estamos configurando el acceso gratuito de tu grupo. Revisa nuevamente en 5 minutos el panel de administrador grupal.
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setGroupPoolModalOpen(false)}
                className="min-h-12 px-5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {managedPopupOpen && hasManagedPopupContent(torneo) && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-950/70 px-3 py-3 sm:px-4 sm:py-6"
          onMouseDown={closeManagedPopup}
          role="presentation"
        >
          <div
            className="w-full max-w-lg max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="managed-popup-title"
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 id="managed-popup-title" className="text-base font-black text-slate-950 dark:text-white">{torneo.popupTitle || "Aviso importante"}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Comunicado oficial de la polla</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeManagedPopup}
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0"
                aria-label="Cerrar popup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              {torneo.popupImageUrl && (
                <div className="px-4 sm:px-5 pt-4 sm:pt-5">
                  <div className="aspect-[4/5] sm:aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                    <img src={torneo.popupImageUrl} alt={torneo.popupTitle || "Imagen del aviso"} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {torneo?.popupMessage?.trim() && (
                <div className="p-4 sm:p-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                  {renderFormattedText(torneo.popupMessage, "")}
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2 sm:justify-end shrink-0">
              <button
                type="button"
                onClick={closeManagedPopup}
                className="min-h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm font-bold text-slate-700 dark:text-slate-200"
              >
                Entendido
              </button>
              {torneo.popupCtaLabel && torneo.popupCtaTab && (
                <button
                  type="button"
                  onClick={handleManagedPopupCta}
                  className="min-h-12 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black"
                >
                  {torneo.popupCtaLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {onboardingOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-950/70 px-3 py-3 sm:px-4 sm:py-6"
          onMouseDown={() => setOnboardingOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-2xl max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-title"
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </span>
                <div>
                  <h3 id="onboarding-title" className="text-base font-black text-slate-950 dark:text-white">Cómo se juega El Pollón</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Guía rápida para empezar sin perderse</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOnboardingOpen(false)}
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0"
                aria-label="Cerrar guia"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: UserPlus, title: "1. Crea tu cuenta", text: "Regístrate con nombre, correo, país y avatar. Si vienes por una empresa, entra desde el enlace de invitación." },
                  { icon: CreditCard, title: "2. Activa tu acceso", text: "Los usuarios pagos participan por premios en dinero. Los invitados de empresa participan en su ranking empresarial." },
                  { icon: Calendar, title: "3. Pronostica partidos", text: "En Mis Pronósticos escribe el marcador antes del cierre. Cada partido se bloquea 5 minutos antes de empezar." },
                  { icon: Trophy, title: "4. Elige favoritos", text: "Marca campeón, subcampeón, finalistas, clasificados y ganadores de grupo. Los usuarios free pueden ver, pero no guardar." },
                  { icon: BarChart3, title: "5. Sigue el ranking", text: "Cada resultado recalcula puntos, posiciones, aciertos exactos y avance dentro de la tabla." },
                  { icon: Award, title: "6. Revisa premios", text: "Consulta reglas, bolsa acumulada, premiaciones de empresa y condiciones de entrega." }
                ].map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
                      <div className="flex items-start gap-3">
                        <span className="w-9 h-9 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                          <Icon className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-slate-950 dark:text-white">{step.title}</h4>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{step.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/20 p-3 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-black">Mensaje corto para compartir:</p>
                <p className="mt-1 leading-relaxed">Entra, regístrate, paga o usa tu invitación de empresa, luego ve a Mis Pronósticos para poner marcadores y favoritos del torneo antes de que cierren.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:flex sm:justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => { setOnboardingOpen(false); setActiveTab("rules-prizes"); }}
                className="min-h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-black text-slate-700 dark:text-slate-200"
              >
                Ver reglas
              </button>
              <button
                type="button"
                onClick={() => { setOnboardingOpen(false); setActiveTab("participate"); }}
                className="min-h-11 px-4 rounded-xl border border-amber-200 bg-amber-50 text-xs font-black text-amber-800"
              >
                Pagar / acceso
              </button>
              <button
                type="button"
                onClick={() => { setOnboardingOpen(false); setActiveTab("predictions"); setPredictionsMode("favorites"); }}
                className="min-h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black"
              >
                Ir a favoritos
              </button>
            </div>
          </div>
        </div>
      )}

      {aboutPollonOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-950/70 px-3 py-3 sm:px-4 sm:py-6"
          onMouseDown={() => setAboutPollonOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-lg max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-pollon-title"
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </span>
                <div>
                  <h3 id="about-pollon-title" className="text-base font-black text-slate-950 dark:text-white">¿Qué es El Pollón Mundialista?</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Un juego social de pronósticos del Mundial 2026</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAboutPollonOpen(false)}
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0"
                aria-label="Cerrar información sobre El Pollón Mundialista"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 overflow-y-auto">
              <p>
                El Pollón Mundialista es la versión mundialista de ese juego social que se arma entre amigos, familia, oficina o comunidad para intentar adivinar o predecir los resultados de los partidos.
              </p>
              <p>
                En Colombia muchos le dicen polla; en México se conoce como quiniela; en Argentina suele llamarse prode; en España también se habla de porra; en Bolivia se le dice vaquita; y en otros países cambia el nombre, pero la emoción es la misma: elegir marcadores, seguir cada gol y ver cómo se mueve la tabla.
              </p>
              <p>
                Para el Mundial 2026, El Pollón Mundialista convierte esa tradición en una experiencia digital: registras tus pronósticos antes de cada partido, sumas puntos por participar, acertar resultados o clavar marcadores exactos, y compites en un ranking en vivo.
              </p>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                No se trata solo de fútbol: se trata de conversar, celebrar, sufrir cada minuto y demostrar quién tiene mejor intuición mundialista.
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setAboutPollonOpen(false)}
                className="min-h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {faqOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-950/70 px-3 py-3 sm:px-4 sm:py-6"
          onMouseDown={() => setFaqOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-2xl max-h-[calc(100dvh-24px)] sm:max-h-[calc(100dvh-48px)] rounded-t-2xl sm:rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="faq-title"
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 shrink-0">
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </span>
                <div>
                  <h3 id="faq-title" className="text-base font-black text-slate-950 dark:text-white">Preguntas frecuentes</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Participación, pagos, empresas, premios y soporte</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFaqOpen(false)}
                className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0"
                aria-label="Cerrar preguntas frecuentes"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 overflow-y-auto">
              {faqItems.map((item, index) => (
                <section key={item.question} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3">
                  <h4 className="text-xs font-black text-slate-950 dark:text-slate-100">
                    {index + 1}. {item.question}
                  </h4>
                  <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300">{item.answer}</p>
                </section>
              ))}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setFaqOpen(false)}
                className="min-h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <MatchResultsTicker matches={matches} getTeamFlag={getTeamFlag} />

      {/* Football-inspired high contrast informational footer line */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center border-t border-slate-800 shrink-0 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-mono text-emerald-400 font-bold tracking-widest text-[11px] uppercase">
            ⚽ Polla Mundialista FIFA 2026 • Bogotá UTC-5 Base
          </p>
          <p className="text-slate-500 text-[11px]">
            Diseñada para gestionar pronósticos con cierre automático de postulaciones 5 minutos antes de cada partido.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setAboutPollonOpen(true)}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              ¿Qué es El Pollón Mundialista?
            </button>
            <button
              type="button"
              onClick={() => setFaqOpen(true)}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Preguntas frecuentes
            </button>
          </div>
          <p className="text-slate-400 text-[11px]">
            ¿Dudas? Contáctanos a través de{" "}
            <a href="mailto:admin@elpollonmundialista.com" className="font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
              admin@elpollonmundialista.com
            </a>
          </p>
        </div>
      </footer>

    </div>
  );
}

