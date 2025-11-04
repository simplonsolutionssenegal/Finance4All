import React from 'react';

import { Badge } from '@/components/ui/badge';

type Variant = 'default' | 'secondary' | 'outline';

type ChipProps = {
  children: React.ReactNode;
  variant?: Variant;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
};

const variantToBadge = (v: Variant | undefined) => {
  if (v === 'secondary') return 'secondary';
  if (v === 'outline') return 'outline';
  return undefined;
};

const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'default',
  onClick,
  className = '',
  icon,
  ariaLabel,
}) => {
  const isInteractive = typeof onClick === 'function';

  // Handler sûr (évite le non-null assertion)
  const safeOnClick = React.useCallback(() => {
    if (typeof onClick === 'function') onClick();
  }, [onClick]);

  const handleKeyDown: React.KeyboardEventHandler = e => {
    if (!isInteractive) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      safeOnClick();
    }
  };

  return (
    <Badge
      variant={variantToBadge(variant)}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${className}`}
      onClick={isInteractive ? safeOnClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      {icon && <span className='mr-1.5 inline-flex items-center'>{icon}</span>}
      {children}
    </Badge>
  );
};

export default Chip;
