import React, { useMemo } from "react";
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

    const selected = [...finished, ...live, ...upcoming];
    const unique = new Map(selected.map((match) => [match.id, match]));
    return Array.from(unique.values());
  }, [matches]);

  if (!tickerMatches.length) return null;

  const renderItems = (duplicate = false) => tickerMatches.map((match) => {
    const isFinished = match.status === "finished";
    const isLive = match.status === "in_progress";
    const hasScore = match.localScore !== null && match.visitorScore !== null;

    return (
      <article
        key={`${duplicate ? "copy" : "original"}-${match.id}`}
        className="match-ticker-card"
        aria-hidden={duplicate || undefined}
      >
        <span className={`match-ticker-status ${isLive ? "is-live" : isFinished ? "is-finished" : "is-upcoming"}`}>
          {isLive ? "En curso" : isFinished ? "Final" : formatTickerDate(match.date)}
        </span>
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
    <section className="match-ticker" aria-label="Resultados y próximos partidos del Mundial 2026">
      <div className="match-ticker-heading">
        <span className="match-ticker-live-dot" aria-hidden="true" />
        <span>Resultados</span>
        <small>y próximos</small>
      </div>
      <div className="match-ticker-viewport">
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
