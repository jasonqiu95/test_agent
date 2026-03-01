import { useEffect } from 'react';
import { MainLayout } from './components/Layout/MainLayout';

function App() {
  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  return <MainLayout />;
}

export default App;
