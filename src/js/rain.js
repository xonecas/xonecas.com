/*jshint browser:true, curly:true, eqeqeq:true, onevar:true */
(function (win, doc) {

   var $banner = $('.banner'),
      canvas   = doc.createElement('canvas'),
      c        = canvas.getContext('2d'),
      radians  = Math.PI /180;

   $banner.append(canvas);
   canvas.width = $banner.outerWidth();
   canvas.height = $banner.outerHeight();


   function rrange(min, max, noFloor){
      var result = Math.random()*(max-min) + min;
      return noFloor ? result : Math.floor(result);
   }

   function Particle (x, y, size, color) {
      this.x      = x;
      this.y      = y;
      this.size   = size;
      this.color  = color || rrange(1, 359);
   }

   Particle.prototype = {
      draw: function () {
         c.save();
         c.fillStyle = "hsl("+ this.color +", 100%, 50%)";
         c.beginPath();
         c.arc(this.x, this.y, this.size, 0, Math.PI * 2, true);
         c.fill();
         c.restore();
      }
   };

   function rain () {
      var dash,
         dashes      = [],
         max         = 100,
         startColor  = 180,
         endColor    = 200,
         startLeap   = 0.2,
         endLeap     = 2.5;

      canvas.width = canvas.width;
      canvas.height = canvas.height;
      if (win.interval) {
         clearInterval(win.interval);
      }

      win.interval = setInterval(function () {
         var i = 0;

         c.save();
         c.fillStyle = 'hsla(0, 0%, 0%, 0.2)';
         c.fillRect(0, 0, canvas.width, canvas.height);
         c.restore();

         if (dashes.length <= max) {
            dash = new Particle( rrange(1, canvas.width, true),
                                 rrange(1, canvas.height, true),
                                 rrange(startLeap, endLeap, true), 
                                 rrange(startColor, endColor));
            dashes.push(dash);
         }

         for (i; i < dashes.length; i++) {
            dash = dashes[i];
            dash.y = dash.y >= canvas.height ? rrange(1, canvas.height/2): 
               dash.y + rrange(1, 6);

            dash.draw();
         }
      }, 1000/30);
   }

   //$(function () { rain(); });

}) (window, document);
