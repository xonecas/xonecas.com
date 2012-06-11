/*jslint node:true nomen:true */
var connect, server, root, colors;
root = __dirname;
connect = require('connect');
colors = require('colors');
server = connect()
    .use(connect.favicon('favicon.ico'))
    .use(connect.logger('dev'))
    .use(connect.compress())
    .use(connect['static'](root, { maxAge: 31536000000 })) // one year.
    .use(connect.errorHandler())
    .listen(process.argv[2] ? 80 : 8080);

console.log('Server is up...'.blue, root.red);
