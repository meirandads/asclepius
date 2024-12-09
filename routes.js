const { predictHandler, getHistoriesHandler } = require('./handler');

const routes = [
    {
        method: 'POST',
        path: '/predict',
        handler: predictHandler,
        options: {
            payload: {
                output: 'stream',
                allow: 'multipart/form-data',
                maxBytes: 1000000,
            },
        },
    },
    {
        method: 'GET',
        path: '/predict/histories',
        handler: getHistoriesHandler,
    },
];

module.exports = routes;
