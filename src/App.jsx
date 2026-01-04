import { Routes, Route } from 'react-router-dom'
import { SettingsProvider } from './context/SettingsContext'
import Layout from './components/Layout'
import Work from './pages/Work'
import Info from './pages/Info'

function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Work />} />
          <Route path="info" element={<Info />} />
        </Route>
      </Routes>
    </SettingsProvider>
  )
}

export default App
