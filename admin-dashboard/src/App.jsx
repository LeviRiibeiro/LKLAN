import { Route, Routes } from "react-router-dom";

import AgentUpdate from "./pages/AgentUpdate";
import BlockedContent from "./pages/BlockedContent";
import Backups from "./pages/Backups";
import Dashboard from "./pages/Dashboard";
import ImportUsers from "./pages/ImportUsers";
import LabConfig from "./pages/LabConfig";
import Logs from "./pages/Logs";
import MachineDetail from "./pages/MachineDetail";
import TimeManagement from "./pages/TimeManagement";
import TurmaManagement from "./pages/TurmaManagement";
import Users from "./pages/Users";
import Layout from "./components/Layout";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/machines/:id" element={<MachineDetail />} />
        <Route path="/blocked-content" element={<BlockedContent />} />
        <Route path="/lab-config" element={<LabConfig />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="/backups" element={<Backups />} />
        <Route path="/import" element={<ImportUsers />} />
        <Route path="/time-management" element={<TimeManagement />} />
        <Route path="/turmas" element={<TurmaManagement />} />
        <Route path="/agent-update" element={<AgentUpdate />} />
      </Routes>
    </Layout>
  );
}
