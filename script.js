// Configurações
const CONFIG = {
  URL_API: 'https://script.google.com/macros/s/AKfycbzYOUR_NEW_SCRIPT_ID/exec', // USE SUA NOVA URL AQUI
  WHATSAPP: '5546920001218'
};

// Estado global
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Elementos DOM
const DOM = {
  corpoTabela: document.getElementById('corpo-tabela'),
  carrinhoItens: document.getElementById('itens-carrinho'),
  total: document.getElementById('total'),
  carrinhoIcone: document.getElementById('carrinho-icone'),
  carrinhoPainel: document.getElementById('carrinho-painel'),
  carrinhoContador: document.getElementById('carrinho-contador'),
  modal: document.getElementById('modal'),
  imgModal: document.getElementById('imagem-modal')
};

// Função para carregar dados com tratamento robusto
async function carregarDados() {
  try {
    // Adiciona timestamp para evitar cache
    const url = `${CONFIG.URL_API}?timestamp=${Date.now()}`;
    console.log('URL da requisição:', url); // Debug
    
    const response = await fetch(url, {
      mode: 'no-cors', // Modo especial para contornar CORS
      redirect: 'follow'
    });
    
    console.log('Status da resposta:', response.status); // Debug
    
    // Verifica se a resposta é OK (200-299)
    if (!response.ok && response.type !== 'opaque') {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    
    const dados = await response.json();
    console.log('Dados recebidos:', dados); // Debug
    
    if (!Array.isArray(dados)) {
      throw new Error('Formato de dados inválido');
    }
    
    return dados;
    
  } catch (erro) {
    console.error('Erro ao carregar dados:', erro);
    
    // Fallback com dados de exemplo
    return [
      {
        "Nome do Vinho": "Vinho Reserva",
        "Descrição": "Exemplo carregado localmente",
        "Preço": 89.90,
        "Marca": "Vinícola Fallback",
        "Link Imagem": "https://via.placeholder.com/150"
      }
    ];
  }
}

// Renderiza a tabela
function renderizarTabela(dados) {
  DOM.corpoTabela.innerHTML = '';
  
  dados.forEach(vinho => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="icone-imagem" onclick="abrirModal('${vinho['Link Imagem']}')">📷</span></td>
      <td>${vinho['Nome do Vinho']}</td>
      <td>${vinho['Descrição']}</td>
      <td>R$${vinho['Preço'].toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="1" class="quantidade">
        <button onclick="adicionarAoCarrinho('${escapeString(vinho['Nome do Vinho'])}', ${vinho['Preço']}, this.previousElementSibling.value)">
          Adicionar
        </button>
      </td>
    `;
    DOM.corpoTabela.appendChild(tr);
  });
}

// Funções do carrinho (mantidas conforme anterior)
function adicionarAoCarrinho(nome, preco, quantidade) {
  // ... (código existente)
}

function atualizarCarrinho() {
  // ... (código existente)
}

// Inicialização
async function init() {
  try {
    const dados = await carregarDados();
    renderizarTabela(dados);
    
    if (carrinho.length > 0) {
      atualizarCarrinho();
    }
    
  } catch (erro) {
    console.error('Erro crítico:', erro);
    DOM.corpoTabela.innerHTML = `
      <tr>
        <td colspan="5" class="erro">
          Sistema temporariamente indisponível. Recarregue a página.
        </td>
      </tr>
    `;
  }
}

// Inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
