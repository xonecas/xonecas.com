require.config({
   baseUrl: '/',
   paths: {
      bootstrap: 'bootstrap/js/'
   }
});

// get all of the dependencies
require([
   'vendor/json2',
   'vendor/jquery',
   'vendor/handlebars',
   'vendor/underscore',
   'vendor/hijs',
   'vendor/smoke',
], function () {
   // these need jquery
   require([
      'compiled/header-tmpl',
      'vendor/backbone',
      'bootstrap/bootstrap-dropdown'
   ], function () {
      // init the app
      require(['js/script.js'], function () {
         console && console.log && console.log("OK");
      });

   });
});

