/* =================================================================
   author: @xonecas
 
   A boiler inspired by apache's .htaccess, that will serve static
   files off the shelf (just in case you want to get going quick)
   Everything else is for you to decide.

   I will keep this up to date with current node and connect versions
   any issues please file a issue :-)
================================================================= */
var connect = require('connect'),
   fs       = require('fs');
   // inspect tool, I use it all the time.
   inspect  = require('util').inspect;

var routes = function (app) {


/* ------------------------------------------------------------------
   Keep this route last.
------------------------------------------------------------------ */
   app.get('*', function (req, res, next) {
      var url = req.url,
         ua = req.headers['user-agent'];

      // request latest IE engine or chrome frame
      if (ua && ua.indexOf('MSIE') && 
         url.match(/\.html$/) || url.match(/\.htm$/))
         res.setHeader('X-UA-Compatible', "IE=Edge,chrome=1");

      // protect .files
      if (url.match(/(^|\/)\./))
         res.end("Not allowed");

      // control cross domain using CORS (http://enable-cors.org/)
      res.setHeader('Access-Control-Allow-Origin', '*'); 
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");

      next(); // let the static server do the rest
   });
}


var cache = 0,//1000 * 60 * 60 * 24 * 30,
   port   = 8080, 
   htdocs = __dirname,
   server = connect.createServer(
      // http://senchalabs.github.com/connect/middleware-logger.html
      connect.logger(":date | :remote-addr | :method :url :status | :user-agent"),
      connect.router(routes),
      connect.static(htdocs, {maxAge: cache})
   );

server.listen(port);
console.log('Node up!\nPort:   '+port+'\nhtdocs: '+htdocs);

/*
process.on('uncaughtException', function (err) {
   console.log('Caught exception: ' + err);
});
*/
