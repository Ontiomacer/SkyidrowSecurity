
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

interface OAuthLoginProps {
  onLogin: (provider: 'google' | 'github', token: string) => void;
}

const OAuthLogin: React.FC<OAuthLoginProps> = ({ onLogin }) => {
  const handleGoogleLogin = async () => {
    // In a real implementation, this would redirect to Google OAuth
    // For demo purposes, we'll simulate a successful login
    const mockToken = `google_token_${Date.now()}`;
    onLogin('google', mockToken);
  };

  const handleGitHubLogin = async () => {
    // In a real implementation, this would redirect to GitHub OAuth
    // For demo purposes, we'll simulate a successful login
    const mockToken = `github_token_${Date.now()}`;
    onLogin('github', mockToken);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>OAuth Login</CardTitle>
        <CardDescription>Sign in with your preferred provider</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleGoogleLogin}
          variant="outline" 
          className="w-full flex items-center gap-2"
        >
          <FcGoogle className="h-5 w-5" />
          Continue with Google
        </Button>
        
        <Button 
          onClick={handleGitHubLogin}
          variant="outline" 
          className="w-full flex items-center gap-2"
        >
          <Github className="h-5 w-5" />
          Continue with GitHub
        </Button>
      </CardContent>
    </Card>
  );
};

export default OAuthLogin;
