const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.redirect = functions.https.onRequest(async (req, res) => {
    // Ambil slug (contoh: 'logo' dari go.sekawan.com/logo)
    const slug = req.path.split('/').filter(Boolean)[0];

    // Jika tidak ada slug atau mengakses index, jangan lanjut
    if (!slug || slug === 'index.html') {
        return res.redirect('https://go.sekawan.my.id');
    }

    try {
        const db = admin.firestore();
        const doc = await db.collection("links").doc(slug).get();

        if (doc.exists) {
            const data = doc.data();
            
            // Update jumlah klik di background
            doc.ref.update({
                clickCount: admin.firestore.FieldValue.increment(1)
            }).catch(e => console.error("Click update failed", e));

            // Redirect ke URL tujuan
            return res.redirect(302, data.originalUrl);
        } else {
            // Jika slug tidak ada di database
            return res.status(404).send(`
                <div style="text-align:center; padding:50px; font-family:sans-serif;">
                    <h1 style="color:#064e57">404 - Link Tidak Ditemukan</h1>
                    <p>Link <b>go.sekawan.com/${slug}</b> belum terdaftar.</p>
                    <a href="https://go.sekawan.my.id" style="color:#14b8a6">Buka Dashboard</a>
                </div>
            `);
        }
    } catch (error) {
        console.error("Error redirecting:", error);
        return res.status(500).send("Terjadi kesalahan sistem.");
    }
});
