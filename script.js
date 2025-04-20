// Configurações
const CONFIG = {
  URL_API: 'https://script.google.com/macros/s/AKfycbxOVVlXhECClvMU2gkOI0HF5NutWibycWi5mN7hEpOU8K100MQbN2uweEpxFb1X_jNgQg/exec',
  WHATSAPP: '5546920001218'
};

// Estado global
let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

// Função para carregar vinhos
async function carregarVinhos() {
  try {
    const response = await fetch(CONFIG.URL_API);
    if (!response.ok) throw new Error('Erro ao carregar dados');
    
    const data = await response.json();
    
    // Verifica se os dados são válidos
    if (!Array.isArray(data)) throw new Error('Formato de dados inválido');
    
    return data.filter(vinho => 
      vinho['Nome do Vinho'] && 
      vinho['Preço'] !== undefined
    );
    
  } catch (error) {
    console.error("Falha ao carregar dados:", error);
    
    // Fallback com dados de exemplo
    return [
      {
        "Nome do Vinho": "Vinho Reserva",
        "Descrição": "Exemplo - conexão falhou",
        "Preço": 89.90,
        "Marca": "Fallback",
        "Link Imagem": "https://via.placeholder.com/150"
      }
    ];
  }
}

// Função para exibir vinhos na tabela
function exibirVinhos(vinhos) {
  const tbody = document.getElementById('corpo-tabela');
  tbody.innerHTML = '';
  
  vinhos.forEach(vinho => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="icone-imagem" onclick="abrirModal('${vinho['Link Imagem']}')">📷</span></td>
      <td>${vinho['Nome do Vinho']}</td>
      <td>${vinho['Descrição']}</td>
      <td>R$${vinho['Preço'].toFixed(2)}</td>
      <td>
        <input type="number" min="1" value="1" class="quantidade">
        <button onclick="adicionarAoCarrinho('${vinho['Nome do Vinho'].replace(/'/g, "\\'")}', ${vinho['Preço']}, this.previousElementSibling.value)">
          Adicionar
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Funções do carrinho (mantenha as que você já tem)
function adicionarAoCarrinho(nome, preco, quantidade) {
  // ... (seu código existente)
}

function atualizarCarrinho() {
  // ... (seu código existente)
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const vinhos = await carregarVinhos();
    exibirVinhos(vinhos);
    
    if (carrinho.length > 0) {
      atualizarCarrinho();
    }
    
  } catch (error) {
    console.error("Erro na inicialização:", error);
    document.getElementById('corpo-tabela').innerHTML = `
      <tr>
        <td colspan="5" style="color:red;text-align:center;">
          Erro ao carregar dados. Recarregue a página.
        </td>
      </tr>
    `;
  }
});
