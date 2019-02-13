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
    }
}









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
    5, 69;
    6, 69;
    7, 67;
    8, 65;
    9, 65;
    10, 64;
    11, 64;
    12, 62;
    13, 62;
    14, 60;
    15, 67;
    16, 67;
    17, 65;
    18, 65;
    19, 64;
    20, 64;
    21, 62;
    22, 67;
    23, 67;
    24, 65;
    25, 65;
    26, 64;
    27, 64;
    28, 62;
    29, 60;
    30, 60;
    31, 67;
    32, 67;
    33, 69;
    34, 69;
    35, 67;
    36, 65;
    37, 65;
    38, 64;
    39, 64;
    40, 62;
    41, 62;
    42, 60;
*/