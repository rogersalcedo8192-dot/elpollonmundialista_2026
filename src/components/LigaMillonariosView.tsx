import React, { useCallback, useEffect, useState } from "react";
import { Bell, Calendar, Check, Eraser, RefreshCw, Trophy } from "lucide-react";
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

  return (
    <section className="space-y-5">
      <div className={`${activeSection === "resumen" ? "block" : "hidden"} rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 p-6 text-white shadow-xl`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-sky-200">Módulo independiente</p>
            <h2 className="mt-2 text-2xl font-black">Pollón Liga BetPlay II 2026</h2>
            <p className="mt-2 text-sm text-blue-100">Solo partidos de Millonarios FC · misma puntuación base; la diferencia exacta de gol se usa únicamente para desempatar.</p>
          </div>
          <button type="button" onClick={() => void load()} className="rounded-xl bg-white/10 p-3 hover:bg-white/20" aria-label="Actualizar"><RefreshCw className={`h-5 w-5 ${busy ? "animate-spin" : ""}`} /></button>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/10 p-3"><span className="block text-[10px] uppercase text-blue-200">Puesto</span><strong className="text-xl">#{myRanking?.position || "-"}</strong></div>
          <div className="rounded-2xl bg-white/10 p-3"><span className="block text-[10px] uppercase text-blue-200">Puntos</span><strong className="text-xl">{myRanking?.points || 0}</strong></div>
          <div className="rounded-2xl bg-white/10 p-3"><span className="block text-[10px] uppercase text-blue-200">Aciertos DG</span><strong className="text-xl">{myRanking?.goalDifferenceHits || 0}</strong></div>
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
        <h3 className="text-xl font-black">Así va la Liga BetPlay II 2026</h3>
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
          <h3 className="flex items-center gap-2 text-lg font-black"><Calendar className="h-5 w-5 text-blue-600" /> Calendario y pronósticos</h3>
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
            <div id="liga-admin" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 scroll-mt-4 dark:border-emerald-900 dark:bg-emerald-950">
              <h3 className="font-black">Administración financiera · Liga II</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white/70 p-2">Pagos confirmados<strong className="block text-lg">{finances?.paidParticipants || 0}</strong></div>
                <div className="rounded-xl bg-white/70 p-2">Bolsa de premios<strong className="block text-lg">{formatCop(finances?.prizePool || 0)}</strong></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {([
                  ["entryFeeCop", "Inscripción COP"], ["prizePoolPercent", "% premios"], ["bankCommissionPercent", "% comisión bancaria"], ["administrationPercent", "% administración"],
                  ["firstPlacePercent", "% primer puesto"], ["secondPlacePercent", "% segundo puesto"], ["thirdPlacePercent", "% tercer puesto"]
                ] as Array<[keyof FinancialConfig, string]>).map(([key, label]) => <label key={key} className="text-[10px] font-bold">{label}<input type="number" min="0" value={financialConfig[key]} onChange={(event) => setFinancialConfig((current) => ({ ...current, [key]: Number(event.target.value) }))} className="mt-1 w-full rounded-lg border p-2 text-sm dark:bg-slate-900" /></label>)}
              </div>
              <p className="mt-2 text-[10px]">Premios + comisión + administración deben sumar 100%. La distribución de puestos también debe sumar 100%.</p>
              <button type="button" onClick={() => void saveFinancialConfig()} className="mt-3 w-full rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white">Guardar finanzas de Liga</button>
              <div className="mt-4 max-h-64 space-y-2 overflow-auto">
                {adminMemberships.map((item) => <div key={item.userId} className="flex items-center justify-between gap-2 rounded-xl bg-white/70 p-2 text-xs"><span className="min-w-0 truncate"><strong className="block truncate">{item.user?.name || item.userId}</strong>{item.status} {item.paymentMethod ? `· ${item.paymentMethod}` : ""}</span><button type="button" onClick={() => void updateManualPayment(item.userId, item.status === "paid" ? "pending" : "paid", "cash")} className={`shrink-0 rounded-lg px-2 py-1 font-black ${item.status === "paid" ? "bg-slate-200" : "bg-emerald-600 text-white"}`}>{item.status === "paid" ? "Revertir" : "Marcar pago efectivo"}</button></div>)}
              </div>
            </div>
          )}
          <div className={`${activeSection === "pronosticos" ? "block" : "hidden"} rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950`}>
            <h3 className="font-black text-blue-950 dark:text-blue-100">Pronósticos especiales de desempate</h3>
            <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">La posición final exacta vale 100 puntos y los puntos exactos de Millonarios valen otros 100. Los goles totales solo desempatan.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <label className="text-[10px] font-bold">Posición final<input type="number" min="1" max="20" value={special.finalPosition} onChange={(event) => setSpecial((current) => ({ ...current, finalPosition: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
              <label className="text-[10px] font-bold">Goles Millos<input type="number" min="0" value={special.totalGoals} onChange={(event) => setSpecial((current) => ({ ...current, totalGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
              <label className="text-[10px] font-bold">Puntos Millos<input type="number" min="0" value={special.totalLeaguePoints} onChange={(event) => setSpecial((current) => ({ ...current, totalLeaguePoints: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
            </div>
            <button type="button" onClick={() => void saveSpecial()} className="mt-3 w-full rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white">Guardar desempates</button>
          </div>
          <div className={`${activeSection === "pronosticos" ? "block" : "hidden"} rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950`}>
            <h3 className="font-black text-amber-950 dark:text-amber-100">Goleador de Millonarios</h3>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">50 puntos por acertar el jugador y 50 adicionales por acertar también sus goles exactos.</p>
            <div className="mt-3 grid grid-cols-[1fr_7rem] gap-2">
              <label className="text-[10px] font-bold">Nombre del jugador<input value={scorer.playerName} onChange={(event) => setScorer((current) => ({ ...current, playerName: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
              <label className="text-[10px] font-bold">Goles exactos<input type="number" min="0" value={scorer.exactGoals} onChange={(event) => setScorer((current) => ({ ...current, exactGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
            </div>
            <button type="button" onClick={() => void saveScorer()} className="mt-3 w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-black text-white">Guardar goleador</button>
          </div>
          {activeSection === "admin" && (currentUser.role === "admin" || currentUser.role === "superadmin") && <button type="button" onClick={() => void closeSeasonBonuses()} className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white">Cerrar bonos finales de temporada</button>}
          <div id="liga-ranking" className={`${activeSection === "ranking" ? "block" : "hidden"} rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900`}>
            <h3 className="mb-3 flex items-center gap-2 font-black"><Trophy className="h-5 w-5 text-amber-500" /> Ranking Liga II</h3>
            <div className="space-y-2">{ranking.map((row) => <div key={row.userId} className={`rounded-xl p-2 text-sm ${row.userId === currentUser.id ? "bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100" : "bg-slate-50 dark:bg-slate-800"}`}><div className="grid grid-cols-[2rem_1fr_auto] items-center gap-2"><strong>#{row.position}</strong><span className="truncate">{row.userName}</span><strong>{row.points} pts</strong></div><p className="mt-1 pl-8 text-[10px] opacity-70">Exactos {row.exactCount} · DG {row.goalDifferenceHits} · Error {row.cumulativeScoreError} · Bonos {row.seasonBonusPoints || 0}</p></div>)}</div>
          </div>
          <div id="liga-notificaciones" className={`${activeSection === "notificaciones" ? "block" : "hidden"} rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900`}>
            <h3 className="mb-3 flex items-center gap-2 font-black"><Bell className="h-5 w-5 text-blue-600" /> Notificaciones Liga II</h3>
            {notifications.length ? notifications.slice(0, 8).map((notification) => <div key={notification.id} className="border-b border-slate-100 py-3 last:border-0 dark:border-slate-800"><strong className="text-sm">{notification.title}</strong><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{notification.message}</p></div>) : <p className="text-sm text-slate-500">Todavía no hay notificaciones de este módulo.</p>}
          </div>
        </div>
      </div>

      <section id="liga-reglas" className={`${activeSection === "reglas" ? "block" : "hidden"} rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900`}>
        <h3 className="text-lg font-black">Reglas y premios · Liga II</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2 text-sm">
          <div className="space-y-1"><p><strong>5 pts</strong> por participar.</p><p><strong>15 pts</strong> por acertar el resultado 1X2.</p><p><strong>25 pts</strong> por marcador exacto con ganador.</p><p><strong>35 pts</strong> por empate exacto.</p><p>La diferencia exacta de gol no suma puntos; desempata.</p></div>
          <div className="space-y-1"><p><strong>100 pts</strong> por posición final exacta.</p><p><strong>100 pts</strong> por puntos finales exactos.</p><p><strong>50 pts</strong> por goleador y <strong>50 pts</strong> por sus goles exactos.</p><p className="pt-2"><strong>Bolsa actual:</strong> {formatCop(finances?.prizePool || 0)}</p><p>1.º {formatCop(finances?.payouts.first || 0)} · 2.º {formatCop(finances?.payouts.second || 0)} · 3.º {formatCop(finances?.payouts.third || 0)}</p></div>
        </div>
      </section>
    </section>
  );
}
