const express = require("express");
const bodyParser = require("body-parser");
const adyenEncrypt = require("node-adyen-encrypt");

const app = express();
app.use(bodyParser.json());

app.post("/adyen", (req, res) => {
  const { card, month, year, cvv, adyen_key, adyen_version } = req.body;

  if (!card || !month || !year || !cvv || !adyen_key || !adyen_version) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const keyVersion = parseInt(adyen_key.split("|")[0]);
    const publicKey = adyen_key.split("|")[1];

    const encryptor = adyenEncrypt.createEncryption(publicKey, { keyVersion });

    const generationtime = new Date().toISOString();

    const cardData = {
      number: card,
      expiryMonth: month,
      expiryYear: year,
      cvc: cvv,
      generationtime
    };

    encryptor.validate(cardData);
    const encrypted = encryptor.encrypt(cardData);

    return res.json({ encrypted });
  } catch (err) {
    console.error("❌ Encryption failed:", err.message || err);
    return res.status(400).json({ error: "Encryption failed" });
  }
});

app.get("/", (req, res) => {
  res.send("Adyen Encrypt API Ready ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
