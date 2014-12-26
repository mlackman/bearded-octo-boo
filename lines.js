function GameMouseEvent(x, y, pressed) {
  this.x = x;
  this.y = y;
  this.pressed = pressed;
}
var mouse_events = [];

function Mouse(game) {
  var that = this;
  this.pressed = false;
  canvas = game.canvas;
  canvas.addEventListener("mousemove", function(event) {
    var x = event.clientX;
    var y = event.clientY;
    var pos = game.camera.convertScreenToWorldCoordinate(x, y);
    mouse_events.push(new GameMouseEvent(pos.x, pos.y, that.pressed));
  });
  canvas.addEventListener("mousedown", function() { that.pressed = true; });
  canvas.addEventListener("mouseup", function() { that.pressed = false; });
}

var mouse = null;
var lines = new Lines();
function init(game) {
  game.world.addObject(lines);
}


function game_loop(game, timestamp) {
  var prev_me = null;
  var me = null;
  do {
    me = mouse_events.shift();
    if(me == undefined) {
      if (prev_me && prev_me.pressed == true) { mouse_events.push(prev_me); } // Leave the last mouse event to seed the next game loop line drawing

    } else if(me.pressed && prev_me != null && prev_me.pressed) {
      lines.addLine([me.x, me.y], [prev_me.x, prev_me.y]);
    } else {
      lines = new Lines();
      game.world.addObject(lines);
    }
    prev_me = me;
  } while(me != undefined);
}

var game = new GameEngine("game_canvas", init, game_loop);
mouse = new Mouse(game);



