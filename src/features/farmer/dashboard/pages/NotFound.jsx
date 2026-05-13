import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import { Sprout, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
const NotFound = () => {
    const { t } = useLanguage();
    return (<div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="w-20 h-20 rounded-3xl gradient-hero flex items-center justify-center mb-8 shadow-glow animate-bounce">
        <Sprout className="w-10 h-10 text-primary-foreground"/>
      </div>
      <h1 className="text-6xl font-black text-foreground mb-4 tracking-tighter">404</h1>
      <p className="text-xl font-bold text-muted-foreground mb-8 max-w-md">
        {t('common.pageNotFound')}
      </p>
      <Link to="/">
        <Button size="lg" className="rounded-xl gap-2 font-bold px-8 h-12">
          <Home className="w-5 h-5"/> {t('common.backToHome')}
        </Button>
      </Link>
    </div>);
};
export default NotFound;
