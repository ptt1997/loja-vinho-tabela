// Configurações atualizadas
const CONFIG = {
  URL_API: 'https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLiNUw2X-ihI74eWp-TYKTP4QjJtatDH21PymfY29JPO9FD_DllRPqbcKBHFjlLTMQEOnCxhs84C5WPWUwqCWpskY0C3SLZ6PJWU8gskSARXwrjqVFt7_7lRiqXoxQc8RKx-L_SbvUHyJKY4Crl3wES979fs3kDlmz4w3ADHk7s2DnAeOP1tOpzwffSz1WYdmmlVgsNkwktRsLy3iUJaLsQVsuUz1iVJ-qkusqSyrIVGAFngDZQLR-P2kBXz4xajKCRSk42v2cFd8GmC5tsXorGE1N7gcjtS7sa9aCnq&lib=MQ7hZHoz0BREMTQBuxLFtQILLX6lkgy_q', // Cole a NOVA URL do passo anterior
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

// Modifique sua função carregarDados para:
async function carregarDados() {
  try {
    const response = await fetch(`${CONFIG.URL_API}?t=${Date.now()}`, {
      redirect: 'follow',
      referrerPolicy: 'no-referrer'
    });
    
    if (!response.ok) throw new Error('Erro na resposta');
    
    return await response.json();
  } catch (error) {
    console.error("Usando dados locais:", error);
    return [{
      "Nome do Vinho": "Vinho Fallback",
      "Descrição": "Dados locais - conexão falhou",
      "Preço": 99.90,
      "Marca": "Fallback",
      "Link Imagem": "https://via.placeholder.com/150"
    }];
  }
}
