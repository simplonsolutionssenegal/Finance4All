/**
 * @jest-environment jsdom
 */

import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import PdfViewer from '@/components/learning/PdfViewer';

const getDocumentMock = jest.fn();
const GlobalWorkerOptions = { workerSrc: '' };

jest.mock(
  '/pdfjs/pdf.mjs',
  () => ({
    __esModule: true,
    getDocument: (...args: unknown[]) => getDocumentMock(...args),
    GlobalWorkerOptions,
  }),
  { virtual: true }
);

describe('PdfViewer', () => {
  beforeAll(() => {
    // Canvas context mock
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: jest.fn(() => ({})),
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('charge un PDF, applique la progression et permet la navigation', async () => {
    const renderTask = { promise: Promise.resolve(), cancel: jest.fn() };
    const page = {
      getViewport: jest.fn(() => ({ width: 200, height: 300 })),
      render: jest.fn(() => renderTask),
    };
    const pdfDoc = {
      numPages: 3,
      getPage: jest.fn(() => Promise.resolve(page)),
      destroy: jest.fn(),
    };

    getDocumentMock.mockReturnValueOnce({
      promise: Promise.resolve(pdfDoc),
      destroy: jest.fn(),
    });

    const updateProgress = jest.fn();

    render(
      <PdfViewer
        url='https://cdn.test/doc.pdf'
        title='Doc'
        progress={{ currentPosition: 2, duration: 3 }}
        updateProgress={updateProgress}
      />
    );

    await waitFor(() => expect(screen.getByText(/Page 2/)).toBeInTheDocument());
    expect(getDocumentMock).toHaveBeenCalledWith({ url: 'https://cdn.test/doc.pdf' });

    const nextButton = screen.getByRole('button', { name: /Suivant/i });
    fireEvent.click(nextButton);

    await waitFor(() => expect(screen.getByText(/Page 3/)).toBeInTheDocument());

    const buttons = screen.getAllByRole('button');
    const prevButton = buttons[0];
    const zoomOut = buttons[2];
    const zoomIn = buttons[3];

    fireEvent.click(prevButton);
    await waitFor(() => expect(screen.getByText(/Page 2/)).toBeInTheDocument());

    expect(screen.getByText('100%')).toBeInTheDocument();
    fireEvent.click(zoomIn);
    expect(screen.getByText('110%')).toBeInTheDocument();
    fireEvent.click(zoomOut);
    expect(screen.getByText('100%')).toBeInTheDocument();

    expect(updateProgress).toHaveBeenCalled();
  });

  it('affiche une erreur si le chargement échoue', async () => {
    getDocumentMock.mockReturnValueOnce({
      promise: Promise.reject(new Error('Load error')),
    });

    render(
      <PdfViewer
        url='https://cdn.test/error.pdf'
        title='Erreur'
        progress={null}
        updateProgress={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger le PDF/i)).toBeInTheDocument();
    });
  });

  it('affiche une erreur si le rendu échoue', async () => {
    const renderTask = { promise: Promise.reject(new Error('Render failed')), cancel: jest.fn() };
    const page = {
      getViewport: jest.fn(() => ({ width: 200, height: 300 })),
      render: jest.fn(() => renderTask),
    };
    const pdfDoc = {
      numPages: 1,
      getPage: jest.fn(() => Promise.resolve(page)),
      destroy: jest.fn(),
    };

    getDocumentMock.mockReturnValueOnce({
      promise: Promise.resolve(pdfDoc),
      destroy: jest.fn(),
    });

    render(
      <PdfViewer
        url='https://cdn.test/render-error.pdf'
        title='Erreur rendu'
        progress={null}
        updateProgress={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Impossible de charger le PDF/i)).toBeInTheDocument();
    });
  });

  it('nettoie et détruit le document si démonté avant la fin du chargement', async () => {
    const doc = {
      numPages: 1,
      getPage: jest.fn(),
      destroy: jest.fn(),
    };
    let resolveDoc: ((value: typeof doc) => void) | undefined;

    const loadingPromise = new Promise<typeof doc>(resolve => {
      resolveDoc = resolve;
    });

    getDocumentMock.mockReturnValueOnce({
      promise: loadingPromise,
      destroy: jest.fn(),
    });

    const { unmount } = render(
      <PdfViewer
        url='https://cdn.test/pending.pdf'
        title='Pending'
        progress={null}
        updateProgress={jest.fn()}
      />
    );

    unmount();

    await act(async () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      resolveDoc!(doc);
      await Promise.resolve();
    });

    await waitFor(() => expect(doc.destroy).toHaveBeenCalled());
  });
});
