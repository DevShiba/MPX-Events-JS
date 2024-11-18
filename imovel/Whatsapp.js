async function whatsappMessage(userId) {


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

    // Whatsapp Contact
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

    function getTempId() {
        let tempId = getCookie('user_id');
        return tempId;
      }
      
      const tempId = getTempId();


    const data = {
        temp_id: tempId,
        created_at: new Date().toISOString(),
        unique_id: userId,
    };

    fetch("https://jvbqgifuvpcongukenle.supabase.co/rest/v1/website_users_temp", {
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

// Chame a função para visualizar o produto
whatsappMessage(properties.param1);


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

    function getTempId() {
        let tempId = getCookie('user_id');
        return tempId;
      }
      
      const tempId = getTempId();

        bubble_fn_TempId(tempId)

      