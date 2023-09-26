const { PROXY_API_USER, PROXY_API_PASS } = process.env;

const Axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

const rotator = new HttpsProxyAgent(`http://${PROXY_API_USER}:${PROXY_API_PASS}@us.smartproxy.com:10001`);
const sticky = new HttpsProxyAgent(`http://user-${PROXY_API_USER}-sessionduration-1:${PROXY_API_PASS}@us.smartproxy.com:10000`);

module.exports = class Proxy {

    constructor(config = {}, responseHandler = this._defaultResponseHandler, errorHandler = this._defaultErrorHandler) {
        this.axios = Axios.create(config);
        this.axios.interceptors.response(responseHandler, errorHandler);
    }

    get(url, options) {
        return this.axios.get(url, this._createConfig(options));
    }

    post(url, data, options) {
        return this.axios.post(url, data, this._createConfig(options));
    }

    put(url, data, options) {
        return this.axios.put(url, data, this._createConfig(options));
    }

    patch(url, data, options) {
        return this.axios.patch(url, data, this._createConfig(options));
    }

    delete(url, data, options) {
        return this.axios.delete(url, data, this._createConfig(options));
    }

    _defaultResponseHandler(response) {
        return response.data;
    }

    _defaultErrorHandler(error) {
        return Promise.reject(error);
    }

    _createConfig(options) {
        return {
            ...options,
            httpsAgent: options.sticky ? sticky : rotator
        };
    }
}
