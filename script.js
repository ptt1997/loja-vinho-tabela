// Adicione estas variáveis globais no início do seu script
let carrinho = [];
let totalPedido = 0;

// Função para adicionar ao carrinho
function adicionarAoCarrinho(nome, preco, quantidade) {
  const itemExistente = carrinho.find(item => item.nome === nome);
  
  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({
      nome: nome,
      preco: preco,
      quantidade: quantidade
    });
  }
  
  atualizarTotal();
  atualizarCarrinho();
}

// Função para atualizar o carrinho na interface
function atualizarCarrinho() {
  const carrinhoContainer = document.getElementById('carrinho-container');
  carrinhoContainer.innerHTML = '';
  
  carrinho.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'carrinho-item';
    itemElement.innerHTML = `
      <span>${item.nome} - ${item.quantidade}x R$${item.preco.toFixed(2)}</span>
      <button onclick="removerItem('${item.nome}')">Remover</button>
      <button onclick="alterarQuantidade('${item.nome}', -1)">-</button>
      <button onclick="alterarQuantidade('${item.nome}', 1)">+</button>
    `;
    carrinhoContainer.appendChild(itemElement);
  });
}

// Funções auxiliares
function removerItem(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  atualizarCarrinho();
}

function alterarQuantidade(nome, delta) {
  const item = carrinho.find(item => item.nome === nome);
  if (item) {
    item.quantidade += delta;
    if (item.quantidade <= 0) {
      removerItem(nome);
    } else {
      atualizarCarrinho();
    }
  }
}

function atualizarTotal() {
  totalPedido = carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  document.getElementById('total-pedido').textContent = `Total: R$${totalPedido.toFixed(2)}`;
}
