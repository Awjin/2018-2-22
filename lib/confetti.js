var retina = window.devicePixelRatio,
    PI = Math.PI,
    sqrt = Math.sqrt,
    round = Math.round,
    random = Math.random,
    cos = Math.cos,
    sin = Math.sin,

    rAF = window.requestAnimationFrame,
    cAF = window.cancelAnimationFrame || window.cancelRequestAnimationFrame,
    _now = Date.now || function () {return new Date().getTime();};

(function (w) {
  var prev = _now();
  function fallback(fn) {
    var curr = _now();
    var ms = Math.max(0, 16 - (curr - prev));
    var req = setTimeout(fn, ms);
    prev = curr;
    return req;
  }

  var cancel = w.cancelAnimationFrame
  || w.webkitCancelAnimationFrame
  || w.clearTimeout;

  rAF = w.requestAnimationFrame
  || w.webkitRequestAnimationFrame
  || fallback;

  cAF = function(id){
    cancel.call(w, id);
  };
}(window));

document.addEventListener("DOMContentLoaded", function() {
  var speed = 125,
      duration = (1.0 / speed),
      confettiPaperCount = 15,
      DEG_TO_RAD = PI / 180,
      RAD_TO_DEG = 180 / PI,
      colors = [
        ["#fcf275", "#ece265"],
        ["#4df5cd", "#3de5bd"],
        ["#ff7181", "#ef6171"],
        ["#7072e8", "#6062d8"]
      ];

  function Vector2(_x, _y) {
    this.x = _x, this.y = _y;
    this.Length = function() {
      return sqrt(this.SqrLength());
    }
    this.SqrLength = function() {
      return this.x * this.x + this.y * this.y;
    }
    this.Add = function(_vec) {
      this.x += _vec.x;
      this.y += _vec.y;
    }
    this.Sub = function(_vec) {
      this.x -= _vec.x;
      this.y -= _vec.y;
    }
    this.Div = function(_f) {
      this.x /= _f;
      this.y /= _f;
    }
    this.Mul = function(_f) {
      this.x *= _f;
      this.y *= _f;
    }
    this.Normalize = function() {
      var sqrLen = this.SqrLength();
      if (sqrLen != 0) {
        var factor = 1.0 / sqrt(sqrLen);
        this.x *= factor;
        this.y *= factor;
      }
    }
    this.Normalized = function() {
      var sqrLen = this.SqrLength();
      if (sqrLen != 0) {
        var factor = 1.0 / sqrt(sqrLen);
        return new Vector2(this.x * factor, this.y * factor);
      }
      return new Vector2(0, 0);
    }
  }
  Vector2.Lerp = function(_vec0, _vec1, _t) {
    return new Vector2((_vec1.x - _vec0.x) * _t + _vec0.x, (_vec1.y - _vec0.y) * _t + _vec0.y);
  }
  Vector2.Distance = function(_vec0, _vec1) {
    return sqrt(Vector2.SqrDistance(_vec0, _vec1));
  }
  Vector2.SqrDistance = function(_vec0, _vec1) {
    var x = _vec0.x - _vec1.x;
    var y = _vec0.y - _vec1.y;
    return (x * x + y * y + z * z);
  }
  Vector2.Scale = function(_vec0, _vec1) {
    return new Vector2(_vec0.x * _vec1.x, _vec0.y * _vec1.y);
  }
  Vector2.Min = function(_vec0, _vec1) {
    return new Vector2(Math.min(_vec0.x, _vec1.x), Math.min(_vec0.y, _vec1.y));
  }
  Vector2.Max = function(_vec0, _vec1) {
    return new Vector2(Math.max(_vec0.x, _vec1.x), Math.max(_vec0.y, _vec1.y));
  }
  Vector2.ClampMagnitude = function(_vec0, _len) {
    var vecNorm = _vec0.Normalized;
    return new Vector2(vecNorm.x * _len, vecNorm.y * _len);
  }
  Vector2.Sub = function(_vec0, _vec1) {
    return new Vector2(_vec0.x - _vec1.x, _vec0.y - _vec1.y, _vec0.z - _vec1.z);
  }

  function ConfettiPaper(_x, _y) {
    this.pos = new Vector2(_x, _y);
    this.rotationSpeed = (random() * 600 + 800);
    this.angle = DEG_TO_RAD * random() * 360;
    this.rotation = DEG_TO_RAD * random() * 360;
    this.cosA = 1.0;
    this.size = 6.0;
    this.oscillationSpeed = (random() * 1.5 + 0.5);
    this.xSpeed = 40.0;
    this.ySpeed = (random() * 60 + 50.0);
    this.corners = new Array();
    this.time = random();
    var ci = round(random() * (colors.length - 1));
    this.frontColor = colors[ci][0];
    this.backColor = colors[ci][1];
    for (var i = 0; i < 4; i++) {
      var dx = cos(this.angle + DEG_TO_RAD * (i * 90 + 45));
      var dy = sin(this.angle + DEG_TO_RAD * (i * 90 + 45));
      this.corners[i] = new Vector2(dx, dy);
    }
    this.Update = function(_dt) {
      this.time += _dt;
      this.rotation += this.rotationSpeed * _dt;
      this.cosA = cos(DEG_TO_RAD * this.rotation);
      this.pos.x += cos(this.time * this.oscillationSpeed) * this.xSpeed * _dt
      this.pos.y += this.ySpeed * _dt;
      if (this.pos.y > ConfettiPaper.bounds.y) {
        this.pos.x = random() * ConfettiPaper.bounds.x;
        this.pos.y = 0;
      }
    }
    this.Draw = function(_g) {
      if (this.cosA > 0) {
        _g.fillStyle = this.frontColor;
      } else {
        _g.fillStyle = this.backColor;
      }
      _g.beginPath();
      _g.moveTo((this.pos.x + this.corners[0].x * this.size) * retina, (this.pos.y + this.corners[0].y * this.size * this.cosA) * retina);
      for (var i = 1; i < 4; i++) {
        _g.lineTo((this.pos.x + this.corners[i].x * this.size) * retina, (this.pos.y + this.corners[i].y * this.size * this.cosA) * retina);
      }
      _g.closePath();
      _g.fill();
    }
  }
  ConfettiPaper.bounds = new Vector2(0, 0);

  confetti = {};
  confetti.Context = function(id) {
    var i = 0;
    var canvas = document.getElementById(id);
    var canvasParent = canvas.parentNode;
    var canvasWidth = canvasParent.offsetWidth;
    var canvasHeight = canvasParent.offsetHeight;
    canvas.width = canvasWidth * retina;
    canvas.height = canvasHeight * retina;
    var context = canvas.getContext('2d');
    var interval = null;
    var confettiPapers = new Array();
    ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
    for (i = 0; i < confettiPaperCount; i++) {
      confettiPapers[i] = new ConfettiPaper(random() * canvasWidth, random() * canvasHeight);
    }
    this.resize = function() {
      canvasWidth = canvasParent.offsetWidth;
      canvasHeight = canvasParent.offsetHeight;
      canvas.width = canvasWidth * retina;
      canvas.height = canvasHeight * retina;
      ConfettiPaper.bounds = new Vector2(canvasWidth, canvasHeight);
    }
    this.start = function() {
      this.stop()
      var context = this;
      this.update();
    }
    this.stop = function() {
      cAF(this.interval);
    }
    this.update = function() {
      var i = 0;
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (i = 0; i < confettiPaperCount; i++) {
        confettiPapers[i].Update(duration);
        confettiPapers[i].Draw(context);
      }
      this.interval = rAF(function() {
        confetti.update();
      });
    }
  }
  var confetti = new confetti.Context('confetti');
  confetti.start();
  window.addEventListener('resize', function(event){
    confetti.resize();
  });
});
