const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.redirect = functions.https.onRequest(async (req, res) => {
    // Mengambil slug (misal 'teh') dari URL
    const slug = req.params.slug || req.path.split('/')[1];

    if (!slug || slug === 'index.html') {
        return res.redirect('/'); 
    }

    try {
        // Cari di coll 'links' dokumen dengan ID yang sama dengan slug
        const doc = await admin.firestore().collection("links").doc(slug).get();

        if (doc.exists) {
            const data = doc.data();
            
            // Tambah hit secara background
            doc.ref.update({ clickCount: admin.firestore.FieldValue.increment(1) });

            // REDIRECT!
            return res.redirect(302, data.originalUrl);
        } else {
            return res.status(404).send("Link Sekawan tidak ditemukan!");
        }
    } catch (error) {
        return res.status(500).send("System Error");
    }
});
