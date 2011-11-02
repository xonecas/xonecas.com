({
   appDir: './public',
   baseUrl: './',
   paths: {
      bootstrap: './bootstrap/js'
   },
   dir: 'build',
   modules: [
      {name: 'js/init'}
   ],
   dirExclusionRegExp: /^(node_modules|2d-particle-experiements|canvas-rings|creativejs-threejs-part1|fractal-tree|build)$/
})
