import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import SubmitProject from './pages/SubmitProject';
import AdminPanel from './pages/AdminPanel';
import Trending from './pages/Trending';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/submit" element={<SubmitProject />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Layout>
  );
}

export default App;

