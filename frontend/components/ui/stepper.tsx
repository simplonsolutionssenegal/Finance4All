
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Step {
    id: number;
    title: string;
    icon: React.ElementType;
}

interface StepperProps {
  currentStep: number;
  steps: Step[];
  className?: string;
}

export function Stepper({ currentStep, steps, className }: StepperProps) {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
        {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
                <React.Fragment key={step.id}>
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isActive ? 'bg-primary/10 text-primary' : 
                        isCompleted ? 'bg-green-600/10 text-green-600' : 
                        'bg-muted/30 text-muted-foreground'
                    }`}>
                        <StepIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                </React.Fragment>
            );
        })}
    </div>
  );
}
