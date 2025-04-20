// Configurações globais
const CONFIG = {
  URL_API: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLiNUw2X-ihI74eWp-TYKTP4QjJtatDH21PymfY29JPO9FD_DllRPqbcKBHFjlLTMQEOnCxhs84C5WPWUwqCWpskY0C3SLZ6PJWU8gskSARXwrjqVFt7_7lRiqXoxQc8RKx-L_SbvUHyJKY4Crl3wES979fs3kDlmz4w3ADHk7s2DnAeOP1tOpzwffSz1WYdmmlVgsNkwktRsLy3iUJaLsQVsuUz1iVJ-qkusqSyrIVGAFngDZQLR-P2kBXz4xajKCRSk42v2cFd8GmC5tsXorGE1N7gcjtS7sa9aCnq&lib=MQ7hZHoz0BREMTQBuxLFtQILLX6lkgy_q',
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

// Função para carregar dados com tratamento robusto
async function carregarDados() {
  try {
    const response = await fetch(`${CONFIG.URL_API}?t=${Date.now()}`, {
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    });
    
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    
    const data = await response.json();
    console.log("Dados recebidos:", data);
    
    if (!Array.isArray(data)) throw new Error('Formato de dados inválido');
    
    return data.filter(item => item['Nome do Vinho'] && item['Preço']);
    
  } catch (error) {
    console.error("Falha ao carregar dados:", error);
    return [{
      "Nome do Vinho": "Vinho Reserva",
      "Descrição": "Exemplo - conexão falhou",
      "Preço": 89.90,
      "Marca": "Fallback",
      "Link Imagem": "https://via.placeholder.com/150"
    }];
  }
}

// Função para exibir vinhos (mantendo seu layout original)
function exibirVinhos(vinhos) {
  const container = document.getElementById('vinhos-container');
  container.innerHTML = '';
  
  vinhos.forEach(vinho => {
    const card = document.createElement('div');
    card.className = 'vinho-card';
    
    card.innerHTML = `
      <img src="${vinho['Link Imagem']}" alt="${vinho['Nome do Vinho']}" onclick="abrirModal('${vinho['Link Imagem']}')">
      <h3>${vinho['Nome do Vinho']}</h3>
      <p>${vinho['Descrição']}</p>
      <p><strong>Marca:</strong> ${vinho['Marca']}</p>
      <p><strong>Preço:</strong> R$${vinho['Preço'].toFixed(2)}</p>
      <div class="quantidade-container">
        <input type="number" id="quantidade-${vinho['Nome do Vinho']}" value="1" min="1">
        <button onclick="adicionarAoCarrinho('${vinho['Nome do Vinho'].replace(/'/g, "\\'")}', ${vinho['Preço']}, parseInt(document.getElementById('quantidade-${vinho['Nome do Vinho']}').value))">
          Adicionar ao Carrinho
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Funções do carrinho (mantenha suas funções originais)
function adicionarAoCarrinho(nome, preco, quantidade) {
  quantidade = parseInt(quantity) || 1;
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
}

function atualizarCarrinho() {
  const container = document.getElementById('carrinho-container');
  container.innerHTML = '';
  
  let total = 0;
  carrinho.forEach(item => {
    const div = document.createElement('div');
    div.className = 'carrinho-item';
    div.innerHTML = `
      <span>${item.nome} - ${item.quantidade}x R$${item.preco.toFixed(2)}</span>
      <button onclick="removerItem('${item.nome.replace(/'/g, "\\'")}')">Remover</button>
    `;
    container.appendChild(div);
    total += item.preco * item.quantidade;
  });
  
  document.getElementById('total-pedido').textContent = `Total: R$${total.toFixed(2)}`;
  safeStorage.set('carrinho', carrinho);
}

function removerItem(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  atualizarCarrinho();
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const vinhos = await carregarDados();
    exibirVinhos(vinhos);
    
    if (carrinho.length > 0) {
      atualizarCarrinho();
    }
    
  } catch (erro) {
    console.error("Erro na inicialização:", erro);
    document.getElementById('vinhos-container').innerHTML = `
      <div class="erro">
        Erro ao carregar produtos. Recarregue a página.
      </div>
    `;
  }
});
