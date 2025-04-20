// Dados iniciais (substitua pela sua planilha depois)
const vinhosMock = [
  {
    "Nome do Vinho": "Cabernet Sauvignon",
    "Descrição": "Vinho tinto seco com notas de frutas vermelhas",
    "Preço": 89.90,
    "Marca": "VinhoFino",
    "Link Imagem": "https://exemplo.com/vinho1.jpg"
  },
  {
    "Nome do Vinho": "Chardonnay",
    "Descrição": "Vinho branco com aroma de baunilha",
    "Preço": 75.50,
    "Marca": "VinhoBom",
    "Link Imagem": "https://exemplo.com/vinho2.jpg"
  }
];

// Variáveis globais
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
const numeroWhatsApp = '5546920001218'; // Seu número com DDD

// Elementos DOM
const elementos = {
  vinhosContainer: document.getElementById('vinhos-container'),
  carrinhoItens: document.getElementById('carrinho-itens'),
  total: document.getElementById('total'),
  finalizarBtn: document.getElementById('finalizar'),
  modal: document.getElementById('modal'),
  imagemModal: document.getElementById('imagem-modal'),
  fecharModal: document.querySelector('.fechar')
};

// Funções principais
function carregarVinhos() {
  // Substitua por fetch do Google Sheets depois
  exibirVinhos(vinhosMock);
  
  // Versão com Google Sheets (descomente depois):
  /*
  fetch(https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLh0s-DdzFvXEmcUDNnAIh5fsu0EbN61P13mn9O3JAChi-V8Sy1RyzJ7QfKbH5gMSdNvaDqOuqY9Iinsq2wtSzicxhvBSjcdMWisC5-JgMbIJSOehMdT-wLzbFsdKG_GSPPhKIKF3oX73sMcSCvKaz51owukqbFo2ccWw4gVO9VHHTQRaTiCFbYzsdvoTsUkki4olrqri62tGynotfrq6kl6guuSDMTKtP_LEt7teZWfFclXDz2fOHI_1tWMW1TdylVvcWVBXyGnphzB3vxlEEi5qfpzRg&lib=MnQYBkRsDbv4uLRxNoSIgA-aoJlzzZ8rm)
    .then(response => response.json())
    .then(data => exibirVinhos(data))
    .catch(err => {
      console.error("Erro ao carregar vinhos:", err);
      exibirVinhos(vinhosMock); // Fallback
    });
  */
}

function exibirVinhos(vinhos) {
  elementos.vinhosContainer.innerHTML = '';
  
  vinhos.forEach(vinho => {
    const div = document.createElement('div');
    div.className = 'vinho';
    div.innerHTML = `
      <div class="img-placeholder" onclick="abrirModal('${vinho['Link Imagem']}')">
        🍷 Clique para ver
      </div>
      <h3>${vinho['Nome do Vinho']}</h3>
      <p>${vinho['Descrição']}</p>
      <p><strong>Marca:</strong> ${vinho['Marca']}</p>
      <p><strong>Preço:</strong> R$${vinho['Preço'].toFixed(2)}</p>
      <div class="controles">
        <input type="number" min="1" value="1" class="quantidade">
        <button onclick="adicionarAoCarrinho('${vinho['Nome do Vinho']}', ${vinho['Preço']}, this.parentElement.querySelector('.quantidade').value)">
          Adicionar
        </button>
      </div>
    `;
    elementos.vinhosContainer.appendChild(div);
  });
}

function adicionarAoCarrinho(nome, preco, quantidade) {
  quantidade = parseInt(quantidade);
  const itemExistente = carrinho.find(item => item.nome === nome);
  
  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({
      nome: nome,
      preco: parseFloat(preco),
      quantidade: quantidade
    });
  }
  
  atualizarCarrinho();
}

function atualizarCarrinho() {
  elementos.carrinhoItens.innerHTML = '';
  let total = 0;
  
  carrinho.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item-carrinho';
    div.innerHTML = `
      ${item.nome} 
      <span>${item.quantidade}x R$${(item.preco * item.quantidade).toFixed(2)}</span>
      <button onclick="removerItem('${item.nome}')">🗑️</button>
    `;
    elementos.carrinhoItens.appendChild(div);
    total += item.preco * item.quantidade;
  });
  
  elementos.total.textContent = `Total: R$${total.toFixed(2)}`;
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function removerItem(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  atualizarCarrinho();
}

function abrirModal(urlImagem) {
  elementos.imagemModal.src = urlImagem;
  elementos.modal.style.display = 'block';
}

function fecharModal() {
  elementos.modal.style.display = 'none';
}

function finalizarPedido() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }
  
  let mensagem = "🚀 *Pedido de Vinhos* 🚀\n\n";
  carrinho.forEach(item => {
    mensagem += `➡ ${item.nome} (${item.quantidade}x): R$${(item.preco * item.quantidade).toFixed(2)}\n`;
  });
  
  mensagem += `\n💵 *Total: R$${carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2)}*`;
  
  window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`, '_blank');
  
  // Limpa o carrinho após finalizar
  carrinho = [];
  atualizarCarrinho();
}

// Event Listeners
elementos.fecharModal.addEventListener('click', fecharModal);
elementos.finalizarBtn.addEventListener('click', finalizarPedido);
elementos.modal.addEventListener('click', (e) => {
  if (e.target === elementos.modal) fecharModal();
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  carregarVinhos();
  atualizarCarrinho();
});