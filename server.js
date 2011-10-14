/* =================================================================
   author: @xonecas
 
   A boiler inspired by apache's .htaccess, that will serve static
   files off the shelf (just in case you want to get going quick)
   Everything else is for you to decide.

   I will keep this up to date with current node and connect versions
   any issues please file a issue :-)

var jsp = require("uglify-js").parser;
var pro = require("uglify-js").uglify;

var orig_code = "... JS code here";
var ast = jsp.parse(orig_code); // parse code and get the initial AST
ast = pro.ast_mangle(ast); // get a new AST with mangled names
ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
var final_code = pro.gen_code(ast); // compressed code here

================================================================= */

var
   connect  = require('connect'),
   gzip     = require('connect-gzip'),
   ugly     = require('uglify-js-middleware'),

   _port    = 8080,
   _cache   = 0,//1000 * 60 * 60 * 24 * 30,
   server, route;

function route (app) {
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

server = connect(
   gzip.gzip(),
   ugly({src: __dirname, force: true, uglyext: true}),
   connect.router(route),
   connect.static(__dirname, {maxAge: _cache}),
   connect.logger(":date | :remote-addr | :method :url :status | :user-agent"),
   connect.favicon(__dirname +'/favicon.ico'),
   connect.errorHandler()
);

server.listen(_port);
console.log("running");
