
// USER INPUTS
var songItems = ['GheNa', 'KaTa', 'KeNa', 'KaTa'];
var ifLoop = false;
var defBPM = 100;
var volume = 1;

// what can they do
// play: notes, patterns, songs
// change: parameters
// TODO: add changing of parameters | add custom songs | add generative songs

// initialize variables
var noteFiles, pad, compoundNotes, patterns, selOptions, jsonFile, myCanvas;
var notes = {};
var leftNote = null, rightNote = null;
var song = [];

var mySound, myPhrase, myPart;
var msg = 'click to play';

// http://p5js.org/reference/#/p5.Phrase
function preload() {
  // load JSON and get song
  jsonFile = loadJSON('/tablaPatterns.json', loadAndGetSong);
}

function setup() {  
  // myCanvas = createCanvas(window.innerWidth, window.innerHeight);
  // myCanvas.parent('main-pad');
  // background(51);
  // button = createButton('click me');
  // put button in same container as the canvas
  // button.parent('sketch01');
  // by default this sets position relative to window...
  // button.position(0, 0);
  // button.mousePressed(changeBG);  // setup button
  noStroke();
  fill(255);
  textAlign(CENTER);
  masterVolume(volume);
  
  // set BPM
  input = createInput(defBPM.toString());
  input.position(150, 170);
  input.size(40);

  button = createButton('Set BPM');
  button.position(input.x + input.width, 170);
  button.mousePressed(changeBPM);
  
  // if loop
  checkbox = createCheckbox('loop', false);
  checkbox.position(150, 200);
  checkbox.changed(toLoopOrNotToLoop);
  
  // create note dropdown
  sel = createSelect();
  sel.position(150, 150);
  for (s of selOptions) {
    sel.option(s);
  }
  
  var defSel = 'Song 0';
  createPart(defSel);
  sel.changed(changePart);
}

function draw() {
  background(0);
  text(msg, width/2, height/2);
}

function playNote(time, note){
  // logic to play compound notes
  if (typeof note == 'object') {
    stopNote([leftNote, rightNote]);
    rightNote = notes[note[1]];
    leftNote = notes[note[0]];
    rightNote.play(time);
    leftNote.play(time);
  }
  else {
    notes[note].play(time);
  }
  
  // logic to stop each pad from ringing an old sound
  if (leftNote & pad[note]=='left') {
    leftNote.stop();
    leftNote = notes[note];
  }
  if (rightNote & pad[note]=='right') {
    rightNote.stop();
    rightNote = notes[note];
  }
}

// worthless helpers
function stopNote(notes) {
  for (var note of notes) {
    if (note) {
      note.stop();
    }
  }
}
function dictGet(object, key) {
    var result = object[key];
    return (typeof result !== "undefined") ? result : 0;
}
function parseTabla (option) {
  var toPlay = []; // list of note values to return
  
  if (option[0] == 'N') {
    toPlay = [option.split(': ')[1]];
  }
  else if (option[0] == 'P') {
    var k = option.split(': ')[1];
    toPlay = patterns[k].notes;
    beatsModifier = parseInt(patterns[k].beats);
  }
  else if (option[0] == 'S') {
    var songItems = songs[parseInt(option[option.length-1])];
      for (s of songItems) {
        toPlay = toPlay.concat(patterns[s].notes);
      }          
  }
  else {  // custom song
    for (s of songItems) {
      song = song.concat(patterns[s].notes);
    }      
  }
  for (const [i, note] of toPlay.entries()) {
    if ( dictGet(compoundNotes, note) ) {
      toPlay[i] = [compoundNotes[note].left, compoundNotes[note].right];
    }
  }
  return toPlay
}
function loadAndGetSong (data) {
  noteFiles = data.noteFiles;
  pad = data.pad;
  compoundNotes = data.compoundNotes;
  patterns = data.patterns;
  songs = data.songs;
  
  // setup options
  var strNote = [], strPattern = [], strSong = []; 
  for (k of Object.keys(pad).entries()) {
    strNote = strNote.concat(['Note ' + String(k[0]) + ': ' + k[1]]);
  } 
  for (k of Object.keys(patterns).entries()) {
    strPattern = strPattern.concat('Pattern ' + String(k[0]) + ': ' + k[1]);
  } 
  for (k of songs.entries()) {
    strSong = strSong.concat('Song ' + String(k[0]));
  } 
  selOptions = strSong.concat(strPattern.concat(strNote));
  
  for (note in noteFiles) {
    notes[note] = loadSound(noteFiles[note]);
  }  
}
function createPart (defSel) {  
  myPhrase = new p5.Phrase('tabla', playNote, parseTabla(defSel));
  myPart = new p5.Part();
  myPart.addPhrase(myPhrase);
  myPart.setBPM(input.value());
}
function changePart() {
  myPart.stop();
  myPhrase = new p5.Phrase('tabla', playNote, parseTabla(sel.value()));
  myPart = new p5.Part();
  myPart.addPhrase(myPhrase);
  myPart.setBPM(input.value());
}
function changeBPM() {
  myPart.setBPM(input.value());
}
function toLoopOrNotToLoop() {
  if (this.checked()) {
    ifLoop = true;
  } else {
    ifLoop = false;
    myPart.noLoop(); 
  }  
}
window.onresize = function() {
  var w = window.innerWidth;
  var h = window.innerHeight;  
  myCanvas.size(w,h);
  width = w;
  height = h;
};

function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    // myPart.stop();
    myPart.start();
    if (ifLoop==true) { myPart.loop(); };
    msg = 'playing pattern';
  }
}
