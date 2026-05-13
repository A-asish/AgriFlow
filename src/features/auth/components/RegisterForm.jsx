import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Eye, EyeOff, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { validateUsername, validateEmail, validatePassword, validateConfirmPassword, validatePhone, validateAge, getPasswordStrength, } from '../utils/validators';
export const RegisterForm = ({ onSubmit, loading, apiErrors, onClearErrors }) => {
    const { t } = useLanguage();
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [isUsernameManuallyEdited, setIsUsernameManuallyEdited] = useState(false);
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        geographical_region: '',
        location: '',
        district: '',
        agreed_to_terms: false,
        agreed_to_privacy: false,
    });
    // Enhanced username generation with minimum length guarantee
    const generateUsername = (firstName) => {
        let baseUsername = firstName.toLowerCase();
        baseUsername = baseUsername.replace(/[^a-z0-9]/g, '');
        // Ensure username is at least 3 characters
        if (baseUsername.length < 3) {
            baseUsername = baseUsername + 'farm';
        }
        if (baseUsername.length < 3) {
            baseUsername = 'farmer';
        }
        const randomNum = Math.floor(Math.random() * 10000);
        return `${baseUsername}${randomNum}`;
    };
    // Auto-generate username from first name
    useEffect(() => {
        if (!isUsernameManuallyEdited && form.first_name && form.first_name.length >= 2) {
            const suggestedUsername = generateUsername(form.first_name);
            setForm(prev => ({ ...prev, username: suggestedUsername }));
        }
    }, [form.first_name, isUsernameManuallyEdited]);
    const regenerateUsername = () => {
        if (form.first_name && form.first_name.length >= 2) {
            const newUsername = generateUsername(form.first_name);
            setForm(prev => ({ ...prev, username: newUsername }));
            setIsUsernameManuallyEdited(false);
        }
        else {
            // If no first name, generate a default username
            const defaultUsername = `farmer${Math.floor(Math.random() * 10000)}`;
            setForm(prev => ({ ...prev, username: defaultUsername }));
            setIsUsernameManuallyEdited(false);
        }
    };
    const handleFieldChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (field === 'username') {
            setIsUsernameManuallyEdited(true);
        }
        // Clear errors
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const n = { ...prev };
                delete n[field];
                return n;
            });
        }
        if (onClearErrors) {
            onClearErrors();
        }
        // Real-time validation
        if (field === 'username') {
            const error = validateUsername(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, username: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.username; return n; });
        }
        if (field === 'email') {
            const error = validateEmail(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, email: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.email; return n; });
        }
        if (field === 'password') {
            const error = validatePassword(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, password: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.password; return n; });
            if (form.password2) {
                const confirmError = validateConfirmPassword(value, form.password2);
                if (confirmError)
                    setFieldErrors(prev => ({ ...prev, password2: confirmError }));
                else
                    setFieldErrors(prev => { const n = { ...prev }; delete n.password2; return n; });
            }
        }
        if (field === 'password2') {
            const error = validateConfirmPassword(form.password, value);
            if (error)
                setFieldErrors(prev => ({ ...prev, password2: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.password2; return n; });
        }
        if (field === 'phone') {
            const error = validatePhone(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, phone: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.phone; return n; });
        }
        if (field === 'date_of_birth') {
            const error = validateAge(value);
            if (error)
                setFieldErrors(prev => ({ ...prev, date_of_birth: error }));
            else
                setFieldErrors(prev => { const n = { ...prev }; delete n.date_of_birth; return n; });
        }
        // Validate first name minimum length
        if (field === 'first_name') {
            if (value.length < 2) {
                setFieldErrors(prev => ({ ...prev, first_name: 'First name must be at least 2 characters' }));
            }
            else {
                setFieldErrors(prev => { const n = { ...prev }; delete n.first_name; return n; });
            }
        }
        // Validate last name minimum length
        if (field === 'last_name') {
            if (value.length < 2) {
                setFieldErrors(prev => ({ ...prev, last_name: 'Last name must be at least 2 characters' }));
            }
            else {
                setFieldErrors(prev => { const n = { ...prev }; delete n.last_name; return n; });
            }
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newFieldErrors = {};
        // Username validation
        const usernameError = validateUsername(form.username);
        if (usernameError)
            newFieldErrors.username = usernameError;
        // Email validation
        const emailError = validateEmail(form.email);
        if (emailError)
            newFieldErrors.email = emailError;
        // Password validation
        const passwordError = validatePassword(form.password);
        if (passwordError)
            newFieldErrors.password = passwordError;
        // Confirm password validation
        const confirmPasswordError = validateConfirmPassword(form.password, form.password2);
        if (confirmPasswordError)
            newFieldErrors.password2 = confirmPasswordError;
        // First name validation - must be at least 2 characters
        if (!form.first_name) {
            newFieldErrors.first_name = 'First name is required';
        }
        else if (form.first_name.length < 2) {
            newFieldErrors.first_name = 'First name must be at least 2 characters';
        }
        // Last name validation - must be at least 2 characters
        if (!form.last_name) {
            newFieldErrors.last_name = 'Last name is required';
        }
        else if (form.last_name.length < 2) {
            newFieldErrors.last_name = 'Last name must be at least 2 characters';
        }
        // Date of birth validation
        const dateOfBirthError = validateAge(form.date_of_birth);
        if (dateOfBirthError)
            newFieldErrors.date_of_birth = dateOfBirthError;
        // Geographical region validation
        if (!form.geographical_region) {
            newFieldErrors.geographical_region = 'Geographical region is required';
        }
        // District validation
        if (!form.district) {
            newFieldErrors.district = 'District is required';
        }
        // Location validation
        if (!form.location) {
            newFieldErrors.location = 'Location is required';
        }
        // Phone validation (optional but validate if provided)
        const phoneError = validatePhone(form.phone);
        if (phoneError)
            newFieldErrors.phone = phoneError;
        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }
        if (!form.agreed_to_terms || !form.agreed_to_privacy) {
            return;
        }
        await onSubmit(form);
    };
    const passwordStrength = getPasswordStrength(form.password);
    const regionOptions = [
        { value: 'terai', label: t('auth.terai') },
        { value: 'hilly', label: t('auth.hilly') },
        { value: 'himalayan', label: t('auth.himalayan') },
    ];
    const genderOptions = [
        { value: 'M', label: t('auth.male') },
        { value: 'F', label: t('auth.female') },
        { value: 'O', label: t('auth.other') },
    ];
    return (<form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
      {/* First Name & Last Name */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('auth.firstName')} *
          </Label>
          <Input value={form.first_name} onChange={e => handleFieldChange('first_name', e.target.value)} required placeholder={t('auth.firstNamePlaceholder')} className={`rounded-xl ${fieldErrors.first_name ? 'border-destructive' : ''}`}/>
          {fieldErrors.first_name && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3"/> {fieldErrors.first_name}
            </p>)}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('auth.lastName')} *
          </Label>
          <Input value={form.last_name} onChange={e => handleFieldChange('last_name', e.target.value)} required placeholder={t('auth.lastNamePlaceholder')} className={`rounded-xl ${fieldErrors.last_name ? 'border-destructive' : ''}`}/>
          {fieldErrors.last_name && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3"/> {fieldErrors.last_name}
            </p>)}
        </div>
      </div>

      {/* Username */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t('auth.username')} *
        </Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input value={form.username} onChange={e => handleFieldChange('username', e.target.value)} required placeholder={t('auth.usernamePlaceholder')} className={`rounded-xl ${fieldErrors.username || apiErrors?.username ? 'border-destructive' : ''}`}/>
          </div>
          <Button type="button" variant="outline" onClick={regenerateUsername} className="rounded-xl px-4 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600" title="Generate new username">
            <RefreshCw className="w-4 h-4"/>
          </Button>
        </div>
        {fieldErrors.username && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3"/> {fieldErrors.username}
          </p>)}
        {apiErrors?.username && !fieldErrors.username && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3"/> {apiErrors.username}
          </p>)}
        <p className="text-xs text-muted-foreground">
          Username must be at least 3 characters and can only contain letters, numbers, and underscores.
        </p>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t('auth.emailAddress')} *
        </Label>
        <Input type="email" value={form.email} onChange={e => handleFieldChange('email', e.target.value)} required placeholder={t('auth.emailPlaceholder')} className={`rounded-xl ${fieldErrors.email || apiErrors?.email ? 'border-destructive' : ''}`}/>
        {fieldErrors.email && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3"/> {fieldErrors.email}
          </p>)}
        {apiErrors?.email && !fieldErrors.email && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3"/> {apiErrors.email}
          </p>)}
      </div>

      {/* Phone & Gender */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('auth.phone')}
          </Label>
          <Input type="tel" value={form.phone} onChange={e => handleFieldChange('phone', e.target.value)} placeholder="98XXXXXXXX" className={`rounded-xl ${fieldErrors.phone || apiErrors?.phone ? 'border-destructive' : ''}`}/>
          {fieldErrors.phone && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3"/> {fieldErrors.phone}
            </p>)}
          {apiErrors?.phone && !fieldErrors.phone && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3"/> {apiErrors.phone}
            </p>)}
          <p className="text-xs text-muted-foreground">Optional. Format: 98XXXXXXXX or 97XXXXXXXX</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('auth.gender')}
          </Label>
          <Select value={form.gender} onValueChange={v => handleFieldChange('gender', v)}>
            <SelectTrigger className="rounded-xl border-border/60 focus:border-emerald-500">
              <SelectValue placeholder={t('auth.selectGender')}/>
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date of Birth & Geographical Region */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('auth.dateOfBirth')} *
          </Label>
          <Input type="date" value={form.date_of_birth} onChange={e => handleFieldChange('date_of_birth', e.target.value)} required className={`rounded-xl ${fieldErrors.date_of_birth ? 'border-destructive' : ''}`}/>
          {fieldErrors.date_of_birth && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3"/> {fieldErrors.date_of_birth}
            </p>)}
          <p className="text-xs text-muted-foreground">You must be at least 13 years old</p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('auth.geographicalRegion')} *
          </Label>
          <Select value={form.geographical_region} onValueChange={v => handleFieldChange('geographical_region', v)}>
            <SelectTrigger className={`rounded-xl border-border/60 focus:border-emerald-500 ${fieldErrors.geographical_region || apiErrors?.geographical_region ? 'border-destructive' : ''}`}>
              <SelectValue placeholder={t('auth.selectRegion')}/>
            </SelectTrigger>
            <SelectContent>
              {regionOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
            </SelectContent>
          </Select>
          {fieldErrors.geographical_region && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3"/> {fieldErrors.geographical_region}
            </p>)}
        </div>
      </div>

      {/* District & Location */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('auth.district')} *
          </Label>
          <Input value={form.district} onChange={e => handleFieldChange('district', e.target.value)} required placeholder={t('auth.districtPlaceholder')} className={`rounded-xl ${fieldErrors.district ? 'border-destructive' : ''}`}/>
          {fieldErrors.district && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3"/> {fieldErrors.district}
            </p>)}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t('auth.location')} *
          </Label>
          <Input value={form.location} onChange={e => handleFieldChange('location', e.target.value)} required placeholder={t('auth.locationPlaceholder')} className={`rounded-xl ${fieldErrors.location ? 'border-destructive' : ''}`}/>
          {fieldErrors.location && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3"/> {fieldErrors.location}
            </p>)}
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t('auth.password')} *
        </Label>
        <div className="relative">
          <Input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => handleFieldChange('password', e.target.value)} required minLength={8} placeholder="••••••••" className={`rounded-xl pr-10 ${fieldErrors.password ? 'border-destructive' : ''}`}/>
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
          </button>
        </div>

        {form.password && !fieldErrors.password && (<div className="space-y-1 mt-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (<div key={level} className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength.score
                    ? passwordStrength.color
                    : 'bg-gray-200'}`}/>))}
            </div>
            <p className={`text-xs ${passwordStrength.score <= 2 ? 'text-red-500' :
                passwordStrength.score <= 3 ? 'text-yellow-500' :
                    passwordStrength.score <= 4 ? 'text-blue-500' : 'text-green-500'}`}>
              Password strength: {passwordStrength.label}
            </p>
          </div>)}

        {fieldErrors.password && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3"/> {fieldErrors.password}
          </p>)}
        <p className="text-xs text-muted-foreground">
          Password must be at least 8 characters with uppercase, lowercase, number, and special character.
        </p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {t('auth.confirmPassword')} *
        </Label>
        <div className="relative">
          <Input type={showPassword2 ? 'text' : 'password'} value={form.password2} onChange={e => handleFieldChange('password2', e.target.value)} required minLength={8} placeholder="••••••••" className={`rounded-xl pr-10 ${fieldErrors.password2 ? 'border-destructive' : ''}`}/>
          <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword2 ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
          </button>
        </div>
        {fieldErrors.password2 && (<p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3"/> {fieldErrors.password2}
          </p>)}
        {form.password && form.password2 && !fieldErrors.password2 && form.password === form.password2 && (<p className="text-xs text-green-600 flex items-center gap-1 mt-1">
            <CheckCircle className="w-3 h-3"/> Passwords match
          </p>)}
      </div>

      {/* Terms and Conditions */}
      <div className="mt-4 pt-2">
        <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-xl border border-border/60">
          <input type="checkbox" id="agreedToAll" checked={form.agreed_to_terms && form.agreed_to_privacy} onChange={(e) => {
            const isChecked = e.target.checked;
            handleFieldChange('agreed_to_terms', isChecked);
            handleFieldChange('agreed_to_privacy', isChecked);
        }} className="mt-0.5 w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"/>
          <label htmlFor="agreedToAll" className="text-xs text-muted-foreground cursor-pointer select-none leading-relaxed">
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-emerald-600 font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-emerald-600 font-bold hover:underline" onClick={(e) => e.stopPropagation()}>
              Privacy Policy
            </a>.
          </label>
        </div>
      </div>

      <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold mt-4" disabled={loading || !form.agreed_to_terms || !form.agreed_to_privacy || Object.keys(fieldErrors).length > 0}>
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
        {loading ? 'Creating account...' : t('auth.createAccount')}
      </Button>
    </form>);
};
