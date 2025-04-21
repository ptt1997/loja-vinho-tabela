// URL do seu Google Apps Script
const SCRIPT_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhXup6HgdoDQj3J4-NODXfohWjyKnu8UY7wG8N1wCNJ8IlhVjlAmcdBNxxSGp27M4Gd3v25pk-K2ZfQ9cIcPCqk288o0R0boAJPugNXcDD0cWpiuJBuXFeIW1c_i5cleK6RiVNTHdaGVho6T-i4GaxJJGNzV9cFD_9mzmtyRM_mR36old1NGSiT-oSM5gnOuPQ0VmZtk8oNXpk9C-XkPHUeB4n_-qaIzHDCKPOMBVPlGVnQmbfuAM6KKebiBIywxCiXmkliTDBoi9doKuG-gpMUMVFvpjiGccYoedVg&lib=MQ7hZHoz0BREMTQBuxLFtQILLX6lkgy_q';

let cart = [];
let wines = [];

// Funções do Carrinho
function addToCart(wine, quantity) {
    const existingItem = cart.find(item => item.id === wine['Nome do Vinho']);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: wine['Nome do Vinho'],
            name: wine['Nome do Vinho'],
            price: parseFloat(wine['Preço']) || 0,
            quantity: quantity,
            image: wine['Link Imagem']
        });
    }
    
    updateCart();
    showToast('Item adicionado ao carrinho!');
}

function updateCart() {
    // Atualizar contador
    document.getElementById('cart-count').textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Atualizar itens
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
        document.getElementById('cart-total').textContent = 'R$ 0,00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        itemElement.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <p>${item.quantity} x ${item.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</p>
                <div class="cart-item-actions">
                    <button onclick="updateCartItem(${index}, ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateCartItem(${index}, ${item.quantity + 1})">+</button>
                    <span class="remove-item" onclick="removeFromCart(${index})">
                        <i class="fas fa-trash"></i>
                    </span>
                </div>
            </div>
            <div>
                ${(item.price * item.quantity).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
            </div>
        `;
        
        cartItems.appendChild(itemElement);
        total += item.price * item.quantity;
    });
    
    document.getElementById('cart-total').textContent = total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
}

function updateCartItem(index, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        updateCart();
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    showToast('Item removido do carrinho');
}

// Funções da UI
function toggleCart() {
    document.getElementById('cart').classList.toggle('active');
}

function openImageModal(imageUrl) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('modal-image');
    
    img.src = imageUrl || 'https://via.placeholder.com/400?text=Imagem+Não+Disponível';
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('image-modal').style.display = 'none';
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Carregar vinhos
function loadWines() {
    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            wines = data;
            renderWines();
        })
        .catch(error => {
            console.error('Erro ao carregar vinhos:', error);
            document.getElementById('wine-table-body').innerHTML = `
                <tr>
                    <td colspan="7">Erro ao carregar os vinhos. Recarregue a página.</td>
                </tr>
            `;
        });
}

function renderWines() {
    const tableBody = document.getElementById('wine-table-body');
    tableBody.innerHTML = '';
    
    wines.forEach(wine => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <i class="fas fa-camera wine-image" onclick="openImageModal('${wine['Link Imagem']}')"></i>
            </td>
            <td>${wine['Nome do Vinho']}</td>
            <td>${wine['Descrição']}</td>
            <td>${wine['Marca']}</td>
            <td>${parseFloat(wine['Preço']).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</td>
            <td>
                <div class="quantity-control">
                    <button class="quantity-btn" onclick="this.nextElementSibling.stepDown()">-</button>
                    <input type="number" min="1" value="1" class="quantity-input">
                    <button class="quantity-btn" onclick="this.previousElementSibling.stepUp()">+</button>
                </div>
            </td>
            <td>
                <button class="add-to-cart-btn" onclick="addToCart(wine, parseInt(this.parentElement.previousElementSibling.querySelector('.quantity-input').value))">
                    Adicionar
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) {
        showToast('Seu carrinho está vazio!');
        return;
    }
    
    const phone = '5546920001218';
    let message = 'Olá, gostaria de fazer o seguinte pedido:\n\n';
    
    cart.forEach(item => {
        message += `*${item.name}*\n`;
        message += `Quantidade: ${item.quantity}\n`;
        message += `Preço unitário: ${item.price.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}\n`;
        message += `Subtotal: ${(item.price * item.quantity).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `*Total: ${total.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}*`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadWines();
    
    // CSS adicional para toast
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #5e1914;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            z-index: 1000;
            animation: fadeIn 0.3s;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; bottom: 0; }
            to { opacity: 1; bottom: 20px; }
        }
    `;
    document.head.appendChild(style);
});