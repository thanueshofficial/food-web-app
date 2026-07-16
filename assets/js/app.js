/* =========================================================
   FORKFUL — app.js
   Menu data + cart state (localStorage) + page renderers.
   ========================================================= */

const MENU = [
  {
    id: 'burger-01',
    name: 'Smoked Cheddar Stacker',
    category: 'Burgers',
    price: 8.5,
    tag: 'Bestseller',
    desc: 'Double smash patty, smoked cheddar, pickles, house rust sauce.',
    img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80'
  },
  {
    id: 'pizza-01',
    name: 'Wood-Fired Margherita',
    category: 'Pizza',
    price: 10.0,
    tag: 'Classic',
    desc: 'San Marzano tomato, fior di latte, basil, cold-pressed olive oil.',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80'
  },
  {
    id: 'pasta-01',
    name: 'Truffle Mushroom Tagliatelle',
    category: 'Pasta',
    price: 12.5,
    tag: 'Chef pick',
    desc: 'Wild mushrooms, parmesan cream, shaved truffle, fresh herbs.',
    img: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=600&q=80'
  },
  {
    id: 'salad-01',
    name: 'Charred Citrus Salad',
    category: 'Salads',
    price: 7.0,
    tag: 'Light',
    desc: 'Little gem, blood orange, feta, toasted almonds, honey dressing.',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80'
  },
  {
    id: 'sushi-01',
    name: 'Spicy Tuna Roll Set',
    category: 'Sushi',
    price: 13.0,
    tag: 'Spicy',
    desc: 'Eight pieces, ahi tuna, sriracha aioli, crisp nori, pickled ginger.',
    img: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&q=80'
  },
  {
    id: 'fries-01',
    name: 'Rosemary Sea Salt Fries',
    category: 'Sides',
    price: 4.5,
    tag: 'Side',
    desc: 'Double-fried potatoes, rosemary, flaky sea salt, garlic aioli.',
    img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&q=80'
  },
  {
    id: 'sandwich-01',
    name: 'Roasted Veg Ciabatta',
    category: 'Sandwiches',
    price: 8.0,
    tag: 'Veg',
    desc: 'Grilled zucchini, roasted peppers, pesto, whipped ricotta.',
    img: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=600&q=80'
  },
  {
    id: 'coffee-01',
    name: 'Cold Brew Espresso',
    category: 'Drinks',
    price: 3.5,
    tag: 'Drink',
    desc: 'Slow-steeped 18 hours, served over ice, notes of dark cocoa.',
    img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'
  },
  {
    id: 'donut-01',
    name: 'Saffron Glazed Donut',
    category: 'Desserts',
    price: 3.75,
    tag: 'Sweet',
    desc: 'Brioche donut, saffron glaze, crushed pistachio.',
    img: 'https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=600&q=80'
  },
  {
    id: 'icecream-01',
    name: 'Charcoal Vanilla Scoop',
    category: 'Desserts',
    price: 4.25,
    tag: 'Sweet',
    desc: 'Activated charcoal cone, Madagascar vanilla bean ice cream.',
    img: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=600&q=80'
  }
];

const DELIVERY_FEE = 2.99;
const TAX_RATE = 0.08;
const CART_KEY = 'forkful_cart_v1';

/* ---------------- Cart state helpers ---------------- */

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(id, qty) {
  const cart = getCart();
  cart[id] = (cart[id] || 0) + qty;
  if (cart[id] <= 0) delete cart[id];
  saveCart(cart);
  return cart[id] || 0;
}

function setQty(id, qty) {
  const cart = getCart();
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = getCart();
  delete cart[id];
  saveCart(cart);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
}

function cartItemCount() {
  const cart = getCart();
  return Object.values(cart).reduce((a, b) => a + b, 0);
}

function cartLines() {
  const cart = getCart();
  return Object.entries(cart)
    .map(([id, qty]) => {
      const dish = MENU.find((d) => d.id === id);
      if (!dish) return null;
      return { ...dish, qty, lineTotal: dish.price * qty };
    })
    .filter(Boolean);
}

function cartSubtotal() {
  return cartLines().reduce((sum, l) => sum + l.lineTotal, 0);
}

function updateCartBadge() {
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = cartItemCount();
  });
}

/* ---------------- Nav helpers ---------------- */

function highlightActiveNav() {
  const page = document.body.getAttribute('data-page');
  document.querySelectorAll('.nav-links a[data-nav]').forEach((a) => {
    if (a.getAttribute('data-nav') === page) a.classList.add('active');
  });
}

/* ---------------- Menu page rendering ---------------- */

function renderCategoryChips(container, onSelect) {
  const categories = ['All', ...new Set(MENU.map((d) => d.category))];
  container.innerHTML = '';
  categories.forEach((cat, i) => {
    const chip = document.createElement('button');
    chip.className = 'cat-chip' + (i === 0 ? ' selected' : '');
    chip.textContent = cat;
    chip.type = 'button';
    chip.addEventListener('click', () => {
      container.querySelectorAll('.cat-chip').forEach((c) => c.classList.remove('selected'));
      chip.classList.add('selected');
      onSelect(cat);
    });
    container.appendChild(chip);
  });
}

function dishCardHTML(dish) {
  const cart = getCart();
  const qty = cart[dish.id] || 0;
  const tagClass = dish.tag === 'Spicy' ? 'dish-tag spicy' : 'dish-tag';
  return `
    <article class="dish-card" data-dish="${dish.id}">
      <div class="dish-photo">
        <img src="${dish.img}" alt="${dish.name}" loading="lazy">
        <span class="${tagClass}">${dish.tag}</span>
      </div>
      <div class="dish-body">
        <div class="dish-title-row">
          <h3>${dish.name}</h3>
          <span class="dish-price">$${dish.price.toFixed(2)}</span>
        </div>
        <p class="dish-desc">${dish.desc}</p>
        <div class="dish-foot">
          <div class="qty-control" data-qty-control>
            <button type="button" data-action="dec" aria-label="Decrease quantity">−</button>
            <span data-qty-display>${qty}</span>
            <button type="button" data-action="inc" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="add-btn" data-action="add">${qty > 0 ? 'Update' : 'Add'}</button>
        </div>
      </div>
    </article>
  `;
}

function renderMenuGrid(grid, filterCategory) {
  const items = filterCategory && filterCategory !== 'All'
    ? MENU.filter((d) => d.category === filterCategory)
    : MENU;
  grid.innerHTML = items.map(dishCardHTML).join('');
  wireDishCards(grid);
}

function wireDishCards(scope) {
  scope.querySelectorAll('.dish-card').forEach((card) => {
    const id = card.getAttribute('data-dish');
    const qtyDisplay = card.querySelector('[data-qty-display]');
    const addBtn = card.querySelector('[data-action="add"]');
    let pending = parseInt(qtyDisplay.textContent, 10) || 0;

    card.querySelector('[data-action="inc"]').addEventListener('click', () => {
      pending += 1;
      qtyDisplay.textContent = pending;
    });
    card.querySelector('[data-action="dec"]').addEventListener('click', () => {
      pending = Math.max(0, pending - 1);
      qtyDisplay.textContent = pending;
    });
    addBtn.addEventListener('click', () => {
      if (pending === 0) pending = 1;
      setQty(id, pending);
      qtyDisplay.textContent = pending;
      addBtn.textContent = 'Updated ✓';
      addBtn.classList.add('added');
      setTimeout(() => {
        addBtn.textContent = 'Update';
        addBtn.classList.remove('added');
      }, 1100);
    });
  });
}

/* ---------------- Cart page rendering ---------------- */

function renderCartPage() {
  const listEl = document.getElementById('cart-list');
  const emptyEl = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');
  const lines = cartLines();

  if (lines.length === 0) {
    listEl.style.display = 'none';
    summaryEl.style.display = 'none';
    emptyEl.style.display = 'block';
    return;
  }

  listEl.style.display = 'flex';
  summaryEl.style.display = 'block';
  emptyEl.style.display = 'none';

  listEl.innerHTML = lines.map((l) => `
    <div class="cart-row" data-line="${l.id}">
      <img src="${l.img}" alt="${l.name}">
      <div>
        <h3>${l.name}</h3>
        <p class="row-price">$${l.price.toFixed(2)} each</p>
      </div>
      <div class="qty-control">
        <button type="button" data-action="dec" aria-label="Decrease quantity">−</button>
        <span data-qty-display>${l.qty}</span>
        <button type="button" data-action="inc" aria-label="Increase quantity">+</button>
      </div>
      <button type="button" class="remove-btn" data-action="remove">Remove</button>
    </div>
  `).join('');

  listEl.querySelectorAll('.cart-row').forEach((row) => {
    const id = row.getAttribute('data-line');
    row.querySelector('[data-action="inc"]').addEventListener('click', () => {
      const cart = getCart();
      setQty(id, (cart[id] || 0) + 1);
      renderCartPage();
    });
    row.querySelector('[data-action="dec"]').addEventListener('click', () => {
      const cart = getCart();
      setQty(id, (cart[id] || 0) - 1);
      renderCartPage();
    });
    row.querySelector('[data-action="remove"]').addEventListener('click', () => {
      removeFromCart(id);
      renderCartPage();
    });
  });

  renderSummary('summary-lines');
}

function renderSummary(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const subtotal = cartSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + (subtotal > 0 ? DELIVERY_FEE : 0);

  container.innerHTML = `
    <div class="summary-line"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
    <div class="summary-line"><span>Delivery fee</span><span>$${subtotal > 0 ? DELIVERY_FEE.toFixed(2) : '0.00'}</span></div>
    <div class="summary-line"><span>Tax (8%)</span><span>$${tax.toFixed(2)}</span></div>
    <div class="summary-line total"><span>Total</span><span>$${total.toFixed(2)}</span></div>
  `;
  return { subtotal, tax, total };
}

/* ---------------- Billing page rendering ---------------- */

function renderBillingSummary() {
  const totals = renderSummary('billing-summary-lines');
  return totals;
}

function renderReceipt(orderId, form) {
  const lines = cartLines();
  const subtotal = cartSubtotal();
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + DELIVERY_FEE;

  const rowsHTML = lines.map((l) => `
    <div class="receipt-row">
      <span>${l.qty} × ${l.name}</span>
      <span>$${l.lineTotal.toFixed(2)}</span>
    </div>
  `).join('');

  document.getElementById('receipt-name').textContent = form.name;
  document.getElementById('receipt-address').textContent = form.address;
  document.getElementById('receipt-payment').textContent = form.payment;
  document.getElementById('receipt-order-id').textContent = orderId;
  document.getElementById('receipt-items').innerHTML = rowsHTML;
  document.getElementById('receipt-subtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('receipt-delivery').textContent = '$' + DELIVERY_FEE.toFixed(2);
  document.getElementById('receipt-tax').textContent = '$' + tax.toFixed(2);
  document.getElementById('receipt-total').textContent = '$' + total.toFixed(2);
}

/* ---------------- Init ---------------- */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  highlightActiveNav();
});
