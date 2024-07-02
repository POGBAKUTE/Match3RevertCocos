import { AudioClip, error, log, resources } from "cc";

declare global {
    var sounds: any;
    var musics: any;
}
window.sounds = {
    buttonSound: null,
    btnBackSound: null,
    btnSelectSound: null,
};

window.musics = {
    homeMusic: null,
    findMatchMusic: null,
    inGameMusic: null,
    resultMusic: null,
};
export namespace AudioUtils {
    export function playHomeMusic() {
        if (musics.homeMusic) {
            musics.homeMusic.stop();
            musics.homeMusic = null;
            return;
        }
        resources.load("Sound/music_lobby", AudioClip, (err, clip) => {
            if (err) {
                console.error("Failed to load sound:", err);
                return;
            }

            if (clip) {
                musics.homeMusic = clip;
                clip.setLoop(true);
                clip.play();
            }
        });
    }

    export function stopHomeMusic() {
        musics.homeMusic?.stop();
        musics.homeMusic = null;
    }

    export function playSoundInGame() {
        if (musics.inGameMusic) {
            musics.inGameMusic.stop();
            musics.inGameMusic = null;
            return;
        }
        resources.load("Sound/music_inmatch", AudioClip, (err, clip) => {
            if (err) {
                return;
            }

            if (clip) {
                musics.inGameMusic = clip;
                clip.setLoop(true);
                clip.play();
            }
        });
    }

    export function playSoundResult() {
        if (musics.resultMusic) {
            musics.resultMusic.stop();
            musics.resultMusic = null;
            return;
        }
        error("day vao load");
        resources.load("Sound/ui_rewards", AudioClip, (err, clip) => {
            if (err) {
                return;
            }

            if (clip) {
                musics.resultMusic = clip;
                clip.play();
                clip.setLoop(false);
            }
        });
    }

    export function SoundRewardsIncrease() {
        resources.load("Sound/ui_rewards_increase", AudioClip, (err, clip) => {
            if (err) {
                return;
            }

            if (clip) {
                musics.resultMusic = clip;
                clip.setLoop(false);
                clip.play();
            }
        });
    }

    export function stopSoundInGame() {
        musics.inGameMusic?.stop();
        musics.inGameMusic = null;
    }

    export function stopFindMatch() {
        musics.findMatchMusic?.stop();
        musics.findMatchMusic = null;
    }

    export function playButtonSound() {
        if (sounds.buttonSound) {
            sounds.buttonSound.play();
            return;
        }
        resources.load("Audio/buttonClick", AudioClip, (err, clip) => {
            if (err) {
                console.error("Failed to load sound:", err);
                return;
            }
            sounds.buttonSound = clip;
            if (clip) {
                clip.play();
            }
        });
    }

    export function playBtnBack() {
        if (sounds.btnBackSound) {
            sounds.btnBackSound.play();
            return;
        }
        resources.load("Sound/ui_exit", AudioClip, (err, clip) => {
            if (err) {
                console.error("Failed to load sound:", err);
                return;
            }
            sounds.btnBackSound = clip;
            if (clip) {
                clip.play();
            }
        });
    }

    export function soundSelect() {
        if (sounds.btnSelectSound) {
            sounds.btnSelectSound.play();
            return;
        }
        resources.load("Sound/ui_select", AudioClip, (err, clip) => {
            if (err) {
                console.error("Failed to load sound:", err);
                return;
            }
            sounds.btnSelectSound = clip;
            if (clip) {
                clip.play();
            }
        });
    }

    export function playSoundVoice(value: any) {
        resources.load("Sound/Voice/" + value, AudioClip, (err, clip) => {
            if (err) {
                console.error("Failed to load sound:", err);
                return;
            }
            if (clip) {
                clip.play();
            }
        });
    }

    export function playSound(value: any) {
        resources.load("Sound/" + value, AudioClip, (err, clip) => {
            if (err) {
                console.error("Failed to load sound:", err);
                return;
            }
            if (clip) {
                clip.play();
            }
        });
    }
}
