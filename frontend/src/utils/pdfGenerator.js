import jsPDF from 'jspdf';

/**
 * Génère un PDF à partir d'une facture
 * Format simple et lisible, adapté aux factures
 */
export function genererPDF(facture) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Fonction helper pour ajouter du texte avec gestion de la pagination
  const addText = (text, x, y, options = {}) => {
    const { fontSize = 12, fontStyle = 'normal', align = 'left', color = [0, 0, 0] } = options;
    
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(color[0], color[1], color[2]);
    
    if (align === 'center') {
      const textWidth = doc.getTextWidth(text);
      x = (pageWidth - textWidth) / 2;
    } else if (align === 'right') {
      const textWidth = doc.getTextWidth(text);
      x = pageWidth - margin - textWidth;
    }
    
    doc.text(text, x, y);
    
    return y + fontSize / 3;
  };

  // En-tête avec informations entreprise
  const entreprise = facture.entreprise || {};
  
  if (entreprise.nom) {
    yPos = addText(entreprise.nom, margin, yPos, {
      fontSize: 24,
      fontStyle: 'bold',
      color: [37, 99, 235] // Bleu
    });
    yPos += 5;
  }

  if (entreprise.adresse) {
    yPos = addText(entreprise.adresse, margin, yPos, { fontSize: 10 });
    yPos += 5;
  }

  if (entreprise.telephone) {
    yPos = addText(`Tél: ${entreprise.telephone}`, margin, yPos, { fontSize: 10 });
    yPos += 5;
  }

  if (entreprise.email) {
    yPos = addText(`Email: ${entreprise.email}`, margin, yPos, { fontSize: 10 });
    yPos += 5;
  }

  yPos += 10;

  // Ligne de séparation
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Titre FACTURE
  yPos = addText('FACTURE', margin, yPos, {
    fontSize: 20,
    fontStyle: 'bold'
  });
  yPos += 10;

  // Numéro et date
  yPos = addText(`N°: ${facture.numero}`, margin, yPos, { fontSize: 12, fontStyle: 'bold' });
  yPos += 6;
  
  const dateFacture = new Date(facture.date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  yPos = addText(`Date: ${dateFacture}`, margin, yPos, { fontSize: 12 });
  yPos += 15;

  // Tableau des produits
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  
  yPos += 6;
  addText('Produit', margin + 5, yPos, { fontSize: 10, fontStyle: 'bold' });
  addText('Qté', pageWidth - 150, yPos, { fontSize: 10, fontStyle: 'bold', align: 'center' });
  addText('Prix', pageWidth - 100, yPos, { fontSize: 10, fontStyle: 'bold', align: 'right' });
  addText('Total', pageWidth - margin - 5, yPos, { fontSize: 10, fontStyle: 'bold', align: 'right' });
  yPos += 8;

  // Lignes de produits
  facture.produits.forEach((produit) => {
    // Vérifier si on doit ajouter une nouvelle page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = margin;
    }

    // Nom du produit
    const nomProduit = produit.nom.length > 30 
      ? produit.nom.substring(0, 27) + '...' 
      : produit.nom;
    yPos = addText(nomProduit, margin + 5, yPos, { fontSize: 10 });
    
    // Description si présente
    if (produit.description) {
      const desc = produit.description.length > 35 
        ? produit.description.substring(0, 32) + '...' 
        : produit.description;
      yPos = addText(desc, margin + 10, yPos, { fontSize: 8, color: [100, 100, 100] });
    }

    // Quantité, Prix, Total
    const ligneY = yPos - (produit.description ? 10 : 5);
    addText(produit.quantite.toString(), pageWidth - 150, ligneY, { 
      fontSize: 10, 
      align: 'center' 
    });
    addText(`${produit.prixUnitaire.toLocaleString()} ${facture.devise}`, 
      pageWidth - 100, ligneY, { fontSize: 10, align: 'right' });
    addText(`${produit.total.toLocaleString()} ${facture.devise}`, 
      pageWidth - margin - 5, ligneY, { fontSize: 10, align: 'right', fontStyle: 'bold' });

    yPos += 8;
  });

  yPos += 5;

  // Ligne de séparation avant totaux
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - 80, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Totaux
  addText('Sous-total:', pageWidth - 100, yPos, { fontSize: 12, align: 'right' });
  addText(`${facture.sousTotal.toLocaleString()} ${facture.devise}`, 
    pageWidth - margin - 5, yPos, { fontSize: 12, align: 'right', fontStyle: 'bold' });
  yPos += 8;

  if (facture.tva && facture.tva.taux > 0) {
    addText(`TVA (${facture.tva.taux}%):`, pageWidth - 100, yPos, { fontSize: 12, align: 'right' });
    addText(`${facture.tva.montant.toLocaleString()} ${facture.devise}`, 
      pageWidth - margin - 5, yPos, { fontSize: 12, align: 'right', fontStyle: 'bold' });
    yPos += 8;
  }

  // Total général en grand
  doc.setFillColor(37, 99, 235);
  doc.rect(pageWidth - 100, yPos - 5, 80, 10, 'F');
  
  addText('TOTAL:', pageWidth - 95, yPos, { 
    fontSize: 14, 
    align: 'left', 
    fontStyle: 'bold',
    color: [255, 255, 255]
  });
  addText(`${facture.totalGeneral.toLocaleString()} ${facture.devise}`, 
    pageWidth - margin - 5, yPos, { 
    fontSize: 14, 
    align: 'right', 
    fontStyle: 'bold',
    color: [255, 255, 255]
  });
  yPos += 15;

  // Remarques si présentes
  if (facture.remarques) {
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    addText('Remarques:', margin, yPos, { fontSize: 10, fontStyle: 'bold' });
    yPos += 8;
    
    const remarques = doc.splitTextToSize(facture.remarques, pageWidth - 2 * margin);
    remarques.forEach((line) => {
      if (yPos > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPos = margin;
      }
      addText(line, margin, yPos, { fontSize: 10 });
      yPos += 6;
    });
  }

  // Pied de page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addText(`Page ${i} / ${totalPages}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, {
      fontSize: 8,
      align: 'center',
      color: [150, 150, 150]
    });
  }

  // Télécharger le PDF
  const fileName = `Facture_${facture.numero}_${new Date(facture.date).toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
