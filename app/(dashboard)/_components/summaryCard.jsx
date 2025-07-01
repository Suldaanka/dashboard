import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

const SummaryCard = ({ 
  title, 
  value, 
  change, 
  isPositive, 
  period,
  icon,
  color
}) => {
  return (
    <Card className="p-5">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-semibold text-gray-800">{value}</h3>
          <div className="flex items-center mt-1">
            <span className={cn(
              "text-xs font-medium flex items-center",
              isPositive ? "text-green-600" : "text-red-600"
            )}>
              {isPositive ? 
                <ArrowUpIcon size={12} className="mr-1" /> : 
                <ArrowDownIcon size={12} className="mr-1" />
              }
              {change}
            </span>
            <span className="text-xs text-gray-500 ml-1">{period}</span>
          </div>
        </div>
        <div className={cn("p-2 rounded-lg", color)}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default SummaryCard;