import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import HomePage from './pages/HomePage'
import ModDownloadsPage from './pages/ModDownloadsPage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="mods/:slug" element={<ModDownloadsPage />} />
                    <Route path="home" element={<Navigate replace to="/" />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default App
