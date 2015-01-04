function init(game) {
  var triangle = new Triangle();
  triangle.scale(5.0);
  triangle.position.set(0, 0);
  game.world.addObject(triangle);
  game.camera.position.set(0,0);


  var points = [[0,0], [50, 50], [100,0], [50, -50]];
  create_triangles(game, points);

  var path = new Path(points);

  game.animators.push(
    new PositionAnimator(5000.0, path, triangle)
  );
}

function game_loop(game, timestamp) {
}

function create_triangles(game, points) {
  points.map(function(point) {
    var t = new Triangle();
    t.scale(2.0);
    t.position.set(point[0], point[1]);
    game.world.addObject(t);
  });
}

new GameEngine("game_canvas", init, game_loop);
