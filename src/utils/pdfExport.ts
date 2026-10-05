import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Transaction, Category, FinanceSummary } from '../types/finance';

interface PDFExportData {
  transactions: Transaction[];
  categories: Category[];
  summary: FinanceSummary;
  currency: string;
}

export const generatePDFReport = ({ transactions, categories, summary, currency }: PDFExportData) => {
  const doc = new jsPDF();

  const categoryMap = new Map<string, Category>();
  categories.forEach(c => categoryMap.set(c.id, c));

  const generatedDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Luxury Dark Emerald Header
  doc.setFillColor(8, 20, 14); // Deep Emerald Slate
  doc.rect(0, 0, 210, 42, 'F');

  doc.setTextColor(240, 245, 241);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Finance Flow • Financial Intelligence Report', 14, 22);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(183, 228, 199); // Celadon Light
  doc.text(`Generated on: ${generatedDate} | Currency: INR (${currency}) | Enterprise Suite`, 14, 32);

  // Summary Metrics Section
  let y = 52;

  doc.setTextColor(8, 20, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Executive Financial Outflow Summary', 14, y);

  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Spend Recorded: ${currency}${summary.totalSpent.toLocaleString('en-IN')}`, 14, y);
  doc.text(`Total Transactions Logged: ${summary.transactionCount}`, 120, y);

  y += 6;
  doc.text(`Digital / UPI Outflow: ${currency}${summary.onlineTotal.toLocaleString('en-IN')} (${summary.onlinePercentage}%)`, 14, y);
  doc.text(`Physical Cash Outflow: ${currency}${summary.cashTotal.toLocaleString('en-IN')} (${summary.cashPercentage}%)`, 120, y);

  // Category Breakdown Table
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Category Outflow Breakdown & Budgets', 14, y);

  const categoryRows = categories.map(cat => {
    const catTxs = transactions.filter(t => t.categoryId === cat.id);
    const amount = catTxs.reduce((sum, t) => sum + t.amount, 0);
    const percentage = summary.totalSpent > 0 ? Math.round((amount / summary.totalSpent) * 100) : 0;
    const limit = cat.budgetLimit || 10000;
    const utilization = Math.round((amount / limit) * 100);
    return [
      cat.name,
      catTxs.length.toString(),
      `${currency}${amount.toLocaleString('en-IN')}`,
      `${currency}${limit.toLocaleString('en-IN')}`,
      `${utilization}%`,
      `${percentage}%`
    ];
  }).filter(row => parseInt(row[1]) > 0);

  autoTable(doc, {
    startY: y + 4,
    head: [['Category Name', 'Tx Count', `Spent (${currency})`, `Budget (${currency})`, 'Utilization', 'Share %']],
    body: categoryRows.length > 0 ? categoryRows : [['No transactions recorded', '0', `${currency}0`, `${currency}10,000`, '0%', '0%']],
    theme: 'grid',
    headStyles: { fillColor: [45, 106, 79], textColor: [240, 245, 241], fontStyle: 'bold' },
    styles: { fontSize: 8.5 }
  });

  // Detailed Transaction Logs Table
  // @ts-expect-error autoTable lastAutoTable property
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : y + 40;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Detailed Spending Logs', 14, finalY);

  const transactionRows = transactions.map(tx => {
    const cat = categoryMap.get(tx.categoryId);
    const formattedDate = new Date(tx.date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    return [
      formattedDate,
      tx.time || '-',
      tx.merchant,
      tx.description || '-',
      cat ? cat.name : tx.categoryId,
      tx.paymentMethod.toUpperCase(),
      `-${currency}${tx.amount.toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: finalY + 4,
    head: [['Date', 'Time', 'Vendor (Where)', 'Notes (Why)', 'Category', 'Mode', 'Amount']],
    body: transactionRows.length > 0 ? transactionRows : [['-', '-', 'No transactions logged yet', '-', '-', '-', `${currency}0`]],
    theme: 'striped',
    headStyles: { fillColor: [64, 145, 108], textColor: [240, 245, 241], fontStyle: 'bold' },
    styles: { fontSize: 8 }
  });

  // Save the generated PDF
  doc.save(`FinanceFlow_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
