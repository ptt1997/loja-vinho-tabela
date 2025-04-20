// Configurações globais
const CONFIG = {
  URL_API: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLj-IauWFp1Fu2xRCz18wJhQoVCqIMQuWk-eskvC9nl7zErBVWoC-hbWwxz1oH6XZ5aD40qwwfKgr5DWvgCCeB8PALzTUzHxQLP_csVO9oLH0q0vjLPeAxDcV6WzmP9Ec6DHc_KE6Ef7FrZhguKr8u5rmHA9pk6eqU3WDQgb39CDKFLy8Dodnut5y4hJn901bORXYx7DyxtpyJSdSd0ifcyyNqvf08AjAYcoBu5-xzWa7W01BIJ9hOrBdcTqy4gcXXeaZ2SHvJTxp1dyiFXqKyf9_qy6tvJ0C2y1qfp7&lib=MQ7hZHoz0BREMTQBuxLFtQILLX6lkgy_q',
  WHATSAPP: '5546920001218'
};

// Sistema de armazenamento seguro
const safeStorage = {
  get: (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
};

// Estado global
let carrinho = safeStorage.get('carrinho') || [];

// Elementos DOM
const DOM = {
  corpoTabela: document.getElementById('corpo-tabela'),
  carrinhoItens: document.getElementById('itens-carrinho'),
  total: document.getElementById('total'),
  carrinhoIcone: document.getElementById('carrinho-icone'),
  carrinhoPainel: document.getElementById('carrinho-painel'),
  carrinhoContador: document.getElementById('carrinho-contador'),
  modal: document.getElementById('modal'),
  imgModal: document.getElementById('imagem-modal'),
  finalizarBtn: document.getElementById('finalizar')
};

// Função para carregar dados da planilha
async function carregarDados() {
  try {
    const response = await fetch(`${CONFIG.URL_API}?t=${Date.now()}`, {
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    const dados = await response.json();
    
    // Verificação dos dados
    if (!Array.isArray(dados)) throw new Error("Formato de dados inválido");
    
    // Filtra linhas vazias
    return dados.filter(item => 
      item['Nome do Vinho'] && 
      item['Preço'] !== undefined
    );
    
  } catch (erro) {
    console.error("Falha ao carregar dados:", erro);
    
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

// Função para escapar strings
function escapeString(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Renderiza a tabela de vinhos
function renderizarTabela(dados) {
  if (!DOM.corpoTabela) {
    console.error("Elemento 'corpo-tabela' não encontrado");
    return;
  }

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

// Funções do Carrinho
function adicionarAoCarrinho(nome, preco, quantidade) {
  quantidade = parseInt(quantidade) || 1;
  preco = parseFloat(preco);
  
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
  
  atualizarCarrinho();
  toggleCarrinho(true);
}

function removerItem(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  atualizarCarrinho();
}

function alterarQuantidade(nome, delta) {
  const item = carrinho.find(item => item.nome === nome);
  if (item) {
    item.quantidade += delta;
    if (item.quantidade < 1) item.quantidade = 1;
    atualizarCarrinho();
  }
}

function atualizarCarrinho() {
  if (!DOM.carrinhoItens || !DOM.total) return;

  DOM.carrinhoItens.innerHTML = '';
  let total = 0;
  
  carrinho.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>
        <button onclick="alterarQuantidade('${escapeString(item.nome)}', -1)">-</button>
        ${item.quantidade}
        <button onclick="alterarQuantidade('${escapeString(item.nome)}', 1)">+</button>
      </td>
      <td>R$${(item.preco * item.quantidade).toFixed(2)}</td>
      <td><button onclick="removerItem('${escapeString(item.nome)}')">❌</button></td>
    `;
    DOM.carrinhoItens.appendChild(tr);
    total += item.preco * item.quantidade;
  });
  
  DOM.total.textContent = `Total: R$${total.toFixed(2)}`;
  safeStorage.set('carrinho', carrinho);
  atualizarContador();
}

// Controle do carrinho flutuante
function toggleCarrinho(abrir) {
  if (!DOM.carrinhoPainel) return;
  
  if (abrir) {
    DOM.carrinhoPainel.classList.add('ativo');
  } else {
    DOM.carrinhoPainel.classList.toggle('ativo');
  }
}

function atualizarContador() {
  if (!DOM.carrinhoContador) return;
  
  const totalItens = carrinho.reduce((total, item) => total + item.quantidade, 0);
  DOM.carrinhoContador.textContent = totalItens;
  DOM.carrinhoContador.style.display = totalItens > 0 ? 'flex' : 'none';
}

// Modal de imagens
function abrirModal(url) {
  if (!DOM.imgModal || !DOM.modal) return;
  
  DOM.imgModal.src = url;
  DOM.modal.style.display = 'block';
}

function fecharModal() {
  if (!DOM.modal) return;
  DOM.modal.style.display = 'none';
}

// Finalizar pedido via WhatsApp
function finalizarPedido() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio!");
    return;
  }
  
  let mensagem = "🍷 *PEDIDO DE VINHOS* 🍷\n\n";
  carrinho.forEach(item => {
    mensagem += `✔ ${item.nome}\n`;
    mensagem += `   ${item.quantidade}x R$${item.preco.toFixed(2)} = R$${(item.preco * item.quantidade).toFixed(2)}\n\n`;
  });
  
  mensagem += `💰 *TOTAL: R$${carrinho.reduce((total, item) => total + (item.preco * item.quantidade), 0).toFixed(2)}*`;
  
  window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${encodeURIComponent(mensagem)}`, '_blank');
  
  // Limpa o carrinho
  carrinho = [];
  atualizarCarrinho();
  toggleCarrinho(false);
}

// Event Listeners
function setupEventListeners() {
  // Fechar carrinho ao clicar fora
  document.addEventListener('click', (e) => {
    if (!DOM.carrinhoPainel?.contains(e.target) && 
        e.target !== DOM.carrinhoIcone && 
        !DOM.carrinhoIcone?.contains(e.target)) {
      DOM.carrinhoPainel?.classList.remove('ativo');
    }
  });

  // Botões principais
  if (DOM.finalizarBtn) DOM.finalizarBtn.addEventListener('click', finalizarPedido);
  if (DOM.carrinhoIcone) DOM.carrinhoIcone.addEventListener('click', () => toggleCarrinho());
  
  // Modal
  const fecharModalBtn = document.querySelector('.fechar-modal');
  if (fecharModalBtn) fecharModalBtn.addEventListener('click', fecharModal);
  if (DOM.modal) DOM.modal.addEventListener('click', (e) => {
    if (e.target === DOM.modal) fecharModal();
  });
}

// Inicialização
async function init() {
  try {
    const dados = await carregarDados();
    renderizarTabela(dados);
    
    if (carrinho.length > 0) {
      atualizarCarrinho();
    }
    
    setupEventListeners();
    
  } catch (erro) {
    console.error("Erro na inicialização:", erro);
    if (DOM.corpoTabela) {
      DOM.corpoTabela.innerHTML = `
        <tr>
          <td colspan="5" style="color:red; text-align:center;">
            Erro ao carregar dados. Recarregue a página.
          </td>
        </tr>
      `;
    }
  }
}

// Inicia quando o DOM estiver pronto
if (document.readyState !== 'loading') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
