

function init(game) {
  for(var i = 0; i < 250; i++) {
    var triangle = new Triangle();
    triangle.scale(20.0);
    triangle.position.set(Math.random() * game.camera.size.width, Math.random() * game.camera.size.height);
    game.world.addObject(triangle);
    //animators.push(new PositionAnimator(5000.0, new Position(camera.position.x, camera.position.y), triangle));
    game.animators.push(new ConstantVelocityPositionAnimator(50.0/1000.0, new Position(game.camera.position.x, game.camera.position.y), triangle));
  }
}

function game_loop(game, timestamp) {
}

new GameEngine("game_canvas", init, game_loop);

