import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AppLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
