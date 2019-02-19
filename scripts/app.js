//###################################                                   #########################################
//################################### Code snippet taken from Lecture   ########################################
//###################################  Source code adapted from: 
//########### https://www.keithmcmillen.com/blog/making-music-in-the-browser-web-midi-api/   ############################

window.onload = function(){

if (navigator.requestMIDIAccess) {
navigator.requestMIDIAccess({
    sysex: false // this defaults to 'false' and we won't be covering sysex in this article. 
}).then(onMIDISuccess, onMIDIFailure);
} else {
alert("No MIDI support in your browser.");
}

// midi functions
function onMIDISuccess(midiAccess) {
// when we get a succesful response, run this code
console.log('MIDI Access Object', midiAccess);
    // when we get a succesful response, run this code
    midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    var inputs = midi.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
    }
}

function onMIDIFailure(e) {
// when we get a failed response, run this code
console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}
//############################################################################################################################


var currentNoteIndex = 0;
var url;
var midiNotes = [];
var noteNames = [];
var noteDurations = [];
var noteStart = [];
var songChoice;


var piano = new Nexus.Piano('#piano',{
    'size': [900, 300],
    'mode': 'toggle',  // 'button', 'toggle', or 'impulse'
    'lowNote': 60,
    'highNote': 96
});
window.onresize = function(){
    //console.log(window.innerWidth);
    if(window.innerWidth > 1000){
        piano.resize(900, 300);
    }else if(window.innerWidth > 900 && window.innerWidth < 1000){
        piano.resize(800, 267);
    }else if(window.innerWidth > 800 && window.innerWidth < 900){
        piano.resize(700, 233);
    }else if(window.innerWidth > 700 && window.innerWidth < 800){
        piano.resize(600, 200);
    }else if(window.innerWidth > 600 && window.innerWidth < 700){
        piano.resize(500, 167);
    }else if(window.innerWidth > 500 && window.innerWidth < 600){
        piano.resize(400, 133);
    }else if(window.innerWidth > 400 && window.innerWidth < 500){
        piano.resize(300, 100);
    }else if(window.innerWidth > 300 && window.innerWidth < 400){
        piano.resize(200, 67);
    }else{
        piano.resize(100, 33);
    }
};
var weLikeItMono = true;

function onMIDIMessage(message) {
    data = message.data; // this gives us our [command/channel, note, velocity] data.
    if(data[0] != 254){
        //console.log('MIDI data', data); // MIDI data [144, 63, 73]
        if(data[0] === 144 && weLikeItMono == true){    //Preventing multiple key presses with weLikeItMono
            TriggerMelody(midiNotes, noteNames, noteDurations);
            weLikeItMono = false;
        }
        if(data[0] == 128){
            weLikeItMono = true;
            removeColor(midiNotes); //Remove color of keyboard when note off message comes
        }
    }
}

var songSelect = new Nexus.Select('song',{  
    'size': [200,30],
    'options': ['AlleFugler','ABCD'] //List of sounds to chose from
});

songSelect.size = [200,30];
songSelect.colorize("accent","#ffd106");
songSelect.colorize("fill","#ffd106");


//#################################### Loading AlleFugler ############################################
//####################################     as default     ############################################
//####################################                    ############################################

url = "sounds/AlleFugler.json";
var ourRequest = new XMLHttpRequest();
ourRequest.open('GET', url);
ourRequest.onload = function(){
    var songChoice = JSON.parse(ourRequest.responseText);          
    for(var i = 0; i < songChoice.tracks[0].notes.length; i++){         
        midiNotes[i] =  songChoice.tracks[0].notes[i].midi;             
        noteNames[i] =  songChoice.tracks[0].notes[i].name;
        noteDurations[i] =  songChoice.tracks[0].notes[i].duration;
        noteStart[i] =  songChoice.tracks[0].notes[i].time;
    }
    piano.toggleKey(midiNotes[currentNoteIndex], 0); //Toggling color of first key to be pressed, to show user where to begin
};
ourRequest.send(); 

//####################################    Changing song    ############################################
//####################################       to users      ############################################
//####################################        choice       ############################################

songSelect.on("change", function(i){
    piano.toggleKey(midiNotes[currentNoteIndex]);   //Toggling last note pressed, turning it off when switching song 
    currentNoteIndex = 0;
    piano.toggleKey(midiNotes[currentNoteIndex]);   //Toggling first note of song, to show user where to begin
    noteNames.length = 0;                           // Resetting each array
    midiNotes.length = 0;
    noteDurations.length = 0;
    noteStart.length = 0;

    url = "sounds/" + songSelect.value + ".json";   //Making link to file with user input from dropdown menu
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', url);
    ourRequest.onload = function(){
        songChoice = JSON.parse(ourRequest.responseText);         //Parsing json text into javascript object     
                                                                
        for(i = 0; i < songChoice.tracks[0].notes.length; i++){    //extracting all information needed into local arrays     
            midiNotes[i] =  songChoice.tracks[0].notes[i].midi;    //Could have just sent the entire songChoice object to the triggerMelody and PlayMelpody functions           
            noteNames[i] =  songChoice.tracks[0].notes[i].name;     //and used it there, but chose to do this for easier use for everybody
            noteDurations[i] =  songChoice.tracks[0].notes[i].duration;
            noteStart[i] =  songChoice.tracks[0].notes[i].time;
        }
    };
    ourRequest.send(); 

});

//####################################    The function that    ############################################
//####################################    plays through the    ############################################
//####################################      chosen Melody      ############################################

function PlayMelody(midiNotes, noteNames, noteDurations, noteStart){              
    var currentNoteIndex2 = 0;  // Start from 0 each time PlayMelody is called

    for(var i = 0; i < noteNames.length; i++){
        Tone.Transport.scheduleOnce(play, noteStart[i]);    //Using Tone scheduler to trigger the function "play" on the times from chosen song
    }
    Tone.Transport.start();                                 //Abstracting away audioContext time, and always playing from when Tone Transport is played
    Tone.Transport.bpm.value = 120;

    function play(time){
        synth.triggerAttackRelease(noteNames[currentNoteIndex2], noteDurations[currentNoteIndex2], time); 
        currentNoteIndex2 = (currentNoteIndex2 + 1) % noteNames.length;
        if(currentNoteIndex2 == 0){                                         //This is for making it possible to press play after song is finished, not having to press "stop" first
            Tone.Transport.stop();
            Tone.Transport.cancel();
            connect = false;
            playing = false;
        }
    }
}

//####################################    The function that is triggered   ############################################
//####################################    by MIDI and plays through  the   ############################################
//####################################    chosen song one note at a time   ############################################
//####################################      for each key press             ############################################

function TriggerMelody(midiNotes, noteNames, noteDurations){
    note = noteNames[currentNoteIndex];
    synth2.triggerAttackRelease(noteNames[currentNoteIndex], noteDurations[currentNoteIndex]);
    piano.toggleKey(midiNotes[currentNoteIndex]);
    currentNoteIndex = (currentNoteIndex + 1) % noteNames.length;   //Using modulo to make it start over when we have gone through the whole array (ex. 42%42 = 0)
}

//####################################    Function to remove   ############################################
//####################################       color on keys     ############################################

function removeColor(midiNotes){
    piano.toggleKey(midiNotes[currentNoteIndex], 1);
}

//####################################    Crating Tone synth   ############################################
//####################################      to be used for     ############################################
//####################################      the triggering     ############################################

var synth2 = new Tone.Synth({
    oscillator: {
      type: 'sine',
    },
    envelope: {
      attack: 0.001,
      decay: 0.8,
      sustain: 0.2,
      release: 0.1
    }
}).toMaster();
synth2.volume.value = -6;

//####################################    Play and stop   ############################################
//####################################    functionality    ############################################

var synth;
var context;
var connect = false;
var playing = false;

document.querySelector("#play").addEventListener('click', function() {
    if (connect == false){
        synth = new Tone.Synth({
            oscillator: {
              type: 'sine',
            },
            envelope: {
              attack: 0.001,
              decay: 0.8,
              sustain: 0.2,
              release: 0.1
            }
        }).toMaster();
        synth.volume.value = -6;
        connect = true;
    } 
    if (context === undefined) {    //Creating Audio context once on user interaction
       context = new AudioContext();
    }
    if(playing == false){
        PlayMelody(midiNotes, noteNames, noteDurations, noteStart);
        playing = true;
    }
});

document.querySelector("#stop").addEventListener('click', function() {
    if(connect == true){
        synth.disconnect();  
    }
    Tone.Transport.stop();  //Stopping the Transport scheduling
    Tone.Transport.cancel();    //Canceling it, to start over each time
    connect = false;
    playing = false;
});

};


