import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface MetricsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  className?: string;
  iconColor?: string;
}

export const MetricsCard = memo(({ icon: Icon, value, label, className, iconColor }: MetricsCardProps) => {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded ${className || 'bg-neutral-100'}`}>
            <Icon className={`w-5 h-5 ${iconColor || 'text-neutral-600'}`} />
          </div>
          <div>
            <div className="text-xl font-semibold">{value}</div>
            <div className="text-sm text-neutral-600">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

MetricsCard.displayName = 'MetricsCard';