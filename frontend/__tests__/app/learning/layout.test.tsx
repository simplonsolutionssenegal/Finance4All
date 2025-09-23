import { render, screen } from '@testing-library/react';

import LearningLayout from '@/app/learning/layout';

describe('LearningLayout', () => {
  it('renders the learning layout', () => {
    render(<LearningLayout />);

    expect(screen.getByText('Layout de la partie formation')).toBeInTheDocument();
  });

  it('renders a div element', () => {
    const { container } = render(<LearningLayout />);

    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    expect(container.firstChild).toHaveTextContent('Layout de la partie formation');
  });

  it('matches snapshot', () => {
    const { container } = render(<LearningLayout />);

    expect(container).toMatchSnapshot();
  });
});
