var connect, server, root;
root = __dirname + '/dev';
connect = require('connect');
server = connect()
   .use(connect.favicon())
   .use(connect.logger('dev'))
   .use(connect.compress())
   .use(connect['static'](root))
   .use(connect.errorHandler())
   .listen(8080);

console.log('Server is up...', root);
