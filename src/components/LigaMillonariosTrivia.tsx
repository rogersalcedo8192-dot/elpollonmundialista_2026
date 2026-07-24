import React, { useMemo, useState } from "react";
import { Check, HelpCircle, RotateCcw, Trophy, X } from "lucide-react";

type Question = { question: string; options: string[]; answer: string; explanation: string };

const QUESTIONS: Question[] = [
  { question: "¿En qué año fue fundado oficialmente Millonarios FC?", options: ["1938", "1946", "1949", "1951"], answer: "1946", explanation: "Millonarios FC reconoce 1946 como el año de su fundación oficial." },
  { question: "¿En qué ciudad juega como local Millonarios?", options: ["Medellín", "Cali", "Bogotá", "Manizales"], answer: "Bogotá", explanation: "Millonarios es uno de los clubes históricos de Bogotá." },
  { question: "¿Cuál es el estadio tradicional de Millonarios?", options: ["El Campín", "Atanasio Girardot", "Pascual Guerrero", "Metropolitano"], answer: "El Campín", explanation: "El Estadio Nemesio Camacho El Campín es la casa tradicional del equipo azul." },
  { question: "¿Cuál es el apodo más reconocido de Millonarios?", options: ["El Poderoso", "El Embajador", "El Leopardo", "El Cardenal"], answer: "El Embajador", explanation: "El club y sus aficionados son conocidos como los Embajadores." },
  { question: "¿En qué año ganó Millonarios su primer título de Liga profesional?", options: ["1948", "1949", "1950", "1952"], answer: "1949", explanation: "El campeonato de 1949 fue la primera estrella profesional del club." },
  { question: "¿Qué figura argentina encabezó la llegada de estrellas a Millonarios en 1949?", options: ["Adolfo Pedernera", "Mario Kempes", "Daniel Passarella", "Jorge Valdano"], answer: "Adolfo Pedernera", explanation: "Pedernera llegó en 1949 y fue pieza central de la época de El Dorado." },
  { question: "¿Qué leyenda mundial jugó en Millonarios antes de llegar al Real Madrid?", options: ["Alfredo Di Stéfano", "Ferenc Puskás", "Eusébio", "Johan Cruyff"], answer: "Alfredo Di Stéfano", explanation: "Alfredo Di Stéfano brilló con Millonarios antes de su etapa en el Real Madrid." },
  { question: "¿Cómo se conoció al célebre equipo azul de comienzos de los años cincuenta?", options: ["La Máquina", "El Ballet Azul", "Los Matadores", "La Academia"], answer: "El Ballet Azul", explanation: "El equipo campeón de 1951 consolidó el nombre de Ballet Azul." },
  { question: "¿Cuántos goles anotó Millonarios durante su campaña campeona de 1949?", options: ["74", "88", "103", "120"], answer: "103", explanation: "El primer campeón azul marcó 103 goles durante el torneo de 1949." },
  { question: "¿Quién fue goleador del torneo de 1949 con Millonarios?", options: ["Pedro Cabillón", "Alfredo Di Stéfano", "Willington Ortiz", "Arnoldo Iguarán"], answer: "Pedro Cabillón", explanation: "Pedro Cabillón lideró la tabla con 42 anotaciones." },
  { question: "¿Qué trío integró el ataque histórico del Ballet Azul de 1951?", options: ["Pedernera, Di Stéfano y Báez", "Iguarán, Ortiz y Funes", "Rincón, Asprilla y Valencia", "Silva, Castro y Ruiz"], answer: "Pedernera, Di Stéfano y Báez", explanation: "Pedernera, Di Stéfano y Antonio Báez conformaron una tripleta extraordinaria." },
  { question: "¿Quién fue el arquero del Ballet Azul campeón de 1951?", options: ["Julio Cozzi", "Amadeo Carrizo", "Efraín Sánchez", "Óscar Córdoba"], answer: "Julio Cozzi", explanation: "Julio Cozzi custodió la valla menos vencida de aquel campeonato." },
  { question: "¿Cuántos goles marcó Alfredo Di Stéfano para ser goleador en 1951?", options: ["24", "28", "32", "40"], answer: "32", explanation: "Di Stéfano terminó como goleador del torneo con 32 tantos." },
  { question: "¿A qué gigante europeo venció Millonarios 4-2 en su torneo de Bodas de Oro?", options: ["Barcelona", "Real Madrid", "Juventus", "Bayern Múnich"], answer: "Real Madrid", explanation: "Millonarios derrotó 4-2 al Real Madrid en Madrid durante 1952." },
  { question: "¿Cuál es el título internacional oficial más reciente de Millonarios?", options: ["Copa Libertadores", "Copa Sudamericana", "Copa Merconorte 2001", "Recopa Sudamericana"], answer: "Copa Merconorte 2001", explanation: "La Copa Merconorte de 2001 es el título internacional oficial más reciente del club." },
  { question: "¿Qué número de estrella de Liga consiguió Millonarios en 2012?", options: ["12", "13", "14", "15"], answer: "14", explanation: "El título de 2012 significó la estrella número 14." },
  { question: "¿Cuántos años esperó Millonarios entre los títulos de Liga de 1988 y 2012?", options: ["18", "20", "22", "24"], answer: "24", explanation: "La estrella de 2012 terminó una espera de 24 años." },
  { question: "¿Contra qué equipo disputó Millonarios la final de Liga de 2012?", options: ["Medellín", "Nacional", "Junior", "Cali"], answer: "Medellín", explanation: "Millonarios superó al Independiente Medellín en una definición por penales." },
  { question: "¿Qué arquero fue decisivo y convirtió un penal en la final de 2012?", options: ["Luis Delgado", "Álvaro Montero", "Juanito Moreno", "Wuilker Faríñez"], answer: "Luis Delgado", explanation: "Luis Enrique Delgado convirtió un penal y atajó el cobro definitivo." },
  { question: "¿A qué rival venció Millonarios en la final de Liga 2017-II?", options: ["Santa Fe", "Nacional", "América", "Tolima"], answer: "Santa Fe", explanation: "La final fue un Clásico Capitalino y terminó 3-2 en el global." },
  { question: "¿Quién marcó el inolvidable gol que aseguró el título de 2017-II?", options: ["Henry Rojas", "Ayron del Valle", "Andrés Cadavid", "David Silva"], answer: "Henry Rojas", explanation: "Henry Rojas anotó el gol decisivo en la final frente a Santa Fe." },
  { question: "¿Quién dirigió a Millonarios en el título de Liga 2017-II?", options: ["Miguel Ángel Russo", "Hernán Torres", "Alberto Gamero", "Jorge Luis Pinto"], answer: "Miguel Ángel Russo", explanation: "El argentino Miguel Ángel Russo fue el entrenador campeón." },
  { question: "¿Contra qué rival ganó Millonarios la Liga 2023-I?", options: ["Atlético Nacional", "Junior", "Santa Fe", "Deportes Tolima"], answer: "Atlético Nacional", explanation: "La final de 2023-I se definió ante Atlético Nacional." },
  { question: "¿Cuál fue el marcador de la tanda de penales de la final 2023-I?", options: ["3-2", "4-3", "5-4", "2-1"], answer: "3-2", explanation: "Millonarios ganó 3-2 la tanda y consiguió su estrella número 16." },
  { question: "¿Con qué título comenzó Millonarios el año 2024?", options: ["Liga", "Copa Colombia", "Superliga", "Copa Merconorte"], answer: "Superliga", explanation: "Millonarios se consagró campeón de la Superliga en enero de 2024." }
];

const BEST_SCORE_KEY = "pollon_liga_millonarios_trivia_best";

export function LigaMillonariosTrivia() {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(BEST_SCORE_KEY) || 0));
  const question = QUESTIONS[questionIndex];
  const progress = ((questionIndex + (finished ? 1 : 0)) / QUESTIONS.length) * 100;
  const isCorrect = selectedAnswer === question.answer;
  const resultMessage = useMemo(() => score >= 22 ? "Eres una enciclopedia embajadora." : score >= 17 ? "Gran nivel azul." : score >= 10 ? "Buen intento. Conoces buena parte de la historia." : "Hay mucha historia azul por descubrir.", [score]);

  const chooseAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer === question.answer) setScore((current) => current + 1);
  };
  const continueTrivia = () => {
    if (!selectedAnswer) return;
    if (questionIndex === QUESTIONS.length - 1) {
      const nextBest = Math.max(bestScore, score);
      setBestScore(nextBest); localStorage.setItem(BEST_SCORE_KEY, String(nextBest)); setFinished(true); return;
    }
    setQuestionIndex((current) => current + 1); setSelectedAnswer("");
  };
  const restart = () => { setQuestionIndex(0); setSelectedAnswer(""); setScore(0); setFinished(false); };

  if (finished) return <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-xl dark:border-blue-900 dark:bg-slate-900"><div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-7 text-center text-white"><Trophy className="mx-auto h-14 w-14 text-amber-300" /><p className="mt-4 text-[10px] font-black uppercase tracking-[0.24em] text-blue-300">Trivia terminada</p><h2 className="mt-2 text-3xl font-black">{score} de {QUESTIONS.length}</h2><p className="mt-2 text-sm text-slate-300">{resultMessage}</p></div><div className="space-y-5 p-6 text-center"><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-blue-200 bg-blue-50 p-4"><span className="block text-[10px] font-black uppercase text-blue-700">Aciertos</span><strong className="mt-1 block text-2xl">{score}</strong></div><div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><span className="block text-[10px] font-black uppercase text-amber-700">Mejor resultado</span><strong className="mt-1 block text-2xl">{bestScore}</strong></div></div><p className="text-xs text-slate-500">Esta actividad no suma puntos ni modifica el ranking.</p><button type="button" onClick={restart} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-blue-700"><RotateCcw className="h-4 w-4" /> Volver a jugar</button></div></div>;

  return <div className="mx-auto max-w-3xl space-y-4"><div className="rounded-2xl border border-blue-800/50 bg-gradient-to-r from-slate-950 to-blue-950 p-5 text-white"><div className="flex justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Pollón Liga II</p><h2 className="mt-1 flex items-center gap-2 text-2xl font-black"><HelpCircle className="h-6 w-6 text-amber-300" /> Trivia de Millonarios</h2><p className="mt-2 text-xs text-slate-300">25 preguntas para medir cuánto sabes de la historia azul.</p></div><div className="text-right"><span className="block text-[9px] font-bold uppercase text-slate-400">Aciertos</span><strong className="text-xl text-amber-300">{score}</strong></div></div><div className="relative mt-5 pt-4"><span className="absolute top-0 -translate-x-1/2 text-2xl transition-[left] duration-500" style={{ left: `${Math.min(Math.max(progress, 2), 98)}%` }}>🐓</span><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-blue-400 transition-all duration-500" style={{ width: `${progress}%` }} /></div></div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7 dark:border-slate-800 dark:bg-slate-900"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pregunta {questionIndex + 1} de {QUESTIONS.length}</p><h3 className="mt-2 text-lg font-black md:text-xl">{question.question}</h3><div className="mt-6 grid gap-3 sm:grid-cols-2">{question.options.map((option) => { const selected = selectedAnswer === option; const answer = option === question.answer; const tone = !selectedAnswer ? "border-slate-200 hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700" : answer ? "border-emerald-500 bg-emerald-50 text-emerald-900" : selected ? "border-rose-400 bg-rose-50 text-rose-800" : "border-slate-200 opacity-55"; return <button key={option} type="button" onClick={() => chooseAnswer(option)} disabled={Boolean(selectedAnswer)} className={`flex min-h-14 items-center justify-between gap-3 rounded-xl border p-3 text-left text-sm font-bold ${tone}`}><span>{option}</span>{selectedAnswer && answer && <Check className="h-5 w-5 text-emerald-600" />}{selectedAnswer && selected && !answer && <X className="h-5 w-5 text-rose-500" />}</button>; })}</div>{selectedAnswer && <div className={`mt-5 rounded-xl border p-4 ${isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}><p className={`text-sm font-black ${isCorrect ? "text-emerald-800" : "text-rose-800"}`}>{isCorrect ? "Respuesta correcta" : `La respuesta correcta es: ${question.answer}`}</p><p className="mt-1 text-xs text-slate-600">{question.explanation}</p></div>}<div className="mt-6 flex items-center justify-between gap-3"><span className="text-[10px] text-slate-400">Sin puntos ni premios. Solo diversión.</span><button type="button" onClick={continueTrivia} disabled={!selectedAnswer} className="min-h-11 rounded-xl bg-slate-950 px-5 text-xs font-black text-white hover:bg-blue-700 disabled:opacity-40">{questionIndex === QUESTIONS.length - 1 ? "Ver resultado" : "Siguiente pregunta"}</button></div></div></div>;
}
