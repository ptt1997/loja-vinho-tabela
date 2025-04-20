// URL do seu Google Apps Script (substitua pelo seu URL real)
const SCRIPT_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLj6hu1tQSKDYHg3PqG7BbI6dnvzbIr9u-1kak7pE4BqHue68ONXvEJIL7hzOxfRrNnhAV4inl3gfSUy69UzLsBlEeI_K7UgB6dAFI00pTa57rDReWspfWROLysXX1mcL36IenQ5sZ_zr0nnq1TtUCLc96ORP447r8IOCbwIspRtmL7xa3bk_t_UGgj5pc1DptlTJS5bKHjpyx1LDvwH98iCYMKWcjDzcu-SfJXt9C_uPV_bH6gI1mll5_pEN3GRaQMhtR_hIu5UHO2QBYD8s8P29I4spLcqulChu1Ic&lib=MQ7hZHoz0BREMTQBuxLFtQILLX6lkgy_q';

// Variáveis globais
let cart = [];
let wines = [];

// Funções para manipular cookies (solução para o erro de storage)
function setCookie(nome, valor, dias) {
    const data = new Date();
    data.setTime(data.getTime() + (dias * 24 * 60 * 60 * 1000));
    const expira = "expires=" + data.toUTCString();
    document.cookie = nome + "=" + encodeURIComponent(valor) + ";" + expira + ";path=/;SameSite=Lax";
}

function getCookie(nome) {
    const nomeCookie = nome + "=";
    const cookies = document.cookie.split(';');
    for(let i = 0; i < cookies.length; i++) {
        let c = cookies[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(nomeCookie) === 0) {
            return decodeURIComponent(c.substring(nomeCookie.length, c.length));
        }
    }
    return "";
}

// Quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    loadWines();
    
    // Verificar cookies ao invés de localStorage
    const savedCart = getCookie('wineCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCart();
        } catch (e) {
            console.error("Erro ao ler carrinho:", e);
            cart = [];
        }
    }
});

// Carregar vinhos do Google Sheets
function loadWines() {
    fetch(SCRIPT_URL)
        .then(response => {
            if (!response.ok) throw new Error("Erro na rede");
            return response.json();
        })
        .then(data => {
            wines = data;
            renderWineTable();
        })
        .catch(error => {
            console.error('Erro ao carregar vinhos:', error);
            document.getElementById('wine-table-body').innerHTML = 
                '<tr><td colspan="7" class="error-message">Erro ao carregar os vinhos. Recarregue a página ou tente mais tarde.</td></tr>';
        });
}

// Renderizar tabela de vinhos
function renderWineTable() {
    const tableBody = document.getElementById('wine-table-body');
    tableBody.innerHTML = '';

    if (!wines || wines.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="empty-message">Nenhum vinho disponível no momento.</td></tr>';
        return;
    }

    wines.forEach(wine => {
        const row = document.createElement('tr');
        
        // Coluna da Imagem (ícone de câmera)
        const imgCell = document.createElement('td');
        if (wine['Link Imagem']) {
            const imgIcon = document.createElement('i');
            imgIcon.className = 'fas fa-camera wine-image';
            imgIcon.title = 'Ver imagem do vinho';
            imgIcon.onclick = () => openImageModal(wine['Link Imagem']);
            imgCell.appendChild(imgIcon);
        } else {
            imgCell.innerHTML = '<i class="fas fa-wine-bottle"></i>';
        }
        
        // Coluna Nome
        const nameCell = document.createElement('td');
        nameCell.textContent = wine['Nome do Vinho'] || 'Sem nome';
        
        // Coluna Descrição
        const descCell = document.createElement('td');
        descCell.textContent = wine['Descrição'] || 'Descrição não disponível';
        
        // Coluna Marca
        const brandCell = document.createElement('td');
        brandCell.textContent = wine['Marca'] || '-';
        
        // Coluna Preço
        const priceCell = document.createElement('td');
        const price = parseFloat(wine['Preço']) || 0;
        priceCell.textContent = price.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        });
        
        // Coluna Quantidade
        const qtyCell = document.createElement('td');
        const qtyControl = document.createElement('div');
        qtyControl.className = 'quantity-control';
        
        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-btn';
        minusBtn.innerHTML = '<i class="fas fa-minus"></i>';
        minusBtn.onclick = (e) => {
            e.preventDefault();
            adjustQuantity(minusBtn, -1);
        };
        
        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn';
        plusBtn.innerHTML = '<i class="fas fa-plus"></i>';
        plusBtn.onclick = (e) => {
            e.preventDefault();
            adjustQuantity(plusBtn, 1);
        };
        
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'quantity-input';
        qtyInput.value = '1';
        qtyInput.min = '1';
        qtyInput.onchange = (e) => {
            if (e.target.value < 1) e.target.value = 1;
        };
        
        qtyControl.appendChild(minusBtn);
        qtyControl.appendChild(qtyInput);
        qtyControl.appendChild(plusBtn);
        qtyCell.appendChild(qtyControl);
        
        // Coluna Ação (Adicionar ao Carrinho)
        const actionCell = document.createElement('td');
        const addBtn = document.createElement('button');
        addBtn.className = 'add-to-cart-btn';
        addBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Adicionar';
        addBtn.onclick = (e) => {
            e.preventDefault();
            addToCart(wine, parseInt(qtyInput.value) || 1);
        };
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
    const qtyControl = button.closest('.quantity-control');
    const input = qtyControl.querySelector('.quantity-input');
    let newValue = parseInt(input.value) + change;
    
    if (newValue < 1) newValue = 1;
    
    input.value = newValue;
}

// Adicionar ao carrinho
function addToCart(wine, quantity) {
    if (!wine || !quantity || quantity < 1) return;
    
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
    // Salvar carrinho em cookie (válido por 7 dias)
    setCookie('wineCart', JSON.stringify(cart), 7);
    
    // Atualizar contador
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    
    // Atualizar lista de itens
    const cartItems = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message"><i class="fas fa-wine-bottle"></i><br>Seu carrinho está vazio</p>';
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
        minusBtn.innerHTML = '<i class="fas fa-minus"></i>';
        minusBtn.onclick = (e) => {
            e.preventDefault();
            adjustCartItem(index, -1);
        };
        
        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn';
        plusBtn.innerHTML = '<i class="fas fa-plus"></i>';
        plusBtn.onclick = (e) => {
            e.preventDefault();
            adjustCartItem(index, 1);
        };
        
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'quantity-input';
        qtyInput.value = item.quantity;
        qtyInput.min = '1';
        qtyInput.onchange = (e) => {
            const newQty = parseInt(e.target.value) || 1;
            updateCartItemQuantity(index, newQty);
        };
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'cart-item-remove';
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.onclick = (e) => {
            e.preventDefault();
            removeFromCart(index);
        };
        
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
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        updateCart();
    }
}

// Mostrar notificação de item adicionado
function showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = '<i class="fas fa-check-circle"></i> Item adicionado ao carrinho!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 2000);
}

// Alternar visibilidade do carrinho
function toggleCart() {
    const cartElement = document.getElementById('floating-cart');
    cartElement.classList.toggle('active');
}

// Abrir modal de imagem
function openImageModal(imageUrl) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    
    if (!imageUrl) {
        modalImg.src = 'https://via.placeholder.com/600x400?text=Imagem+Indispon%C3%ADvel';
    } else {
        modalImg.src = imageUrl;
    }
    
    modal.style.display = 'block';
}

// Fechar modal de imagem
function closeModal() {
    document.getElementById('image-modal').style.display = 'none';
}

// Enviar pedido para WhatsApp
function sendToWhatsApp() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio! Adicione vinhos antes de finalizar.');
        return;
    }
    
    const phoneNumber = '5546920001218';
    let message = '🍷 *Pedido de Vinhos* 🍷\n\n';
    message += 'Olá, gostaria de fazer o seguinte pedido:\n\n';
    
    cart.forEach((item, index) => {
        message += `*${index + 1}. ${item.name}* (${item.brand})\n`;
        message += `Quantidade: ${item.quantity}\n`;
        message += `Preço unitário: ${item.price.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        })}\n`;
        message += `Subtotal: ${(item.price * item.quantity).toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        })}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `*TOTAL: ${total.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    })}*\n\n`;
    
    message += 'Por favor, confirme o pedido. Obrigado! 🍇';
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir em nova aba
    window.open(whatsappUrl, '_blank');
    
    // Limpar carrinho após envio (opcional)
    // cart = [];
    // updateCart();
    // toggleCart();
}

// Fechar modal ao clicar fora da imagem
window.onclick = function(event) {
    const modal = document.getElementById('image-modal');
    if (event.target === modal) {
        closeModal();
    }
};

// Fechar carrinho ao pressionar Esc
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const cartElement = document.getElementById('floating-cart');
        if (cartElement.classList.contains('active')) {
            toggleCart();
        } else {
            closeModal();
        }
    }
});
