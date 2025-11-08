// Utilitaires
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const fmt = (n) => new Intl.NumberFormat('fr-FR', { style:'currency', currency:'XAF', currencyDisplay: 'code'}).format(n).replace('XAF', STORE.currency);
const LS_KEY = 'ecoclean_cart_v1';
const LS_ORDER = 'ecoclean_last_order_v1';

function readCart(){
  try { return JSON.parse(localStorage.getItem(LS_KEY)||'[]'); } catch { return []; }
}
function writeCart(items){ localStorage.setItem(LS_KEY, JSON.stringify(items)); updateNavCount(); }
function emptyCart(){ writeCart([]); }
function updateNavCount(){ const count = readCart().reduce((a,i)=>a+i.qty,0); const el=$('#navCartCount'); if(el) el.textContent = count; }
function currentYear(){ const y=$('#year'); if(y) y.textContent = new Date().getFullYear(); }

function findProduct(id){ return STORE.products.find(p=>p.id===id); }
function getZoneById(id){ return STORE.shipping.zones.find(z=>z.id===id); }
function shippingFeeFor(zoneId, subtotal){
  const zone = getZoneById(zoneId);
  if(!zone) return 0;
  if(subtotal >= STORE.shipping.free_over) return 0;
  return zone.fee;
}

// RENDERING — SHOP
function renderProducts(containerId){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = STORE.products.map(p=>`
    <div class="card product-card">
      <a href="product.html?id=${p.id}">
        <div class="thumb">${p.image}</div>
        <h3>${p.name}</h3>
        <div class="stars">★★★★★</div>
        <div class="price">${fmt(p.basePrice)}</div>
      </a>
      <button class="btn primary" onclick="quickOrder('${p.id}')">Commander maintenant</button>
    </div>
  `).join('');
  updateNavCount();
  currentYear();
}

function quickOrder(productId){
  const p = findProduct(productId); if(!p) return;
  const variant = p.variants[0]?.id||'standard';
  const key = `${p.id}::${variant}`;
  const single = [{ key, id:p.id, variant, name:`${p.name} - ${p.variants.find(v=>v.id===variant)?.label||variant}`, price:p.basePrice, qty:1 }];
  writeCart(single);
  location.href = 'checkout.html';
}

// PRODUCT DETAIL
function renderProductDetail(containerId){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const p = findProduct(id);
  const el = document.getElementById(containerId);
  if(!p || !el){ if(el) el.innerHTML = '<p>Produit introuvable.</p>'; return; }
  const variantOpts = p.variants.map(v=>`<option value="${v.id}">${v.label}</option>`).join('');
  el.innerHTML = `
    <div class="thumb-lg">${p.image}</div>
    <div>
      <h1>${p.name}</h1>
      <div class="stars">★★★★★</div>
      <p>${p.description}</p>
      <p class="price">${fmt(p.basePrice)}</p>
      <label>Parfum</label>
      <select id="variantSelect">${variantOpts}</select>
      <div style="margin-top:12px">
        <button class="btn primary" id="addBtn">Commander maintenant</button>
      </div>
    </div>
  `;
  $('#addBtn').addEventListener('click', ()=>{
    const variant = $('#variantSelect').value;
    const key = `${p.id}::${variant}`;
    const single = [{ key, id:p.id, variant, name:`${p.name} - ${p.variants.find(v=>v.id===variant)?.label||variant}`, price:p.basePrice, qty:1 }];
    writeCart(single);
    location.href = 'checkout.html';
  });
  updateNavCount();
  currentYear();
}

// CART PAGE
function renderCartPage(){
  const wrap = $('#cartView'); if(!wrap) return;
  const items = readCart();
  if(items.length===0){ wrap.innerHTML = '<p>Votre panier est vide.</p>'; updateNavCount(); currentYear(); return; }
  const subtotal = items.reduce((a,i)=>a+i.price*i.qty,0);
  wrap.innerHTML = `
    <div class="card">
      ${items.map(i=>`
        <div class="cart-item">
          <div style="display:flex;align-items:center;gap:10px">
            <div class="thumb">img</div>
            <div>
              <div><strong>${i.name}</strong></div>
              <div class="muted">${fmt(i.price)}</div>
            </div>
          </div>
          <div>
            <input type="number" min="1" value="${i.qty}" data-key="${i.key}" class="qty-input" style="width:80px">
          </div>
          <div>${fmt(i.price*i.qty)}</div>
          <div><button class="btn" data-remove="${i.key}">✕</button></div>
        </div>
      `).join('')}
      <div class="cart-summary">
        <div>Sous-total: <strong>${fmt(subtotal)}</strong></div>
        <div class="muted">Les frais de livraison seront calculés au checkout selon votre zone.</div>
      </div>
    </div>
  `;
  $$('.qty-input').forEach(inp=>inp.addEventListener('change', e=>{
    const key = e.target.getAttribute('data-key');
    const v = Math.max(1, parseInt(e.target.value||'1',10));
    const items = readCart();
    const it = items.find(x=>x.key===key); if(!it) return;
    it.qty = v; writeCart(items); renderCartPage();
  }));
  $$('button[data-remove]').forEach(btn=>btn.addEventListener('click', e=>{
    const key = e.target.getAttribute('data-remove');
    writeCart(readCart().filter(x=>x.key!==key)); renderCartPage();
  }));
  updateNavCount();
  currentYear();
}

// CHECKOUT PAGE
function initCheckoutPage(){
  const form = $('#checkoutForm'); if(!form) return;
  // zones
  const zoneSel = $('#zoneSelect');
  zoneSel.innerHTML = STORE.shipping.zones.map(z=>`<option value="${z.id}">${z.name} (+${fmt(z.fee)})</option>`).join('');

  const paySel = $('#paymentMethod');
  const instr = $('#paymentInstructions');
  function updatePaymentInstructions(){
    const pm = paySel.value;
    const txt = STORE.payments[pm]?.instructions || '';
    if(txt){ instr.style.display='block'; instr.className='card'; instr.innerHTML = `<strong>Instructions:</strong> <br>${txt}`; } else { instr.style.display='none'; }
  }
  paySel.addEventListener('change', updatePaymentInstructions);
  updatePaymentInstructions();

  // summary
  function renderSummary(){
    const items = readCart();
    const qtyEl = document.getElementById('qtyInput');
    const qtyOverride = qtyEl ? Math.max(1, parseInt(qtyEl.value||'1',10)) : 1;
    let subtotal = 0;
    if(items.length===1){
      subtotal = items[0].price * qtyOverride;
    } else {
      subtotal = items.reduce((a,i)=>a+i.price*i.qty,0);
    }
    const fee = shippingFeeFor(zoneSel.value, subtotal);
    const total = subtotal + fee;
    $('#checkoutSummary').innerHTML = `
      <div>Sous-total: <strong>${fmt(subtotal)}</strong></div>
      <div>Livraison: <strong>${fee===0? 'Gratuite' : fmt(fee)}</strong> ${subtotal>=STORE.shipping.free_over?`<span class="badge">Gratuite dès ${fmt(STORE.shipping.free_over)}</span>`:''}</div>
      <div>Total: <strong>${fmt(total)}</strong></div>
    `;
  }
  zoneSel.addEventListener('change', renderSummary);
  const qtyEl = document.getElementById('qtyInput');
  if(qtyEl) qtyEl.addEventListener('input', renderSummary);
  renderSummary();

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const order = {
      id: 'EC' + Date.now().toString().slice(-8),
      customer: {
        name: fd.get('name'), phone: fd.get('phone'), city: fd.get('city'), address: fd.get('address')
      },
      zone: fd.get('zone'),
      payment: fd.get('payment'),
      items: readCart(),
      qty: Math.max(1, parseInt(fd.get('qty')||'1',10)),
      delivery: {
        date: fd.get('delivery_date'),
        time: fd.get('delivery_time')
      },
      createdAt: new Date().toISOString()
    };
    let subtotal = 0;
    if(order.items.length===1){
      subtotal = order.items[0].price * order.qty;
    } else {
      subtotal = order.items.reduce((a,i)=>a+i.price*i.qty,0);
    }
    order.subtotal = subtotal;
    order.shipping = shippingFeeFor(order.zone, subtotal);
    order.total = subtotal + order.shipping;

    localStorage.setItem(LS_ORDER, JSON.stringify(order));
    // Préparer message WhatsApp vers le vendeur
    const itemLine = order.items.length===1
      ? `${order.items[0].name} x ${order.qty}`
      : order.items.map(i=>`${i.name} x ${i.qty}`).join(', ');
    const lieu = `${order.customer.address}, ${order.customer.city}`;
    const pmName = STORE.payments[order.payment]?.name || order.payment;
    const waText = `Nouvelle commande ${order.id}\n`+
      `Client: ${order.customer.name} (${order.customer.phone})\n`+
      `Produits: ${itemLine}\n`+
      `Zone: ${order.zone} | Lieu: ${lieu}\n`+
      `Jour/Heure: ${order.delivery.date || ''} ${order.delivery.time || ''}\n`+
      `Montant: ${fmt(order.total)} (dont livraison: ${fmt(order.shipping)})\n`+
      `Paiement: ${pmName}`;
    const waUrl = `https://wa.me/237${STORE.phone}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');

    // Message de confirmation avec consigne de dépôt
    const box = document.getElementById('postSubmitMessage');
    if(box){
      const op = order.payment==='orange' ? 'Orange Money' : (order.payment==='mtn' ? 'MTN MoMo' : 'votre choix');
      box.style.display = 'block';
      box.innerHTML = `<strong>Merci ${order.customer.name} !</strong><br>`+
        `Veuillez effectuer le dépôt à l'opérateur <strong>${op}</strong> au numéro <strong>${STORE.phone}</strong> `+
        `en mentionnant la référence <strong>${order.id}</strong>. `+
        `Envoyez le reçu sur WhatsApp si nécessaire.`;
      box.scrollIntoView({ behavior:'smooth', block:'start' });
    }
    // Ne pas rediriger automatiquement; garder la page ouverte
  });
  updateNavCount();
  currentYear();
}

// SUCCESS PAGE
function renderSuccessPage(){
  const data = localStorage.getItem(LS_ORDER);
  if(!data) { $('#orderId').textContent = '—'; return; }
  const order = JSON.parse(data);
  $('#orderId').textContent = order.id;
  updateNavCount();
  currentYear();
}

// Common on load
document.addEventListener('DOMContentLoaded', ()=>{
  updateNavCount();
  currentYear();
  injectWhatsAppButton();
  initHeaderEffects();
  injectPromoBar();
});

// Floating WhatsApp button
function injectWhatsAppButton(){
  if (document.querySelector('.wa-float')) return;
  const a = document.createElement('a');
  a.href = `https://wa.me/237${STORE.phone}`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.className = 'wa-float';
  a.ariaLabel = 'Chat WhatsApp';
  a.innerHTML = '<span class="wa-bubble">💬</span>';
  document.body.appendChild(a);
}

// Header effects & promo bar
function initHeaderEffects(){
  const header = document.querySelector('.site-header');
  if(!header) return;
  const onScroll = ()=>{ if(window.scrollY>12) header.classList.add('scrolled'); else header.classList.remove('scrolled'); };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();
}

function injectPromoBar(){
  if (sessionStorage.getItem('promo_closed')==='1') return;
  if (document.querySelector('.promo-bar')) return;
  const bar = document.createElement('div');
  bar.className = 'promo-bar';
  bar.innerHTML = `Livraison <strong>gratuite</strong> dès ${fmt(STORE.shipping.free_over)} <button class="close" aria-label="fermer">OK</button>`;
  const close = ()=>{ bar.remove(); sessionStorage.setItem('promo_closed','1'); };
  bar.addEventListener('click', (e)=>{ if(e.target.closest('.close')) close(); });
  document.body.prepend(bar);
}
