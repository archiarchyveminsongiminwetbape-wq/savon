# EcoClean - Boutique statique

Ouvrez `index.html` dans votre navigateur. Aucune installation nécessaire.

## Pages
- Accueil: `index.html`
- Boutique: `shop.html`
- Produit: `product.html?id=...`
- Panier: `cart.html`
- Checkout: `checkout.html`
- Succès: `order-success.html`

## Paiement
- Méthodes affichées: Orange Money, MTN MoMo, Espèce à la livraison. (Simulation frontend)
- Pour un vrai paiement: prévoir un backend/agrégateur Mobile Money ou intégrer Stripe/PayPal selon pays.

## Livraison
- Configurable dans `assets/js/data.js` > `shipping` (zones, frais, seuil de gratuité).

## Produits
- Modifiez `assets/js/data.js` > `products`.

## Logo
- Remplacez `assets/img/logo.png` par votre logo (fourni) pour l’affichage.
