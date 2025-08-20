import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../components/Home';

describe('Home', () => {
  it('renders main content', () => {
    render(<Home />);

    const main = screen.getByRole('main');

    expect(main).toBeInTheDocument()
  })
})