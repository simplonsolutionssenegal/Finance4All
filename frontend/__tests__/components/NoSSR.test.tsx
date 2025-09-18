import { render, screen, waitFor } from '@testing-library/react';
import NoSSR from '@/components/NoSSR';

describe('NoSSR', () => {
  it('renders children after mounting', async () => {
    render(
      <NoSSR fallback={<div>Loading...</div>}>
        <div>Main Content</div>
      </NoSSR>
    );

    // Wait for useEffect to run and component to mount
    await waitFor(() => {
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  it('renders children when no fallback is provided after mounting', async () => {
    render(
      <NoSSR>
        <div>Main Content</div>
      </NoSSR>
    );

    await waitFor(() => {
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });
  });

  it('handles complex children content', async () => {
    render(
      <NoSSR fallback={<div>Loading complex content...</div>}>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Click me</button>
        </div>
      </NoSSR>
    );

    // After mounting shows all children
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });
  });

  it('handles JSX fallback content', async () => {
    render(
      <NoSSR
        fallback={
          <div className="loading">
            <span>Please wait...</span>
            <div>Loading...</div>
          </div>
        }
      >
        <div>Loaded Content</div>
      </NoSSR>
    );

    // After mounting shows main content
    await waitFor(() => {
      expect(screen.getByText('Loaded Content')).toBeInTheDocument();
    });
  });

  it('preserves children props and attributes after mounting', async () => {
    render(
      <NoSSR>
        <div data-testid="main-content" className="content">
          Main Content
        </div>
      </NoSSR>
    );

    await waitFor(() => {
      const content = screen.getByTestId('main-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('content');
      expect(content).toHaveTextContent('Main Content');
    });
  });

  it('handles empty children', async () => {
    const { container } = render(
      <NoSSR fallback={<div>Loading...</div>}>
        {null}
      </NoSSR>
    );

    await waitFor(() => {
      // Should render component without errors
      expect(container).toBeInTheDocument();
    }, { timeout: 100 });
  });

  it('handles string children', async () => {
    render(
      <NoSSR fallback={<div>Loading...</div>}>
        Just a string
      </NoSSR>
    );

    await waitFor(() => {
      expect(screen.getByText('Just a string')).toBeInTheDocument();
    });
  });

  it('handles number children', async () => {
    render(
      <NoSSR fallback={<div>Loading...</div>}>
        {42}
      </NoSSR>
    );

    await waitFor(() => {
      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  it('accepts NoSSRProps interface', () => {
    const TestComponent = () => (
      <NoSSR fallback={<div>Fallback</div>}>
        <div>Child</div>
      </NoSSR>
    );

    expect(() => render(<TestComponent />)).not.toThrow();
  });

  it('works with no props other than children', () => {
    expect(() =>
      render(
        <NoSSR>
          <div>Test</div>
        </NoSSR>
      )
    ).not.toThrow();
  });
});