const { PROXY_API_USER, PROXY_API_PASS } = process.env;

const Axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const Useragent = require('random-useragent');
const Locations = require('./locations');

const EXCLUDE_BROWSERS = [
    'Internet Explorer',
    'Wget'
];

const RETRY_RESPONSES = [429, 403, 401];
const DEFAULT_LOCATION = 'Ukraine';

module.exports = class Proxy {

    constructor(config = {}, retryLimit = 50, logger = console.log) {
        this.axios = Axios.create(config);
        this.retryLimit = retryLimit;
        this.log = logger;
    }

    get(url, options = {}) {
        return this._retryGet(this.axios.get)(url, options);
    }

    post(url, data = {}, options = {}) {
        return this._retry(this.axios.post)(url, data, options);
    }

    put(url, data = {}, options = {}) {
        return this._retry(this.axios.put)(url, data, options);
    }

    patch(url, data = {}, options = {}) {
        return this._retry(this.axios.patch)(url, data, options);
    }

    delete(url, data = {}, options = {}) {
        return this._retry(this.axios.delete)(url, data, options);
    }

    _defaultResponseHandler(response) {
        return response;
    }

    _defaultErrorHandler(error) {
        return Promise.reject(new Error(error));
    }

    _createConfig(options) {
        const defaultConfig = {
            httpsAgent: this._getHttpsAgent(options),
        };
        return Axios.mergeConfig(defaultConfig, options);
    }

    _getHttpsAgent(options) {
        const location = this._getLocationConfig(options.location);
        return new HttpsProxyAgent(`http://${PROXY_API_USER}:${PROXY_API_PASS}@${location.hostname}:${location.port}`);
    }

    _getLocationConfig(location) {
        return Locations.find(x => {
            return location
                ? x.location.toLowerCase() === location.toLowerCase()
                : x.location === DEFAULT_LOCATION
        });
    }

    _getUA() {
        return Useragent.getRandom(ua => !EXCLUDE_BROWSERS.includes(ua.browserName));
    }

    _retryGet(request) {
        return async (url, options) => {
            let attempts = 0;
            while (++attempts <= this.retryLimit) {
                try {
                    if (attempts > 1) {
                        this.log(`Request attempt: ${attempts}`);
                    }

                    const response = await request(url, this._createConfig(options));
                    return response;

                } catch (error) {
                    if (attempts === this.retryLimit || !RETRY_RESPONSES.includes(error?.response?.status)) {
                        throw error;
                    }
                }
            }
        }
    }

    _retry(request) {
        return async (url, data, options) => {
            let attempts = 0;
            while (++attempts <= this.retryLimit) {
                try {
                    if (attempts > 1) {
                        this.log(`Request attempt: ${attempts}`);
                    }

                    const response = await request(url, data, this._createConfig(options));
                    return response;

                } catch (error) {
                    if (attempts === this.retryLimit || !RETRY_RESPONSES.includes(error?.response?.status)) {
                        throw error;
                    }
                }
            }
        }
    }
}
