import React from 'react';
import { Stack, Text } from '@fluentui/react';
import './index.module.css';

export type EmployeeInfo = {
  name: string;
  section: string;
  date: string;
  proj: string[];
  absence: number[];
};

export type MemberCardProps = {
  member: EmployeeInfo;
};

const getSectionColor = (section: string) => {
  const sectionMap: { [key: string]: string } = {
    役員: "#f3e5f5",
    アルゴリズム: '#e8f5e9',
    プロダクト: '#e3f2fd',
    ビジネス: '#fff3e0',
    コーポレート: '#fffde7',
  };
  return sectionMap[section] || 'default';
};

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const sectionColor = getSectionColor(member.section);

  //<Stack className={sectionClass}>
  return (
    <Stack style={{
      padding: "5px",
      border: "1px solid #ccc",
      borderRadius: "5px",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      backgroundColor: sectionColor,
      minWidth: "100px",
      minHeight: "30px",
      textAlign: "center",
    }}>
      <Text variant="small">{member.name}</Text>
      {/*<Text variant="xSmall">{member.date}</Text>*/}
    </Stack>
  );
};

export default MemberCard;
