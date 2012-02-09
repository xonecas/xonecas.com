/*global Tumblr:true, _:true, $:true, View:true, parallax: true, Github:true */
$(function () {
   'use strict';

   var tumblr = new Tumblr('xonecas', 'IM11cPEsi3jxTeSNwF8BB9Z08UItXcYKiEDLTLvl5RYn6MBcMD'),
      github = new Github('xonecas');
   $('body').hide();

   tumblr.getpost(20, {
      type: 'text',
      success: function (data) {
         var _posts = data.response.posts,
            info = data.response.blog,
            pageTemplate = _.template($('#page-tmpl').html()),
            index;

         index = new View({
            el: $('<section id="index" class="container"></section>')
               .prependTo('body'),
            template: _.template($('#index-tmpl').html())
         }).toHTML(_.extend(info, { posts: _posts }));
         parallax.add(index.el);
         index.on('.navigation', 'click', function (ev) {
            parallax[ev.target.id].right();
            ev.preventDefault();
            return false;
         });

         _.each(_posts, function (post, idx) {
            var page = new View({
               el: $('<section class="container"></section>').prependTo('body'),
               template: pageTemplate
            }).toHTML(post);

            page.el.attr('id', post.id);
            parallax.add(page.el);
            page.on('.back', 'click', function (ev) {
               parallax.index.left();
               ev.preventDefault();
               return false;
            });
         });

         $('body').noisy().css('background-color', '#121212').show();
         parallax.index.show();
      }
   });

   github.getrepos(function (data) {
      var gitview = new View({
         el: $('<div id="github"></div>').appendTo('#index'),
         template: _.template($('#github-tmpl').html())
      }).toHTML({ repos: data.repositories });
   });

   $.get('/analytics');
});
