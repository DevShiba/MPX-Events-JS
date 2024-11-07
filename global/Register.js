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
    let sessionId = getCookie("session_id");

    if (!sessionId) {
        sessionId = generateSessionId();
        setCookie("session_id", sessionId, 10); 
    } else {
        setCookie("session_id", sessionId, 10);
    }

    return sessionId;
}

const session_id = getSessionId();

async function postDataEmailSignup(userId) {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const celular = document.getElementById("input-register--phone-mask").value;

    // Obtendo o IP e geolocalização
    const ipResponse = await fetch('https://ipapi.co/json/');
    const ipData = await ipResponse.json();

    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get('utm_source') || "";
    const utm_medium = urlParams.get('utm_medium') || "";
    const utm_content = urlParams.get('utm_content') || "";
    const utm_campaign = urlParams.get('utm_campaign') || "";
    const fbclid = urlParams.get('fbclid') || "";
    const gclid = urlParams.get('gclid') || "";

    const data = {
        event_name: "account_created", 
        event_timestamp: new Date().toISOString(),
        user_id: userId, 
        session_id: session_id,
        
        user_properties: {
            nome: nome,
            email: email,
            celular: celular,
        },
        
        event_context: {
            "IP": ipData.ip || "", 
            "Country": ipData.country_name || "", 
            "Region": ipData.region || "", 
            "City": ipData.city || "",
            "Locale": navigator.language || navigator.userLanguage, 
            "Page": window.location.href, 
            "Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone, 
            "App": {
                "Name": "MPX Imóvel", 
                "Version": "1.0.0" 
            },
            "Campaign": {
                "utm_source": utm_source,
                "utm_medium": utm_medium,
                "utm_content": utm_content,
                "utm_campaign": utm_campaign,
                "fbclid": fbclid,
                "gclid": gclid
            },
            "Device": {
                "UserAgent": navigator.userAgent,
                "Platform": navigator.platform, 
                "Vendor": navigator.vendor, 
                "ScreenResolution": `${window.screen.width}x${window.screen.height}`,
            }
        },

        event_properties: {
            "Signup": {
                "Method": "Email",
                "Provider": "Website Form",
                "Success": true, 
                "SignupTimestamp": new Date().toISOString(), 
            },
            "PageLoad": {
                "LoadTime": window.performance ? window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart : null, 
                "Referrer": document.referrer || "" 
            },
            "BrowserInfo": {
                "CookiesEnabled": navigator.cookieEnabled,
                "Language": navigator.language || navigator.userLanguage, 
                "OnlineStatus": navigator.onLine 
            }
        },

        created_at: new Date().toISOString(),
    };

    fetch("https://jvbqgifuvpcongukenle.supabase.co/rest/v1/website_events", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YnFnaWZ1dnBjb25ndWtlbmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5OTgyNTksImV4cCI6MjAzMjU3NDI1OX0.nqi1ughjDBslEXSyY9razvwI8hfnUaaD5dphEc_Ao7E",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YnFnaWZ1dnBjb25ndWtlbmxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY5OTgyNTksImV4cCI6MjAzMjU3NDI1OX0.nqi1ughjDBslEXSyY9razvwI8hfnUaaD5dphEc_Ao7E"
        },
        body: JSON.stringify(data)
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

// Exemplo de chamada para capturar o evento de signup
postDataEmailSignup(properties.param1);
