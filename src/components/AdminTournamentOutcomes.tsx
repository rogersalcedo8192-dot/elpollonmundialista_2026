import React, { useState, useEffect } from "react";
import { Trophy, Save, ShieldAlert, CheckSquare, Search } from "lucide-react";
import { TournamentOutcomes } from "../types";

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
  currentOutcomes: TournamentOutcomes | null;
  onSave: (outcomes: TournamentOutcomes) => Promise<void>;
}

export const AdminTournamentOutcomes: React.FC<Props> = ({ currentOutcomes, onSave }) => {
  const [groupWinners, setGroupWinners] = useState<Record<string, string>>({});
  const [octavosTeams, setOctavosTeams] = useState<string[]>([]);
  const [cuartosTeams, setCuartosTeams] = useState<string[]>([]);
  const [semifinalTeams, setSemifinalTeams] = useState<string[]>([]);
  const [finalists, setFinalists] = useState<string[]>([]);
  const [subchampion, setSubchampion] = useState<string>("");
  const [champion, setChampion] = useState<string>("");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (currentOutcomes) {
      setGroupWinners(currentOutcomes.groupWinners || {});
      setOctavosTeams(currentOutcomes.octavosTeams || []);
      setCuartosTeams(currentOutcomes.cuartosTeams || []);
      setSemifinalTeams(currentOutcomes.semifinalTeams || []);
      setFinalists(currentOutcomes.finalists || []);
      setSubchampion(currentOutcomes.subchampion || "");
      setChampion(currentOutcomes.champion || "");
    }
  }, [currentOutcomes]);

  const handleToggleTeam = (team: string, currentList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, limit: number) => {
    if (currentList.includes(team)) {
      setList(prev => prev.filter(t => t !== team));
    } else {
      if (currentList.length >= limit) return;
      setList(prev => [...prev, team]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

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
      setSuccessMsg("¡Resultados oficiales del mundial actualizados y rankings recalculados con éxito!");
    } catch (err: any) {
      setErrorMsg(err.message || "Error al actualizar resultados.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
        <ShieldAlert className="text-amber-500 w-5 h-5 shrink-0" />
        <div>
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-100">Cargar Resultados Oficiales de Favoritos (Admin)</h3>
          <p className="text-[11px] text-slate-500">Únicamente tú puedes cargar qué selecciones avanzaron oficialmente en cada fase. Una vez cargado registrará los bonus de cada participante.</p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
        {/* ROW 1: Group Leaders */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest text-[10px]">1. Líderes Finales de Grupo (Fase de Grupos)</h4>
          <p className="text-[10px] text-slate-400">Selecciona el equipo real que avanzó oficial en la 1ra posición de cada sector:</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(GROUPS_TEAMS).map(([groupLabel, teamList]) => {
              const groupKey = groupLabel.replace("Grupo ", "");
              return (
                <div key={groupLabel} className="bg-white dark:bg-slate-950 p-2 border rounded-xl space-y-1 shadow-sm">
                  <label className="font-bold text-[10px] text-slate-500 block truncate">{groupLabel}</label>
                  <select
                    value={groupWinners[groupKey] || ""}
                    onChange={(e) => setGroupWinners(prev => ({ ...prev, [groupKey]: e.target.value }))}
                    className="w-full bg-slate-50 border p-1 rounded text-[11px] focus:outline-none"
                  >
                    <option value="">-- Vacío --</option>
                    {teamList.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Team search helper for lists */}
        <div className="p-2 bg-white dark:bg-slate-950 border rounded-xl flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            className="bg-transparent w-full focus:outline-none text-[11px]"
            placeholder="Filtrar equipos para marcar cómodamente las siguientes fases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ROW 2: Octavos, Cuartos, Semifinals Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* OCTAVOS (16) */}
          <div className="bg-white dark:bg-slate-950 border rounded-2xl p-3.5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-[11px] uppercase tracking-wide">Octavos de Final</span>
              <span className="bg-slate-100 font-mono px-2 py-0.5 rounded text-[10px]">{octavosTeams.length} / 16</span>
            </div>
            <div className="overflow-y-auto max-h-[180px] space-y-1.5 pr-1 font-mono text-[11px]">
              {ALL_TEAMS.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase())).map(t => {
                const checked = octavosTeams.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleToggleTeam(t, octavosTeams, setOctavosTeams, 16)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg border transition ${
                      checked 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold" 
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{t}</span>
                    {checked && <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CUARTOS (8) */}
          <div className="bg-white dark:bg-slate-950 border rounded-2xl p-3.5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-[11px] uppercase tracking-wide">Cuartos de Final</span>
              <span className="bg-slate-100 font-mono px-2 py-0.5 rounded text-[10px]">{cuartosTeams.length} / 8</span>
            </div>
            <div className="overflow-y-auto max-h-[180px] space-y-1.5 pr-1 font-mono text-[11px]">
              {ALL_TEAMS.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase())).map(t => {
                const checked = cuartosTeams.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleToggleTeam(t, cuartosTeams, setCuartosTeams, 8)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg border transition ${
                      checked 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold" 
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{t}</span>
                    {checked && <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEMIFINAL (4) */}
          <div className="bg-white dark:bg-slate-950 border rounded-2xl p-3.5 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-bold text-[11px] uppercase tracking-wide">Semifinales</span>
              <span className="bg-slate-100 font-mono px-2 py-0.5 rounded text-[10px]">{semifinalTeams.length} / 4</span>
            </div>
            <div className="overflow-y-auto max-h-[180px] space-y-1.5 pr-1 font-mono text-[11px]">
              {ALL_TEAMS.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase())).map(t => {
                const checked = semifinalTeams.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleToggleTeam(t, semifinalTeams, setSemifinalTeams, 4)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg border transition ${
                      checked 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold" 
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <span>{t}</span>
                    {checked && <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* ROW 3: Finalists, Runner-up & Winner */}
        <div className="bg-white dark:bg-slate-950 border rounded-2xl p-4 space-y-4">
          <h4 className="font-bold uppercase tracking-wider text-[11px] pb-2 border-b">Podio Real del Mundial</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            
            {/* Finalists Multi */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 block">Los 2 Finalistas Reales</label>
              <select
                multiple
                value={finalists}
                onChange={(e) => {
                  const opts = Array.from(e.target.selectedOptions, (o: any) => o.value);
                  if (opts.length <= 2) setFinalists(opts);
                }}
                className="w-full bg-slate-50 border p-2 rounded h-[110px] focus:outline-none text-[11px]"
              >
                {ALL_TEAMS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400">Ctrl + Click para seleccionar exactamente 2.</p>
            </div>

            {/* Subchampion Single */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 block">Subcampeón Real</label>
              <select
                value={subchampion}
                onChange={(e) => setSubchampion(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded focus:outline-none text-[11px]"
              >
                <option value="">Seleccionar...</option>
                {ALL_TEAMS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Champion Single */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 block">Campeón Real</label>
              <select
                value={champion}
                onChange={(e) => setChampion(e.target.value)}
                className="w-full bg-slate-50 border p-2 rounded focus:outline-none text-[11px]"
              >
                <option value="">Seleccionar...</option>
                {ALL_TEAMS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* FEEDBACK & SUBMIT ACTION */}
        <div className="flex gap-4 items-center justify-between pt-2">
          <div>
            {successMsg && <span className="text-emerald-600 font-bold block">{successMsg}</span>}
            {errorMsg && <span className="text-rose-600 font-bold block">{errorMsg}</span>}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4" />
            {saving ? "Cargando..." : "Actualizar Resultados Oficiales & Recalcular"}
          </button>
        </div>
      </form>
    </div>
  );
};
