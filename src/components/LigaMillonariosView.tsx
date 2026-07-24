import React, { useCallback, useEffect, useState } from "react";
import { BarChart3, Bell, Calendar, Check, CircleHelp, Eraser, FileSpreadsheet, RefreshCw, Trophy } from "lucide-react";
import type { User } from "../types";
import { MatchResultsTicker } from "./MatchResultsTicker";
import { LigaMillonariosTrivia } from "./LigaMillonariosTrivia";

type LigaMatch = {
  id: number;
  stage: string;
  local: string;
  visitor: string;
  date: string;
  stadium: string;
  status: "pending" | "in_progress" | "finished";
  localScore: number | null;
  visitorScore: number | null;
  localCrest: string;
  visitorCrest: string;
};

type LigaPrediction = {
  matchId: number;
  localScore: number;
  visitorScore: number;
  pointsEarned: number | null;
  goalDifferenceBonus: number;
};

type LigaRanking = {
  userId: string;
  userName: string;
  userAvatar?: string;
  userCountry?: string;
  points: number;
  exactCount: number;
  outcomeCount: number;
  predictCount: number;
  goalDifferenceHits: number;
  cumulativeScoreError: number;
  exactTeamScores: number;
  seasonBonusPoints: number;
  participationPoints: number;
  outcomePoints: number;
  exactScorePoints: number;
  exactDrawPoints: number;
  positionBonusPoints: number;
  leaguePointsBonusPoints: number;
  scorerPlayerBonusPoints: number;
  scorerGoalsBonusPoints: number;
  position: number;
};

type LigaSection = "como-jugar" | "resumen" | "pronosticos" | "grupo" | "favoritos" | "participar" | "asi-va" | "ranking" | "trivia" | "publicos" | "favoritos-publicos" | "notificaciones" | "reglas" | "admin";
type Props = { currentUser: User; getHeaders: () => Record<string, string>; activeSection: LigaSection };
type LigaMembership = { userId: string; status: "pending" | "paid" | "suspended"; paymentMethod?: string; paidAt?: string; user?: User };
type FinancialConfig = { entryFeeCop: number; prizePoolPercent: number; bankCommissionPercent: number; administrationPercent: number; firstPlacePercent: number; secondPlacePercent: number; thirdPlacePercent: number };
type Finances = { paidParticipants: number; grossRevenue: number; prizePool: number; bankCommission: number; administrationCosts: number; payouts: { first: number; second: number; third: number } };
type Standing = { position: number; team: string; crest: string; played: number; won: number; drawn: number; lost: number; goalDifference: number; points: number };
type Scorer = { position: number; player: string; team: string; crest: string; goals: number };

const MILLONARIOS_PLAYERS = [
  "Alex Castro", "Alex Moreno Paz", "Andrés Llinás", "Bayron García", "Brayan Campaz",
  "Carlos Sarabia", "Cristian Uparela", "Danovis Banguero", "Darwin Quintero", "David M. Silva",
  "Dewar Victoria", "Diego Novoa", "Edgar Elizalde", "Falcao García", "Francisco Chaverra",
  "Guillermo de Amores", "Johan Rodallega", "Jorge Arias", "Jorge Hurtado", "Julián Ángulo",
  "Leonardo Castro", "Mateo García", "Rodrigo Contreras", "Rodrigo Ureña", "Romario Espín",
  "Samuel Martin", "Sebastián del Castillo", "Sebastián Valencia", "Sergio Mosquera", "Stiven Vega"
] as const;

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

const LIGA_RANKING_HELP: Record<string, { title: string; description: string; example: string }> = {
  position: { title: "Posición", description: "Lugar actual dentro del ranking exclusivo de participantes pagos de Liga.", example: "#1 identifica al participante que lidera después de aplicar puntos y desempates." },
  participant: { title: "Participante", description: "Nombre público, avatar y país del usuario inscrito en la Liga.", example: "La fila azul con la marca TÚ corresponde a tu propia cuenta." },
  total: { title: "Puntos totales", description: "Suma de puntos obtenidos en partidos y bonos finales de temporada.", example: "Incluye marcadores, posición final, puntos de Millonarios y goleador." },
  participation: { title: "Participación · 5 puntos", description: "Puntos totales obtenidos en partidos donde el pronóstico no acertó el resultado.", example: "Pronosticaste 1-0 y el rival ganó: recibes 5 puntos por participar." },
  outcome: { title: "Resultado 1X2 · 15 puntos", description: "Puntos obtenidos por acertar si ganó Millonarios, hubo empate o ganó el rival, sin acertar el marcador exacto.", example: "Pronosticaste 1-0 y terminó 2-0: recibes 15 puntos." },
  exactWinner: { title: "Marcador exacto con ganador · 25 puntos", description: "Puntos por acertar exactamente los goles de ambos equipos cuando hubo un ganador.", example: "Pronosticaste 2-1 y el partido terminó 2-1: recibes 25 puntos." },
  exactDraw: { title: "Empate exacto · 35 puntos", description: "Puntos por acertar exactamente un marcador empatado.", example: "Pronosticaste 1-1 y terminó 1-1: recibes 35 puntos." },
  finalPosition: { title: "Bono por posición final", description: "Suma 100 puntos si acertaste el lugar exacto de Millonarios al finalizar el semestre.", example: "Elegiste puesto 4 y Millonarios terminó cuarto: +100 puntos." },
  leaguePoints: { title: "Bono por puntos de Millonarios", description: "Suma 100 puntos si acertaste la cantidad exacta de puntos conseguida por Millonarios.", example: "Pronosticaste 34 puntos y terminó con 34: +100 puntos." },
  scorer: { title: "Bono por goleador", description: "Suma 50 puntos si acertaste quién fue el máximo goleador de Millonarios.", example: "Elegiste al jugador que terminó como goleador del equipo: +50 puntos." },
  scorerGoals: { title: "Bono por goles del goleador", description: "Suma otros 50 puntos si, además del jugador, acertaste su cantidad exacta de goles.", example: "Acertaste goleador y 9 goles: +50 adicionales." },
  goalDifference: { title: "Diferencia de gol exacta", description: "Cuenta partidos donde acertaste la diferencia entre goles a favor y en contra. No suma puntos; sirve para desempatar.", example: "Pronosticaste 2-0 y terminó 4-2: ambas diferencias son +2, por eso cuenta un acierto de DG." },
  closeness: { title: "Distancia total de marcadores", description: "Suma cuántos goles se alejaron tus pronósticos de los resultados reales. Solo desempata y el número menor es mejor.", example: "Pronóstico 1-0 y resultado 2-1: diferencia de 1 gol por equipo, distancia total 2." },
  matches: { title: "Partidos puntuados", description: "Cantidad de partidos finalizados en los que registraste un pronóstico válido.", example: "Si ya terminaron 4 partidos que pronosticaste, aparecerá 4." }
};

export function LigaMillonariosView({ currentUser, getHeaders, activeSection }: Props) {
  const [matches, setMatches] = useState<LigaMatch[]>([]);
  const [predictions, setPredictions] = useState<LigaPrediction[]>([]);
  const [ranking, setRanking] = useState<LigaRanking[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; date: string }>>([]);
  const [drafts, setDrafts] = useState<Record<number, { local: number | ""; visitor: number | "" }>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [now, setNow] = useState(Date.now());
  const [special, setSpecial] = useState({ finalPosition: "", totalGoals: "", totalLeaguePoints: "" });
  const [scorer, setScorer] = useState({ playerName: "", exactGoals: "" });
  const [adminOutcome, setAdminOutcome] = useState({ finalPosition: "", totalGoals: "", totalLeaguePoints: "", playerNames: [] as string[], exactGoals: "" });
  const [membership, setMembership] = useState<LigaMembership | null>(null);
  const [adminMemberships, setAdminMemberships] = useState<LigaMembership[]>([]);
  const [financialConfig, setFinancialConfig] = useState<FinancialConfig>({ entryFeeCop: 20000, prizePoolPercent: 80, bankCommissionPercent: 3, administrationPercent: 17, firstPlacePercent: 80, secondPlacePercent: 15, thirdPlacePercent: 5 });
  const [finances, setFinances] = useState<Finances | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);
  const [publicPredictions, setPublicPredictions] = useState<{ locked: boolean; entries: Array<LigaPrediction & { userName: string }> }>({ locked: true, entries: [] });
  const [publicFavorites, setPublicFavorites] = useState<{ locked: boolean; entries: Array<{ userId: string; userName: string; finalPosition: number; totalGoals: number; totalLeaguePoints: number; scorer?: { playerName: string; exactGoals: number } | null }> }>({ locked: true, entries: [] });
  const [ligaGroups, setLigaGroups] = useState<Array<{ id: string; name: string; code: string; ownerId: string; memberIds: string[] }>>([]);
  const [groupName, setGroupName] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [rankingHelpOpen, setRankingHelpOpen] = useState(false);
  const [rankingColumnHelp, setRankingColumnHelp] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const headers = getHeaders();
      const [moduleRes, predictionsRes, rankingRes, notificationsRes, specialRes, scorerRes, membershipRes, adminMembershipsRes, adminOutcomesRes] = await Promise.all([
        fetch("/api/liga-millonarios"),
        fetch("/api/liga-millonarios/predictions", { headers }),
        fetch("/api/liga-millonarios/rankings", { headers }),
        fetch("/api/liga-millonarios/notifications", { headers }),
        fetch("/api/liga-millonarios/tiebreak-prediction", { headers }),
        fetch("/api/liga-millonarios/scorer-prediction", { headers }),
        fetch("/api/liga-millonarios/membership", { headers }),
        currentUser.role === "admin" || currentUser.role === "superadmin" ? fetch("/api/liga-millonarios/admin/memberships", { headers }) : Promise.resolve(null),
        currentUser.role === "admin" || currentUser.role === "superadmin" ? fetch("/api/liga-millonarios/admin/outcomes", { headers }) : Promise.resolve(null)
      ]);
      if (!moduleRes.ok) throw new Error("No se pudo cargar el módulo de Liga II.");
      const moduleData = await moduleRes.json();
      setFinancialConfig(moduleData.financialConfig);
      setFinances(moduleData.finances);
      setStandings(moduleData.standings || []);
      setScorers(moduleData.scorers || []);
      const predictionData: LigaPrediction[] = predictionsRes.ok ? await predictionsRes.json() : [];
      setMatches(moduleData.matches || []);
      setPredictions(predictionData);
      setRanking(rankingRes.ok ? await rankingRes.json() : []);
      setNotifications(notificationsRes.ok ? await notificationsRes.json() : []);
      if (specialRes.ok) {
        const savedSpecial = await specialRes.json();
        if (savedSpecial) setSpecial({ finalPosition: String(savedSpecial.finalPosition), totalGoals: String(savedSpecial.totalGoals), totalLeaguePoints: String(savedSpecial.totalLeaguePoints) });
      }
      if (scorerRes.ok) {
        const savedScorer = await scorerRes.json();
        if (savedScorer) setScorer({ playerName: savedScorer.playerName, exactGoals: String(savedScorer.exactGoals) });
      }
      if (membershipRes.ok) setMembership(await membershipRes.json());
      if (adminMembershipsRes?.ok) setAdminMemberships(await adminMembershipsRes.json());
      if (adminOutcomesRes?.ok) {
        const outcomes = await adminOutcomesRes.json();
        setAdminOutcome({
          finalPosition: outcomes.finalTiebreakOutcome ? String(outcomes.finalTiebreakOutcome.finalPosition) : "",
          totalGoals: outcomes.finalTiebreakOutcome ? String(outcomes.finalTiebreakOutcome.totalGoals) : "",
          totalLeaguePoints: outcomes.finalTiebreakOutcome ? String(outcomes.finalTiebreakOutcome.totalLeaguePoints) : "",
          playerNames: outcomes.scorerOutcome?.playerNames || [],
          exactGoals: outcomes.scorerOutcome ? String(outcomes.scorerOutcome.exactGoals) : ""
        });
      }
      setDrafts(Object.fromEntries(predictionData.map((prediction) => [prediction.matchId, { local: prediction.localScore, visitor: prediction.visitorScore }])));
    } catch (error: any) {
      setMessage(error.message || "No se pudo cargar el módulo.");
    } finally {
      setBusy(false);
    }
  // The authenticated user is the only identity input; getHeaders is recreated by App renders.
  // Depending on it here would produce a fetch loop.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!["publicos", "favoritos-publicos", "grupo"].includes(activeSection)) return;
    const headers = getHeaders();
    if (activeSection === "publicos") void fetch("/api/liga-millonarios/public-predictions", { headers }).then((response) => response.json()).then(setPublicPredictions);
    if (activeSection === "favoritos-publicos") void fetch("/api/liga-millonarios/public-favorites", { headers }).then((response) => response.json()).then(setPublicFavorites);
    if (activeSection === "grupo") void fetch("/api/liga-millonarios/groups", { headers }).then((response) => response.json()).then((data) => setLigaGroups(Array.isArray(data) ? data : []));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, currentUser.id]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");
    if (params.get("ligaPayment") !== "success" || !reference) return;
    void fetch("/api/liga-millonarios/payments/confirm", { method: "POST", headers: getHeaders(), body: JSON.stringify({ reference }) })
      .then(async (response) => ({ ok: response.ok, data: await response.json() }))
      .then(({ ok, data }) => {
        setMessage(data.message || data.error);
        if (ok) void load();
        params.delete("ligaPayment"); params.delete("reference");
        window.history.replaceState({}, "", `${window.location.pathname}${params.toString() ? `?${params}` : ""}`);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  const countdown = (date: string) => {
    const remaining = new Date(date).getTime() - 5 * 60_000 - now;
    if (remaining <= 0) return "Pronóstico cerrado";
    const days = Math.floor(remaining / 86_400_000);
    const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
    const minutes = Math.floor((remaining % 3_600_000) / 60_000);
    const seconds = Math.floor((remaining % 60_000) / 1000);
    return `Cierra en ${days ? `${days}d ` : ""}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const saveSpecial = async () => {
    const response = await fetch("/api/liga-millonarios/tiebreak-prediction", { method: "POST", headers: getHeaders(), body: JSON.stringify({ finalPosition: Number(special.finalPosition), totalGoals: Number(special.totalGoals), totalLeaguePoints: Number(special.totalLeaguePoints) }) });
    const data = await response.json();
    setMessage(data.message || data.error);
  };

  const saveScorer = async () => {
    const response = await fetch("/api/liga-millonarios/scorer-prediction", { method: "POST", headers: getHeaders(), body: JSON.stringify({ playerName: scorer.playerName, exactGoals: Number(scorer.exactGoals) }) });
    const data = await response.json();
    setMessage(data.message || data.error);
  };

  const joinLiga = async () => {
    const response = await fetch("/api/liga-millonarios/join", { method: "POST", headers: getHeaders() });
    const data = await response.json();
    setMessage(data.message || data.error);
    if (response.ok) { setMembership(data.membership); void load(); }
  };

  const payLiga = async () => {
    const response = await fetch("/api/liga-millonarios/payments/create", { method: "POST", headers: getHeaders() });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error);
    window.location.href = data.url;
  };

  const updateManualPayment = async (userId: string, status: "paid" | "pending", paymentMethod = "cash") => {
    const response = await fetch(`/api/liga-millonarios/admin/memberships/${userId}/payment`, { method: "PUT", headers: getHeaders(), body: JSON.stringify({ status, paymentMethod }) });
    const data = await response.json();
    setMessage(data.message || data.error);
    if (response.ok) void load();
  };

  const saveFinancialConfig = async () => {
    const response = await fetch("/api/liga-millonarios/admin/financial-config", { method: "PUT", headers: getHeaders(), body: JSON.stringify(financialConfig) });
    const data = await response.json();
    setMessage(data.message || data.error);
    if (response.ok) { setFinancialConfig(data.financialConfig); setFinances(data.finances); }
  };

  const syncFootballData = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/liga-millonarios/admin/sync-football-data", { method: "POST", headers: getHeaders() });
      const data = await response.json();
      setMessage(response.ok ? `${data.message} ${data.result?.updatedMatches || 0} partidos revisados.` : `${data.error || "No se pudo sincronizar."}${data.hint ? ` ${data.hint}` : ""}`);
      if (response.ok) void load();
    } finally {
      setBusy(false);
    }
  };

  const saveLigaGroup = async (join = false) => {
    const response = await fetch(join ? "/api/liga-millonarios/groups/join" : "/api/liga-millonarios/groups", { method: "POST", headers: getHeaders(), body: JSON.stringify(join ? { code: groupCode } : { name: groupName }) });
    const data = await response.json();
    setMessage(data.message || data.error);
    if (response.ok) {
      setGroupName(""); setGroupCode("");
      const groupsResponse = await fetch("/api/liga-millonarios/groups", { headers: getHeaders() });
      if (groupsResponse.ok) setLigaGroups(await groupsResponse.json());
    }
  };

  const closeSeasonBonuses = async () => {
    if (!adminOutcome.finalPosition || adminOutcome.totalGoals === "" || adminOutcome.totalLeaguePoints === "" || !adminOutcome.playerNames.length || adminOutcome.exactGoals === "") {
      setMessage("Completa todos los resultados finales antes de cerrar los bonos.");
      return;
    }
    setBusy(true);
    try {
      const [seasonResponse, scorerResponse] = await Promise.all([
        fetch("/api/liga-millonarios/admin/final-tiebreak-outcome", { method: "PUT", headers: getHeaders(), body: JSON.stringify({ finalPosition: Number(adminOutcome.finalPosition), totalGoals: Number(adminOutcome.totalGoals), totalLeaguePoints: Number(adminOutcome.totalLeaguePoints) }) }),
        fetch("/api/liga-millonarios/admin/scorer-outcome", { method: "PUT", headers: getHeaders(), body: JSON.stringify({ playerNames: adminOutcome.playerNames, exactGoals: Number(adminOutcome.exactGoals) }) })
      ]);
      const seasonData = await seasonResponse.json();
      const scorerData = await scorerResponse.json();
      setMessage(!seasonResponse.ok ? seasonData.error : !scorerResponse.ok ? scorerData.error : "Bonos finales guardados y ranking recalculado.");
      if (seasonResponse.ok && scorerResponse.ok) void load();
    } finally {
      setBusy(false);
    }
  };

  const registerResult = async (match: LigaMatch) => {
    const local = window.prompt(`Goles de ${match.local}`, match.localScore === null ? "" : String(match.localScore));
    if (local === null) return;
    const visitor = window.prompt(`Goles de ${match.visitor}`, match.visitorScore === null ? "" : String(match.visitorScore));
    if (visitor === null) return;
    const response = await fetch(`/api/liga-millonarios/admin/matches/${match.id}/result`, { method: "PUT", headers: getHeaders(), body: JSON.stringify({ localScore: Number(local), visitorScore: Number(visitor) }) });
    const data = await response.json();
    setMessage(data.message || data.error);
    if (response.ok) void load();
  };

  const savePrediction = async (matchId: number) => {
    const draft = drafts[matchId];
    if (!draft || draft.local === "" || draft.visitor === "") return setMessage("Ingresa ambos marcadores.");
    setBusy(true);
    const response = await fetch("/api/liga-millonarios/predictions", {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ matchId, localScore: draft.local, visitorScore: draft.visitor })
    });
    const data = await response.json();
    setMessage(data.message || data.error);
    setBusy(false);
    if (response.ok) void load();
  };

  const clearPrediction = async (matchId: number) => {
    const response = await fetch(`/api/liga-millonarios/predictions/${matchId}`, { method: "DELETE", headers: getHeaders() });
    const data = await response.json();
    setMessage(data.message || data.error);
    if (response.ok) void load();
  };

  const predictionByMatch = new Map<number, LigaPrediction>(predictions.map((prediction) => [prediction.matchId, prediction]));
  const myRanking = ranking.find((row) => row.userId === currentUser.id);
  const isAdmin = currentUser.role === "admin" || currentUser.role === "superadmin";
  const hasLigaAccess = isAdmin || membership?.status === "paid";
  const formatCop = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value || 0);
  const registeredPredictions = predictions.length;
  const pendingPredictions = matches.filter((match) => match.status === "pending" && !predictionByMatch.has(match.id)).length;
  const upcomingMatches = [...matches].filter((match) => match.status === "pending").sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 3);
  const getLigaCrest = (teamName: string) => {
    const match = matches.find((candidate) => candidate.local === teamName || candidate.visitor === teamName);
    const crest = match?.local === teamName ? match.localCrest : match?.visitorCrest;
    return crest ? <img src={crest} alt="" className="h-6 w-6 object-contain" /> : <span>⚽</span>;
  };
  const exportLigaRanking = () => {
    const headers = ["Posición", "Participante", "Total", "5 puntos", "1X2", "Exacto ganador", "Empate exacto", "Bono posición", "Bono puntos", "Bono goleador", "Bono goles", "DG exacta", "Error", "Partidos"];
    const rows = ranking.map((row) => [row.position, row.userName, row.points, row.participationPoints, row.outcomePoints, row.exactScorePoints, row.exactDrawPoints, row.positionBonusPoints, row.leaguePointsBonusPoints, row.scorerPlayerBonusPoints, row.scorerGoalsBonusPoints, row.goalDifferenceHits, row.cumulativeScoreError, row.predictCount]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    link.download = "polloranking-liga-ii-2026.csv";
    link.click(); URL.revokeObjectURL(link.href);
  };
  const shareMyLigaRanking = async () => {
    if (!myRanking) return;
    const text = `Voy #${myRanking.position} con ${myRanking.points} puntos en el Pollón Liga II de Millonarios.`;
    if (navigator.share) await navigator.share({ title: "Mi PolloRanking Liga II", text, url: window.location.origin }).catch(() => undefined);
    else await navigator.clipboard.writeText(`${text} ${window.location.origin}`);
  };
  const rankingHeader = (key: keyof typeof LIGA_RANKING_HELP, label: string) => <span className="flex items-center justify-center gap-1"><span>{label}</span><button type="button" onClick={() => setRankingColumnHelp((current) => current === key ? null : key)} className={`inline-flex h-5 w-5 items-center justify-center rounded ${rankingColumnHelp === key ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300" : "text-slate-400 hover:bg-indigo-100 hover:text-indigo-700"}`} title={`Explicar ${LIGA_RANKING_HELP[key].title}`} aria-label={`Explicar columna ${LIGA_RANKING_HELP[key].title}`}><CircleHelp className="h-3 w-3" /></button></span>;

  return (
    <section className="space-y-5">
      <section className={`${activeSection === "como-jugar" ? "space-y-5" : "hidden"}`}><div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-blue-600" /> Cómo jugar · Liga II</h2><p className="mt-1 text-xs text-slate-500">Participa únicamente con los partidos de Millonarios.</p></div><div className="grid gap-4 md:grid-cols-3">{["Confirma la inscripción independiente de Liga.", "Registra cada marcador hasta 5 minutos antes del partido.", "Suma puntos, bonos especiales y compite en el PolloRanking."].map((text, index) => <div key={text} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-black text-blue-800">{index + 1}</span><p className="mt-3 text-sm font-semibold">{text}</p></div>)}</div></section>
      <div className={`${activeSection === "resumen" ? "space-y-6" : "hidden"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div><h2 className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-blue-600" /> Mi Resumen & Evolución de Puntos</h2><p className="mt-1 text-xs text-slate-500">Sigue tu progreso, aciertos y estadísticas en el Pollón de Millonarios.</p></div>
          <button type="button" onClick={() => void load()} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900" aria-label="Actualizar"><RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /></button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Puntos totales", value: myRanking?.points || 0, detail: `Bonos: ${myRanking?.seasonBonusPoints || 0}`, icon: Trophy, color: "text-amber-600" },
            { label: "Posición", value: `#${myRanking?.position || "-"}`, detail: `${ranking.length} participantes`, icon: BarChart3, color: "text-blue-600" },
            { label: "Marcadores exactos", value: myRanking?.exactCount || 0, detail: `DG exactas: ${myRanking?.goalDifferenceHits || 0}`, icon: Check, color: "text-emerald-600" },
            { label: "Pronósticos", value: registeredPredictions, detail: `${pendingPredictions} pendientes`, icon: Calendar, color: "text-violet-600" }
          ].map((card) => { const Icon = card.icon; return <div key={card.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{card.label}</span><Icon className={`h-4 w-4 ${card.color}`} /></div><strong className="mt-3 block text-2xl font-black text-slate-950 dark:text-white">{card.value}</strong><span className="mt-1 block text-[10px] text-slate-500">{card.detail}</span></div>; })}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/30"><h3 className="text-sm font-black text-blue-950 dark:text-blue-100">Estado de inscripción</h3><p className="mt-2 text-xs text-blue-800 dark:text-blue-200">{isAdmin ? "Acceso administrativo" : membership?.status === "paid" ? "Tu inscripción está confirmada. Ya puedes registrar pronósticos y competir por premios." : "Debes confirmar la inscripción independiente de Liga para participar."}</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-white shadow-sm"><h3 className="flex items-center gap-2 text-sm font-black"><Trophy className="h-4 w-4 text-amber-400" /> Resumen del Premio</h3><div className="mt-3 space-y-2 text-xs"><div className="flex justify-between border-b border-white/10 pb-2"><span>Participantes pagos</span><b>{finances?.paidParticipants || 0}</b></div><div className="flex justify-between border-b border-white/10 pb-2"><span>Total recaudado</span><b>{formatCop(finances?.grossRevenue || 0)}</b></div><div className="flex justify-between"><span>Premio acumulado</span><b className="text-blue-300">{formatCop(finances?.prizePool || 0)}</b></div></div></div>
        </div>
        <div className="rounded-2xl border border-blue-900/40 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-5 text-white shadow-sm"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-200"><Calendar className="h-4 w-4" /> Próximos 3 partidos</h3><span className="text-[9px] font-bold uppercase text-emerald-300">Millonarios</span></div><div className="mt-4 grid gap-3 md:grid-cols-3">{upcomingMatches.map((match) => <div key={match.id} className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="flex justify-between text-[9px] text-slate-400"><span>{match.stage}</span><span>{new Date(match.date).toLocaleDateString("es-CO", { timeZone: "America/Bogota", day: "numeric", month: "short" })}</span></div><div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-xs font-bold"><span className="flex flex-col items-center gap-1">{getLigaCrest(match.local)}<span>{match.local}</span></span><span className="text-blue-300">VS</span><span className="flex flex-col items-center gap-1">{getLigaCrest(match.visitor)}<span>{match.visitor}</span></span></div><p className="mt-3 text-center text-[10px] text-slate-400">{countdown(match.date)}</p></div>)}</div>{!upcomingMatches.length && <p className="mt-4 text-xs text-slate-400">No hay próximos partidos pendientes.</p>}</div>
      </div>

      {message && <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-900">{message}</div>}

      <div id="liga-resumen" />
      <section className={`${activeSection === "participar" ? "space-y-5" : "hidden"}`}><div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-blue-600" /> Participar en Polla · Liga II</h2><p className="mt-1 text-xs text-slate-500">Esta inscripción y su bolsa de premios son independientes del Mundial.</p></div>
      {!isAdmin && !hasLigaAccess && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950 shadow-sm">
          <h3 className="text-lg font-black">Inscripción independiente de Liga II</h3>
          <p className="mt-1 text-sm">Tu cuenta sigue siendo la misma, pero este Pollón requiere una inscripción y pago propios de <strong>{formatCop(financialConfig.entryFeeCop)}</strong>.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {!membership && <button type="button" onClick={() => void joinLiga()} className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white">Inscribirme en Liga</button>}
            {membership?.status === "pending" && <button type="button" onClick={() => void payLiga()} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white">Pagar con Wompi</button>}
            {membership?.status === "pending" && <span className="self-center text-xs">También puedes pagar por efectivo o transferencia y solicitar activación al administrador.</span>}
          </div>
        </div>
      )}
      {hasLigaAccess && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"><h3 className="font-black">Inscripción confirmada</h3><p className="mt-1 text-sm">Ya puedes registrar pronósticos y participar por una bolsa actual de {formatCop(finances?.prizePool || 0)}.</p></div>}
      </section>

      <section className={`${activeSection === "grupo" ? "space-y-5" : "hidden"}`}><div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-blue-600" /> Polla grupal · Liga II</h2><p className="mt-1 text-xs text-slate-500">Crea un grupo privado o entra con el código compartido por su organizador.</p></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-black">Crear grupo</h3><input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Nombre del grupo" className="mt-3 w-full rounded-xl border p-3 dark:bg-slate-950" /><button type="button" onClick={() => void saveLigaGroup(false)} className="mt-3 w-full rounded-xl bg-blue-700 p-3 text-sm font-black text-white">Crear Polla grupal</button></div><div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-black">Unirme con código</h3><input value={groupCode} onChange={(event) => setGroupCode(event.target.value.toUpperCase())} placeholder="Código" className="mt-3 w-full rounded-xl border p-3 font-mono uppercase dark:bg-slate-950" /><button type="button" onClick={() => void saveLigaGroup(true)} className="mt-3 w-full rounded-xl bg-slate-900 p-3 text-sm font-black text-white">Unirme al grupo</button></div></div><div className="grid gap-3 md:grid-cols-2">{ligaGroups.map((group) => <div key={group.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><strong>{group.name}</strong><p className="mt-1 text-xs text-slate-500">Código: <b className="font-mono text-blue-700">{group.code}</b> · {group.memberIds.length} integrantes</p></div>)}</div></section>

      <section id="liga-asi-va" className={`${activeSection === "asi-va" ? "space-y-4" : "hidden"}`}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h2 className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-blue-600" /> Así va la Liga BetPlay II 2026</h2>
          <p className="mt-1 text-xs text-slate-500">Consulta la clasificación oficial y los goleadores del campeonato.</p>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b p-4 font-black dark:border-slate-800">Tabla de posiciones</div>
            <div className="max-h-96 overflow-auto"><table className="w-full text-xs"><thead className="sticky top-0 bg-slate-100 dark:bg-slate-800"><tr><th className="p-2">#</th><th className="p-2 text-left">Equipo</th><th>PJ</th><th>DG</th><th>PTS</th></tr></thead><tbody>{standings.map((row) => <tr key={row.team} className={row.team === "Millonarios" ? "bg-blue-50 font-black text-blue-900 dark:bg-blue-950 dark:text-blue-100" : "border-t dark:border-slate-800"}><td className="p-2 text-center">{row.position}</td><td className="flex items-center gap-2 p-2"><img src={row.crest} alt="" className="h-6 w-6 object-contain" />{row.team}</td><td className="text-center">{row.played}</td><td className="text-center">{row.goalDifference}</td><td className="text-center font-black">{row.points}</td></tr>)}</tbody></table></div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b p-4 font-black dark:border-slate-800">Tabla de goleadores</div>
            <div className="max-h-96 overflow-auto">{scorers.length ? scorers.map((row) => <div key={`${row.player}-${row.team}`} className="grid grid-cols-[2rem_2rem_1fr_auto] items-center gap-2 border-b p-3 text-xs last:border-0 dark:border-slate-800"><strong>#{row.position}</strong><img src={row.crest} alt="" className="h-7 w-7 object-contain" /><span><strong className="block">{row.player}</strong><small>{row.team}</small></span><strong>{row.goals} goles</strong></div>) : <p className="p-5 text-sm text-slate-500">La tabla de goleadores se habilitará cuando comience el torneo.</p>}</div>
          </div>
        </div>
      </section>

      <div className={`${["pronosticos", "favoritos", "ranking", "notificaciones", "admin"].includes(activeSection) ? "grid" : "hidden"} gap-5 xl:grid-cols-[1.6fr_1fr]`}>
        <div id="liga-pronosticos" className={activeSection === "pronosticos" ? "space-y-3" : "hidden"}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800"><div><h2 className="flex items-center gap-2 text-xl font-bold"><Calendar className="h-5 w-5 text-blue-600" /> Calendario & Pronósticos</h2><p className="mt-1 text-xs text-slate-500">Introduce marcadores. El registro cierra cinco minutos antes de cada partido.</p></div><div className="flex gap-4 rounded-xl bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"><span>Registrados: <b>{registeredPredictions}</b></span><span>Pendientes: <b>{pendingPredictions}</b></span></div></div>
          {!hasLigaAccess && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">Para guardar o modificar pronósticos debes confirmar el pago de inscripción de Liga.</div>}
          {matches.map((match) => {
            const prediction = predictionByMatch.get(match.id);
            const closed = !hasLigaAccess || match.status !== "pending" || Date.now() >= new Date(match.date).getTime() - 5 * 60_000;
            const draft = drafts[match.id] || { local: "", visitor: "" };
            return (
              <article key={match.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><strong className="text-blue-700 dark:text-sky-300">{match.stage}</strong><span>{new Date(match.date).toLocaleString("es-CO", { timeZone: "America/Bogota", dateStyle: "medium", timeStyle: "short" })}</span></div>
                <div className="my-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center font-black">
                  <span className="flex flex-col items-center gap-2"><img src={match.localCrest} alt={`Escudo ${match.local}`} className="h-14 w-14 object-contain" /><span>{match.local}</span><small className="text-[10px] font-bold uppercase text-slate-400">Local</small></span>
                  <span className="text-slate-400">VS</span>
                  <span className="flex flex-col items-center gap-2"><img src={match.visitorCrest} alt={`Escudo ${match.visitor}`} className="h-14 w-14 object-contain" /><span>{match.visitor}</span><small className="text-[10px] font-bold uppercase text-slate-400">Visitante</small></span>
                </div>
                {match.status === "finished" ? (
                  <div className="text-center"><strong className="text-2xl">{match.localScore} - {match.visitorScore}</strong><p className="mt-1 text-xs text-slate-500">Tu puntaje: {prediction?.pointsEarned ?? 0} · La diferencia de gol solo desempata</p></div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <input disabled={closed} type="number" min="0" value={draft.local} onChange={(event) => setDrafts((current) => ({ ...current, [match.id]: { ...draft, local: event.target.value === "" ? "" : Number(event.target.value) } }))} className="h-11 w-16 rounded-xl border text-center font-black dark:bg-slate-950" />
                    <span>-</span>
                    <input disabled={closed} type="number" min="0" value={draft.visitor} onChange={(event) => setDrafts((current) => ({ ...current, [match.id]: { ...draft, visitor: event.target.value === "" ? "" : Number(event.target.value) } }))} className="h-11 w-16 rounded-xl border text-center font-black dark:bg-slate-950" />
                    <button disabled={closed || busy} onClick={() => void savePrediction(match.id)} className="ml-2 rounded-xl bg-blue-700 p-3 text-white disabled:opacity-40" title="Guardar"><Check className="h-5 w-5" /></button>
                    {prediction && <button disabled={closed || busy} onClick={() => void clearPrediction(match.id)} className="rounded-xl bg-slate-100 p-3 text-slate-700 disabled:opacity-40" title="Borrar"><Eraser className="h-5 w-5" /></button>}
                  </div>
                )}
                <p className="mt-3 text-center text-[11px] text-slate-500">{match.stadium} · <strong className={closed ? "text-rose-600" : "text-blue-600"}>{countdown(match.date)}</strong></p>
                {(currentUser.role === "admin" || currentUser.role === "superadmin") && <button type="button" onClick={() => void registerResult(match)} className="mt-3 w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-black text-amber-900">Registrar o corregir resultado</button>}
              </article>
            );
          })}
        </div>

        <div className={`${activeSection === "pronosticos" ? "space-y-5" : "xl:col-span-2"}`}>
          {activeSection === "favoritos" && <div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-blue-600" /> Favoritos del Torneo</h2><p className="mt-1 text-xs text-slate-500">Pronostica la campaña final y el goleador de Millonarios.</p></div>}
          {isAdmin && activeSection === "admin" && (
            <div id="liga-admin" className="space-y-5 scroll-mt-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800"><div><h2 className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-blue-600" /> Administración · Pollón Liga II</h2><p className="mt-1 text-xs text-slate-500">Configura la inscripción, la bolsa de premios y los pagos independientes de este torneo.</p></div><button type="button" disabled={busy} onClick={() => void syncFootballData()} className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800 disabled:opacity-50 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"><RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} /> Sincronizar football-data.org</button></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">Pagos confirmados<strong className="block text-lg">{finances?.paidParticipants || 0}</strong></div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">Bolsa de premios<strong className="block text-lg">{formatCop(finances?.prizePool || 0)}</strong></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {([
                  ["entryFeeCop", "Inscripción COP"], ["prizePoolPercent", "% premios"], ["bankCommissionPercent", "% comisión bancaria"], ["administrationPercent", "% administración"],
                  ["firstPlacePercent", "% primer puesto"], ["secondPlacePercent", "% segundo puesto"], ["thirdPlacePercent", "% tercer puesto"]
                ] as Array<[keyof FinancialConfig, string]>).map(([key, label]) => <label key={key} className="text-[10px] font-bold">{label}<input type="number" min="0" value={financialConfig[key]} onChange={(event) => setFinancialConfig((current) => ({ ...current, [key]: Number(event.target.value) }))} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-slate-900" /></label>)}
              </div>
              <p className="mt-2 text-[10px]">Premios + comisión + administración deben sumar 100%. La distribución de puestos también debe sumar 100%.</p>
              <button type="button" onClick={() => void saveFinancialConfig()} className="mt-3 w-full rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white">Guardar finanzas de Liga</button>
              <div className="mt-4 max-h-64 space-y-2 overflow-auto">
                {adminMemberships.map((item) => <div key={item.userId} className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800"><span className="min-w-0 truncate"><strong className="block truncate">{item.user?.name || item.userId}</strong>{item.status} {item.paymentMethod ? `· ${item.paymentMethod}` : ""}</span><button type="button" onClick={() => void updateManualPayment(item.userId, item.status === "paid" ? "pending" : "paid", "cash")} className={`shrink-0 rounded-lg px-2 py-1 font-black ${item.status === "paid" ? "bg-slate-200" : "bg-emerald-600 text-white"}`}>{item.status === "paid" ? "Revertir" : "Marcar pago efectivo"}</button></div>)}
              </div>
              </div>
            </div>
          )}
          <div className={`${activeSection === "favoritos" ? "block" : "hidden"} rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950`}>
            <h3 className="font-black text-blue-950 dark:text-blue-100">Pronósticos especiales de desempate</h3>
            <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">La posición final exacta vale 100 puntos y los puntos exactos de Millonarios valen otros 100. Los goles totales solo desempatan.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <label className="text-[10px] font-bold">Posición final<select value={special.finalPosition} onChange={(event) => setSpecial((current) => ({ ...current, finalPosition: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona</option>{range(1, 19).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="text-[10px] font-bold">Goles Millos<select value={special.totalGoals} onChange={(event) => setSpecial((current) => ({ ...current, totalGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona</option>{range(0, 50).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="text-[10px] font-bold">Puntos Millos<select value={special.totalLeaguePoints} onChange={(event) => setSpecial((current) => ({ ...current, totalLeaguePoints: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona</option>{range(0, 57).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            </div>
            <button type="button" onClick={() => void saveSpecial()} className="mt-3 w-full rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white">Guardar desempates</button>
          </div>
          <div className={`${activeSection === "favoritos" ? "block" : "hidden"} rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950`}>
            <h3 className="font-black text-amber-950 dark:text-amber-100">Goleador de Millonarios</h3>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">50 puntos por acertar el jugador y 50 adicionales por acertar también sus goles exactos.</p>
            <div className="mt-3 grid grid-cols-[1fr_7rem] gap-2">
              <label className="text-[10px] font-bold">Nombre del jugador<select value={scorer.playerName} onChange={(event) => setScorer((current) => ({ ...current, playerName: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona un jugador</option>{scorer.playerName && !MILLONARIOS_PLAYERS.includes(scorer.playerName as typeof MILLONARIOS_PLAYERS[number]) && <option value={scorer.playerName}>{scorer.playerName}</option>}{MILLONARIOS_PLAYERS.map((player) => <option key={player} value={player}>{player}</option>)}</select></label>
              <label className="text-[10px] font-bold">Goles exactos<select value={scorer.exactGoals} onChange={(event) => setScorer((current) => ({ ...current, exactGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona</option>{range(0, 30).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            </div>
            <button type="button" onClick={() => void saveScorer()} className="mt-3 w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-black text-white">Guardar goleador</button>
          </div>
          {activeSection === "admin" && (currentUser.role === "admin" || currentUser.role === "superadmin") && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="font-black">Cierre de bonos finales</h3>
              <p className="mt-1 text-xs text-slate-500">Registra los resultados oficiales. Puedes elegir varios jugadores si comparten el título de goleador.</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <label className="text-[10px] font-bold">Posición final<select value={adminOutcome.finalPosition} onChange={(event) => setAdminOutcome((current) => ({ ...current, finalPosition: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-slate-950"><option value="">Selecciona</option>{range(1, 19).map((value) => <option key={value}>{value}</option>)}</select></label>
                <label className="text-[10px] font-bold">Goles Millos<select value={adminOutcome.totalGoals} onChange={(event) => setAdminOutcome((current) => ({ ...current, totalGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-slate-950"><option value="">Selecciona</option>{range(0, 50).map((value) => <option key={value}>{value}</option>)}</select></label>
                <label className="text-[10px] font-bold">Puntos Millos<select value={adminOutcome.totalLeaguePoints} onChange={(event) => setAdminOutcome((current) => ({ ...current, totalLeaguePoints: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-slate-950"><option value="">Selecciona</option>{range(0, 57).map((value) => <option key={value}>{value}</option>)}</select></label>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_9rem]">
                <fieldset><legend className="text-[10px] font-bold">Goleador(es) de Millonarios</legend><div className="mt-1 grid max-h-52 grid-cols-1 gap-1 overflow-auto rounded-xl border border-slate-200 p-2 sm:grid-cols-2 dark:border-slate-700">{MILLONARIOS_PLAYERS.map((player) => <label key={player} className={`flex cursor-pointer items-center gap-2 rounded-lg p-2 text-xs ${adminOutcome.playerNames.includes(player) ? "bg-blue-50 font-bold text-blue-900 dark:bg-blue-950 dark:text-blue-100" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}><input type="checkbox" checked={adminOutcome.playerNames.includes(player)} onChange={(event) => setAdminOutcome((current) => ({ ...current, playerNames: event.target.checked ? [...current.playerNames, player] : current.playerNames.filter((name) => name !== player) }))} />{player}</label>)}</div></fieldset>
                <label className="text-[10px] font-bold">Goles del goleador<select value={adminOutcome.exactGoals} onChange={(event) => setAdminOutcome((current) => ({ ...current, exactGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-slate-950"><option value="">Selecciona</option>{range(0, 30).map((value) => <option key={value}>{value}</option>)}</select></label>
              </div>
              <button type="button" disabled={busy} onClick={() => void closeSeasonBonuses()} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white disabled:opacity-50 dark:bg-blue-700">Guardar resultados y recalcular bonos</button>
            </div>
          )}
          <div id="liga-ranking" className={`${activeSection === "ranking" ? "space-y-5" : "hidden"}`}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800"><div><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-blue-600" /> PolloRanking · Liga II</h2><p className="mt-1 text-xs text-slate-500"><strong>Usuarios pagos:</strong> clasificación exclusiva de este Pollón, ordenada con los desempates de Liga.</p></div><div className="flex gap-2"><button type="button" onClick={() => setRankingHelpOpen((current) => !current)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold dark:border-slate-700">¿Cómo se ordena?</button><button type="button" onClick={exportLigaRanking} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"><FileSpreadsheet className="h-4 w-4" /> Exportar CSV</button></div></div>
            {myRanking && <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-amber-50 p-5 shadow-sm dark:border-blue-900 dark:from-blue-950/30 dark:to-amber-950/20"><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex min-w-0 items-center gap-3"><img src={currentUser.avatar} alt="" className="h-14 w-14 shrink-0 rounded-full border-2 border-amber-400 object-cover" /><div className="min-w-0"><span className="text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">Tu avance en Liga II</span><h3 className="truncate text-base font-black">Puesto #{myRanking.position} · {myRanking.points} puntos</h3><p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">{myRanking.exactCount} exactos · {myRanking.goalDifferenceHits} diferencias exactas · {myRanking.seasonBonusPoints} puntos en bonos</p></div></div><button type="button" onClick={() => void shareMyLigaRanking()} className="rounded-xl bg-blue-700 px-4 py-3 text-xs font-black text-white">Compartir avance</button></div></div>}
            {rankingHelpOpen && <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-xs text-indigo-950 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-100"><h3 className="font-black">Orden y desempates</h3><p className="mt-2 leading-relaxed">1. Puntos totales · 2. Marcadores exactos · 3. Diferencias de gol exactas · 4. Menor distancia total de marcadores · 5. Marcadores exactos por equipo · 6. Aciertos 1X2 · 7. Pronósticos especiales · 8. Nombre.</p><p className="mt-2 font-semibold">DG y distancia no suman puntos: únicamente resuelven empates. En “Distancia” gana el número menor porque significa que los pronósticos estuvieron más cerca de los resultados reales.</p></div>}
            {rankingColumnHelp && <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-900 dark:bg-indigo-950/25"><p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">¿Qué significa esta columna?</p><h3 className="mt-1 text-sm font-black">{LIGA_RANKING_HELP[rankingColumnHelp].title}</h3><p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{LIGA_RANKING_HELP[rankingColumnHelp].description}</p><p className="mt-2 rounded-lg bg-white/80 px-3 py-2 text-xs font-semibold text-indigo-950 dark:bg-slate-900/70 dark:text-indigo-200">{LIGA_RANKING_HELP[rankingColumnHelp].example}</p></div>}
            <p className="text-[11px] font-semibold text-slate-500 md:hidden">Desliza la tabla horizontalmente para consultar todo el detalle.</p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="overflow-x-auto"><table className="min-w-[1320px] w-full text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800"><tr><th className="sticky left-0 z-20 w-12 bg-slate-50 p-3 text-center dark:bg-slate-800">{rankingHeader("position", "Pos.")}</th><th className="sticky left-12 z-20 min-w-44 bg-slate-50 p-3 text-left dark:bg-slate-800">{rankingHeader("participant", "Participante")}</th><th className="p-3 text-center">{rankingHeader("total", "Total")}</th><th className="p-3 text-center">{rankingHeader("participation", "Participación")}</th><th className="p-3 text-center">{rankingHeader("outcome", "Resultado 1X2")}</th><th className="p-3 text-center">{rankingHeader("exactWinner", "Exacto ganador")}</th><th className="p-3 text-center">{rankingHeader("exactDraw", "Empate exacto")}</th><th className="p-3 text-center">{rankingHeader("finalPosition", "Posición final")}</th><th className="p-3 text-center">{rankingHeader("leaguePoints", "Puntos Millos")}</th><th className="p-3 text-center">{rankingHeader("scorer", "Goleador")}</th><th className="p-3 text-center">{rankingHeader("scorerGoals", "Goles goleador")}</th><th className="p-3 text-center">{rankingHeader("goalDifference", "DG exacta")}</th><th className="p-3 text-center">{rankingHeader("closeness", "Distancia ↓")}</th><th className="p-3 text-center">{rankingHeader("matches", "Partidos")}</th></tr></thead><tbody>{ranking.map((row) => { const self = row.userId === currentUser.id; const sticky = self ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-slate-900"; return <tr key={row.userId} className={`border-t border-slate-100 dark:border-slate-800 ${self ? "bg-blue-50 font-bold text-blue-950 dark:bg-blue-950 dark:text-blue-100" : ""}`}><td className={`sticky left-0 z-10 p-3 text-center ${sticky}`}><span className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 font-black ${row.position === 1 ? "bg-amber-400 text-amber-950" : row.position === 2 ? "bg-slate-300 text-slate-900" : row.position === 3 ? "bg-amber-700 text-white" : ""}`}>{row.position}</span></td><td className={`sticky left-12 z-10 p-3 ${sticky}`}><div className="flex items-center gap-2"><img src={row.userAvatar || currentUser.avatar} alt="" className="h-8 w-8 rounded-full border object-cover" /><div><strong className="block">{row.userName}{self ? " · TÚ" : ""}</strong><span className="text-[9px] text-slate-400">{row.userCountry || "Colombia"}</span></div></div></td><td className="p-3 text-center text-sm font-black text-blue-700 dark:text-blue-300">{row.points}</td><td className="p-3 text-center">{row.participationPoints || 0}</td><td className="p-3 text-center">{row.outcomePoints || 0}</td><td className="p-3 text-center">{row.exactScorePoints || 0}</td><td className="p-3 text-center">{row.exactDrawPoints || 0}</td><td className="p-3 text-center">{row.positionBonusPoints || 0}</td><td className="p-3 text-center">{row.leaguePointsBonusPoints || 0}</td><td className="p-3 text-center">{row.scorerPlayerBonusPoints || 0}</td><td className="p-3 text-center">{row.scorerGoalsBonusPoints || 0}</td><td className="p-3 text-center font-bold">{row.goalDifferenceHits}</td><td className="p-3 text-center"><span className="rounded-full bg-slate-100 px-2 py-1 font-bold dark:bg-slate-800">{row.cumulativeScoreError} goles</span></td><td className="p-3 text-center">{row.predictCount}</td></tr>; })}</tbody></table></div>{!ranking.length && <p className="p-8 text-center text-sm text-slate-500">El ranking aparecerá cuando haya participantes pagos.</p>}</div>
          </div>
          <div id="liga-notificaciones" className={`${activeSection === "notificaciones" ? "space-y-5" : "hidden"}`}>
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Bell className="h-5 w-5 text-blue-600" /> Notificaciones · Liga II</h2><p className="mt-1 text-xs text-slate-500">Resultados, recordatorios y novedades únicamente de este Pollón.</p></div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">{notifications.length ? notifications.slice(0, 8).map((notification) => <div key={notification.id} className="border-b border-slate-100 py-4 last:border-0 dark:border-slate-800"><strong className="text-sm">{notification.title}</strong><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{notification.message}</p></div>) : <p className="py-8 text-center text-sm text-slate-500">Todavía no hay notificaciones de este módulo.</p>}</div>
          </div>
        </div>
      </div>

      <section className={activeSection === "trivia" ? "block" : "hidden"}><LigaMillonariosTrivia /></section>

      <section className={`${activeSection === "publicos" ? "space-y-5" : "hidden"}`}><div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-blue-600" /> Pronósticos Públicos · Liga II</h2><p className="mt-1 text-xs text-slate-500">Se publican después del cierre para impedir copias.</p></div>{publicPredictions.locked ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">Los pronósticos serán públicos cuando cierre el primer partido.</div> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-xs"><thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="p-3 text-left">Participante</th><th className="p-3 text-left">Partido</th><th className="p-3">Pronóstico</th><th className="p-3">Puntos</th></tr></thead><tbody>{publicPredictions.entries.map((entry, index) => { const match = matches.find((candidate) => candidate.id === entry.matchId); return <tr key={`${entry.userId}-${entry.matchId}-${index}`} className="border-t dark:border-slate-800"><td className="p-3">{entry.userName}</td><td className="p-3">{match ? `${match.local} vs ${match.visitor}` : `Partido ${entry.matchId}`}</td><td className="p-3 text-center font-black">{entry.localScore}-{entry.visitorScore}</td><td className="p-3 text-center">{entry.pointsEarned || 0}</td></tr>; })}</tbody></table></div></div>}</section>

      <section className={`${activeSection === "favoritos-publicos" ? "space-y-5" : "hidden"}`}><div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-blue-600" /> Favoritos Públicos · Liga II</h2><p className="mt-1 text-xs text-slate-500">Predicciones especiales de los participantes pagos.</p></div>{publicFavorites.locked ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">Los favoritos serán públicos cuando cierre el primer partido.</div> : <div className="grid gap-3 md:grid-cols-2">{publicFavorites.entries.map((entry) => <div key={entry.userId} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900"><strong>{entry.userName}</strong><p className="mt-2 text-xs text-slate-600 dark:text-slate-300">Posición #{entry.finalPosition} · {entry.totalLeaguePoints} puntos · {entry.totalGoals} goles</p><p className="mt-1 text-xs">Goleador: <b>{entry.scorer?.playerName || "Sin registrar"}</b>{entry.scorer ? ` · ${entry.scorer.exactGoals} goles` : ""}</p></div>)}</div>}</section>

      <section id="liga-reglas" className={`${activeSection === "reglas" ? "space-y-5" : "hidden"}`}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-amber-500" /> Cómo jugar, reglas y premios</h2><p className="mt-1 text-xs text-slate-500">La misma lógica base del Pollón Mundialista, adaptada al torneo de Millonarios.</p></div>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="mb-3 font-black">Puntuación por partido</h3><div className="space-y-2"><p><strong>5 pts</strong> por participar.</p><p><strong>15 pts</strong> por acertar el resultado 1X2.</p><p><strong>25 pts</strong> por marcador exacto con ganador.</p><p><strong>35 pts</strong> por empate exacto.</p><p className="border-t pt-3 text-xs text-slate-500 dark:border-slate-700">La diferencia exacta de gol no suma puntos; se utiliza para desempatar el ranking.</p></div></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white"><h3 className="mb-3 flex items-center gap-2 font-black"><Trophy className="h-4 w-4 text-amber-400" /> Bonos y premios</h3><div className="space-y-2"><p><strong>100 pts</strong> por posición final exacta.</p><p><strong>100 pts</strong> por puntos finales exactos.</p><p><strong>50 pts</strong> por goleador y <strong>50 pts</strong> por sus goles exactos.</p><p className="border-t border-white/10 pt-3"><strong>Bolsa actual:</strong> <span className="text-blue-300">{formatCop(finances?.prizePool || 0)}</span></p><p className="text-xs text-slate-300">1.º {formatCop(finances?.payouts.first || 0)} · 2.º {formatCop(finances?.payouts.second || 0)} · 3.º {formatCop(finances?.payouts.third || 0)}</p></div></div>
        </div>
      </section>
      <MatchResultsTicker matches={matches} getTeamFlag={getLigaCrest} label="Liga II" ariaLabel="Resultados y próximos partidos de Millonarios en la Liga BetPlay II 2026" />
    </section>
  );
}
