const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.redirect = functions.https.onRequest(async (req, res) => {
  // Ambil slug dari URL (misal: /kopi-promo)
  const slug = req.path.split("/")[1];

  if (!slug) {
    return res.status(404).send("Link tidak ditemukan.");
  }

  try {
    const doc = await admin.firestore().collection("links").doc(slug).get();

    if (doc.exists) {
      const data = doc.data();
      
      // Update jumlah klik secara asinkron (gak nunggu ini selesai buat redirect)
      doc.ref.update({
        clickCount: admin.firestore.FieldValue.increment(1)
      });

      // Lempar user ke URL asli
      return res.redirect(301, data.originalUrl);
    } else {
      return res.status(404).send("Waduh, link ini nggak ada di database kita.");
    }
  } catch (error) {
    console.error("Error redirecting:", error);
    return res.status(500).send("Terjadi kesalahan server.");
  }
});
