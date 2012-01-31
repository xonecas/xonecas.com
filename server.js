/*jshint expr:true */

var 
   prod     = process.env.PRODUCTION,
   root     = "./htdocs",
   visits   = 0,
   connect  = require('connect'),
   routes   = function (app) {
      app.get('/analytics', function (req, res, next) {
         res.writeHead(200);
         res.end();

         visits++;
         console.log('VISITORS: ', visits);
      });
   },
   server   = connect(
      connect.logger('dev'),
      connect.favicon(root + "/favicon.ico"),
      connect.router(routes),
      connect['static'](root),
      connect.errorHandler({
         'stack': true,
         'message': true,
         'dump': true
      })
   );


server.listen(prod ? 80 : 8080);
console.log(prod ? 'OK PRODUCTION': 'OK DEV');
