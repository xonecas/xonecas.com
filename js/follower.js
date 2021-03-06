/*jslint browser:true */
(function () {
    'use strict';

    var body,
        canvas,
        c,
        height,
        img,
        radians,
        width;

    body = document.querySelector('body');
    canvas = document.createElement('canvas');
    c = canvas.getContext('2d');
    img = document.createElement('img');
    radians = Math.PI / 180;

    //body.appendChild(canvas);
    img.id = 'bg';
    img.alt = 'Background image';
    body.appendChild(img);


    function rrange(min, max, noFloor) {
        var result = Math.random() * (max - min) + min;
        return noFloor ? result : Math.floor(result);
    }

    function fractal() {
        var gens, max, size, startColor;
        gens = 0;
        max = 4;
        size = 10;
        startColor = 5;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        c.save();
        c.translate(canvas.width / 2, canvas.height / 2);

        (function init(angle, color, distance, scale) {
            gens += 1;
            angle = angle || rrange(1, 90);

            c.save();
            c.rotate(angle * radians);

            c.beginPath();
            c.moveTo(0, 0);
            c.lineTo(distance, 0);

            c.strokeStyle = '#cccccc';
            c.stroke();

            c.translate(distance, 0);
            c.scale(scale, scale);

            if (gens < max) {
                color = '#cccccc';
                init(rrange(1, 270), color, rrange(200, 300),
                    rrange(0.75, 1, true));
                init(rrange(1, 270), color, rrange(200, 300),
                    rrange(0.75, 1, true));
                init(rrange(1, 270), color, rrange(200, 300),
                    rrange(0.75, 1, true));
                init(rrange(1, 270), color, rrange(200, 300),
                    rrange(0.75, 1, true));
            }

            c.restore();
            gens -= 1;
        }(0, startColor, 0, 1));

        c.restore();

        return canvas.toDataURL();
    }

    (function drawLoop() {
        img.src = fractal();
        setTimeout(drawLoop, 10000);
    }());

}());
