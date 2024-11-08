async function postProductViewed(userId, userEmail, userName, userNumber) {
    // Captura o código do imóvel a partir da URL
    const urlParams = new URLSearchParams(window.location.search);
    const propertyCode = urlParams.get('codigo');

    // Obtém o IP do usuário no formato IPv4
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();

    // Obtém informações geográficas com base no IP
    const geoResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
    const geoData = await geoResponse.json();

    // Captura parâmetros UTM e outros da URL
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
    const userIsLoggedIn = !!userEmail;

    // Dados do evento `product_viewed`
    const data = {
        event_name: 'product_viewed',
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
            ProductDetails: {
                Código: propertyCode,
                Categoria: "",
                Finalidade: "",
                ViewedTimestamp: new Date().toISOString(),
            },
            PageLoad: {
                LoadTime: window.performance ? window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart : null,
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
            user_email: userEmail,
            user_name: userName,
            user_number: userNumber,
            user_is_loggedin_in: userIsLoggedIn,
        },

        created_at: new Date().toISOString(),
    };

    // Envio ao Supabase
    fetch('https://jvbqgifuvpcongukenle.supabase.co/rest/v1/website_events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YnFnaWZ1dnBjb25ndWtlbmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5OTgyNTksImV4cCI6MjAzMjU3NDI1OX0.nqi1ughjDBslEXSyY9razvwI8hfnUaaD5dphEc_Ao7E',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YnFnaWZ1dnBjb25ndWtlbmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5OTgyNTksImV4cCI6MjAzMjU3NDI1OX0.nqi1ughjDBslEXSyY9razvwI8hfnUaaD5dphEc_Ao7E',
        },
        body: JSON.stringify(data),
    }).catch(error => {
        console.error('Error:', error);
    });
}

// Chame a função para visualizar o produto
postProductViewed(properties.param1, properties.param2, properties.param3, properties.param4);
