import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Work from './pages/Work'
import Info from './pages/Info'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Work />} />
        <Route path="info" element={<Info />} />
      </Route>
    </Routes>
  )
}

export default App
