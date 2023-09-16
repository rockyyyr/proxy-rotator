const ConnectionType = require("./ConnectionType");

module.exports = class ProxyConfig {

    /**
     * Supports GET requests
     * 
     * @type {boolean}
     */
    get = true;

    /**
     * Supports POST requests
     * 
     * @type {boolean}
     */
    post = true;

    /**
     * Supports cookies
     * 
     * @type {boolean}
     */
    cookies = true;

    /**
     * Supports referer
     * 
     * @type {boolean}
     */
    referer = true;

    /**
     * Supports user agent
     * 
     * @type {boolean}
     */
    userAgent = true;

    /**
     * Supports specific port
     * 
     * @type {number}
     */
    port;

    /**
     * Return only proxies with specified city
     * 
     * @type {string}
     */
    city;

    /**
     * State code. Examples: NY, WA
     * Return only proxies with specified state
     * 
     * @type {string}
     */
    state;

    /**
     * Country code. Examples: CA, US
     * Return only proxies with specified country
     * 
     * @type {string}
     */
    country = 'US';

    /**
     * Type of connection. Datacenter, mobile or residential
     * 
     * @type {ConnectionType}
     */
    connectionType;


}