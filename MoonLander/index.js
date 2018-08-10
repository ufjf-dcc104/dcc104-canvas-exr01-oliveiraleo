//configura o texto
function Text(font, size, rgb) {
  this.font = font 	|| "Arial";
  this.size = size 	|| 20;
  this.color = rgb 	|| "#FFFFFF";

  this.raster = function(ctx, text, x, y) {
    ctx.font = "" + this.size + "px " + this.font;
    ctx.fillStyle = this.color;
    ctx.fillText(text, x, y);
  }
}
//variaveis globais
var msg = new Text("Courier", 30, "white");

var pause = false;//controle do pause
var state = new State();//Cria o estado global do jogo
var inicio = false;

const VLIMITE = 50.0; //velocidade de pouso máxima
//sons
var musica = new Audio('audio/wind.mp3');
var explosao = new Audio('audio/boom.mp3');
var ganhou = new Audio('audio/win.mp3');
var gameover = new Audio('audio/gameover.mp3');
var intro = new Audio('audio/intro.mp3');
var levelup = new Audio('audio/levelup.mp3');
var dead = new Audio('audio/dead.mp3');

var hit = new Audio();
hit.src = "audio/hit2.mp3";
var pauseSom = new Audio();
pauseSom.src = "audio/blink.mp3";

var pancada = function(){
  hit.load();
  hit.play();
}

var parada = function(){
  pauseSom.volume = 1.0;
  pauseSom.load();
  pauseSom.play();
}
//Controle do pause
function mudaPause(){
  parada();
  pause = !pause;
}
//controle de estado
function State() {
  this.life = 5;
  this.score = 0;
  this.velocidade = 0;
  this.avisos = " ";
  this.id = 0;
  this.text = new Text();
  //Funcoes auxiliares do texto da tela
  this.sumScore = function() { this.score++; }
  this.lostLife = function() { this.life--; }
  this.sumLife = function() { this.life++; }
  this.sumVel = function(v){//Display da velocidade
    if(v>VLIMITE){
      this.velocidade = "Velocidade alta para pouso!!!";
    }else {
      this.velocidade = " ";
    }
  }
  //exibe o texto
  this.show = function(ctx) {
    this.text.raster(ctx, "Vidas:  " + this.life, 10, 20);
    this.text.raster(ctx, "Pontos:  " + this.score, 650, 20);
    this.text.raster(ctx, "Combustivel: ", 10, 52);
    this.text.raster(ctx, " " + this.velocidade, 275, 20);//aviso velocidade
  }
  //reset do jogo
  this.reset = function() {
    this.life = 5;
    this.score = 0;
    this.avisos = " ";
    gameover.play();
  }
}
//comeca o jogo
function start() {
    var canvas = document.getElementById("tela");
    var ctx = canvas.getContext("2d");

    const WIDTH = canvas.offsetWidth;
    const HEIGHT = canvas.offsetHeight;

    intro.play();//musica de inicio

  const base = { pos: new Point(Math.random() * (WIDTH-150), HEIGHT-15), size: new Size(150, 15) };

  const FPS = 60;
  const DT = 1/FPS;
  const G = -75;
  //ajusta o fundo da tela
    var fundo  =  new Image();
    fundo.src = "img/lua.jpg";
  //cria a nave na tela
  var nave = new Sprite(new Point(WIDTH/2, HEIGHT/3), new Size(80, 120), "img/nave.png");
  //cria a barra de combustivel na tela
  var bar = { pos: new Point(135, 37), size: new Size(WIDTH-170, 15), energy: 1.0 };
  //Regra do jogo
  var loop = function() {
    if(inicio && !pause){
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      //musica do jogo em loop
      musica.play();
      musica.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
      });
    //velocidade
    var velocidadeTotal = nave.vel.vx + nave.vel.vy;
    state.sumVel(velocidadeTotal);

    //nave.venta(G, DT);

    if(bar.energy <= 0.0) {// se o combustivel acaba
      console.log("Acabou o combustivel!!");
      dead.play();
      bar.energy = 1.0;
      state.lostLife();
      nave.reset({x: WIDTH/2, y: HEIGHT/3});
      this.mudaPause();

      if(state.life == 0) {//se a vida acaba
        console.log("Game Over!!");
        gameover.play();
        state.reset();
        bar.energy = 1.0;
        this.mudaPause();
      }
      //Reposiciona a base
      base.pos.x = Math.random() * (WIDTH-150);
    }

    ctx.drawImage(fundo, 0,0);
    //propriedades da barra de combustivel
    ctx.strokeStyle = "#a0afa1";//Controla a borda
    if(bar.energy<=0.2){//Controla a cor
      ctx.fillStyle = "#ff1000";
    }else if(bar.energy>0.2 && bar.energy<=0.4){
      ctx.fillStyle = "#a51309";
    }else if(bar.energy>0.4 && bar.energy<0.7){
      ctx.fillStyle = "#d6d60a";
    }else{
      ctx.fillStyle = "#00ff15";
    }

    ctx.fillRect(bar.pos.x, bar.pos.y, bar.energy * bar.size.w, bar.size.h);
    ctx.strokeRect(bar.pos.x, bar.pos.y, bar.size.w, bar.size.h);
    // propriedades da base
    ctx.fillStyle = "#ff0000";
    ctx.strokeStyle = "#000000";
    ctx.fillRect(base.pos.x, base.pos.y, base.size.w, base.size.h);
    ctx.strokeRect(base.pos.x, base.pos.y, base.size.w, base.size.h);
    //move a nave
    nave.move(DT, G);
    //Controle da barra de combustivel
    if(nave.acel.ay<0){
      bar.energy -= 0.05*DT;
    }else if(nave.acel.ay>0){
      bar.energy -= 0.03*DT;
    }else if (nave.acel.ax>0) {
      bar.energy -= 0.02*DT;
    }else if (nave.acel.ax<0) {
      bar.energy -= 0.03*DT;
    }
    //controle de saida da tela
    if(nave.coord.y - nave.size.h  < 0 ){//saida em cima
      nave.coord.y = nave.size.h;
      nave.acel.ay = 0;
      nave.acel.ax = 0;
      nave.vel.vy = 0;
      pancada();
    }else if(nave.coord.x - (nave.size.w/2) < 0) {//saida pela esquerda
      nave.coord.x = (nave.size.w/2);
      nave.acel.ay = 0;
      nave.acel.ax = 0;
      nave.vel.vx = 0;
      pancada();
    }else if(nave.coord.x + (nave.size.w/2) > WIDTH) {//saida pela direita
      nave.coord.x = WIDTH - (nave.size.w/2);
      nave.acel.ay = 0;
      nave.acel.ax = 0;
      nave.vel.vx = 0;
      pancada();
    }
    //Verifica a colisao da nave com a base
    if(base.pos.x < nave.coord.x && nave.coord.x < base.pos.x + base.size.w) {
      if(nave.coord.y + nave.size.h/2 > base.pos.y) {
        if(nave.vel.vy < VLIMITE) {
          console.log("Você venceu!");
          ganhou.play();
          state.sumScore();
          if(state.score%5 == 0){
            levelup.play();
            state.sumLife();
          }
          nave.reset({x: WIDTH/2, y: HEIGHT/3});
        } else {
          console.log("Você perdeu!");
          explosao.play();
          state.lostLife();
          nave.reset({x: WIDTH/2, y: HEIGHT/3});
          if(state.life == 0) {
            console.log("Game Over!...");
            bar.energy = 1.0;
            state.reset();
            this.mudaPause();
          }
        }
        base.pos.x = Math.random() * (WIDTH-150);
      }
    } else {

      if(nave.coord.y + nave.size.h/2 > base.pos.y) {
        nave.coord.y = base.pos.y - nave.size.h/2;
        nave.acel.ay = 0;
        nave.vel.vy = 0;
        explosao.play();
        console.log("Você perdeu!");
        state.lostLife();
        nave.reset({x: WIDTH/2, y: HEIGHT/3});
        if(state.life == 0) {
          console.log("Game Over!...");
          gameover.play();
          state.reset();
          this.mudaPause();
        }
        base.pos.x = Math.random() * (WIDTH-150);
      }
    }
    nave.draw(ctx, G);
    state.show(ctx);
  }else if(!inicio){
    canvas.fillStyle = "black";
    canvas.fillRect = (0,0,WIDTH, HEIGHT);
    msg.raster(ctx, "Aperte ENTER para começar", WIDTH/5, HEIGHT/2 );
  }else if(pause){
    msg.raster(ctx, "Aperte ESPAÇO para continuar", WIDTH/5, HEIGHT/4 );
  }
}

  setInterval(loop, 1000/FPS);

  addEventListener("keydown", function(e){
    if(e.keyCode == 87 || e.keyCode == 38) {// W
      nave.toUp(G);
      e.preventDefault();
    } if(e.keyCode == 65 || e.keyCode == 37) { // A
      nave.moveEs(G);
      e.preventDefault();
    } if(e.keyCode == 83 || e.keyCode == 40) { // S
      nave.toDown(G);
      e.preventDefault();
    } if(e.keyCode == 68 || e.keyCode == 39) { // D
      nave.moveDir(G);
      e.preventDefault();
    } if (e.keyCode == 32) { // Space Bar
      this.mudaPause();
      e.preventDefault();
    } if (e.keyCode == 13){ // Enter
      this.inicio = true;
      e.preventDefault();
    }
  });

  addEventListener("keyup", function(e){
    if(e.keyCode == 87 || e.keyCode == 83 || e.keyCode == 40 || e.keyCode == 38) { // W ou S
      nave.acel.ay = 0;
    } else if(e.keyCode == 65 || e.keyCode == 37) { // A
      nave.acel.ax = 0;
    } else if(e.keyCode == 68 || e.keyCode == 39) { // D
      nave.acel.ax = 0;
    }
  });
}
