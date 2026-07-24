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

type Props = { currentUser: User; getHeaders: () => Record<string, string> };

export function LigaMillonariosView({ currentUser, getHeaders }: Props) {
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

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const headers = getHeaders();
      const [moduleRes, predictionsRes, rankingRes, notificationsRes, specialRes, scorerRes] = await Promise.all([
        fetch("/api/liga-millonarios"),
        fetch("/api/liga-millonarios/predictions", { headers }),
        fetch("/api/liga-millonarios/rankings", { headers }),
        fetch("/api/liga-millonarios/notifications", { headers }),
        fetch("/api/liga-millonarios/tiebreak-prediction", { headers }),
        fetch("/api/liga-millonarios/scorer-prediction", { headers })
      ]);
      if (!moduleRes.ok) throw new Error("No se pudo cargar el módulo de Liga II.");
      const moduleData = await moduleRes.json();
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

  return (
    <section className="space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-sky-600 p-6 text-white shadow-xl">
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

      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-lg font-black"><Calendar className="h-5 w-5 text-blue-600" /> Calendario y pronósticos</h3>
          {matches.map((match) => {
            const prediction = predictionByMatch.get(match.id);
            const closed = match.status !== "pending" || Date.now() >= new Date(match.date).getTime() - 5 * 60_000;
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

        <div className="space-y-5">
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
            <h3 className="font-black text-blue-950 dark:text-blue-100">Pronósticos especiales de desempate</h3>
            <p className="mt-1 text-xs text-blue-800 dark:text-blue-200">La posición final exacta vale 100 puntos y los puntos exactos de Millonarios valen otros 100. Los goles totales solo desempatan.</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <label className="text-[10px] font-bold">Posición final<input type="number" min="1" max="20" value={special.finalPosition} onChange={(event) => setSpecial((current) => ({ ...current, finalPosition: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
              <label className="text-[10px] font-bold">Goles Millos<input type="number" min="0" value={special.totalGoals} onChange={(event) => setSpecial((current) => ({ ...current, totalGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
              <label className="text-[10px] font-bold">Puntos Millos<input type="number" min="0" value={special.totalLeaguePoints} onChange={(event) => setSpecial((current) => ({ ...current, totalLeaguePoints: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
            </div>
            <button type="button" onClick={() => void saveSpecial()} className="mt-3 w-full rounded-xl bg-blue-700 px-4 py-2 text-sm font-black text-white">Guardar desempates</button>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
            <h3 className="font-black text-amber-950 dark:text-amber-100">Goleador de Millonarios</h3>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">50 puntos por acertar el jugador y 50 adicionales por acertar también sus goles exactos.</p>
            <div className="mt-3 grid grid-cols-[1fr_7rem] gap-2">
              <label className="text-[10px] font-bold">Nombre del jugador<input value={scorer.playerName} onChange={(event) => setScorer((current) => ({ ...current, playerName: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
              <label className="text-[10px] font-bold">Goles exactos<input type="number" min="0" value={scorer.exactGoals} onChange={(event) => setScorer((current) => ({ ...current, exactGoals: event.target.value }))} className="mt-1 w-full rounded-lg border p-2 text-base dark:bg-slate-900" /></label>
            </div>
            <button type="button" onClick={() => void saveScorer()} className="mt-3 w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-black text-white">Guardar goleador</button>
          </div>
          {(currentUser.role === "admin" || currentUser.role === "superadmin") && <button type="button" onClick={() => void closeSeasonBonuses()} className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white">Cerrar bonos finales de temporada</button>}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 flex items-center gap-2 font-black"><Trophy className="h-5 w-5 text-amber-500" /> Ranking Liga II</h3>
            <div className="space-y-2">{ranking.map((row) => <div key={row.userId} className={`rounded-xl p-2 text-sm ${row.userId === currentUser.id ? "bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100" : "bg-slate-50 dark:bg-slate-800"}`}><div className="grid grid-cols-[2rem_1fr_auto] items-center gap-2"><strong>#{row.position}</strong><span className="truncate">{row.userName}</span><strong>{row.points} pts</strong></div><p className="mt-1 pl-8 text-[10px] opacity-70">Exactos {row.exactCount} · DG {row.goalDifferenceHits} · Error {row.cumulativeScoreError} · Bonos {row.seasonBonusPoints || 0}</p></div>)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 flex items-center gap-2 font-black"><Bell className="h-5 w-5 text-blue-600" /> Notificaciones Liga II</h3>
            {notifications.length ? notifications.slice(0, 8).map((notification) => <div key={notification.id} className="border-b border-slate-100 py-3 last:border-0 dark:border-slate-800"><strong className="text-sm">{notification.title}</strong><p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{notification.message}</p></div>) : <p className="text-sm text-slate-500">Todavía no hay notificaciones de este módulo.</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
