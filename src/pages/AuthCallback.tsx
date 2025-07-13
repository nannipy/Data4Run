import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleStravaCallback } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('Errore durante l\'autenticazione con Strava');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Codice di autorizzazione mancante');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    const authenticate = async () => {
      try {
        setMessage('Stiamo collegando il tuo account Strava...');
        await handleStravaCallback(code);
        setStatus('success');
        setMessage('Account collegato con successo! Reindirizzamento...');
        setTimeout(() => navigate('/'), 2000);
      } catch (error) {
        console.error('Auth error:', error);
        setStatus('error');
        setMessage('Errore durante la connessione. Riprova.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    authenticate();
  }, [searchParams, handleStravaCallback, navigate]);

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'error':
        return <XCircle className="h-8 w-8 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {getIcon()}
          </div>
          <CardTitle>Autenticazione Strava</CardTitle>
          <CardDescription>
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <p className="text-sm text-muted-foreground">
              Attendere prego...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;