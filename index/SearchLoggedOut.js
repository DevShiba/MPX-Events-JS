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
  
  // Função para formatar valores monetários em reais (R$)
  function formatCurrency(value) {
    return value ? `R$${value.toLocaleString('pt-BR')}` : null;
  }
  
  async function postSearchEvent(userId, intention, userEmail) {
    // Obtendo o IP do usuário no formato IPv4
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
  
    // Selecionando os bairros e categorias com base nos contêineres
    const bairros = Array.from(
      document.querySelectorAll('#bairros .select2-selection__choice')
    ).map(choice => choice.getAttribute('title'));
    const categorias = Array.from(
      document.querySelectorAll('#categorias .select2-selection__choice')
    ).map(choice => choice.getAttribute('title'));
  
    // Capturando e formatando os valores de preço mínimo e máximo
    const valorMinimo = formatCurrency(document.getElementById('valor-minimo').value || null);
    const valorMaximo = formatCurrency(document.getElementById('valor-maximo').value || null);
  
    const userIsLoggedIn = userEmail ? true : false;
  
    const data = {
      event_name: 'search_event',
      event_timestamp: new Date().toISOString(),
      user_id: userId,
      session_id: getSessionId(),
  
      event_context: {
        IP: ipData.ip || '',
        Locale: navigator.userAgentData
          ? navigator.userAgentData.platform
          : navigator.platform,
        Page: window.location.href,
        Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        App: {
          Name: 'MPX Imóvel',
          Version: '1.0.0',
        },
      },
  
      user_properties: {
        user_is_loggedin_in: userIsLoggedIn,
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
            ? window.performance.timing.domContentLoadedEventEnd -
              window.performance.timing.navigationStart
            : null,
          Referrer: document.referrer || '',
        },
        BrowserInfo: {
          CookiesEnabled: navigator.cookieEnabled,
          Language: navigator.language || navigator.userLanguage,
          OnlineStatus: navigator.onLine,
        },
      },
  
      created_at: new Date().toISOString(),
    };
  
    // Envio ao Supabase
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
  postSearchEvent(properties.param1, properties.param2, properties.param3);
  