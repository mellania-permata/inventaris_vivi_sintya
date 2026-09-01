// State Management
let items = JSON.parse(localStorage.getItem('aqua_inventory_items')) || [];

// DOM Elements
const itemForm = document.getElementById('itemForm');
const itemIdInput = document.getElementById('itemId');
const namaBarangInput = document.getElementById('namaBarang');
const kodeInventarisInput = document.getElementById('kodeInventaris');
const namaRuanganInput = document.getElementById('namaRuangan');
const jumlahBarangInput = document.getElementById('jumlahBarang');
const kondisiBarangInput = document.getElementById('kondisiBarang');
const inventoryContainer = document.getElementById('inventoryContainer');

const formTitle = document.getElementById('formTitle');
const btnSubmit = document.getElementById('btnSubmit');
const btnCancel = document.getElementById('btnCancel');
const themeToggleBtn = document.getElementById('themeToggleBtn');

const searchInput = document.getElementById('searchInput');
const filterRuangan = document.getElementById('filterRuangan');
const filterKondisi = document.getElementById('filterKondisi');

// Initialize Canvas Context for Simple Bar Chart
const chartCanvas = document.getElementById('conditionChart');
const ctx = chartCanvas.getContext('2d');

// Floating Animations Generators
function initUnderwaterEffects() {
  const bubblesContainer = document.getElementById('bubblesContainer');
  const seaLifeContainer = document.getElementById('seaLifeContainer');

  // Spawn Bubbles
  for (let i = 0; i < 20; i++) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = Math.random() * 20 + 5;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDuration = `${Math.random() * 8 + 6}s`;
    bubble.style.animationDelay = `${Math.random() * 5}s`;
    bubblesContainer.appendChild(bubble);
  }

  // Sea Creatures List
  const creatures = ['🪼', '🐠', '🐢', '🦈', '🪸'];
  creatures.forEach((emoji, index) => {
    const creature = document.createElement('div');
    creature.className = 'sea-creature';
    creature.textContent = emoji;
    creature.style.top = `${15 + index * 18}%`;
    creature.style.animationDuration = `${18 + Math.random() * 10}s`;
    creature.style.animationDelay = `${index * 3}s`;
    seaLifeContainer.appendChild(creature);
  });
}

// LocalStorage Helper
function saveData() {
  localStorage.setItem('aqua_inventory_items', JSON.stringify(items));
  renderAll();
}

function updateStats() {
  const total = items.reduce((acc, item) => acc + parseInt(item.jumlah), 0);
  const baik = items.filter(i => i.kondisi === 'Baik').reduce((acc, item) => acc + parseInt(item.jumlah), 0);
  const rusak = total - baik;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statBaik').textContent = baik;
  document.getElementById('statRusak').textContent = rusak;

  renderChart(baik, items.filter(i => i.kondisi === 'Rusak Ringan').reduce((acc, item) => acc + parseInt(item.jumlah), 0), items.filter(i => i.kondisi === 'Rusak Berat').reduce((acc, item) => acc + parseInt(item.jumlah), 0));
}

// Render Custom Canvas Chart
function renderChart(baik, ringan, berat) {
  ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
  
  const total = baik + ringan + berat || 1;
  const data = [
    { label: 'Baik', value: baik, color: '#4ade80' },
    { label: 'R.Ringan', value: ringan, color: '#ffb347' },
    { label: 'R.Berat', value: berat, color: '#f87171' }
  ];

  const barWidth = 40;
  const gap = 30;
  const startX = 40;

  data.forEach((item, index) => {
    const barHeight = (item.value / total) * 120;
    const x = startX + index * (barWidth + gap);
    const y = 150 - barHeight;

    // Draw Bar
    ctx.fillStyle = item.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = item.color;
    ctx.fillRect(x, y, barWidth, barHeight);

    // Reset Shadow
    ctx.shadowBlur = 0;

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Plus Jakarta Sans';
    ctx.fillText(item.label, x - 5, 170);
    ctx.fillText(item.value.toString(), x + 15, y - 5);
  });
}

// Render Cards Grid
function renderCards() {
  const keyword = searchInput.value.toLowerCase();
  const roomFilter = filterRuangan.value;
  const statusFilter = filterKondisi.value;

  const filtered = items.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(keyword) || item.kode.toLowerCase().includes(keyword);
    const matchRoom = roomFilter === '' || item.ruangan === roomFilter;
    const matchStatus = statusFilter === '' || item.kondisi === statusFilter;
    return matchSearch && matchRoom && matchStatus;
  });

  if (filtered.length === 0) {
    inventoryContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Tidak ada data inventaris ditemukan.</p>`;
    return;
  }

  inventoryContainer.innerHTML = filtered.map(item => `
    <div class="item-card glass">
      <div class="item-head">
        <span class="item-code">${item.kode}</span>
        <span class="badge-status status-${item.kondisi.toLowerCase().replace(' ', '-')}">${item.kondisi}</span>
      </div>
      <h4 class="item-title">${item.nama}</h4>
      <p class="item-room">📍 ${item.ruangan} • Jumlah: <strong>${item.jumlah}</strong></p>
      <div class="card-actions">
        <button onclick="editItem('${item.id}')" class="btn btn-secondary">Edit</button>
        <button onclick="deleteItem('${item.id}')" class="btn btn-danger">Hapus</button>
      </div>
    </div>
  `).join('');
}

function renderAll() {
  renderCards();
  updateStats();
}

// Form Submission
itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = itemIdInput.value;

  const payload = {
    id: id || Date.now().toString(),
    nama: namaBarangInput.value,
    kode: kodeInventarisInput.value,
    ruangan: namaRuanganInput.value,
    jumlah: parseInt(jumlahBarangInput.value),
    kondisi: kondisiBarangInput.value
  };

  if (id) {
    items = items.map(i => i.id === id ? payload : i);
  } else {
    items.push(payload);
  }

  saveData();
  resetForm();
});

function editItem(id) {
  const target = items.find(i => i.id === id);
  if (!target) return;

  itemIdInput.value = target.id;
  namaBarangInput.value = target.nama;
  kodeInventarisInput.value = target.kode;
  namaRuanganInput.value = target.ruangan;
  jumlahBarangInput.value = target.jumlah;
  kondisiBarangInput.value = target.kondisi;

  formTitle.textContent = 'Edit Data Barang';
  btnSubmit.textContent = 'Perbarui Data';
  btnCancel.classList.remove('hidden');
}

function deleteItem(id) {
  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    items = items.filter(i => i.id !== id);
    saveData();
  }
}

function resetForm() {
  itemIdInput.value = '';
  itemForm.reset();
  formTitle.textContent = 'Tambah Barang Baru';
  btnSubmit.textContent = 'Simpan Barang';
  btnCancel.classList.add('hidden');
}

btnCancel.addEventListener('click', resetForm);

// Search & Filter Listeners
[searchInput, filterRuangan, filterKondisi].forEach(elem => {
  elem.addEventListener('input', renderCards);
});

// Theme Switcher
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  themeToggleBtn.textContent = isLight ? '☀️' : '🌙';
});

// Backup & Export Features
document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `AquaInventory_Backup_${Date.now()}.json`;
  anchor.click();
});

document.getElementById('importFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      items = JSON.parse(evt.target.result);
      saveData();
      alert('Data inventaris berhasil di-import!');
    } catch (err) {
      alert('File JSON tidak valid.');
    }
  };
  reader.readAsText(file);
});

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.error('SW Registration Failed', err));
  });
}

// Initial Boot
window.addEventListener('DOMContentLoaded', () => {
  initUnderwaterEffects();
  renderAll();
});