/*jshint expr:true, onevar:true */
/*global _:true, $:true, define: true */
var Github = (function (win, undefined) {
   'use strict';

   var Github;

   Github = function (username) {
      this.username = username;
   };

   Github.prototype = {
      sync: function (options) {
         options = options || {};
         var _success = options.success, params,
            _url = options.url;

         delete options.url;
         delete options.success;

         params = {
            type: 'GET',
            url: _url,
            data: options,
            dataType: 'jsonp',
            success: _success
         };

         return $.ajax(params);
      },

      getrepos: function (cb) {
         this.sync({
            url: '//github.com/api/v2/json/repos/show/'+ this.username,
            success: cb
         });
         return this;
      }
   };

   return (win.Github = Github);

}) (this);
