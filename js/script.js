$(function () {
   Tumblr = Backbone.Collection.extend({
      url: "http://api.tumblr.com/v2/blog/xonecas.tumblr.com/posts/text",
      page: 0,
      count: 6,
      idx: 0,

      initialize: function () {
         _.bindAll(this, "setCurrent");
         this.bind('reset', this.setCurrent);
      },

      parse: function (res, xhr) {
         this.total = res.response.total_posts;
         return res.response.posts;
      },

      sync: function (model, method, options) {
         var params = _.extend(options, {
            "url": this.url,
            "data": {
               "limit": this.count,
               "offset": this.page * this.count,
               "api_key": "IM11cPEsi3jxTeSNwF8BB9Z08UItXcYKiEDLTLvl5RYn6MBcMD"
            },
            "dataType": "jsonp",
            "jsonp": "jsonp"
         });

         return $.ajax(params);
      },

      setCurrent: function () {
         this.current = this.at(this.idx);
      },

      next: function () {
         this.idx++;
         var model = this.at(this.idx);

         if (model) {
            this.current = model;
         } else {
            this.page++;
            this.idx = 0;
            this.fetch();
         }
      },

      previous: function () {
         this.idx--;
         var model = this.at(this.idx);

         if (model) {
            this.current = model;
         } else {
            if (this.page > 0) {
               this.page--;
               this.idx = this.count -1;
               this.fetch();
            } else {
               this.trigger('error', 'At most recent post');
            }
         }

      }
   });

   ErrorReport = Backbone.View.extend({
      id:         'error',
      className:  'container',
      template:   Handlebars.compile($('#error_tmpl').html()),

      initialize: function () {
         _.bindAll(this, "remove");
         this.render();
      },

      render: function () {
         $('#main').append(this.template(this.error));
         setTimeout(this.remove, 5000);
         return this;
      }
   });

   HomePage = Backbone.View.extend({
      id:         'main',
      className:  'container',
      template:   Handlebars.compile($('#post_tmpl').html()),
      collection: new Tumblr(),

      initialize: function () {
         _.bindAll(this, "render", "report");
         this.collection.bind('reset', this.render);
         this.collection.bind('error', this.report);
         this.collection.fetch();
      
         $(this.el).appendTo('body');
      },

      render: function () {
         var model = this.collection.current;
         $(this.el)
            .css('display', 'none')
            .html(this.template(model.toJSON()))
            .fadeIn(1000);
         
      },

      report: function (error) {
         this.errors = this.errors || [];
         this.errors.push(new ErrorReport().render());
      }
   });

   // main
   window.app = new HomePage();
});
