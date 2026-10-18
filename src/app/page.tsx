'use client';
import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@nextui-org/react';
import Login from './components/Login/Login';
import { useUser } from './contexts/UserContext';

export default function Home() {
  const router = useRouter();
  const { token, isTokenValid, isInitialized } = useUser();

  useEffect(() => {
    if (isInitialized && token && isTokenValid && !new URLSearchParams(window.location.search).get('token')) router.replace('/pages/inicio');
  }, [isInitialized, token, isTokenValid, router]);

  if (!isInitialized || (token && isTokenValid)) {
    return <div className="boot"><Spinner color="danger" label="Cargando portal…" /></div>;
  }
  return <Suspense fallback={<div className="boot"><Spinner color="danger" /></div>}><Login /></Suspense>;
}
