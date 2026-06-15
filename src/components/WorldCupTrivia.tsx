import React, { useMemo, useState } from "react";
import { Check, HelpCircle, RotateCcw, Trophy, X } from "lucide-react";

type TriviaQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

const QUESTIONS: TriviaQuestion[] = [
  {
    question: "¿En qué país se disputó el primer Mundial de fútbol en 1930?",
    options: ["Brasil", "Uruguay", "Italia", "Argentina"],
    answer: "Uruguay",
    explanation: "Uruguay organizó y ganó la primera Copa Mundial en 1930."
  },
  {
    question: "¿Qué selección ha ganado más Copas Mundiales masculinas?",
    options: ["Alemania", "Italia", "Argentina", "Brasil"],
    answer: "Brasil",
    explanation: "Brasil ha conquistado cinco títulos mundiales."
  },
  {
    question: "¿Quién fue campeón del Mundial de Sudáfrica 2010?",
    options: ["Países Bajos", "Alemania", "España", "Brasil"],
    answer: "España",
    explanation: "España venció 1-0 a Países Bajos con gol de Andrés Iniesta."
  },
  {
    question: "¿Qué selección ganó el Mundial de Catar 2022?",
    options: ["Francia", "Argentina", "Croacia", "Marruecos"],
    answer: "Argentina",
    explanation: "Argentina derrotó a Francia en una final decidida por penales."
  },
  {
    question: "¿Cuáles son los tres países anfitriones del Mundial 2026?",
    options: ["Estados Unidos, Canadá y México", "México, Brasil y Argentina", "Canadá, Inglaterra y Estados Unidos", "Estados Unidos, Costa Rica y México"],
    answer: "Estados Unidos, Canadá y México",
    explanation: "El Mundial 2026 es organizado conjuntamente por Canadá, México y Estados Unidos."
  },
  {
    question: "¿Cuántas selecciones participan en el Mundial 2026?",
    options: ["32", "36", "40", "48"],
    answer: "48",
    explanation: "La edición de 2026 amplió el torneo de 32 a 48 selecciones."
  },
  {
    question: "¿Qué jugador tiene el récord histórico de goles en Mundiales masculinos?",
    options: ["Ronaldo Nazário", "Miroslav Klose", "Lionel Messi", "Gerd Müller"],
    answer: "Miroslav Klose",
    explanation: "El alemán Miroslav Klose marcó 16 goles en Copas Mundiales."
  },
  {
    question: "¿Quién marcó la famosa 'Mano de Dios' en México 1986?",
    options: ["Pelé", "Diego Maradona", "Jorge Valdano", "Gary Lineker"],
    answer: "Diego Maradona",
    explanation: "Maradona anotó aquel gol frente a Inglaterra en los cuartos de final."
  },
  {
    question: "¿Qué selección ganó el Mundial de 1966 como anfitriona?",
    options: ["Inglaterra", "Alemania Federal", "Portugal", "Italia"],
    answer: "Inglaterra",
    explanation: "Inglaterra ganó su primer título mundial en Wembley."
  },
  {
    question: "¿Quién fue campeón del Mundial de Alemania 2006?",
    options: ["Francia", "Alemania", "Italia", "Brasil"],
    answer: "Italia",
    explanation: "Italia venció a Francia por penales en la final de Berlín."
  },
  {
    question: "¿Qué selección ganó el Mundial de Francia 1998?",
    options: ["Brasil", "Francia", "Croacia", "Argentina"],
    answer: "Francia",
    explanation: "Francia obtuvo su primer título al vencer 3-0 a Brasil."
  },
  {
    question: "¿Qué país fue el primer anfitrión africano de un Mundial?",
    options: ["Marruecos", "Egipto", "Sudáfrica", "Camerún"],
    answer: "Sudáfrica",
    explanation: "Sudáfrica organizó el Mundial de 2010."
  },
  {
    question: "¿Qué dos países organizaron conjuntamente el Mundial de 2002?",
    options: ["China y Japón", "Japón y Corea del Sur", "Corea del Sur y Australia", "Japón y Tailandia"],
    answer: "Japón y Corea del Sur",
    explanation: "Fue el primer Mundial organizado por dos países y el primero disputado en Asia."
  },
  {
    question: "¿Qué selección protagonizó el 'Maracanazo' de 1950?",
    options: ["Argentina", "Uruguay", "Chile", "Paraguay"],
    answer: "Uruguay",
    explanation: "Uruguay derrotó a Brasil en el partido decisivo disputado en el Maracaná."
  },
  {
    question: "¿Qué premio recibe el máximo goleador de cada Mundial?",
    options: ["Balón de Oro", "Bota de Oro", "Guante de Oro", "Trofeo Fair Play"],
    answer: "Bota de Oro",
    explanation: "La Bota de Oro distingue al máximo goleador del torneo."
  },
  {
    question: "¿Qué premio reconoce al mejor portero del Mundial?",
    options: ["Guante de Oro", "Bota de Oro", "Balón de Plata", "Premio Lev Yashin de clubes"],
    answer: "Guante de Oro",
    explanation: "El Guante de Oro se entrega al guardameta más destacado del torneo."
  },
  {
    question: "¿Qué selección ganó el Mundial de Brasil 2014?",
    options: ["Argentina", "Brasil", "Alemania", "Países Bajos"],
    answer: "Alemania",
    explanation: "Alemania venció 1-0 a Argentina con gol de Mario Götze."
  },
  {
    question: "¿Qué selección fue campeona en Rusia 2018?",
    options: ["Croacia", "Bélgica", "Francia", "Inglaterra"],
    answer: "Francia",
    explanation: "Francia derrotó 4-2 a Croacia en la final."
  },
  {
    question: "¿Quién tiene el récord de más goles en una sola edición del Mundial?",
    options: ["Just Fontaine", "Sándor Kocsis", "Gerd Müller", "Eusébio"],
    answer: "Just Fontaine",
    explanation: "El francés Just Fontaine marcó 13 goles en Suecia 1958."
  },
  {
    question: "¿Qué país organizó el Mundial de 1994?",
    options: ["México", "Estados Unidos", "Canadá", "Italia"],
    answer: "Estados Unidos",
    explanation: "Estados Unidos fue anfitrión del Mundial de 1994, ganado por Brasil."
  },
  {
    question: "¿Qué selección ganó su primer Mundial en 2010?",
    options: ["Portugal", "Países Bajos", "España", "Croacia"],
    answer: "España",
    explanation: "El título de Sudáfrica 2010 fue el primero de España."
  },
  {
    question: "¿Quién anotó el gol decisivo de la final del Mundial 2010?",
    options: ["David Villa", "Xavi Hernández", "Andrés Iniesta", "Fernando Torres"],
    answer: "Andrés Iniesta",
    explanation: "Iniesta marcó en la prórroga frente a Países Bajos."
  },
  {
    question: "¿Contra qué selección jugó Argentina la final del Mundial 2022?",
    options: ["Croacia", "Francia", "Países Bajos", "Brasil"],
    answer: "Francia",
    explanation: "Argentina y Francia empataron 3-3 antes de la definición por penales."
  },
  {
    question: "¿Qué selección fue subcampeona del Mundial de 2018?",
    options: ["Croacia", "Bélgica", "Inglaterra", "Argentina"],
    answer: "Croacia",
    explanation: "Croacia alcanzó su primera final mundialista en Rusia 2018."
  },
  {
    question: "¿Cómo se llamaba el trofeo que Brasil conservó al ganar su tercer Mundial en 1970?",
    options: ["Copa de las Naciones", "Trofeo Jules Rimet", "Copa Henri Delaunay", "Trofeo Artemio Franchi"],
    answer: "Trofeo Jules Rimet",
    explanation: "Brasil recibió definitivamente el Trofeo Jules Rimet después de su tercer título."
  }
];

const BEST_SCORE_KEY = "pollon_world_cup_trivia_best";
const CONFETTI_COLORS = ["#10b981", "#fbbf24", "#38bdf8", "#f43f5e", "#ffffff"];

export const WorldCupTrivia: React.FC = () => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(BEST_SCORE_KEY) || 0));
  const question = QUESTIONS[questionIndex];
  const progress = ((questionIndex + (finished ? 1 : 0)) / QUESTIONS.length) * 100;
  const isCorrect = selectedAnswer === question.answer;
  const perfectScore = finished && score === QUESTIONS.length;

  const resultMessage = useMemo(() => {
    if (score >= 22) return "Eres una enciclopedia mundialista.";
    if (score >= 17) return "Gran nivel. Sabes bastante de los Mundiales.";
    if (score >= 10) return "Buen intento. Hay historia para seguir descubriendo.";
    return "Lo importante es divertirse. Inténtalo de nuevo.";
  }, [score]);

  const chooseAnswer = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    if (answer === question.answer) setScore((current) => current + 1);
  };

  const continueTrivia = () => {
    if (!selectedAnswer) return;
    if (questionIndex === QUESTIONS.length - 1) {
      const finalScore = score;
      const nextBest = Math.max(bestScore, finalScore);
      setBestScore(nextBest);
      localStorage.setItem(BEST_SCORE_KEY, String(nextBest));
      setFinished(true);
      return;
    }
    setQuestionIndex((current) => current + 1);
    setSelectedAnswer("");
  };

  const restart = () => {
    setQuestionIndex(0);
    setSelectedAnswer("");
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className={`relative max-w-2xl mx-auto rounded-3xl border bg-white dark:bg-slate-900 overflow-hidden shadow-xl ${
        perfectScore ? "border-amber-300 trivia-perfect-shell" : "border-amber-200 dark:border-amber-900"
      }`}>
        {perfectScore && (
          <div className="trivia-confetti" aria-hidden="true">
            {Array.from({ length: 36 }, (_, index) => (
              <span
                key={index}
                style={{
                  left: `${(index * 37) % 100}%`,
                  backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
                  animationDelay: `${(index % 12) * -0.14}s`,
                  animationDuration: `${2.6 + (index % 7) * 0.22}s`
                }}
              />
            ))}
          </div>
        )}
        <div className={`relative bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 p-7 text-center text-white ${
          perfectScore ? "trivia-perfect-hero" : ""
        }`}>
          {perfectScore && (
            <div className="trivia-champion-ring" aria-hidden="true">
              <span>★</span><span>2026</span><span>★</span>
            </div>
          )}
          <div className={perfectScore ? "trivia-trophy-burst" : ""}>
            <Trophy className="w-14 h-14 mx-auto text-amber-300" />
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-[0.24em] font-black text-emerald-300">Trivia terminada</p>
          <h2 className="text-3xl font-black mt-2">{score} de {QUESTIONS.length}</h2>
          <p className="text-sm text-slate-300 mt-2">{resultMessage}</p>
          {perfectScore && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-300/15 px-4 py-2 text-amber-100 font-black text-xs tracking-wide trivia-champion-badge">
              🐓 CAMPEÓN MUNDIAL DE LA TRIVIA 2026 🏆
            </div>
          )}
        </div>
        <div className="p-6 text-center space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-4">
              <span className="block text-[10px] uppercase font-black text-emerald-700 dark:text-emerald-300">Aciertos</span>
              <strong className="block text-2xl mt-1">{score}</strong>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4">
              <span className="block text-[10px] uppercase font-black text-amber-700 dark:text-amber-300">Mejor resultado</span>
              <strong className="block text-2xl mt-1">{bestScore}</strong>
            </div>
          </div>
          <p className="text-xs text-slate-500">Esta actividad es solo por diversión. No suma puntos ni modifica el ranking.</p>
          <button type="button" onClick={restart} className="min-h-12 px-5 rounded-xl bg-slate-950 hover:bg-emerald-700 text-white text-sm font-black inline-flex items-center gap-2">
            <RotateCcw className="w-4 h-4" /> Volver a jugar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="rounded-2xl bg-gradient-to-r from-slate-950 to-emerald-950 text-white p-5 border border-emerald-800/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-300">El Pollón Mundialista</p>
            <h2 className="text-2xl font-black mt-1 flex items-center gap-2"><HelpCircle className="w-6 h-6 text-amber-300" /> Trivia Mundialista</h2>
            <p className="text-xs text-slate-300 mt-2">25 preguntas para divertirte y medir cuánto sabes de la Copa Mundial.</p>
          </div>
          <div className="text-right shrink-0">
            <span className="block text-[9px] uppercase text-slate-400 font-bold">Aciertos</span>
            <strong className="text-xl text-amber-300">{score}</strong>
          </div>
        </div>
        <div className="mt-5 relative pt-4">
          <span
            className="absolute top-0 text-2xl leading-none -translate-x-1/2 transition-[left] duration-500 ease-out drop-shadow-md"
            style={{ left: `${Math.min(Math.max(progress, 2), 98)}%` }}
            role="img"
            aria-label="Progreso del gallo"
          >
            🐓
          </span>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-7 shadow-sm">
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Pregunta {questionIndex + 1} de {QUESTIONS.length}</p>
        <h3 className="text-lg md:text-xl font-black text-slate-950 dark:text-white mt-2">{question.question}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option;
            const isAnswer = option === question.answer;
            const tone = !selectedAnswer
              ? "border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              : isAnswer
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200"
                : isSelected
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-200"
                  : "border-slate-200 dark:border-slate-800 opacity-55";
            return (
              <button key={option} type="button" onClick={() => chooseAnswer(option)} disabled={Boolean(selectedAnswer)} className={`min-h-14 rounded-xl border p-3 text-left text-sm font-bold transition-colors flex items-center justify-between gap-3 ${tone}`}>
                <span>{option}</span>
                {selectedAnswer && isAnswer && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
                {selectedAnswer && isSelected && !isAnswer && <X className="w-5 h-5 text-rose-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {selectedAnswer && (
          <div className={`mt-5 rounded-xl border p-4 ${isCorrect ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900" : "border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900"}`}>
            <p className={`text-sm font-black ${isCorrect ? "text-emerald-800 dark:text-emerald-200" : "text-rose-800 dark:text-rose-200"}`}>
              {isCorrect ? "Respuesta correcta" : `La respuesta correcta es: ${question.answer}`}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{question.explanation}</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 mt-6">
          <span className="text-[10px] text-slate-400">Sin puntos ni premios. Solo diversión.</span>
          <button type="button" onClick={continueTrivia} disabled={!selectedAnswer} className="min-h-11 px-5 rounded-xl bg-slate-950 hover:bg-emerald-700 text-white text-xs font-black disabled:opacity-40">
            {questionIndex === QUESTIONS.length - 1 ? "Ver resultado" : "Siguiente pregunta"}
          </button>
        </div>
      </div>
    </div>
  );
};
