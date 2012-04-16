(function ($, win, doc, undefined) {
   var name,
      defaults,
      Banner;

   name = 'banner';
   defaults = {};

   Banner = function (el, options) {
      this.el = el;
      this.$el = $(el);
      options = options || {};
      this.options = $.extend({}, defaults, options);
      this._defaults = defaults;
      this._name = name;
      this.init(this.options);
   };

   Banner.prototype = {
      init: function (options) {
         this.$el.html(
            templates.banner.render(options.ctx)
         );
      }
   };

   $.fn[name] = function (options) {
      return this.each(function () {
         if (!$.data(this, 'plugin_'+name)) {
            $.data(this, 'plugin_'+name, new Banner(this, options));
         }
      });
   };
}) (jQuery, window, document);

// test function comment out after successfull build
/*
 *
(function () {
   $('<section id="banner"></section>')
      .banner({
         ctx: { name: 'Sean', description: 'crazy' }
      })
      .appendTo('body');
}) ();
*/
/*jshint browser:true, curly:true, eqeqeq:true, onevar:true */
(function (win, doc) {

   var $banner = $('.banner'),
      canvas   = doc.createElement('canvas'),
      c        = canvas.getContext('2d'),
      radians  = Math.PI /180;

   $banner.append(canvas);
   canvas.width = $banner.outerWidth();
   canvas.height = $banner.outerHeight();


   function rrange(min, max, noFloor){
      var result = Math.random()*(max-min) + min;
      return noFloor ? result : Math.floor(result);
   }

   function Particle (x, y, size, color) {
      this.x      = x;
      this.y      = y;
      this.size   = size;
      this.color  = color || rrange(1, 359);
   }

   Particle.prototype = {
      draw: function () {
         c.save();
         c.fillStyle = "hsl("+ this.color +", 100%, 50%)";
         c.beginPath();
         c.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
         c.fill();
         c.restore();
      }
   };

   function rain () {
      var dash,
         dashes      = [],
         max         = 100,
         startColor  = 180,
         endColor    = 200,
         startLeap   = 0.2,
         endLeap     = 2.5;

      canvas.width = canvas.width;
      canvas.height = canvas.height;
      if (win.interval) {
         clearInterval(win.interval);
      }

      win.interval = setInterval(function () {
         var i = 0;

         c.save();
         c.fillStyle = 'hsla(0, 0%, 0%, 0.2)';
         c.fillRect(0, 0, canvas.width, canvas.height);
         c.restore();

         if (dashes.length <= max) {
            dash = new Particle( rrange(1, canvas.width, true),
                                 rrange(1, canvas.height, true),
                                 rrange(startLeap, endLeap, true), 
                                 rrange(startColor, endColor));
            dashes.push(dash);
         }

         for (i; i < dashes.length; i++) {
            dash = dashes[i];
            dash.y = dash.y >= canvas.height ? rrange(1, canvas.height/2): 
               dash.y + rrange(1, 6);

            dash.draw();
         }
      }, 1000/30);
   }

   //$(function () { rain(); });

}) (window, document);
(function ($, win, doc, undefined) {
   var name,
      defaults,
      Tumblr;

   name = 'tumblr';
   defaults = {};

   Tumblr = function (el, options) {
      this.el = el;
      this.$el = $(el);
      this.options = $.extend({}, defaults, options);
      this._defaults = defaults;
      this._name = name;
      this.init(this.options);
   };

   Tumblr.prototype = {
      init: function (options) {
         this.template = templates.tumblr;
         this.sync();
      },

      sync: function () {
         var params, self;
         self = this;
         params = {
            url: '//api.tumblr.com/v2/blog/xonecas.tumblr.com/posts/text',
            data: this.options,
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: function (res) {
               self.syncCallback(res);
            }
         };
         return $.ajax(params);
      },

      syncCallback: function (res) {
         var post, posts, len;
         posts = res.response.posts;
         for (len = posts.length; len--; ) {
            post = posts[len];
            post.human_time =
               moment.utc(post.timestamp * 1000).local()
               .format('MMMM Do YYYY, hh:mm a');
         }
         this.posts = { 'posts': posts };
         this.render();
      },

      render: function () {
         this.$el.html(
            this.template.render(this.posts)
         );
      }
   };

   $.fn[name] = function (options) {
      return this.each(function () {
         if (!$.data(this, 'plugin_'+name)) {
            $.data(this, 'plugin_'+name, new Tumblr(this, options));
         }
      });
   };
}) (jQuery, window, document);

// test function comment out after successfull build
/*
 *
(function () {
   $('<section id="banner"></section>')
      .banner({
         ctx: { name: 'Sean', description: 'crazy' }
      })
      .appendTo('body');
}) ();
*/
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
