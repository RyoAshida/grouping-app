import React, { useState } from "react";
import { Text, Pivot, PivotItem } from "@fluentui/react";
import { GroupResult } from "../../algo/assign";
import { collectAlerts } from "../../algo/alert.ts";
import GroupDisplay from "./GroupDisplay";
import AlertDisplay from "./Alert";

interface ResultPageProps {
  groupResult: GroupResult;
}

const Result: React.FC<ResultPageProps> = ({ groupResult }) => {
  const alertResult = collectAlerts(groupResult);
  const [currentRound, setCurrentRound] = useState(1); // 初期ラウンドを 1 に設定

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh", // 全画面高さ
        margin: 0, // 隙間をなくす
        padding: 0,
        overflow: "hidden",
      }}
    >
      {groupResult.length === 0 ? (
        <div style={{padding: '20px'}}>
          <Text variant="large">グループ分けの結果がありません</Text>
        </div>
      ) : (
        <>
          {/* Pivot 部分（固定） */}
          <div style={{ padding: '20px', paddingBottom: 0 }}>
            <Pivot
              onLinkClick={(item) =>
                setCurrentRound(Number(item?.props.itemKey) || 1)
              }
            >
              {Array.from({ length: groupResult.length }, (_, i) => i + 1).map(
                (round) => (
                  <PivotItem
                    headerText={`ラウンド ${round}`}
                    itemKey={String(round)}
                    key={round}
                  />
                )
              )}
            </Pivot>
          </div>

          {/* コンテンツ部分（スクロール可能） */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              paddingTop: "5px",
            }}
          >
            <GroupDisplay
              groups={groupResult[currentRound - 1].groups}
              absence={groupResult[currentRound - 1].absence}
            />
          </div>

          {/* アラート部分（固定、スクロール制限） */}
          <div
            style={{
              flexShrink: 0,
              borderTop: "1px solid #ccc",
              boxShadow: "0px -2px 5px rgba(0, 0, 0, 0.1)",
              maxHeight: "200px", // 高さの制限
              overflowY: "auto", // 制限を超えた場合にスクロール
              margin: 0, // 余白を完全に排除
            }}
          >
            <AlertDisplay alerts={alertResult[currentRound - 1].alerts} />
          </div>
        </>
      )}
    </div>
  );
};

export default Result;
