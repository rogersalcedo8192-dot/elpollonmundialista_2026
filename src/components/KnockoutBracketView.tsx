import React, { useEffect, useMemo, useState } from "react";
import { GitBranch, RefreshCw, RotateCcw, ShieldCheck, Trophy } from "lucide-react";
import type { KnockoutFixture, Match } from "../types";

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

type StageTheme = {
  panel: string;
  header: string;
  border: string;
  text: string;
  glow: string;
};

const STAGE_ORDER: KnockoutFixture["stage"][] = [
  "16avos de Final",
  "Octavos de Final",
  "Cuartos de Final",
  "Semifinal",
  "Final"
];

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

const getMatchWinner = (match?: Match) => {
  if (!match || match.status !== "finished" || match.localScore === null || match.visitorScore === null) return "";
  if (match.localScore > match.visitorScore) return match.local;
  if (match.visitorScore > match.localScore) return match.visitor;
  return "";
};

const getMatchLoser = (match?: Match) => {
  if (!match || match.status !== "finished" || match.localScore === null || match.visitorScore === null) return "";
  if (match.localScore < match.visitorScore) return match.local;
  if (match.visitorScore < match.localScore) return match.visitor;
  return "";
};

const hasRealTeam = (team: string) => {
  const normalized = normalizeText(team);
  return Boolean(normalized && !/^(Ganador|Perdedor) Partido/i.test(normalized) && !/Grupo [A-L]/i.test(normalized));
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
    const parsedLocal = parseSourceSlot(fixture.localSlot);
    const parsedVisitor = parseSourceSlot(fixture.visitorSlot);
    const realLocal = realMatch ? getSlotFromRealMatch(realMatch.local) : null;
    const realVisitor = realMatch ? getSlotFromRealMatch(realMatch.visitor) : null;

    return {
      id: fixture.id,
      stage: fixture.stage,
      dateLabel: normalizeText(fixture.dateLabel),
      stadium: normalizeText(fixture.stadium),
      local: realLocal || { ...parsedLocal, confirmed: false },
      visitor: realVisitor || { ...parsedVisitor, confirmed: false },
      realMatch
    };
  });
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
  const scoreReady = match.realMatch?.localScore !== null && match.realMatch?.visitorScore !== null;
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
            <span className={`rounded-full px-2 py-1 text-xs font-black tabular-nums ${theme.header}`}>
              {match.realMatch?.localScore} - {match.realMatch?.visitorScore}
            </span>
          )}
        </div>
        <TeamSlot slot={match.visitor} matchesById={matchesById} getTeamFlag={getTeamFlag} theme={theme} />
      </div>

      <p className="mt-2 truncate pr-2 text-[9px] font-semibold text-white/35">{match.stadium}</p>
    </article>
  );
};

export const KnockoutBracketView: React.FC<Props> = ({ getTeamFlag }) => {
  const [fixtures, setFixtures] = useState<KnockoutFixture[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPortraitMobile, setIsPortraitMobile] = useState(isMobilePortraitViewport);

  const loadBracket = async () => {
    setLoading(true);
    setError("");
    try {
      const [fixturesResponse, matchesResponse] = await Promise.all([
        fetch("/api/knockout-fixtures", { cache: "no-store" }),
        fetch("/api/matches", { cache: "no-store" })
      ]);
      const [fixturesPayload, matchesPayload] = await Promise.all([
        fixturesResponse.json(),
        matchesResponse.json()
      ]);

      if (!fixturesResponse.ok) throw new Error(fixturesPayload.error || "No se pudo consultar el fixture de llaves.");
      if (!matchesResponse.ok) throw new Error(matchesPayload.error || "No se pudieron consultar los partidos reales.");

      setFixtures(fixturesPayload);
      setMatches(matchesPayload);
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
    if (isPortraitMobile) {
      setLoading(false);
      return;
    }

    void loadBracket();
    const timer = window.setInterval(() => void loadBracket(), 60_000);
    return () => window.clearInterval(timer);
  }, [isPortraitMobile]);

  const matchesById = useMemo(() => new Map(matches.map((match) => [match.id, match])), [matches]);
  const bracketMatches = useMemo(() => buildBracketMatches(fixtures, matches), [fixtures, matches]);
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
  const confirmedMatches = bracketMatches.filter((match) => match.realMatch && hasRealTeam(match.realMatch.local) && hasRealTeam(match.realMatch.visitor)).length;
  const finishedMatches = bracketMatches.filter((match) => match.realMatch?.status === "finished").length;

  if (isPortraitMobile) {
    return (
      <section className="min-h-[62vh] overflow-hidden rounded-2xl border border-white/10 bg-black text-white shadow-xl">
        <div className="flex min-h-[62vh] flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_center,rgba(190,242,100,0.20),transparent_34%),linear-gradient(135deg,#020617,#050816_54%,#0f172a)] px-6 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-lime-300 bg-black shadow-2xl shadow-lime-500/20">
            <RotateCcw className="h-10 w-10 text-lime-200" />
          </div>
          <div className="max-w-xs">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-lime-200">WORLD CUP 2026</p>
            <h2 className="mt-2 text-3xl font-black leading-tight">Gira tu celular</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-200">
              Para ver las llaves completas del Mundial, usa este modulo con la pantalla en horizontal.
            </p>
          </div>
          <div className="grid w-full max-w-xs grid-cols-3 items-center gap-2 text-[9px] font-black uppercase text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/10 px-2 py-2">16avos</span>
            <span className="rounded-full border border-white/10 bg-white/10 px-2 py-2">Cuartos</span>
            <span className="rounded-full border border-white/10 bg-white/10 px-2 py-2">Final</span>
          </div>
        </div>
      </section>
    );
  }

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
          <div className="overflow-x-auto pb-3">
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
