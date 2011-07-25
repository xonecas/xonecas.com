$(function () {
   
   // xonecas namespace
   // -----------------
   var x = window.x = {};

   // defaults
   // --------
   x.alpha = "abcdefghijklmnopqrstuvwxyz";

   // Helpers
   // -------
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


   // Tumblr client
   // -------------
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

      initialize: function () {
         this.collection.fetch();

         _.bindAll(this, 'render');
         this.collection.bind('reset', this.render);
      },

      render: function () {
         var that = this;

         this.el.empty();
         this.collection.forEach(function (el) {
            var rnd = Math.floor(Math.random() * x.alpha.length)
            el.set({"alien": x.alpha[rnd] }, {"silent": true});
            that.el.append(
               _.template(that.template, el.toJSON())
            );
         });
      }
   });

   // Twitter client
   // --------------
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


   // main
   // ----
   x.b = new x.BlogView();
   x.t = new x.TweetsView();
   
   return x;

});
