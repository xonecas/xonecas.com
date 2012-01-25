/*jshint expr:true */

var 
   prod     = process.env.PRODUCTION,
   root     = prod ? "./build" : "./htdocs",
   connect  = require('connect'),
   server   = connect(
      //connect.profiler(),
      connect.logger('dev'),
      connect.favicon(root + "/favicon.ico"),
      connect['static'](root),
      connect.errorHandler({
         'stack': true,
         'message': true,
         'dump': true
      })
   );


server.listen(prod ? 80 : 8080);
console.log(prod ? 'OK PRODUCTION': 'OK DEV');
