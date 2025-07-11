
const createEncryption = (publicKey, options = {}) => {
  return {
    encrypt: (data) => {
      return Buffer.from(JSON.stringify(data)).toString("base64");
    },
    validate: (data) => {
      if (!data.number || !data.expiryMonth || !data.expiryYear || !data.cvc) {
        throw new Error("Missing card data");
      }
    }
  };
};
module.exports = { createEncryption };
