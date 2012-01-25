/*global Tumblr:true, _:true, $:true, View:true */
$(function () {
   'use strict';

   var
   // data source
      tumblr,
   // views
      body,
      banner,
      previews,
      post;


   // init
   tumblr = new Tumblr('xonecas', 'IM11cPEsi3jxTeSNwF8BB9Z08UItXcYKiEDLTLvl5RYn6MBcMD');

   body = new View({ el: $('body') });
   banner = new View({
      el: $('.banner').first(),
      template: _.template($('#banner-tmpl').html())
   });
   previews = new View({ el: $('.previews').first() });
   post = new View({
      el: $('<section id="secondary" class="container"></div>').appendTo('body'),
      template: _.template($('#post-tmpl').html())
   });

   // events
   body.on('.back', 'click', function (ev) {
      $('#secondary').fadeOut('fast', function () {
         $('#main').fadeIn('fast');
      });

      ev.preventDefault();
      return false;
   });

   previews.on('.preview-title', 'click', function (ev) {
      tumblr.getpost(""+ $(ev.target).data('id'), { success: function (data) {
         post.el.hide();
         post.toHTML(data.response.posts[0]);
         $('#main').fadeOut('fast', function () {
            post.el.fadeIn('fast');
         });
      }});

      ev.preventDefault();
      return false;
   });

   // xhr init
   tumblr.getinfo({ 
      success: function (data) {
         banner.toHTML(data.response.blog);
         tumblr.getavatar({ 
            size: 96,
            success: function (avatarurl) {
               banner.el.prepend('<img class="push-right" src="'+ avatarurl +'">');
            }
         });
      }
   });

   tumblr.getpost(12, {
      type: 'text',
      success: function (data) {
         var posts = data.response.posts.reverse(),
            len = posts.length,
            post, prev;

         previews.items = [];

         while (len--) {
            post = posts[len];

            prev = $('<div></div>').html(post.body);
            post.body = prev.children().slice(0, 3).html() +' ... ';

            previews.items.push(new View({
               el: $('<div class="preview span-one-third"></div>').appendTo('.previews'),
               template: _.template($('#preview-tmpl').html())
            }).toHTML(post));
         }
      }
   });
});
