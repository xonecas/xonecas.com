var
   fs       = require('fs'),
   jsp      = require('uglify-js').parser,
   pro      = require('uglify-js').uglify;

function uglify (js) {
   var ast = jsp.parse(js);
   ast = pro.ast_mangle(ast);
   ast = pro.ast_squeeze(ast);
   return pro.gen_code(ast);
}

function parse (directory, callback) {
   callback = callback || function () {};

   fs.readdir(directory, function (err, files) {
      if (err)
         return callback(err);

      !function _iter () {
         var file_path = __dirname +"/"+ files.pop();
         if (files.length > 0) {
            fs.readFile(file_path, 'utf8', function (err2, js) {
               if (err2)
                  return callback(err2);

               var min_path = file_path.replace(".js", ".min.js");
               fs.writeFile(min_path, uglify(js), 'utf8', function (err3) {
                  if (err3)
                     return callback(err3);

                  callback(null);
               }); 
            });
         }
      } ();
   });
}

module.exports = parse;
