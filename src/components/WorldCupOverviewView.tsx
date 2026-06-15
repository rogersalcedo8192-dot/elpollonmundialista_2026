import React, { useEffect, useState } from "react";
import { BarChart3, Calendar, RefreshCw, Target, Trophy } from "lucide-react";
import { Match, WorldCupOverview } from "../types";

interface Props {
  getTeamFlag: (team: string) => React.ReactNode;
}

const formatBogotaDate = (date: string) =>
  new Date(date).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

const MatchRow = ({ match, getTeamFlag }: { key?: React.Key; match: Match; getTeamFlag: Props["getTeamFlag"] }) => (
  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3 py-3 last:border-0 dark:border-slate-800">
    <div className="min-w-0">
      <p className="truncate text-xs font-black text-slate-900 dark:text-white">
        {getTeamFlag(match.local)} {match.local}
        <span className="mx-1.5 text-slate-400">vs</span>
        {getTeamFlag(match.visitor)} {match.visitor}
      </p>
      <p className="mt-0.5 text-[9px] font-bold uppercase text-slate-400">
        {match.stage} · {formatBogotaDate(match.date)}
      </p>
    </div>
    <div className="shrink-0 text-right">
      {match.status === "finished" ? (
        <span className="text-lg font-black tabular-nums text-slate-950 dark:text-white">
          {match.localScore} - {match.visitorScore}
        </span>
      ) : match.status === "in_progress" ? (
        <span className="rounded-full bg-rose-500 px-2 py-1 text-[9px] font-black uppercase text-white">En vivo</span>
      ) : (
        <span className="text-[10px] font-black text-emerald-600">Próximo</span>
      )}
    </div>
  </div>
);

export const WorldCupOverviewView: React.FC<Props> = ({ getTeamFlag }) => {
  const [data, setData] = useState<WorldCupOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/world-cup-overview", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No se pudo consultar el Mundial.");
      setData(payload);
    } catch (err: any) {
      setError(err.message || "No se pudo consultar el Mundial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
    const timer = window.setInterval(() => void loadOverview(), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading && !data) {
    return <div className="rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500 dark:border-slate-800">Cargando datos oficiales del Mundial...</div>;
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/20">
        <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{error}</p>
        <button type="button" onClick={() => void loadOverview()} className="mt-3 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white">Reintentar</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-slate-950 dark:text-white">
            <Trophy className="h-5 w-5 text-amber-500" /> Así va el Mundial
          </h2>
          <p className="mt-1 text-xs text-slate-500">Resultados y posiciones oficiales, actualizados con football-data.org.</p>
        </div>
        <button type="button" onClick={() => void loadOverview()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-3 text-xs font-black text-white disabled:opacity-50 dark:bg-emerald-600">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Actualizar
        </button>
      </div>

      {data.warnings.map((warning) => (
        <div key={warning} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">{warning}</div>
      ))}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {[
          ["Partidos", data.summary.totalMatches, Calendar],
          ["Finalizados", data.summary.finishedMatches, BarChart3],
          ["En vivo", data.summary.liveMatches, Target],
          ["Próximos", data.summary.upcomingMatches, Calendar],
          ["Goles", data.summary.totalGoals, Trophy]
        ].map(([label, value, Icon]) => (
          <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <Icon className="h-4 w-4 text-emerald-600" />
            <span className="mt-2 block text-2xl font-black text-slate-950 dark:text-white">{value as number}</span>
            <span className="text-[9px] font-black uppercase text-slate-400">{label as string}</span>
          </div>
        ))}
      </div>

      {data.liveMatches.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white dark:border-rose-900 dark:bg-slate-900">
          <h3 className="bg-rose-500 px-4 py-3 text-xs font-black uppercase text-white">Partidos en vivo</h3>
          {data.liveMatches.map((match) => <MatchRow key={match.id} match={match} getTeamFlag={getTeamFlag} />)}
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-black uppercase text-slate-800 dark:text-slate-200">Tabla de grupos A-L</h3>
        {data.groups.length === 0 ? (
          <div className="rounded-xl border border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800">La tabla oficial aparecerá cuando la API publique las posiciones del Mundial 2026.</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {data.groups.map((group) => (
              <div key={group.group} className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="min-w-[520px]">
                  <h4 className="bg-slate-950 px-4 py-2.5 text-xs font-black uppercase text-white">Grupo {group.group}</h4>
                  <table className="w-full text-[10px]">
                  <thead className="bg-slate-50 font-black uppercase text-slate-400 dark:bg-slate-800/60">
                    <tr>
                      <th className="px-2 py-2 text-center">Pos</th><th className="px-2 py-2 text-left">Selección</th>
                      <th className="px-2 py-2 text-center">PJ</th><th className="px-2 py-2 text-center">G</th>
                      <th className="px-2 py-2 text-center">E</th><th className="px-2 py-2 text-center">P</th>
                      <th className="px-2 py-2 text-center">GF</th><th className="px-2 py-2 text-center">GC</th>
                      <th className="px-2 py-2 text-center">DG</th><th className="px-2 py-2 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {group.table.map((row) => (
                      <tr key={row.team} className={row.position <= 2 ? "bg-emerald-50/70 dark:bg-emerald-950/20" : row.position === 3 ? "bg-amber-50/60 dark:bg-amber-950/10" : ""}>
                        <td className="px-2 py-2.5 text-center font-black">{row.position}</td>
                        <td className="px-2 py-2.5 font-black text-slate-900 dark:text-white">
                          <span className="inline-flex items-center gap-2">{row.crest ? <img src={row.crest} alt="" className="h-5 w-5 object-contain" /> : getTeamFlag(row.team)} {row.team}</span>
                        </td>
                        <td className="px-2 py-2.5 text-center">{row.playedGames}</td><td className="px-2 py-2.5 text-center">{row.won}</td>
                        <td className="px-2 py-2.5 text-center">{row.draw}</td><td className="px-2 py-2.5 text-center">{row.lost}</td>
                        <td className="px-2 py-2.5 text-center">{row.goalsFor}</td><td className="px-2 py-2.5 text-center">{row.goalsAgainst}</td>
                        <td className="px-2 py-2.5 text-center">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                        <td className="px-2 py-2.5 text-center text-sm font-black text-emerald-700 dark:text-emerald-400">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <h3 className="bg-slate-950 px-4 py-3 text-xs font-black uppercase text-white">Últimos resultados</h3>
          {data.recentResults.length ? data.recentResults.map((match) => <MatchRow key={match.id} match={match} getTeamFlag={getTeamFlag} />) : <p className="p-6 text-center text-xs text-slate-500">Aún no hay resultados.</p>}
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <h3 className="bg-emerald-700 px-4 py-3 text-xs font-black uppercase text-white">Próximos partidos</h3>
          {data.upcomingMatches.length ? data.upcomingMatches.map((match) => <MatchRow key={match.id} match={match} getTeamFlag={getTeamFlag} />) : <p className="p-6 text-center text-xs text-slate-500">No hay próximos partidos publicados.</p>}
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <h3 className="bg-amber-500 px-4 py-3 text-xs font-black uppercase text-amber-950">Goleadores</h3>
        {data.scorers.length === 0 ? (
          <p className="p-6 text-center text-xs text-slate-500">La API todavía no publicó la tabla de goleadores del Mundial 2026.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.scorers.map((scorer) => (
              <div key={`${scorer.position}-${scorer.player}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 text-center text-sm font-black text-slate-400">{scorer.position}</span>
                  {scorer.teamCrest ? <img src={scorer.teamCrest} alt="" className="h-8 w-8 object-contain" /> : <span>{getTeamFlag(scorer.team)}</span>}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-900 dark:text-white">{scorer.player}</p>
                    <p className="text-[9px] font-bold uppercase text-slate-400">{scorer.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">{scorer.goals}</span>
                  <span className="ml-1 text-[9px] font-black uppercase text-slate-400">goles</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-[9px] font-bold uppercase tracking-wide text-slate-400">
        Última consulta: {formatBogotaDate(data.updatedAt)} · Fuente: {data.source}
      </p>
    </div>
  );
};
