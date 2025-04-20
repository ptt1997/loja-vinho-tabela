// Configurações globais
const CONFIG = {
  URL_API: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLizIv1-mY-pphKqz033UE76cgZjaR7LI1BpYFsFr6qR7b3mDlx75L_FemuO5agUtpD0DNTQrPSKpYaEo4ogk-d92GbFlWaUGnDEZxVDLTlv8dl9LzS6BRQR8aYqBLQ0erGAucv4aHvyuVdE39SupfsV6i3Xk0zLXNtJeEwzF2kpFu1sgaridKbY4V2SfqzgHaoGDLeFkFm_kwI82W57vKyKwXDE7sOcJSFf3L_DA_rFIxwhnr1Ig1VQxA8wqaASkx9hDd1Ky4kj-VimV320MTQHj3qRuA&lib=MnQYBkRsDbv4uLRxNoSIgA-aoJlzzZ8rm',
  WHATSAPP: '5546920001218'
};

// Estado global
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Elementos DOM
const DOM = {
  tabela: document.getElementById('tabela-vinhos'),
  carrinho: document.getElementById('itens-carrinho'),
  total: document.getElementById('total'),
  modal: document.getElementById('modal'),
  imgModal: document.getElementById('imagem-modal')
};

// Carrega dados da planilha
async function carregarDados() {
  try {
    const response = await fetch(CONFIG.URL_API + `?t=${Date.now()}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (erro) {
    console.error("Falha na requisição:", erro);
    throw erro;
  }
}

// Preenche a tabela com dados
function renderizarTabela(dados) {
  const tbody = DOM.tabela.querySelector('tbody') || DOM.tabela.createTBody();
  tbody.innerHTML = '';

  dados.forEach(vinho => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="icone-imagem" onclick="abrirModal('${vinho['Link Imagem']}')">📷</span></td>
      <td>${vinho['Nome do Vinho']}</td>
      <td>${vinho['Descrição']}</td>
      <td>R$${vinho['Preço'].toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="1" class="quantidade">
        <button onclick="adicionarAoCarrinho('${vinho['Nome do Vinho'].replace(/'/g, "\\'")}', ${vinho['Preço']}, this.previousElementSibling.value)">
          +
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Funções do carrinho (mantenha as que já existem)
function adicionarAoCarrinho(nome, preco, quantidade) {
  // ... (use o mesmo código anterior)
}

function atualizarCarrinho() {
  // ... (use o mesmo código anterior)
}

// Inicialização
(async function init() {
  try {
    const dados = await carregarDados();
    renderizarTabela(dados);
    if (carrinho.length) atualizarCarrinho();
  } catch (erro) {
    DOM.tabela.innerHTML += `
      <tr>
        <td colspan="5" class="erro">
          Sistema temporariamente indisponível. Tente recarregar.
        </td>
      </tr>
    `;
  }
  // Controle do carrinho
function toggleCarrinho() {
  const painel = document.getElementById('carrinho-painel');
  painel.classList.toggle('ativo');
}

function atualizarContador() {
  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
  document.getElementById('carrinho-contador').textContent = totalItens;
  
  // Esconde contador se vazio
  document.getElementById('carrinho-contador').style.display = 
    totalItens > 0 ? 'flex' : 'none';
}

// Adicione no final da função atualizarCarrinho():
function atualizarCarrinho() {
  // ... (código existente)
  atualizarContador(); // Adicione esta linha
}
})();
