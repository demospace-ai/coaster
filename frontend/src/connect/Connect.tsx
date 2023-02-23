import React from 'react';
import { Route, Routes } from 'react-router-dom';

export const Connect: React.FC = () => {
  return (
    <>
      <Routes>
        <Route path='/' element={<div>hi</div>} />
      </Routes>
    </>
  );
};