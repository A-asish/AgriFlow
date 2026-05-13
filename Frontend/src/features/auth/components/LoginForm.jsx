import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
export const LoginForm = ({ onSubmit, loading }) => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSubmit(email, password);
    };
    return (<form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t('auth.emailAddress')}
        </Label>
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder={t('auth.emailPlaceholder')} className="rounded-xl h-12 border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20"/>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('auth.password')}
          </Label>
          <Link to="/forgot-password" className="text-xs font-bold text-emerald-600 hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </div>
        <div className="relative">
          <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="rounded-xl h-12 border-border/60 focus:border-emerald-500 focus:ring-emerald-500/20 pr-10"/>
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold" disabled={loading}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
        {loading ? 'Logging in...' : t('auth.signIn')}
      </Button>
    </form>);
};
