let allProducts = [];

function cardHtml(p) {
  return `
    <article class="card">
      <div class="shot"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
      <span class="tag">${p.price}</span>
      <div class="info">
        <div class="cat">${p.cat === 'shoes' ? 'Shoes' : 'Clothing'}</div>
        <h3>${p.name}</h3>
        <a class="order-btn" href="https://wa.me/${p.wa}?text=${encodeURIComponent('Hi, I want to order: ' + p.name + ' — ' + p.price)}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2Z"/></svg>
          Order on WhatsApp
        </a>
      </div>
    </article>
  `;
}

function renderGrid(cat = 'all') {
  const grid = document.getElementById('grid');
  const list = cat === 'all' ? allProducts : allProducts.filter(p => p.cat === cat);

  if (!list.length) {
    grid.innerHTML = `<p class="empty-note">No pieces in this category yet — check back soon.</p>`;
    return;
  }

  grid.innerHTML = list.map(cardHtml).join('');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); } });
  }, { threshold: .15 });
  document.querySelectorAll('.card').forEach(c => io.observe(c));
}

async function init() {
  try {
    const res = await fetch('/api/products');
    allProducts = await res.json();
  } catch (e) {
    document.getElementById('grid').innerHTML = `<p class="empty-note">Couldn't load the catalog — refresh the page.</p>`;
    return;
  }
  renderGrid('all');
}
init();

document.getElementById('filters').addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn) return;
  document.querySelectorAll('#filters button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGrid(btn.dataset.cat);
});

// marquee content
const words = ["New Drop", "Fast Delivery", "100% Authentic", "Order on WhatsApp", "Limited Sizes"];
document.getElementById('marqueeTrack').innerHTML = (words.concat(words)).map(w => `<span>${w}</span>`).join('');
