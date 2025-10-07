import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';
import React from 'react';

import { formatCurrency, formatPercentage } from '../../data/MockData';
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

    // En-tête
    pdf.setFontSize(20);
    pdf.setTextColor(20, 184, 166); // Teal color
    pdf.text('Finance4ALL', 20, 30);

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Rapport des Produits Financiers', 20, 50);

    // Informations générales
    pdf.setFontSize(12);
    pdf.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, 20, 70);
    pdf.text(`Nombre total de résultats: ${totalResults}`, 20, 85);
    if (searchTerm) {
      pdf.text(`Terme de recherche: "${searchTerm}"`, 20, 100);
    }

    // Ligne de séparation
    pdf.setDrawColor(200, 200, 200);
    pdf.line(20, 110, pageWidth - 20, 110);

    let yPosition = 130;
    const lineHeight = 15;
    const maxServicesPerPage = Math.floor((pageHeight - 150) / (lineHeight * 6));

    services.slice(0, 20).forEach((service, index) => {
      // Nouvelle page si nécessaire
      if (index > 0 && index % maxServicesPerPage === 0) {
        pdf.addPage();
        yPosition = 30;
      }

      // Titre du produit
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(service.designation, 20, yPosition);

      // Détails du produit
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Institution: ${service.institution}`, 25, yPosition + lineHeight);
      pdf.text(`Type: ${service.type}`, 25, yPosition + lineHeight * 2);
      pdf.text(`Montant max: ${formatCurrency(service.maxAmount)}`, 25, yPosition + lineHeight * 3);
      pdf.text(`Taux: ${formatPercentage(service.interestRate)}`, 25, yPosition + lineHeight * 4);
      pdf.text(`Remboursement: ${service.reimbursement}`, 25, yPosition + lineHeight * 5);

      yPosition += lineHeight * 7;
    });

    // Pied de page
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(`Page ${i} sur ${totalPages}`, pageWidth - 50, pageHeight - 10);
      pdf.text('Généré par Finance4ALL', 20, pageHeight - 10);
    }

    // Téléchargement
    pdf.save(`produits-financiers-${new Date().toISOString().split('T')[0]}.pdf`);
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
      pdf.text('Finance4ALL - Produits Financiers', 20, 20);
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

      pdf.save(`tableau-produits-${new Date().toISOString().split('T')[0]}.pdf`);
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
