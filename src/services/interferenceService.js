const tf = require('@tensorflow/tfjs-node');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();
const BUCKET_NAME = 'your-model-bucket-name';

const loadModel = async () => {
    const [files] = await storage.bucket(BUCKET_NAME).getFiles();
    const modelFile = files.find(file => file.name.endsWith('model.json'));

    if (!modelFile) {
        throw new Error('Model file not found in bucket');
    }

    return await tf.loadGraphModel(`gs://${BUCKET_NAME}/${modelFile.name}`);
};

const predict = async (model, buffer) => {
    const tensor = tf.node.decodeImage(buffer).resizeBilinear([224, 224]).toFloat().expandDims(0);
    const prediction = model.predict(tensor).arraySync()[0][0];
    return prediction;
};

module.exports = { loadModel, predict };
