import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Sprout, BarChart3, Shield, ArrowRight, Wheat, Beef, CloudSun, CalendarCheck, Globe, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
export default function LandingPage() {
    const { language, setLanguage, t } = useLanguage();
    const features = [
        { icon: Wheat, title: t('feature.cropMgmt'), desc: t('feature.cropDesc') },
        { icon: Beef, title: t('feature.livestock'), desc: t('feature.livestockDesc') },
        { icon: BarChart3, title: t('feature.finance'), desc: t('feature.financeDesc') },
        { icon: CloudSun, title: t('feature.weather'), desc: t('feature.weatherDesc') },
        { icon: CalendarCheck, title: t('feature.calendar'), desc: t('feature.calendarDesc') },
        { icon: Shield, title: t('feature.security'), desc: t('feature.securityDesc') },
    ];
    const benefits = [
        t('landing.benefit1'),
        t('landing.benefit2'),
        t('landing.benefit3'),
        t('landing.benefit4'),
        t('landing.benefit5'),
    ];
    return (<div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-green-600 flex items-center justify-center group-hover:bg-green-700 transition-colors">
              <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-white"/>
            </div>
            <span className="text-lg sm:text-xl font-bold text-foreground">AgriFlow</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="rounded-xl gap-1.5 text-xs sm:text-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors" onClick={() => setLanguage(language === 'en' ? 'np' : 'en')}>
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
              <span className="hidden xs:inline">{language === 'en' ? 'नेपाली' : 'English'}</span>
            </Button>
            <Link to="/auth">
              <Button size="sm" className="font-semibold rounded-xl text-xs sm:text-sm bg-green-600 hover:bg-green-700 text-white transition-colors">
                {t('landing.getStarted')}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in">
            <Sprout className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>{t('landing.smartFarm')}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-4 sm:mb-6 animate-slide-up">
            {t('landing.heroTitle1')}<br />
            <span className="text-green-600">{t('landing.heroTitle2')}</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-10 animate-slide-up stagger-1 px-2" style={{ animationFillMode: 'both' }}>
            {t('landing.heroDesc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up stagger-2" style={{ animationFillMode: 'both' }}>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="rounded-xl text-base px-8 gap-2 font-semibold w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white transition-colors">
                {t('landing.startFree')} <ArrowRight className="w-4 h-4"/>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((b, i) => (<div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-green-50 transition-colors group cursor-pointer">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 group-hover:scale-110 transition-transform"/>
                <span className="text-sm font-medium text-foreground group-hover:text-green-700">{b}</span>
              </div>))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">{t('landing.everything')}</h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto px-2">{t('landing.toolkit')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (<div key={i} className="farm-card group cursor-pointer hover:shadow-lg hover:shadow-green-100 transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-100 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-green-600 transition-colors">
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 group-hover:text-white transition-colors"/>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1.5 sm:mb-2 group-hover:text-green-700 transition-colors">{f.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed group-hover:text-gray-700">{f.desc}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-linear-to-br from-green-600 to-green-700 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 hover:shadow-xl hover:shadow-green-200 transition-shadow">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">{t('landing.readyToGrow')}</h2>
            <p className="text-green-50 text-base sm:text-lg mb-6 sm:mb-8 max-w-lg mx-auto">{t('landing.joinFarmers')}</p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="rounded-xl text-base px-8 font-semibold gap-2 bg-white text-green-700 hover:bg-green-50 hover:text-green-800 transition-colors">
                {t('landing.getStarted')} <ArrowRight className="w-4 h-4"/>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <Sprout className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform"/>
            <span className="font-bold text-foreground group-hover:text-green-700 transition-colors">AgriFlow</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-center">© 2026 AgriFlow. {t('landing.builtForFarmers')}</p>
        </div>
      </footer>
    </div>);
}
