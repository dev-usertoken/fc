;(function() {

  var performance = window.performance || {}
  var performanceNow =
    performance.now        ||
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() }
  performanceNow = performanceNow.bind(performance)

  // Fullscreen canvas
  function fc(fn, autorun, dimensions) {
    document.body.style.margin = "0px";
    document.body.style.padding = "0px";

    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.style.position = 'absolute';
    canvas.style.left = '0px';
    canvas.style.top = '0px';

    var ctx;
    dimensions = dimensions || 2;

    if (dimensions === 2) {
      ctx = canvas.getContext('2d');
    } else if (dimensions === 3) {
      ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    }

    if (!ctx) {
      return;
    }

    var last = performanceNow(), request;

    function tick() {

      var time = performanceNow();
      var delta = time-last;
      last = time;

      ctx.reset();

      dimensions === 2 && ctx.save();
      fn && fn(delta);

      // wait until after render to nullify the RAF sentinel
      request = null;

      dimensions === 2 && ctx.restore();
      if (autorun) {
        request = requestAnimationFrame(tick);
      }
    }

    if (dimensions === 2) {
      ctx.reset = function fc_reset() {
        canvas.width = 0;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };

      ctx.clear = function fc_clear(color) {
        var orig = ctx.fillStyle;
        ctx.fillStyle = color || "#223";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = orig;
      };
    } else {
      ctx.reset = function fc_reset() {
        if (canvas.width !== window.innerWidth) {
          canvas.width = window.innerWidth;
        }

        if (canvas.height !== window.innerHeight) {
          canvas.height = window.innerHeight;
        }
      }
    }

    setTimeout(tick, 0);

    ctx.dirty = function fc_dirty() {
      if (!request) {
        // reset the last time so we don't get weird jumps
        last = performanceNow();

        request = requestAnimationFrame(tick);
      }
    };

    ctx.stop = function fc_stop() {
      autorun = false;
      request && cancelAnimationFrame(request);
      request = null;
    };

    ctx.start = function fc_start() {
      autorun = true;
      if (!request) {
        request = requestAnimationFrame(tick);
      }
    };

    (window.attachEvent || window.addEventListener)('resize', ctx.dirty);

    ctx.canvas = canvas;
    return ctx;
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = fc;
  }

  if (typeof window !== 'undefined') {
    window.fc = window.fc || fc;
  }
})();
