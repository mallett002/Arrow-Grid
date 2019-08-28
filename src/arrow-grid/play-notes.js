
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

export const musicalNotes = range(0, 8).reduce((accum, curr) => {
    return accum.concat('a a# b c c# d d# e f f# g g#'.split(" ").map(char => {
        return `${char}${'a# b'.includes(char) ? curr : curr + 1}`;
    }));
}, []);

function createNotesString(musicalKey, scale) {
    const offsetScale = scale.value.map(noteInt => {
        return noteInt + musicalKey;
    });

    return offsetScale.map(noteInt => {
        return musicalNotes[noteInt - 21];
    }).join(" ");
}

const lengthSounds = {};
const sounds = (length, musicalKey, scale) => {
    const createdNotesString = createNotesString(musicalKey, scale);
    const freqs = notesFrequencies(createdNotesString);

    return freqs.map((freq) => {
        
        const aSound = new Pizzicato.Sound({
            source: 'wave',
            options: {
                frequency: freq[0],
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
    })
};

function generateHash(length, musicalKey, scale) {
    return `l${length}m${musicalKey}s${scale.label}`;
}

export const makePizzaSound = (index, length, scale, musicalKey) => {
    const noteIndex = index % scale.value.length;
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
        const noteToPlay = getIndex(arrow.x, arrow.y, size, arrow.vector);

        if (!muted && !alreadyPlayedMap[noteToPlay]) {
            alreadyPlayedMap[noteToPlay] = [noteToPlay];
            const snd = makePizzaSound(noteToPlay, length, scale, musicalKey);
            sounds.push(snd);
        }
        makeMIDImessage(musicalKey+noteToPlay, length).play();
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
