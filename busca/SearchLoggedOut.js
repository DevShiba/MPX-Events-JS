function setCookie(name, value, minutes) {
  const date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  const expires = '; expires=' + date.toUTCString();
  document.cookie = name + '=' + value + expires + '; path=/';
}

function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function generateSessionId() {
  return `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function getSessionId() {
  let sessionId = getCookie('session_id');

  if (!sessionId) {
    sessionId = generateSessionId();
    setCookie('session_id', sessionId, 10);
  } else {
    setCookie('session_id', sessionId, 10);
  }

  return sessionId;
}

// Função para formatar valores monetários em reais (R$) ou retornar "Não Informado"
function formatCurrency(value) {
  if (!value || value === "0") return "Não Informado";
  const numericValue = String(value).replace(/[^\d]/g, ''); // Converte para string e remove caracteres não numéricos
  return numericValue ? `R$${parseInt(numericValue, 10).toLocaleString('pt-BR')}` : "Não Informado";
}

function parseURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchParams = {};
  const advancedParams = {};

  const isAlugar = urlParams.get('alugar') === 'eq.true';
  const isComprar = urlParams.get('comprar') === 'eq.true';
  const isLancamento = urlParams.get('lancamento') === 'eq.true';

  if (isLancamento) {
    searchParams.Finalidade = 'Comprar/Lançamentos';
  } else if (isAlugar) {
    searchParams.Finalidade = 'Alugar';
  } else if (isComprar) {
    searchParams.Finalidade = 'Comprar';
  } else {
    searchParams.Finalidade = null;
  }

  const valorVendaMin = parseInt(urlParams.get('valor-venda-min')?.replace(/^gte\./, '') || '0', 10);
  const valorVendaMax = parseInt(urlParams.get('valor-venda-max')?.replace(/^lte\./, '') || '0', 10);
  const valorAlugarMin = parseInt(urlParams.get('valor-alugar-min')?.replace(/^gte\./, '') || '0', 10);
  const valorAlugarMax = parseInt(urlParams.get('valor-alugar-max')?.replace(/^lte\./, '') || '0', 10);

  if (isComprar) {
    searchParams.ValorMinimo = formatCurrency(valorVendaMin > 0 ? valorVendaMin : "0");
    searchParams.ValorMaximo = formatCurrency(valorVendaMax > 0 ? valorVendaMax : "0");
  } else if (isAlugar) {
    searchParams.ValorMinimo = formatCurrency(valorAlugarMin > 0 ? valorAlugarMin : "0");
    searchParams.ValorMaximo = formatCurrency(valorAlugarMax > 0 ? valorAlugarMax : "0");
  } else {
    searchParams.ValorMinimo = "Não Informado";
    searchParams.ValorMaximo = "Não Informado";
  }

  searchParams.Bairros = urlParams.get('bairro') 
    ? urlParams.get('bairro').replace(/^in\.\(|\)$/g, '').split(',') 
    : [];
  
  searchParams.Categoria = urlParams.get('categoria') 
    ? urlParams.get('categoria').replace(/^in\.\(|\)$/g, '').split(',') 
    : [];

  const advancedMapping = {
    "pet": "Aceita Pet",
    "jogos": "Salão de Jogos",
    "tenis": "Quadra de Tênis",
    "vagas": "Quantidade de Vagas",
    "festas": "Salão de Festas",
    "gourmet": "Espaço Gourmet",
    "piscina": "Piscina",
    "quartos": "Quantidade de Quartos",
    "quintal": "Quintal",
    "academia": "Academia",
    "portaria": "Portaria 24h",
    "mobiliado": "Mobiliado",
    "playground": "Playground",
    "bicicletario": "Bicicletario",
    "semimobiliado": "Semi Mobiliado",
    "quarto-armario": "Quarto com Armário",
    "ar-condicionado": "Ar Condicionado",
    "piscina-coletiva": "Piscina Coletiva",
    "cozinha-planejada": "Cozinha Planejada"
  };

  urlParams.forEach((value, key) => {
    if (!['bairro', 'categoria', 'valor-venda-min', 'valor-venda-max', 'valor-alugar-min', 'valor-alugar-max', 'alugar', 'comprar', 'lancamento'].includes(key)) {
      const mappedKey = advancedMapping[key];
      if (mappedKey) {
        advancedParams[mappedKey] = value.replace(/^(in\.\(|gte\.|eq\.|lte\.|\)$)/g, '');
      }
    }
  });

  return { searchParams, advancedParams };
}

async function postSearchEvent(userId, userEmail) {
  const ipResponse = await fetch('https://api.ipify.org?format=json');
  const ipData = await ipResponse.json();

  const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
  const geoData = await geoResponse.json();

  const { searchParams, advancedParams } = parseURLParameters();
  const userIsLoggedIn = !!userEmail;

  const data = {
    event_name: 'search_event',
    event_timestamp: new Date().toISOString(),
    user_id: userId,
    session_id: getSessionId(),

    event_context: {
      IP: ipData.ip || '',
      Locale: navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform,
      Page: window.location.href,
      Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      App: { Name: 'MPX Imóvel', Version: '1.0.0' },
      DeviceType: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      ScreenResolution: `${window.screen.width}x${window.screen.height}`,
      SecureConnection: window.location.protocol === 'https:',
      Geolocation: {
        Country: geoData.country_name || "Desconhecido",
        Region: geoData.region || "Desconhecido",
        City: geoData.city || "Desconhecido",
        Latitude: geoData.latitude || "Desconhecido",
        Longitude: geoData.longitude || "Desconhecido",
      }
    },

    user_properties: {
      user_is_loggedin_in: userIsLoggedIn,
      user_email: userEmail,
    },

    event_properties: {
      SearchParameters: searchParams,
      AdvancedSearchParameters: advancedParams,
      PageLoad: {
        LoadTime: window.performance
          ? window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart
          : null,
        Referrer: document.referrer || '',
      },
      BrowserInfo: {
        CookiesEnabled: navigator.cookieEnabled,
        Language: navigator.language || navigator.userLanguage,
        OnlineStatus: navigator.onLine,
        BrowserVersion: navigator.userAgent,
      },
    },

    created_at: new Date().toISOString(),
  };

  fetch('https://jvbqgifuvpcongukenle.supabase.co/rest/v1/website_events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YnFnaWZ1dnBjb25ndWtlbmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5OTgyNTksImV4cCI6MjAzMjU3NDI1OX0.nqi1ughjDBslEXSyY9razvwI8hfnUaaD5dphEc_Ao7E',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YnFnaWZ1dnBjb25ndWtlbmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5OTgyNTksImV4cCI6MjAzMjU3NDI1OX0.nqi1ughjDBslEXSyY9razvwI8hfnUaaD5dphEc_Ao7E',
    },
    body: JSON.stringify(data),
  }).catch(error => {
    console.error('Error:', error);
  });
}

// Exemplo de chamada com parâmetros de busca
postSearchEvent(properties.param1, properties.param2);
