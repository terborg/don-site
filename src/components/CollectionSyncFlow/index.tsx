import React from "react";
import styles from "./styles.module.css";

type FlowStep = {
  title: string;
  detail: string;
  tone?: "source" | "consumer" | "state";
};

type ExceptionFlow = {
  trigger: string;
  action: string;
  outcome: string;
};

const mainFlow: FlowStep[] = [
  {
    title: "Collectie bij de bron",
    detail: "De provider publiceert een consistente toestand.",
    tone: "source",
  },
  {
    title: "Snapshot",
    detail: "De consumer kiest een instappunt en laadt chunks.",
  },
  {
    title: "Delta's",
    detail: "Elke wijziging sluit aan op de vorige state-id.",
  },
  {
    title: "Mirror",
    detail: "De lokale kopie blijft actueel via dezelfde cursor.",
    tone: "consumer",
  },
];

const exceptionFlows: ExceptionFlow[] = [
  {
    trigger: "Geen cursor",
    action: "Zoek snapshot",
    outcome: "Buffer delta's, pas nog niets toe",
  },
  {
    trigger: "Snapshot in opbouw",
    action: "Blijf luisteren",
    outcome: "Filter buffer na snapshot",
  },
  {
    trigger: "Cursor verlopen",
    action: "Stop met volgen",
    outcome: "Herstel vanaf nieuw snapshot",
  },
  {
    trigger: "Hiaat in delta-keten",
    action: "Verwerp incomplete route",
    outcome: "Mirror opnieuw opbouwen",
  },
  {
    trigger: "Snapshot-chunk 410 Gone",
    action: "Annuleer staging-area",
    outcome: "Kies beschikbaar snapshot",
  },
];

export default function CollectionSyncFlow(): React.ReactNode {
  return (
    <figure className={styles.figure} aria-labelledby="collection-sync-flow-title">
      <figcaption className={styles.caption}>
        <span className={styles.eyebrow}>Waar dit patroon werkt</span>
        <strong id="collection-sync-flow-title">
          One-way synchronisatie van een dynamische collectie
        </strong>
      </figcaption>

      <div className={styles.flow} aria-label="Hoofdroute van snapshot naar delta's en mirror">
        {mainFlow.map((step, index) => (
          <div className={styles.stepWrap} key={step.title}>
            <div className={`${styles.step} ${step.tone ? styles[step.tone] : ""}`}>
              <span className={styles.stepNumber}>{index + 1}</span>
              <span className={styles.stepTitle}>{step.title}</span>
              <span className={styles.stepDetail}>{step.detail}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.cursorRail} aria-hidden="true">
        <span>state-id / cursor</span>
      </div>

      <div className={styles.exceptions} aria-label="Uitzonderingsroutes">
        {exceptionFlows.map((flow) => (
          <div className={styles.exception} key={flow.trigger}>
            <span className={styles.exceptionTrigger}>{flow.trigger}</span>
            <span className={styles.exceptionArrow} aria-hidden="true">
              -&gt;
            </span>
            <span className={styles.exceptionAction}>{flow.action}</span>
            <span className={styles.exceptionOutcome}>{flow.outcome}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}