// Configuration boutique EcoClean
const STORE = {
  currency: 'XAF',
  phone: '686875289',
  payments: {
    orange: { name: 'Orange Money', instructions: 'Payer via Orange Money au numéro 686875289. Indiquez la référence de commande (ex: EC12345678) dans le motif. Envoyez le reçu par WhatsApp au +237 686 875 289.' },
    mtn:    { name: 'MTN MoMo',     instructions: 'Payer via MTN MoMo au numéro 686875289. Indiquez la référence de commande (ex: EC12345678) dans le motif. Envoyez le reçu par WhatsApp au +237 686 875 289.' },
    cod:    { name: 'Espèce à la livraison', instructions: 'Règlement en espèce à la livraison. Préparez le montant exact si possible.' }
  },
  shipping: {
    free_over: 15000, // Livraison gratuite à partir de ce montant (XAF)
    zones: [
      { id: 'douala',   name: 'Douala',   fee: 1000 },
      { id: 'yaounde',  name: 'Yaoundé',  fee: 1500 },
      { id: 'autres',   name: 'Autres villes', fee: 2500 }
    ]
  },
  products: [
    {
      id: 'soap-250',
      name: 'Savon liquide 250ml',
      basePrice: 1500,
      description: 'Format 250ml, pratique et économique. Idéal pour la salle de bain et le bureau.',
      variants: [
        { id: 'citron', label: 'Citron' },
        { id: 'lavande', label: 'Lavande' },
        { id: 'menthe', label: 'Menthe' }
      ],
      image: 'placeholder-250'
    },
    {
      id: 'soap-500',
      name: 'Savon liquide 500ml',
      basePrice: 2500,
      description: 'Format 500ml, le meilleur rapport quantité/prix pour la famille.',
      variants: [
        { id: 'citron', label: 'Citron' },
        { id: 'lavande', label: 'Lavande' },
        { id: 'menthe', label: 'Menthe' }
      ],
      image: 'placeholder-500'
    },
    {
      id: 'soap-1l',
      name: 'Savon liquide 1L',
      basePrice: 4500,
      description: 'Format 1L pour une utilisation prolongée à la maison ou en entreprise.',
      variants: [
        { id: 'citron', label: 'Citron' },
        { id: 'lavande', label: 'Lavande' },
        { id: 'menthe', label: 'Menthe' }
      ],
      image: 'placeholder-1l'
    }
  ]
};
