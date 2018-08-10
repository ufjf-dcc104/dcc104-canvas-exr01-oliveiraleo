//Posicao barra
function Point(x, y) {
	this.x = x;
	this.y = y;
}
//Tamanho barra
function Size(w, h) {
	this.w = w;
	this.h = h;
}

//Construtor nave
function Sprite(coord, size, url) {
	this.size  = size  || new Size(50, 50);
	this.coord = coord || new Point(0, 0);

	this.image = new Image();
	this.image.src = url;


	this.vel   = {vx: 0, vy: 0};
	this.acel  = {ax: 0, ay: 0};
	this.omega = 0;
	this.vento = -50;
	//desenha
	this.draw = function(ctx, g) {
		ctx.save();
		ctx.translate(this.coord.x, this.coord.y);

		ctx.drawImage(this.image, -this.size.w/2, -this.size.h/2, this.size.w, this.size.h);
		ctx.restore();
	}
	//movimenta
	this.move = function(dt, g) {
		this.vel.vx += (this.vento + this.acel.ax) * dt;
		this.vel.vy += (this.acel.ay - g) * dt;

		this.coord.x += this.vel.vx * dt;
		this.coord.y += this.vel.vy * dt;
	}
	//reset
	this.reset = function(p0) {
		this.coord = p0;
		this.vel = {vx: 0, vy: 0};
		this.acel = {ax: 0, ay: 0};
		this.omega = 0;
	}
	//controle movimento
	this.moveDir = function(g) {
			this.acel.ax = -1.5 * g;
	}
    this.moveEs = function(g) {
			this.acel.ax = g;
	}
    this.toUp = function(g) {
				this.acel.ay = -1 + 3*g;
    }
    this.toDown = function(g) {
				this.acel.ay =  -1 - g;
    }
}
