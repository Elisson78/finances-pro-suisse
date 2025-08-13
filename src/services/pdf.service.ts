import jsPDF from 'jspdf';

interface FactureData {
  numero_facture: string;
  client_name: string;
  date: string;
  echeance: string;
  articles: Array<{
    description: string;
    qty: number;
    price: number;
  }>;
  subtotal: number;
  tva: number;
  total: number;
  statut: string;
}

interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
}

export class PDFService {
  private static defaultCompanyInfo: CompanyInfo = {
    name: 'FinancesPro Suisse',
    address: 'Rue de Genève 123',
    city: '1000 Genève, Suisse',
    phone: '+41 22 123 45 67',
    email: 'contact@financespro.ch',
    website: 'www.financespro.ch'
  };

  static generateInvoicePDF(facture: FactureData, companyInfo: CompanyInfo = this.defaultCompanyInfo): void {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    
    // Configurações de cores
    const primaryColor = '#DC2626'; // Vermelho FinancesPro
    const darkGray = '#374151';
    const lightGray = '#6B7280';
    
    // Título da empresa
    pdf.setFontSize(24);
    pdf.setTextColor(primaryColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(companyInfo.name, margin, 30);
    
    // Informações da empresa
    pdf.setFontSize(10);
    pdf.setTextColor(lightGray);
    pdf.setFont('helvetica', 'normal');
    let yPos = 45;
    pdf.text(companyInfo.address, margin, yPos);
    yPos += 5;
    pdf.text(companyInfo.city, margin, yPos);
    yPos += 5;
    pdf.text(`Tél: ${companyInfo.phone}`, margin, yPos);
    yPos += 5;
    pdf.text(`Email: ${companyInfo.email}`, margin, yPos);
    if (companyInfo.website) {
      yPos += 5;
      pdf.text(`Web: ${companyInfo.website}`, margin, yPos);
    }
    
    // Título FACTURE
    pdf.setFontSize(28);
    pdf.setTextColor(darkGray);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FACTURE', pageWidth - 80, 40);
    
    // Número da fatura
    pdf.setFontSize(12);
    pdf.setTextColor(lightGray);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`N° ${facture.numero_facture}`, pageWidth - 80, 50);
    
    // Data e vencimento
    pdf.text(`Date: ${this.formatDate(facture.date)}`, pageWidth - 80, 60);
    pdf.text(`Échéance: ${this.formatDate(facture.echeance)}`, pageWidth - 80, 70);
    
    // Status
    pdf.setFontSize(10);
    const statusColor = this.getStatusColor(facture.statut);
    pdf.setTextColor(statusColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Statut: ${facture.statut.toUpperCase()}`, pageWidth - 80, 80);
    
    // Informações do cliente
    yPos = 100;
    pdf.setFontSize(14);
    pdf.setTextColor(darkGray);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FACTURÉ À:', margin, yPos);
    
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(facture.client_name, margin, yPos);
    
    // Linha separadora
    yPos += 20;
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    
    // Cabeçalho da tabela de artigos
    yPos += 15;
    pdf.setFontSize(10);
    pdf.setTextColor(darkGray);
    pdf.setFont('helvetica', 'bold');
    
    // Fundo do cabeçalho
    pdf.setFillColor(248, 250, 252);
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 12, 'F');
    
    pdf.text('DESCRIPTION', margin + 5, yPos + 3);
    pdf.text('QTÉ', pageWidth - 120, yPos + 3);
    pdf.text('PRIX UNIT.', pageWidth - 80, yPos + 3);
    pdf.text('TOTAL', pageWidth - 40, yPos + 3);
    
    // Linha após cabeçalho
    yPos += 10;
    pdf.setDrawColor(220, 220, 220);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    
    // Artigos
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(darkGray);
    
    facture.articles.forEach((article) => {
      const total = article.qty * article.price;
      
      pdf.text(article.description, margin + 5, yPos);
      pdf.text(article.qty.toString(), pageWidth - 120, yPos);
      pdf.text(`${article.price.toFixed(2)} CHF`, pageWidth - 80, yPos);
      pdf.text(`${total.toFixed(2)} CHF`, pageWidth - 40, yPos);
      
      yPos += 8;
    });
    
    // Linha antes dos totais
    yPos += 5;
    pdf.setDrawColor(220, 220, 220);
    pdf.line(pageWidth - 150, yPos, pageWidth - margin, yPos);
    
    // Totais
    yPos += 15;
    pdf.setFont('helvetica', 'normal');
    
    // Subtotal
    pdf.text('Sous-total HT:', pageWidth - 100, yPos);
    pdf.text(`${facture.subtotal.toFixed(2)} CHF`, pageWidth - 40, yPos);
    
    yPos += 10;
    // TVA
    pdf.text('TVA (7.7%):', pageWidth - 100, yPos);
    pdf.text(`${facture.tva.toFixed(2)} CHF`, pageWidth - 40, yPos);
    
    yPos += 15;
    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('TOTAL TTC:', pageWidth - 100, yPos);
    pdf.text(`${facture.total.toFixed(2)} CHF`, pageWidth - 40, yPos);
    
    // Linha para destacar o total
    pdf.setDrawColor(primaryColor);
    pdf.setLineWidth(1);
    pdf.line(pageWidth - 150, yPos + 3, pageWidth - margin, yPos + 3);
    
    // Informações de pagamento
    yPos += 30;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(darkGray);
    pdf.text('INFORMATIONS DE PAIEMENT', margin, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(lightGray);
    pdf.text('• Paiement par virement bancaire ou QR-Bill', margin, yPos);
    yPos += 6;
    pdf.text('• Délai de paiement: 30 jours', margin, yPos);
    yPos += 6;
    pdf.text('• Intérêts de retard: 5% par an', margin, yPos);
    
    // Footer
    const footerY = pageHeight - 30;
    pdf.setFontSize(8);
    pdf.setTextColor(lightGray);
    pdf.text('Merci pour votre confiance! | TVA: CHE-123.456.789', margin, footerY);
    pdf.text(`Generated on ${new Date().toLocaleDateString('fr-CH')}`, pageWidth - 60, footerY);
    
    // Télécharger le PDF
    const fileName = `Facture_${facture.numero_facture}_${facture.client_name.replace(/\s+/g, '_')}.pdf`;
    pdf.save(fileName);
  }
  
  private static formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-CH');
  }
  
  private static getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'payée':
        return '#059669'; // Green
      case 'envoyée':
        return '#2563EB'; // Blue
      case 'brouillon':
        return '#6B7280'; // Gray
      default:
        return '#6B7280';
    }
  }
} 