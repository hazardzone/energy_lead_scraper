import ErrorBoundary from '../components/ErrorBoundary';
import Dashboard from './dashboard/page';

export default function Home() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}
