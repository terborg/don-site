import React from "react";
import styles from "./styles.module.css";

const deltas = [
  { id: "17", label: "delta", state: "past", slot: "slot1" },
  { id: "38", label: "delta", state: "past", slot: "slot2" },
  { id: "41", label: "delta", state: "past", slot: "slot3" },
  { id: "57", label: "delta", state: "next", slot: "slot5" },
  { id: "63", label: "delta", state: "next", slot: "slot6" },
  { id: "71", label: "delta", state: "next", slot: "slot7" },
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
        <div className={styles.streamGrid}>
          <div className={styles.labelStack} aria-hidden="true">
            <div className={styles.laneLabel}>Snapshots</div>
            <div className={styles.laneLabel}>Delta's</div>
          </div>

          <div className={styles.lanes}>
            <div className={styles.mobileLaneLabel}>Snapshots</div>
            <div className={`${styles.lane} ${styles.snapshotLane}`}>
              <div className={`${styles.snapshot} ${styles.snapshotPrevious}`}>
                <span>snapshot 10</span>
                <small>eerder herstelpunt</small>
              </div>
              <div className={`${styles.snapshot} ${styles.snapshotEntry}`}>
                <span>snapshot 42</span>
                <small>actueel herstelpunt</small>
              </div>
              <div className={`${styles.snapshot} ${styles.snapshotFuture}`}>
                <span>snapshot 84</span>
                <small>volgend herstelpunt</small>
              </div>
            </div>

            <div className={styles.entryLine} aria-hidden="true" />

            <div className={styles.mobileLaneLabel}>Delta's</div>
            <div className={`${styles.lane} ${styles.deltaLane}`}>
              <div className={styles.deltaTrack} aria-hidden="true" />
              {deltas.map((delta) => (
                <div
                  className={`${styles.delta} ${styles[delta.state]} ${styles[delta.slot]}`}
                  key={delta.id}
                >
                  <span>{delta.label}</span>
                  <strong>{delta.id}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.notes}>
          <div className={styles.before}>
            <strong>Voor het instappunt</strong>
            <span>Al opgenomen in het snapshot; gebufferde delta's kunnen weg.</span>
          </div>
          <div className={styles.after}>
            <strong>Na het instappunt</strong>
            <span>Delta's toepassen. Consistent in sync als ze aansluiten op de vorige snapshot of delta.</span>
          </div>
        </div>
      </div>
    </figure>
  );
}