import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { toast } from 'sonner';
import { authService } from '../services/auth.api';
import { useLanguage } from '@/contexts/LanguageContext';
const VerifyEmail = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [verifying, setVerifying] = useState(true);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resending, setResending] = useState(false);
    const [email, setEmail] = useState('');
    const [countdown, setCountdown] = useState(5);
    const hasVerified = useRef(false);
    const countdownInterval = useRef(undefined);
    useEffect(() => {
        const storedEmail = localStorage.getItem('pendingVerificationEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        }
        if (token && !hasVerified.current) {
            hasVerified.current = true;
            verifyEmail();
        }
        else if (!token) {
            setVerifying(false);
            setVerificationStatus('error');
            setErrorMessage(t('verifyEmail.noToken') || 'No verification token provided. Please check your email link.');
        }
        return () => {
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
        };
    }, [token]);
    useEffect(() => {
        if (verificationStatus === 'success' && countdown > 0) {
            countdownInterval.current = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        else if (verificationStatus === 'success' && countdown === 0) {
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
            navigate('/auth?tab=login');
        }
        return () => {
            if (countdownInterval.current) {
                clearInterval(countdownInterval.current);
            }
        };
    }, [verificationStatus, countdown, navigate]);
    const verifyEmail = async () => {
        setVerifying(true);
        try {
            const response = await authService.verifyEmail(token);
            if (response.status === 200) {
                const message = response.data?.message || t('auth.verifyEmail') || 'Email verified successfully!';
                setSuccessMessage(message);
                setVerificationStatus('success');
                toast.success(t('verifyEmail.verifySuccess') || 'Email verified successfully!');
                localStorage.removeItem('pendingVerificationEmail');
                setVerifying(false);
                return;
            }
            throw new Error('Verification failed');
        }
        catch (error) {
            console.error('Verification error:', error);
            if (error.response?.status === 400) {
                const errorData = error.response.data;
                if (errorData?.detail === 'Email already verified') {
                    setSuccessMessage(t('verifyEmail.alreadyVerified') || 'Your email is already verified! You can now log in.');
                    setVerificationStatus('success');
                    toast.success(t('verifyEmail.alreadyVerified') || 'Email already verified!');
                    localStorage.removeItem('pendingVerificationEmail');
                    setVerifying(false);
                    return;
                }
                setErrorMessage(errorData?.detail || t('verifyEmail.invalidToken') || 'Invalid or expired verification token');
            }
            else {
                setErrorMessage(t('verifyEmail.verifyFailed') || 'Failed to verify email. Please try again.');
            }
            setVerificationStatus('error');
            toast.error(errorMessage);
        }
        finally {
            setVerifying(false);
        }
    };
    const resendVerificationEmail = async () => {
        let targetEmail = email;
        if (!targetEmail) {
            const userEmail = prompt(t('verifyEmail.enterEmail') || 'Please enter your email address to resend verification link:');
            if (!userEmail)
                return;
            targetEmail = userEmail;
            setEmail(targetEmail);
            localStorage.setItem('pendingVerificationEmail', targetEmail);
        }
        setResending(true);
        try {
            const response = await authService.resendVerification(targetEmail);
            if (response.status === 200) {
                toast.success(t('verifyEmail.resendSuccess') || 'Verification email resent successfully!');
            }
            else {
                throw new Error('Failed to resend');
            }
        }
        catch (error) {
            toast.error(t('verifyEmail.resendFailed') || 'Failed to resend verification email');
        }
        finally {
            setResending(false);
        }
    };
    if (verifying) {
        return (<div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2 bg-linear-to-r from-emerald-50 to-teal-50">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-10 w-10 text-emerald-600 animate-spin"/>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">
                {t('verifyEmail.verifyingTitle') || 'Verifying Your Email'}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {t('verifyEmail.verifyingDesc') || 'Please wait while we verify your email address'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 text-center">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"/>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>);
    }
    if (verificationStatus === 'success') {
        return (<div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-2 bg-linear-to-r from-emerald-50 to-teal-50">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-emerald-600"/>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight">
                {t('verifyEmail.successTitle') || 'Email Verified!'}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {t('verifyEmail.successDesc') || 'Your email has been successfully verified'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 text-center">
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-sm text-emerald-800 leading-relaxed">{successMessage}</p>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-sm text-blue-800">
                    {t('verifyEmail.redirecting') || 'Redirecting to login in'} {countdown} {t('verifyEmail.seconds') || 'seconds'}...
                  </p>
                </div>
                
                <Button onClick={() => navigate('/auth?tab=login')} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 group">
                  {t('verifyEmail.loginButton') || 'Login to Your Account'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
                </Button>
                
                <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {t('common.backToHome') || 'Return to Homepage'}
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>);
    }
    return (<div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2 bg-linear-to-r from-red-50 to-orange-50">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-10 w-10 text-red-600"/>
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">
              {t('verifyEmail.failedTitle') || 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {t('verifyEmail.failedDesc') || "We couldn't verify your email address"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 text-center">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-800 leading-relaxed">{errorMessage}</p>
              </div>
              
              <Button onClick={resendVerificationEmail} disabled={resending} className="w-full h-12 rounded-xl">
                {resending ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <RefreshCw className="w-4 h-4 mr-2"/>}
                {resending
            ? (t('verifyEmail.sending') || 'Sending...')
            : (t('verifyEmail.resendButton') || 'Resend Verification Email')}
              </Button>
              
              <Button onClick={() => navigate('/auth?tab=signup')} variant="outline" className="w-full h-12 rounded-xl">
                {t('verifyEmail.createAccount') || 'Create a New Account'}
              </Button>
              
              <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('common.backToHome') || 'Return to Homepage'}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>);
};
export default VerifyEmail;
