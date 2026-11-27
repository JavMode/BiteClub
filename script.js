// ===== Catálogo =====
const PRODUCTS = [
  { id: 1, name: "Croquetas Premium Adulto 10kg", pet: "perro", emoji: "🦴", bg: "#ffe3d1", price: 39.99, old: 49.99, rating: 4.9, reviews: 312, popular: 10, tag: "sale" },
  { id: 2, name: "Pelota Indestructible", pet: "perro", emoji: "🎾", bg: "#e4f6d9", price: 12.5, rating: 4.7, reviews: 189, popular: 8 },
  { id: 3, name: "Correa Retráctil 5m", pet: "perro", emoji: "🦮", bg: "#dcecff", price: 24.0, rating: 4.6, reviews: 98, popular: 6 },
  { id: 4, name: "Rascador Torre Deluxe", pet: "gato", emoji: "🐈", bg: "#efe5ff", price: 59.9, rating: 4.8, reviews: 140, popular: 9, tag: "new" },
  { id: 5, name: "Arena Aglomerante 8L", pet: "gato", emoji: "🧺", bg: "#fff1c9", price: 14.99, rating: 4.5, reviews: 260, popular: 7 },
  { id: 6, name: "Varita con Plumas", pet: "gato", emoji: "🪶", bg: "#ffe0ec", price: 7.5, old: 9.99, rating: 4.7, reviews: 85, popular: 5, tag: "sale" },
  { id: 7, name: "Jaula Espaciosa para Aves", pet: "ave", emoji: "🦜", bg: "#d9f3ee", price: 89.0, rating: 4.6, reviews: 41, popular: 3 },
  { id: 8, name: "Mezcla de Semillas 2kg", pet: "ave", emoji: "🌾", bg: "#fff4d6", price: 9.99, rating: 4.8, reviews: 77, popular: 4 },
  { id: 9, name: "Acuario Kit 40L con LED", pet: "pez", emoji: "🐠", bg: "#d6f0ff", price: 74.5, rating: 4.7, reviews: 56, popular: 5, tag: "new" },
  { id: 10, name: "Alimento en Escamas Tropical", pet: "pez", emoji: "🐟", bg: "#e0f7fa", price: 6.99, rating: 4.6, reviews: 120, popular: 4 },
  { id: 11, name: "Rueda Silenciosa para Hámster", pet: "roedor", emoji: "🐹", bg: "#ffead6", price: 18.0, rating: 4.5, reviews: 64, popular: 3 },
  { id: 12, name: "Heno Natural Premium 1kg", pet: "roedor", emoji: "🌿", bg: "#e6f5d8", price: 8.5, rating: 4.9, reviews: 93, popular: 4 },
];

const PET_LABEL = { perro: "Perros", gato: "Gatos", ave: "Aves", pez: "Peces", roedor: "Roedores" };
const money = (n) => `$${n.toFixed(2)}`;
const $ = (sel) => document.querySelector(sel);

// ===== Estado =====
let currentFilter = "todos";
let currentSort = "popular";
let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem("biteclub-cart")) || {}; }
  catch { return {}; }
}
function saveCart() {
  try { localStorage.setItem("biteclub-cart", JSON.stringify(cart)); } catch {}
}

// ===== Productos =====
function renderProducts() {
  let list = PRODUCTS.filter((p) => currentFilter === "todos" || p.pet === currentFilter);
  if (currentSort === "asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (currentSort === "desc") list = [...list].sort((a, b) => b.price - a.price);
  else list = [...list].sort((a, b) => b.popular - a.popular);

  $("#products").innerHTML = list.map((p, i) => `
    <article class="product" style="animation-delay:${i * 40}ms">
      <div class="product__img" style="background:${p.bg}">
        ${p.tag === "sale" ? '<span class="product__tag product__tag--sale">Oferta</span>' : ""}
        ${p.tag === "new" ? '<span class="product__tag">Nuevo</span>' : ""}
        ${p.emoji}
      </div>
      <div class="product__body">
        <span class="product__cat">${PET_LABEL[p.pet]}</span>
        <span class="product__name">${p.name}</span>
        <span class="product__rating">★ ${p.rating} <span>(${p.reviews})</span></span>
        <div class="product__foot">
          <span class="product__price">${money(p.price)}${p.old ? `<del>${money(p.old)}</del>` : ""}</span>
          <button class="add-btn" data-add="${p.id}" aria-label="Agregar ${p.name} al carrito">+</button>
        </div>
      </div>
    </article>`).join("");
}

document.querySelectorAll(".category").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".category.is-active")?.classList.remove("is-active");
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter;
    renderProducts();
    $("#productos").scrollIntoView({ behavior: "smooth" });
  });
});

$("#sortSelect").addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderProducts();
});

$("#products").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  addToCart(Number(btn.dataset.add));
});

// ===== Carrito =====
function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  const product = PRODUCTS.find((p) => p.id === id);
  toast(`${product.emoji} ${product.name} agregado`);
  const count = $("#cartCount");
  count.classList.remove("bump");
  void count.offsetWidth;
  count.classList.add("bump");
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const entries = Object.entries(cart)
    .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === Number(id)), qty }))
    .filter((e) => e.product);

  const count = entries.reduce((s, e) => s + e.qty, 0);
  const total = entries.reduce((s, e) => s + e.qty * e.product.price, 0);

  $("#cartCount").textContent = count;
  $("#cartTotal").textContent = money(total);
  $("#cartEmpty").hidden = entries.length > 0;
  $("#checkoutBtn").disabled = entries.length === 0;

  $("#cartItems").innerHTML = entries.map(({ product: p, qty }) => `
    <li class="cart-item">
      <div class="cart-item__img" style="background:${p.bg}">${p.emoji}</div>
      <div>
        <div class="cart-item__name">${p.name}</div>
        <div class="cart-item__price">${money(p.price)} c/u</div>
      </div>
      <div class="qty">
        <button data-qty="${p.id}" data-delta="-1" aria-label="Quitar uno">−</button>
        <span>${qty}</span>
        <button data-qty="${p.id}" data-delta="1" aria-label="Agregar uno">+</button>
      </div>
    </li>`).join("");
}

$("#cartItems").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-qty]");
  if (!btn) return;
  changeQty(Number(btn.dataset.qty), Number(btn.dataset.delta));
});

function openCart() { $("#cart").classList.add("is-open"); $("#overlay").hidden = false; }
function closeCart() { $("#cart").classList.remove("is-open"); $("#overlay").hidden = true; }
$("#cartBtn").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

$("#checkoutBtn").addEventListener("click", () => {
  cart = {};
  saveCart();
  renderCart();
  closeCart();
  toast("🎉 ¡Gracias por tu compra! Tu pedido está en camino.");
});

// ===== Menú móvil =====
$("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("is-open"));
document.querySelectorAll("#nav a").forEach((a) =>
  a.addEventListener("click", () => $("#nav").classList.remove("is-open"))
);

// ===== Newsletter =====
$("#newsletterForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = $("#newsletterMsg");
  msg.textContent = `¡Listo! Te escribiremos a ${$("#emailInput").value} 🐶`;
  msg.hidden = false;
  e.target.reset();
});

// ===== Toast =====
let toastTimer;
function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), 2200);
}

// ===== Init =====
$("#year").textContent = new Date().getFullYear();
renderProducts();
renderCart();
