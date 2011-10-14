var 
   connect  = require('connect'),
   server   = connect(
      //connect.profiler(),
      connect.logger('dev'),
      connect.favicon("./favicon.ico"),
      connect['static'](__dirname),
      connect.errorHandler({
         'stack': true,
         'message': true,
         'dump': true
      })
   );

server.listen(80);
console.log('OK');
