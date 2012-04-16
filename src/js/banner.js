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
