const { PROXY_API_USER, PROXY_API_PASS } = process.env;

const Axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const Useragent = require('random-useragent');

const rotating = new HttpsProxyAgent(`http://${PROXY_API_USER}:${PROXY_API_PASS}@ua.smartproxy.com:40000`);
const sticky1 = new HttpsProxyAgent(`http://user-${PROXY_API_USER}-sessionduration-1:${PROXY_API_PASS}@us.smartproxy.com:10001`);
const sticky10 = new HttpsProxyAgent(`http://${PROXY_API_USER}:${PROXY_API_PASS}@us.smartproxy.com:10001`);
const sticky30 = new HttpsProxyAgent(`http://user-${PROXY_API_USER}-sessionduration-30:${PROXY_API_PASS}@us.smartproxy.com:10001`);

const EXCLUDE_BROWSERS = [
    'Internet Explorer',
    'Wget'
];

module.exports = class Proxy {

    constructor(config = {}, retryLimit = 50) {
        this.axios = Axios.create(config);
        this.retryLimit = retryLimit;
    }

    get(url, options = {}) {
        return this._retry(this.axios.get(url, this._createConfig(options)));
    }

    post(url, data = {}, options = {}) {
        return this._retry(this.axios.post(url, data, this._createConfig(options)));
    }

    put(url, data = {}, options = {}) {
        return this._retry(this.axios.put(url, data, this._createConfig(options)));
    }

    patch(url, data = {}, options = {}) {
        return this._retry(this.axios.patch(url, data, this._createConfig(options)));
    }

    delete(url, data = {}, options = {}) {
        return this._retry(this.axios.delete(url, data, this._createConfig(options)));
    }

    _defaultResponseHandler(response) {
        return response;
    }

    _defaultErrorHandler(error) {
        return Promise.reject(new Error(error));
    }

    _createConfig(options) {
        const defaultConfig = {
            httpsAgent: options.sticky ? this._getStickyAgent(sticky) : rotating,
            headers: {
                'User-Agent': this._getUA()
            }
        };
        return Axios.mergeConfig(defaultConfig, options);
    }

    _getStickyAgent(duration) {
        switch (duration) {
            case 1: return sticky1;
            case 10: return sticky10;
            case 30: return sticky30;
            default:
                throw new Error('Invalid sticky session duration');
        }
    }

    _getUA() {
        return Useragent.getRandom(ua => !EXCLUDE_BROWSERS.includes(ua.browserName));
    }

    async _retry(request) {
        let attempt = 0;

        while (++attempt <= this.retryLimit) {
            try {
                console.log('attempt:', attempt);

                const response = await request;
                return response.data;

            } catch (error) {
                if (attempt === this.retryLimit) {
                    return error;
                }

                if (error?.response?.status === 429) {
                    continue;
                } else {
                    throw error;
                }
            }
        }
    }
}
