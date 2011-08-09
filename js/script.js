$(function () {
   
   // xonecas namespace
   // -----------------
   var x = window.x = {};

   // Helpers
   // -------
   // {{{ 8< 
   function relativeTime(time) {
      time = _.isNumber(time) ? time * 1000 : time;

      var then = +new Date(time),
         now = +new Date(),
         timestamp = now - then,
         days = 0, hours = 0;
      
      days = Math.floor(timestamp / (1000 * 60 * 60 * 24));
      hours = Math.floor(timestamp / (1000 * 60 * 60));

      if (days === 1)
         timestamp = "yesterday";
      else if (days > 31) 
         timestamp = "more than a month ago";
      else if (days > 1) 
         timestamp = days + " days ago";
      else if (hours === 1)
         timestamp = "an hour ago";
      else if (hours > 1)
         timestamp = hours + " hours ago";
      else 
         timestamp = "a few moments ago";

      return timestamp +".";
   }

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
   // }}}

   // Tumblr client
   // -------------
   // {{{ 8< 
   x.Blog = Backbone.Collection.extend({
      url: "http://api.tumblr.com/v2/blog/xonecas.tumblr.com/posts/text",
      page: 0,
      count: 5,

      parse: function (res, xhr) {

         _.each(res.response.posts, function (post, idx) {
            post.relTime = relativeTime(post.timestamp);
         });

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
      }
   });
   
   x.BlogView = Backbone.View.extend({
      collection: new x.Blog(),
      el: $('#tumblr'),
      template: $('#_tumblr').html(),

      events: {
         "mouseover .post": "updateSelected"
      },

      initialize: function () {
         this.collection.fetch();

         _.bindAll(this, 'render');
         this.collection.bind('reset', this.render);
      },

      render: function () {
         var that = this;

         this.el.empty();
         this.collection.forEach(function (el) {
            that.el.append(
               _.template(that.template, el.toJSON())
            );
         });
         this.visible = 0;
         $("#"+this.collection.at(0).get('id'))
            .addClass('selectedPost');
      },

      updateSelected: function (ev) {
         var that =  this;

         $('.selectedPost').removeClass('selectedPost');
         $(ev.target).closest('.post').addClass('selectedPost');
      }
   });
   // }}}

   // Twitter client
   // --------------
   // {{{ 8< 
   x.Tweets = Backbone.Collection.extend({
      url: "http://api.twitter.com/1/statuses/user_timeline.json",

      parse: function (res, xhr) {
         _.each(res, function (tweet, idx) {
            tweet.relTime = relativeTime(tweet.created_at);
            tweet.text = linkit(tweet.text);
         });

         return res;
      },

      sync: function (model, method, options) {
         var params = _.extend(options, {
            "url": this.url,
            "data": {
               "screen_name": "xonecas",
               "count": 10,
               "trim_user": true,
               "include_rts": true,
               "exclude_replies": true
            },
            "dataType": "jsonp"
         });

         return $.ajax(params);
      }

   });

   x.TweetsView = Backbone.View.extend({
      collection: new x.Tweets(),
      el: $('#latestTweet'),
      template: $('#_latestTweet').html(),

      initialize: function () {
         _.bindAll(this, 'render', 'loop');
         this.collection.bind('reset', this.loop);
         this.collection.fetch();
      },

      render: function () {
         var random = Math.floor(Math.random() * this.collection.length),
            tweet = this.collection.at(random);

         this.el.html(_.template(this.template, tweet.toJSON()));
      },

      loop: function () {
         this.render();

         setTimeout(this.loop, 60 * 1000);
      }
   });
   // }}}

   // Coderwall client
   // ----------------
   // {{{ 8< 
   x.Badges = Backbone.Collection.extend({
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

   x.BadgesView = Backbone.View.extend({
      collection: new x.Badges(),
      el: $("#coderwall"),
      template: $('#_coderwall').html(),

      initialize: function () {
         _.bindAll(this, 'render');
         this.collection.bind('reset', this.render);
         this.collection.fetch();
      },

      render: function () {
         var that = this;

         this.el.empty();
         this.collection.each(function (badge) {
            that.el.append(_.template(that.template, badge.toJSON()));
         });
      }
   });
   // }}}

   x.IndexView = Backbone.View.extend({
      el: $(document),

      events: {
         "keypress": "keypressRouter"
      },

      initialize: function () {
         this.blog = new x.BlogView();
         this.tweet = new x.TweetsView();
         this.badges = new x.BadgesView();
      },

      keypressRouter: function (ev) {
         switch (ev.which) {
         case 106:
         case 107:
            this.jumpTo(ev);
         break;
         case 47:
            ev.preventDefault();
         break;
         default:
            if (console && console.log) {
               console.log(ev.which);
            }
         }

      },

      jumpTo: function (ev) {
         var that = this,
            selectedID = parseInt($('.selectedPost')[0].id, 10);

         this.blog.collection.forEach(function (mod, idx) {
            if (mod.get('id') === selectedID) {
               that.blog.visible = idx;
            }
         });

         var modifier = ev.which === 106 ? 1 : -1,
            idx = this.blog.visible + modifier,
            post = this.blog.collection.at(idx);

         if (post) {
            var $el = $('#'+post.get('id')),
               offset = idx !== 0 ? $el.offset().top - 100: 0;

            $('.selectedPost').removeClass('selectedPost');
            $el.addClass('selectedPost');
            window.scroll(0, offset); // make this smooooooth
            this.blog.visible = idx;
         }

      }
   });

   // main
   // ----
   x.index = new x.IndexView();
   
   return x;

});
