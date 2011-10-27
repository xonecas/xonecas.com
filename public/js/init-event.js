require.config({
   baseUrl: '/'
});

require([
   'vendor/underscore',
   'vendor/jquery'
], function () {
   _.each([1,2,3,4,5,6], function (num) {
      $('body').append('<p>'+num+'</p>');
   });
});
