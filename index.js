if (process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

module.exports = require('./src');
