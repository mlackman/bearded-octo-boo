function inherit(klass, inheritedClass) {
  klass.prototype = Object.create(inheritedClass.prototype);
  klass.prototype.constructor = klass;
}

/***************************************************/
function ConstantVelocityPositionAnimator(velocity, target_position, object) {
  var distance = object.position.distance_to(target_position);
  this.position_animator = new PositionAnimator(distance/velocity, target_position, object);
}
ConstantVelocityPositionAnimator.prototype.execute = function(time) { this.position_animator.execute(time); }

function PositionAnimator(duration, target_position, object) {
  this.duration = duration;
  this.original_position = object.position.clone();
  this.deltaX = target_position.x - object.position.x;
  this.deltaY = target_position.y - object.position.y;
  this.start_time = null;
  this.object = object;
  this.running = true;
}

PositionAnimator.prototype.execute = function(time) {
  if (this.running) {
    if (!this.start_time) this.start_time = time;
    var duration = time - this.start_time;
    var dt = duration/this.duration;
    if (dt > 1.0) {
      dt = 1.0;
      this.running = false;
    }
    var value = -dt * (dt-2.0);
    var x = this.original_position.x + this.deltaX * value;
    var y = this.original_position.y + this.deltaY * value;
    this.object.position.set(x,y);
  }
}

/************************/
/* Position             */
/************************/
function Position(x, y) {
  this.x = x || 0.0;
  this.y = y || 0.0;
}

Position.prototype.clone = function() { return new Position(this.x, this.y) };

Position.prototype.set = function(x, y) { this.x = x; this.y = y }

Position.prototype.distance_to = function(position) {
  var dx = this.x - position.x;
  var dy = this.y - position.y;
  return Math.sqrt(dx*dx+dy*dy);
}

function Size() {
  this.width = 0.0;
  this.height = 0.0;
}

Size.prototype.set = function(width, height) { this.width = width; this.height = height; }

/***************************************************************************/
function Renderable() {
  this.points = [];
  this.position = new Position();
  this.screenPoints = [];
}

Renderable.prototype.getWorldPoints = function() {
  var that = this;
  return this.points.map(function(point) { return [point[0] + that.position.x, point[1] + that.position.y]; });
}

Renderable.prototype.setScreenPoints = function(screenPoints) {
  this.screenPoints = screenPoints;
}

Renderable.prototype.render = function(context) {
  if (this.screenPoints.length > 0) {
    var points = [];
    this.screenPoints.forEach(function(point) { points.push(point); }); // Copy
    points.push(this.screenPoints[0]);
    context.beginPath();
    var point = points[0];
    context.moveTo(point[0], point[1]);
    for(var i = 1; i < points.length; i++) {
      point = points[i];
      context.lineTo(point[0], point[1]);
    }
    context.stroke();
  }
}

/****************************************************************************************************/
function Triangle() {
  Renderable.call(this);
  points = [[0.0, 1.0], [1.0, -1.0], [-1.0, -1.0], [0.0, 1.0]];
  this.points = points.map(function(point) { return [point[0] * 20.0, point[1] * 20.0]; });
}
inherit(Triangle, Renderable);


/****************************************************************************************************/
function Lines() {
  Renderable.call(this);
}
inherit(Lines, Renderable);

Lines.prototype.addLine = function(point1, point2) {
  this.points.push(point1, point2);
}

/***************************************************************************************************/
function World() {
  this.objects = [];
  this.camera = null;
}

World.prototype.addObject = function(object) {
  this.objects.push(object);
}

World.prototype.setCamera = function(camera) {
  this.camera = camera;
}

World.prototype.render = function(context) {
  var self = this;
  this.objects.forEach(function(o) { self.renderObject(o, context); });
}

World.prototype.renderObject = function(object, canvas) {
  var worldPoints = object.getWorldPoints();
  var cameraWorldX = this.camera.position.x;
  var cameraWorldY = this.camera.position.y;
  // Move relative to camera position
  var objectCameraPoints = worldPoints.map(function(point) {
    return [point[0] - cameraWorldX, point[1] - cameraWorldY];
  });
  var cameraWidth = this.camera.size.width;
  var cameraHeight = this.camera.size.height;
  var centerX = cameraWidth / 2.0;
  var centerY = cameraHeight / 2.0;
  objectCameraPoints = objectCameraPoints.map(function(point) {
    return [point[0] + centerX, point[1] + centerY];
  });
  var aspectRatioX = canvas.width / cameraWidth;
  var aspectRatioY = canvas.height / cameraHeight;

  object.setScreenPoints(objectCameraPoints.map(function(point) {
    return [point[0]*aspectRatioX, (cameraHeight-point[1])*aspectRatioY];
  }));

  object.render(canvas.getContext("2d"));
}

/********************************************/
function Camera() {
  this.position = new Position();
  this.size = new Size();
}


Camera.prototype.convertScreenToWorldCoordinate = function(x,y) {
  var center_x = this.size.width / 2.0;
  var center_y = this.size.height / 2.0;

  var dx = x - center_x;
  var dy = y - center_y;
  var x = this.position.x + dx;
  var y = this.position.y - dy;
  return new Position(x, y);
}

/********************************************/
function GameEngine(canvas_id, init_callback, game_loop_callback) {
  var that = this;
  this.canvas = document.getElementById(canvas_id);
  this.ctx = this.canvas.getContext("2d");
  this.animators = [];

  window.addEventListener("load", function() {
    that.canvas.width = window.innerWidth;
    that.canvas.height = window.innerHeight-5;

    that.world = new World();
    that.camera = new Camera();
    that.camera.position.set(that.canvas.width/2.0, that.canvas.height/2.0);
    that.camera.size.set(that.canvas.width, that.canvas.height);
    that.world.setCamera(that.camera);
    init_callback(that);

    var fps = 0.0;
    var prevTimestamp = 0;
    var game_loop_func = function(timestamp) {
      game_loop_callback(that, timestamp);
      that.ctx.clearRect(0, 0, that.canvas.width, that.canvas.height);

      fps = Math.round(1000.0 / (timestamp - prevTimestamp));
      that.ctx.fillText(fps, 10, 10);

      that.animators.forEach(function(a) { a.execute(timestamp); });
      that.world.render(that.canvas);
      window.requestAnimationFrame(game_loop_func);

      prevTimestamp = timestamp;
    }
    window.requestAnimationFrame(game_loop_func);
  });
}

GameEngine.prototype.enable_mouse = function() {
  this.mouse = new Mouse(this);
}

/************************************/
function GameMouseEvent(x, y, pressed) {
  this.x = x;
  this.y = y;
  this.pressed = pressed;
}

/************************************/
function Mouse(game) {
  this.events = [];
  var that = this;
  this.pressed = false;
  canvas = game.canvas;
  canvas.addEventListener("mousemove", function(event) {
    var x = event.clientX;
    var y = event.clientY;
    var pos = game.camera.convertScreenToWorldCoordinate(x, y);
    that.events.push(new GameMouseEvent(pos.x, pos.y, that.pressed));
  });
  canvas.addEventListener("mousedown", function() { that.pressed = true; });
  canvas.addEventListener("mouseup", function() { that.pressed = false; });
}

Mouse.prototype.get_event = function() {
  return this.events.shift();
}


