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
let musicButton;
let music = false;
let streak = 0;
let rampUp = false;

let comboNote = ["C5", "D5", "E5", "F5", "G5"];
let hitNoise = new Tone.Synth().toDestination();

let introNoise = new Tone.MonoSynth().toDestination({
  oscillator: {
    type: "sawtooth"
  },
  filter: {
    Q: 3,
    type: "highpass",
    rolloff: -12
  },
  envelope: {
    attack: 0.01,
    decay: 0.3,
    sustain: 0,
    release: 0.5
  },
  filterEnvelope: {
    attack: 0.01,
    decay: 0.1,
    sustain: 0,
    release: 0.1,
    baseFrequency: 800,
    octaves: -1.2
  }
});

let introBass = new Tone.DuoSynth().toDestination();

let introBassline = new Tone.Pattern((time, note) => {
  if(note != null) {
    introBass.triggerAttackRelease(note, "32n", time+.20);
    introBass.triggerAttackRelease(note, "32n", time+.45);
  }
}, [null, null, null, null, null, "C4"]);

let introMelody = new Tone.Sequence((time, note) => {
  if(note != null) {
    introNoise.triggerAttackRelease(note, "16n", time);
  }
}, ["C3", "C3", "D3", "C3", "E3", null, "F3", "F3", "E3", "D3", "C3", null,
  "C3", "C3", "D3", "C3", "E3", null, "F3", "F3", "E3", "D3", "C3", null,
  "C4", "C4", "D4", "C4", "E4", null, "F4", "F4", "E4", "D4", "C4", null,
  "C4", "C4", "D4", "C4", "E4", null, "F4", "F4", "E4", "D4", "C4", null]);

let gameNoise = new Tone.Synth().toDestination();

let melodyScore = [
  {time: "0:0", note: "F4", beat: "4n"},
  {time: "0:1", note: "F4", beat: "4t"},
  {time: "0:1.25", note: "G4", beat: "4t"},
  {time: "0:1.50", note: "A4", beat: "4t"},
  {time: "0:2", note: "F4", beat: "4n"},
  {time: "0:3", note: "D4", beat: "4n"},
  {time: "1:0", note: "F4", beat: "4n"},
  {time: "1:1", note: "C4", beat: "2n"},
  {time: "2:0", note: "A#3", beat: "4n"},
  {time: "2:1", note: "A#3", beat: "4t"},
  {time: "2:1.25", note: "C4", beat: "4t"},
  {time: "2:1.50", note: "D4", beat: "4t"},
  {time: "2:2", note: "A#3", beat: "4n"},
  {time: "2:3", note: "A3", beat: "4n"},
  {time: "3:0", note: "A#3", beat: "4n"},
  {time: "3:1", note: "C4", beat: "4n"},
]

let gameMelody = new Tone.Part((time, value) => {
  //const now = Tone.now();
  gameNoise.triggerAttackRelease(value.note, value.beat, time);
}, melodyScore);

let endNoise = new Tone.FMSynth({
  harmonicity: 8,
  modulationIndex: 2,
  oscillator: {
    type: "sine"
  },
  envelope: {
    attack: 0.001,
    decay: 2,
    sustain: 0.1,
    release: 2
  },
  modulation: {
    type: "square"
  },
  modulationEnvelope: {
    attack: 0.002,
    decay: 0.2,
    sustain: 0,
    release: 0.2
  }
}).toDestination();

let endScore = [
  {time: "0:0", note: "C5"},
  {time: "0:1", note: "E5"},
  {time: "0:2", note: "G5"},
  {time: "0:3", note: "C6"},
]

let endMelody = new Tone.Part((time, value) => {
  endNoise.triggerAttackRelease(value.note, "16n", time);
}, endScore);

function preload() {
  bugSprite = loadImage("BugSprite.png");
}

function setup() {
  createCanvas(xMax, yMax);
  imageMode(CENTER);

  musicButton = createButton("music");
  musicButton.size(100, 25);
  musicButton.position(675, 550);
  musicButton.mousePressed( () => startMusic());
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
      if(music) {
        stopAudio();
        startEndAudio();
      }
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
      startScreenSelection("Easy", .75, .015);
    }
    else if((mouseX > 150) && (mouseX < 550) && (mouseY > 300) && (mouseY < 400)) {
      startScreenSelection("Normal", 1, .03);
    }
    else if((mouseX > 150) && (mouseX < 550) && (mouseY > 450) && (mouseY < 550)) {
      startScreenSelection("hard", 1.15, 0.35);
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
  if(music) {
    if(!rampUp && (score > 20)) {
      Tone.Transport.bpm.rampTo(160, 5);
      rampUp = true;
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

function startScreenSelection(newDiff, newSpeed, inc_speed) {
  difficulty = newDiff;
  base_speed = newSpeed;
  increase_speed = inc_speed;
  state = "game";
  startingBugs();
  if(music) {
    stopAudio();
    startGameAudio();
  }
  musicButton.hide();
}

function startMusic() {
  Tone.start();
  if(!music) {
    startIntro();
    music = true;
  }
  else {
    Tone.Transport.pause();
    music = false;
  }
}

function startIntro() {
  Tone.Transport.bpm.value = 120;
  introMelody.start();
  introBassline.start();
  Tone.Transport.start();
}

function stopIntro() {
  introMelody.stop();
  introBassline.stop();
}

function startGameAudio() {
  Tone.Transport.bpm.rampTo(100, 0.1);
  gameMelody.loop = 100;
  gameMelody.loopEnd = "4m";
  gameMelody.start();
  Tone.Transport.start();
}

function stopGameAudio() {
  gameMelody.stop();
}

function startEndAudio() {
  Tone.Transport.bpm.value = 100;
  endMelody.loop = 2;
  endMelody.loopEnd = "1m";
  endMelody.start();
  Tone.Transport.start();
}

function stopAudio() {
  Tone.Transport.pause();
  stopIntro();
  stopGameAudio();
}

function startingBugs() {
  for(var i = 0; i < STARTING_BUG_COUNT; i++) {
    addBug();
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
  let soundPlayer = true;
  let hitBug = false;
  for(var i = 0; i < bugArray.length; i++) {
    let bugX = bugArray[i].getX();
    let bugY = bugArray[i].getY();
    if(!bugArray[i].isDead() &&(mouseX > (bugX-30)) && (mouseX < bugX+30) && (mouseY > (bugY-30)) && (mouseY < (bugY+30))) {
      bugArray[i].kill();
      hitBug = true;
      addBug();
      score++;
      if(soundPlayer) {
        hitNoise.triggerAttackRelease(comboNote[streak], "8n");
        soundPlayer = false;
        if(streak < comboNote.length-1) {
          streak++;
        }
      }
      if(onceClick) {
        successClick++;
        onceClick = false;
      }
    }
  }
  if(!hitBug) {
    streak = 0;
    hitNoise.triggerAttackRelease("C3", "8n");
  }
}

function mousePressed() {
  totalClick++;
  if(state == "game") {
    killDetection();
  }
}

//function keyPressed() {
//  if(keyCode == RIGHT_ARROW) {
//    addBug();
//  }
//}

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
