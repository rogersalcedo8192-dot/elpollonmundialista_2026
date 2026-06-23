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

const TeamSlot = ({ slot, matchesById, getTeamFlag }: { slot: BracketSlot; matchesById: Map<number, Match>; getTeamFlag: Props["getTeamFlag"] }) => {
  const resolved = getSlotLabel(slot, matchesById);
  return (
    <div className={`min-h-12 rounded-lg border px-3 py-2 ${resolved.confirmed ? "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/25 dark:text-emerald-100" : "border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"}`}>
      <div className="flex min-w-0 items-center gap-2">
        {resolved.confirmed && slot.source !== "slot" ? <span className="shrink-0">{getTeamFlag(resolved.label)}</span> : <GitBranch className="h-3.5 w-3.5 shrink-0 text-slate-400" />}
        <span className="min-w-0 truncate text-xs font-black">{resolved.label}</span>
      </div>
      <p className="mt-0.5 truncate text-[9px] font-bold uppercase text-slate-400">{resolved.detail}</p>
    </div>
  );
};

const MatchCard = ({ match, matchesById, getTeamFlag }: { match: BracketMatch; matchesById: Map<number, Match>; getTeamFlag: Props["getTeamFlag"] }) => {
  const scoreReady = match.realMatch?.localScore !== null && match.realMatch?.visitorScore !== null;
  const playedDate = match.realMatch ? formatBogotaDate(match.realMatch.date) : "";

  return (
    <article className="relative rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">Partido {match.id}</p>
          <p className="truncate text-[11px] font-bold text-slate-600 dark:text-slate-300">{playedDate || match.dateLabel}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-black uppercase ${match.realMatch?.status === "finished" ? "bg-emerald-500 text-white" : match.realMatch?.status === "in_progress" ? "bg-rose-500 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:ring-slate-800"}`}>
          {getStatusLabel(match.realMatch)}
        </span>
      </div>

      <div className="space-y-2">
        <TeamSlot slot={match.local} matchesById={matchesById} getTeamFlag={getTeamFlag} />
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-[9px] font-black uppercase text-slate-400">vs</span>
          {scoreReady && (
            <span className="rounded-full bg-slate-950 px-2 py-1 text-xs font-black tabular-nums text-white dark:bg-white dark:text-slate-950">
              {match.realMatch?.localScore} - {match.realMatch?.visitorScore}
            </span>
          )}
        </div>
        <TeamSlot slot={match.visitor} matchesById={matchesById} getTeamFlag={getTeamFlag} />
      </div>

      <p className="mt-2 truncate text-[10px] font-semibold text-slate-400">{match.stadium}</p>
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
      <section className="min-h-[62vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-xl dark:border-slate-800">
        <div className="flex min-h-[62vh] flex-col items-center justify-center gap-5 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.24),transparent_36%),linear-gradient(135deg,#020617,#0f172a_62%,#064e3b)] px-6 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/10 shadow-2xl shadow-slate-950/30">
            <RotateCcw className="h-10 w-10 text-emerald-200" />
          </div>
          <div className="max-w-xs">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-200">LLAVES</p>
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
    <section className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 text-white shadow-xl dark:border-slate-800">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.28),transparent_34%),linear-gradient(135deg,#020617,#0f172a_58%,#064e3b)] px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-100">
                <GitBranch className="h-3.5 w-3.5" />
                LLAVES
              </div>
              <h2 className="text-2xl font-black sm:text-3xl">Camino a la gran final</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-200">
                Cruces oficiales del Mundial 2026 con equipos confirmados por los partidos reales cuando la API ya los publica. Los espacios pendientes quedan como slot FIFA para entender que viene despues.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadBracket()}
              disabled={loading}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-xs font-black text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-emerald-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-black uppercase text-emerald-100">Cruces confirmados</p>
              <p className="mt-1 text-2xl font-black">{confirmedMatches}<span className="text-sm text-slate-300"> / {bracketMatches.length || 31}</span></p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-black uppercase text-emerald-100">Partidos cerrados</p>
              <p className="mt-1 text-2xl font-black">{finishedMatches}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/10 px-4 py-3">
              <p className="text-[10px] font-black uppercase text-emerald-100">Fuente visual</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-black"><ShieldCheck className="h-4 w-4" /> Fixture + API</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/25 dark:text-amber-200">
        Esta pantalla es solo informativa: no guarda pronosticos, no cambia puntajes y no modifica resultados. Si un cruce aun no esta confirmado, muestra el cupo oficial para que el usuario entienda el posible camino.
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/25 dark:text-rose-200">
          {error}
        </div>
      ) : loading && !bracketMatches.length ? (
        <div className="rounded-xl border border-slate-200 p-8 text-center text-sm font-semibold text-slate-500 dark:border-slate-800">
          Cargando llaves del Mundial...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto pb-3">
            <div className="grid min-w-[1180px] grid-cols-5 gap-4">
              {STAGE_ORDER.map((stage) => {
                const meta = STAGE_META[stage];
                const stageMatches = matchesByStage.get(stage) || [];
                return (
                  <section key={stage} className="space-y-3">
                    <div className="sticky top-0 z-10 rounded-xl border border-slate-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
                      <p className="text-sm font-black text-slate-950 dark:text-white">{meta.title}</p>
                      <p className="text-[10px] font-bold uppercase text-slate-400">{meta.short} · {meta.count}</p>
                    </div>
                    <div className="space-y-3">
                      {stageMatches.map((match) => (
                        <React.Fragment key={match.id}>
                          <MatchCard match={match} matchesById={matchesById} getTeamFlag={getTeamFlag} />
                        </React.Fragment>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>

          {thirdPlaceMatch && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-black text-slate-950 dark:text-white">Tambien se juega tercer puesto</h3>
              </div>
              <div className="max-w-sm">
                <MatchCard match={thirdPlaceMatch} matchesById={matchesById} getTeamFlag={getTeamFlag} />
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};
