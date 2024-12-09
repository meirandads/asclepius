const { loadModel, predict } = require('../services/inferenceService');
const { savePrediction, getPredictions } = require('../services/storeData');
const InputError = require('../exceptions/InputError');
const { v4: uuidv4 } = require('uuid');

let model;

// Load model saat server pertama kali dijalankan
(async () => {
    model = await loadModel();
})();

const predictHandler = async (request, h) => {
    const { image } = request.payload;

    if (!image) {
        throw new InputError('Gambar tidak ditemukan di dalam request.');
    }

    const chunks = [];
    for await (const chunk of image) {
        chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // Validasi ukuran file
    if (buffer.length > 1000000) {
        throw new InputError('Payload content length greater than maximum allowed: 1000000');
    }

    try {
        const result = await predict(model, buffer);
        const isCancer = result > 0.5;

        const id = uuidv4();
        const createdAt = new Date().toISOString();
        const response = {
            id,
            result: isCancer ? 'Cancer' : 'Non-cancer',
            suggestion: isCancer ? 'Segera periksa ke dokter!' : 'Penyakit kanker tidak terdeteksi.',
            createdAt,
        };

        // Simpan data ke Firestore
        await savePrediction(response);

        return h.response({
            status: 'success',
            message: 'Model is predicted successfully',
            data: response,
        });
    } catch (error) {
        console.error(error);
        throw new Error('Terjadi kesalahan dalam melakukan prediksi');
    }
};

const getHistoriesHandler = async (request, h) => {
    try {
        const data = await getPredictions();
        return h.response({
            status: 'success',
            data,
        });
    } catch (error) {
        console.error(error);
        throw new Error('Gagal mengambil riwayat prediksi');
    }
};

module.exports = { predictHandler, getHistoriesHandler };
