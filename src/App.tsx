import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import RedirectHandler from './components/RedirectHandler'
import OrganizationHome from './pages/OrganizationHome'
import ModsPage from './pages/ModsPage'
import ModDownloadsPage from './pages/ModDownloadsPage'
import LibrariesPage from './pages/LibrariesPage'
import LibraryDetailsPage from './pages/LibraryDetailsPage'
import LibraryFilePage from './pages/LibraryFilePage'
import NotFoundPage from './pages/NotFoundPage'

function App() {
    return (
        <BrowserRouter>
            <RedirectHandler>
                <Routes>
                    <Route path="/" element={<AppLayout />}>
                        <Route index element={<OrganizationHome />} />
                        <Route path="mods" element={<ModsPage />} />
                        <Route path="mods/:slug" element={<ModDownloadsPage />} />
                        <Route path="libraries" element={<LibrariesPage />} />
                        <Route path="libraries/:slug" element={<LibraryDetailsPage />} />
                        <Route path="library/:slug/file/*" element={<LibraryFilePage />} />
                        <Route path="library/:slug" element={<LibraryDetailsPage />} />
                        <Route path="home" element={<Navigate replace to="/" />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Route>
                </Routes>
            </RedirectHandler>
        </BrowserRouter>
    )
}

export default App
