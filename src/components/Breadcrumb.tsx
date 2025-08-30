import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Building, FolderOpen, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const location = useLocation();

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {items.map((item, index) => {
        const Icon = item.icon;
        
        // Determinar se este item está ativo baseado na rota atual
        const isActive = item.href ? location.pathname === item.href : false;

        return (
          <div key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground/60" />
            )}
            
            {item.href ? (
              <Link 
                to={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground font-medium' 
                    : 'hover:bg-muted hover:text-foreground'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground font-medium">
                {Icon && <Icon className="w-4 h-4" />}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

// Hook personalizado para gerar breadcrumbs automaticamente
export const useBreadcrumbs = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const generateBreadcrumbs = (
    insertionOrderName?: string,
    campaignName?: string
  ): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    // Sempre começar com Insertion Orders
    items.push({
      label: 'Insertion Orders',
      href: '/',
      icon: Building
    });

    // Sempre adicionar Criativos como segunda opção
    items.push({
      label: 'Criativos',
      href: '/criativos',
      icon: FolderOpen
    });

    // Se estivermos em detalhes de criativo específico
    if (pathname.includes('/criativos/') && campaignName && !pathname.endsWith('/new')) {
      items.push({
        label: campaignName,
        icon: FileText
      });
    }

    // Se estivermos criando novo criativo
    if (pathname.endsWith('/new')) {
      items.push({
        label: 'Novo Criativo',
        icon: FileText
      });
    }

    return items;
  };

  return { generateBreadcrumbs };
};