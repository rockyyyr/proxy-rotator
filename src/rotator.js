const { PROXY_API_KEY } = process.env;

const Axios = require('axios');
const api = Axios.create({
    baseURL: 'http://falcon.proxyrotator.com:51337',
    params: {
        apiKey: PROXY_API_KEY
    }
});


async function newProxy(config = {}) {
    const response = await api.get('/', { params: _params(config) });
    console.log(response);

    return response.data;
}

function _params(config) {
    return {
        apiKey: PROXY_API_KEY,
        ...config
    }
}

module.exports = {
    newProxy
};
