import { render, screen } from '@testing-library/react';

import HomeLearningPage from '@/app/learning/page';

describe('HomeLearningPage', () => {
  it('renders the learning page', () => {
    render(<HomeLearningPage />);

    expect(screen.getByText('Page de formation')).toBeInTheDocument();
  });

  it('renders a div element', () => {
    const { container } = render(<HomeLearningPage />);

    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
    expect(container.firstChild).toHaveTextContent('Page de formation');
  });

  it('matches snapshot', () => {
    const { container } = render(<HomeLearningPage />);

    expect(container).toMatchSnapshot();
  });
});
