import React, { useEffect, useMemo, useRef, useState } from "react";
import { GitBranch, RefreshCw, ShieldCheck, Trophy } from "lucide-react";
import type { KnockoutFixture, Match, WorldCupOverview } from "../types";

interface Props {
  getTeamFlag: (team: string) => React.ReactNode;
}

type BracketSlot = {
  label: string;
  source: "team" | "winner" | "loser" | "slot";
  sourceMatchId?: number;
  confirmed: boolean;
};

type BracketMatch = {
  id: number;
  stage: KnockoutFixture["stage"];
  dateLabel: string;
  stadium: string;
  local: BracketSlot;
  visitor: BracketSlot;
  realMatch?: Match;
};

type BracketResultCorrection = {
  localScore: number;
  visitorScore: number;
  officialWinner?: string;
  shootout?: string;
};

type StageTheme = {
  panel: string;
  header: string;
  border: string;
  text: string;
  glow: string;
};

type BracketSide = "left" | "right";
type GroupSummary = {
  group: string;
  teams: string[];
};
type GroupTheme = {
  border: string;
  connector: string;
  header: string;
  title: string;
  badge: string;
};

const worldCupLogo = new URL("../../assets/assets/logo_polla_mundialista.PNG", import.meta.url).href;
const BRACKET_DESIGN_WIDTH = 1200;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 1;
const ZOOM_STEP = 0.1;

const GROUPS_TEAMS: Record<string, string[]> = {
  "Grupo A": ["México", "Sudáfrica", "Rep. de Corea", "Rep. Checa"],
  "Grupo B": ["Canadá", "Bosnia y Herzegovina", "Catar", "Suiza"],
  "Grupo C": ["Brasil", "Marruecos", "Haití", "Escocia"],
  "Grupo D": ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
  "Grupo E": ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  "Grupo F": ["Países Bajos", "Japón", "Suecia", "Túnez"],
  "Grupo G": ["Bélgica", "Egipto", "RI de Irán", "Nueva Zelanda"],
  "Grupo H": ["España", "Cabo Verde", "Arabia Saudí", "Uruguay"],
  "Grupo I": ["Francia", "Senegal", "Irak", "Noruega"],
  "Grupo J": ["Argentina", "Argelia", "Austria", "Jordania"],
  "Grupo K": ["Portugal", "RD Congo", "Uzbekistán", "Colombia"],
  "Grupo L": ["Inglaterra", "Croacia", "Ghana", "Panamá"]
};

const STAGE_ORDER: KnockoutFixture["stage"][] = [
  "16avos de Final",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinal",
  "Final"
];

const LEFT_BRACKET_MATCH_IDS = [
  73, 76, 75, 78,
  81, 82, 83, 84,
  89, 90, 93, 94,
  97, 98,
  101
];

const RIGHT_BRACKET_MATCH_IDS = [
  74, 77, 79, 80,
  85, 86, 87, 88,
  91, 92, 95, 96,
  99, 100,
  102
];

const BRACKET_RESULT_CORRECTIONS: Record<number, BracketResultCorrection> = {
  75: { localScore: 1, visitorScore: 1, officialWinner: "Paraguay", shootout: "3-4 pen." },
  76: { localScore: 1, visitorScore: 1, officialWinner: "Marruecos", shootout: "3-4 pen." },
  77: { localScore: 1, visitorScore: 2, officialWinner: "Noruega" },
  78: { localScore: 3, visitorScore: 0, officialWinner: "Francia" },
  93: { localScore: 1, visitorScore: 0, officialWinner: "España" },
  94: { localScore: 4, visitorScore: 1, officialWinner: "Bélgica" }
};

const OFFICIAL_MATCHUP_OVERRIDES: Record<number, { local: string; visitor: string }> = {
  93: { local: "España", visitor: "Portugal" },
  94: { local: "Bélgica", visitor: "Estados Unidos" },
  95: { local: "Argentina", visitor: "Egipto" },
  96: { local: "Suiza", visitor: "Colombia" }
};

const STAGE_META: Record<KnockoutFixture["stage"], { title: string; short: string; count: string }> = {
  "16avos de Final": { title: "16avos", short: "32 equipos", count: "16 cruces" },
  "Octavos de Final": { title: "Octavos", short: "16 equipos", count: "8 cruces" },
  "Cuartos de Final": { title: "Cuartos", short: "8 equipos", count: "4 cruces" },
  "Semifinal": { title: "Semifinales", short: "4 equipos", count: "2 cruces" },
  "Tercer Puesto": { title: "Tercer puesto", short: "2 equipos", count: "1 cruce" },
  "Final": { title: "Gran final", short: "2 equipos", count: "1 cruce" }
};

const STAGE_THEMES: Record<KnockoutFixture["stage"], StageTheme> = {
  "16avos de Final": {
    panel: "bg-lime-400",
    header: "bg-lime-300 text-slate-950",
    border: "border-lime-300",
    text: "text-lime-200",
    glow: "shadow-lime-500/20"
  },
  "Octavos de Final": {
    panel: "bg-sky-400",
    header: "bg-sky-300 text-slate-950",
    border: "border-sky-300",
    text: "text-sky-200",
    glow: "shadow-sky-500/20"
  },
  "Cuartos de Final": {
    panel: "bg-fuchsia-500",
    header: "bg-fuchsia-400 text-white",
    border: "border-fuchsia-400",
    text: "text-fuchsia-200",
    glow: "shadow-fuchsia-500/20"
  },
  "Semifinal": {
    panel: "bg-orange-500",
    header: "bg-orange-400 text-slate-950",
    border: "border-orange-400",
    text: "text-orange-200",
    glow: "shadow-orange-500/20"
  },
  "Tercer Puesto": {
    panel: "bg-cyan-400",
    header: "bg-cyan-300 text-slate-950",
    border: "border-cyan-300",
    text: "text-cyan-200",
    glow: "shadow-cyan-500/20"
  },
  "Final": {
    panel: "bg-rose-500",
    header: "bg-rose-400 text-white",
    border: "border-rose-400",
    text: "text-rose-200",
    glow: "shadow-rose-500/20"
  }
};

const GROUP_THEME: GroupTheme = {
  border: "border-yellow-300",
  connector: "bg-yellow-300",
  header: "bg-yellow-300 text-slate-950",
  title: "text-yellow-200",
  badge: "bg-black/70 text-yellow-100 ring-1 ring-yellow-300/40"
};

const normalizeText = (value: string) =>
  value
    .replace(/Âº/g, "º")
    .replace(/Ã¡/g, "a")
    .replace(/Ã©/g, "e")
    .replace(/Ã­/g, "i")
    .replace(/Ã³/g, "o")
    .replace(/Ãº/g, "u")
    .replace(/Ã/g, "A")
    .replace(/Ã‰/g, "E")
    .replace(/Ã/g, "I")
    .replace(/Ã“/g, "O")
    .replace(/Ãš/g, "U")
    .replace(/Ã±/g, "n")
    .replace(/Ã‘/g, "N");

const formatBogotaDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(parsed);
};

const isMobilePortraitViewport = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 767px) and (orientation: portrait)").matches;

const parseSourceSlot = (slot: string) => {
  const normalized = normalizeText(slot);
  const source = normalized.match(/^(Ganador|Perdedor) Partido (\d+)$/i);
  if (!source) return { source: "slot" as const, label: normalized };
  return {
    source: source[1].toLowerCase() === "ganador" ? "winner" as const : "loser" as const,
    sourceMatchId: Number(source[2]),
    label: normalized
  };
};

const getValidOfficialWinner = (match: Match) => {
  if (!match.officialWinner) return "";
  const winner = normalizeText(match.officialWinner).trim().toLowerCase();
  const local = normalizeText(match.local).trim().toLowerCase();
  const visitor = normalizeText(match.visitor).trim().toLowerCase();
  return winner === local || winner === visitor ? normalizeText(match.officialWinner) : "";
};

const hasInvalidOfficialWinner = (match: Match) => Boolean(match.officialWinner && !getValidOfficialWinner(match));

const getBracketResultCorrection = (match?: Match) => match ? BRACKET_RESULT_CORRECTIONS[match.id] : undefined;

const hasPlayableFinalResult = (match?: Match) => {
  if (getBracketResultCorrection(match)) return true;
  if (!match || match.status !== "finished" || match.localScore === null || match.visitorScore === null) return false;
  if (hasInvalidOfficialWinner(match)) return false;
  const matchTime = new Date(match.date).getTime();
  return !Number.isFinite(matchTime) || matchTime <= Date.now();
};

const getDisplayMatchScore = (match?: Match) => {
  const correction = getBracketResultCorrection(match);
  if (correction) {
    return {
      localScore: correction.localScore,
      visitorScore: correction.visitorScore,
      shootout: correction.shootout || ""
    };
  }
  if (!hasPlayableFinalResult(match)) return null;
  return {
    localScore: match!.localScore!,
    visitorScore: match!.visitorScore!,
    shootout: ""
  };
};

const getMatchWinner = (match?: Match) => {
  if (!hasPlayableFinalResult(match)) return "";
  const correction = getBracketResultCorrection(match);
  if (correction?.officialWinner) return correction.officialWinner;
  if (correction) {
    if (correction.localScore > correction.visitorScore) return match!.local;
    if (correction.visitorScore > correction.localScore) return match!.visitor;
    return "";
  }
  const officialWinner = getValidOfficialWinner(match);
  if (officialWinner) return officialWinner;
  if (match.localScore > match.visitorScore) return match.local;
  if (match.visitorScore > match.localScore) return match.visitor;
  return "";
};

const getMatchLoser = (match?: Match) => {
  if (!hasPlayableFinalResult(match)) return "";
  const correction = getBracketResultCorrection(match);
  if (correction?.officialWinner) {
    return correction.officialWinner === normalizeText(match!.local) ? match!.visitor : match!.local;
  }
  if (correction) {
    if (correction.localScore < correction.visitorScore) return match!.local;
    if (correction.visitorScore < correction.localScore) return match!.visitor;
    return "";
  }
  const officialWinner = getValidOfficialWinner(match);
  if (officialWinner) {
    return officialWinner === normalizeText(match.local) ? match.visitor : match.local;
  }
  if (match.localScore < match.visitorScore) return match.local;
  if (match.visitorScore < match.localScore) return match.visitor;
  return "";
};

const isPlaceholderTeam = (team: string) => {
  const normalized = normalizeText(team).trim();
  return (
    /^(Ganador|Perdedor) Partido/i.test(normalized) ||
    /^(Gan\.?|Per\.?)\s*P?\d+$/i.test(normalized) ||
    /Grupo [A-L]/i.test(normalized) ||
    /^[123](?:\.?º|º)?\s*(?:Grupo\s*)?[A-L](?:\s*\/\s*[A-L])*/i.test(normalized)
  );
};

const hasRealTeam = (team: string) => {
  const normalized = normalizeText(team).trim();
  return Boolean(normalized && !isPlaceholderTeam(normalized));
};

const getSlotFromRealMatch = (team: string): BracketSlot | null => {
  if (!hasRealTeam(team)) return null;
  return { label: normalizeText(team), source: "team", confirmed: true };
};

const getSlotLabel = (slot: BracketSlot, matchesById: Map<number, Match>) => {
  if (slot.source === "winner" && slot.sourceMatchId) {
    const winner = getMatchWinner(matchesById.get(slot.sourceMatchId));
    if (winner) return { label: winner, detail: `Ganador confirmado P${slot.sourceMatchId}`, confirmed: true };
  }

  if (slot.source === "loser" && slot.sourceMatchId) {
    const loser = getMatchLoser(matchesById.get(slot.sourceMatchId));
    if (loser) return { label: loser, detail: `Perdedor confirmado P${slot.sourceMatchId}`, confirmed: true };
  }

  if ((slot.source === "winner" || slot.source === "loser") && slot.sourceMatchId) {
    const sourceMatch = matchesById.get(slot.sourceMatchId);
    if (sourceMatch && hasRealTeam(sourceMatch.local) && hasRealTeam(sourceMatch.visitor)) {
      return {
        label: slot.label,
        detail: `${sourceMatch.local} / ${sourceMatch.visitor}`,
        confirmed: false
      };
    }
  }

  return { label: slot.label, detail: slot.source === "team" ? "Equipo confirmado por API" : "Slot FIFA", confirmed: slot.confirmed };
};

const getStatusLabel = (match?: Match) => {
  if (!match) return "Fixture FIFA";
  if (match.status === "finished") return "Finalizado";
  if (match.status === "in_progress") return "En vivo";
  return "Programado";
};

const buildBracketMatches = (fixtures: KnockoutFixture[], matches: Match[]) => {
  const matchesById = new Map(matches.map((match) => [match.id, match]));

  return fixtures.map((fixture): BracketMatch => {
    const realMatch = matchesById.get(fixture.id);
    const officialMatchup = OFFICIAL_MATCHUP_OVERRIDES[fixture.id];
    const parsedLocal = parseSourceSlot(fixture.localSlot);
    const parsedVisitor = parseSourceSlot(fixture.visitorSlot);
    const realLocal = realMatch ? getSlotFromRealMatch(realMatch.local) : null;
    const realVisitor = realMatch ? getSlotFromRealMatch(realMatch.visitor) : null;
    const usesPreviousRoundSources = parsedLocal.source !== "slot" || parsedVisitor.source !== "slot";

    return {
      id: fixture.id,
      stage: fixture.stage,
      dateLabel: normalizeText(fixture.dateLabel),
      stadium: normalizeText(fixture.stadium),
      local: officialMatchup
        ? { label: officialMatchup.local, source: "team", confirmed: true }
        : !usesPreviousRoundSources && realLocal ? realLocal : { ...parsedLocal, confirmed: false },
      visitor: officialMatchup
        ? { label: officialMatchup.visitor, source: "team", confirmed: true }
        : !usesPreviousRoundSources && realVisitor ? realVisitor : { ...parsedVisitor, confirmed: false },
      realMatch
    };
  });
};

const buildGroupSummaries = (overview: WorldCupOverview | null, groups: string[]): GroupSummary[] =>
  groups.map((group) => {
    const table = overview?.groups.find((item) => item.group === group)?.table || [];
    const apiTeams = table.map((row) => row.team).filter(Boolean);
    const fallbackTeams = GROUPS_TEAMS[`Grupo ${group}`] || [];
    return {
      group,
      teams: (apiTeams.length >= 4 ? apiTeams : fallbackTeams).slice(0, 4)
    };
  });

const getStageMatchesForSide = (
  sideIds: number[],
  stage: KnockoutFixture["stage"],
  matches: BracketMatch[]
) => {
  const matchesById = new Map(matches.map((match) => [match.id, match]));
  return sideIds
    .map((id) => matchesById.get(id))
    .filter((match): match is BracketMatch => Boolean(match) && match.stage === stage);
};

const getVisualSideIds = (matchIds: number[]) => matchIds;

const getResolvedSideWinner = (matchId: number, byId: Map<number, BracketMatch>, matchesById: Map<number, Match>, fallback: string) => {
  const match = byId.get(matchId);
  if (!match) return fallback;
  const realWinner = getMatchWinner(match.realMatch);
  if (realWinner) return realWinner;
  return getSlotLabel({ label: fallback, source: "winner", sourceMatchId: matchId, confirmed: false }, matchesById).label;
};

const compactLabel = (value: string) => {
  const normalized = normalizeText(value)
    .replace("1.Âº Grupo", "1")
    .replace("2.Âº Grupo", "2")
    .replace("1.º Grupo", "1")
    .replace("2.º Grupo", "2")
    .replace("Mejor tercero", "3")
    .replace("Ganador Partido", "G")
    .replace("Perdedor Partido", "P")
    .replace("FINALISTA IZQUIERDO", "FINALISTA IZQ.")
    .replace("FINALISTA DERECHO", "FINALISTA DER.");

  if (/^[12]\s?[A-L]$/i.test(normalized.trim())) return normalized.replace(/\s+/g, "").toUpperCase();
  if (/^3\s?[A-L]$/i.test(normalized.trim())) return normalized.replace(/\s+/g, "").toUpperCase();
  if (/^[GP]\s?\d+$/i.test(normalized.trim())) return normalized.replace(/\s+/g, "").toUpperCase();
  if (normalized.length <= 14) return normalized.toUpperCase();
  return normalized.split(/\s+/).map((part) => part[0]).join("").slice(0, 4).toUpperCase();
};

const getTeamBadgeLabel = (team: string) => {
  const normalized = normalizeText(team).trim();
  if (!normalized) return "";
  const firstWord = normalized.split(/\s+/)[0] || normalized;
  return firstWord.slice(0, 8).toUpperCase();
};

const TeamSlot = ({ slot, matchesById, getTeamFlag, theme }: { slot: BracketSlot; matchesById: Map<number, Match>; getTeamFlag: Props["getTeamFlag"]; theme: StageTheme }) => {
  const resolved = getSlotLabel(slot, matchesById);
  return (
    <div className={`min-h-10 rounded-md border bg-black px-2.5 py-1.5 text-white ${resolved.confirmed ? theme.border : "border-white/15"}`}>
      <div className="flex min-w-0 items-center gap-2">
        {resolved.confirmed && slot.source !== "slot" ? <span className="shrink-0 text-base leading-none">{getTeamFlag(resolved.label)}</span> : <GitBranch className={`h-3.5 w-3.5 shrink-0 ${theme.text}`} />}
        <span className="min-w-0 truncate text-[11px] font-black uppercase">{resolved.label}</span>
      </div>
      <p className={`mt-0.5 truncate text-[8px] font-black uppercase ${resolved.confirmed ? theme.text : "text-white/35"}`}>{resolved.detail}</p>
    </div>
  );
};

const MatchCard = ({ match, matchesById, getTeamFlag, theme }: { match: BracketMatch; matchesById: Map<number, Match>; getTeamFlag: Props["getTeamFlag"]; theme: StageTheme }) => {
  const displayScore = getDisplayMatchScore(match.realMatch);
  const scoreReady = Boolean(displayScore);
  const playedDate = match.realMatch ? formatBogotaDate(match.realMatch.date) : "";

  return (
    <article className={`relative overflow-hidden rounded-xl border-2 bg-black p-2.5 shadow-xl ${theme.border} ${theme.glow}`}>
      <div className={`absolute bottom-0 right-0 top-0 w-2 ${theme.panel}`} aria-hidden="true" />
      <div className="mb-2 flex items-start justify-between gap-2 pr-2">
        <div className="min-w-0">
          <p className={`text-[9px] font-black uppercase tracking-wide ${theme.text}`}>Partido {match.id}</p>
          <p className="truncate text-[10px] font-bold text-white/55">{playedDate || match.dateLabel}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[8px] font-black uppercase ${match.realMatch?.status === "finished" ? "bg-emerald-400 text-slate-950" : match.realMatch?.status === "in_progress" ? "bg-rose-500 text-white" : "bg-white/10 text-white/70 ring-1 ring-white/10"}`}>
          {getStatusLabel(match.realMatch)}
        </span>
      </div>

      <div className="space-y-1.5 pr-2">
        <TeamSlot slot={match.local} matchesById={matchesById} getTeamFlag={getTeamFlag} theme={theme} />
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[8px] font-black uppercase text-white/35">vs</span>
          {scoreReady && (
            <span className={`inline-flex flex-col items-center rounded-full px-2 py-1 text-xs font-black tabular-nums leading-none ${theme.header}`}>
              <span>{displayScore?.localScore} - {displayScore?.visitorScore}</span>
              {displayScore?.shootout && <span className="mt-0.5 text-[8px] uppercase">{displayScore.shootout}</span>}
            </span>
          )}
        </div>
        <TeamSlot slot={match.visitor} matchesById={matchesById} getTeamFlag={getTeamFlag} theme={theme} />
      </div>

      <p className="mt-2 truncate pr-2 text-[9px] font-semibold text-white/35">{match.stadium}</p>
    </article>
  );
};

const GroupPanel = ({ group, side, getTeamFlag }: { group: GroupSummary; side: BracketSide; getTeamFlag: Props["getTeamFlag"] }) => {
  const [visibleTeam, setVisibleTeam] = useState<string | null>(null);

  return (
    <article className={`relative rounded-lg border-2 bg-black p-1.5 ${GROUP_THEME.border}`}>
      <div className={`absolute top-1/2 ${side === "left" ? "-right-3" : "-left-3"} h-px w-3 -translate-y-1/2 ${GROUP_THEME.connector}`} aria-hidden="true" />
      <div className={`mb-1.5 flex items-center justify-center rounded-md px-2 py-1 text-[10px] font-black uppercase ${GROUP_THEME.header}`}>
        <span>Grupo {group.group}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {group.teams.map((team) => {
          const labelVisible = visibleTeam === team;
          return (
            <button
              key={team}
              type="button"
              onClick={() => setVisibleTeam(labelVisible ? null : team)}
              className={`relative flex h-10 items-center justify-center overflow-hidden rounded-md border bg-white/[0.04] transition ${labelVisible ? "border-yellow-300/70" : "border-white/10 hover:border-white/25"}`}
              aria-label={`${labelVisible ? "Ocultar" : "Mostrar"} etiqueta de ${team}`}
              aria-pressed={labelVisible}
            >
              <span className="text-lg leading-none">{getTeamFlag(team)}</span>
              {labelVisible && (
                <span className={`absolute inset-x-0 bottom-0 truncate px-0.5 py-0.5 text-center text-[7px] font-black uppercase leading-none ${GROUP_THEME.badge}`}>
                  {getTeamBadgeLabel(team)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </article>
  );
};

const FlowMatch = ({ match, matchesById, getTeamFlag, side, compact = false }: { match: BracketMatch; matchesById: Map<number, Match>; getTeamFlag: Props["getTeamFlag"]; side: BracketSide; compact?: boolean }) => {
  const theme = STAGE_THEMES[match.stage];
  const local = getSlotLabel(match.local, matchesById);
  const visitor = getSlotLabel(match.visitor, matchesById);
  const displayScore = getDisplayMatchScore(match.realMatch);
  const hasScore = Boolean(displayScore);
  return (
    <div className="relative">
      <div className={`absolute top-1/2 h-px w-2 -translate-y-1/2 opacity-80 ${theme.panel} ${side === "left" ? "-left-2" : "-right-2"}`} aria-hidden="true" />
      <div className={`absolute top-1/2 h-px w-2 -translate-y-1/2 opacity-80 ${theme.panel} ${side === "left" ? "-right-2" : "-left-2"}`} aria-hidden="true" />
      <article
        className={`rounded-lg border-2 bg-black px-2 py-1.5 shadow-lg ${theme.border} ${theme.glow}`}
        title={`Partido ${match.id}: ${local.label} vs ${visitor.label}${match.realMatch ? ` - ${getStatusLabel(match.realMatch)}` : ""}`}
      >
        <p className={`mb-1 text-center text-[8px] font-black uppercase ${theme.text}`}>P{match.id}</p>
        {[local, visitor].map((slot, index) => (
          <div key={`${match.id}-${index}`} className="flex h-6 items-center gap-1.5 border-t border-white/10 first:border-t-0">
            {hasRealTeam(slot.label) ? <span className="text-xs leading-none">{getTeamFlag(slot.label)}</span> : null}
            <span className="min-w-0 flex-1 truncate text-[9px] font-black uppercase text-white">{compactLabel(slot.label)}</span>
            {hasScore && (
              <span className={`rounded px-1 text-[9px] font-black ${theme.header}`}>
                {index === 0 ? displayScore?.localScore : displayScore?.visitorScore}
              </span>
            )}
          </div>
        ))}
        {displayScore?.shootout && (
          <p className={`mt-1 truncate text-center text-[7px] font-black uppercase ${theme.text}`}>{displayScore.shootout}</p>
        )}
      </article>
      {!compact && <div className={`absolute bottom-[-0.45rem] top-[calc(50%+0.3rem)] w-px opacity-60 ${theme.panel} ${side === "left" ? "right-[-0.5rem]" : "left-[-0.5rem]"}`} aria-hidden="true" />}
    </div>
  );
};

export const KnockoutBracketView: React.FC<Props> = ({ getTeamFlag }) => {
  const bracketViewportRef = useRef<HTMLDivElement | null>(null);
  const [fixtures, setFixtures] = useState<KnockoutFixture[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [overview, setOverview] = useState<WorldCupOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPortraitMobile, setIsPortraitMobile] = useState(isMobilePortraitViewport);
  const [zoom, setZoom] = useState(1);

  const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
  const updateZoom = (nextZoom: number) => setZoom(clampZoom(nextZoom));
  const fitBracketToViewport = () => {
    const availableWidth = bracketViewportRef.current?.clientWidth || window.innerWidth;
    updateZoom(Math.min(1, availableWidth / BRACKET_DESIGN_WIDTH));
  };

  const loadBracket = async () => {
    setLoading(true);
    setError("");
    try {
      const [fixturesResponse, matchesResponse, overviewResponse] = await Promise.all([
        fetch("/api/knockout-fixtures", { cache: "no-store" }),
        fetch("/api/matches", { cache: "no-store" }),
        fetch("/api/world-cup-overview", { cache: "no-store" }).catch(() => null)
      ]);
      const [fixturesPayload, matchesPayload, overviewPayload] = await Promise.all([
        fixturesResponse.json(),
        matchesResponse.json(),
        overviewResponse?.ok ? overviewResponse.json() : Promise.resolve(null)
      ]);

      if (!fixturesResponse.ok) throw new Error(fixturesPayload.error || "No se pudo consultar el fixture de llaves.");
      if (!matchesResponse.ok) throw new Error(matchesPayload.error || "No se pudieron consultar los partidos reales.");

      setFixtures(fixturesPayload);
      setMatches(matchesPayload);
      setOverview(overviewPayload);
    } catch (err: any) {
      setError(err.message || "No se pudieron cargar las llaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px) and (orientation: portrait)");
    const updateOrientationGate = () => setIsPortraitMobile(query.matches);
    updateOrientationGate();
    query.addEventListener("change", updateOrientationGate);
    return () => query.removeEventListener("change", updateOrientationGate);
  }, []);

  useEffect(() => {
    void loadBracket();
    const timer = window.setInterval(() => void loadBracket(), 60_000);
    return () => window.clearInterval(timer);
  }, [isPortraitMobile]);

  useEffect(() => {
    fitBracketToViewport();
    const handleResize = () => fitBracketToViewport();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const matchesById = useMemo(() => new Map(matches.map((match) => [match.id, match])), [matches]);
  const bracketMatches = useMemo(() => buildBracketMatches(fixtures, matches), [fixtures, matches]);
  const bracketMatchesById = useMemo(() => new Map(bracketMatches.map((match) => [match.id, match])), [bracketMatches]);
  const matchesByStage = useMemo(() => {
    const grouped = new Map<KnockoutFixture["stage"], BracketMatch[]>();
    STAGE_ORDER.forEach((stage) => grouped.set(stage, []));
    bracketMatches.forEach((match) => {
      if (!grouped.has(match.stage)) return;
      grouped.get(match.stage)?.push(match);
    });
    grouped.forEach((stageMatches) => stageMatches.sort((a, b) => a.id - b.id));
    return grouped;
  }, [bracketMatches]);
  const thirdPlaceMatch = bracketMatches.find((match) => match.stage === "Tercer Puesto");
  const finalMatch = bracketMatchesById.get(104);
  const leftSideIds = useMemo(() => getVisualSideIds(LEFT_BRACKET_MATCH_IDS), []);
  const rightSideIds = useMemo(() => getVisualSideIds(RIGHT_BRACKET_MATCH_IDS), []);
  const leftGroups = useMemo(() => buildGroupSummaries(overview, ["A", "B", "C", "D", "E", "F"]), [overview]);
  const rightGroups = useMemo(() => buildGroupSummaries(overview, ["G", "H", "I", "J", "K", "L"]), [overview]);
  const sideStages: KnockoutFixture["stage"][] = ["16avos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal"];
  const leftFinalist = getResolvedSideWinner(101, bracketMatchesById, matchesById, "FINALISTA IZQUIERDO");
  const rightFinalist = getResolvedSideWinner(102, bracketMatchesById, matchesById, "FINALISTA DERECHO");
  const champion = getMatchWinner(finalMatch?.realMatch) || "CAMPEÓN DEL MUNDIAL FIFA 2026";
  const confirmedMatches = bracketMatches.filter((match) => match.realMatch && hasRealTeam(match.realMatch.local) && hasRealTeam(match.realMatch.visitor)).length;
  const finishedMatches = bracketMatches.filter((match) => match.realMatch?.status === "finished").length;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-black text-white shadow-2xl">
      <div className="relative bg-[radial-gradient(circle_at_center,rgba(253,224,71,0.18),transparent_22%),radial-gradient(circle_at_18%_20%,rgba(190,242,100,0.18),transparent_20%),radial-gradient(circle_at_82%_28%,rgba(244,114,182,0.16),transparent_22%),linear-gradient(135deg,#020617,#050816_50%,#0f172a)] px-4 py-6 sm:px-6">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime-300 to-transparent" />
        <div className="mb-6 text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-lime-200">FIFA WORLD CUP 2026</p>
          <h2 className="mt-1 text-4xl font-black uppercase leading-none text-white sm:text-5xl">Llaves</h2>
          <div className="mx-auto mt-3 inline-flex rounded-full bg-lime-300 px-5 py-1.5 text-xs font-black uppercase tracking-wide text-slate-950">
            Knockout stage
          </div>
          <p className="mx-auto mt-3 max-w-3xl text-sm font-semibold leading-6 text-slate-200">
            Cruces oficiales con equipos confirmados por API cuando ya existen. Los espacios pendientes quedan como slot FIFA para entender el camino.
          </p>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          {STAGE_ORDER.map((stage) => {
            const theme = STAGE_THEMES[stage];
            return (
              <span key={stage} className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${theme.header}`}>
                {STAGE_META[stage].title}
              </span>
            );
          })}
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/60 px-4 py-3">
            <p className="text-[10px] font-black uppercase text-lime-200">Cruces confirmados</p>
            <p className="mt-1 text-2xl font-black">{confirmedMatches}<span className="text-sm text-slate-400"> / {bracketMatches.length || 31}</span></p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 px-4 py-3">
            <p className="text-[10px] font-black uppercase text-sky-200">Partidos cerrados</p>
            <p className="mt-1 text-2xl font-black">{finishedMatches}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/60 px-4 py-3">
            <p className="text-[10px] font-black uppercase text-rose-200">Fuente visual</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-black"><ShieldCheck className="h-4 w-4" /> Fixture + API</p>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-lime-300/30 bg-black/60 px-4 py-3 text-xs font-semibold leading-5 text-slate-200">
          <span>Esta pantalla es solo informativa: no guarda pronosticos, no cambia puntajes y no modifica resultados.</span>
          <button
            type="button"
            onClick={() => void loadBracket()}
            disabled={loading}
            className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-lime-300 px-4 text-[10px] font-black uppercase text-slate-950 shadow-lg shadow-lime-500/20 transition hover:bg-lime-200 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-lime-200">Zoom de llaves</p>
            <p className="mt-1 text-xs font-semibold text-slate-300">
              {isPortraitMobile ? "En móvil vertical puedes alejar para ver todo; horizontal se lee mejor." : "Aleja para ver la llave completa de una sola mirada."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateZoom(zoom - ZOOM_STEP)}
              className="h-9 min-w-9 rounded-full border border-white/10 bg-white/10 px-3 text-sm font-black text-white hover:bg-white/20"
              aria-label="Alejar llaves"
              title="Alejar"
            >
              -
            </button>
            <span className="min-w-14 rounded-full bg-white px-3 py-2 text-center text-[10px] font-black text-slate-950">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => updateZoom(zoom + ZOOM_STEP)}
              className="h-9 min-w-9 rounded-full border border-white/10 bg-white/10 px-3 text-sm font-black text-white hover:bg-white/20"
              aria-label="Acercar llaves"
              title="Acercar"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => updateZoom(1)}
              className="h-9 rounded-full border border-white/10 bg-white/10 px-3 text-[10px] font-black uppercase text-white hover:bg-white/20"
            >
              100%
            </button>
            <button
              type="button"
              onClick={fitBracketToViewport}
              className="h-9 rounded-full bg-lime-300 px-4 text-[10px] font-black uppercase text-slate-950 hover:bg-lime-200"
            >
              Ver completo
            </button>
          </div>
        </div>

      {error ? (
        <div className="rounded-xl border border-rose-400 bg-rose-950/50 p-4 text-sm font-semibold text-rose-100">
          {error}
        </div>
      ) : loading && !bracketMatches.length ? (
        <div className="rounded-xl border border-white/10 p-8 text-center text-sm font-semibold text-slate-300">
          Cargando llaves del Mundial...
        </div>
      ) : (
        <>
          <div ref={bracketViewportRef} className="overflow-x-auto pb-4">
            <div
              className="grid min-w-[1200px] grid-cols-[112px_repeat(4,102px)_208px_repeat(4,102px)_112px] items-center gap-3 transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
            >
              <section className="space-y-2">
                <p className={`text-center text-[10px] font-black uppercase tracking-[0.22em] ${GROUP_THEME.title}`}>Grupos A-F</p>
                {leftGroups.map((group) => (
                  <React.Fragment key={group.group}>
                    <GroupPanel group={group} side="left" getTeamFlag={getTeamFlag} />
                  </React.Fragment>
                ))}
              </section>

              {sideStages.map((stage) => {
                const theme = STAGE_THEMES[stage];
                const stageMatches = getStageMatchesForSide(leftSideIds, stage, bracketMatches);
                return (
                  <section key={`left-${stage}`} className="relative space-y-2">
                    <div className={`rounded-lg px-2 py-1.5 text-center ${theme.header}`}>
                      <p className="text-[9px] font-black uppercase">{STAGE_META[stage].title}</p>
                    </div>
                    {stageMatches.map((match) => (
                      <React.Fragment key={match.id}>
                        <FlowMatch match={match} matchesById={matchesById} getTeamFlag={getTeamFlag} side="left" compact={stage === "Semifinal"} />
                      </React.Fragment>
                    ))}
                  </section>
                );
              })}

              <section className="relative flex min-h-[560px] flex-col items-center justify-center">
                <div className="absolute left-[-1rem] top-1/2 h-px w-4 -translate-y-1/2 bg-orange-400" aria-hidden="true" />
                <div className="absolute right-[-1rem] top-1/2 h-px w-4 -translate-y-1/2 bg-orange-400" aria-hidden="true" />
                <div className="w-full rounded-3xl border-2 border-yellow-300 bg-black/80 p-3 text-center shadow-2xl shadow-yellow-500/20">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-200">Final</p>
                  <img src={worldCupLogo} alt="El Pollon Mundialista" className="mx-auto mt-2 h-40 w-auto object-contain drop-shadow-[0_0_22px_rgba(250,204,21,0.35)]" />
                  <div className="mt-3 rounded-lg border border-yellow-300/40 bg-yellow-300 px-2 py-1.5 text-[10px] font-black uppercase text-slate-950" title={leftFinalist}>
                    {hasRealTeam(leftFinalist) ? getTeamFlag(leftFinalist) : null} {compactLabel(leftFinalist)}
                  </div>
                  <p className="my-2 text-sm font-black text-white/60">VS</p>
                  <div className="rounded-lg border border-yellow-300/40 bg-yellow-300 px-2 py-1.5 text-[10px] font-black uppercase text-slate-950" title={rightFinalist}>
                    {hasRealTeam(rightFinalist) ? getTeamFlag(rightFinalist) : null} {compactLabel(rightFinalist)}
                  </div>
                  <div className="mt-3 rounded-2xl border-2 border-yellow-200 bg-gradient-to-r from-yellow-300 via-lime-200 to-yellow-300 px-3 py-3 text-slate-950" title={champion}>
                    <Trophy className="mx-auto mb-1.5 h-6 w-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.18em]">Campeon del Mundial FIFA 2026</p>
                    <p className="mt-1 truncate text-sm font-black uppercase">{compactLabel(champion)}</p>
                  </div>
                </div>
              </section>

              {[...sideStages].reverse().map((stage) => {
                const theme = STAGE_THEMES[stage];
                const stageMatches = getStageMatchesForSide(rightSideIds, stage, bracketMatches);
                return (
                  <section key={`right-${stage}`} className="relative space-y-2">
                    <div className={`rounded-lg px-2 py-1.5 text-center ${theme.header}`}>
                      <p className="text-[9px] font-black uppercase">{STAGE_META[stage].title}</p>
                    </div>
                    {stageMatches.map((match) => (
                      <React.Fragment key={match.id}>
                        <FlowMatch match={match} matchesById={matchesById} getTeamFlag={getTeamFlag} side="right" compact={stage === "Semifinal"} />
                      </React.Fragment>
                    ))}
                  </section>
                );
              })}

              <section className="space-y-2">
                <p className={`text-center text-[10px] font-black uppercase tracking-[0.22em] ${GROUP_THEME.title}`}>Grupos G-L</p>
                {rightGroups.map((group) => (
                  <React.Fragment key={group.group}>
                    <GroupPanel group={group} side="right" getTeamFlag={getTeamFlag} />
                  </React.Fragment>
                ))}
              </section>
            </div>
          </div>

          <div className="hidden overflow-x-auto pb-3">
            <div className="grid min-w-[1180px] grid-cols-5 gap-4">
              {STAGE_ORDER.map((stage) => {
                const meta = STAGE_META[stage];
                const theme = STAGE_THEMES[stage];
                const stageMatches = matchesByStage.get(stage) || [];
                return (
                  <section key={stage} className={`rounded-2xl border-2 bg-black/75 p-2.5 ${theme.border}`}>
                    <div className={`mb-3 rounded-xl px-3 py-3 text-center ${theme.header}`}>
                      <p className="text-base font-black uppercase leading-none">{meta.title}</p>
                      <p className="text-[10px] font-bold uppercase text-slate-400">{meta.short} · {meta.count}</p>
                    </div>
                    <div className="space-y-2.5">
                      {stageMatches.map((match) => (
                        <React.Fragment key={match.id}>
                          <MatchCard match={match} matchesById={matchesById} getTeamFlag={getTeamFlag} theme={theme} />
                        </React.Fragment>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

          {thirdPlaceMatch && (
            <div className="mt-5 rounded-2xl border-2 border-cyan-300 bg-black/70 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-cyan-200" />
                <h3 className="text-sm font-black uppercase text-white">Tambien se juega tercer puesto</h3>
              </div>
              <div className="max-w-sm">
                <MatchCard match={thirdPlaceMatch} matchesById={matchesById} getTeamFlag={getTeamFlag} theme={STAGE_THEMES["Tercer Puesto"]} />
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </section>
  );
};
