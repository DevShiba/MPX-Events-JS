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
  const numericValue = String(value).replace(/[^\d]/g, '');
  return numericValue ? `R$${parseInt(numericValue, 10).toLocaleString('pt-BR')}` : "Não Informado";
}

async function postSearchEvent(userId, userEmail, intention) {
  // Obtendo o IP e localização do usuário
  const ipResponse = await fetch('https://api.ipify.org?format=json');
  const ipData = await ipResponse.json();

  const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
  const geoData = await geoResponse.json();

  // Selecionando os bairros e categorias com base nos contêineres
  const bairros = Array.from(document.querySelectorAll('#bairros .select2-selection__choice'))
    .map(choice => choice.getAttribute('title'));
  const categorias = Array.from(document.querySelectorAll('#categorias .select2-selection__choice'))
    .map(choice => choice.getAttribute('title'));

  // Capturando e formatando os valores de preço mínimo e máximo
  const valorMinimo = formatCurrency(document.getElementById('valor-minimo').value || "Não Informado");
  const valorMaximo = formatCurrency(document.getElementById('valor-maximo').value || "Não Informado");

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
      user_email: userEmail
    },

    event_properties: {
      SearchParameters: {
        Finalidade: intention,
        Bairros: bairros,
        Categoria: categorias,
        ValorMinimo: valorMinimo,
        ValorMaximo: valorMaximo,
      },
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

  fetch("https://backend.dataxmarketing.com.br/webhook-test/9f411f91-5c0e-4103-8cf1-626d380745d3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  })
}

// Exemplo de chamada com parâmetros de busca
postSearchEvent(properties.param1, properties.param2, properties.param3);
