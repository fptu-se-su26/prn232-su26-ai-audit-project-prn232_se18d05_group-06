import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DispatcherDashboard from '@features/dispatcher/pages/DispatcherDashboard';
import DriverDashboard from './features/driver/pages/DriverDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route for Dispatcher Control Room */}
        <Route path="/" element={<DispatcherDashboard />} />
        <Route path="/dispatcher" element={<DispatcherDashboard />} />
        
        {/* Route for Driver Dashboard */}
        <Route path="/driver" element={<DriverDashboard />} />
        
        {/* Catch-all redirect to Dispatcher */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

