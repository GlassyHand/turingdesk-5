// 오디오 객체들
let buttonClickAudio = null;
let storyAudio = null;
let gameAudio = null;
let clearAudio = null;
let stageSelectAudio = null;
let clearGifAudio = null;
let failGifAudio = null;
let day5Story1Audio = null;
let day5Story2Audio = null;
let day5GameAudio = null;
let badEndAudio = null;
let trueEndAudio = null;

// 버튼 클릭 사운드 재생
function playButtonSound() {
    try {
        // 오디오 객체를 재사용하거나 새로 생성
        if (!buttonClickAudio) {
            buttonClickAudio = new Audio('sound/button_click.mp3');
            buttonClickAudio.volume = 1.0; // 볼륨 조절 (0.0 ~ 1.0)
        }
        
        // 현재 재생 중이면 처음부터 다시 재생
        buttonClickAudio.currentTime = 0;
        buttonClickAudio.play().catch(error => {
            // 오디오 재생 실패 시 무시 (사용자 상호작용 없이 재생 시도 등)
            console.log('Audio play failed:', error);
        });
    } catch (error) {
        console.log('Audio error:', error);
    }
}

// 스토리 배경음악 재생
function playStoryMusic() {
    try {
        // 다른 모든 음악 중지
        if (gameAudio && !gameAudio.paused) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
        }
        if (stageSelectAudio && !stageSelectAudio.paused) {
            stageSelectAudio.pause();
            stageSelectAudio.currentTime = 0;
        }
        
        // 스토리 음악 재생
        if (!storyAudio) {
            storyAudio = new Audio('sound/story.mp3');
            storyAudio.volume = 0.5;
            storyAudio.loop = true; // 반복 재생
        }
        
        storyAudio.currentTime = 0;
        storyAudio.play().catch(error => {
            console.log('Story audio play failed:', error);
        });
    } catch (error) {
        console.log('Story audio error:', error);
    }
}

// 게임 배경음악 재생
function playGameMusic() {
    try {
        // 다른 모든 음악 중지
        if (storyAudio && !storyAudio.paused) {
            storyAudio.pause();
            storyAudio.currentTime = 0;
        }
        if (stageSelectAudio && !stageSelectAudio.paused) {
            stageSelectAudio.pause();
            stageSelectAudio.currentTime = 0;
        }
        
        // 게임 음악 재생
        if (!gameAudio) {
            gameAudio = new Audio('sound/game.mp3');
            gameAudio.volume = 0.5;
            gameAudio.loop = true; // 반복 재생
        }
        
        gameAudio.currentTime = 0;
        gameAudio.play().catch(error => {
            console.log('Game audio play failed:', error);
        });
    } catch (error) {
        console.log('Game audio error:', error);
    }
}

// 클리어 사운드 재생
function playClearSound() {
    try {
        // 게임 음악이 재생 중이면 중지
        if (gameAudio && !gameAudio.paused) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
        }
        
        // 클리어 사운드 재생 (반복 없음)
        if (!clearAudio) {
            clearAudio = new Audio('sound/clear.mp3');
            clearAudio.volume = 0.5;
        }
        
        clearAudio.currentTime = 0;
        clearAudio.play().catch(error => {
            console.log('Clear audio play failed:', error);
        });
    } catch (error) {
        console.log('Clear audio error:', error);
    }
}

// 클리어 GIF 사운드 재생
function playClearGifSound() {
    try {
        if (!clearGifAudio) {
            clearGifAudio = new Audio('sound/cleargif.mp3');
            clearGifAudio.volume = 0.5;
        }
        clearGifAudio.currentTime = 0;
        clearGifAudio.play().catch(error => {
            console.log('Clear GIF audio play failed:', error);
        });
    } catch (error) {
        console.log('Clear GIF audio error:', error);
    }
}

// 실패 GIF 사운드 재생
function playFailGifSound() {
    try {
        if (!failGifAudio) {
            failGifAudio = new Audio('sound/failgif.mp3');
            failGifAudio.volume = 0.5;
        }
        failGifAudio.currentTime = 0;
        failGifAudio.play().catch(error => {
            console.log('Fail GIF audio play failed:', error);
        });
    } catch (error) {
        console.log('Fail GIF audio error:', error);
    }
}

// 스테이지 선택 화면 배경음악 재생
function playStageSelectMusic() {
    try {
        // 다른 모든 음악 중지
        if (storyAudio && !storyAudio.paused) {
            storyAudio.pause();
            storyAudio.currentTime = 0;
        }
        if (gameAudio && !gameAudio.paused) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
        }
        if (clearAudio && !clearAudio.paused) {
            clearAudio.pause();
            clearAudio.currentTime = 0;
        }
        // 5일차 음악들도 중지
        if (day5Story1Audio && !day5Story1Audio.paused) {
            day5Story1Audio.pause();
            day5Story1Audio.currentTime = 0;
        }
        if (day5Story2Audio && !day5Story2Audio.paused) {
            day5Story2Audio.pause();
            day5Story2Audio.currentTime = 0;
        }
        if (day5GameAudio && !day5GameAudio.paused) {
            day5GameAudio.pause();
            day5GameAudio.currentTime = 0;
        }
        
        // 스테이지 선택 음악 재생
        if (!stageSelectAudio) {
            stageSelectAudio = new Audio('sound/stage_select.mp3');
            stageSelectAudio.volume = 0.5;
            stageSelectAudio.loop = true; // 반복 재생
        }
        
        stageSelectAudio.currentTime = 0;
        stageSelectAudio.play().catch(error => {
            console.log('Stage select audio play failed:', error);
        });
    } catch (error) {
        console.log('Stage select audio error:', error);
    }
}

// 5일차 스토리 1 음악 재생
function playDay5Story1Music() {
    try {
        // 다른 모든 음악 중지
        if (storyAudio && !storyAudio.paused) {
            storyAudio.pause();
            storyAudio.currentTime = 0;
        }
        if (gameAudio && !gameAudio.paused) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
        }
        if (stageSelectAudio && !stageSelectAudio.paused) {
            stageSelectAudio.pause();
            stageSelectAudio.currentTime = 0;
        }
        if (day5Story2Audio && !day5Story2Audio.paused) {
            day5Story2Audio.pause();
            day5Story2Audio.currentTime = 0;
        }
        if (day5GameAudio && !day5GameAudio.paused) {
            day5GameAudio.pause();
            day5GameAudio.currentTime = 0;
        }
        
        // 5일차 스토리 1 음악 재생
        if (!day5Story1Audio) {
            day5Story1Audio = new Audio('sound/5days_1.mp3');
            day5Story1Audio.volume = 0.5;
            day5Story1Audio.loop = true;
        }
        
        day5Story1Audio.currentTime = 0;
        day5Story1Audio.play().catch(error => {
            console.log('Day 5 story 1 audio play failed:', error);
        });
    } catch (error) {
        console.log('Day 5 story 1 audio error:', error);
    }
}

// 5일차 스토리 2 음악 재생
function playDay5Story2Music() {
    try {
        // 5일차 스토리 1 음악 중지
        if (day5Story1Audio && !day5Story1Audio.paused) {
            day5Story1Audio.pause();
            day5Story1Audio.currentTime = 0;
        }
        
        // 5일차 스토리 2 음악 재생
        if (!day5Story2Audio) {
            day5Story2Audio = new Audio('sound/5days_2.mp3');
            day5Story2Audio.volume = 0.5;
            day5Story2Audio.loop = true;
        }
        
        day5Story2Audio.currentTime = 0;
        day5Story2Audio.play().catch(error => {
            console.log('Day 5 story 2 audio play failed:', error);
        });
    } catch (error) {
        console.log('Day 5 story 2 audio error:', error);
    }
}

// 5일차 게임 음악 재생
function playDay5GameMusic() {
    try {
        // 다른 모든 음악 중지
        if (storyAudio && !storyAudio.paused) {
            storyAudio.pause();
            storyAudio.currentTime = 0;
        }
        if (gameAudio && !gameAudio.paused) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
        }
        if (day5Story1Audio && !day5Story1Audio.paused) {
            day5Story1Audio.pause();
            day5Story1Audio.currentTime = 0;
        }
        if (day5Story2Audio && !day5Story2Audio.paused) {
            day5Story2Audio.pause();
            day5Story2Audio.currentTime = 0;
        }
        
        // 5일차 게임 음악 재생
        if (!day5GameAudio) {
            day5GameAudio = new Audio('sound/5days_3.mp3');
            day5GameAudio.volume = 0.5;
            day5GameAudio.loop = true;
        }
        
        day5GameAudio.currentTime = 0;
        day5GameAudio.play().catch(error => {
            console.log('Day 5 game audio play failed:', error);
        });
    } catch (error) {
        console.log('Day 5 game audio error:', error);
    }
}

// 노말 엔딩 배경음악 재생
function playBadEndMusic() {
    try {
        // 다른 모든 음악 중지
        if (storyAudio && !storyAudio.paused) {
            storyAudio.pause();
            storyAudio.currentTime = 0;
        }
        if (gameAudio && !gameAudio.paused) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
        }
        if (stageSelectAudio && !stageSelectAudio.paused) {
            stageSelectAudio.pause();
            stageSelectAudio.currentTime = 0;
        }
        if (day5Story1Audio && !day5Story1Audio.paused) {
            day5Story1Audio.pause();
            day5Story1Audio.currentTime = 0;
        }
        if (day5Story2Audio && !day5Story2Audio.paused) {
            day5Story2Audio.pause();
            day5Story2Audio.currentTime = 0;
        }
        if (day5GameAudio && !day5GameAudio.paused) {
            day5GameAudio.pause();
            day5GameAudio.currentTime = 0;
        }
        if (trueEndAudio && !trueEndAudio.paused) {
            trueEndAudio.pause();
            trueEndAudio.currentTime = 0;
        }
        
        // 노말 엔딩 음악 재생
        if (!badEndAudio) {
            badEndAudio = new Audio('sound/bad_end.mp3');
            badEndAudio.volume = 0.5;
            badEndAudio.loop = true; // 반복 재생
        }
        
        badEndAudio.currentTime = 0;
        badEndAudio.play().catch(error => {
            console.log('Bad end audio play failed:', error);
        });
    } catch (error) {
        console.log('Bad end audio error:', error);
    }
}

// 진엔딩 배경음악 재생
function playTrueEndMusic() {
    try {
        // 다른 모든 음악 중지
        if (storyAudio && !storyAudio.paused) {
            storyAudio.pause();
            storyAudio.currentTime = 0;
        }
        if (gameAudio && !gameAudio.paused) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
        }
        if (stageSelectAudio && !stageSelectAudio.paused) {
            stageSelectAudio.pause();
            stageSelectAudio.currentTime = 0;
        }
        if (day5Story1Audio && !day5Story1Audio.paused) {
            day5Story1Audio.pause();
            day5Story1Audio.currentTime = 0;
        }
        if (day5Story2Audio && !day5Story2Audio.paused) {
            day5Story2Audio.pause();
            day5Story2Audio.currentTime = 0;
        }
        if (day5GameAudio && !day5GameAudio.paused) {
            day5GameAudio.pause();
            day5GameAudio.currentTime = 0;
        }
        if (badEndAudio && !badEndAudio.paused) {
            badEndAudio.pause();
            badEndAudio.currentTime = 0;
        }
        
        // 진엔딩 음악 재생
        if (!trueEndAudio) {
            trueEndAudio = new Audio('sound/true_end.mp3');
            trueEndAudio.volume = 0.5;
            trueEndAudio.loop = true; // 반복 재생
        }
        
        trueEndAudio.currentTime = 0;
        trueEndAudio.play().catch(error => {
            console.log('True end audio play failed:', error);
        });
    } catch (error) {
        console.log('True end audio error:', error);
    }
}

// 모든 음악 중지 (메인 화면으로 돌아갈 때)
function stopAllMusic() {
    try {
        if (storyAudio && !storyAudio.paused) {
            storyAudio.pause();
            storyAudio.currentTime = 0;
        }
        if (gameAudio && !gameAudio.paused) {
            gameAudio.pause();
            gameAudio.currentTime = 0;
        }
        if (stageSelectAudio && !stageSelectAudio.paused) {
            stageSelectAudio.pause();
            stageSelectAudio.currentTime = 0;
        }
        if (day5Story1Audio && !day5Story1Audio.paused) {
            day5Story1Audio.pause();
            day5Story1Audio.currentTime = 0;
        }
        if (day5Story2Audio && !day5Story2Audio.paused) {
            day5Story2Audio.pause();
            day5Story2Audio.currentTime = 0;
        }
        if (day5GameAudio && !day5GameAudio.paused) {
            day5GameAudio.pause();
            day5GameAudio.currentTime = 0;
        }
        if (badEndAudio && !badEndAudio.paused) {
            badEndAudio.pause();
            badEndAudio.currentTime = 0;
        }
        if (trueEndAudio && !trueEndAudio.paused) {
            trueEndAudio.pause();
            trueEndAudio.currentTime = 0;
        }
        if (clearAudio && !clearAudio.paused) {
            clearAudio.pause();
            clearAudio.currentTime = 0;
        }
    } catch (error) {
        console.log('Stop all music error:', error);
    }
}