const { PROXY_API_KEY } = process.env;

const Axios = require('axios');
const ProxyConfig = require('./model/ProxyConfig');
const Proxy = require('./model/Proxy');
const api = Axios.create({
    baseURL: 'http://falcon.proxyrotator.com:51337',
    params: {
        apiKey: PROXY_API_KEY
    }
});

const DEFAULT_CONFIG = {
    userAgent: true
};


/**
 * Get a new Proxy
 * 
 * @param {ProxyConfig} config 
 * @returns {Proxy}
 */
async function newProxy(config = DEFAULT_CONFIG) {
    const response = await api.get('/', { params: _params(config) });
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
