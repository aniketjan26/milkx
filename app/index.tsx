import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/(auth)/language" />;
  switch (user?.role) {
    case 'collector': return <Redirect href="/(collector)/dashboard" />;
    case 'farmer':    return <Redirect href="/(farmer)/dashboard" />;
    case 'admin':     return <Redirect href="/(admin)/dashboard" />;
    default:          return <Redirect href="/(auth)/language" />;
  }
}
