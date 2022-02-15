let bugSprite;
let bugArray = [];

let STARTING_BUG_COUNT = 30;
let xMax = 800;
let yMax = 600;
let state = "start";
let speed = .03;
let difficulty;

let timer;
let maxTime = 30;
let startTime = 0;
let score = 0;
let totalClick = 0;
let successClick = 0;
let acc;

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
  rect(0, 0, xMax, yMax);
  timer = round(millis()/1000);
  countdown = maxTime - timer + startTime; 
  if(state == "start") {
    startScreen();
    startTime = round(millis()/1000);
  }
  else if(state == "game") {
    gameScreen();
    if(countdown <= 0) {
      state = "end";
    }
  }
  else if (state == "end"){
    while(bugArray.length > 0) {
      bugArray.pop();
    }
    endScreen();
  }

}

function startScreen() {
  textSize(100);
  text("Bug Squish", 100, 100);
  textSize(80);
  rect(150, 150, 400, 100);
  text("Easy", 250, 225);
  rect(150, 300, 400, 100);
  text("Normal", 215, 380);
  rect(150, 450, 400, 100);
  text("Hard", 250, 525);
  if(mouseIsPressed) {
    if((mouseX > 150) && (mouseX < 550) && (mouseY > 150) && (mouseY < 250)) {
      difficulty = "Easy";
      base_speed = .75;
      increase_speed = .015;
      state = "game";
    }
    else if((mouseX > 150) && (mouseX < 550) && (mouseY > 300) && (mouseY < 400)) {
      difficulty = "Normal";
      base_speed = 1;
      increase_speed = .03;
      state = "game";
    }
    else if((mouseX > 150) && (mouseX < 550) && (mouseY > 450) && (mouseY < 550)) {
      difficulty = "Hard";
      base_speed = 1.15;
      increase_speed = .035;
      state = "game";
    }
  }
}

function gameScreen() {
  textSize(30);
  text("Time Remaining: ", 10, 30);
  text(countdown, 250, 30);
  text("Score: ", 400, 30);
  text(score, 500, 30);
  text("Acc: ", 600, 30);
  if(totalClick == 0) {
    acc = 0;
  }
  else {
    acc = parseFloat((successClick / totalClick) * 100).toFixed(2);
  }
  text(acc + "%", 680, 30);
  line(0, 40, xMax, 40);  
  for(var i = 0; i < bugArray.length; i++) {
    bugArray[i].draw();
    if((difficulty == "Hard") && (!bugArray[i].hasChanged()) && (countdown % 3 == 0)) {
      setRandomMovement(bugArray[i]);
      bugArray[i].setChanage(true);
    }
    else if (countdown % 3 == 1) {
      bugArray[i].setChanage(false);
    }
  }
  checkBoundary();
}

function endScreen() {
  textSize(100);
  let xSet = 0;
  if(difficulty == "Normal") {
    xSet = 30;
  }
  text(difficulty, 250-xSet, 100);
  textSize(80);
  text("Bugs Killed:", 100, 200);
  text(score, 575, 200);
  textSize(60);
  text("Acc:", 175, 300);
  text(acc + "%", 375, 300);
  if(countdown < -2) {
    rect(225, 350, 300, 100);
    text("Try Again", 245, 420);
    if(mouseIsPressed) {
      if((mouseX > 225) && (mouseX < 525) && (mouseY > 350) && (mouseY < 450)) {
        location.reload();
      }
    }
  }
}

function addBug() {
  let tempBug = new Bug(bugSprite, Math.floor(random(0, xMax)), Math.floor(random(60, yMax)));
  setRandomMovement(tempBug);
  bugArray.push(tempBug);
}

function setRandomMovement(bug) {
  let movement = Math.floor(random(1, 5));
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
  let onceClick = true;
  for(var i = 0; i < bugArray.length; i++) {
    let bugX = bugArray[i].getX();
    let bugY = bugArray[i].getY();
    if(!bugArray[i].isDead() &&(mouseX > (bugX-30)) && (mouseX < bugX+30) && (mouseY > (bugY-30)) && (mouseY < (bugY+30))) {
      bugArray[i].kill();
      addBug();
      score++;
      if(onceClick) {
        successClick++;
        onceClick = false;
      }
    }
  }
}

function mousePressed() {
  totalClick++;
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
    this.deadX;
    this.deadY;
    this.deadRotation;
    this.deadFacing;
    this.change = false;
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

      this.x += 2 * (this.horizontal * (base_speed + score * increase_speed));
      this.y += 2 * (this.vertical * (base_speed + score * increase_speed));
    }
    else {
      translate(this.deadX, this.deadY);
      rotate(this.deadRotation*PI/2);
      scale(1, this.deadFacing);
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

  hasChanged() {
    return this.change;
  }

  setChanage(newChange) {
    this.change = newChange;
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
    this.deadX = this.x;
    this.deadY = this.y;
    this.deadRotation = this.rotation;
    this.deadFacing = this.facing;
  }
}
