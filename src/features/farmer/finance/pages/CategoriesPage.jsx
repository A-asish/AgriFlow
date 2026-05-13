import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/features/common/components/layout/MainLayout';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { financeService } from '@/features/farmer/finance/services/finance.api';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Tag, Trash2, Loader2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/shared/components/ui/badge';
const CategoriesPage = () => {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await financeService.listCategories();
                setCategories(res.data || []);
            }
            catch (error) {
                console.error("Error fetching categories:", error);
                toast.error('Failed to load categories');
            }
            finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);
    return (<MainLayout title={t('finance.categories') || 'Finance Categories'} subtitle={t('finance.categoriesDesc') || 'Manage your income and expense categories'}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black">{t('finance.allCategories') || 'All Categories'}</h2>
          <Button className="rounded-xl gap-2 h-12 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-5 h-5"/> {t('finance.addCategory') || 'New Category'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (<div className="col-span-full flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary"/>
            </div>) : categories.map((category) => (<Card key={category.id} className="border-0 shadow-xl rounded-3xl overflow-hidden hover:bg-muted/30 transition-colors group">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${category.category_type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                    <Tag className="w-6 h-6"/>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{category.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-full">
                        {category.category_type}
                      </Badge>
                      {category.group && <span className="text-xs text-muted-foreground">{category.group}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Edit2 className="w-4 h-4"/>
                  </Button>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-4 h-4"/>
                  </Button>
                </div>
              </CardContent>
            </Card>))}

          {!loading && categories.length === 0 && (<div className="col-span-full py-20 text-center farm-card">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-10 h-10 text-muted-foreground"/>
              </div>
              <h3 className="text-xl font-bold">{t('finance.noCategories') || 'No categories found'}</h3>
              <p className="text-muted-foreground mt-2">{t('finance.noCategoriesDesc') || 'Create categories to organize your transactions'}</p>
            </div>)}
        </div>
      </div>
    </MainLayout>);
};
export default CategoriesPage;
