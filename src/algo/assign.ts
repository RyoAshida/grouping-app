import { EmployeeInfo } from '../types';
import React from "react";
import seedrandom from 'seedrandom';

export type GroupResult = {
  round: number;
  groups: { groupNumber: number; members: EmployeeInfo[] }[];
  absence: EmployeeInfo[];
}[];

const coeffSameSectionProj = 1;
const coeffVarianceDate = -0.05;
const coeffGroupStayNum = 500;
const coeffStayCount = 500;
const coeffSameGroup = 10;

export const hasSameProj = (a: EmployeeInfo, b: EmployeeInfo): boolean => {
  return a.proj.some((proj) => b.proj.includes(proj));
};

const inGroup = (group: number[], v: number): boolean => {
  return group.includes(v);
};

const calcSameSectionProjPenalty = (group: number[], isSameSection: boolean[][], isSameProj: boolean[][]): number => {
  let sameBoth = 0, sameSection = 0, sameProj = 0;
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      if (isSameSection[group[i]][group[j]] && isSameProj[group[i]][group[j]]) {
        sameBoth++;
      } else if (isSameSection[group[i]][group[j]]) {
        sameSection++;
      } else if (isSameProj[group[i]][group[j]]) {
        sameProj++;
      }
    }
  }
  const e = 2;
  return Math.pow(sameBoth, e) * 30 + Math.pow(sameProj, e) * 3 + Math.pow(sameSection, e);
};

const calcVarianceDatePenalty = (group: number[], dates: number[]): number => {
  let sum = 0.0, sum2 = 0.0;
  for (let i = 0; i < group.length; i++) {
    sum += dates[group[i]];
    sum2 += dates[group[i]] * dates[group[i]];
  }
  const ave = sum / group.length;
  return Math.sqrt(sum2 / group.length - ave * ave);
};

const calcGroupStayNumPenalty = (group0: number[], group1: number[]): number => {
  let stayNum = 0;
  for (let i = 0; i < group0.length; i++) {
    if (inGroup(group1, group0[i])) {
      stayNum++;
    }
  }
  return stayNum === 1 ? 0 : (stayNum === 0 ? 1 : stayNum - 1);
};

const calcStayCountPenalty = (group: number[], stayCount: number[]): number => {
  let sum = 0;
  for (const i of group) {
    sum += (stayCount[i] > 1 ? stayCount[i] : 0);
  }
  return sum;
};

const calcSameGroupPenalty = (group: number[], sameGroupCount: number[][]): number => {
  let sum = 0;
  for (const i of group) {
    for (let j = 0; j < sameGroupCount[i].length; j++) {
      if (i !== j && sameGroupCount[i][j] > 1) {
        sum += sameGroupCount[i][j];
      }
    }
  }
  return sum;
};

const calcPenalty = (
  round: number,
  group: number,
  assign: number[][][],
  isSameSection: boolean[][],
  isSameProj: boolean[][],
  dates: number[],
  stayCount: number[],
  sameGroupCount: number[][]
): number => {
  const sameSectionProjPenalty = calcSameSectionProjPenalty(assign[round][group], isSameSection, isSameProj);
  const varianceDatePenalty = calcVarianceDatePenalty(assign[round][group], dates);
  const groupStayNumPenalty =
    (round > 0 ? calcGroupStayNumPenalty(assign[round - 1][group], assign[round][group]) : 0) +
    (round < assign.length - 1 ? calcGroupStayNumPenalty(assign[round][group], assign[round + 1][group]) : 0);
  const stayCountPenalty = calcStayCountPenalty(assign[round][group], stayCount);
  const sameGroupPenalty = calcSameGroupPenalty(assign[round][group], sameGroupCount);

  return sameSectionProjPenalty * coeffSameSectionProj +
    varianceDatePenalty * coeffVarianceDate +
    groupStayNumPenalty * coeffGroupStayNum +
    stayCountPenalty * coeffStayCount +
    sameGroupPenalty * coeffSameGroup;
};

const calcAllPenalty = (
  assign: number[][][],
  isSameSection: boolean[][],
  isSameProj: boolean[][],
  dates: number[],
  stayCount: number[],
  sameGroupCount: number[][]
): number => {
  let sum = 0;
  for (let round = 0; round < assign.length; round++) {
    for (let group = 0; group < assign[round].length; group++) {
      sum += calcPenalty(round, group, assign, isSameSection, isSameProj, dates, stayCount, sameGroupCount);
    }
  }
  return sum;
};

const addSameGroupCount = (round: number, group: number, assign: number[][][], sameGroupCount: number[][]): void => {
  const len = assign[round][group].length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      sameGroupCount[assign[round][group][i]][assign[round][group][j]]++;
      sameGroupCount[assign[round][group][j]][assign[round][group][i]]++;
    }
  }
};

const subtractSameGroupCount = (round: number, group: number, assign: number[][][], sameGroupCount: number[][]): void => {
  const len = assign[round][group].length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      sameGroupCount[assign[round][group][i]][assign[round][group][j]]--;
      sameGroupCount[assign[round][group][j]][assign[round][group][i]]--;
    }
  }
};

const swapMembers = (
  round: number,
  group0: number,
  index0: number,
  group1: number,
  index1: number,
  assign: number[][][],
  stayCount: number[],
  sameGroupCount: number[][]
): void => {
  const member0 = assign[round][group0][index0];
  const member1 = assign[round][group1][index1];
  let stayCountCurr0 = 0, stayCountCurr1 = 0;
  let stayCountNext0 = 0, stayCountNext1 = 0;
  if (round > 0) {
    if (inGroup(assign[round - 1][group0], member0)) stayCountCurr0++;
    if (inGroup(assign[round - 1][group1], member1)) stayCountCurr1++;
    if (inGroup(assign[round - 1][group0], member1)) stayCountNext1++;
    if (inGroup(assign[round - 1][group1], member0)) stayCountNext0++;
  }
  if (round < assign.length - 1) {
    if (inGroup(assign[round + 1][group0], member0)) stayCountCurr0++;
    if (inGroup(assign[round + 1][group1], member1)) stayCountCurr1++;
    if (inGroup(assign[round + 1][group0], member1)) stayCountNext1++;
    if (inGroup(assign[round + 1][group1], member0)) stayCountNext0++;
  }
  subtractSameGroupCount(round, group0, assign, sameGroupCount);
  subtractSameGroupCount(round, group1, assign, sameGroupCount);
  assign[round][group0][index0] = member1;
  assign[round][group1][index1] = member0;
  stayCount[member0] += stayCountNext0 - stayCountCurr0;
  stayCount[member1] += stayCountNext1 - stayCountCurr1;
  addSameGroupCount(round, group0, assign, sameGroupCount);
  addSameGroupCount(round, group1, assign, sameGroupCount);
};

const calcDiff = (
  round: number,
  group0: number,
  index0: number,
  group1: number,
  index1: number,
  assign: number[][][],
  isSameSection: boolean[][],
  isSameProj: boolean[][],
  dates: number[],
  stayCount: number[],
  sameGroupCount: number[][]
): number => {
  const penalty0Curr = calcPenalty(round, group0, assign, isSameSection, isSameProj, dates, stayCount, sameGroupCount);
  const penalty1Curr = calcPenalty(round, group1, assign, isSameSection, isSameProj, dates, stayCount, sameGroupCount);
  swapMembers(round, group0, index0, group1, index1, assign, stayCount, sameGroupCount);
  const penalty0Next = calcPenalty(round, group0, assign, isSameSection, isSameProj, dates, stayCount, sameGroupCount);
  const penalty1Next = calcPenalty(round, group1, assign, isSameSection, isSameProj, dates, stayCount, sameGroupCount);
  swapMembers(round, group0, index0, group1, index1, assign, stayCount, sameGroupCount);
  return penalty0Next + penalty1Next - penalty0Curr - penalty1Curr;
};

const init =(
  employeeData: EmployeeInfo[],
  groupCount: number,
  roundCount: number
) : {
  assign: number[][][],
  isSameSection: boolean[][],
  isSameProj: boolean[][],
  dates: number[],
  stayCount: number[],
  sameGroupCount: number[][],
  absences: number[][],
} => {
  const isSameSection: boolean[][] = Array.from({ length: employeeData.length }, (_, i) =>
    Array.from({ length: employeeData.length }, (_, j) => employeeData[i].section === employeeData[j].section)
  );
  const isSameProj: boolean[][] = Array.from({ length: employeeData.length }, (_, i) =>
    Array.from({ length: employeeData.length }, (_, j) => hasSameProj(employeeData[i], employeeData[j]))
  );

  const attend: boolean[][] = Array.from({ length: employeeData.length }, () =>
    Array.from({ length: roundCount }, () => true)
  );
  for (let i = 0; i < employeeData.length; i++) {
    for (const r of employeeData[i].absence) {
      attend[i][r - 1] = false;
    }
  }

  const assign: number[][][] = Array.from({ length: roundCount }, () => []);
  const absences: number[][] = Array.from({ length: roundCount }, () => []);
  for (let i = 0; i < roundCount; i++) {
    const perm: number[] = [];
    for (let j = 0; j < employeeData.length; j++) {
      if (attend[j][i]) perm.push(j);
      else absences[i].push(j);
    }

    const n = perm.length;
    // Shuffle perm
    for (let j = 0; j < n; j++) {
      const k = j + Math.floor(rng() * (n - j));
      [perm[j], perm[k]] = [perm[k], perm[j]];
    }

    assign[i] = Array.from({ length: groupCount }, () => []);
    for (let j = 0; j < n; j++) {
      assign[i][j % groupCount].push(perm[j]);
    }
  }

  const parseDate = (dateStr: string): number => {
    const date = new Date(dateStr);
    const baseDate = new Date('2021-07-01');
    return Math.floor(
      (date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  const dates: number[] = employeeData.map((employee) => parseDate(employee.date));

  const stayCount: number[] = Array.from({ length: employeeData.length }, () => 0);
  for (let i = 0; i < employeeData.length; i++) {
    for (let j = 0; j < roundCount - 1; j++) {
      for (let k = 0; k < groupCount; k++) {
        if (inGroup(assign[j][k], i) && inGroup(assign[j + 1][k], i)) {
          stayCount[i]++;
        }
      }
    }
  }

  const sameGroupCount: number[][] = Array.from({ length: employeeData.length }, () =>
    Array.from({ length: employeeData.length }, () => 0)
  );
  for (let i = 0; i < roundCount; i++) {
    for (let j = 0; j < groupCount; j++) {
      addSameGroupCount(i, j, assign, sameGroupCount);
    }
  }

  return { assign, isSameSection, isSameProj, dates, stayCount, sameGroupCount, absences };
};

const rng = seedrandom('aa');
const rand = (n: number): number => {
  return Math.floor(rng() * n);
};

const getTargets = (
  roundCount: number,
  groupCount: number,
  assign: number[][][],
  isSameSection: boolean[][],
  isSameProj: boolean[][],
): {
  round: number;
  group0: number;
  group1: number;
  index0: number;
  index1: number;
} => {
  const getSameSectionProjPair = (
    round: number,
    group: number,
    assign: number[][][],
    isSameSection: boolean[][],
    isSameProj: boolean[][]
  ): number | null => {
    for (let i = 0; i < assign[round][group].length; i++) {
      for (let j = i + 1; j < assign[round][group].length; j++) {
        const member0 = assign[round][group][i];
        const member1 = assign[round][group][j];
        if (isSameSection[member0][member1] && isSameProj[member0][member1]) {
          return rand(2) === 0 ? i : j;
        }
      }
    }
    return null;
  }

  const round = rand(roundCount);
  const group0 = rand(groupCount);
  let group1 = rand(groupCount);
  while (group0 === group1) {
    group1 = rand(groupCount);
  }
  const index0 = getSameSectionProjPair(round, group0, assign, isSameSection, isSameProj) ?? rand(assign[round][group0].length);
  //const index0 = rand(assign[round][group0].length);
  const index1 = rand(assign[round][group1].length);
  return { round, group0, group1, index0, index1 };
}

export const assign = async (
  employeeData: EmployeeInfo[],
  groupCount: number,
  roundCount: number,
  setOptProgress: React.Dispatch<React.SetStateAction<number>>,
  setOptScore: React.Dispatch<React.SetStateAction<number>>
): Promise<GroupResult> => {
  const { assign, isSameSection, isSameProj, dates, stayCount, sameGroupCount, absences } = init(employeeData, groupCount, roundCount);

  let iter = 1;
  let move = 0;
  const initT = 100;
  const K = -15.0;
  const endT = 1;
  let T = initT;
  const MAX_ITER = 3000000;
  const INFO_UPDATE_INTERVAL = MAX_ITER / 200;
  for (; iter < MAX_ITER; iter++) {
    const { round, group0, group1, index0, index1 } = getTargets(roundCount, groupCount, assign, isSameSection, isSameProj);

    const diff = calcDiff(round, group0, index0, group1, index1, assign, isSameSection, isSameProj, dates, stayCount, sameGroupCount);
    if (diff <= 0 || rng() < Math.exp(-diff / T)) {
      swapMembers(round, group0, index0, group1, index1, assign, stayCount, sameGroupCount);
      move++;
    }

    if (iter % 1000 === 0) {
      const progress = iter / MAX_ITER;
      T = Math.pow(initT - K, 1 - progress) * Math.pow(endT - K, progress) + K;
      //T = initT - (initT - endT) * progress;
    }
    if (iter % INFO_UPDATE_INTERVAL === 0) {
      setOptProgress(iter / MAX_ITER);
      setOptScore(calcAllPenalty(assign, isSameSection, isSameProj, dates, stayCount, sameGroupCount));
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  const result: GroupResult = [];
  for (let i = 0; i < roundCount; i++) {
    const groups = Array.from({ length: groupCount }, (_, j) => ({
      groupNumber: j + 1,
      members: assign[i][j].map((index) => employeeData[index]),
    }));
    const absence = absences[i].map((index) => employeeData[index]);
    result.push({ round: i + 1, groups, absence });
  }
  return result;
};
