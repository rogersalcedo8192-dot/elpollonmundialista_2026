import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, ChevronDown, ChevronUp, Download, MessageCircle, RefreshCw, Search, Share2, Target, Trophy } from "lucide-react";
import { Match, WorldCupOverview } from "../types";

interface Props {
  getTeamFlag: (team: string) => React.ReactNode;
}

type MatchPhaseOption = { key: string; label: string; detail: string; sortOrder: number };
type WorldCupGroup = WorldCupOverview["groups"][number];
type WorldCupScorer = WorldCupOverview["scorers"][number];

const STAGES = [
  "Todos", "Eliminatorias",
  "Grupo A", "Grupo B", "Grupo C", "Grupo D",
  "Grupo E", "Grupo F", "Grupo G", "Grupo H",
  "Grupo I", "Grupo J", "Grupo K", "Grupo L",
  "16avos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal", "Tercer Puesto", "Final"
];

const GROUP_STAGE_NAMES = STAGES.filter((stage) => stage.startsWith("Grupo "));
const KNOCKOUT_STAGE_ORDER = ["16avos de Final", "Octavos de Final", "Cuartos de Final", "Semifinal", "Tercer Puesto", "Final"];

const formatBogotaDate = (date: string) =>
  new Date(date).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const getStageLabel = (stage: string) => {
  if (stage === "Todos") return "Todos";
  if (stage === "Eliminatorias") return "Eliminatorias";
  return stage;
};

const getStatusLabel = (status: Match["status"]) => {
  if (status === "finished") return "Finalizado";
  if (status === "in_progress") return "En vivo";
  return "Próximo";
};

const getAppShareUrl = () => (typeof window === "undefined" ? "https://www.elpollonmundialista.com" : window.location.origin);

const sanitizeFilename = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "asi-va-el-mundial";

const formatMatchShareLine = (match: Match) => {
  const score = match.status === "finished" ? ` ${match.localScore ?? 0}-${match.visitorScore ?? 0}` : "";
  return `${match.local}${score} vs ${match.visitor} - ${match.stage} - ${formatBogotaDate(match.date)}`;
};

const buildMatchesShareText = (title: string, matches: Match[]) => [
  `El Pollon Mundialista - ${title}`,
  "",
  ...(matches.length ? matches.slice(0, 8).map((match, index) => `${index + 1}. ${formatMatchShareLine(match)}`) : ["Aun no hay partidos publicados."]),
  "",
  `Ver mas: ${getAppShareUrl()}`
].join("\n");

const buildGroupShareText = (group: WorldCupGroup) => [
  `El Pollon Mundialista - Tabla de posiciones Grupo ${group.group}`,
  "",
  ...group.table.map((row) => `${row.position}. ${row.team} - ${row.points} pts | PJ ${row.playedGames} | DG ${row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}`),
  "",
  `Ver mas: ${getAppShareUrl()}`
].join("\n");

const buildScorersShareText = (scorers: WorldCupScorer[]) => [
  "El Pollon Mundialista - Tabla de goleadores",
  "",
  ...(scorers.length ? scorers.slice(0, 10).map((scorer) => `${scorer.position}. ${scorer.player} (${scorer.team}) - ${scorer.goals} goles`) : ["La API todavia no publico goleadores del Mundial 2026."]),
  "",
  `Ver mas: ${getAppShareUrl()}`
].join("\n");

const downloadShareText = (title: string, text: string) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = globalThis.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${sanitizeFilename(title)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  globalThis.URL.revokeObjectURL(url);
};

const shareOverviewText = async (title: string, text: string, channel: "native" | "whatsapp" | "download") => {
  if (channel === "download") {
    downloadShareText(title, text);
    return;
  }

  if (channel === "whatsapp") {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    return;
  }

  if (navigator.share) {
    await navigator.share({ title, text, url: getAppShareUrl() });
    return;
  }

  await navigator.clipboard?.writeText(text);
};

const ShareActionButtons = ({ title, text }: { title: string; text: string }) => {
  const actions = [
    { channel: "native" as const, label: "Compartir", icon: Share2 },
    { channel: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
    { channel: "download" as const, label: "Descargar", icon: Download }
  ];

  return (
    <div className="flex items-center gap-1.5">
      {actions.map(({ channel, label, icon: Icon }) => (
        <button
          key={channel}
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void shareOverviewText(title, text, channel);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/85 shadow-sm shadow-slate-950/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
          aria-label={label}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
};

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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState("Todos");
  const [selectedPhaseKey, setSelectedPhaseKey] = useState("Todas");
  const [statusFilter, setStatusFilter] = useState<"all" | Match["status"]>("all");
  const [teamSearch, setTeamSearch] = useState("");

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

  const matchesForFilters = data?.matches || [];
  const matchPhaseById = useMemo<Map<number, MatchPhaseOption>>(() => {
    const phases = new Map<number, MatchPhaseOption>();

    GROUP_STAGE_NAMES.forEach((stage) => {
      const groupMatches = matchesForFilters
        .filter((match) => match.stage === stage)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.id - b.id);

      groupMatches.forEach((match, index) => {
        const groupDate = Math.min(Math.floor(index / 2) + 1, 3);
        phases.set(match.id, {
          key: `grupo-fecha-${groupDate}`,
          label: `Fecha ${groupDate}`,
          detail: "Fase de grupos",
          sortOrder: groupDate
        });
      });
    });

    matchesForFilters.forEach((match) => {
      if (phases.has(match.id)) return;
      const knockoutIndex = KNOCKOUT_STAGE_ORDER.indexOf(match.stage);
      phases.set(match.id, {
        key: `fase-${normalizeSearchText(match.stage).replace(/\s+/g, "-")}`,
        label: getStageLabel(match.stage),
        detail: "Eliminatorias",
        sortOrder: knockoutIndex >= 0 ? 10 + knockoutIndex : 99
      });
    });

    return phases;
  }, [matchesForFilters]);

  const phaseOptions = useMemo(() => {
    const unique = new Map<string, MatchPhaseOption>();
    const phases = Array.from(matchPhaseById.values()) as MatchPhaseOption[];
    phases
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((phase) => unique.set(phase.key, phase));
    return Array.from(unique.values());
  }, [matchPhaseById]);

  const filteredMatches = useMemo(() => {
    const searchText = normalizeSearchText(teamSearch);
    const terms = searchText ? searchText.split(/\s+/) : [];

    return matchesForFilters.filter((match) => {
      const stageMatch =
        selectedStage === "Todos" ||
        (selectedStage === "Eliminatorias" && KNOCKOUT_STAGE_ORDER.includes(match.stage)) ||
        match.stage === selectedStage;
      const phaseMatch = selectedPhaseKey === "Todas" || matchPhaseById.get(match.id)?.key === selectedPhaseKey;
      const statusMatch = statusFilter === "all" || match.status === statusFilter;
      const searchableContent = normalizeSearchText([
        match.local,
        match.visitor,
        match.stage,
        match.stadium,
        getStatusLabel(match.status),
        matchPhaseById.get(match.id)?.label || "",
        matchPhaseById.get(match.id)?.detail || ""
      ].join(" "));
      const contentMatch = terms.length === 0 || terms.every((term) => searchableContent.includes(term));
      return stageMatch && phaseMatch && statusMatch && contentMatch;
    });
  }, [matchesForFilters, matchPhaseById, selectedPhaseKey, selectedStage, statusFilter, teamSearch]);

  const hasFilters = selectedStage !== "Todos" || selectedPhaseKey !== "Todas" || statusFilter !== "all" || teamSearch.trim().length > 0;
  const clearFilters = () => {
    setSelectedStage("Todos");
    setSelectedPhaseKey("Todas");
    setStatusFilter("all");
    setTeamSearch("");
  };

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

      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50 p-4 dark:border-emerald-900 dark:from-emerald-950/25 dark:to-sky-950/15">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300">Fase actual del Mundial</p>
            <h3 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{data.summary.currentPhaseLabel}</h3>
            {data.summary.currentStage && data.summary.currentStage !== data.summary.currentPhaseLabel && (
              <p className="mt-1 text-xs font-bold text-slate-600 dark:text-slate-300">Detalle actual: {data.summary.currentStage}</p>
            )}
          </div>
          <p className="max-w-xl text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            El Mundial 2026 tiene <strong>104 partidos oficiales</strong>. En este resumen, los <strong>{data.summary.syncedMatches} partidos sincronizados</strong> son los que ya están cargados o publicados en la plataforma/API para seguimiento en vivo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
        {[
          ["Partidos oficiales", data.summary.totalMatches, Trophy],
          ["Sincronizados", data.summary.syncedMatches, Calendar],
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

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-white">Partidos del Mundial</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Busca por grupo, fase, fecha futbolera, estado, selección o estadio.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black transition-colors ${
              filtersOpen || hasFilters
                ? "bg-emerald-600 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
            }`}
            aria-expanded={filtersOpen}
          >
            {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Filtros futboleros
            {hasFilters && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">activos</span>}
          </button>
        </div>

        {filtersOpen && (
          <div className="grid grid-cols-1 gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:grid-cols-2 xl:grid-cols-[minmax(150px,190px)_minmax(150px,210px)_minmax(150px,190px)_1fr]">
            <label className="block">
              <span className="mb-1 block text-xs font-black text-slate-600 dark:text-slate-300">Grupo / etapa</span>
              <select
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                value={selectedStage}
                onChange={(event) => setSelectedStage(event.target.value)}
              >
                {STAGES.map((stage) => <option key={stage} value={stage}>{getStageLabel(stage)}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-black text-slate-600 dark:text-slate-300">Fase / fecha</span>
              <select
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                value={selectedPhaseKey}
                onChange={(event) => setSelectedPhaseKey(event.target.value)}
              >
                <option value="Todas">Todas las fases y fechas</option>
                {phaseOptions.map((option) => (
                  <option key={option.key} value={option.key}>{option.label} - {option.detail}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-black text-slate-600 dark:text-slate-300">Estado</span>
              <select
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "all" | Match["status"])}
              >
                <option value="all">Todos</option>
                <option value="pending">Próximos</option>
                <option value="in_progress">En vivo</option>
                <option value="finished">Finalizados</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-black text-slate-600 dark:text-slate-300">Buscar</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  autoComplete="off"
                  placeholder="Selección, estadio, grupo o fase..."
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  value={teamSearch}
                  onChange={(event) => setTeamSearch(event.target.value)}
                />
              </div>
            </label>
          </div>
        )}

        <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 text-xs dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-bold text-slate-500 dark:text-slate-400">
            {filteredMatches.length} de {matchesForFilters.length} partidos sincronizados
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="min-h-9 rounded-xl bg-slate-200 px-3 font-black text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="max-h-[520px] overflow-y-auto">
          {filteredMatches.length ? (
            filteredMatches.map((match) => <MatchRow key={match.id} match={match} getTeamFlag={getTeamFlag} />)
          ) : (
            <p className="p-6 text-center text-xs font-bold text-slate-500">No hay partidos con esos filtros.</p>
          )}
        </div>
      </section>

      {data.liveMatches.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white dark:border-rose-900 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 bg-rose-500 px-4 py-2.5">
            <h3 className="text-xs font-black uppercase text-white">Partidos en vivo</h3>
            <ShareActionButtons title="Partidos en vivo" text={buildMatchesShareText("Partidos en vivo", data.liveMatches)} />
          </div>
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
                  <div className="flex items-center justify-between gap-3 bg-slate-950 px-4 py-2.5">
                    <h4 className="text-xs font-black uppercase text-white">Grupo {group.group}</h4>
                    <ShareActionButtons title={`Tabla Grupo ${group.group}`} text={buildGroupShareText(group)} />
                  </div>
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
          <div className="flex items-center justify-between gap-3 bg-slate-950 px-4 py-2.5">
            <h3 className="text-xs font-black uppercase text-white">Últimos resultados</h3>
            <ShareActionButtons title="Ultimos resultados" text={buildMatchesShareText("Ultimos resultados", data.recentResults)} />
          </div>
          {data.recentResults.length ? data.recentResults.map((match) => <MatchRow key={match.id} match={match} getTeamFlag={getTeamFlag} />) : <p className="p-6 text-center text-xs text-slate-500">Aún no hay resultados.</p>}
        </section>
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-3 bg-emerald-700 px-4 py-2.5">
            <h3 className="text-xs font-black uppercase text-white">Próximos partidos</h3>
            <ShareActionButtons title="Proximos partidos" text={buildMatchesShareText("Proximos partidos", data.upcomingMatches)} />
          </div>
          {data.upcomingMatches.length ? data.upcomingMatches.map((match) => <MatchRow key={match.id} match={match} getTeamFlag={getTeamFlag} />) : <p className="p-6 text-center text-xs text-slate-500">No hay próximos partidos publicados.</p>}
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 bg-amber-500 px-4 py-2.5">
          <h3 className="text-xs font-black uppercase text-amber-950">Goleadores</h3>
          <ShareActionButtons title="Tabla de goleadores" text={buildScorersShareText(data.scorers)} />
        </div>
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
