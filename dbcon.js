var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs361_busse',
    password        : '1340',
    database        : 'cs361_busse'
});
module.exports.pool = pool;
