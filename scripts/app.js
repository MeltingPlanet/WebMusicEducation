window.onload = function(){

var currentNoteIndex = 0;
var note, noteString;
var url, songChoice, BPM;
var midiNotes = [];
var noteNames = [];
var noteDurations = [];
var noteStart = [];

var piano = new Nexus.Piano('#piano',{
    'size': [1000,300],
    'mode': 'button',  // 'button', 'toggle', or 'impulse'
    'lowNote': 24,
    'highNote': 60
});

function onMIDIMessage(message) {
    data = message.data; // this gives us our [command/channel, note, velocity] data.
    if(message.data[0] != 254){
        console.log('MIDI data', data); // MIDI data [144, 63, 73]
        console.log(data[0]);
        if(message.data[0] === 144){
            console.log("yees")
            TriggerMelody(midiNotes, noteNames, noteDurations);
        }
    }
}

var songSelect = new Nexus.Select('song',{
    'size': [100,30],
    'options': ['AlleFugler','ABCD'] //List of sounds to chose from
});
songSelect.size = [200,30];
songSelect.colorize("accent","#ffd106")
songSelect.colorize("fill","#ffd106")


songSelect.on("change", function(i){
    url = "sounds/" + songSelect.value + ".json";
    console.log(url);
    var ourRequest = new XMLHttpRequest();
    ourRequest.open('GET', url);
    ourRequest.onload = function(){
        var songChoice = JSON.parse(ourRequest.responseText);               //We could have just sent this object to PlayMelody but
        console.log(songChoice);                                            //and extracted it there using
        BPM = songChoice.header.bpm;                                        //This method
        for(var i = 0; i < songChoice.tracks[0].notes.length; i++){         //But maybe it is easier/cleaner for us all to work with arrays in PlayMelody
            midiNotes[i] =  songChoice.tracks[0].notes[i].midi;             //Keeping it like this for now
            noteNames[i] =  songChoice.tracks[0].notes[i].name;
            noteDurations[i] =  songChoice.tracks[0].notes[i].duration;
            noteStart[i] =  songChoice.tracks[0].notes[i].time;
        }

        //PlayMelody(midiNotes, noteNames, noteDurations, noteStart);
    };
    ourRequest.send(); 
});

function PlayMelody(midiNotes, noteNames, noteDurations, noteStart){              //Now we just need some Tone.js magic where we can enter these values and let it play :)
    
    console.log("midiNotes: " + midiNotes);
    console.log("noteNames: " + noteNames);
    console.log("noteDurations: " + noteDurations);
    console.log("noteStart: " + noteStart);

    
    for(var i = 0; i < noteNames.length; i++){
        synth.triggerAttackRelease(noteNames[i], noteDurations[i], noteStart[i]);
    }
}

function TriggerMelody(midiNotes, noteNames, noteDurations){
    note = noteNames[currentNoteIndex];
    //noteString = currentNoteIndex + " – Name: " + note.name + ", midi: " + note.midi + ", duration: " + note.duration;
    //console.log(noteString);
    currentNoteIndex = (currentNoteIndex + 1) % noteNames.length;
    piano.toggleKey(noteNames[currentNoteIndex], 0);
    synth.triggerAttackRelease(noteNames[currentNoteIndex], noteDurations[currentNoteIndex], 0);
}

var synth = new Tone.Synth({
    oscillator: {
      type: 'sine',
      modulationType: 'sawtooth',
      modulationIndex: 3,
      harmonicity: 3.4
    },
    envelope: {
      attack: 0.001,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1
    }
  }).toMaster();

var connect = true;

document.querySelector("#play").addEventListener('click', function() {
   if (connect){
    PlayMelody(midiNotes, noteNames, noteDurations, noteStart);
   }
   else{
       synth.connect();
       PlayMelody(midiNotes, noteNames, noteDurations, noteStart);
   }
});

document.querySelector("#stop").addEventListener('click', function() {
    synth.disconnect ();
    connect=false;
});

}