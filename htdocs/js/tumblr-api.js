/*jshint expr:true, onevar:true */
/*global _:true, $:true, define: true */
var Tumblr = (function (win, doc, undefined) {
   'use strict';

   var Tumblr;

   Tumblr = function (user, key, version) {
      this.user = user;
      this.key = key;
      this.version = version || 'v2';
      this.avatar = [];
      this.posts = [];

      return this;
   };

   Tumblr.prototype = {
      sync: function (method, options) {
         options = options || {};
         var _success = options.success, params;
         delete options.success;

         params = {
            type: 'GET',
            url: '//api.tumblr.com/'+ this.version +'/blog/'+ this.user +'.tumblr.com/'+ method,
            data: _.extend({ api_key: this.key }, options),
            dataType: 'jsonp',
            jsonp: 'jsonp',
            success: _success
         };

         return $.ajax(params);
      },

      getinfo: function (options) {
         var success = options.success,
            that = this;

         if (this.info) {
            success && success(this.info);
         } else {
            options.success = function (data) {
               if (data.response.blog) {
                  that.info = data.response.blog;
               }
               return success && success(data);
            };
            this.sync('info', options);
         }

         return this;
      },

      getavatar: function (options) {
         var success, size = options.size || 64,
            that = this;

         delete options.size;

         if (this.avatar[size]) {
            options.success && options.success(this.avatar[size]);
         } else {
            success = options.success;
            options.success = function (data) {
               var url = data.response.avatar_url;
               that.avatar[size] = url;
               return success && success(url);
            };
            this.sync('avatar/' +size, options);
         }

         return this;
      },

      getpost: function (/* <string> id OR <number> number of posts to fetch (starts from the latest)*/) {
         var argv = arguments[0],
            options = arguments[1] || {},
            type = options.type || '',
            that = this,
            length, success;

         delete options.type;

         if (_.isString(argv)) {
            options.id = argv;
         } else { // asume number
            length = options.limit = argv;
         }

         success = options.success;
         options.success = function (data) {
            // better data manip needed here.
            this.posts = data.response.posts;
            success && success(data);
         };
         this.sync('posts/'+type, options);

         return this;
      }
   };

   if (typeof define === 'function') {
      // it depends on jquery and underscore, not quite sure how to reflect this atm.
      define('Tumblr', [], function () { return Tumblr; });
   }

   return (win.Tumblr = Tumblr);

}) (this, document);
