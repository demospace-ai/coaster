import React from 'react';
import { Route, Routes } from 'react-router-dom';

export const App: React.FC = () => {
  // TODO: figure out how to prevent Redux from being used in this app
  return (
    <>
      <Routes>
        <Route path='/' element={<div>hi</div>} />
      </Routes>
    </>
  );
};