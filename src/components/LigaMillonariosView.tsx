import React, { useCallback, useEffect, useState } from "react";
import { BarChart3, Bell, Calendar, Check, Eraser, RefreshCw, Trophy } from "lucide-react";
import type { User } from "../types";

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
  points: number;
  exactCount: number;
  outcomeCount: number;
  predictCount: number;
  goalDifferenceHits: number;
  cumulativeScoreError: number;
  exactTeamScores: number;
  seasonBonusPoints: number;
  position: number;
};

type LigaSection = "resumen" | "pronosticos" | "asi-va" | "ranking" | "notificaciones" | "reglas" | "admin";
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
  const [membership, setMembership] = useState<LigaMembership | null>(null);
  const [adminMemberships, setAdminMemberships] = useState<LigaMembership[]>([]);
  const [financialConfig, setFinancialConfig] = useState<FinancialConfig>({ entryFeeCop: 20000, prizePoolPercent: 80, bankCommissionPercent: 3, administrationPercent: 17, firstPlacePercent: 80, secondPlacePercent: 15, thirdPlacePercent: 5 });
  const [finances, setFinances] = useState<Finances | null>(null);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [scorers, setScorers] = useState<Scorer[]>([]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const headers = getHeaders();
      const [moduleRes, predictionsRes, rankingRes, notificationsRes, specialRes, scorerRes, membershipRes, adminMembershipsRes] = await Promise.all([
        fetch("/api/liga-millonarios"),
        fetch("/api/liga-millonarios/predictions", { headers }),
        fetch("/api/liga-millonarios/rankings", { headers }),
        fetch("/api/liga-millonarios/notifications", { headers }),
        fetch("/api/liga-millonarios/tiebreak-prediction", { headers }),
        fetch("/api/liga-millonarios/scorer-prediction", { headers }),
        fetch("/api/liga-millonarios/membership", { headers }),
        currentUser.role === "admin" || currentUser.role === "superadmin" ? fetch("/api/liga-millonarios/admin/memberships", { headers }) : Promise.resolve(null)
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

  const closeSeasonBonuses = async () => {
    const finalPosition = window.prompt("Posición final exacta de Millonarios");
    if (finalPosition === null) return;
    const totalGoals = window.prompt("Total de goles de Millonarios");
    if (totalGoals === null) return;
    const totalLeaguePoints = window.prompt("Total de puntos de Millonarios");
    if (totalLeaguePoints === null) return;
    const playerNames = window.prompt("Goleador(es); separa empates con comas");
    if (playerNames === null) return;
    const exactGoals = window.prompt("Goles del goleador");
    if (exactGoals === null) return;
    const [seasonResponse, scorerResponse] = await Promise.all([
      fetch("/api/liga-millonarios/admin/final-tiebreak-outcome", { method: "PUT", headers: getHeaders(), body: JSON.stringify({ finalPosition: Number(finalPosition), totalGoals: Number(totalGoals), totalLeaguePoints: Number(totalLeaguePoints) }) }),
      fetch("/api/liga-millonarios/admin/scorer-outcome", { method: "PUT", headers: getHeaders(), body: JSON.stringify({ playerNames: playerNames.split(","), exactGoals: Number(exactGoals) }) })
    ]);
    const seasonData = await seasonResponse.json();
    const scorerData = await scorerResponse.json();
    setMessage(!seasonResponse.ok ? seasonData.error : !scorerResponse.ok ? scorerData.error : "Bonos finales guardados y ranking recalculado.");
    if (seasonResponse.ok && scorerResponse.ok) void load();
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

  return (
    <section className="space-y-5">
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
      </div>

      {message && <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-sm font-semibold text-sky-900">{message}</div>}

      <div id="liga-resumen" />
      {activeSection === "resumen" && !isAdmin && !hasLigaAccess && (
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

      <div className={`${["pronosticos", "ranking", "notificaciones", "admin"].includes(activeSection) ? "grid" : "hidden"} gap-5 xl:grid-cols-[1.6fr_1fr]`}>
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
          {isAdmin && activeSection === "admin" && (
            <div id="liga-admin" className="space-y-5 scroll-mt-4">
              <div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><BarChart3 className="h-5 w-5 text-blue-600" /> Administración · Pollón Liga II</h2><p className="mt-1 text-xs text-slate-500">Configura la inscripción, la bolsa de premios y los pagos independientes de este torneo.</p></div>
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
          <div className={`${activeSection === "pronosticos" ? "block" : "hidden"} rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950`}>
            <h3 className="font-black text-blue-950 dark:text-blue-100">Pronósticos especiales de desempate</h3>
            <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">La posición final exacta vale 100 puntos y los puntos exactos de Millonarios valen otros 100. Los goles totales solo desempatan.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <label className="text-[10px] font-bold">Posición final<select value={special.finalPosition} onChange={(event) => setSpecial((current) => ({ ...current, finalPosition: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona</option>{range(1, 19).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="text-[10px] font-bold">Goles Millos<select value={special.totalGoals} onChange={(event) => setSpecial((current) => ({ ...current, totalGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona</option>{range(0, 50).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
              <label className="text-[10px] font-bold">Puntos Millos<select value={special.totalLeaguePoints} onChange={(event) => setSpecial((current) => ({ ...current, totalLeaguePoints: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona</option>{range(0, 57).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            </div>
            <button type="button" onClick={() => void saveSpecial()} className="mt-3 w-full rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white">Guardar desempates</button>
          </div>
          <div className={`${activeSection === "pronosticos" ? "block" : "hidden"} rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950`}>
            <h3 className="font-black text-amber-950 dark:text-amber-100">Goleador de Millonarios</h3>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">50 puntos por acertar el jugador y 50 adicionales por acertar también sus goles exactos.</p>
            <div className="mt-3 grid grid-cols-[1fr_7rem] gap-2">
              <label className="text-[10px] font-bold">Nombre del jugador<select value={scorer.playerName} onChange={(event) => setScorer((current) => ({ ...current, playerName: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona un jugador</option>{scorer.playerName && !MILLONARIOS_PLAYERS.includes(scorer.playerName as typeof MILLONARIOS_PLAYERS[number]) && <option value={scorer.playerName}>{scorer.playerName}</option>}{MILLONARIOS_PLAYERS.map((player) => <option key={player} value={player}>{player}</option>)}</select></label>
              <label className="text-[10px] font-bold">Goles exactos<select value={scorer.exactGoals} onChange={(event) => setScorer((current) => ({ ...current, exactGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900"><option value="">Selecciona</option>{range(0, 30).map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            </div>
            <button type="button" onClick={() => void saveScorer()} className="mt-3 w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-black text-white">Guardar goleador</button>
          </div>
          {activeSection === "admin" && (currentUser.role === "admin" || currentUser.role === "superadmin") && <button type="button" onClick={() => void closeSeasonBonuses()} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white">Cerrar bonos finales de temporada</button>}
          <div id="liga-ranking" className={`${activeSection === "ranking" ? "space-y-5" : "hidden"}`}>
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-amber-500" /> PolloRanking · Liga II</h2><p className="mt-1 text-xs text-slate-500">Clasificación exclusiva de participantes pagos del Pollón de Liga.</p></div>
            {myRanking && <div className="grid gap-3 rounded-2xl bg-slate-950 p-5 text-white shadow-sm sm:grid-cols-[1fr_auto_auto]"><div><span className="text-[10px] font-black uppercase tracking-widest text-blue-300">Tu posición actual</span><strong className="mt-1 block text-lg">{currentUser.name}</strong></div><div><span className="text-[10px] text-slate-400">Posición</span><strong className="block text-2xl">#{myRanking.position}</strong></div><div><span className="text-[10px] text-slate-400">Puntos</span><strong className="block text-2xl text-amber-400">{myRanking.points}</strong></div></div>}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="overflow-x-auto"><table className="w-full min-w-[660px] text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 dark:bg-slate-800"><tr><th className="p-3 text-center">Pos.</th><th className="p-3 text-left">Participante</th><th className="p-3 text-center">Puntos</th><th className="p-3 text-center">Exactos</th><th className="p-3 text-center">DG</th><th className="p-3 text-center">Error</th><th className="p-3 text-center">Bonos</th></tr></thead><tbody>{ranking.map((row) => <tr key={row.userId} className={`border-t border-slate-100 dark:border-slate-800 ${row.userId === currentUser.id ? "bg-blue-50 font-bold text-blue-950 dark:bg-blue-950 dark:text-blue-100" : ""}`}><td className="p-3 text-center font-black">#{row.position}</td><td className="p-3">{row.userName}</td><td className="p-3 text-center font-black">{row.points}</td><td className="p-3 text-center">{row.exactCount}</td><td className="p-3 text-center">{row.goalDifferenceHits}</td><td className="p-3 text-center">{row.cumulativeScoreError}</td><td className="p-3 text-center">{row.seasonBonusPoints || 0}</td></tr>)}</tbody></table></div>{!ranking.length && <p className="p-6 text-center text-sm text-slate-500">El ranking aparecerá cuando haya participantes pagos.</p>}</div>
          </div>
          <div id="liga-notificaciones" className={`${activeSection === "notificaciones" ? "space-y-5" : "hidden"}`}>
            <div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Bell className="h-5 w-5 text-blue-600" /> Notificaciones · Liga II</h2><p className="mt-1 text-xs text-slate-500">Resultados, recordatorios y novedades únicamente de este Pollón.</p></div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">{notifications.length ? notifications.slice(0, 8).map((notification) => <div key={notification.id} className="border-b border-slate-100 py-4 last:border-0 dark:border-slate-800"><strong className="text-sm">{notification.title}</strong><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{notification.message}</p></div>) : <p className="py-8 text-center text-sm text-slate-500">Todavía no hay notificaciones de este módulo.</p>}</div>
          </div>
        </div>
      </div>

      <section id="liga-reglas" className={`${activeSection === "reglas" ? "space-y-5" : "hidden"}`}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="flex items-center gap-2 text-xl font-bold"><Trophy className="h-5 w-5 text-amber-500" /> Cómo jugar, reglas y premios</h2><p className="mt-1 text-xs text-slate-500">La misma lógica base del Pollón Mundialista, adaptada al torneo de Millonarios.</p></div>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="mb-3 font-black">Puntuación por partido</h3><div className="space-y-2"><p><strong>5 pts</strong> por participar.</p><p><strong>15 pts</strong> por acertar el resultado 1X2.</p><p><strong>25 pts</strong> por marcador exacto con ganador.</p><p><strong>35 pts</strong> por empate exacto.</p><p className="border-t pt-3 text-xs text-slate-500 dark:border-slate-700">La diferencia exacta de gol no suma puntos; se utiliza para desempatar el ranking.</p></div></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-white"><h3 className="mb-3 flex items-center gap-2 font-black"><Trophy className="h-4 w-4 text-amber-400" /> Bonos y premios</h3><div className="space-y-2"><p><strong>100 pts</strong> por posición final exacta.</p><p><strong>100 pts</strong> por puntos finales exactos.</p><p><strong>50 pts</strong> por goleador y <strong>50 pts</strong> por sus goles exactos.</p><p className="border-t border-white/10 pt-3"><strong>Bolsa actual:</strong> <span className="text-blue-300">{formatCop(finances?.prizePool || 0)}</span></p><p className="text-xs text-slate-300">1.º {formatCop(finances?.payouts.first || 0)} · 2.º {formatCop(finances?.payouts.second || 0)} · 3.º {formatCop(finances?.payouts.third || 0)}</p></div></div>
        </div>
      </section>
    </section>
  );
}
