import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home';
import Result from './components/result';
import { Sidebar } from './components/Sidebar.tsx';
import { Stack } from '@fluentui/react';
import { EmployeeInfo } from "./types.ts";
import { GroupResult } from "./algo/assign.ts";

const App: React.FC = () => {
  const [employeeData, setEmployeeData] = useState<EmployeeInfo[]>([]);
  const [groupResult, setGroupResult] = useState<GroupResult>([]);

  return (
    <Router>
      <Stack horizontal styles={{ root: { height: '100vh' } }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <Stack grow styles={{ root: { paddingBottom: 0, overflow: 'auto' } }}>
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  employeeData={employeeData}
                  setEmployeeData={setEmployeeData}
                  setGroupResult={setGroupResult}
                />}
            />
            <Route
              path="/result"
              element={
                <Result groupResult={groupResult}/>
              }
            />
          </Routes>
        </Stack>
      </Stack>
    </Router>
  );
};

export default App;
