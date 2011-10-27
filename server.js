var 
   _fs       = require('fs'),
   less     = require('less'), 
   parser,
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

parser = new (less.Parser)();
_fs.readFile('styles/base.less', 'utf8', function (itAway, out) {
   if (itAway) {
      throw itAway;
   }

   parser.parse(out, function (down, tree) {
      if (down) {
         throw down;//!!!!!
      }

      _fs.writeFile('styles/style.css', tree.toCSS({ compress: true }), 'utf8', function (yourArmsUp) {
         if (yourArmsUp) {
            throw yourArmsUp; // \o/
         }
      });

   });
});

server.listen(80);
console.log('OK');
