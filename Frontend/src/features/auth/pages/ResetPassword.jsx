import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sprout, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import { authService } from '../services/auth.api';
const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            toast.error('Passwords do not match');
            return;
        }
        if (!token) {
            toast.error('Invalid reset token');
            return;
        }
        setLoading(true);
        try {
            await authService.confirmPasswordReset({ token, new_password: password, new_password2: password2 });
            toast.success('Password reset successful!');
            navigate('/auth?tab=login');
        }
        catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to reset password');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
            <Sprout className="w-7 h-7 text-white"/>
          </div>
          <span className="text-3xl font-black tracking-tighter text-foreground">AgriFlow</span>
        </Link>

        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2 bg-muted/30">
            <CardTitle className="text-2xl font-black tracking-tight">Reset Password</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="h-12 rounded-xl"/>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm New Password</Label>
                <Input type="password" value={password2} onChange={e => setPassword2(e.target.value)} required className="h-12 rounded-xl"/>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>

              <div className="text-center">
                <Link to="/auth?tab=login" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="w-4 h-4"/> Back to Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>);
};
export default ResetPassword;
