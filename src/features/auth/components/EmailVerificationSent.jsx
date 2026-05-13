import { motion } from 'motion/react';
import { Mail } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
export const EmailVerificationSent = ({ email, onResend }) => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    return (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full">
      <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-2 bg-linear-to-r from-emerald-50 to-teal-50">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="h-10 w-10 text-emerald-600"/>
          </div>
          <CardTitle className="text-2xl font-black tracking-tight">
            {t('auth.verifyEmail') || 'Verify Your Email'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {t('auth.verifyEmailSubtitle') || "We've sent a verification link to"}
          </CardDescription>
          <p className="font-bold text-emerald-600 mt-1 text-lg">{email}</p>
        </CardHeader>
        <CardContent className="pt-8 text-center">
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-sm text-emerald-800 leading-relaxed">
                {t('auth.verifyEmailMessage') || 'Please check your email and click the verification link to activate your account. The link will expire in 24 hours.'}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {t('auth.noEmailReceived') || "Didn't receive the email? Check your spam folder or "}
                <button onClick={onResend} className="text-emerald-600 font-bold hover:underline">
                  {t('auth.clickHereToResend') || 'click here to resend'}
                </button>
              </p>

              <Button onClick={() => navigate('/auth?tab=login')} className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                {t('auth.backToLogin') || 'Back to Login'}
              </Button>

              <button onClick={() => navigate('/')} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t('common.backToHome') || 'Return to Homepage'}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>);
};
