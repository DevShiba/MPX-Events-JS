async function postFirstVisit(userId) {
    const firstVisitKey = `first_visit_${userId}`;
  
    // Verifica se a primeira visita já foi registrada para este userId
    if (localStorage.getItem(firstVisitKey)) {
      console.log("Primeira visita já registrada para este usuário.");
      return;
    }
  
    // Obtém o IP do usuário no formato IPv4
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
  
    // Obtém informações geográficas com base no IP
    const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
    const geoData = await geoResponse.json();
  
    // Captura parâmetros UTM e outros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get('utm_source') || '';
    const utm_medium = urlParams.get('utm_medium') || '';
    const utm_content = urlParams.get('utm_content') || '';
    const utm_campaign = urlParams.get('utm_campaign') || '';
    const fbclid = urlParams.get('fbclid') || '';
    const gclid = urlParams.get('gclid') || '';
  
    function setCookie(name, value, minutes) {
      const date = new Date();
      date.setTime(date.getTime() + (minutes * 60 * 1000));
      const expires = "; expires=" + date.toUTCString();
      document.cookie = name + "=" + value + expires + "; path=/";
    }
  
    function getCookie(name) {
      const nameEQ = name + "=";
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
  
    const session_id = getSessionId();
  
    // Dados do evento `first_visit`
    const data = {
      event_name: 'first_visit',
      event_timestamp: new Date().toISOString(),
      user_id: userId,
      session_id: session_id,
  
      event_context: {
        IP: ipData.ip || '',
        Locale: navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform,
        Page: window.location.href,
        Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        App: {
          Name: 'MPX Imóvel',
          Version: '1.0.0',
        },
        Campaign: {
          utm_source: utm_source,
          utm_medium: utm_medium,
          utm_content: utm_content,
          utm_campaign: utm_campaign,
          fbclid: fbclid,
          gclid: gclid,
        },
        Device: {
          UserAgent: navigator.userAgent,
          Platform: navigator.platform,
          Vendor: navigator.vendor,
          ScreenResolution: `${window.screen.width}x${window.screen.height}`,
          DeviceType: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          SecureConnection: window.location.protocol === 'https:',
        },
        Geolocation: {
          Country: geoData.country_name || "Desconhecido",
          Region: geoData.region || "Desconhecido",
          City: geoData.city || "Desconhecido",
          Latitude: geoData.latitude || "Desconhecido",
          Longitude: geoData.longitude || "Desconhecido",
        },
      },
  
      event_properties: {
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
  
      user_properties: {
        user_id: userId,
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
  
    // Marca a primeira visita do usuário no localStorage
    localStorage.setItem(firstVisitKey, 'true');
  }
  
  // Chame a função na primeira visita
  postFirstVisit(properties.param1);
  