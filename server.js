const express = require("express");
const bodyParser = require("body-parser");
const adyenEncrypt = require("adyen-cse-js");

const app = express();
app.use(bodyParser.json());

app.post("/adyen", (req, res) => {
  const { card, month, year, cvv, adyen_key } = req.body;
  if (!card || !month || !year || !cvv || !adyen_key) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [ver, pub] = adyen_key.split("|");
    if (!ver || !pub) return res.status(400).json({ error: "Invalid adyen_key format" });

    const encryptor = adyenEncrypt.createEncryption(pub, {
      keyVersion: parseInt(ver)
    });

    const timestamp = new Date().toISOString();

    const encrypted = {
      number: encryptor.encrypt({ number: card, generationtime: timestamp }),
      expiryMonth: encryptor.encrypt({ expiryMonth: month, generationtime: timestamp }),
      expiryYear: encryptor.encrypt({ expiryYear: year, generationtime: timestamp }),
      cvc: encryptor.encrypt({ cvc: cvv, generationtime: timestamp })
    };

    return res.json({ encrypted });
  } catch (e) {
    console.error("🔐 Encryption failed:", e.message || e);
    return res.status(400).json({ error: "Encryption failed" });
  }
});

app.get("/", (req, res) => res.send("Adyen CSE API ✅"));
app.listen(process.env.PORT || 3000, () => console.log("🚀 Running"));
