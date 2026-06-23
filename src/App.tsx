import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PublicLayout } from './components/PublicLayout';
import { AdminLayout } from './components/AdminLayout';
import { RequireAdmin } from './components/RequireAdmin';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RoadmapPage } from './pages/RoadmapPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { UseCaseDetailPage } from './pages/UseCaseDetailPage';
import { TimelinePage } from './pages/TimelinePage';
import { WorkHistoryPage } from './pages/WorkHistoryPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { TestimonialDetailPage } from './pages/TestimonialDetailPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminSocialPage } from './pages/admin/AdminSocialPage';
import { AdminMfaPage } from './pages/admin/AdminMfaPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminTimelinePage } from './pages/admin/AdminTimelinePage';
import { AdminArticlesPage } from './pages/admin/AdminArticlesPage';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage';
import { AdminWorkHistoryPage } from './pages/admin/AdminWorkHistoryPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminEmployersPage } from './pages/admin/AdminEmployersPage';
import { AdminHomePage } from './pages/admin/AdminHomePage';
import { AdminUseCasesPage } from './pages/admin/AdminUseCasesPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/work-history" element={<WorkHistoryPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path="/case-studies/:slug" element={<UseCaseDetailPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:slug" element={<ArticleDetailPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/testimonials/:id" element={<TestimonialDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/roadmap" element={<RoadmapPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Admin back office — all routes require admin */}
            <Route
              path="/admin"
              element={<RequireAdmin><AdminLayout /></RequireAdmin>}
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="home" element={<AdminHomePage />} />
              <Route path="projects" element={<AdminProjectsPage />} />
              <Route path="timeline" element={<AdminTimelinePage />} />
              <Route path="articles" element={<AdminArticlesPage />} />
              <Route path="testimonials" element={<AdminTestimonialsPage />} />
              <Route path="work-history" element={<AdminWorkHistoryPage />} />
              <Route path="social" element={<AdminSocialPage />} />
              <Route path="mfa" element={<AdminMfaPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="employers" element={<AdminEmployersPage />} />
              <Route path="use-cases" element={<AdminUseCasesPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
