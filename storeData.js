const Firestore = require('@google-cloud/firestore');
const firestore = new Firestore();

const COLLECTION_NAME = 'predictions';

const savePrediction = async (data) => {
    await firestore.collection(COLLECTION_NAME).doc(data.id).set(data);
};

const getPredictions = async () => {
    const snapshot = await firestore.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
};

module.exports = { savePrediction, getPredictions };
