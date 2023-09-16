module.exports = class ConnectionType {

    static MOBILE = new ConnectionType('Mobile');
    static DATACENTER = new ConnectionType('Datacenter');
    static RESIDENTIAL = new ConnectionType('Residential');

    constructor(value) {
        this.value = value;
    }

    toString() {
        return this.value;
    }
}
