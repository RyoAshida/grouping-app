import React from 'react';
import { Stack, Text } from '@fluentui/react';
import { EmployeeInfo } from '../../../types.ts'; // EmployeeInfo型をインポート
import MemberCard from './MemberCard'; // MemberCardコンポーネントをインポート

interface GroupDisplayProps {
  groups: { groupNumber: number; members: EmployeeInfo[] }[];
  absence: EmployeeInfo[];
}

const Group = ({ groupNumber, members }: { groupNumber: number; members: EmployeeInfo[] }) => {
  return (
    <Stack
      styles={{
        root: {
          padding: '10px',
          paddingTop: '3px',
          paddingBottom: '3px',
          margin: '3px 0',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
        },
      }}
    >
      {groupNumber > 0 ?
        <Text variant="medium">グループ {groupNumber}</Text> :
        <Text variant="medium">欠席者</Text>
      }
      <Stack
        horizontal
        wrap
        tokens={{ childrenGap: 10, padding: 3 }}
        styles={{ root: { alignItems: 'center' } }}
      >
        {members.map((member, index) => (
          <MemberCard key={index} member={member} />
        ))}
      </Stack>
    </Stack>
  );
};

const GroupDisplay: React.FC<GroupDisplayProps> = ({ groups, absence }) => {
  return (
    <Stack tokens={{ childrenGap: 4 }}>
      {groups.map((group, index) => (
        <Group key={index} groupNumber={group.groupNumber} members={group.members} />
      ))}
      {absence.length > 0 && (
        <Group key={-1} groupNumber={-1} members={absence} />
      )}
    </Stack>
  );
}

export default GroupDisplay;
