const { PROXY_API_USER, PROXY_API_PASS } = process.env;

const Axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');
const Useragent = require('random-useragent');
const Locations = require('./locations/datacenter');


const EXCLUDE_BROWSERS = [
    'Internet Explorer',
    'Wget'
];

const RETRY_RESPONSES = [429, 403, 401];

module.exports = class Proxy {

    /**
     * @type {Axios}
     */
    #axios;

    /**
     * @type {function}
     */
    #log = console.log;

    /**
     * @type {string}
     */
    #location;

    /**
     * @type {number}
     */
    #retryLimit = 50;

    constructor(config = {}, logger) {
        this.#axios = Axios.create(config);
        this.#location = config.location;

        if (logger) {
            this.#log = logger;
        }

        if (config.retryLimit) {
            this.#retryLimit = config.retryLimit;
        }

        if (config.useDefaultInterceptors) {
            this.#axios.interceptors.response.use(
                this.#defaultResponseHandler,
                this.#defaultErrorHandler
            );
        }
    }

    get(url, options = {}) {
        return this.#retryGet(this.#axios.get)(url, options);
    }

    post(url, data = {}, options = {}) {
        return this.#retry(this.#axios.post)(url, data, options);
    }

    put(url, data = {}, options = {}) {
        return this.#retry(this.#axios.put)(url, data, options);
    }

    patch(url, data = {}, options = {}) {
        return this.#retry(this.#axios.patch)(url, data, options);
    }

    delete(url, data = {}, options = {}) {
        return this.#retry(this.#axios.delete)(url, data, options);
    }

    getLocationList() {
        return Locations.map(x => x.location);
    }

    #defaultResponseHandler(response) {
        return response;
    }

    #defaultErrorHandler(error) {
        return Promise.reject(new Error(error));
    }

    #createConfig(options) {
        const defaultConfig = {
            httpsAgent: options.bypass ? null : this.#getHttpsAgent(options),
        };

        if (options.randomUA) {
            defaultConfig.headers = {
                'User-Agent': this.#getUA()
            }
        }

        return Axios.mergeConfig(defaultConfig, options);
    }

    #getHttpsAgent(options) {
        const location = this.#getLocationConfig(options.location || this.#location);
        return new HttpsProxyAgent(`http://${PROXY_API_USER}:${PROXY_API_PASS}@${location.hostname}:${location.port}`);
    }

    #getLocationConfig(location) {
        return Locations.find(x => {
            return location
                ? x.location.toLowerCase() === location.toLowerCase()
                : x.location === 'Default'
        });
    }

    #getUA() {
        return Useragent.getRandom(ua => !EXCLUDE_BROWSERS.includes(ua.browserName));
    }

    #retryGet(request) {
        return async (url, options) => {
            let attempts = 0;
            while (++attempts <= this.#retryLimit) {
                try {
                    if (attempts > 1) {
                        this.#log(`Request attempt: ${attempts}`);
                    }

                    const response = await request(url, this.#createConfig(options));
                    return response;

                } catch (error) {
                    if (attempts === this.#retryLimit || !RETRY_RESPONSES.includes(error?.response?.status)) {
                        throw error?.response
                            ? error.response
                            : error;
                    }
                }
            }
        }
    }

    #retry(request) {
        return async (url, data, options) => {
            let attempts = 0;
            while (++attempts <= this.#retryLimit) {
                try {
                    if (attempts > 1) {
                        this.#log(`Request attempt: ${attempts}`);
                    }

                    const response = await request(url, data, this.#createConfig(options));
                    return response;

                } catch (error) {
                    if (attempts === this.#retryLimit || !RETRY_RESPONSES.includes(error?.response?.status)) {
                        throw error?.response
                            ? error.response
                            : error;
                    }
                }
            }
        }
    }
}
