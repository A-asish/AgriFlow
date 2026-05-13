import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sprout, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import { authService } from '../services/auth.api';
const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [email, setEmail] = useState('');
    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.requestPasswordReset(email);
            setEmailSent(true);
            toast.success('Password reset email sent successfully!');
        }
        catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to send reset email');
        }
        finally {
            setLoading(false);
        }
    };
    if (emailSent) {
        return (<div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2 bg-muted/30">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-10 w-10 text-emerald-600"/>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">Check Your Email</CardTitle>
              <CardDescription className="text-base mt-2">
                We've sent a password reset link to <span className="font-bold text-primary">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 text-center">
              <Button onClick={() => navigate('/auth?tab=login')} className="w-full h-12 rounded-xl">
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>);
    }
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
            <CardTitle className="text-2xl font-black tracking-tight">Forgot Password?</CardTitle>
            <CardDescription className="text-base mt-2">
              No worries! Enter your email and we'll send you a reset link.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Email Address
                </Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-12 rounded-xl" required/>
              </div>

              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
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
export default ForgotPassword;
