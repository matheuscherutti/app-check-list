import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './stores/useUserStore';
import Login from './pages/Login';
import Board from './pages/BoardMockup';
import Settings from './pages/Settings';
import Audit from './pages/Audit';
import Layout from './components/layout/Layout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/board" replace />} />
          <Route path="/board" element={<Board />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/audit" element={<Audit />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
