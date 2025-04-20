// URL do seu Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/echo?user_content_key=AehSKLjvNkuZiLizqN-_wylFm5A4h_jZ6CAXA1R1XS9njQk5C9Kw5AuREIPNgv_KBHeXbmDTU5LRDTQlAOUnY5IzSXgNhzsvb875sVxU4ekh5DHjL6K2kEuCExO2KlBjbi8LwFafX7bzL-lBFgzle-APA4KWdfIdzj09o97Bc_jk32yGs73fwBh5pOFXd59TNMxYh0OKo9_IVv4F5SX2Phkly-DEqjGWuylOsBhW4Or3DDtP0jBXtWdl5BQFWxzElQ&lib=MQ7hZHoz0BREMTQBuxLFtQILLX6lkgy_q';

// Variáveis globais
let cart = [];
let wines = [];

// Quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    loadWines();
    
    // Verificar se há itens no carrinho no localStorage
    const savedCart = localStorage.getItem('wineCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
});

// Carregar vinhos do Google Sheets
function loadWines() {
    fetch(SCRIPT_URL)
        .then(response => response.json())
        .then(data => {
            wines = data;
            renderWineTable();
        })
        .catch(error => {
            console.error('Erro ao carregar vinhos:', error);
            document.getElementById('wine-table-body').innerHTML = 
                '<tr><td colspan="7" style="text-align: center;">Erro ao carregar os vinhos. Por favor, recarregue a página.</td></tr>';
        });
}

// Renderizar tabela de vinhos
function renderWineTable() {
    const tableBody = document.getElementById('wine-table-body');
    tableBody.innerHTML = '';

    if (wines.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhum vinho encontrado.</td></tr>';
        return;
    }

    wines.forEach(wine => {
        const row = document.createElement('tr');
        
        // Coluna da Imagem (ícone de câmera)
        const imgCell = document.createElement('td');
        if (wine['Link Imagem']) {
            const imgIcon = document.createElement('i');
            imgIcon.className = 'fas fa-camera wine-image';
            imgIcon.style.cursor = 'pointer';
            imgIcon.onclick = () => openImageModal(wine['Link Imagem']);
            imgCell.appendChild(imgIcon);
        } else {
            imgCell.textContent = '-';
        }
        
        // Coluna Nome
        const nameCell = document.createElement('td');
        nameCell.textContent = wine['Nome do Vinho'] || '-';
        
        // Coluna Descrição
        const descCell = document.createElement('td');
        descCell.textContent = wine['Descrição'] || '-';
        
        // Coluna Marca
        const brandCell = document.createElement('td');
        brandCell.textContent = wine['Marca'] || '-';
        
        // Coluna Preço
        const priceCell = document.createElement('td');
        const price = parseFloat(wine['Preço']) || 0;
        priceCell.textContent = price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        // Coluna Quantidade
        const qtyCell = document.createElement('td');
        const qtyControl = document.createElement('div');
        qtyControl.className = 'quantity-control';
        
        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-btn';
        minusBtn.innerHTML = '-';
        minusBtn.onclick = () => adjustQuantity(minusBtn, -1);
        
        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn';
        plusBtn.innerHTML = '+';
        plusBtn.onclick = () => adjustQuantity(plusBtn, 1);
        
        const qtyInput = document.createElement('input');
        qtyInput.type = 'text';
        qtyInput.className = 'quantity-input';
        qtyInput.value = '1';
        qtyInput.min = '1';
        
        qtyControl.appendChild(minusBtn);
        qtyControl.appendChild(qtyInput);
        qtyControl.appendChild(plusBtn);
        qtyCell.appendChild(qtyControl);
        
        // Coluna Ação (Adicionar ao Carrinho)
        const actionCell = document.createElement('td');
        const addBtn = document.createElement('button');
        addBtn.className = 'add-to-cart-btn';
        addBtn.textContent = 'Adicionar';
        addBtn.onclick = () => addToCart(wine, parseInt(qtyInput.value));
        actionCell.appendChild(addBtn);
        
        // Montar a linha
        row.appendChild(imgCell);
        row.appendChild(nameCell);
        row.appendChild(descCell);
        row.appendChild(brandCell);
        row.appendChild(priceCell);
        row.appendChild(qtyCell);
        row.appendChild(actionCell);
        
        tableBody.appendChild(row);
    });
}

// Ajustar quantidade
function adjustQuantity(button, change) {
    const qtyControl = button.parentElement;
    const input = qtyControl.querySelector('.quantity-input');
    let newValue = parseInt(input.value) + change;
    
    if (newValue < 1) newValue = 1;
    
    input.value = newValue;
}

// Adicionar ao carrinho
function addToCart(wine, quantity) {
    // Verificar se o vinho já está no carrinho
    const existingItem = cart.find(item => item.id === wine['Nome do Vinho']);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: wine['Nome do Vinho'],
            name: wine['Nome do Vinho'],
            description: wine['Descrição'],
            brand: wine['Marca'],
            price: parseFloat(wine['Preço']) || 0,
            quantity: quantity,
            image: wine['Link Imagem']
        });
    }
    
    updateCart();
    showCartNotification();
}

// Atualizar carrinho
function updateCart() {
    // Salvar carrinho no localStorage
    localStorage.setItem('wineCart', JSON.stringify(cart));
    
    // Atualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    
    // Atualizar lista de itens
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Seu carrinho está vazio</p>';
        document.getElementById('cart-total').textContent = 'R$ 0,00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        const itemInfo = document.createElement('div');
        itemInfo.className = 'cart-item-info';
        
        const itemName = document.createElement('div');
        itemName.className = 'cart-item-name';
        itemName.textContent = item.name;
        
        const itemBrand = document.createElement('div');
        itemBrand.className = 'cart-item-brand';
        itemBrand.textContent = item.brand;
        
        const itemPrice = document.createElement('div');
        itemPrice.className = 'cart-item-price';
        itemPrice.textContent = (item.price * item.quantity).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
        
        const itemQty = document.createElement('div');
        itemQty.className = 'cart-item-quantity';
        
        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-btn';
        minusBtn.innerHTML = '-';
        minusBtn.onclick = () => adjustCartItem(index, -1);
        
        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn';
        plusBtn.innerHTML = '+';
        plusBtn.onclick = () => adjustCartItem(index, 1);
        
        const qtyInput = document.createElement('input');
        qtyInput.type = 'text';
        qtyInput.className = 'quantity-input';
        qtyInput.value = item.quantity;
        qtyInput.onchange = (e) => updateCartItemQuantity(index, parseInt(e.target.value) || 1);
        
        const removeBtn = document.createElement('span');
        removeBtn.className = 'cart-item-remove';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.onclick = () => removeFromCart(index);
        
        itemQty.appendChild(minusBtn);
        itemQty.appendChild(qtyInput);
        itemQty.appendChild(plusBtn);
        
        itemInfo.appendChild(itemName);
        itemInfo.appendChild(itemBrand);
        itemInfo.appendChild(itemPrice);
        itemInfo.appendChild(itemQty);
        
        itemElement.appendChild(itemInfo);
        itemElement.appendChild(removeBtn);
        
        cartItems.appendChild(itemElement);
        
        total += item.price * item.quantity;
    });
    
    document.getElementById('cart-total').textContent = total.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    });
}

// Ajustar item do carrinho
function adjustCartItem(index, change) {
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        updateCart();
    }
}

// Atualizar quantidade do item no carrinho
function updateCartItemQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        updateCart();
    }
}

// Remover do carrinho
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Mostrar notificação de item adicionado
function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = 'Item adicionado ao carrinho!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Alternar visibilidade do carrinho
function toggleCart() {
    const cart = document.getElementById('floating-cart');
    cart.classList.toggle('active');
}

// Abrir modal de imagem
function openImageModal(imageUrl) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    
    modal.style.display = 'block';
    modalImg.src = imageUrl;
}

// Fechar modal de imagem
function closeModal() {
    document.getElementById('image-modal').style.display = 'none';
}

// Enviar pedido para WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    const phoneNumber = '5546920001218';
    let message = 'Olá, gostaria de fazer o seguinte pedido:\n\n';
    
    cart.forEach(item => {
        message += `- ${item.name} (${item.brand}): ${item.quantity} x ${item.price.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        })}\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Total: ${total.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    })}*`;
    
    message += '\n\nPor favor, confirme o pedido. Obrigado!';
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Limpar carrinho após envio
    cart = [];
    updateCart();
    toggleCart();
}

// Fechar modal ao clicar fora da imagem
window.onclick = function(event) {
    const modal = document.getElementById('image-modal');
    if (event.target === modal) {
        closeModal();
    }
};
