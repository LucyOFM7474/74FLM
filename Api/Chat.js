export const config = { runtime: "edge" };

const SYSTEM = `
Ești LucyOFM – Analize meciuri, română, rece, concis.
Livrează EXACT 10 puncte cu simboluri: ✅ ⚠️ 📊 🎯.
Structură fixă:
1) ✅ Surse & consens
2) 📊 Medie predicții
3) 📊 Formă recentă
4) ⚠️ Absențe-cheie
5) 📊 Golgheteri & penalty-uri
6) 📊 Tactici & matchups
7) 📊 Posesie, cornere, cartonașe
8) ⚠️ Impact pronostic
9) 🎯 3–5 pariuri recomandate
10) 🎯 Verdict final + scor estimat
`;

export default async function handler(req) {
  const cors = { headers: { "Access-Control-Allow-Origin": "*" } };
  if (req.method === "OPTIONS") return new Response(null, cors);
  if (req.method !== "POST") return new Response("POST only", { ...cors, status: 405 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return new Response("OPENAI_API_KEY lipsă", { ...cors, status: 500 });

  const { query } = await req.json().catch(() => ({}));
  if (!query) return new Response("Trimite 'query'", { ...cors, status: 400 });

  const prompt = `Meci: ${query}\nGenerează cele 10 puncte cerute.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.MODEL || "gpt-4o-mini",
      temperature: 0.25,
      max_tokens: 900,
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: prompt }]
    })
  });

  if (!res.ok) return new Response("OpenAI error", { ...cors, status: res.status });
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || "";
  return new Response(JSON.stringify({ ok: true, content }), cors);
}
