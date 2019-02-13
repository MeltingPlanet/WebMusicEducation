document.body.style.backgroundColor = "#6666";

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
        piano.toggleKey( message.data[1], 0)
    }
}


//The melody can be played by sending a call to a function that receive (any)output from the piano keyboard
//to be played by index number with this - synth.triggerAttackRelease


/* Notation
    The parameters are:
    Index Number - is the number of the note in the
    Note number - in midi number
    Note Duration - duration code such 4n","16n","16nr+8nr","16n","16nr+8nr" */
/*
    1, 60, 4n;
    2, 60, 4n;
    3, 67, 4n;
    4, 67, 4n;
    5, 69, 4n;
    6, 69, 4n;
    7, 67, 2n;
    8, 65, 4n;
    9, 65, 4n;
    10, 64, 4n;
    11, 64, 4n;
    12, 62, 4n;
    13, 62, 4n;
    14, 60, 2n;
    15, 67, 4n;
    16, 67, 4n;
    17, 65, 4n;
    18, 65, 4n;
    19, 64, 4n;
    20, 64, 4n;
    21, 62, 2n;
    22, 67, 4n;
    23, 67, 4n;
    24, 65, 4n;
    25, 65, 4n;
    26, 64, 4n;
    27, 64, 4n;
    28, 62, 2n;
    29, 60, 4n;
    30, 60, 4n;
    31, 67, 4n;
    32, 67, 4n;
    33, 69, 4n;
    34, 69, 4n;
    35, 67, 2n;
    36, 65, 4n;
    37, 65, 4n;
    38, 64, 4n;
    39, 64, 4n;
    40, 62, 4n;
    41, 62, 4n;
    42, 60, 4n;
*/