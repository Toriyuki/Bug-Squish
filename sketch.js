let bugSprite;
let bugArray = [];

let STARTING_BUG_COUNT = 30;
let xMax = 800;
let yMax = 600;

let timer;
let maxTime = 30;
let score = 0;

function preload() {
  bugSprite = loadImage("BugSprite.png");
}

function setup() {
  createCanvas(xMax, yMax);
  imageMode(CENTER);

  for(var i = 0; i < STARTING_BUG_COUNT; i++) {
    addBug();
  }
}

function draw() {
  rect(0, 0, 800, 800);
  timer = round(millis()/1000);
  countdown = maxTime - timer; 
  if(countdown > 0) {
    gameScreen();
  }
  else {
    while(bugArray.length > 0) {
      bugArray.pop();
    }
    endScreen();
  }

}

function gameScreen() {
  textSize(30);
  text("Time Remaining: ", 10, 30);
  text(countdown, 250, 30);
  text("Score: ", 500, 30);
  text(score, 600, 30);
  line(0, 40, 800, 40);
  for(var i = 0; i < bugArray.length; i++) {
    bugArray[i].draw();
  }
  checkBoundary();
}

function endScreen() {
  textSize(80);
  text("Bugs Killed:", 100, 200);
  text(score, 575, 200);
  rect(250, 300, 300, 100);
  textSize(60);
  text("Try Again", 270, 370);
  if(mouseIsPressed) {
    if((mouseX > 250) && (mouseX < 550) && (mouseY > 300) && (mouseY < 400)) {
      location.reload();
    }
  }
}

function addBug() {
  let tempBug = new Bug(bugSprite, Math.floor(random(0, xMax)), Math.floor(random(60, yMax)));
  setRandomMovement(tempBug, Math.floor(random(1, 5)));
  bugArray.push(tempBug);
}

function setRandomMovement(bug, movement) {
  if (movement == 1) {
    bug.go(1, 0);
  }
  else if (movement == 2) {
    bug.go(-1, 0);
  }
  else if (movement == 3) {
    bug.go(0, -1);
  }
  else if (movement == 4) {
    bug.go(0, 1);
  }
}

function checkBoundary() {
  for(var i = 0; i < bugArray.length; i++) {
    let bugX = bugArray[i].getX();
    let bugY = bugArray[i].getY();
    if(bugX < 0) {
      bugArray[i].go(1, 0);
    }
    else if(bugX > xMax) {
      bugArray[i].go(-1, 0);
    }
    else if(bugY < 60) {
      bugArray[i].go(0, 1);
    }
    else if(bugY > yMax) {
      bugArray[i].go(0, -1);
    }
  }
}

function killDetection() {
  for(var i = 0; i < bugArray.length; i++) {
    let bugX = bugArray[i].getX();
    let bugY = bugArray[i].getY();
    if(!bugArray[i].isDead() &&(mouseX > (bugX-30)) && (mouseX < bugX+30) && (mouseY > (bugY-30)) && (mouseY < (bugY+30))) {
      bugArray[i].kill();
      addBug();
      score++;
    }
  }
}

function mousePressed() {
  killDetection();
}

function keyPressed() {
  if(keyCode == RIGHT_ARROW) {
    addBug();
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
    if (!this.dead) {
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

      this.x += 2 * (this.horizontal * (1 + score * .03));
      this.y += 2 * (this.vertical * (1 + score * .03));
    }
    else {
      translate(this.x, this.y);
      rotate(this.rotation*PI/2);
      scale(1, this.facing);
      image(this.spriteSheet, 0, 0, 40, 40, 0, 160, 160, 160);
    }
    pop();
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }
  go(horizontal, vertical) {
    this.horizontal = horizontal;
    this.vertical = vertical;
    if (vertical != 0) {
      this.facing = -1 * vertical;
      this.rotation = 0;
    }
    else if (horizontal != 0) {
      if (horizontal == 1) {
        this.rotation = 1;
      }
      else {
        this.rotation = 3;
      }
      this.facing = 1;
    }
    this.sx = 0;
  }

  isDead() {
    return this.dead;
  }

  kill() {
    this.dead = true;
  }
}
