const gate = document.getElementById('gate');
const gateInput = document.getElementById('gateInput');
const gateBtn = document.getElementById('gateBtn');
const gateErr = document.getElementById('gateErr');

function getPasscode() {
  return sessionStorage.getItem('streetdrip_passcode') || '';
}

async function tryUnlock() {
  const passcode = gateInput.value.trim();
  gateErr.textContent = '';
  gateBtn.disabled = true;
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    if (res.ok) {
      sessionStorage.setItem('streetdrip_passcode', passcode);
      gate.style.display = 'none';
      renderList();
    } else {
      gateErr.textContent = 'Wrong passcode, try again.';
    }
  } catch (e) {
    gateErr.textContent = 'Could not reach the server — try again.';
  } finally {
    gateBtn.disabled = false;
  }
}
gateBtn.addEventListener('click', tryUnlock);
gateInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });

if (getPasscode()) {
  gate.style.display = 'none';
}

// ---- product list ----
async function renderList() {
  const listEl = document.getElementById('productList');
  listEl.innerHTML = `<p class="empty-note">Loading…</p>`;
  let products = [];
  try {
    const res = await fetch('/api/products');
    products = await res.json();
  } catch (e) {
    listEl.innerHTML = `<p class="empty-note">Couldn't load the catalog — refresh the page.</p>`;
    return;
  }
  if (!products.length) {
    listEl.innerHTML = `<p class="empty-note">No products yet — add your first one.</p>`;
    return;
  }
  listEl.innerHTML = products.map(p => `
    <div class="prow" data-id="${p.id}">
      <img src="${p.img}" alt="${p.name}">
      <div class="pinfo">
        <h4>${p.name}</h4>
        <div class="pmeta">${p.cat === 'shoes' ? 'Shoes' : 'Clothing'} · +${p.wa}</div>
      </div>
      <span class="ptag">${p.price}</span>
      <button class="pdel" data-id="${p.id}">Delete</button>
    </div>
  `).join('');
}
renderList();

document.getElementById('productList').addEventListener('click', async e => {
  const btn = e.target.closest('.pdel');
  if (!btn) return;
  if (!confirm('Remove this product from the catalog?')) return;
  btn.disabled = true;
  try {
    const res = await fetch('/api/products/' + btn.dataset.id, {
      method: 'DELETE',
      headers: { 'x-admin-passcode': getPasscode() },
    });
    if (res.status === 401) {
      sessionStorage.removeItem('streetdrip_passcode');
      gate.style.display = 'flex';
      return;
    }
    renderList();
  } catch (e) {
    alert('Could not delete — check your connection and try again.');
    btn.disabled = false;
  }
});

// ---- add product form ----
const fileInput = document.getElementById('pfile');
const previewThumb = document.getElementById('previewThumb');

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (!file) { previewThumb.style.display = 'none'; return; }
  const reader = new FileReader();
  reader.onload = () => { previewThumb.src = reader.result; previewThumb.style.display = 'block'; };
  reader.readAsDataURL(file);
});

const form = document.getElementById('productForm');
const submitBtn = document.getElementById('submitBtn');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formMsg.textContent = '';
  formMsg.className = 'form-msg';

  const file = fileInput.files[0];
  if (!file) {
    formMsg.textContent = 'Choose a photo first.';
    formMsg.className = 'form-msg err';
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Adding…';

  const fd = new FormData();
  fd.append('name', document.getElementById('pname').value.trim());
  fd.append('cat', document.getElementById('pcat').value);
  fd.append('price', document.getElementById('pprice').value.trim());
  fd.append('wa', document.getElementById('pwa').value.trim());
  fd.append('photo', file);

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'x-admin-passcode': getPasscode() },
      body: fd,
    });

    if (res.status === 401) {
      sessionStorage.removeItem('streetdrip_passcode');
      gate.style.display = 'flex';
      formMsg.textContent = 'Session expired — unlock again.';
      formMsg.className = 'form-msg err';
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      formMsg.textContent = data.error || 'Something went wrong — try again.';
      formMsg.className = 'form-msg err';
      return;
    }

    form.reset();
    document.getElementById('pwa').value = '250795201759';
    previewThumb.style.display = 'none';
    renderList();
    formMsg.textContent = "Product added — it's live on the storefront now.";
    formMsg.className = 'form-msg ok';
  } catch (err) {
    formMsg.textContent = 'Could not reach the server — check your connection and try again.';
    formMsg.className = 'form-msg err';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Product';
  }
});
