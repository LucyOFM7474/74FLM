import OpenAI from "openai";

// Vercel detectează automat acest fișier ca o funcție serverless.
export default async function handler(request, response) {
  // Aici preia cheia API din variabilele de mediu setate pe Vercel.
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Metodă nepermisă.' });
  }

  try {
    const { date } = request.body;

    if (!date) {
      return response.status(400).json({ message: 'Datele meciului sunt obligatorii.' });
    }

    const promptText = `Creează o analiză de 10 puncte pentru un meci de fotbal, bazată pe următoarele date:
    
${date}

Formatul analizei trebuie să fie detaliat și organizat pe puncte, exact ca în exemplul pe care ți l-am dat anterior.
1. Sumar & Predicție externă (actuale)
2. Istoric direct (H2H)
3. Forma echipă gazdă (acasă)
4. Forma echipă oaspete (deplasare)
5. Clasament & motivație
6. Statistici goluri
7. Statistici CORNERE (ultimele meciuri)
8. Jucători cheie
9. Predicție scor
10. Recomandări pariuri (inclusiv cotă/sursă)`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Poți folosi "gpt-3.5-turbo" pentru a reduce costurile.
      messages: [{ role: "user", content: promptText }],
    });

    const analiza = completion.choices[0].message.content;
    response.status(200).json({ analiza });

  } catch (error) {
    console.error("Eroare la apelul OpenAI:", error);
    response.status(500).json({ error: "Eroare internă a serverului. Verifică log-urile Vercel." });
  }
}
