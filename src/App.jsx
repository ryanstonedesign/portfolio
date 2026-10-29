import { Routes, Route } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import Layout from './components/Layout'
import Work from './pages/Work'
import Info from './pages/Info'
import Private from './pages/Private'
import { projects } from './data/projects'

function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Work projects={projects} />} />
          <Route path="private" element={<Private />} />
          <Route path="info" element={<Info />} />
        </Route>
      </Routes>
    </SettingsProvider>
  )
}

export default App
