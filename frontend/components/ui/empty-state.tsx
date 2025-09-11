"use client";

import { AlertCircle, Database, Search, Users, Building2 } from "lucide-react";

interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'error' | 'loading-error';
  title: string;
  description: string;
  icon?: 'database' | 'search' | 'users' | 'buildings' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap = {
  database: Database,
  search: Search,
  users: Users,
  buildings: Building2,
  error: AlertCircle,
};

export default function EmptyState({ 
  type, 
  title, 
  description, 
  icon = 'database',
  action 
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];
  
  const getStyles = () => {
    switch (type) {
      case 'error':
      case 'loading-error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-900',
          description: 'text-red-700',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
      case 'no-results':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-900',
          description: 'text-yellow-700',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200',
          icon: 'text-gray-400',
          title: 'text-gray-900',
          description: 'text-gray-600',
          button: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`rounded-lg border-2 border-dashed p-12 text-center ${styles.container}`}>
      <IconComponent className={`mx-auto h-12 w-12 ${styles.icon}`} />
      <h3 className={`mt-4 text-lg font-semibold ${styles.title}`}>
        {title}
      </h3>
      <p className={`mt-2 text-sm ${styles.description}`}>
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className={`mt-6 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.button}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
