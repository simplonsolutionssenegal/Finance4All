// frontend/components/ui/Chip.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chip from '@/components/admin/institutions/Chip';

// Mock du Badge component
jest.mock('@/components/ui/badge', () => ({
  Badge: ({
    children,
    className,
    onClick,
    role,
    tabIndex,
    onKeyDown,
    ...props
  }: React.HTMLAttributes<HTMLDivElement> & {
    variant?: string;
    children: React.ReactNode;
    role?: string;
    tabIndex?: number;
  }) => (
    <div
      className={className}
      onClick={onClick}
      {...(role && { role })}
      {...(tabIndex !== undefined && { tabIndex })}
      onKeyDown={onKeyDown}
      data-testid='badge'
      {...props}
    >
      {children}
    </div>
  ),
}));

describe('Chip Component', () => {
  describe('Rendering', () => {
    it('should render with children text', () => {
      render(<Chip>Test Chip</Chip>);
      expect(screen.getByText('Test Chip')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      const icon = <span data-testid='test-icon'>🔥</span>;
      render(<Chip icon={icon}>With Icon</Chip>);

      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Chip className='custom-class'>Test</Chip>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('should apply aria-label when provided', () => {
      render(<Chip ariaLabel='Custom label'>Test</Chip>);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Chip variant='default'>Default</Chip>);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('should render secondary variant', () => {
      const { container } = render(<Chip variant='secondary'>Secondary</Chip>);
      const badge = container.querySelector('[variant="secondary"]');
      expect(badge).toBeInTheDocument();
    });

    it('should render outline variant', () => {
      const { container } = render(<Chip variant='outline'>Outline</Chip>);
      const badge = container.querySelector('[variant="outline"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Interactive behavior', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn();
      render(<Chip onClick={handleClick}>Clickable</Chip>);

      fireEvent.click(screen.getByText('Clickable'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should have button role when onClick is provided', () => {
      const handleClick = jest.fn();
      render(<Chip onClick={handleClick}>Button Chip</Chip>);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('role', 'button');
    });

    it('should have tabIndex 0 when onClick is provided', () => {
      const handleClick = jest.fn();
      render(<Chip onClick={handleClick}>Focusable</Chip>);

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('tabIndex', '0');
    });

    it('should not have button role when onClick is not provided', () => {
      render(<Chip>Non-interactive</Chip>);

      const badge = screen.getByTestId('badge');
      expect(badge).not.toHaveAttribute('role');
    });

    it('should not have tabIndex when onClick is not provided', () => {
      render(<Chip>Non-interactive</Chip>);

      const badge = screen.getByTestId('badge');
      expect(badge).not.toHaveAttribute('tabIndex');
    });
  });

  describe('Keyboard interactions', () => {
    it('should call onClick when Enter key is pressed', () => {
      const handleClick = jest.fn();
      render(<Chip onClick={handleClick}>Keyboard</Chip>);

      const badge = screen.getByTestId('badge');
      fireEvent.keyDown(badge, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick when Space key is pressed', () => {
      const handleClick = jest.fn();
      render(<Chip onClick={handleClick}>Keyboard</Chip>);

      const badge = screen.getByTestId('badge');
      fireEvent.keyDown(badge, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick for other keys', () => {
      const handleClick = jest.fn();
      render(<Chip onClick={handleClick}>Keyboard</Chip>);

      const badge = screen.getByTestId('badge');
      fireEvent.keyDown(badge, { key: 'A' });
      fireEvent.keyDown(badge, { key: 'Escape' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not respond to keyboard when not interactive', () => {
      const handleClick = jest.fn();
      render(<Chip>Non-interactive</Chip>);

      const badge = screen.getByTestId('badge');
      fireEvent.keyDown(badge, { key: 'Enter' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should prevent default behavior on Enter/Space', () => {
      const handleClick = jest.fn();
      render(<Chip onClick={handleClick}>Keyboard</Chip>);

      const badge = screen.getByTestId('badge');
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');

      fireEvent(badge, event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Icon rendering', () => {
    it('should render icon with correct spacing', () => {
      const icon = <span data-testid='icon'>✓</span>;
      render(<Chip icon={icon}>With Icon</Chip>);

      const iconWrapper = screen.getByTestId('icon').parentElement;
      expect(iconWrapper).toHaveClass('mr-1.5');
      expect(iconWrapper).toHaveClass('inline-flex');
      expect(iconWrapper).toHaveClass('items-center');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable when interactive', () => {
      const handleClick = jest.fn();
      render(<Chip onClick={handleClick}>Accessible</Chip>);

      const badge = screen.getByTestId('badge');
      badge.focus();

      expect(badge).toHaveFocus();
    });

    it('should have proper ARIA attributes for button', () => {
      const handleClick = jest.fn();
      render(
        <Chip onClick={handleClick} ariaLabel='Delete tag'>
          Tag
        </Chip>
      );

      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('role', 'button');
      expect(badge).toHaveAttribute('aria-label', 'Delete tag');
    });
  });
});
