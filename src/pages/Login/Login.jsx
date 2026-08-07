import React, { useState } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { LayoutDashboard } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return null;

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const { error: authError } = await signIn(trimmedEmail, password);
      
      if (authError) {
        setError(authError.message);
      } else {
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-sm p-8 flex flex-col items-center border-border">
        <LayoutDashboard className="w-12 h-12 text-accent mb-4" />
        <h1 className="text-2xl font-bold text-primary mb-2">LifeOS</h1>
        <p className="text-secondary text-center mb-8">Personal Operating System</p>

        {error && (
          <div className="w-full mb-6 text-sm text-danger bg-danger/5 border border-danger/20 p-3 rounded-none">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Email</label>
            <Input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary mb-1">Password</label>
            <Input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6 flex justify-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
