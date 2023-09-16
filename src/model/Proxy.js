const ProxyConfig = require("./ProxyConfig")

module.exports = class Proxy extends ProxyConfig {

    /**
     * Proxy string as <ip>:<port>
     * 
     * @type {string}
     */
    proxy;

    /**
     * Proxies ip address
     * 
     * @type {string}
     */
    ip;

    /**
     * Proxy port
     * 
     * @type {string}
     */
    port;

    /**
     * Datacenter, Mobile or Residential
     * 
     * @type {string}
     */
    connectionType;

    /**
     * Supports user agent
     * 
     * @type {boolean}
     */
    userAgent;

    /**
     * A random user agent string
     * 
     * @type {string}
     */
    randomUserAgent;

    /**
     * City where proxy is located
     * 
     * @type {string}
     */
    city;

    /**
     * State where proxy is located
     * 
     * @type {string}
     */
    state;

    /**
     * Country where proxy is located
     * 
     * @type {string}
     */
    country;
}
