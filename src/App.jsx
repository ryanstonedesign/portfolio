import { Routes, Route, Navigate } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import Layout from './components/Layout'
import Work from './pages/Work'
import Info from './pages/Info'
import { projects } from './data/projects'

function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Work projects={projects} />} />
          <Route path="info" element={<Info />} />
          {/* Unknown addresses (like the old /private) go home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </SettingsProvider>
  )
}

export default App
