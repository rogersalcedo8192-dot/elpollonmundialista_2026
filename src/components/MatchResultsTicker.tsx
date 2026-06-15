import React, { useMemo, useState } from "react";
import { Pause, Play } from "lucide-react";
import type { Match } from "../types";

interface MatchResultsTickerProps {
  matches: Match[];
  getTeamFlag: (teamName: string) => React.ReactNode;
}

const formatTickerDate = (date: string) => {
  const matchDate = new Date(date);
  if (Number.isNaN(matchDate.getTime())) return "";

  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit"
  }).format(matchDate);
};

export function MatchResultsTicker({ matches, getTeamFlag }: MatchResultsTickerProps) {
  const [paused, setPaused] = useState(false);
  const tickerMatches = useMemo(() => {
    const now = Date.now();
    const live = matches
      .filter((match) => match.status === "in_progress")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const finished = matches
      .filter((match) => match.status === "finished")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 12)
      .reverse();
    const upcoming = matches
      .filter((match) => match.status === "pending" && new Date(match.date).getTime() >= now - 6 * 60 * 60 * 1000)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 12);

    const selected = [...live, ...finished, ...upcoming];
    const unique = new Map(selected.map((match) => [match.id, match]));
    return Array.from(unique.values());
  }, [matches]);

  if (!tickerMatches.length) return null;

  const hasLiveMatches = tickerMatches.some((match) => match.status === "in_progress");

  const renderItems = (duplicate = false) => tickerMatches.map((match) => {
    const isFinished = match.status === "finished";
    const isLive = match.status === "in_progress";
    const hasScore = match.localScore !== null && match.visitorScore !== null;

    return (
      <article
        key={`${duplicate ? "copy" : "original"}-${match.id}`}
        className={`match-ticker-card ${isLive ? "is-live" : isFinished ? "is-finished" : "is-upcoming"}`}
        aria-hidden={duplicate || undefined}
        title={`${match.stage}: ${match.local} vs ${match.visitor}`}
      >
        <div className="match-ticker-meta">
          <span className={`match-ticker-status ${isLive ? "is-live" : isFinished ? "is-finished" : "is-upcoming"}`}>
            {isLive ? "En vivo" : isFinished ? "Final" : formatTickerDate(match.date)}
          </span>
          <span className="match-ticker-stage">{match.stage}</span>
        </div>
        <div className="match-ticker-team">
          <span className="match-ticker-flag">{getTeamFlag(match.local)}</span>
          <span className="match-ticker-name">{match.local}</span>
        </div>
        <strong className={`match-ticker-score ${isLive ? "is-live" : ""}`}>
          {hasScore ? `${match.localScore} - ${match.visitorScore}` : "vs"}
        </strong>
        <div className="match-ticker-team">
          <span className="match-ticker-flag">{getTeamFlag(match.visitor)}</span>
          <span className="match-ticker-name">{match.visitor}</span>
        </div>
      </article>
    );
  });

  const durationSeconds = Math.max(32, tickerMatches.length * 6);

  return (
    <section className={`match-ticker ${paused ? "is-paused" : ""}`} aria-label="Resultados y próximos partidos del Mundial 2026">
      <div className="match-ticker-heading">
        <span className={`match-ticker-live-dot ${hasLiveMatches ? "is-live" : ""}`} aria-hidden="true" />
        <span>{hasLiveMatches ? "En vivo" : "Mundial"}</span>
        <small>{hasLiveMatches ? "ahora" : "resultados"}</small>
        <button
          type="button"
          className="match-ticker-toggle"
          onClick={() => setPaused((current) => !current)}
          aria-label={paused ? "Reanudar ticker de partidos" : "Pausar ticker de partidos"}
          title={paused ? "Reanudar" : "Pausar"}
        >
          {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
        </button>
      </div>
      <div className="match-ticker-viewport" aria-live="off">
        <div
          className="match-ticker-track"
          style={{ "--ticker-duration": `${durationSeconds}s` } as React.CSSProperties}
        >
          <div className="match-ticker-group">{renderItems()}</div>
          <div className="match-ticker-group" aria-hidden="true">{renderItems(true)}</div>
        </div>
      </div>
    </section>
  );
}
