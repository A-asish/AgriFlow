import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sprout, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { EmailVerificationSent } from '../components/EmailVerificationSent';
import { useAuthForm } from '../hooks/useAuthForm';
const AuthPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t, language } = useLanguage();
    const [searchParams] = useSearchParams();
    const defaultTab = searchParams.get('tab') === 'signup' ? 'signup' : 'login';
    const [loginLoading, setLoginLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const { loading: registerLoading, apiErrors, handleRegister, clearApiErrors } = useAuthForm();
    const handleLogin = async (email, password) => {
        setLoginLoading(true);
        try {
            const result = await login(email, password);
            if (result.success && result.redirectPath) {
                toast.success('Login successful!');
                navigate(result.redirectPath);
            }
            else {
                toast.error(result.message || 'Invalid email or password');
            }
        }
        catch (error) {
            toast.error(error.message || 'Something went wrong');
        }
        finally {
            setLoginLoading(false);
        }
    };
    const handleRegisterSubmit = async (formData) => {
        console.log('🚀 Submitting registration form:', formData);
        const success = await handleRegister(formData);
        if (success) {
            // Store email for verification screen
            localStorage.setItem('pendingVerificationEmail', formData.email);
            setRegisteredEmail(formData.email);
            setEmailSent(true);
        }
    };
    const handleResendVerification = async () => {
        // You can implement resend functionality here
        toast.info('Please check your email spam folder or contact support');
    };
    if (emailSent) {
        return (<div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8">
        <EmailVerificationSent email={registeredEmail} onResend={handleResendVerification}/>
      </div>);
    }
    return (<div className="min-h-screen flex items-center justify-center bg-muted/40 px-4 py-8 animate-in">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
            <Sprout className="w-7 h-7 text-white"/>
          </div>
          <span className="text-3xl font-black tracking-tighter text-foreground">AgriFlow</span>
        </Link>

        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-2 bg-muted/30">
            <CardTitle className="text-2xl font-black tracking-tight">
              {defaultTab === 'login' ? t('auth.signIn') : t('auth.createAccount')}
            </CardTitle>
            <CardDescription className="text-base">
              {defaultTab === 'login' ? t('auth.enterCredentials') : t('auth.joinCommunityToday')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <Tabs defaultValue={defaultTab}>
              <TabsList className="grid grid-cols-2 w-full mb-8 rounded-xl h-12 p-1 bg-muted/50">
                <TabsTrigger value="login" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {t('auth.signIn')}
                </TabsTrigger>
                <TabsTrigger value="signup" className="rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  {t('auth.register')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <LoginForm onSubmit={handleLogin} loading={loginLoading}/>
              </TabsContent>

              <TabsContent value="signup">
                <RegisterForm onSubmit={handleRegisterSubmit} loading={registerLoading} apiErrors={apiErrors} onClearErrors={clearApiErrors}/>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            {language === 'np' ? 'भाषा परिवर्तन गर्नुहोस्:' : 'Change language:'}
            <button onClick={() => {
            const newLang = language === 'en' ? 'np' : 'en';
            localStorage.setItem('language', newLang);
            window.location.reload();
        }} className="ml-2 font-bold text-emerald-600 hover:underline">
              {language === 'en' ? 'नेपाली' : 'English'}
            </button>
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4"/> {t('common.backToHome')}
          </Link>
        </div>
      </div>
    </div>);
};
export default AuthPage;
