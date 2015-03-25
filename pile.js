function Pile( pointc, radius, roughness, fluctuation ) {
 	Renderable.call(this);

	this.radius = radius;
	this.bounce = 0;
	this.roughness = roughness;
	this.fluctuation = fluctuation;

	this.points = new Array( pointc );
	this.offs = new Array( pointc );
	this.fluc = new Array( pointc );
	this.flucs = new Array( pointc );

	for ( i = 0; i < this.offs.length; i++ )
	{
		var blob=Math.sin( Math.PI * ( i / this.offs.length ) * 10 );
		this.offs[i]=blob * this.roughness;
		this.fluc[i] = 0.0;
		this.flucs[i]=Math.random() * blob;
		if ( Math.random() > 0.5 )
			this.flucs[i] *= -1;
	}
}
inherit(Pile, Renderable);
Pile.prototype.render = function( context )
{
  if (this.screenPoints.length > 0) {
    var points = [];
    this.screenPoints.forEach(function(point) { points.push(point); }); // Copy
    points.push(this.screenPoints[0]);
	context.fillStyle="#CC8811"
    context.beginPath();
    var point = points[0];
    context.moveTo(point[0], point[1]);
	var len = points.length;
	if ( this.flags.open )
		len -= 1;
    for(var i = 1; i < len; i++) {
      point = points[i];
      context.lineTo(point[0], point[1]);
    }
    context.stroke();
    context.fill();
  }
}
Pile.prototype.step = function( dt ) {
	var step = Math.PI / ( this.points.length - 1 );
	for ( i = 0; i < this.points.length; i++ )
	{
		if ( this.fluc[i] > this.fluctuation || this.fluc[i] < -this.fluctuation )
		{
			var new_fluc = ( Math.random() );
			if ( this.flucs[i] <= 0 )
				this.flucs[i] = new_fluc;
			else
				this.flucs[i] = -new_fluc;
		}
		this.fluc[i] += ( this.flucs[i] * ( dt / 2000.0 ) );
		var offs = this.offs[i] + this.fluc[i];
		var rad = this.radius + this.bounce * dt + offs;
		this.points[i]=[Math.cos( step * i ) * rad, Math.sin( step * i ) * rad ];
	}
}

function Steam( pointc, height, freq, fluctuation ) {
 	Renderable.call(this);
	this.points = new Array( pointc );
	this.height = height;
	this.phase = 0;
	this.freq = freq;
	this.fc = 0.0;
	this.fluctuation = fluctuation;
	this.flags.open = true;
}
inherit(Steam, Renderable);

Steam.prototype.step = function( dt ) {
	var f = this.freq + Math.sin( this.fc );
	this.fc += this.fluctuation;
	for ( i = 0; i < this.points.length; i++ )
	{
		this.points[i]=[Math.sin( i / this.points.length * ( Math.PI + f ) +
			this.phase ), i / this.points.length * this.height];
	}
	this.phase += dt / 1000;
}

function StepAnimator( object ) {
	this.object = object;
	this.prev = null;
}

StepAnimator.prototype.execute = function( timestamp ) {
	if ( this.prev != null )
	{
		var dt = timestamp - this.prev;
		if ( dt > 0 )
			this.object.step( dt );
	}
	this.prev = timestamp;
}

function init(game) {
	var pile = new Pile( 20, 10.0, 0.5, 1.0 );
	pile.step( 0.0 );
	pile.scale( 10.0 );
	pile.position.set( 0, -120 );
	game.pile = pile;

	var steam1 = new Steam( 50, 15, 8, 0.01 );
	steam1.step( 0.0 );
	steam1.scale( 10.0 );
	steam1.position.set( -60, -10 );

	var steam2 = new Steam( 50, 15, 7, 0.04 );
	steam2.step( 0.0 );
	steam2.scale( 10.0 );
	steam2.position.set( 60, -10 );

	var steam3 = new Steam( 50, 15, 5, 0.01 );
	steam3.step( 0.0 );
	steam3.scale( 10.0 );
	steam3.position.set( 0, 10 );

	game.steam_bounce=0;

	game.world.addObject( pile );
	game.world.addObject( steam1 );
	game.world.addObject( steam2 );
	game.world.addObject( steam3 );
	game.camera.position.set(0,0);

	game.animators.push( new StepAnimator( pile ) );
	game.animators.push( new StepAnimator( steam1 ) );
	game.animators.push( new StepAnimator( steam2 ) );
	game.animators.push( new StepAnimator( steam3 ) );
}

function game_loop(game, timestamp) {
	var me = game.mouse.get_event();
	if ( me != undefined )
	{
		if ( me.pressed )
		{
			if ( game.pile.bounce < 0.1 )
				game.pile.bounce += 0.01;
			return;
		}
	}
	game.pile.bounce -= 0.005;
	if ( game.pile.bounce < 0 )
		game.pile.bounce = 0;
}

game = new GameEngine("game_canvas", init, game_loop);
game.enable_mouse();
