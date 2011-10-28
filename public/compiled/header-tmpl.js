(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['header-tmpl.html'] = template(function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers;
  var self=this;


  return "<div class=\"topbar-inner\">\n   <div class=\"container\">\n      <h3><a href=\"/\">xonecas</a></h3>\n      <ul class=\"nav\">\n         <li><a id=\"prev-post\" href=\"#\">Previous page</a></li>\n         <li><a id=\"next-post\" href=\"#\">Next page</a></li>\n      </ul>\n\n      <ul class=\"nav secondary-nav\">\n         <li class=\"menu\">\n            <a href=\"#\" class=\"menu\">Projects and experiments</a>\n            <ul class=\"menu-dropdown\">\n               <li>\n                  <a href=\"https://github.com/xonecas/canvas-rings\" target=\"_new\">\n                     Colorful Rings\n                  </a>\n               </li>\n               <li>\n                  <a href=\"https://github.com/xonecas/2d-particle-experiements\" target=\"_new\">\n                     2D Particle Experiments\n                  </a>\n               </li>\n               <li>\n                  <a href=\"https://github.com/xonecas/creativejs-threejs-part1\" target=\"_new\">\n                     Three.js tutorial from Creativejs.com\n                  </a>\n               </li>\n               <li>\n                  <a href=\"https://github.com/xonecas/fractal-tree\" target=\"_new\">\n                     Fractal Tree\n                  </a>\n               </li>\n               <li class=\"divider\"></li>\n               <li>\n                  <a href=\"https://github.com/xonecas/chrome-hijs\" \n                     target=\"_new\">\n                     Hijs for Chrome\n                  </a>\n               </li>\n               <li>\n                  <a href=\"https://github.com/xonecas/dotter\" \n                     target=\"_new\">\n                     Dotter\n                  </a>\n               </li>\n               <li>\n                  <a href=\"https://github.com/xonecas/disqus-node\" \n                     target=\"_new\">\n                     Disqus api for Node.js\n                  </a>\n               </li>\n            </ul>\n         </li>\n      </ul>\n   </div>\n</div>\n";});
})()