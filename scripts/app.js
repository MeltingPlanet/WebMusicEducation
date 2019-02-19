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

function onMIDIMessage(message) {
    data = message.data; // this gives us our [command/channel, note, velocity] data.
    if(message.data[0] != 254){
        //piano.toggleKey(midiNotes[currentNoteIndex], 0);
        //console.log('MIDI data', data); // MIDI data [144, 63, 73]
        if(message.data[0] === 144){
            TriggerMelody(midiNotes, noteNames, noteDurations);
        }
        if(data[0] == 128){
            //console.log("off");
            removeColor(midiNotes);
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

url = "sounds/AlleFugler.json";
var ourRequest = new XMLHttpRequest();
ourRequest.open('GET', url);
ourRequest.onload = function(){
    var songChoice = JSON.parse(ourRequest.responseText);               //We could have just sent this object to PlayMelody but                                           //and extracted it there using                                       //This method
    for(var i = 0; i < songChoice.tracks[0].notes.length; i++){         //But maybe it is easier/cleaner for us all to work with arrays in PlayMelody
        midiNotes[i] =  songChoice.tracks[0].notes[i].midi;             //Keeping it like this for now
        noteNames[i] =  songChoice.tracks[0].notes[i].name;
        noteDurations[i] =  songChoice.tracks[0].notes[i].duration;
        noteStart[i] =  songChoice.tracks[0].notes[i].time;
    }
};
ourRequest.send(); 

songSelect.on("change", function(i){
    currentNoteIndex = 0;
    noteNames.length = 0;
    midiNotes.length = 0;
    noteDurations.length = 0;
    noteStart.length = 0;

    url = "sounds/" + songSelect.value + ".json";
    //console.log(url);
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', url);
    ourRequest.onload = function(){
        songChoice = JSON.parse(ourRequest.responseText);              
                                                                
        for(i = 0; i < songChoice.tracks[0].notes.length; i++){         
            midiNotes[i] =  songChoice.tracks[0].notes[i].midi;             
            noteNames[i] =  songChoice.tracks[0].notes[i].name;
            noteDurations[i] =  songChoice.tracks[0].notes[i].duration;
            noteStart[i] =  songChoice.tracks[0].notes[i].time;
        }
    };
    ourRequest.send(); 

});


function PlayMelody(midiNotes, noteNames, noteDurations, noteStart){              //Now we just need some Tone.js magic where we can enter these values and let it play :)
    var currentNoteIndex2 = 0;
    console.log(noteNames.length);
    for(var i = 0; i < noteNames.length; i++){
        Tone.Transport.scheduleOnce(play, noteStart[i]);
    }
    Tone.Transport.start();
    Tone.Transport.bpm.value = 120;
    console.log(Tone.Transport);
    function play(time){
            synth.triggerAttackRelease(noteNames[currentNoteIndex2], noteDurations[currentNoteIndex2], time); //noteStart[i]
            currentNoteIndex2 = (currentNoteIndex2 + 1) % noteNames.length;
            if(currentNoteIndex2 == 0){
                //synth.disconnect();  
                Tone.Transport.stop();
                Tone.Transport.cancel();
                connect = false;
                playing = false;
            }
        }
}

function TriggerMelody(midiNotes, noteNames, noteDurations){
    note = noteNames[currentNoteIndex];
    synth2.triggerAttackRelease(noteNames[currentNoteIndex], noteDurations[currentNoteIndex]);
    piano.toggleKey(midiNotes[currentNoteIndex], 0);
    currentNoteIndex = (currentNoteIndex + 1) % noteNames.length;
}

function removeColor(midiNotes){
    piano.toggleKey(midiNotes[currentNoteIndex], 1);
}

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
var synth;
var context;
var connect = false;
var playing = false;

document.querySelector("#play").addEventListener('click', function() {
    if (connect == false){
        synth = new Tone.Synth({
            oscillator: {
              type: 'sine',
              /* modulationType: 'sawtooth',
              modulationIndex: 3,
              harmonicity: 3.4 */
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
    if (context === undefined) {
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
    Tone.Transport.stop();
    Tone.Transport.cancel();
    connect = false;
    playing = false;
});

};


