import React, { useState } from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { DetailsList, IColumn } from '@fluentui/react/lib/DetailsList';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import Encoding from 'encoding-japanese';
import { EmployeeInfo } from '../../types.ts';
import GroupModal from './GroupModal';
import { GroupResult } from '../../algo/assign.ts';

interface HomeProps {
  employeeData: EmployeeInfo[];
  setEmployeeData: React.Dispatch<React.SetStateAction<EmployeeInfo[]>>;
  setGroupResult: React.Dispatch<React.SetStateAction<GroupResult>>;
}

const Home: React.FC<HomeProps> = (
  {
    employeeData,
    setEmployeeData,
    setGroupResult,
  }
) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = new Uint8Array(e.target?.result as ArrayBuffer);
      const text = Encoding.convert(result, {
        to: 'UNICODE',
        from: 'AUTO',
        type: 'string',
      });

      const rows = text
        .split('\n')
        .map((row) => row.trim())
        .filter((row) => row.length > 0)
        .map((row) => row.split(',').map((cell) => cell.trim()));

      const parsedData = rows.slice(1).map((row) => ({
        name: row[0],
        section: row[1],
        date: row[2],
        proj: row[3] ? row[3].split(' ') : [],
        absence: row[4] ? row[4].split(' ').map(Number) : [],
      })) as EmployeeInfo[];

      setEmployeeData(parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const columns: IColumn[] = [
    { key: 'name', name: 'Name', fieldName: 'name', minWidth: 100, maxWidth: 200, isResizable: true },
    { key: 'section', name: 'Section', fieldName: 'section', minWidth: 100, maxWidth: 150, isResizable: true },
    { key: 'date', name: 'Date', fieldName: 'date', minWidth: 100, maxWidth: 150, isResizable: true },
    {
      key: 'proj',
      name: 'Projects',
      fieldName: 'proj',
      minWidth: 150,
      maxWidth: 300,
      isResizable: true,
      onRender: (item: EmployeeInfo) => <span>{item.proj.join(', ')}</span>,
    },
    {
      key: 'absence',
      name: 'Absence',
      fieldName: 'absence',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      onRender: (item: EmployeeInfo) => <span>{item.absence.join(', ')}</span>,
    },
  ];

  return (
    <Stack tokens={{ childrenGap: 20 }} styles={{ root: { padding: '20px', width: '100%' } }}>
      <Text variant="large">CSV File Upload</Text>
      <Stack horizontal tokens={{ childrenGap: 10 }} verticalAlign="center">
        <input type="file" accept=".csv" onChange={handleFileUpload} />
        <PrimaryButton text="グループ分け" onClick={() => setIsModalOpen(true)} />
      </Stack>

      {employeeData.length > 0 && (
        <DetailsList
          items={employeeData}
          columns={columns}
          selectionMode={0}
          styles={{
            root: { marginTop: 20, width: '100%' },
          }}
        />
      )}

      <GroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeData={employeeData}
        setGroupResult={setGroupResult}
      />
    </Stack>
  );
};

export default Home;
