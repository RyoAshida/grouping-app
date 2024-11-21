import React, { useState } from "react";
import { ChevronDown20Regular, ChevronUp20Regular } from "@fluentui/react-icons";
import styles from "./index.module.css";

interface Alert {
  level: string;
  message: string;
}

interface AlertProps {
  alerts: Alert[];
}

const AlertDisplay: React.FC<AlertProps> = ({ alerts }) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  return (
    <div className={styles.alertDisplayContainer}>
      {/* ステータスバー */}
      <div
        className={styles.alertStatusBar}
        onClick={() => setIsAlertOpen((prev) => !prev)}
      >
        <div className={styles.alertStatusText}>
          <span>{alerts.length} 件のアラートがあります</span>
          {isAlertOpen ? <ChevronDown20Regular /> : <ChevronUp20Regular />}
        </div>
      </div>

      {/* アラート詳細 */}
      {isAlertOpen && (
        <div className={styles.alertDetails}>
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`${styles.alertItem} ${styles[`alertLevel-${alert.level.toLowerCase()}`]}`}
            >
              <span className={styles.alertLevel}>{alert.level}:</span>
              <span className={styles.alertMessage}>{alert.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertDisplay;
