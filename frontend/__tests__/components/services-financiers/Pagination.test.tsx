import { render, screen, fireEvent, within, cleanup } from '@testing-library/react';
import * as React from 'react';
import '@testing-library/jest-dom';

import { Pagination } from '@/components/services-financiers/Pagination';

const reactKeyWarningRegex = /Encountered two children with the same key|Keys should be unique/;
let originalConsoleError: typeof console.error;

beforeAll(() => {
  originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const firstArg = String(args[0] ?? '');
    if (reactKeyWarningRegex.test(firstArg)) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

afterEach(() => {
  cleanup();
});

describe('Pagination component', () => {
  test('does not render anything when there is 1 or fewer pages', () => {
    const onPageChange = jest.fn();

    const { container: containerOne } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        totalItems={10}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    expect(containerOne.firstChild).toBeNull();

    const { container: containerZero } = render(
      <Pagination
        currentPage={1}
        totalPages={0}
        totalItems={0}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    expect(containerZero.firstChild).toBeNull();
  });

  test('displays the correct item range and total count', () => {
    const onPageChange = jest.fn();

    const { unmount } = render(
      <Pagination
        currentPage={3}
        totalPages={10}
        totalItems={100}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );

    const affichageNode = screen.getByText(/Affichage de/i);
    const p = affichageNode.closest('p');
    if (!p) throw new Error('Paragraph "Affichage de" not found');
    const pWithin = within(p);

    const startMatches = pWithin.getAllByText('21');
    expect(startMatches.length).toBeGreaterThanOrEqual(1);
    const endMatches = pWithin.getAllByText('30');
    expect(endMatches.length).toBeGreaterThanOrEqual(1);
    const totalMatches = pWithin.getAllByText('100');
    expect(totalMatches.length).toBeGreaterThanOrEqual(1);
    expect(pWithin.getByText(/résultats/i)).toBeInTheDocument();

    unmount();

    render(
      <Pagination
        currentPage={1}
        totalPages={2}
        totalItems={4}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    const affichageNode2 = screen.getByText(/Affichage de/i);
    const p2 = affichageNode2.closest('p');
    if (!p2) throw new Error('Paragraph "Affichage de" not found (scenario 2)');
    const p2Within = within(p2);

    const ones = p2Within.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(1);
    const fours = p2Within.getAllByText('4');
    expect(fours.length).toBeGreaterThanOrEqual(1);
    expect(p2Within.getByText(/résultats/i)).toBeInTheDocument();
  });

  test('previous and next buttons have correct disabled states', () => {
    const onPageChange = jest.fn();

    const { unmount } = render(
      <Pagination
        currentPage={1}
        totalPages={3}
        totalItems={30}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );

    const mobilePrev = screen.getByRole('button', { name: /Précédent/i });
    const mobileNext = screen.getByRole('button', { name: /Suivant/i });
    expect(mobilePrev).toBeDisabled();
    expect(mobileNext).toBeEnabled();

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    const navButtons = within(nav).getAllByRole('button');
    expect(navButtons[0]).toBeDisabled();
    expect(navButtons[navButtons.length - 1]).toBeEnabled();

    unmount();

    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        totalItems={30}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );

    const mobilePrevLast = screen.getByRole('button', { name: /Précédent/i });
    const mobileNextLast = screen.getByRole('button', { name: /Suivant/i });
    expect(mobilePrevLast).toBeEnabled();
    expect(mobileNextLast).toBeDisabled();

    const navLast = screen.getByRole('navigation', { name: 'Pagination' });
    const navButtonsLast = within(navLast).getAllByRole('button');
    expect(navButtonsLast[0]).toBeEnabled();
    expect(navButtonsLast[navButtonsLast.length - 1]).toBeDisabled();
  });

  test('clicking previous and next buttons invokes onPageChange with correct pages', () => {
    const onPageChange = jest.fn();

    render(
      <Pagination
        currentPage={2}
        totalPages={3}
        totalItems={30}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Précédent/i }));
    expect(onPageChange).toHaveBeenCalledTimes(1);
    expect(onPageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: /Suivant/i }));
    expect(onPageChange).toHaveBeenCalledTimes(2);
    expect(onPageChange).toHaveBeenCalledWith(3);

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    const navButtons = within(nav).getAllByRole('button');
    fireEvent.click(navButtons[0]);
    expect(onPageChange).toHaveBeenCalledTimes(3);
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    fireEvent.click(navButtons[navButtons.length - 1]);
    expect(onPageChange).toHaveBeenCalledTimes(4);
    expect(onPageChange).toHaveBeenLastCalledWith(3);
  });

  test('clicking disabled previous and next buttons does not call onPageChange', () => {
    const onPageChange = jest.fn();

    let result = render(
      <Pagination
        currentPage={1}
        totalPages={3}
        totalItems={30}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    result.unmount();

    result = render(
      <Pagination
        currentPage={1}
        totalPages={3}
        totalItems={30}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    const mobilePrev = screen.getByRole('button', { name: /Précédent/i });
    fireEvent.click(mobilePrev);
    expect(onPageChange).not.toHaveBeenCalled();

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    const navButtons = within(nav).getAllByRole('button');
    fireEvent.click(navButtons[0]);
    expect(onPageChange).not.toHaveBeenCalled();

    result.unmount();

    render(
      <Pagination
        currentPage={3}
        totalPages={3}
        totalItems={30}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    const mobileNext = screen.getByRole('button', { name: /Suivant/i });
    fireEvent.click(mobileNext);
    expect(onPageChange).not.toHaveBeenCalled();
    const navLast = screen.getByRole('navigation', { name: 'Pagination' });
    const navButtonsLast = within(navLast).getAllByRole('button');
    fireEvent.click(navButtonsLast[navButtonsLast.length - 1]);
    expect(onPageChange).not.toHaveBeenCalled();
  });

  test('renders correct page numbers when total pages less than or equal to max', () => {
    const onPageChange = jest.fn();

    render(
      <Pagination
        currentPage={2}
        totalPages={4}
        totalItems={40}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    const numericButtons = within(nav)
      .getAllByRole('button')
      .filter(btn => /\d+/.test(btn.textContent || ''));
    const labels = numericButtons.map(btn => btn.textContent);
    expect(labels).toEqual(['1', '2', '3', '4']);

    fireEvent.click(numericButtons[2]);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  test('renders ellipsis and correct page ranges when total pages exceed max', () => {
    const onPageChange = jest.fn();

    let r = render(
      <Pagination
        currentPage={1}
        totalPages={6}
        totalItems={60}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    expect(screen.getAllByText('6').length).toBeGreaterThan(0);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    r.unmount();

    r = render(
      <Pagination
        currentPage={3}
        totalPages={6}
        totalItems={60}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    r.unmount();

    r = render(
      <Pagination
        currentPage={4}
        totalPages={6}
        totalItems={60}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    r.unmount();

    r = render(
      <Pagination
        currentPage={5}
        totalPages={6}
        totalItems={60}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('...').length).toBeGreaterThan(0);
    r.unmount();
  });

  test('renders ellipsis correctly for larger datasets (10 pages)', () => {
    const onPageChange = jest.fn();

    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        totalItems={100}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );

    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('6').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('...').length).toBeGreaterThanOrEqual(2);
  });

  test('page numbers highlight the current page', () => {
    const onPageChange = jest.fn();

    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    const btnThree = within(nav).getByRole('button', { name: '3' });
    expect(btnThree.className).toMatch(/bg-teal-50|text-teal-600/);
  });

  test('clicking numeric page buttons invokes onPageChange with selected page', () => {
    const onPageChange = jest.fn();

    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={50}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );

    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    const pageFourButton = within(nav).getByRole('button', { name: '4' });
    fireEvent.click(pageFourButton);
    expect(onPageChange).toHaveBeenCalledWith(4);

    const pageOneButton = within(nav).getByRole('button', { name: '1' });
    fireEvent.click(pageOneButton);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  test('clicking ellipsis does not trigger onPageChange', () => {
    const onPageChange = jest.fn();

    render(
      <Pagination
        currentPage={4}
        totalPages={7}
        totalItems={70}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );

    const ellipses = screen.getAllByText('...');
    ellipses.forEach(ellipsis => {
      fireEvent.click(ellipsis);
    });
    expect(onPageChange).not.toHaveBeenCalled();
  });

  test('handles edge cases where totalItems or itemsPerPage are zero', () => {
    const onPageChange = jest.fn();

    render(
      <Pagination
        currentPage={1}
        totalPages={2}
        totalItems={0}
        itemsPerPage={10}
        onPageChange={onPageChange}
      />
    );
    const affichageNode = screen.getByText(/Affichage de/i);
    const p = affichageNode.closest('p');
    if (!p) throw new Error('Paragraph "Affichage de" not found (edge case 1)');
    const pWithin = within(p);
    expect(pWithin.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(pWithin.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    expect(pWithin.getByText(/résultats/i)).toBeInTheDocument();

    cleanup();

    render(
      <Pagination
        currentPage={1}
        totalPages={2}
        totalItems={25}
        itemsPerPage={0}
        onPageChange={onPageChange}
      />
    );
    const affichageNode2 = screen.getByText(/Affichage de/i);
    const p2 = affichageNode2.closest('p');
    if (!p2) throw new Error('Paragraph "Affichage de" not found (edge case 2)');
    const p2Within = within(p2);
    expect(p2Within.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(p2Within.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    expect(p2Within.getAllByText('25').length).toBeGreaterThanOrEqual(1);
  });
});
