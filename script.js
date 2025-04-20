// URL do seu Google Apps Script (substitua pela sua URL real)
const SCRIPT_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLinoUQ9Ny9GZn1isbdMCYDvrGcKq6y50nG_m6A95VUAi7ONY1MtOGmv-YAQTEBX4SSTPPcwql2vYhRhz8Mq-P4CNtXL0M0Z7xks57h1eKU8-kHpVJDYpOab3I-Ju3ynhwP_wVeKWcnWUwaWkjZlc6vFWapiegCm1UfHyr_-W5GnRuUM3vTBr2IwV1XCh_tis2blOcop0r-bS5yh_xUlOY2D1kky9FnJYo9ulg7qUuy7UUddEhqh75Y9d2ldCYrftOV0sJJ6apH2xiRDta-ORouXeq-hEPSyoHAYNTai&lib=MQ7hZHoz0BREMTQBuxLFtQILLX6lkgy_q';

// Variáveis globais
let cart = [];
let wines = [];

// Funções para manipular cookies
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
    showAlert('Carregando vinhos...', 'info');
    
    fetch(SCRIPT_URL)
        .then(response => {
            if (!response.ok) throw new Error("Erro na rede: " + response.status);
            return response.json();
        })
        .then(data => {
            wines = data;
            if (!wines || wines.length === 0) {
                showAlert('Nenhum vinho encontrado na planilha', 'error');
                wines = [];
            }
            renderWineTable();
        })
        .catch(error => {
            console.error('Erro ao carregar vinhos:', error);
            showAlert('Erro ao carregar os vinhos. Recarregue a página.', 'error');
            document.getElementById('wine-table-body').innerHTML = `
                <tr>
                    <td colspan="7" class="error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        Não foi possível carregar os vinhos. Recarregue a página.
                    </td>
                </tr>
            `;
        });
}

// Renderizar tabela de vinhos
function renderWineTable() {
    const tableBody = document.getElementById('wine-table-body');
    tableBody.innerHTML = '';

    if (!wines || wines.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    <i class="fas fa-wine-bottle"></i>
                    Nenhum vinho disponível no momento
                </td>
            </tr>
        `;
        return;
    }

    wines.forEach(wine => {
        const row = document.createElement('tr');
        
        // Coluna da Imagem
        const imgCell = document.createElement('td');
        if (wine['Link Imagem']) {
            const imgIcon = document.createElement('i');
            imgIcon.className = 'fas fa-camera wine-image';
            imgIcon.title = 'Ver imagem do vinho';
            imgIcon.onclick = () => openImageModal(wine['Link Imagem']);
            imgCell.appendChild(imgIcon);
        } else {
            imgCell.innerHTML = '<i class="fas fa-wine-bottle no-image"></i>';
        }
        
        // Coluna Nome
        const nameCell = document.createElement('td');
        nameCell.className = 'wine-name';
        nameCell.textContent = wine['Nome do Vinho'] || 'Sem nome';
        
        // Coluna Descrição
        const descCell = document.createElement('td');
        descCell.className = 'wine-desc';
        descCell.textContent = wine['Descrição'] || 'Descrição não disponível';
        
        // Coluna Marca
        const brandCell = document.createElement('td');
        brandCell.className = 'wine-brand';
        brandCell.textContent = wine['Marca'] || '-';
        
        // Coluna Preço
        const priceCell = document.createElement('td');
        const price = parseFloat(wine['Preço']) || 0;
        priceCell.innerHTML = `<span class="price-tag">${price.toLocaleString('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        })}</span>`;
        
        // Coluna Quantidade (com botões + primeiro)
        const qtyCell = document.createElement('td');
        const qtyControl = document.createElement('div');
        qtyControl.className = 'quantity-control';
        
        // Botão de +
        const plusBtn = document.createElement('button');
        plusBtn.className = 'quantity-btn plus';
        plusBtn.innerHTML = '<i class="fas fa-plus"></i>';
        plusBtn.onclick = (e) => {
            e.preventDefault();
            adjustQuantity(plusBtn, 1);
        };
        
        // Input de quantidade
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'quantity-input';
        qtyInput.value = '1';
        qtyInput.min = '1';
        qtyInput.onchange = (e) => {
            if (e.target.value < 1) e.target.value = 1;
        };
        
        // Botão de -
        const minusBtn = document.createElement('button');
        minusBtn.className = 'quantity-btn minus';
        minusBtn.innerHTML = '<i class="fas fa-minus"></i>';
        minusBtn.onclick = (e) => {
            e.preventDefault();
            adjustQuantity(minusBtn, -1);
        };
        
        qtyControl.appendChild(plusBtn);
        qtyControl.appendChild(qtyInput);
        qtyControl.appendChild(minusBtn);
        qtyCell.appendChild(qtyControl);
        
        // Coluna Ação
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
    if (!wine || !quantity || quantity < 1) {
        showAlert('Quantidade inválida!', 'error');
        return;
    }
    
    // Verificar se o vinho já está no carrinho
    const existingItemIndex = cart.findIndex(item => item.id === wine['Nome do Vinho']);
    
    if (existingItemIndex >= 0) {
        cart[existingItemIndex].quantity += quantity;
        showAlert('Quantidade atualizada no carrinho!', 'success');
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
        showAlert('Item adicionado ao carrinho!', 'success');
    }
    
    updateCart();
    toggleCart(); // Mostra o carrinho automaticamente
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
        cartItems.innerHTML = `
            <div class="empty-cart-message">
                <i class="fas fa-wine-bottle"></i>
                <p>Seu carrinho está vazio</p>
            </div>
        `;
        document.getElementById('cart-total').textContent = 'R$ 0,00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        
        // Imagem do item
        const imgDiv = document.createElement('div');
        if (item.image) {
            imgDiv.innerHTML = `<img src="${item.image}" class="cart-item-image" alt="${item.name}" onclick="openImageModal('${item.image}')">`;
        } else {
            imgDiv.innerHTML = '<div class="cart-item-image no-image"><i class="fas fa-wine-bottle"></i></div>';
        }
        
        // Detalhes do item
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'cart-item-details';
        
        detailsDiv.innerHTML = `
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-brand">${item.brand}</div>
            <div class="cart-item-price">
                ${(item.price * item.quantity).toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                })}
                <span class="item-unit-price">(${item.price.toLocaleString('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                })} un)</span>
            </div>
        `;
        
        // Controles de quantidade
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'cart-item-actions';
        
        actionsDiv.innerHTML = `
            <button class="quantity-btn plus" onclick="adjustCartItem(${index}, 1)">
                <i class="fas fa-plus"></i>
            </button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                   onchange="updateCartItemQuantity(${index}, parseInt(this.value) || 1)">
            <button class="quantity-btn minus" onclick="adjustCartItem(${index}, -1)">
                <i class="fas fa-minus"></i>
            </button>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        detailsDiv.appendChild(actionsDiv);
        itemElement.appendChild(imgDiv);
        itemElement.appendChild(detailsDiv);
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
        showAlert('Quantidade atualizada!', 'success');
    }
}

// Atualizar quantidade do item no carrinho
function updateCartItemQuantity(index, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        cart[index].quantity = newQuantity;
        updateCart();
        showAlert('Quantidade atualizada!', 'success');
    }
}

// Remover do carrinho
function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const removedItem = cart.splice(index, 1)[0];
        updateCart();
        showAlert(`${removedItem.name} removido do carrinho`, 'success');
    }
}

// Mostrar alerta
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 500);
    }, 3000);
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
        showAlert('Seu carrinho está vazio!', 'error');
        return;
    }
    
    const phoneNumber = '5546920001218';
    let message = '🍷 *PEDIDO DE VINHOS* 🍷\n\n';
    message += 'Olá, gostaria de fazer o seguinte pedido:\n\n';
    
    // Adicionar itens ao pedido
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
    
    // Calcular total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `*VALOR TOTAL: ${total.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    })}*\n\n`;
    
    message += 'Por favor, confirme o recebimento deste pedido. Obrigado! 🍇';
    
    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir em nova aba
    window.open(whatsappUrl, '_blank');
    
    // Opcional: limpar carrinho após envio
    // cart = [];
    // updateCart();
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
};
