const express = require("express");
const bodyParser = require("body-parser");
const adyenEncrypt = require("node-adyen-encrypt");

const app = express();

// فقط نفعل parser المناسب للـ x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// لا تستخدم bodyParser.json()

const KEY_VERSION = parseInt(process.env.KEY_VERSION || "10001");
const PUBLIC_KEY = process.env.PUBLIC_KEY;

if (!PUBLIC_KEY) {
  console.error("❌ PUBLIC_KEY is missing. Please set it in your environment variables.");
  process.exit(1);
}

const encryptor = adyenEncrypt.createEncryption(PUBLIC_KEY, {
  keyVersion: KEY_VERSION,
});

app.post("/adyen", (req, res) => {
  console.log("📥 Incoming request body:", req.body);

  const { cc, mes, ano, cvv } = req.body;

  if (!cc || !mes || !ano || !cvv) {
    return res.status(400).json({ error: "Missing required fields: cc, mes, ano, cvv" });
  }

  const generationtime = new Date().toISOString();

  const card = {
    number: cc,
    expiryMonth: mes,
    expiryYear: ano,
    cvc: cvv,
    generationtime,
  };

  try {
    encryptor.validate(card);
    const encrypted = encryptor.encrypt(card);
    return res.json({ encrypted });
  } catch (e) {
    console.error("❌ Encryption failed:", e.message);
    return res.status(400).json({ error: e.message || "Encryption failed" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Adyen Encryption API is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
