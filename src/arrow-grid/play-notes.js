
import Pizzicato from 'pizzicato';
import notesFrequencies from 'notes-frequencies';
import {makeMIDImessage} from './midi';
import {range} from 'ramda';

const getIndex = (x, y, size, vector) => {
    if (vector === 1 || vector === 3) {
        return y;
    } else if (vector === 0 || vector === 2) {
        return x;
    }
    return 0;
};

// flat ♭

const musicalNotes = range(0, 8).reduce((accum, curr) => {
    return accum.concat('a a# b c c# d d# e f f# g g#'.split(" ").map(char => {
        return `${char}${'a# b'.includes(char) ? curr : curr + 1}`;
    }));
}, []).join(" ");

function createNotesString(musicalKey, scale) {
    const offsetScale = scale.map(noteInt => {
        return noteInt + musicalKey;
    });

    return offsetScale.map(noteInt => {
        return musicalNotes[noteInt - 21];
    }).join(" ");
}

// const frequencies = notesFrequencies('C3 D3 E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5 F5 G5 A5');//c Scale
// const frequencies = notesFrequencies('e3 a3 b3 c4 e4 f4 a4 b4 e5 a5 b5 c6 e6 f6 a6 b6 e7');//ake bono scale
// const frequencies = notesFrequencies('e3 b3 d4 e4 g4 a4 d5 e5 b5 d6 e6 g6 a6 d7 e7');//Yue-Diao scale
// const frequencies = notesFrequencies('e3 a3 b3 C3 D3 E3 F3 G3 A3 E4 F4 G4 A4');//Bayati scale
const lengthSounds = {};
const sounds = (length, musicalKey, scale) => 
    notesFrequencies(createNotesString(musicalKey, scale)).map((freq, noteIndex) => {
    const aSound = new Pizzicato.Sound({
        source: 'wave',
        options: {
            frequency: frequencies[noteIndex][0],
            attack: 0,
            release: 0.1,
            type: 'sine',
            volume: .5
        },
    });
    var dubDelay = new Pizzicato.Effects.DubDelay({
        feedback: 0.1,
        time: length*2.5/1000,
        mix: 1,
        cutoff: 200
    });
    var dubDelay2 = new Pizzicato.Effects.DubDelay({
        feedback: 0.1,
        time: length*3.33/1000,
        mix: 1,
        cutoff: 700
    });
    var lowPassFilter = new Pizzicato.Effects.LowPassFilter({
        frequency: 1000,
        peak: 6
    });
    
    aSound.addEffect(dubDelay);
    aSound.addEffect(dubDelay2);
    aSound.addEffect(lowPassFilter);
    return aSound;
});

function generateHash(length, musicalKey, scale) {
    return length;
}

export const makePizzaSound = (index, length, scale, musicalKey) => {
    //cacheSounds!
    // const frequencies = notesFrequencies('D3 F3 G#3 C4 D#4 G4 A#5');
    const noteIndex = index % scale.value.length;
    const noteToPlay = musicalKey + scale[noteIndex];
    const hash = generateHash(length, musicalKey, scale);
    
    if (!lengthSounds[hash]){
        lengthSounds[hash] = sounds(length, musicalKey, scale);
    }
    return lengthSounds[hash][noteIndex]
};

export const playSounds = (boundaryArrows, size, length, muted, scale, musicalKey) => {
    const alreadyPlayedMap = {};
    var sounds = [];
    
    boundaryArrows.map((arrow) => {
        const speed = getIndex(arrow.x, arrow.y, size, arrow.vector);

        if (!muted && !alreadyPlayedMap[speed]) {
            alreadyPlayedMap[speed] = [speed];
            const snd = makePizzaSound(speed, length, scale, musicalKey);
            sounds.push(snd);
        }
        makeMIDImessage(speed, length, scale, musicalKey).play();
        return undefined;
    });
    if (!muted){
        sounds.map((thisSound) => {
            thisSound.play();
            setTimeout(
                () => {
                    thisSound.stop();
                },
                length - 1
            );
            return undefined;
        });
    }
    return undefined;
};
