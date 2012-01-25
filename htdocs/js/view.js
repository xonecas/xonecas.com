/*jshint expr:true, onevar:true */
/*global _:true, $:true, define: true */
var View = (function (win, doc, undefined) {
   'use strict';

   var View;

   View = function (options) {
      var el = options.el;
      this.el = el instanceof $ ? el : $(el);
      this.template = options.template;
      return this;
   };

   View.prototype = {
      toHTML: function (ctx) {
         this.el.html(this.template(ctx || {}));
         return this;
      },

      on: function (selector, eventType, handler) {
         this.el.delegate(selector, eventType, handler);
         return this;
      }
   };

   return (win.View = View);

}) (this, document);
