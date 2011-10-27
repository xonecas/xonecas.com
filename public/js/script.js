var xonecas = !function () {

   function linkit (text) {
      text = text.replace(
         /(ftp|http|https|file):\/\/[\S]+(\b|$)/gim,
         '<a href="$&" target="_new">$&</a>');
      text = text.replace(/@\w+\s/gi, function (match) {
         match = match.substring(0, match.length -1);
         return '<a href="//twitter.com/'+match.substring(1)+'">'+match+'</a> ';
      });

      return text;
   }

   var TumblrSync = Backbone.Collection.extend({
      type: 'text',

      parse: function (res, xhr) {
         this.total = Math.ceil(res.response.total_posts/this.count);
         return res.response.posts;
      },

      sync: function (model, method, options) {
         var params = _.extend(options, {
            "url": this.url,
            "data": {
               "type": this.type,
               "limit": this.count,
               "offset": this.page * this.count,
               "api_key": "IM11cPEsi3jxTeSNwF8BB9Z08UItXcYKiEDLTLvl5RYn6MBcMD"
            },
            "dataType": "jsonp",
            "jsonp": "jsonp"
         });

         return $.ajax(params);
      },

      next: function () {
         if (this.page +1 === this.total) {
            this.trigger('error', "That's it, you've read it all!");
         } else {
            this.page++;
            this.fetch();
         }
      },

      previous: function () {
         if (this.page -1 === -1) {
            this.trigger('error', "No newer posts.");
         } else {
            this.page--;
            this.fetch();
         }
      }
   });

   var Photos = TumblrSync.extend({
      url: "http://api.tumblr.com/v2/blog/xonecas.tumblr.com/posts/photo",
      page: 0,
      count: 10,
      type: 'photo'
   });

   var Tumblr = TumblrSync.extend({
      url: "http://api.tumblr.com/v2/blog/xonecas.tumblr.com/posts/text",
      page: 0,
      count: 5
   });

   var Twitter = Backbone.Collection.extend({
      url: "http://api.twitter.com/1/statuses/user_timeline.json",
      count: 5,

      parse: function (res) {
         _.each(res, function (tweet) {
            tweet.text = linkit(tweet.text);
         });

         return res;
      },

      sync: function (model, method, options) {
         var params = _.extend(options, {
            "url": this.url,
            "data": {
               "screen_name": "xonecas",
               "count": this.count,
               "trim_user": true,
               "include_rts": true,
               "exclude_replies": true
            },
            "dataType": "jsonp"
         });

         return $.ajax(params);
      }
   });

   var Badges = Backbone.Collection.extend({
      url: "http://coderwall.com/xonecas.json",

      parse: function (res, xhr) {
         return res.data.badges;
      },
   
      sync: function (model, method, options) {
         var params = _.extend(options, {
            "url": this.url,
            "dataType": "jsonp"
         });

         return $.ajax(params);
      }
   });


   var Header = Backbone.View.extend({
      className: 'topbar',
      tagName: 'header',
      template: '#header_tmpl',

      render: function () {
         $(this.el)
            .html($(this.template).html())
            .appendTo('body')
            .dropdown();
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

   var Footer = Backbone.View.extend({
      className:  'container',
      tagName:    'footer',
      template:   '#footer_tmpl',

      initialize: function () {
         _.bindAll(this, "render");
         this.twitter = new Twitter();
         this.twitter.bind('reset', this.render);
         this.twitter.fetch();

         this.badges = new Badges();
         this.badges.bind('reset', this.render);
         this.badges.fetch();
      },

      render: function () {
         var 
            template = Handlebars.compile($(this.template).html()),
            context = {
               twitter: this.twitter.toJSON(),
               badges: this.badges.toJSON()
            };

         $(this.el)
            .html(template(context))
            .appendTo('body');
      }
   }); 

   var Page = Backbone.View.extend({
      id:         'main',
      className:  'container',
      tagName:    'section',
      template:   '#post_tmpl',
      collection: new Tumblr(),

      initialize: function () {
         this.header = new Header({
            'collection': this.collection
         });
         this.photos = new Photos();
         this.photos.fetch();
         this.footer = new Footer();
         _.bindAll(this, "render", "report");
         this.collection.bind('reset', this.render);
         this.collection.bind('error', this.report);
         this.collection.bind('change', this.render);
         this.collection.fetch();
         this.header.render();
         $('body').append(this.el);
         this.footer.render();
      },

      report: function (err) {
         smoke.alert(err);
      },

      render: function () {
         var 
            html = "",
            template = Handlebars.compile($(this.template).html());

         this.collection.each(function (model) {
            html += template(model.toJSON());
         });

         $(this.el)
            .css('display', 'none')
            .html(html)
            .fadeIn(1000);

         if (window.scrollY > 310) {
            window.scrollTo(0, 310);
         }
         hijs('code');         
      }
   });

   $(function () {
      window.page = new Page();
   });
} ();
