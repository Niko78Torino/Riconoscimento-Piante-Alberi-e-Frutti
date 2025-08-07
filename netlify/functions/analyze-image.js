// File: netlify/functions/analyze-image.js

exports.handler = async function(event, context) {
    // Controlla che la richiesta sia di tipo POST
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // Prendi i dati inviati dal frontend (l'immagine e il prompt)
        const { imageBase64Data, prompt } = JSON.parse(event.body);

        // Prendi la chiave API segreta dalle variabili d'ambiente di Netlify
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
             throw new Error("La chiave API di Gemini non è stata configurata.");
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: "image/jpeg", data: imageBase64Data } }
                ]
            }]
        };

        // Esegui la chiamata all'API di Google dal server di Netlify
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error("Errore dall'API di Google:", errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Errore dall'API di Google: ${errorBody.error?.message}` })
            };
        }

        const result = await response.json();

        // Invia il risultato al frontend
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        };

    } catch (error) {
        console.error("Errore nella funzione Netlify:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};