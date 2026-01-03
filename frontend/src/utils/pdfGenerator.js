import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function genererPDF(facture) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;

  // --- SOLUTION AU BUG DU SLASH (/) ---
  // On formate manuellement le nombre pour éviter l'espace insécable buggé de jsPDF
  const formatPrix = (montant) => {
    if (!montant && montant !== 0) return "0 F";
    return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " F";
  };

  // --- EN-TÊTE ---
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text(facture.entreprise.nom || '', margin, yPos);
  
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont('helvetica', 'normal');
  yPos += 7;
  if (facture.entreprise.telephone) {
    doc.text(`Tél: ${facture.entreprise.telephone}`, margin, yPos);
    yPos += 5;
  }
  
  doc.setDrawColor(230);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // --- INFOS FACTURE ---
  yPos += 12;
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('FACTURE', margin, yPos);
  
  doc.setFontSize(9);
  doc.text(`N° : ${facture.numero}`, margin, yPos + 7);
  const dateStr = new Date(facture.date).toLocaleDateString('fr-FR');
  doc.text(`Date : ${dateStr}`, margin, yPos + 12);

  // --- TABLEAU (SANS DÉBORDEMENT) ---
  const corpsTableau = facture.produits.map(p => [
    p.nom,
    p.quantite,
    formatPrix(p.prixUnitaire),
    formatPrix(p.total)
  ]);

  autoTable(doc, {
    startY: yPos + 20,
    head: [['Produit', 'Qté', 'Prix Unitaire', 'Total']],
    body: corpsTableau,
    theme: 'grid',
    headStyles: { 
      fillColor: [245, 245, 245], // Gris très clair
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 9
    },
    styles: { 
      fontSize: 8.5, 
      cellPadding: 3,
      lineColor: [230, 230, 230],
      overflow: 'linebreak' // Empêche le texte de déborder, il va à la ligne
    },
    columnStyles: {
      0: { cellWidth: 'auto' }, // Le produit prend la place restante
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 35, fontStyle: 'bold' }
    },
    margin: { left: margin, right: margin },
    didDrawPage: (data) => { yPos = data.cursor.y; }
  });

  // --- TOTAUX (SANS ESPACE DE SIGNATURE) ---
  let finalY = doc.lastAutoTable.finalY + 10;
  const rightAlignX = pageWidth - margin;

  // Sécurité saut de page
  if (finalY > 270) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sous-total:', rightAlignX - 50, finalY);
  doc.text(formatPrix(facture.sousTotal), rightAlignX, finalY, { align: 'right' });

  finalY += 8;
  doc.setLineWidth(0.3);
  doc.setDrawColor(0);
  // Rectangle pour le TOTAL NET
  doc.rect(rightAlignX - 55, finalY - 5, 55, 10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL NET', rightAlignX - 52, finalY + 2);
  doc.text(formatPrix(facture.totalGeneral), rightAlignX - 2, finalY + 2, { align: 'right' });

  // --- PIED DE PAGE ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, 288, { align: 'center' });
  }

  doc.save(`Facture_${facture.numero}.pdf`);
}