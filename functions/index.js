const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.redirect = functions.https.onRequest(async (req, res) => {
    // Ambil slug dari parameter atau path
    const slug = req.params.slug || req.path.split('/').filter(Boolean)[0];

    // Jika user cuma buka domain utama tanpa slug
    if (!slug || slug === 'index.html' || slug === 'dashboard') {
        return res.redirect('https://go.sekawan.my.id'); 
    }

    try {
        const db = admin.firestore();
        const doc = await db.collection("links").doc(slug).get();

        if (doc.exists) {
            const data = doc.data();
            
            // Catat Klik di Background (async)
            doc.ref.update({
                clickCount: admin.firestore.FieldValue.increment(1)
            }).catch(err => console.error("Update click failed", err));

            // REDIRECT KE URL ASLI
            console.log(`Berhasil: Mengalihkan ${slug} ke ${data.originalUrl}`);
            return res.redirect(302, data.originalUrl);
        } else {
            // Jika slug tidak ada di database
            console.log(`Gagal: Slug ${slug} tidak ditemukan`);
            return res.status(404).send(`
                <div style="text-align:center; padding:50px; font-family:sans-serif;">
                    <h1>404 - Link Tidak Ketemu</h1>
                    <p>Waduh, link <b>go.sekawan.my.id/${slug}</b> belum terdaftar di database kita.</p>
                    <a href="https://go.sekawan.my.id">Balik ke Dashboard</a>
                </div>
            `);
        }
    } catch (error) {
        console.error("System Error:", error);
        return res.status(500).send("Ada masalah di server Sekawan.");
    }
});
    
