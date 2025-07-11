const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const adyenEncrypt = require("node-adyen-encrypt");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const KEY_VERSION = parseInt(process.env.KEY_VERSION || "10001");
const PUBLIC_KEY = process.env.PUBLIC_KEY;

if (!PUBLIC_KEY) {
  throw new Error("❌ PUBLIC_KEY not set");
}

const encryptor = adyenEncrypt.createEncryption(PUBLIC_KEY, {
  keyVersion: KEY_VERSION,
});

app.post("/adyen", (req, res) => {
  const { cc, mes, ano, cvv } = req.body;
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
    res.json({ encrypted });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
