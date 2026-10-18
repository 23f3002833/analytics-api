const API_KEY = "ak_f9ruyuht707lgyc48zw1zwhd";
const EMAIL = "YOUR_EMAIL_HERE"; // <-- replace with your logged-in email

export default function handler(req, res) {
  // CORS headers on EVERY response
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

  // Answer the browser's "may I?" preflight question
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  // 1. Check the password
  if (req.headers["x-api-key"] !== API_KEY) {
    return res.status(401).json({ error: "unauthorized" });
  }

  // 2. Read the events
  const events = (req.body && req.body.events) || [];

  // 3. Do the counting
  const users = new Set();
  const positiveTotals = {};
  let revenue = 0;

  for (const e of events) {
    users.add(e.user);
    if (e.amount > 0) {
      revenue += e.amount;
      positiveTotals[e.user] = (positiveTotals[e.user] || 0) + e.amount;
    }
  }

  let topUser = null;
  let best = -Infinity;
  for (const [user, total] of Object.entries(positiveTotals)) {
    if (total > best) {
      best = total;
      topUser = user;
    }
  }

  // 4. Send the answer
  res.status(200).json({
    email: EMAIL,
    total_events: events.length,
    unique_users: users.size,
    revenue: Math.round(revenue * 100) / 100,
    top_user: topUser,
  });
}
