// =========================================================================
// PENTING: ISI DAN SESUAIKAN DATA DI BAWAH INI
// =========================================================================

// 1. Masukkan nomor WhatsApp Anda (Gunakan kode negara 62 di depan, TANPA tanda + atau spasi)
const NOMOR_WHATSAPP = '6281341683993'; 

// 2. Masukkan link foto/gambar QRIS DANA Anda di sini (Upload foto QRIS Anda ke postimages.org atau sejenisnya)
const FOTO_QRIS = 'QRIS.jpg';

// 3. Masukkan Detail Rekening Bank jika pembeli memilih Transfer Manual
const INFO_TRANSFER = `<strong>Dana:</strong> 083804073445<br><strong>A/N:</strong> faris`;

// =========================================================================


let cart = [];
let orderDetailsGlobal = ""; // Menyimpan rincian pesanan sementara sebelum dikirim ke WA

// Buka/Tutup Sidebar Keranjang
function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    sidebar.classList.toggle('translate-x-full');
}

// Tambah Item ke Keranjang
function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    updateCartUI();
    document.getElementById('cart-sidebar').classList.remove('translate-x-full');
}

// Perbarui Tampilan List di Keranjang
function updateCartUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center py-8">Keranjang masih kosong.</p>';
        cartCount.innerText = '0';
        cartTotal.innerText = 'Rp 0';
        return;
    }

    let total = 0;
    let count = 0;
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        count += item.quantity;

        cartItemsContainer.innerHTML += `
            <div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                    <h4 class="font-bold text-sm text-secondary">${item.name}</h4>
                    <span class="text-xs text-gray-500">Rp ${item.price.toLocaleString('id-ID')} x ${item.quantity}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="changeQuantity(${index}, -1)" class="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-sm font-bold hover:bg-gray-300">-</button>
                    <span class="text-sm font-semibold">${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)" class="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-sm font-bold hover:bg-gray-300">+</button>
                </div>
            </div>
        `;
    });

    cartCount.innerText = count;
    cartTotal.innerText = `Rp ${total.toLocaleString('id-ID')}`;
}

// Mengubah Kuantitas (+ atau -) di Keranjang
function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
}

// Mengubah Keterangan Instruksi Pembayaran sesuai Pilihan Dropdown
function handlePaymentChange() {
    const method = document.getElementById('payment-method').value;
    const instruction = document.getElementById('payment-instruction');

    if (method === 'qris') {
        instruction.className = "p-3 bg-yellow-100 text-xs rounded-lg text-yellow-900";
        instruction.innerHTML = "<strong>Info QRIS:</strong> Gambar QRIS akan muncul setelah menekan tombol di bawah. Silakan scan/screenshot untuk membayar, lalu sistem akan meneruskan rincian ke WhatsApp toko.";
    } else if (method === 'transfer') {
        instruction.className = "p-3 bg-blue-100 text-xs rounded-lg text-blue-900";
        instruction.innerHTML = "<strong>Info Transfer:</strong> Rekening bank toko akan ditampilkan pada langkah berikutnya sebelum diarahkan ke WhatsApp.";
    } else if (method === 'cod') {
        instruction.className = "p-3 bg-green-100 text-xs rounded-lg text-green-900";
        instruction.innerHTML = "<strong>Info COD:</strong> Bayar cash saat kurir sampai di rumah Anda. Klik tombol di bawah untuk langsung mengirim alamat ke WhatsApp.";
    }
}

// Tombol Proses Pemesanan / Checkout
function checkout() {
    const name = document.getElementById('cust-name').value;
    const address = document.getElementById('cust-address').value;
    const method = document.getElementById('payment-method').value;

    if (cart.length === 0) {
        alert('Keranjang Anda masih kosong!');
        return;
    }
    if (!name || !address) {
        alert('Mohon isi Nama dan Alamat pengiriman terlebih dahulu.');
        return;
    }

    let total = 0;
    let itemText = "";
    cart.forEach(item => {
        total += item.price * item.quantity;
        itemText += `- ${item.name} (${item.quantity} Porsi) : Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
    });

    let methodText = "";
    if(method === "qris") methodText = "QRIS";
    if(method === "transfer") methodText = "Transfer Bank Manual";
    if(method === "cod") methodText = "Bayar di Tempat (COD)";

    // Membuat Template Struktur Pesan WhatsApp yang Rapi
    orderDetailsGlobal = `*Halo Kak, Saya mau pesan!*\n\n` +
                         `*Detail Pesanan:*\n${itemText}\n` +
                         `*Total Belanja:* Rp ${total.toLocaleString('id-ID')}\n\n` +
                         `*Data Pengiriman:*\n` +
                         `- Nama: ${name}\n` +
                         `- Alamat: ${address}\n` +
                         `- Metode Pembayaran: *${methodText}*\n\n` +
                         `Mohon segera diproses ya kak, terima kasih!`;

    const modal = document.getElementById('payment-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    // Tampilkan Modal Instruksi Pembayaran sesuai Metode Pilihan
    modal.classList.remove('hidden');

    if (method === 'qris') {
        modalTitle.innerText = "Scan QRIS ";
        modalContent.innerHTML = `
            <p class="text-xs text-gray-600 mb-3">Silakan simpan/screenshot gambar QRIS di bawah ini, lalu bayar sejumlah <strong>Rp ${total.toLocaleString('id-ID')}</strong>.</p>
            <div class="border-2 border-dashed border-gray-300 p-2 rounded-lg bg-gray-50 flex justify-center items-center qr-container">
                <img src="${FOTO_QRIS}" alt="QRIS" onerror="this.src='https://imgur.com/gallery/qr-dana-HAVtsuc'
            <p class="text-[10px] text-gray-400 mt-2">Setelah bayar, wajib klik tombol hijau di bawah untuk mengirim detail pesanan ke WA.</p>
        `;
    } else if (method === 'transfer') {
        modalTitle.innerText = "Petunjuk Transfer Bank";
        modalContent.innerHTML = `
            <p class="text-xs text-gray-600 mb-2">Silakan transfer sebesar <strong>Rp ${total.toLocaleString('id-ID')}</strong> ke rekening toko:</p>
            <div class="bg-gray-100 p-3 rounded-lg w-full text-left font-mono text-xs mb-2">
                ${INFO_BANK}
            </div>
            <p class="text-[11px] text-yellow-700 font-semibold bg-yellow-50 p-2 rounded">Kirimkan bukti transfer setelah Anda menekan tombol Lanjut ke WhatsApp di bawah.</p>
        `;
    } else if (method === 'cod') {
        modalTitle.innerText = "Konfirmasi Pesanan COD";
        modalContent.innerHTML = `
            <div class="text-4xl my-2">🚚</div>
            <p class="text-xs text-gray-600">Pesanan COD sebesar <strong>Rp ${total.toLocaleString('id-ID')}</strong> atas nama <strong>${name}</strong> siap dikirim.</p>
            <p class="text-xs text-green-600 font-bold mt-2">Klik tombol hijau di bawah untuk meneruskan detail alamat ke kurir kami via WhatsApp.</p>
        `;
    }
}

// Eksekusi Pengiriman Data Menggunakan API WhatsApp Link
function redirectToWhatsApp() {
    const encodedText = encodeURIComponent(orderDetailsGlobal);
    const whatsappUrl = `https://wa.me/${NOMOR_WHATSAPP}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');

    // Reset keranjang belanjaan menjadi kosong setelah memesan
    cart = [];
    updateCartUI();
    document.getElementById('cust-name').value = "";
    document.getElementById('cust-address').value = "";
    closeModal();
    toggleCart();
}

// Tutup Pop-Up Modal Pembayaran
function closeModal() {
    document.getElementById('payment-modal').classList.add('hidden');
}
