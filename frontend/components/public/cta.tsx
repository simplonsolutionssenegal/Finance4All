import Link from 'next/link';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CtaButton = {
  label: string;
  href: string;
  variant?: 'solid' | 'outline';
  icon?: ReactNode;
  className?: string;
};

type CtaProps = {
  title: ReactNode;
  description?: ReactNode;
  buttons?: CtaButton[];
  topContent?: ReactNode;
  bottomContent?: ReactNode;
  backgroundDecorations?: ReactNode;
  dataTestId?: string;
  sectionClassName?: string;
  containerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
};

export default function Cta({
  title,
  description,
  buttons = [],
  topContent,
  bottomContent,
  backgroundDecorations,
  dataTestId,
  sectionClassName,
  containerClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: CtaProps) {
  const actions = buttons.slice(0, 2);

  return (
    <section
      data-testid={dataTestId}
      className={cn('py-16 md:py-20 px-6 lg:px-8 bg-primary-400', sectionClassName)}
    >
      {backgroundDecorations}
      <div className={cn('max-w-5xl mx-auto text-center text-white', containerClassName)}>
        {topContent}
        <h2 className={cn('text-3xl sm:text-4xl font-semibold', titleClassName)}>{title}</h2>

        {description ? (
          <p className={cn('mt-2 text-white/90', descriptionClassName)}>{description}</p>
        ) : null}

        {actions.length > 0 ? (
          <div
            className={cn('mt-6 flex justify-center flex-col sm:flex-row gap-4', actionsClassName)}
          >
            {actions.map((action, idx) => (
              <Link key={`${action.href}-${idx}`} href={action.href}>
                <Button
                  variant={action.variant === 'outline' ? 'outline' : 'default'}
                  className={cn(
                    action.variant === 'outline'
                      ? 'border-white text-primary-400'
                      : 'bg-white text-primary-400 shadow-lg',
                    'h-11 inline-flex items-center gap-2',
                    action.className
                  )}
                >
                  {action.label}
                  {action.icon}
                </Button>
              </Link>
            ))}
          </div>
        ) : null}
        {bottomContent}
      </div>
    </section>
  );
}
