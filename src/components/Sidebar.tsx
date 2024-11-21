import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Stack, Text, Nav } from '@fluentui/react';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Stack
      styles={{
        root: {
          width: 250,
          padding: '10px',
          boxShadow: '0 0 5px rgba(0,0,0,0.2)',
        },
      }}
    >
      <Text variant="large" styles={{ root: { marginBottom: '20px' } }}>
        Grouping App
      </Text>
      <Nav
        selectedKey={location.pathname} // 現在のパスに基づく選択状態
        groups={[
          {
            links: [
              {
                name: 'Home',
                key: '/',
                url: '#', // ダミーURL
                icon: 'Home',
                onClick: () => navigate('/'),
              },
              {
                name: 'Result',
                key: '/result',
                url: '#', // ダミーURL
                icon: 'Page',
                onClick: () => navigate('/result'),
              },
            ],
          },
        ]}
      />
    </Stack>
  );
};
