let bugSprite;
let bugArray = [];

let STARTING_BUG_COUNT = 5;

function preload() {
  bugSprite = loadImage("bugSprite.png");
}

function setup() {
  createCanvas(800, 600);
  imageMode(CENTER);

  for(var i = 0; i < STARTING_BUG_COUNT; i++) {
    bugArray.push(new Bug(bugSprite, 50 + i * 10, 50 + i * 10));
  }
}

function draw() {
  rect(0, 0, 800, 800); 
  for(var i = 0; i < bugArray.length; i++) {
    bugArray[i].draw();
  }
}

function mousePressed() {
  bugArray[0].kill();
}

function keyPressed() {
  if(keyCode == RIGHT_ARROW) {
    for(var i = 0; i < bugArray.length; i++) {
      bugArray[i].go(1, 0);
    }
  }
  else if(keyCode == LEFT_ARROW) {
    for(var i = 0; i < bugArray.length; i++) {
      bugArray[i].go(-1, 0);
    }
  }
  else if(keyCode == UP_ARROW) {
    for(var i = 0; i < bugArray.length; i++) {
      bugArray[i].go(0, -1);
    }
  }
  else if(keyCode == DOWN_ARROW) {
    for(var i = 0; i < bugArray.length; i++) {
      bugArray[i].go(0, 1);
    }
  }
}

function keyReleased() {
  for(var i = 0; i < bugArray.length; i++) {
    bugArray[i].stop();
  }
}

class Bug {
  constructor(spriteSheet, x, y) {
    this.spriteSheet = spriteSheet;
    this.sx = 0;
    this.x = x;
    this.y = y;
    this.horizontal = 0;
    this.vertical = 0;
    this.facing = 1;
    this.rotation = 0;
    this.dead = false;
  }

  draw() {
    push();
    if(!this.dead) {
      translate(this.x, this.y);
      rotate(this.rotation*PI/2);
      scale(1, this.facing);

      if (this.horizontal == 0 && this.vertical == 0) {
        image(this.spriteSheet, 0, 0, 40, 40, 0, 0, 160, 160);
      }
      else {
        image(this.spriteSheet, 0, 0, 40, 40, (this.sx + 1) * 160, 0, 160, 160);
      }

      if (frameCount % 5 == 0) {
        this.sx = (this.sx + 1) % 3;
      }

      this.x += 2 * this.horizontal;
      this.y += 2 * this.vertical;
    }
    else {
      translate(this.x, this.y);
      image(this.spriteSheet, 0, 0, 40, 40, 0, 160, 160, 160);
    }
    pop();
  }

  go(horizontal, vertical) {
    this.horizontal = horizontal;
    this.vertical = vertical;
    if(vertical != 0) {
      this.facing = -1 * vertical;
      this.rotation = 0;
    }
    else if(horizontal != 0) {
      if(horizontal == 1) {
        this.rotation = 1;
      }
      else {
        this.rotation = 3;
      }
      this.facing = 1;
    }
    this.sx = 1;
  }

  stop() {
    this.vertical = 0;
    this.horizontal = 0;
  }

  kill() {
    this.dead = true;
  }
}
