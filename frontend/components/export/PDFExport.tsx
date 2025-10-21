import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import React from 'react';

import { formatCurrency, formatPercentage } from '../../lib/formatters';
import type { FinancialService } from '../../types/FinancialServices';
import { Button } from '../ui/button';

interface PDFExportProps {
  services: FinancialService[];
  searchTerm?: string;
  totalResults: number;
}

export const PDFExport: React.FC<PDFExportProps> = ({ services, searchTerm, totalResults }) => {
  const generatePDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Header with colored bar
    const headerHeight = 40;
    pdf.setFillColor(20, 184, 166);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    pdf.setFontSize(20);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Finance4ALL', 20, 26);

    // Title area
    pdf.setFontSize(14);
    pdf.setTextColor(34, 34, 34);
    pdf.text('Rapport des Services Financiers', 20, headerHeight + 18);

    // Informations générales (muted)
    pdf.setFontSize(10);
    pdf.setTextColor(110, 110, 110);
    pdf.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 70, headerHeight + 6);
    pdf.text(`Résultats: ${totalResults}`, pageWidth - 70, headerHeight + 16);
    if (searchTerm) {
      pdf.text(`Recherche: ${searchTerm}`, pageWidth - 70, headerHeight + 26);
    }

    // Separator
    pdf.setDrawColor(220, 220, 220);
    pdf.line(20, headerHeight + 34, pageWidth - 20, headerHeight + 34);

    let yPosition = headerHeight + 50;
    const cardPadding = 8;
    const cardHeight = 60; // approximate per service card
    const maxServicesPerPage = Math.floor((pageHeight - (yPosition + 30)) / (cardHeight + 10));

    for (const [index, service] of services.slice(0, 20).entries()) {
      // Nouvelle page si nécessaire
      if (index > 0 && index % maxServicesPerPage === 0) {
        pdf.addPage();
        yPosition = 30;
      }

      // Titre du service
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(service.designation, 20, yPosition);

      // Draw a card background
      const cardX = 20;
      const cardWidth = pageWidth - 40;
      pdf.setDrawColor(230, 230, 230);
      pdf.setFillColor(250, 250, 250);
      pdf.roundedRect(cardX, yPosition - cardPadding, cardWidth, cardHeight, 4, 4, 'F');

      // Title
      pdf.setFontSize(12);
      pdf.setTextColor(20, 20, 20);
      pdf.setFont('helvetica', 'bold');
      // wrap designation if needed
      const maxTextWidth = cardWidth - cardPadding * 2;
      const designationLines = pdf.splitTextToSize(service.designation, maxTextWidth);
      pdf.text(designationLines, cardX + cardPadding, yPosition + 4);

      // Détails du service (muted)
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const institutionLabel =
        typeof service.institution === 'string'
          ? service.institution
          : (service.institution?.name ?? service.institutionId ?? 'N/A');
      const maxAmountLabel = service.maxAmount == null ? '—' : formatCurrency(service.maxAmount);
      const interestRateLabel =
        service.interestRate == null ? '—' : formatPercentage(service.interestRate);

      const detailStartY = yPosition + 12 + designationLines.length * 6;
      pdf.text(`Institution: ${institutionLabel}`, cardX + cardPadding, detailStartY);
      pdf.text(`Type: ${service.type}`, cardX + cardPadding + 90, detailStartY);
      pdf.text(`Montant max: ${maxAmountLabel}`, cardX + cardPadding, detailStartY + 8);
      pdf.text(`Taux: ${interestRateLabel}`, cardX + cardPadding + 90, detailStartY + 8);

      yPosition += cardHeight + 12;
    }

    // Pied de page (numérotation)
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i} sur ${totalPages}`, pageWidth - 50, pageHeight - 10);
      pdf.text('Généré par Finance4ALL', 20, pageHeight - 10);
    }

    // Téléchargement
    pdf.save(`services-financiers-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportTableAsPDF = async () => {
    const tableElement = document.getElementById('services-table');
    if (!tableElement) {
      await generatePDF();
      return;
    }

    try {
      const canvas = await html2canvas(tableElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // En-tête
      pdf.setFontSize(16);
      pdf.text('Finance4ALL - Services Financiers', 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 30);

      position = 40;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - position;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 40;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`tableau-services-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      await generatePDF();
    }
  };

  return (
    <Button variant='outline' icon={Download} onClick={exportTableAsPDF} className='ml-2'>
      Exporter PDF
    </Button>
  );
};
