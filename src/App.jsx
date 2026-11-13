import { MotionConfig } from 'motion/react';
import { BrowserRouter } from 'react-router-dom';
import ToastViewport from './components/common/ToastViewport';
import { ErrorBoundary } from './components/common/ui';
import { AuthProvider } from './context/AuthContext';
import { PlatformDataProvider } from './context/PlatformDataContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <ErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ToastProvider>
          <PlatformDataProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppRoutes />
                <ToastViewport />
              </BrowserRouter>
            </AuthProvider>
          </PlatformDataProvider>
        </ToastProvider>
      </MotionConfig>
    </ErrorBoundary>
  );
}
