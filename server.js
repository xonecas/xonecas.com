var 
   prod     = process.env.PRODUCTION,
   root     = prod ? "./build" : "./public",
   _fs      = require('fs'),
   less     = require('less'), 
   parser,
   connect  = require('connect'),
   server   = connect(
      //connect.profiler(),
      connect.logger('dev'),
      connect.favicon("./favicon.ico"),
      connect['static'](root),
      connect.errorHandler({
         'stack': true,
         'message': true,
         'dump': true
      })
   );

parser = new (less.Parser)();
_fs.readFile(root+'/styles/base.less', 'utf8', function (itAway, out) {
   if (itAway) {
      throw itAway;
   }

   out = out.replace(/_root_/, root);

   parser.parse(out, function (down, tree) {
      if (down) {
         throw down;//!!!!!
      }

      _fs.writeFile(root+ '/styles/style.css', tree.toCSS({ compress: true }), 'utf8', function (yourArmsUp) {
         if (yourArmsUp) {
            throw yourArmsUp; // \o/
         }
      });

   });
});

server.listen(prod ? 80 : 8080);
console.log('OK');
prod && console.log('PRODUCTION');

// PRODUCTION STEPS:
// =================
// for production run 
// `./node_modules/handlebars/bin/handlebars -f public/compiled/<target file>.js public/templates/<source file>.html`
// `node node_modules/requirejs/bn/r.js -o app.build.js`
// then run `sudo PRODUCTION=true node server`
//
// DEVELPMENT STEPS:
// =================
// `./node_modules/handlebars/bin/handlebars -f public/compiled/<target file>.js public/templates/<source file>.html`
// `node server`
