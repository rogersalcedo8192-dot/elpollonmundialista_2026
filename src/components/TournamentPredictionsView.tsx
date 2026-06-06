import React, { useState, useEffect } from "react";
import { 
  Trophy, 
  Award, 
  HelpCircle,
  Share2, 
  Search, 
  Check, 
  Clock, 
  AlertCircle,
  TrendingUp,
  X,
  Target
} from "lucide-react";
import { User, TournamentPredictions, TournamentOutcomes } from "../types";

// Groups data
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

const ALL_TEAMS = Object.values(GROUPS_TEAMS).flat().sort();

interface Props {
  lang: "es" | "en";
  currentUser: User;
  tournamentPredictions: TournamentPredictions | null;
  tournamentOutcomes: TournamentOutcomes | null;
  canSave: boolean;
  onSave: (preds: {
    groupWinners: Record<string, string>;
    octavosTeams: string[];
    cuartosTeams: string[];
    semifinalTeams: string[];
    finalists: string[];
    subchampion: string;
    champion: string;
  }) => Promise<void>;
}

export const TournamentPredictionsView: React.FC<Props> = ({
  lang,
  currentUser,
  tournamentPredictions,
  tournamentOutcomes,
  canSave,
  onSave
}) => {
  const t = (es: string, en: string) => (lang === "es" ? es : en);

  // Lock status calculation
  // Locked 24h before kick-off: June 10, 2026 at 19:00 UTC
  const LOCK_TIME = new Date("2026-06-10T19:00:00.000Z").getTime();
  const [isLocked, setIsLocked] = useState(Date.now() > LOCK_TIME);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsLocked(Date.now() > LOCK_TIME);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Form states initialized to empty or saved predictions
  const [groupWinners, setGroupWinners] = useState<Record<string, string>>({});
  const [octavosTeams, setOctavosTeams] = useState<string[]>([]);
  const [cuartosTeams, setCuartosTeams] = useState<string[]>([]);
  const [semifinalTeams, setSemifinalTeams] = useState<string[]>([]);
  const [finalists, setFinalists] = useState<string[]>([]);
  const [subchampion, setSubchampion] = useState<string>("");
  const [champion, setChampion] = useState<string>("");

  // Sub-sections tabs inside favorites view
  const [subTab, setSubTab] = useState<"groups" | "knockouts" | "podium">("groups");

  // Search filter for lists
  const [searchTerm, setSearchTerm] = useState("");

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Sync state from tournamentPredictions when available
  useEffect(() => {
    if (tournamentPredictions) {
      setGroupWinners(tournamentPredictions.groupWinners || {});
      setOctavosTeams(tournamentPredictions.octavosTeams || []);
      setCuartosTeams(tournamentPredictions.cuartosTeams || []);
      setSemifinalTeams(tournamentPredictions.semifinalTeams || []);
      setFinalists(tournamentPredictions.finalists || []);
      setSubchampion(tournamentPredictions.subchampion || "");
      setChampion(tournamentPredictions.champion || "");
    }
  }, [tournamentPredictions]);

  const handleGroupWinnerSelect = (groupName: string, teamName: string) => {
    if (isLocked) return;
    setGroupWinners(prev => ({
      ...prev,
      [groupName]: teamName
    }));
  };

  const toggleTeamSelection = (
    team: string, 
    list: string[], 
    setList: React.Dispatch<React.SetStateAction<string[]>>, 
    limit: number
  ) => {
    if (isLocked) return;
    const isSelected = list.includes(team);
    if (isSelected) {
      setList(prev => prev.filter(t => t !== team));
    } else {
      if (list.length >= limit) return; // Prevent exceeding limit
      setList(prev => [...prev, team]);
    }
  };

  const handleSave = async () => {
    if (!canSave) {
      setMsg({ text: t("Puedes visualizar favoritos, pero necesitas pago confirmado o empresa para guardarlos.", "You can view favorites, but need confirmed payment or company access to save them."), type: "error" });
      return;
    }
    if (isLocked) {
      setMsg({ text: t("Las predicciones ya cerraron.", "Predictions have closed."), type: "error" });
      return;
    }
    setSaving(true);
    setMsg(null);
    try {
      await onSave({
        groupWinners,
        octavosTeams,
        cuartosTeams,
        semifinalTeams,
        finalists,
        subchampion,
        champion
      });
      setMsg({ text: t("¡Favoritos guardados correctamente!", "Favorites saved successfully!"), type: "success" });
    } catch (err: any) {
      setMsg({ text: err.message || t("Error al guardar.", "Error saving."), type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Score comparison stats for displays
  const getPointsEarnedAndResultForGroup = (groupLabel: string) => {
    const key = groupLabel.replace("Grupo ", "");
    const userPick = groupWinners[key];
    const realMatch = tournamentOutcomes?.groupWinners?.[key];

    if (!realMatch) return null; // No outcome set yet
    const correct = userPick && userPick.toLowerCase().trim() === realMatch.toLowerCase().trim();
    return {
      correct,
      userPick,
      realMatch,
      pts: correct ? 100 : 0
    };
  };

  const getPointsEarnedAndResultForTeamArray = (userList: string[], realList: string[]) => {
    if (!realList || realList.length === 0) return null;
    let correctCount = 0;
    userList.forEach(t => {
      if (realList.map(item => item.toLowerCase().trim()).includes(t.toLowerCase().trim())) {
        correctCount++;
      }
    });
    return {
      correctCount,
      pts: correctCount * 200
    };
  };

  const getPointsEarnedAndResultForFinalists = () => {
    const realList = tournamentOutcomes?.finalists;
    if (!realList || realList.length === 0) return null;
    let correctCount = 0;
    finalists.forEach(t => {
      if (realList.map(item => item.toLowerCase().trim()).includes(t.toLowerCase().trim())) {
        correctCount++;
      }
    });
    return {
      correctCount,
      pts: correctCount * 300
    };
  };

  const getPointsForPodium = (pick: string, real: string, ptsAwarded: number) => {
    if (!real) return null;
    const correct = pick && pick.toLowerCase().trim() === real.toLowerCase().trim();
    return {
      correct,
      pts: correct ? ptsAwarded : 0
    };
  };

  return (
    <div className="space-y-6">
      {/* Informational banner / Deadline Status */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
        isLocked 
          ? "bg-rose-50/50 dark:bg-rose-950/15 border-rose-100 dark:border-rose-950 text-rose-800 dark:text-rose-400" 
          : "bg-amber-50/50 dark:bg-amber-950/15 border-amber-100 dark:border-amber-950 text-amber-800 dark:text-amber-400"
      }`}>
        {isLocked ? (
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
        ) : (
          <Clock className="w-5 h-5 mt-0.5 shrink-0 animate-pulse text-amber-600 dark:text-amber-400" />
        )}
        <div className="text-xs space-y-1">
          <p className="font-bold uppercase tracking-wider">
            {isLocked 
              ? t("PRONÓSTICOS DE FAVORITOS CERRADOS", "FAVORITE PREDICTIONS CLOSED") 
              : t("PRONÓSTICOS DE FAVORITOS ABIERTOS", "FAVORITE PREDICTIONS ACTIVE")}
          </p>
          <p className="opacity-90 leading-relaxed">
            {t(
              "Estas predicciones especiales se bloquean a las 19:00 UTC el 10 de Junio de 2026 (exactamente 24 horas antes del primer partido del mundial). ¡Arriesga tus campeones ahora!",
              "These special predictions lock at 19:00 UTC on June 10, 2026 (exactly 24h before the kick-off match of World Cup). Lock in your favorites early!"
            )}
          </p>
          <p className="font-semibold text-[10px] bg-white/50 dark:bg-black/25 px-2 py-0.5 rounded inline-block mt-1 border border-current-color/20">
            {t("Plazo máximo: 10 de Junio, 2026 a las 14:00 (Hora Bogotá)", "Deadline: June 10, 2026 at 14:00 (Bogota standard local time)")}
          </p>
        </div>
      </div>

      {/* Rules Breakdown Mini Card */}
      <div className="p-4 bg-gradient-to-br from-emerald-950 to-indigo-950 border border-emerald-900 rounded-2xl text-white">
        <h3 className="font-bold text-sm flex items-center gap-2 text-emerald-400">
          <Trophy className="w-4 h-4 text-emerald-300" /> {t("Reglas Especiales de Multiplicadores", "Special Tournament Rules")}
        </h3>
        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
          {t("Además del marcador tradicional, compite por enormes botes de puntos prediciendo la evolución del mundial:", "In addition to matches score tipping, compete for huge points brackets based on real outcomes:")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-3 text-[11px] font-medium text-slate-100">
          <div className="p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-400 font-bold block">12 x 100 PTS</span>
            {t("Ganador de cada Grupo (A-L)", "Winner of each group phase")}
          </div>
          <div className="p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-400 font-bold block">16 + 8 + 4 x 200 PTS</span>
            {t("Acertar clasificados en rondas K.O.", "Correct bracket qualifiers")}
          </div>
          <div className="p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-400 font-bold block">2 x 300 PTS</span>
            {t("Aciertos de finalistas de la final", "Correct Grand Finalists")}
          </div>
          <div className="p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-400 font-bold block">500 PTS</span>
            {t("Acierta Subcampeón Mundial", "Correct Runner-up (2nd)")}
          </div>
          <div className="p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-400 font-bold block">1000 PTS</span>
            {t("Acierta Campeón Absoluto", "Correct Absolute Champion (1st)")}
          </div>
          <div className="p-2 bg-emerald-900/40 rounded-xl border border-emerald-800/40">
            <span className="text-rose-400 font-bold block">0 PTS</span>
            {t("Partido sin marcador", "Matches without exact prediction")}
          </div>
        </div>
      </div>

      {/* Internal navigation section headers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          onClick={() => setSubTab("groups")}
          className={`w-full px-3 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 -mb-px ${
            subTab === "groups"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {t("1. Ganadores de Grupo", "1. Group Winners")}
        </button>
        <button
          onClick={() => setSubTab("knockouts")}
          className={`w-full px-3 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 -mb-px ${
            subTab === "knockouts"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {t("2. Rondas Eliminatorias", "2. Knockout Phases")}
        </button>
        <button
          onClick={() => setSubTab("podium")}
          className={`w-full px-3 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 -mb-px ${
            subTab === "podium"
              ? "border-emerald-600 text-emerald-700 dark:text-emerald-400 font-black"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {t("3. Finalistas y Campeón", "3. Finalists & Champion")}
        </button>
      </div>

      {/* 1. SECTION: GROUPS WINNERS */}
      {subTab === "groups" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t(
              "Elige el equipo líder que ganará y clasificará como #1 de cada grupo al finalizar los partidos de la Fase de Grupos. (+100 puntos por acierto)",
              "Tally the exact team who finishes leader (#1) in each group at the end of the group matches. (+100 pts per correct winner)"
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(GROUPS_TEAMS).map(([groupLabel, teamList]) => {
              const groupKey = groupLabel.replace("Grupo ", "");
              const selectedValue = groupWinners[groupKey] || "";
              const checkResult = getPointsEarnedAndResultForGroup(groupLabel);

              return (
                <div 
                  key={groupLabel}
                  className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl p-3.5 space-y-3.5 shadow-sm hover:border-slate-200 dark:hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-900">
                    <span className="font-bold text-xs tracking-wide text-slate-900 dark:text-slate-100">{groupLabel}</span>
                    {checkResult && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        checkResult.correct
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}>
                        {checkResult.correct ? `+100 PTS` : `0 PTS (Líder: ${checkResult.realMatch})`}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {teamList.map((team) => {
                      const isPicked = selectedValue === team;
                      return (
                        <button
                          key={team}
                          disabled={isLocked}
                          onClick={() => handleGroupWinnerSelect(groupKey, team)}
                          className={`w-full flex items-center justify-between p-2.5 text-xs text-left rounded-xl transition ${
                            isPicked 
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800/40" 
                              : "bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border border-transparent hover:bg-slate-100/50"
                          }`}
                        >
                          <span>{team}</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center border transition ${
                            isPicked 
                              ? "border-emerald-600 bg-emerald-600 text-white" 
                              : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                          }`}>
                            {isPicked && <Check className="w-2.5 h-2.5" />}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SECTION: KNOCKOUT CLASSIFIERS */}
      {subTab === "knockouts" && (
        <div className="space-y-5">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t(
              "Selecciona los equipos que participarán en cada ronda eliminatoria. No importa el orden, recibirás +200 puntos por cada equipo real de tu lista que avance a esa ronda.",
              "Pick the exact teams in each elimination bracket. The ordering does not matter; you gain +200 points for every correct team that matches of your selections."
            )}
          </p>

          {/* Search container inside KO selections */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("Filtrar la lista de 48 selecciones...", "Search through all 48 teams...")}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-100 w-full focus:outline-none"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* OCTAVOS SELECTION: 16 TEAMS */}
            <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-900">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    1. {t("Clasifican a Octavos de Final (16 Equipos)", "Reach Octavos de Final (16 Teams)")}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t("+200 puntos por cada acierto", "+200 points per correct pick")}
                  </p>
                </div>
                <div className="flex gap-2.5 items-center">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    octavosTeams.length === 16 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}>
                    {octavosTeams.length} / 16
                  </span>
                  {!isLocked && octavosTeams.length > 0 && (
                    <button
                      onClick={() => setOctavosTeams([])}
                      className="text-[10px] text-rose-500 font-bold hover:underline"
                    >
                      {t("Limpiar", "Clear")}
                    </button>
                  )}
                  {tournamentOutcomes?.octavosTeams && getPointsEarnedAndResultForTeamArray(octavosTeams, tournamentOutcomes.octavosTeams) && (
                    <span className="text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      +{getPointsEarnedAndResultForTeamArray(octavosTeams, tournamentOutcomes.octavosTeams)?.pts} PTS
                    </span>
                  )}
                </div>
              </div>

              {/* Grid of matches filtered */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {ALL_TEAMS.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase())).map(team => {
                  const isSelected = octavosTeams.includes(team);
                  const isRealQual = tournamentOutcomes?.octavosTeams?.map(o => o.toLowerCase().trim()).includes(team.toLowerCase().trim());
                  const hasRealResult = tournamentOutcomes?.octavosTeams && tournamentOutcomes.octavosTeams.length > 0;

                  return (
                    <button
                      key={team}
                      disabled={isLocked || (!isSelected && octavosTeams.length >= 16)}
                      onClick={() => toggleTeamSelection(team, octavosTeams, setOctavosTeams, 16)}
                      className={`p-2 rounded-xl text-xs text-center border transition relative select-none ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-emerald-300 dark:border-emerald-800"
                          : "bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="block truncate">{team}</span>
                      {hasRealResult && isSelected && (
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm ${
                          isRealQual ? "bg-emerald-500" : "bg-rose-500"
                        }`}>
                          {isRealQual ? "✓" : "✗"}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUARTOS SELECTION: 8 TEAMS */}
            <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-900">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    2. {t("Clasifican a Cuartos de Final (8 Equipos)", "Reach Cuartos de Final (8 Teams)")}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t("+200 puntos por cada acierto", "+200 points per correct pick")}
                  </p>
                </div>
                <div className="flex gap-2.5 items-center">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    cuartosTeams.length === 8 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}>
                    {cuartosTeams.length} / 8
                  </span>
                  {!isLocked && cuartosTeams.length > 0 && (
                    <button
                      onClick={() => setCuartosTeams([])}
                      className="text-[10px] text-rose-500 font-bold hover:underline"
                    >
                      {t("Limpiar", "Clear")}
                    </button>
                  )}
                  {tournamentOutcomes?.cuartosTeams && getPointsEarnedAndResultForTeamArray(cuartosTeams, tournamentOutcomes.cuartosTeams) && (
                    <span className="text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      +{getPointsEarnedAndResultForTeamArray(cuartosTeams, tournamentOutcomes.cuartosTeams)?.pts} PTS
                    </span>
                  )}
                </div>
              </div>

              {/* Grid elements */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {/* User can pick from ANY team */}
                {ALL_TEAMS.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase())).map(team => {
                  const isSelected = cuartosTeams.includes(team);
                  const isRealQual = tournamentOutcomes?.cuartosTeams?.map(o => o.toLowerCase().trim()).includes(team.toLowerCase().trim());
                  const hasRealResult = tournamentOutcomes?.cuartosTeams && tournamentOutcomes.cuartosTeams.length > 0;

                  return (
                    <button
                      key={team}
                      disabled={isLocked || (!isSelected && cuartosTeams.length >= 8)}
                      onClick={() => toggleTeamSelection(team, cuartosTeams, setCuartosTeams, 8)}
                      className={`p-2 rounded-xl text-xs text-center border transition relative select-none ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-emerald-300 dark:border-emerald-800"
                          : "bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="block truncate">{team}</span>
                      {hasRealResult && isSelected && (
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm ${
                          isRealQual ? "bg-emerald-500" : "bg-rose-500"
                        }`}>
                          {isRealQual ? "✓" : "✗"}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEMIFINAL SELECTION: 4 TEAMS */}
            <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-900">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    3. {t("Clasifican a Semifinales (4 Equipos)", "Reach Semifinals (4 Teams)")}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t("+200 puntos por cada acierto", "+200 points per correct pick")}
                  </p>
                </div>
                <div className="flex gap-2.5 items-center">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                    semifinalTeams.length === 4 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}>
                    {semifinalTeams.length} / 4
                  </span>
                  {!isLocked && semifinalTeams.length > 0 && (
                    <button
                      onClick={() => setSemifinalTeams([])}
                      className="text-[10px] text-rose-500 font-bold hover:underline"
                    >
                      {t("Limpiar", "Clear")}
                    </button>
                  )}
                  {tournamentOutcomes?.semifinalTeams && getPointsEarnedAndResultForTeamArray(semifinalTeams, tournamentOutcomes.semifinalTeams) && (
                    <span className="text-xs font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      +{getPointsEarnedAndResultForTeamArray(semifinalTeams, tournamentOutcomes.semifinalTeams)?.pts} PTS
                    </span>
                  )}
                </div>
              </div>

              {/* Grid element */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                {ALL_TEAMS.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase())).map(team => {
                  const isSelected = semifinalTeams.includes(team);
                  const isRealQual = tournamentOutcomes?.semifinalTeams?.map(o => o.toLowerCase().trim()).includes(team.toLowerCase().trim());
                  const hasRealResult = tournamentOutcomes?.semifinalTeams && tournamentOutcomes.semifinalTeams.length > 0;

                  return (
                    <button
                      key={team}
                      disabled={isLocked || (!isSelected && semifinalTeams.length >= 4)}
                      onClick={() => toggleTeamSelection(team, semifinalTeams, setSemifinalTeams, 4)}
                      className={`p-2 rounded-xl text-xs text-center border transition relative select-none ${
                        isSelected
                          ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold border-emerald-300 dark:border-emerald-800"
                          : "bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <span className="block truncate">{team}</span>
                      {hasRealResult && isSelected && (
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-sm ${
                          isRealQual ? "bg-emerald-500" : "bg-rose-500"
                        }`}>
                          {isRealQual ? "✓" : "✗"}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SECTION: THE CHAMPIONS PODIUM */}
      {subTab === "podium" && (
        <div className="space-y-6">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t(
              "¡La hora de la verdad! Predice con exactitud cuáles serán los dos finalistas clasificados, el Subcampeón oficial y el glorioso Campeón Absoluto del Mundial 2026. ¡Premio acumulado masivo!",
              "State your predictions for the Finalists, official 2nd place (subchampion) and absolute World Champion (+1000 pts package!)"
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Grand Finalists Selector (2 teams) */}
            <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-900">
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">
                    🥇🥈 {t("Los 2 Finalistas de la Final", "The 2 Finalists")}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t("+300 puntos por cada acierto", "+300 pts per correct finalist")}</p>
                </div>
                {tournamentOutcomes?.finalists && getPointsEarnedAndResultForFinalists() && (
                  <span className="text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">
                    +{getPointsEarnedAndResultForFinalists()?.pts} PTS
                  </span>
                )}
              </div>

              {/* Selection info */}
              <div className="space-y-3">
                <label className="text-[11px] text-slate-400 block font-medium">
                  {t("Elige exactamente 2 selecciones de la lista:", "Select exactly 2 teams below:")}
                </label>
                <select
                  disabled={isLocked}
                  multiple
                  value={finalists}
                  onChange={(e) => {
                    const opts = Array.from(e.target.selectedOptions, (o: any) => o.value);
                    if (opts.length <= 2) setFinalists(opts);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  style={{ height: "140px" }}
                >
                  {ALL_TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {finalists.map(team => (
                    <span key={team} className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold rounded-full px-2.5 py-1 text-[11px] border border-emerald-500/20">
                      {team}
                      {!isLocked && (
                        <button onClick={() => setFinalists(prev => prev.filter(t => t !== team))}>
                          <X className="w-3 h-3 text-emerald-600 dark:text-emerald-400 hover:text-rose-500" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 italic">
                  {t("Ctrl + Click (Windows) o Cmd + Click (Mac) para marcar hasta 2 equipos en la lista móvil.", "Hold Ctrl (Windows) or Cmd (Mac) to click multiple items, or click tags to remove them.")}
                </p>
              </div>
            </div>

            {/* Subcampeon / Runner-up */}
            <div className="bg-white dark:bg-slate-950 border border-slate-150 dark:border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50 dark:border-slate-900">
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase text-slate-700 dark:text-slate-300">
                    🥈 {t("SUBCAMPEÓN MUNDIAL", "WORLD RUNNER-UP (2nd)")}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{t("+500 puntos por acierto", "+500 pts correct prediction")}</p>
                </div>
                {tournamentOutcomes?.subchampion && getPointsForPodium(subchampion, tournamentOutcomes.subchampion, 500) && (
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                    getPointsForPodium(subchampion, tournamentOutcomes.subchampion, 500)?.correct
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-rose-500/10 text-rose-600"
                  }`}>
                    {getPointsForPodium(subchampion, tournamentOutcomes.subchampion, 500)?.correct ? "+500 PTS" : "0 PTS"}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[11px] text-slate-400 block font-medium">
                  {t("Elige el ocupante de la medalla de plata:", "Choose silver medal team:")}
                </label>
                <select
                  disabled={isLocked}
                  value={subchampion}
                  onChange={(e) => setSubchampion(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-800 dark:text-slate-100 focus:ring-1 focus:ring-emerald-500 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- {t("Seleccionar", "Choose Team")} --</option>
                  {ALL_TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                {tournamentOutcomes?.subchampion && (
                  <p className="text-[10px] text-slate-500 italic mt-1.5">
                    {t("Resultado Oficial: ", "Official Leader: ")} <b className="text-emerald-600 dark:text-emerald-400">{tournamentOutcomes.subchampion}</b>
                  </p>
                )}
              </div>
            </div>

            {/* Campeon / World Winner */}
            <div className="bg-gradient-to-tr from-amber-500/5 to-yellow-500/10 dark:from-amber-950/20 dark:to-yellow-950/10 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-amber-100 dark:border-amber-900/40">
                <div>
                  <h4 className="text-xs font-black tracking-wider uppercase text-amber-700 dark:text-amber-400">
                    👑🏆 {t("CAMPEÓN DEL MUNDO", "WORLD CHAMPION (1st)")}
                  </h4>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">{t("+1,000 puntos por acierto", "+1,000 pts correct prediction")}</p>
                </div>
                {tournamentOutcomes?.champion && getPointsForPodium(champion, tournamentOutcomes.champion, 1000) && (
                  <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                    getPointsForPodium(champion, tournamentOutcomes.champion, 1000)?.correct
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-rose-500/10 text-rose-600"
                  }`}>
                    {getPointsForPodium(champion, tournamentOutcomes.champion, 1000)?.correct ? "+1000 PTS" : "0 PTS"}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[11px] text-amber-600 block font-medium">
                  {t("Elige el glorioso campeón de la Copa del Mundo 2026:", "Choose absolute champion of the FIFA Cup:")}
                </label>
                <select
                  disabled={isLocked}
                  value={champion}
                  onChange={(e) => setChampion(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-900 rounded-xl p-3 text-xs text-slate-850 dark:text-slate-100 focus:ring-1 focus:ring-amber-500 focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- {t("Seleccionar", "Choose Team")} --</option>
                  {ALL_TEAMS.map(team => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                {tournamentOutcomes?.champion && (
                  <p className="text-[10px] text-amber-600 italic mt-1.5">
                    {t("Resultado Oficial: ", "Official Leader: ")} <b className="text-amber-500 font-bold">{tournamentOutcomes.champion}</b>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACTIONS: SAVE BUTTON */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">{t("Fecha de Registro", "Audit Log")}</span>
          <span className="text-xs text-slate-700 dark:text-slate-300 font-mono">
            {tournamentPredictions?.lastUpdated 
              ? `${t("Último guardado: ", "Saved on: ")} ${new Date(tournamentPredictions.lastUpdated).toLocaleString()}`
              : t("Sin registrar pronóstico aún", "No prediction saved yet")
            }
          </span>
        </div>

        <div className="flex gap-2 items-center">
          {msg && (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
              msg.type === "success" 
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-600 border-rose-500/20"
            }`}>
              {msg.text}
            </span>
          )}

          {!isLocked ? (
            <button
              onClick={handleSave}
              disabled={saving || !canSave}
              className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              <Trophy className="w-4 h-4" />
              {saving ? t("Guardando...", "Saving...") : canSave ? t("Guardar Favoritos", "Save Favorites") : t("Solo visualizar", "View only")}
            </button>
          ) : (
            <span className="text-xs text-rose-600 font-bold uppercase tracking-wider bg-rose-50 px-3 py-2 border border-rose-200 rounded-xl">
              {t("Plazo Agotado - Lectura Únicamente", "Locked - Ready Only")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
