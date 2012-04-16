$(function () {
   $('html').removeClass('no-js');

   var countdown = $('.countdown'),
      relative = $('.relative'),
      end = moment('2012-07-0200:51:00 -0800');

   moment.relativeTime.future = "%s to go...";

   window.setInterval(function () {
      var start = moment();
      relative.html( start.from(end) );
   }, 1000);

   /*
   $('#blog-posts').tumblr({
      api_key: 'IM11cPEsi3jxTeSNwF8BB9Z08UItXcYKiEDLTLvl5RYn6MBcMD',
      limit: 10
   });
   */

   /*
   $('<section id="canvas-rings"></section>')
      .banner({
         ctx: {
            name: 'Canvas Rings',
            description: 'A small experiment with canvas.',
            src: '//localhost:8090'
         }
      })
      .appendTo('body');

   $('<section id="2d-experiment"></section>')
      .banner({
         ctx: {
            name: 'Particle play',
            description: 'Another small experiment with canvas.',
            src: '//localhost:8091'
         }
      })
      .appendTo('body');
   */
});
