import { Check } from 'lucide-react';
import React from 'react';

interface StepProgressIndicatorProps {
  currentStep: number;
  /** Nombre total d'étapes. Si omis, déduit de labels.length ou 3 par défaut */
  totalSteps?: number;
  /** Tableau de libellés personnalisés. Si fourni, sa longueur peut définir totalSteps */
  labels?: string[];
  className?: string;
}

const DEFAULT_LABELS = ['Informations', 'Contact', 'Zones'];

export const StepProgressIndicator: React.FC<StepProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  labels,
  className = ''
}) => {
  const effectiveLabels = labels && labels.length > 0 ? labels : DEFAULT_LABELS;
  const steps = totalSteps ?? effectiveLabels.length ?? 3;

  return (
    <ul className={`flex justify-between px-6 py-1 relative ${className}`} aria-label='Progression des étapes'>
      {Array.from({ length: steps }, (_, i) => i + 1).map(step => {
        let stepClass = 'bg-transparent border-gray-500 text-gray-300';
        if (step < currentStep) stepClass = 'bg-teal-500 border-teal-500 text-white';
        else if (step === currentStep) stepClass = 'bg-white border-white text-black font-medium';

        const stepLabel = (effectiveLabels[step - 1] ?? `Étape ${step}`);
        const isCurrent = currentStep === step;
        let ariaStatus = '';
        if (isCurrent) ariaStatus = ' (actuelle)';
        else if (step < currentStep) ariaStatus = ' (terminée)';

        return (
          <li key={step} className='flex flex-col items-center z-10'>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${stepClass}`}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Étape ${step}: ${stepLabel}${ariaStatus}`}
            >
              {step < currentStep ? <Check className='w-4 h-4' /> : step}
            </div>
            <span
              className={`text-xs mt-1 ${isCurrent ? 'text-white font-medium' : 'text-gray-300'}`}
            >
              {stepLabel}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default StepProgressIndicator;
