
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ContributeExample from './pages/ContributeExample';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route path="/" element={<ContributeExample />} />
          <Route path="/contribute-example" element={<ContributeExample />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
