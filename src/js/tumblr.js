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
