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
         if (this.idx + (this.count * this.page) === this.total) {
            this.trigger('error', 'At oldest post.');
            this.idx--;
            return;
         }

         var model = this.at(this.idx);

         if (model) {
            this.current = model;
            this.trigger('change');
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
            this.trigger('change');
         } else {
            if (this.page > 0) {
               this.page--;
               this.idx = this.count -1;
               this.fetch();
            } else {
               this.idx++;
               this.trigger('error', 'At most recent post.');
            }
         }

      }
   });

   HomePage = Backbone.View.extend({
      id:         'main',
      className:  'container',
      tagName:    'section',
      template:   Handlebars.compile($('#post_tmpl').html()),
      collection: new Tumblr(),

      initialize: function () {
         this.header = new Header({
            'collection': this.collection
         });
         this.header.render();
         _.bindAll(this, "render", "report");
         this.collection.bind('reset', this.render);
         this.collection.bind('error', this.report);
         this.collection.bind('change', this.render);
         this.collection.fetch();
      
         $('body').append(this.el);
      },

      report: function (err) {
         smoke.alert(err);
      },

      render: function () {
         var model = this.collection.current;
         $(this.el)
            .css('display', 'none')
            .html(this.template(model.toJSON()))
            .fadeIn(1000);
         hijs('code');         
      }
   });

   Header = Backbone.View.extend({
      className: 'topbar',
      tagName: 'div',
      template: $('#header_tmpl').html(),

      render: function () {
         $(this.el)
            .html(this.template)
            .appendTo('body');
      },

      events: {
         "click #prev-post": "previous",
         "click #next-post": "next"
      },

      previous: function (ev) {
         ev.preventDefault();
         this.collection.previous();
         return false;
      },

      next: function (ev) {
         ev.preventDefault();
         this.collection.next();
         return false;
      }
   });

   // main
   window.app = new HomePage();
});
