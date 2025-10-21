import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mocks for external heavy libraries
const saveMock = jest.fn();
const addImageMock = jest.fn();

jest.mock('html2canvas', () => {
  return {
    __esModule: true,
    default: jest.fn().mockResolvedValue({
      width: 1000,
      height: 500,
      toDataURL: () => 'data:image/png;base64,TEST',
    }),
  };
});

jest.mock('jspdf', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      internal: { pageSize: { getWidth: () => 210, getHeight: () => 295 } },
      setFontSize: jest.fn(),
      setFillColor: jest.fn(),
      setTextColor: jest.fn(),
      text: jest.fn(),
      setFont: jest.fn(),
      rect: jest.fn(),
      roundedRect: jest.fn(),
      line: jest.fn(),
      addPage: jest.fn(),
      getNumberOfPages: jest.fn().mockReturnValue(1),
      splitTextToSize: jest.fn().mockImplementation((text: any) => {
        // return array of lines; if already an array return as-is
        if (Array.isArray(text)) return text;
        return String(text).split(/\n|\r\n|\r/);
      }),
      setPage: jest.fn(),
      setDrawColor: jest.fn(),
      save: saveMock,
      addImage: addImageMock,
    })),
  };
});

import html2canvas from 'html2canvas';
import { PDFExport } from '@/components/export/PDFExport';

const mockServices = [
  {
    id: '1',
    designation: 'Epargne Plus',
    // institution previously a string in tests; real type is an object with name
    institution: { id: 'bank-a', name: 'Bank A' },
    institutionId: 'bank-a',
    type: 'Epargne',
    maxAmount: 500000,
    interestRate: 0.05,
  },
];

describe('PDFExport component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the export button', () => {
    render(<PDFExport services={[]} totalResults={0} />);
    expect(screen.getByText('Exporter PDF')).toBeInTheDocument();
  });

  it('generates a PDF via jsPDF when no #services-table in the DOM', async () => {
    render(<PDFExport services={mockServices as any} totalResults={1} />);
    const user = userEvent.setup();

    await user.click(screen.getByText('Exporter PDF'));

    await waitFor(() => expect(saveMock).toHaveBeenCalled());

    // Filename should match the services-financiers-YYYY-MM-DD.pdf pattern (refactor changed naming)
    expect(saveMock.mock.calls[0][0]).toMatch(/services-financiers-\d{4}-\d{2}-\d{2}\.pdf/);
  });

  it('uses html2canvas and embeds image when #services-table exists', async () => {
    // create a fake table element in the DOM
    const table = document.createElement('div');
    table.id = 'services-table';
    document.body.appendChild(table);

    render(<PDFExport services={mockServices as any} totalResults={1} />);
    const user = userEvent.setup();

    await user.click(screen.getByText('Exporter PDF'));

    await waitFor(() =>
      expect(html2canvas as jest.Mock).toHaveBeenCalledWith(table, expect.any(Object))
    );

    // addImage should have been called to embed the canvas image
    expect(addImageMock).toHaveBeenCalled();

    // save should be called with the table filename (refactor changed 'produits' -> 'services' and 'tableau' -> 'tableau-services')
    await waitFor(() =>
      expect(saveMock).toHaveBeenCalledWith(
        expect.stringMatching(/tableau-services-\d{4}-\d{2}-\d{2}\.pdf/)
      )
    );

    table.remove();
  });
});
