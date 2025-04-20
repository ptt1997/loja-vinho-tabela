// Configurações globais
const CONFIG = {
  URL_API: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLg4RflRra460HIMKPLMx_tY-8I6i34ejUG4x0_KURDYhB6_YmaddDWVkzVIOX1CfcXujwYQefPQuGagYeVvSrZRxCrq0HVitN08UoUfVclKaZ4O5ne22evo_dhTd7W-oSOm2ewo4ZJd19uaFD0k4-n7gP_Dlo0lY_NHaYsFvLv_6rcg_Ru8Yo8R2g2OUExrf_ykHTclAgzWOh-6edsVDVbZHONU-mRWlbIxHhP-eijP-xbAjG4NfO3E0-cGBbCNN2tKjl0j3OAn2vnp6XjbnZKGqMC_7g2MdadEuCy7&lib=MQ7hZHoz0BREMTQBuxLFtQILLX6lkgy_q',
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

// Função para carregar dados da API
async function carregarDados() {
  try {
    const response = await fetch(`${CONFIG.URL_API}?t=${Date.now()}`);
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

// Exibe os vinhos em cards
function exibirVinhos(vinhos) {
  const container = document.getElementById('vinhos-container');
  if (!container) return console.error("Elemento #vinhos-container não encontrado");
  container.innerHTML = '';

  vinhos.forEach(vinho => {
    const card = document.createElement('div');
    card.className = 'vinho-card';

    const nomeId = vinho['Nome do Vinho'].replace(/\s/g, '_');

    card.innerHTML = `
      <img src="${vinho['Link Imagem'] || 'https://via.placeholder.com/150'}" alt="${vinho['Nome do Vinho']}" onclick="abrirModal('${vinho['Link Imagem']}')">
      <h3>${vinho['Nome do Vinho']}</h3>
      <p>${vinho['Descrição'] || ''}</p>
      <p><strong>Marca:</strong> ${vinho['Marca'] || 'N/A'}</p>
      <p><strong>Preço:</strong> R$${parseFloat(vinho['Preço']).toFixed(2)}</p>
      <div class="quantidade-container">
        <input type="number" id="quantidade-${nomeId}" value="1" min="1">
        <button onclick="adicionarAoCarrinho('${vinho['Nome do Vinho'].replace(/'/g, "\\'")}', ${vinho['Preço']}, document.getElementById('quantidade-${nomeId}').value)">
          Adicionar ao Carrinho
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Adiciona item ao carrinho
function adicionarAoCarrinho(nome, preco, quantidade) {
  quantidade = parseInt(quantidade) || 1;
  preco = parseFloat(preco);

  const itemExistente = carrinho.find(item => item.nome === nome);
  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({ nome, preco, quantidade });
  }

  atualizarCarrinho();
}

// Atualiza o carrinho de compras
function atualizarCarrinho() {
  const container = document.getElementById('carrinho-container');
  if (!container) return console.error("Elemento #carrinho-container não encontrado");
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

  const totalElement = document.getElementById('total-pedido');
  if (totalElement) totalElement.textContent = `Total: R$${total.toFixed(2)}`;
  safeStorage.set('carrinho', carrinho);
}

// Remove item do carrinho
function removerItem(nome) {
  carrinho = carrinho.filter(item => item.nome !== nome);
  atualizarCarrinho();
}

// Modal para imagem (opcional)
function abrirModal(imagem) {
  window.open(imagem, '_blank');
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const vinhos = await carregarDados();
    exibirVinhos(vinhos);
    if (carrinho.length > 0) atualizarCarrinho();
  } catch (erro) {
    console.error("Erro na inicialização:", erro);
    const container = document.getElementById('vinhos-container');
    if (container) {
      container.innerHTML = `
        <div class="erro">
          Erro ao carregar produtos. Recarregue a página.
        </div>
      `;
    }
  }
});
