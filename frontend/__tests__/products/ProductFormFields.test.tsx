import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { ProductFormFields } from '@/components/products/ProductFormFields';

describe('ProductFormFields', () => {
  it('renders all input fields', async () => {
    render(
      <ProductFormFields
        designation='Test'
        setDesignation={() => {}}
        type='credit'
        setType={() => {}}
        montantMinimum='1000'
        setMontantMinimum={() => {}}
        montantMaximum='5000'
        setMontantMaximum={() => {}}
        dureeMinimum='12'
        setDureeMinimum={() => {}}
        dureeMaximum='24'
        setDureeMaximum={() => {}}
        tauxInteret='2.5'
        setTauxInteret={() => {}}
        typeRemboursement='fixe'
        setTypeRemboursement={() => {}}
        remboursementAnticipe={true}
        setRemboursementAnticipe={() => {}}
        ageMinimum='18'
        setAgeMinimum={() => {}}
        revenuMinimum='1500'
        setRevenuMinimum={() => {}}
      />
    );
    // Vérifie la présence de quelques champs clés
    expect(screen.getByLabelText(/désignation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/montant minimum/i)).toBeInTheDocument();

    // Affiche le tab "Remboursement" pour rendre le champ visible
    const tabRemboursement = screen.getByRole('tab', { name: /remboursement/i });
    await userEvent.click(tabRemboursement);

    // Recherche du champ taux d'intérêt (label exact)
    expect(await screen.findByLabelText("Taux d'intérêt (%) *")).toBeInTheDocument();

    // Affiche le tab "Éligibilité" pour vérifier le champ âge minimum
    const tabEligibilite = screen.getByRole('tab', { name: /éligibilité/i });
    await userEvent.click(tabEligibilite);
    expect(await screen.findByLabelText(/âge minimum/i)).toBeInTheDocument();
  });
});
