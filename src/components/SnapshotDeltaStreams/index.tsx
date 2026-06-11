import React from "react";
import styles from "./styles.module.css";

const deltas = [
  { id: "38", label: "delta", state: "past" },
  { id: "41", label: "delta", state: "past" },
  { id: "57", label: "delta", state: "next" },
  { id: "63", label: "delta", state: "next" },
  { id: "71", label: "delta", state: "next" },
];

export default function SnapshotDeltaStreams(): React.ReactNode {
  return (
    <figure className={styles.figure} aria-labelledby="snapshot-delta-streams-title">
      <figcaption className={styles.caption}>
        <span className={styles.eyebrow}>Twee stromen, een instappunt</span>
        <strong id="snapshot-delta-streams-title">
          Een snapshot zet de positie; delta's vervolgen vanaf daar
        </strong>
      </figcaption>

      <div className={styles.diagram}>
        <div className={styles.entryLine} aria-hidden="true">
          <span>instappunt</span>
          <strong>state-id 42</strong>
        </div>

        <div className={styles.laneLabel}>Snapshots</div>
        <div className={`${styles.lane} ${styles.snapshotLane}`}>
          <div className={`${styles.snapshot} ${styles.snapshotPrevious}`}>
            <span>snapshot 10</span>
            <small>ouder herstelpunt</small>
          </div>
          <div className={`${styles.snapshot} ${styles.snapshotEntry}`}>
            <span>snapshot 42</span>
            <small>volledige collectie</small>
          </div>
          <div className={`${styles.snapshot} ${styles.snapshotFuture}`}>
            <span>snapshot 84</span>
            <small>later herstelpunt</small>
          </div>
        </div>

        <div className={styles.laneLabel}>Delta's</div>
        <div className={`${styles.lane} ${styles.deltaLane}`}>
          <div className={styles.deltaTrack} aria-hidden="true" />
          {deltas.map((delta) => (
            <div className={`${styles.delta} ${styles[delta.state]}`} key={delta.id}>
              <span>{delta.label}</span>
              <strong>{delta.id}</strong>
            </div>
          ))}
        </div>

        <div className={styles.before}>
          <strong>Voor het instappunt</strong>
          <span>Al opgenomen in het snapshot; gebufferde delta's kunnen weg.</span>
        </div>
        <div className={styles.after}>
          <strong>Na het instappunt</strong>
          <span>Alleen toepassen als de keten aansluit op `prev_id = 42`.</span>
        </div>
      </div>
    </figure>
  );
}