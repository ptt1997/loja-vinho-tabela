// Configurações
const numeroWhatsApp = '5546920001218'; // Seu número aqui
const urlPlanilha = 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLizIv1-mY-pphKqz033UE76cgZjaR7LI1BpYFsFr6qR7b3mDlx75L_FemuO5agUtpD0DNTQrPSKpYaEo4ogk-d92GbFlWaUGnDEZxVDLTlv8dl9LzS6BRQR8aYqBLQ0erGAucv4aHvyuVdE39SupfsV6i3Xk0zLXNtJeEwzF2kpFu1sgaridKbY4V2SfqzgHaoGDLeFkFm_kwI82W57vKyKwXDE7sOcJSFf3L_DA_rFIxwhnr1Ig1VQxA8wqaASkx9hDd1Ky4kj-VimV320MTQHj3qRuA&lib=MnQYBkRsDbv4uLRxNoSIgA-aoJlzzZ8rm';; // Substitua pela sua URL

// Variáveis globais
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Elementos DOM
const elementos = {
  corpoTabela: document.getElementById('corpo-tabela'),
  itensCarrinho: document.getElementById('itens-carrinho'),
  total: document.getElementById('total'),
  finalizarBtn: document.getElementById('finalizar'),
  modal: document.getElementById('modal'),
  imagemModal: document.getElementById('imagem-modal'),
  fecharModal: document.querySelector('.fechar')
};

// Carrega os vinhos da planilha
function carregarVinhos() {
  fetch(urlPlanilha)
    .then(response => response.json())
    .then(vinhos => exibirVinhos(vinhos))
    .catch(err => {
      console.error("Erro ao carregar dados:", err);
      alert("Erro ao carregar produtos. Recarregue a página.");
    });
}

// Exibe os vinhos na tabela
function exibirVinhos(vinhos) {
  elementos.corpoTabela.innerHTML = '';
  
  vinhos.forEach(vinho => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="icone-imagem" onclick="abrirImagem('${vinho['Link Imagem']}')">📷</span></td>
      <td>${vinho['Nome do Vinho']}</td>
      <td>${vinho['Descrição']}</td>
      <td>R$${vinho['Preço'].toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="1" class="quantidade" style="width: 50px;">
        <button onclick="adicionarAoCarrinho('${vinho['Nome do Vinho']}', ${vinho['Preço']}, this.parentElement.querySelector('.quantidade').value)">+</button>
      </td>
    `;
    elementos.corpoTabela.appendChild(row);
  });
}

// Funções do Carrinho
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
  elementos.itensCarrinho.innerHTML = '';
  let total = 0;
  
  carrinho.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.quantidade}</td>
      <td>R$${(item.preco * item.quantidade).toFixed(2)}</td>
      <td><button onclick="removerItem('${item.nome}')">❌</button></td>
    `;
    elementos.itensCarrinho.appendChild(row);
    total += item.preco * item.quantidade;
  });
  
  elementos.total.textContent = `Total: R$${total.toFixed(2)}`;
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

function removerItem(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  atualizarCarrinho();
}

// Funções do Modal
function abrirImagem(url) {
  elementos.imagemModal.src = url;
  elementos.modal.style.display = 'block';
}

function fecharModal() {
  elementos.modal.style.display = 'none';
}

// Finalizar Pedido
function finalizarPedido() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }
  
  let mensagem = "📋 *PEDIDO DE VINHOS* 📋\n\n";
  carrinho.forEach(item => {
    mensagem += `➡ ${item.nome} (${item.quantidade}x): R$${(item.preco * item.quantidade).toFixed(2)}\n`;
  });
  
  mensagem += `\n💰 *TOTAL: R$${carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2)}*`;
  
  window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`, '_blank');
  
  // Limpa o carrinho (opcional)
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
  if (carrinho.length > 0) atualizarCarrinho();
});
