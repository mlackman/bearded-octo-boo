var lines = new Lines();
function init(game) {
  game.world.addObject(lines);
}
function game_loop(game, timestamp) {
  var prev_me = null;
  var me = null;
  do {
    var mouse = game.mouse;
    me = mouse.get_event();
    if (me == undefined) {
      // Leave the last mouse event to seed the next game loop line drawing
      if (prev_me && prev_me.pressed == true) { mouse.events.push(prev_me); }
    } else if (me.pressed && prev_me != null && prev_me.pressed) {
      lines.addLine([me.x, me.y], [prev_me.x, prev_me.y]);
    } else {
      lines = new Lines();
      game.world.addObject(lines);
    }
    prev_me = me;
  } while(me != undefined);
}

var game = new GameEngine("game_canvas", init, game_loop);
game.enable_mouse();

