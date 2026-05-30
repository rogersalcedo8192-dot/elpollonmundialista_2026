import React, { useState, useEffect, useRef } from "react";
import {
  Trophy,
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
  Copy
} from "lucide-react";
import { User, Match, Prediction, Ranking, Announcement, AppNotification, TorneoConfig, DashboardStats, TournamentPredictions, TournamentOutcomes, UploadedAsset, SponsorBanner } from "./types";
import { TournamentPredictionsView } from "./components/TournamentPredictionsView";
import { AdminTournamentOutcomes } from "./components/AdminTournamentOutcomes";

const AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120"
];

const STAGES = [
  "Todos",
  "Grupo A", "Grupo B", "Grupo C", "Grupo D",
  "Grupo E", "Grupo F", "Grupo G", "Grupo H",
  "Grupo I", "Grupo J", "Grupo K", "Grupo L",
  "16avos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal", "Tercer Puesto", "Final"
];

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

export function getTeamFlag(teamName: string): React.ReactNode {
  if (!teamName) return <span className="select-none">🏳️</span>;
  const norm = teamName.trim();
  const code = FLAGS_CODE_MAP[norm];
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
    db_exact: "PLACAR EXATO (15 pts)",
    db_exact_hits: "acertos",
    db_exact_sub: "Palpites com placar exato",
    db_draw: "EMPATE CORRETO (10 pts)",
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
    db_exact: "SCORE EXACT (15 pts)",
    db_exact_hits: "exacts",
    db_exact_sub: "Scores exacts réussis",
    db_draw: "MATCH NUL REUSSI (10 pts)",
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
    return dict[key] || fallback || key;
  };

  const ui = (key: string, replacements: Record<string, string | number> = {}) => {
    const dict = UI_COPY_BY_LANG[lang] || UI_COPY_BY_LANG.es;
    let value = dict[key] || UI_COPY_BY_LANG.en[key] || key;
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

  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [rulesImageZoom, setRulesImageZoom] = useState(false);
  const [torneo, setTorneo] = useState<TorneoConfig | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sponsorBanners, setSponsorBanners] = useState<SponsorBanner[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Tournament Favorites states
  const [predictionsMode, setPredictionsMode] = useState<"matches" | "favorites">("matches");
  const [tournamentPredictions, setTournamentPredictions] = useState<TournamentPredictions | null>(null);
  const [tournamentOutcomes, setTournamentOutcomes] = useState<TournamentOutcomes | null>(null);

  // Authentication Fields
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authAvatar, setAuthAvatar] = useState(AVATARS[0]);
  const [authMode, setAuthMode] = useState<"login" | "register" | "recover">("login");
  const [showAuthPassword, setShowAuthPassword] = useState(false);
  const [showAuthConfirmPassword, setShowAuthConfirmPassword] = useState(false);
  
  // Forecast Forms
  const [predScores, setPredScores] = useState<Record<number, { local: number; visitor: number }>>({});
  
  // Filters
  const [selectedStage, setSelectedStage] = useState("Todos");
  const [matchStatusFilter, setMatchStatusFilter] = useState<"all" | "pending" | "finished">("all");
  const [teamSearch, setTeamSearch] = useState("");

  // Manage Profiles states
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [profileEmailSubscribed, setProfileEmailSubscribed] = useState(true);
  const [profileNewPass, setProfileNewPass] = useState("");

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
  const [searchUser, setSearchUser] = useState("");
  const [selectedUserForPredictions, setSelectedUserForPredictions] = useState<User | null>(null);
  const [userPredictionsView, setUserPredictionsView] = useState<Prediction[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  // Admin Matches Create/Edit Info
  const [matchForm, setMatchForm] = useState<any>(null);

  // Admin Announcements
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "", urgent: false, publishAt: "" });

  // Notifications bell toggle
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);

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

  const passwordChecks = [
    { label: "Mínimo 8 caracteres", valid: authPassword.length >= 8 },
    { label: "Una mayúscula", valid: /[A-ZÁÉÍÓÚÑ]/.test(authPassword) },
    { label: "Una minúscula", valid: /[a-záéíóúñ]/.test(authPassword) },
    { label: "Un número", valid: /\d/.test(authPassword) },
    { label: "Las contraseñas coinciden", valid: authConfirmPassword.length > 0 && authPassword === authConfirmPassword }
  ];
  const isRegisterPasswordValid = passwordChecks.every((check) => check.valid);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail);

  const fetchGlobalData = async () => {
    try {
      const trRes = await fetch("/api/torneo");
      if (trRes.ok) setTorneo(await trRes.json());

      const mRes = await fetch("/api/matches");
      if (mRes.ok) {
        const matchesData: Match[] = await mRes.json();
        setMatches(matchesData);
      }

      const rRes = await fetch("/api/rankings");
      if (rRes.ok) setRankings(await rRes.json());

      const aRes = await fetch("/api/announcements");
      if (aRes.ok) setAnnouncements(await aRes.json());

      const bRes = await fetch("/api/banners");
      if (bRes.ok) setSponsorBanners(await bRes.json());

      const toRes = await fetch("/api/tournament-outcomes");
      if (toRes.ok) setTournamentOutcomes(await toRes.json());
    } catch (err) {
      console.error("Error loading static global datas:", err);
    }
  };

  const fetchUserSpecificData = async () => {
    if (!currentUser) return;
    try {
      const pRes = await fetch(`/api/predictions?userId=${currentUser.id}`, { headers: getHeaders() });
      if (pRes.ok) {
        const pList: Prediction[] = await pRes.json();
        setPredictions(pList);
        const map: Record<number, { local: number; visitor: number }> = {};
        pList.forEach((p) => {
          map[p.matchId] = { local: p.localScore, visitor: p.visitorScore };
        });
        setPredScores(map);
      }

      const nRes = await fetch(`/api/notifications/${currentUser.id}`, { headers: getHeaders() });
      if (nRes.ok) {
        setNotifications(await nRes.json());
      }

      const tpRes = await fetch(`/api/tournament-predictions?userId=${currentUser.id}`, { headers: getHeaders() });
      if (tpRes.ok) {
        setTournamentPredictions(await tpRes.json());
      }

      // Check if Admin to render dynamic reports
      if (currentUser.role === "admin") {
        fetchAdminStats();
        fetchAdminUsers();
        fetchAdminAssets();
        fetchAdminBanners();
      }
    } catch (err) {
      console.error("Error loading user explicit data:", err);
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
    fetchGlobalData();
    syncCurrentUserProfile();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUserSpecificData();
      setProfileName(currentUser.name);
      setProfileAvatar(currentUser.avatar);
      setProfileEmailSubscribed(currentUser.emailSubscribed || false);
    } else {
      setPredictions([]);
      setNotifications([]);
      setStats(null);
      setAdminUsers([]);
      setUploadedAssets([]);
      setAdminBanners([]);
    }
  }, [currentUser]);

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
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
          name: authName,
          avatar: authAvatar
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error de registro");

      localStorage.setItem("polla_user_session", JSON.stringify(data.user));
      setCurrentUser(data.user);
      showToast(`¡Tu cuenta ha sido creada y registrada! Bienvenido, ${data.user.name}.`, "success");
      setAuthPassword("");
      setAuthConfirmPassword("");
      setAuthEmail("");
      setAuthName("");
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
    setActiveTab("dashboard");
    showToast("Sesión cerrada correctamente", "info");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reqPayload: any = {
        name: profileName,
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
    const score = predScores[matchId];
    if (!score) {
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
    const rRes = await fetch("/api/rankings");
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

  // ADMIN ACTION: RESET TOURNAMENT TO REAL INITIAL PRE-TOURNAMENT STATE
  const handleResetTournament = async () => {
    if (!window.confirm("¿Estás seguro de que deseas REINICIAR el Torneo al Estado Inicial Real (Pre-Mundial)? esto borrará todos los resultados de demostración, simulaciones, y predicciones de los usuarios para comenzar la competencia oficial real en ceros. Esta acción es irreversible.")) {
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

  // ADMIN ACTION: EXPORT DATA TO CSV
  const handleExportRankingCSV = () => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Posicion,Nombre,Puntos,Exactos(15pts),Empates(10pts),Partidos Predichos\n";
      rankings.forEach((r) => {
        csvContent += `${r.position},"${r.userName}",${r.points},${r.exactCount},${r.drawCount},${r.predictCount}\n`;
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
      fetchGlobalData();
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
      fetchGlobalData();
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
    if (!confirm("Â¿Desea eliminar este archivo de la biblioteca?")) return;
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
    if (!confirm("Desea eliminar este banner publicitario?")) return;
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
        <img src={banner.imageUrl} alt={banner.title} className="w-full h-28 md:h-36 object-cover opacity-95 group-hover:opacity-100 transition-opacity" />
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

  // Checks block 15 mins before kick-off
  const isMatchPredictionLocked = (match: Match) => {
    if (match.status !== "pending") return true;
    const matchTime = new Date(match.date).getTime();
    const lockTime = matchTime - 15 * 60 * 1000;
    return Date.now() > lockTime;
  };

  const getMatchTimeRemainingLabel = (match: Match) => {
    const matchTime = new Date(match.date).getTime();
    const diff = matchTime - Date.now();
    if (diff < 0) {
      return match.status === "finished" ? ui("finished") : ui("live_locked");
    }
    const diffMinutes = Math.floor(diff / 60000);
    if (diffMinutes < 15) return `🔒 ${ui("locked")}`;
    if (diffMinutes < 60) return ui("closes_in_min", { value: diffMinutes });
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return ui("closes_in_hours", { value: diffHours });
    return ui("closes_in_days", { value: Math.floor(diffHours / 24) });
  };

  // Filtered lists
  const filteredMatches = matches.filter((m) => {
    const stageMatch = selectedStage === "Todos" || m.stage === selectedStage;
    const statusMatch =
      matchStatusFilter === "all" ||
      (matchStatusFilter === "pending" && m.status === "pending") ||
      (matchStatusFilter === "finished" && m.status === "finished");
    const searchText = teamSearch.toLowerCase();
    const contentMatch =
      m.local.toLowerCase().includes(searchText) ||
      m.visitor.toLowerCase().includes(searchText) ||
      getTeamDisplayName(m.local, lang).toLowerCase().includes(searchText) ||
      getTeamDisplayName(m.visitor, lang).toLowerCase().includes(searchText) ||
      getStageLabel(m.stage).toLowerCase().includes(searchText) ||
      m.stadium.toLowerCase().includes(searchText) ||
      m.stage.toLowerCase().includes(searchText);
    return stageMatch && statusMatch && contentMatch;
  });

  const unreadNotifications = notifications.filter((n) => !n.read);
  const topBanners = sponsorBanners.filter((banner) => banner.placement === "home_top");
  const sidebarBanners = sponsorBanners.filter((banner) => banner.placement === "sidebar");
  const rulesBanners = sponsorBanners.filter((banner) => banner.placement === "rules");

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
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-inner border border-emerald-400">
              <Trophy className="w-6 h-6 text-amber-300" id="header_trophy_icon" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                {lang === "es" ? (torneo?.title || "Polla Mundialista 2026") : "World Cup Bracket 2026"}
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-normal hidden sm:inline">
                  Mundial FIFA 2026
                </span>
              </h1>
              <p className="text-[11px] md:text-xs text-slate-400 truncate max-w-[280px] md:max-w-md">
                {lang === "es" ? (torneo?.description || "Visualiza estadísticas, registra tus marcadores y gana puntos.") : "Track statistics, log predictions, and win points."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Language Selector (10 Languages) */}
            <div className="relative flex items-center shrink-0">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as any)}
                className="appearance-none bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 transition-all text-xs font-bold py-1.5 pl-8 pr-3.5 outline-none cursor-pointer shadow-sm focus:ring-1 focus:ring-emerald-500"
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
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700/60 shrink-0 shadow-sm">
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
              <div className="flex items-center gap-2 md:gap-3">
                {/* Notification Bell Trigger */}
                <div className="relative" ref={notificationPanelRef}>
                  <button
                    onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                    className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors relative"
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
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-emerald-500 object-cover"
                  />
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-semibold block leading-tight">{currentUser.name}</span>
                    <span className="text-[10px] text-emerald-400 block font-mono">
                      {currentUser.role === "admin" ? (lang === "es" ? "Administrador 🛠️" : "Admin 🛠️") : `${t("points", "PUNTUACIÓN")}: ${currentUser.points} pts 🏅`}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title={t("logout", "Cerrar Sesión")}
                    className="p-1.5 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 rounded-lg transition-colors ml-1"
                    id="logout_action_btn"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400 hidden lg:block">{t("subtitle", "Consigue puntos prediciendo resultados reales")}</span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-6">

        {!currentUser ? (
          /* Authentication Screen */
          <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden my-6">
            <div className="p-6 bg-slate-900 border-b border-emerald-800 text-center text-white">
              <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              <h2 className="text-xl font-bold">{t("auth_box_title", "Inicia Sesión o Regístrate")}</h2>
              <p className="text-xs text-slate-300 mt-1">{t("auth_box_subtitle", "Escribe tu correo para participar en la Polla del Mundial 2026")}</p>
            </div>
            
            <form onSubmit={authMode === "login" ? handleLogin : authMode === "register" ? handleRegister : handleRecover} className="p-6 space-y-4">
              
              {authMode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("auth_public_name", "Nombre público para el ranking")}</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="Ej. PipeDiaz10"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      minLength={3}
                      required
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Será el nombre visible en la tabla de posiciones.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("auth_choose_avatar", "Elige un Avatar")}</label>
                    <div className="grid grid-cols-6 gap-2 pt-1">
                      {AVATARS.map((av, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAuthAvatar(av)}
                          className={`rounded-full overflow-hidden border-2 transition-all p-0.5 ${authAvatar === av ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-transparent"}`}
                        >
                          <img src={av} alt={`Avatar ${idx}`} className="w-full h-8 object-cover rounded-full" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("auth_email", "Correo Electrónico")}</label>
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
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("auth_password", "Contraseña")}</label>
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
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Confirmar contraseña</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input
                            type={showAuthConfirmPassword ? "text" : "password"}
                            className="w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                            placeholder="Repite tu contraseña"
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
                      {t("auth_forgot", "¿Olvidó su contraseña?")}
                    </button>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={authMode === "register" && (!isEmailValid || !isRegisterPasswordValid || authName.trim().length < 3)}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold shadow-md transition-colors ${authMode === "register" && (!isEmailValid || !isRegisterPasswordValid || authName.trim().length < 3) ? "bg-slate-300 text-slate-500 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"}`}
              >
                {authMode === "login" ? t("auth_btn_login", "Ingresar a la Polla") : authMode === "register" ? t("auth_btn_register", "Crear Cuenta de Participante") : t("auth_btn_recover", "Recuperar Contraseña")}
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center">
                {authMode === "login" ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("auth_no_account", "¿No tienes una cuenta aún?")}{" "}
                    <button type="button" onClick={() => setAuthMode("register")} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer">
                      {t("auth_btn_register_now", "Regístrate gratis")}
                    </button>
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("auth_has_account", "¿Ya tienes una cuenta registrada?")}{" "}
                    <button type="button" onClick={() => setAuthMode("login")} className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer">
                      {t("auth_btn_login_now", "Inicia Sesión")}
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
            <aside className="w-full md:w-64 shrink-0 flex flex-col gap-4">
              
              {/* Soccer Ball Toggle Button (Only visible on responsive mobile viewports) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-full flex items-center justify-between bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-2xl shadow-md border border-emerald-800 transition-all duration-300"
              >
                <div className="flex items-center gap-2">
                  <SoccerBallIcon className={`w-5 h-5 text-emerald-400 transition-transform duration-500 ease-out ${mobileMenuOpen ? 'rotate-180' : 'rotate-0'}`} />
                  <span className="font-bold text-xs tracking-wide">
                    {mobileMenuOpen ? (lang === "es" ? "Ocultar Menú ⚽" : "Hide Menu ⚽") : (lang === "es" ? "Mostrar Menú de la Polla ⚽" : "Show Prediction Menu ⚽")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    {activeTab === "dashboard" ? (lang === "es" ? "Resumen" : "Summary") :
                     activeTab === "predictions" ? (lang === "es" ? "Pronósticos" : "Predictions") :
                     activeTab === "ranking" ? "Ranking" :
                     activeTab === "rules-prizes" ? (lang === "es" ? "Reglas" : "Rules") : "Menú"}
                  </span>
                  {mobileMenuOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
                </div>
              </button>

              {/* Collapsible Content wrapper */}
              <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col gap-4 w-full`}>
                
                {/* Profile Card Summary */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md border border-slate-850">
                  <div className="flex items-center gap-3">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500" />
                    <div>
                      <h3 className="font-bold text-sm leading-tight">{currentUser.name}</h3>
                      <p className="text-[10px] text-slate-400 capitalize">{currentUser.role === "admin" ? (lang === "es" ? "Administrador 🛠️" : "Admin 🛠️") : (lang === "es" ? "Participante Oficial" : "Official Participant")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800 text-center">
                    <div className="bg-slate-800/40 p-2 rounded-lg">
                      <span className="block text-[8px] md:text-[9px] text-slate-400 uppercase font-semibold">{t("points", "PUNTUACIÓN")}</span>
                      <span className="text-base font-bold text-amber-400">{currentUser.points}</span>
                    </div>
                    <div className="bg-slate-800/40 p-2 rounded-lg">
                      <span className="block text-[8px] md:text-[9px] text-slate-400 uppercase font-semibold">{t("predictions", "PRONÓSTICOS")}</span>
                      <span className="text-base font-bold text-emerald-400">{currentUser.predictCount}</span>
                    </div>
                  </div>
                </div>

                {/* Navigation Actions Menu */}
                <nav className="flex flex-col gap-1 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm" id="sidebar_nav">
                  
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 px-3 pt-2 pb-1 uppercase tracking-wider block">{t("menu_user", "Menú Usuario")}</span>
                  
                  <button
                    onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "dashboard" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <BarChart3 className="w-4 h-4 shrink-0" />
                    {t("tab_dashboard", "Mi Resumen & Estadísticas")}
                  </button>

                  <button
                    onClick={() => { setActiveTab("predictions"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "predictions" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    {t("tab_predictions", "Calendario & Pronósticos")}
                  </button>

                  <button
                    onClick={() => { setActiveTab("ranking"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "ranking" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <Trophy className="w-4 h-4 shrink-0" />
                    {t("tab_ranking", "Tabla de Clasificación")}
                  </button>

                  <button
                    onClick={() => { setActiveTab("rules-prizes"); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "rules-prizes" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <Info className="w-4 h-4 shrink-0" />
                    {t("tab_rules", "Reglas y Premiaciones")}
                  </button>

                  {/* ADMINS MODULE ENTRY CHANGER */}
                  {currentUser.role === "admin" && (
                    <>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 px-3 pt-3 pb-1 uppercase tracking-wider block border-t border-slate-100 dark:border-slate-800 mt-2">{t("admin_title", "ADMINISTRACIÓN")}</span>

                      <button
                        onClick={() => { setActiveTab("admin-stats"); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "admin-stats" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <BarChart3 className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        {t("admin_stats", "Dashboard & Métricas")}
                      </button>

                      <button
                        onClick={() => { setActiveTab("admin-users"); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "admin-users" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <Users className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        {t("admin_users", "Gestión de Usuarios")}
                      </button>

                      <button
                        onClick={() => { setActiveTab("admin-matches"); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "admin-matches" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <Calendar className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        {t("admin_matches", "Gestión de Partidos")}
                      </button>

                      <button
                        onClick={() => { setActiveTab("admin-announcements"); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "admin-announcements" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <Bell className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        {t("admin_announcement", "Publicar Comunicados")}
                      </button>

                      <button
                        onClick={() => { setActiveTab("admin-assets"); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "admin-assets" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <FileText className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        Biblioteca de Assets
                      </button>

                      <button
                        onClick={() => { setActiveTab("admin-banners"); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "admin-banners" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <Megaphone className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                        Banners de Pauta
                      </button>

                      <button
                        onClick={() => { setActiveTab("admin-config"); setMobileMenuOpen(false); }}
                        className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${activeTab === "admin-config" ? "bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-bold" : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"}`}
                      >
                        <Settings className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
                        {t("admin_config", "Políticas de la Polla")}
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
                    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 shadow-md border border-emerald-800/40 space-y-3">
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
              
              {/* 1. MÓDULO USER: DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <BarChart3 className="text-emerald-600 w-5 h-5" /> {t("db_title", "Mi Resumen & Evolución de Puntos")}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">{t("db_desc", "Sigue tu progreso, aciertos y estadísticas particulares")}</p>
                  </div>

                  {/* Top Stats Cards metrics panel */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase">{t("db_my_points", "MIS PUNTOS TOTALES")}</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">{currentUser.points}</span>
                      <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block mt-0.5">{t("db_my_points_sub", "🏅 Clasificación actual")}</span>
                    </div>

                    <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl">
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block uppercase">{t("db_exact", "MARCADOR EXACTO (15 pts)")}</span>
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
                          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">{t("db_label_pass", "Nueva Contraseña (Dejar vacío para conservar actual)")}</label>
                          <input
                            type="password"
                            className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100"
                            placeholder={t("db_label_pass_placeholder", "Mínimo 4 caracteres")}
                            value={profileNewPass}
                            onChange={(e) => setProfileNewPass(e.target.value)}
                          />
                        </div>
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
              {activeTab === "predictions" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-emerald-600 w-5 h-5" id="user_predictions_calendar_icon" /> {t("tab_predictions", "Calendario & Pronósticos")}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {t("pred_desc", "Introduce marcadores. Se bloquea el registro 15 minutos antes del partido. UTC-5 Bogotá Base.")}
                      </p>
                    </div>

                    {/* Stats summary of predictions */}
                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 flex gap-4">
                      <span>{t("pred_registered", "Registrados")}: <b>{predictions.length}</b></span>
                      <span>{t("pred_pending", "Pendientes")}: <b>{matches.length - predictions.length}</b></span>
                    </div>
                  </div>

                  {/* Mode Selector for Predictions */}
                  <div className="flex gap-2 border-b border-slate-105 dark:border-slate-800 pb-2">
                    <button
                      onClick={() => setPredictionsMode("matches")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        predictionsMode === "matches"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {t("mode_individual_matches", "Partidos Individuales")}
                    </button>
                    <button
                      onClick={() => setPredictionsMode("favorites")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
                      onSave={handleSaveTournamentPredictions}
                    />
                  ) : (
                    <>
                      {/* Filters bar */}
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 flex-wrap text-xs">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{t("stage", "Etapa")}:</span>
                      <select
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                        value={selectedStage}
                        onChange={(e) => setSelectedStage(e.target.value)}
                      >
                        {STAGES.map((s) => <option key={s} value={s}>{getStageLabel(s)}</option>)}
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-medium">{t("status", "Estado")}:</span>
                      <select
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded p-1 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                        value={matchStatusFilter}
                        onChange={(e) => setMatchStatusFilter(e.target.value as any)}
                      >
                        <option value="all">{t("pred_status_all", "Ver Todos")}</option>
                        <option value="pending">{t("pred_status_open", "Abiertos para Predico")}</option>
                        <option value="finished">{t("pred_status_finished", "Finalizados / Oficiales")}</option>
                      </select>
                    </div>

                    <div className="flex-1 min-w-[150px]">
                      <input
                        type="text"
                        placeholder={t("pred_search_placeholder", "Buscar por equipo o estadio...")}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        value={teamSearch}
                        onChange={(e) => setTeamSearch(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Core Matches Prediction Loop */}
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl max-h-[500px] overflow-y-auto bg-white dark:bg-slate-900 shadow-sm">
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

                        return (
                          <div key={m.id} className={`p-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 flex flex-col md:flex-row items-center justify-between gap-4 ${hasEnded ? "bg-slate-50/20 dark:bg-slate-850/10" : ""}`}>
                            
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
                            <div className="w-full md:w-2/5 flex items-center justify-center gap-3">
                              {/* HOME TEAM */}
                              <div className="w-24 text-right font-semibold text-xs text-slate-800 dark:text-slate-100 truncate" title={getTeamDisplayName(m.local, lang)}>
                                {getShortTeamName(m.local, lang)} <span className="ml-1 text-sm select-none">{getTeamFlag(m.local)}</span>
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
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="?"
                                    className="w-10 text-center bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-705 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded p-1 text-xs font-bold font-mono"
                                    value={localVal}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                                      setPredScores({
                                        ...predScores,
                                        [m.id]: { local: val as number, visitor: predScores[m.id]?.visitor ?? 0 }
                                      });
                                    }}
                                  />
                                  <span className="text-slate-400 font-bold">-</span>
                                  <input
                                    type="number"
                                    min="0"
                                    placeholder="?"
                                    className="w-10 text-center bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-705 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded p-1 text-xs font-bold font-mono"
                                    value={visVal}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? "" : parseInt(e.target.value, 10);
                                      setPredScores({
                                        ...predScores,
                                        [m.id]: { local: predScores[m.id]?.local ?? 0, visitor: val as number }
                                      });
                                    }}
                                  />
                                </div>
                              )}
                              
                              {/* VISITOR TEAM */}
                              <div className="w-24 text-left font-semibold text-xs text-slate-800 dark:text-slate-100 truncate" title={getTeamDisplayName(m.visitor, lang)}>
                                <span className="mr-1 text-sm select-none">{getTeamFlag(m.visitor)}</span> {getShortTeamName(m.visitor, lang)}
                              </div>
                            </div>

                            {/* Scoring details / Save Button Action */}
                            <div className="w-full md:w-1/4 flex flex-col items-center md:items-end justify-center">
                              {!isLocked ? (
                                <button
                                  onClick={() => handleSavePrediction(m.id)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                                >
                                  <Check className="w-3 h-3" /> {pred ? t("pred_update", "Actualizar") : t("pred_save", "Guardar")}
                                </button>
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
                        <Trophy className="text-emerald-600 w-5 h-5" id="user_ranking_sidebar_trophy" /> {t("rank_title", "Tabla de Clasificación en Tiempo Real")}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">{t("rank_desc", "Conoce tu posición frente a otros participantes del torneo")}</p>
                    </div>

                    <button
                      onClick={handleExportRankingCSV}
                      className="px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" /> {t("rank_export", "Exportar CSV")}
                    </button>
                  </div>

                  {/* Leaderboard Table Grid */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-2.5 px-3 w-12 text-center">{t("rank_col_pos", "Pos")}</th>
                            <th className="py-2.5 px-3">{t("rank_col_name", "Nombre")}</th>
                            <th className="py-2.5 px-3 text-center">{t("rank_col_pts", "Pts Totales")}</th>
                            <th className="py-2.5 px-3 text-center hidden sm:table-cell">{t("rank_col_exact", "Aciertos 15pts")}</th>
                            <th className="py-2.5 px-3 text-center hidden sm:table-cell">{t("rank_col_draw", "Empates 10pts")}</th>
                            <th className="py-2.5 px-3 text-center">{t("rank_col_matches", "Partidos")}</th>
                            <th className="py-2.5 px-3 text-center">{t("rank_col_trend", "Tendencia")}</th>
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
                                <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white">{r.points}</td>
                                <td className="py-2.5 px-3 text-center hidden sm:table-cell text-emerald-700 dark:text-emerald-400">{r.exactCount}</td>
                                <td className="py-2.5 px-3 text-center hidden sm:table-cell text-indigo-700 dark:text-indigo-400">{r.drawCount}</td>
                                <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400">{r.predictCount}</td>
                                <td className="py-2.5 px-3 text-center">
                                  {r.shift === "up" && (
                                    <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold" title="Subió posición">
                                      <ChevronUp className="w-3.5 h-3.5 stroke-[3]" /> {t("rank_status_up", "Subió")}
                                    </span>
                                  )}
                                  {r.shift === "down" && (
                                    <span className="inline-flex items-center text-rose-500 text-[10px] font-mono font-bold" title="Bajó posición">
                                      <ChevronDown className="w-3.5 h-3.5 stroke-[3]" /> {t("rank_status_down", "Bajó")}
                                    </span>
                                  )}
                                  {r.shift === "equal" && (
                                    <span className="text-slate-400 font-bold" title="Igual">═ {t("rank_status_equal", "Mantener")}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. MÓDULO USER: REGLAS Y PREMIACIONES TAB */}
              {activeTab === "rules-prizes" && (() => {
                const selectedRulesImageUrl = lang === "en" 
                  ? (torneo?.rulesImageUrlEn || "/src/assets/images/polla_rules_en_1780083217819.png")
                  : (torneo?.rulesImageUrl || "/uploads/reglas.png");

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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* COLUMNS 1 & 2: TEXT DETAILS */}
                      <div className="lg:col-span-2 space-y-6">
                        <div className="p-5 bg-emerald-50/40 dark:bg-emerald-950/15 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/40 space-y-3 shadow-sm">
                          <h3 className="font-bold text-sm text-emerald-900 dark:text-emerald-350 flex items-center gap-2">
                            <Trophy className="w-4.5 h-4.5 text-emerald-600" /> {t("rules_dist_pt", "Distribución de Puntos")}
                          </h3>
                          <pre className="text-xs text-emerald-950 dark:text-emerald-200 font-sans whitespace-pre-wrap leading-relaxed">
                            {torneo?.rulesText || "REGLAS DE PUNTUACIÓN:\n- Empate Real: 10 pts\n- Marcador Exacto: 15 pts\n- Participación con resultado erróneo: 5 pts"}
                          </pre>
                        </div>

                        <div className="p-5 bg-slate-50/80 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" /> {t("rules_prizes_rec", "Premios & Reconocimientos")}
                          </h3>
                          <pre className="text-xs text-slate-700 dark:text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                            {torneo?.prizesText || t("rules_no_prizes", "Por definir por el administrador.")}
                          </pre>
                        </div>
                      </div>

                      {/* COLUMN 3: GRAPHICAL BROCHURE / FLYER DOWNLOAD */}
                      <div className="lg:col-span-1">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5" /> {lang === "es" ? "Reglamento Gráfico" : "Graphic Brochure"}
                            </h3>
                            <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-bold tracking-widest leading-none">
                              {lang === "es" ? "Oficial" : "Official"}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-350 leading-relaxed">
                            {lang === "es" 
                              ? "Descarga o amplía la infografía con las reglas de asignación del Mundial de la FIFA de forma atractiva para enviar por canales de chat o WhatsApp de amigos."
                              : "Download or expand the official infoguide with prediction scoring rules to share via chat or WhatsApp with friends and pool sub-leagues."}
                          </p>

                          {/* Image Preview Container */}
                          <div 
                            onClick={() => setRulesImageZoom(true)}
                            className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-zoom-in border border-slate-800/80 hover:border-emerald-500/40 transition-all duration-300 shadow-inner bg-slate-910"
                          >
                            <img 
                              src={selectedRulesImageUrl} 
                              alt="Folleto Oficial" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = lang === "en" 
                                  ? "/src/assets/images/polla_rules_en_1780083217819.png"
                                  : "/uploads/reglas.png";
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

                          <div className="space-y-2">
                            <button
                              onClick={() => setRulesImageZoom(true)}
                              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-300" />
                              {lang === "es" ? "Previsualizar Reglamento" : "Preview Rules Flyer"}
                            </button>

                            <a
                              href={selectedRulesImageUrl}
                              download={lang === "es" ? "reglamento_polla_2026.png" : "rules_flyer_2026.png"}
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
                                e.currentTarget.src = lang === "en" 
                                  ? "/src/assets/images/polla_rules_en_1780083217819.png"
                                  : "/uploads/reglas.png";
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between gap-3 pt-1">
                            <span className="text-[10px] text-slate-400 italic">
                              {lang === "es" ? "Haz clic fuera para cerrar" : "Click anywhere outside to close"}
                            </span>
                            <a
                              href={selectedRulesImageUrl}
                              download={lang === "es" ? "reglamento_polla_2026.png" : "rules_flyer_2026.png"}
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
              {activeTab === "admin-stats" && currentUser.role === "admin" && (
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

                      {/* Score distribution indicators */}
                      <div className="p-4 bg-white border rounded-xl space-y-4">
                        <h3 className="text-xs font-bold text-slate-700 uppercase">Gráfico de Distribución de Puntos (Volumen de hits)</h3>
                        <div className="space-y-3 font-mono text-xs">
                          {/* 15 pts chart */}
                          <div>
                            <div className="flex justify-between mb-1 text-[11px] font-bold">
                              <span className="text-emerald-700">Aciertos Marcador Exacto (15 pts)</span>
                              <span>{stats.distribution.exact15} ocurrencias</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-2.5 rounded-full"
                                style={{ width: `${Math.min(100, stats.totalPredictionsCount > 0 ? (stats.distribution.exact15 / stats.totalPredictionsCount) * 100 : 0)}%` }}
                              />
                            </div>
                          </div>

                          {/* 10 pts chart */}
                          <div>
                            <div className="flex justify-between mb-1 text-[11px] font-bold">
                              <span className="text-indigo-700">Empates Acertados / Asignados (10 pts)</span>
                              <span>{stats.distribution.draw10} ocurrencias</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-500 h-2.5 rounded-full"
                                style={{ width: `${Math.min(100, stats.totalPredictionsCount > 0 ? (stats.distribution.draw10 / stats.totalPredictionsCount) * 100 : 0)}%` }}
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
              {activeTab === "admin-users" && currentUser.role === "admin" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="text-amber-500 w-5 h-5" /> Gestión de Cuentas de Participantes
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Crear, editar, suspender cuentas oficiales, resetear contraseñas y auditar predicciones</p>
                    </div>

                    <button
                      onClick={() => setEditingUser({ name: "", email: "", password: "user", role: "standard", status: "active", avatar: AVATARS[0] })}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Registrar Participante
                    </button>
                  </div>

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
                            <option value="standard">Usuario Estándar</option>
                            <option value="admin">Administrador 🛠️</option>
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

                  {/* Users audit table layout */}
                  <div className="bg-white border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Participante</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3 text-center">Estatus Cuenta</th>
                          <th className="py-2.5 px-3 text-center">Rol</th>
                          <th className="py-2.5 px-3 text-center">Pts</th>
                          <th className="py-2.5 px-3 text-center">Acciones y Reset</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {adminUsers
                          .filter((u) => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()))
                          .map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2">
                                  <img src={u.avatar} alt="user" className="w-7 h-7 rounded-full object-cover" />
                                  <span className="font-semibold text-slate-900">{u.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">{u.email}</td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                                }`}>
                                  {u.status === "active" ? "Activa" : "Suspendida"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold capitalize text-slate-700">{u.role}</td>
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
                          ))}
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
              {activeTab === "admin-matches" && currentUser.role === "admin" && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-amber-500 w-5 h-5" /> Gestión de Partidos & Resultados Reales
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Cargar y editar partidos del Mundial 2026. Introducir puntajes reales para calcular escalafones.</p>
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
              {activeTab === "admin-announcements" && currentUser.role === "admin" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Bell className="text-amber-500 w-5 h-5" /> Tablón de Comunicados y Mensajes del Admin
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Envía anuncios de premios, recordatorios generales o alertas urgentes visibles para todos</p>
                  </div>

                  <form onSubmit={handleSaveAnnouncement} className="p-4 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-4">
                    <h3 className="font-bold text-xs text-slate-800">PUBLICAR COMUNICADO</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="md:col-span-2">
                        <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Título del Mensaje</label>
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
                    {announcements.map((ann) => (
                      <div key={ann.id} className="p-3 bg-white border rounded-xl flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            {ann.urgent && <span className="bg-rose-600 text-white text-[9px] px-1 rounded uppercase">Urgente</span>}
                            {ann.title}
                          </h4>
                          <p className="text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                          <span className="block text-[9px] text-slate-400 font-mono mt-1">Registrado el: {new Date(ann.date).toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-1 bg-rose-50 text-rose-700 rounded hover:bg-rose-100"
                          title="Eliminar boletín"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. MÓDULO ADMIN: POLÍTICAS Y CONFIGURACIONES TORNEO TAB */}
              {/* 9. MODULO ADMIN: BIBLIOTECA DE ASSETS */}
              {activeTab === "admin-assets" && currentUser.role === "admin" && (
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
                    Los archivos se guardan fisicamente en <strong>assets/assets</strong> y quedan registrados en la base actual <strong>db_store.json</strong>. La URL publica sirve para referenciarlos desde reglas, comunicados o futuras secciones.
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

              {activeTab === "admin-banners" && currentUser.role === "admin" && (
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

              {activeTab === "admin-config" && currentUser.role === "admin" && (
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Settings className="text-amber-500 w-5 h-5" /> Configuración de Políticas del Torneo
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Personaliza el nombre, descripciones, zona horaria base, mensaje de bienvenida y habilitación de notificaciones</p>
                  </div>

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

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Texto Libro de Premiaciones</label>
                          <textarea
                            rows={3}
                            className="w-full bg-white border rounded p-1.5 font-mono text-[11px]"
                            value={torneo.prizesText}
                            onChange={(e) => setTorneo({ ...torneo, prizesText: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Instrucciones Básicas de Reglas</label>
                          <textarea
                            rows={3}
                            className="w-full bg-white border rounded p-1.5 font-mono text-[11px]"
                            value={torneo.rulesText}
                            onChange={(e) => setTorneo({ ...torneo, rulesText: e.target.value })}
                          />
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
                            <label htmlFor="not_remind_ch">Alertas de predicciones faltantes (24h de anticipación)</label>
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
                        <h3 className="text-sm font-bold text-slate-950">🛠️ Iniciar Polla Real (Limpiar Datos de Simulación)</h3>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          La aplicación contiene actualmente resultados simulados y predicciones de muestra para ilustrar su funcionamiento (modo demostración). 
                          Como indicas, <strong>el Mundial de Fútbol 2026 aún no ha comenzado en la vida real</strong> (los partidos empiezan oficialmente el 11 de junio de 2026).
                        </p>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          Si vas a usar este portal para organizar tu propia competencia real con amigos y familiares, haz clic en el botón de abajo para 
                          <strong> limpiar todos los marcadores, establecer todos los partidos como pendientes</strong>, restablecer los puntajes a 0 y borrar las predicciones de prueba, de modo que todos comiencen totalmente desde cero.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end pt-2 border-t border-rose-100">
                      <button
                        type="button"
                        onClick={handleResetTournament}
                        className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                      >
                        Reiniciar Torneo a Estado Inicial Real (Limpiar resultados de demostración)
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </section>
          </>
        )}
      </main>

      {/* Football-inspired high contrast informational footer line */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center border-t border-slate-800 shrink-0 text-xs">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-mono text-emerald-400 font-bold tracking-widest text-[11px] uppercase">
            ⚽ Polla Mundialista FIFA 2026 • Bogotá UTC-5 Base
          </p>
          <p className="text-slate-500 text-[11px]">
            Diseñada para gestionar pronósticos con cierre automático de postulaciones 15 minutos antes de cada partido.
          </p>
        </div>
      </footer>

    </div>
  );
}
