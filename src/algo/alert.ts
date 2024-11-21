import { GroupResult, hasSameProj } from "./assign.ts";
import { EmployeeInfo } from "../types.ts";

export type Alert = {
  level: 'info' | 'warning' | 'error';
  message: string;
};

// 優先度を定義
const priority: Record<Alert['level'], number> = {
  error: 1,
  warning: 2,
  info: 3,
};

export type AlertResult = {
  round: number;
  alerts: Alert[];
}[];

const groupStr = (groupNumber: number) => `[グループ ${groupNumber}]`;

const calcSameSectionProjAlert = (groupResult: GroupResult, round: number): Alert[] => {
  const roundResult = groupResult.find((r) => r.round === round);
  if (!roundResult) return [];

  const alerts: Alert[] = [];
  for (const group of roundResult.groups) {
    const num = group.members.length;
    for (let i = 0; i < num; i++) {
      for (let j = i + 1; j < num; j++) {
        const member1 = group.members[i];
        const member2 = group.members[j];
        const sameSection = member1.section === member2.section;
        const sameProj = hasSameProj(member1, member2);
        if (sameSection && sameProj) {
          alerts.push({
            level: 'error',
            message: `${groupStr(group.groupNumber)} ${member1.name} と ${member2.name} は同じ部署で同じプロジェクトに所属しています`,
          });
        } else if (sameSection) {
          alerts.push({
            level: 'info',
            message: `${groupStr(group.groupNumber)} ${member1.name} と ${member2.name} は同じ部署に所属しています`,
          });
        } else if (sameProj) {
          alerts.push({
            level: 'warning',
            message: `${groupStr(group.groupNumber)} ${member1.name} と ${member2.name} は同じプロジェクトに所属しています`,
          });
        }
      }
    }
  }
  return alerts;
};

const calcGroupStayNumOverAlert = (groupResult: GroupResult, round: number): Alert[] => {
  const roundResult = groupResult.find((r) => r.round === round);
  if (round < 2 || !roundResult) return [];
  const prevRoundResult = groupResult.find((r) => r.round === round - 1);
  if (!prevRoundResult) return [];

  const alerts: Alert[] = [];
  for (const group of roundResult.groups) {
    const prevGroup = prevRoundResult.groups.find((g) => g.groupNumber === group.groupNumber);
    if (!prevGroup) continue;

    const stayMember: EmployeeInfo[] = [];
    for (const member of group.members) {
      if (prevGroup.members.some((m) => m.name === member.name)) {
        stayMember.push(member);
      }
    }
    if (stayMember.length === 0) {
      alerts.push({
        level: 'error',
        message: `${groupStr(group.groupNumber)} 前回のラウンドから留まるメンバーがいません`,
      });
    } else if (stayMember.length > 1) {
      alerts.push({
        level: 'error',
        message: `${groupStr(group.groupNumber)} 前回のラウンドから複数のメンバー(${stayMember.map((m) => m.name).join(', ')})が留まっています`,
      });
    }
  }
  return alerts;
};

const calcMemberStayNumOverAlert = (groupResult: GroupResult, round: number): Alert[] => {
  if (round < 3) return [];

  const stayMember = new Set<string>();
  const alerts: Alert[] = [];
  for (let r = 1; r < round; r++) {
    const roundResult = groupResult.find((res) => res.round === r);
    const nextRoundResult = groupResult.find((res) => res.round === r + 1);
    if (!roundResult || !nextRoundResult) continue;
    for (const group of roundResult.groups) {
      const nextGroup = nextRoundResult.groups.find((g) => g.groupNumber === group.groupNumber);
      if (!nextGroup) continue;
      for (const member of group.members) {
        if (nextGroup.members.some((m) => m.name === member.name)) {
          if (r < round - 1) {
            stayMember.add(member.name);
          } else if (stayMember.has(member.name)) {
            alerts.push({
              level: 'error',
              message: `${groupStr(group.groupNumber)} ${member.name} は複数回同じグループに留まっています`,
            });
          }
        }
      }
    }
  }
  return alerts;
};

const calcSameGroupMemberAlert = (groupResult: GroupResult, round: number): Alert[] => {
  if (round < 2) return [];

  const sameGroupPair = new Set<string>();
  const alerts: Alert[] = [];
  for (let r = 1; r <= round; r++) {
    const roundResult = groupResult.find((res) => res.round === r);
    if (!roundResult) continue;
    for (const group of roundResult.groups) {
      const num = group.members.length;
      for (let i = 0; i < num; i++) {
        for (let j = i + 1; j < num; j++) {
          const member0 = group.members[i];
          const member1 = group.members[j];
          if (member0.name === member1.name) continue;
          const pair = [member0.name, member1.name].sort().join(',');
          if (r < round) {
            sameGroupPair.add(pair);
          } else if (sameGroupPair.has(pair)) {
            alerts.push({
              level: 'warning',
              message: `${groupStr(group.groupNumber)} ${member0.name} と ${member1.name} は複数回同じグループに所属しています`,
            });
          }
        }
      }
    }
  }
  return alerts;
};

export const collectAlerts = (groupResult: GroupResult): AlertResult => {
  const alerts: AlertResult = [];
  for (let round = 1; round <= groupResult.length; round++) {
    alerts.push({
      round,
      alerts: [
        ...calcSameSectionProjAlert(groupResult, round),
        ...calcGroupStayNumOverAlert(groupResult, round),
        ...calcMemberStayNumOverAlert(groupResult, round),
        ...calcSameGroupMemberAlert(groupResult, round),
      ].sort((a, b) => priority[a.level] - priority[b.level]),
    });
  }
  return alerts;
};