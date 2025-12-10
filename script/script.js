// 게임 상태 관리
const gameState = {
    currentStage: 1,
    correctCount: 0,
    wrongCount: 0,
    unlockedStages: [1], // 기본적으로 1days만 열림
    minCorrectToUnlock: 15, // 다음 스테이지 해제를 위한 최소 정답 수
    usedImages: [], // 현재 스테이지에서 사용된 이미지 목록
    admittedCharacters: [] // admit한 캐릭터 목록 (5일차 엔딩 판단용)
};

// 타임어택 관련 변수
let gameTimer = null;
let timeRemaining = 0;
const stageTimeLimits = {
    1: 40,  // 30초
    2: 80,  // 00초
    3: 140,  // 100초
    4: 200, // 100초
    5: 250  // 130초
};




// localStorage에서 진행도 로드
function loadProgress() {
const saved = localStorage.getItem('turingDeskProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        gameState.unlockedStages = progress.unlockedStages || [1];
        // 스테이지 버튼 업데이트
        updateStageButtons();}
    
    // 진엔딩을 본 경우 메인 화면 배경 및 색상 변경
    const trueEndingViewed = localStorage.getItem('trueEndingViewed');
    if (trueEndingViewed === 'true') {
        const mainScreen = document.getElementById('main-screen');
        const title = document.querySelector('.title');
        const startBtn = document.getElementById('start-btn');
        
        if (mainScreen) {
            mainScreen.style.backgroundImage = 'url(img/story/21.png)';
            mainScreen.style.backgroundSize = 'cover';
            mainScreen.style.backgroundPosition = 'center';
            mainScreen.style.backgroundRepeat = 'no-repeat';
        }
        
        // 글자색 흰색으로 변경
        if (title) {
            title.style.color = '#ffffff';
            title.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)';
        }
        
        // 버튼 색상 흰색으로 변경
        if (startBtn) {
            startBtn.style.borderColor = '#ffffff';
            startBtn.style.color = '#ffffff';
            startBtn.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
        }
    }
}

// 진행도 저장
function saveProgress() {
    localStorage.setItem('turingDeskProgress', JSON.stringify({
        unlockedStages: gameState.unlockedStages
    }));}

// 화면 전환
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // 메인 화면으로 돌아갈 때 모든 음악 중지 및 배경 변경
    if (screenId === 'main-screen') {
        stopAllMusic();
        
        // 진엔딩을 본 경우 배경 이미지 및 색상 변경
        const trueEndingViewed = localStorage.getItem('trueEndingViewed');
        if (trueEndingViewed === 'true') {
            const mainScreen = document.getElementById('main-screen');
            const title = document.querySelector('.title');
            const startBtn = document.getElementById('start-btn');
            
            if (mainScreen) {
                mainScreen.style.backgroundImage = 'url(img/story/21.png)';
                mainScreen.style.backgroundSize = 'cover';
                mainScreen.style.backgroundPosition = 'center';
                mainScreen.style.backgroundRepeat = 'no-repeat';
            }
            
            // 글자색 흰색으로 변경
            if (title) {
                title.style.color = '#ffffff';
                title.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)';
            }
            
            // 버튼 색상 흰색으로 변경
            if (startBtn) {
                startBtn.style.borderColor = '#ffffff';
                startBtn.style.color = '#ffffff';
                startBtn.style.boxShadow = '0 0 10px rgba(255, 255, 255, 0.3)';
            }
        }
    }
}

// 스테이지 버튼 업데이트
function updateStageButtons() {
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById(`stage-${i}`);
        if (gameState.unlockedStages.includes(i)) {
            btn.classList.remove('locked');
            btn.textContent = `${i} DAYS`;
        } else {
            btn.classList.add('locked');
            btn.textContent = '???';
        }
    }
}

// 스테이지 스토리 표시
let currentStoryIndex = 0;
let currentStory = [];

function showStory(stage) {
    // 스토리 배경음악 재생 (5일차는 특별 처리)
    if (stage === 5) {
        playDay5Story1Music();
    } else {
        playStoryMusic();
    }
    
    const storyText = document.getElementById('story-text');
    const characterPortrait = document.getElementById('character-portrait');
    const characterName = document.getElementById('character-name');
    const story = stories[stage] || [];
    currentStory = story;
    currentStoryIndex = 0;

    function displayNextLine() {
        if (currentStoryIndex < currentStory.length) {
            const dialogue = currentStory[currentStoryIndex];
            
            // 5일차 특정 대사에서 음악 전환
            if (stage === 5 && typeof dialogue === 'object' && dialogue.text === "밖에 남은 인간, 로봇... 연구소 밖의 인원들을 전부 몰살하기 위해서 만들어진거지.") {
                playDay5Story2Music();
            }
            
            // 대사 표시
            let dialogueText = '';
            if (typeof dialogue === 'string') {
                // 기존 형식 (문자열만 있는 경우)
                dialogueText = dialogue;
                storyText.textContent = dialogue;
                characterName.textContent = '';
                characterPortrait.classList.remove('senior', 'player');
            } else {
                // 새로운 형식 (화자 정보 포함)
                dialogueText = dialogue.text;
                storyText.textContent = dialogue.text;
                const character = characters[dialogue.speaker];
                if (character) {
                    characterName.textContent = character.name;
                    // 기본 클래스 설정
                    let portraitClasses = 'character-portrait ' + dialogue.speaker;
                    
                    // 표정 클래스 추가 (senior 또는 player)
                    if (dialogue.expression) {
                        portraitClasses += ' ' + dialogue.expression;
                    }
                    
                    characterPortrait.className = portraitClasses;
                }
            }
            
            // 일러스트 표시 처리
            const illustrationOverlay = document.getElementById('story-illustration-overlay');
            const illustrationImg = document.getElementById('story-illustration-img');
            if (illustrationOverlay && illustrationImg && typeof dialogue === 'object' && dialogue.illustration) {
                if (dialogue.illustration.show) {
                    // 일러스트 표시
                    illustrationImg.src = dialogue.illustration.show;
                    illustrationOverlay.style.display = 'block';
                } else if (dialogue.illustration.hide) {
                    // 일러스트 숨김
                    illustrationOverlay.style.display = 'none';
                }
                // illustration 속성이 없으면 현재 상태 유지 (표시 중이면 계속 표시)
            }
            
            currentStoryIndex++;
        } else {
            // 스토리 종료, 일러스트 숨김
            const illustrationOverlay = document.getElementById('story-illustration-overlay');
            if (illustrationOverlay) {
                illustrationOverlay.style.display = 'none';
            }
            
            // 스토리 종료, 게임 시작
            // 스토리 음악 중지 후 게임 음악 재생
            if (stage === 5) {
                if (day5Story1Audio && !day5Story1Audio.paused) {
                    day5Story1Audio.pause();
                    day5Story1Audio.currentTime = 0;
                }
                if (day5Story2Audio && !day5Story2Audio.paused) {
                    day5Story2Audio.pause();
                    day5Story2Audio.currentTime = 0;
                }
            } else {
                if (storyAudio && !storyAudio.paused) {
                    storyAudio.pause();
                    storyAudio.currentTime = 0;
                }
            }
            startGame(stage);
        }
    }

    // 초기 표시
    displayNextLine();

    // Next 버튼 이벤트 재설정
    const nextBtn = document.getElementById('story-next-btn');
    nextBtn.onclick = displayNextLine;
    
    // Skip 버튼 이벤트
    const skipBtn = document.getElementById('story-skip-btn');
    skipBtn.onclick = () => {
        if (storyAudio && !storyAudio.paused) {
            storyAudio.pause();
            storyAudio.currentTime = 0;
        }
        startGame(stage);
    };
}

// 랜덤 이름 생성
const firstNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권', '황', '안', '송', '전', '홍'];
const lastNames = ['민준', '서준', '도윤', '예준', '시우', '주원', '하준', '지호', '건우', '준서', '현우', '지훈', '우진', '선우', '연우', '서연', '서윤', '지우', '서현', '민서', '하은', '윤서', '지유', '채원', '지원'];

function generateRandomName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName}${lastName}`;}

// 출신지 데이터 (광역자치단체별로 분류)
const locations = {
    '강원특별자치도': ['강릉시', '고성군', '동해시', '삼척시', '속초시', '양구군', '양양군', '영월군', '원주시', '인제군', '정선군', '철원군', '춘천시', '태백시', '평창군', '홍천군', '화천군', '횡성군'],
    '경기도': ['가평군', '고양시', '과천시', '광명시', '광주시', '구리시', '군포시', '김포시', '남양주시', '동두천시', '부천시', '성남시', '수원시', '시흥시', '안산시', '안성시', '안양시', '양주시', '양평군', '여주시', '연천군', '오산시', '용인시', '의왕시', '의정부시', '이천시', '파주시', '평택시', '포천시', '하남시', '화성시'],
    '경상남도': ['거제시', '거창군', '김해시', '남해군', '밀양시', '사천시', '산청군', '양산시', '의령군', '진주시', '창녕군', '창원시', '통영시', '하동군', '함안군', '함양군', '합천군'],
    '경상북도': ['경산시', '경주시', '고령군', '구미시', '김천시', '문경시', '봉화군', '상주시', '성주군', '안동시', '영덕군', '영양군', '영주시', '영천시', '예천군', '울릉군', '울진군', '의성군', '청도군', '청송군', '칠곡군', '포항시'],
    '광주광역시': ['광산구', '광주광역시 남구', '광주광역시 동구', '광주광역시 북구', '광주광역시 서구'],
    '대구광역시': ['군위군', '대구광역시 남구', '달서구', '달성군', '대구광역시 동구', '대구광역시 북구', '대구광역시 서구', '수성구', '대구광역시 중구'],
    '대전광역시': ['대덕구', '대전광역시 동구', '대전광역시 서구', '대전광역시 유성구', '대전광역시 중구'],
    '부산광역시': ['강서구', '금정구', '기장군', '부산광역시 남구', '부산광역시 동구', '동래구', '부산진구', '부산광역시 북구', '사상구', '사하구', '부산광역시 서구', '수영구', '연제구', '영도구', '부산광역시 중구', '해운대구'],
    '서울특별시': ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '서울특별시 중구', '중랑구'],
    '세종특별자치시': ['세종시'],
    '울산광역시': ['울산광역시 남구', '울산광역시 동구', '울산광역시 북구', '울주군', '울산광역시 중구'],
    '인천광역시': ['강화군', '계양구', '인천광역시 동구', '미추홀구', '남동구', '부평구', '인천광역시 서구', '연수구', '옹진군', '인천광역시 중구'],
    '전라남도': ['강진군', '고흥군', '곡성군', '광양시', '구례군', '나주시', '담양군', '목포시', '무안군', '보성군', '순천시', '신안군', '여수시', '영광군', '영암군', '완도군', '장성군', '장흥군', '진도군', '함평군', '해남군', '화순군'],
    '전북특별자치도': ['고창군', '군산시', '김제시', '남원시', '무주군', '부안군', '순창군', '완주군', '익산시', '임실군', '장수군', '전주시', '정읍시', '진안군'],
    '충청남도': ['계룡시', '공주시', '금산군', '논산시', '당진시', '보령시', '부여군', '서산시', '서천군', '아산시', '예산군', '천안시', '청양군', '태안군', '홍성군'],
    '충청북도': ['괴산군', '단양군', '보은군', '영동군', '옥천군', '음성군', '제천시', '증평군', '진천군', '청주시', '충주시']
};

// 랜덤 출신지 생성
function generateRandomLocation(stage) {
    const rule = getStageRule(stage);
    
    // 5일차 특수 처리: 인천 30% 확률 (다른 확률과 독립적으로)
    if (stage === 5 && Math.random() < 0.3) {
        const province = '인천광역시';
        const city = locations[province][Math.floor(Math.random() * locations[province].length)];
        return {
            city: city,
            province: province,
            isIncheonSpecial: true // 인천 특수 예외 플래그
        };
    }
    
    // 거부할 출신지가 설정되어 있고, 확률에 맞으면 거부할 출신지 선택
    let isBlockedProvince = false;
    if (rule.blockedProvinces.length > 0 && rule.blockedProvinceProbability > 0) {
        isBlockedProvince = Math.random() < rule.blockedProvinceProbability;
    }
    
    let province, city;
    if (isBlockedProvince) {
        // 거부할 출신지 중 랜덤 선택
        const blockedProvince = rule.blockedProvinces[Math.floor(Math.random() * rule.blockedProvinces.length)];
        province = blockedProvince;
        city = locations[province][Math.floor(Math.random() * locations[province].length)];
    } else {
        // 허용된 지역 출신
        const provinces = Object.keys(locations);
        // 거부할 출신지 제외한 지역 중 선택
        const allowedProvinces = provinces.filter(p => !rule.blockedProvinces.includes(p));
        province = allowedProvinces[Math.floor(Math.random() * allowedProvinces.length)];
        city = locations[province][Math.floor(Math.random() * locations[province].length)];
    }
    
    return {
        city: city,
        province: province
    };
}

// 랜덤 만료기한 생성
function generateRandomExpiry(stage) {
    // 기본값: 항상 2100~2200 범위
    let startYear = 2100;
    let endYear = 2200;
    
    const rule = getStageRule(stage);
    
    // 3일차 이상에서 blockedExpiryYear가 설정된 경우 특별 처리
    if (stage >= 3 && rule.blockedExpiryYear) {
        // 15% 확률로 금지 만료기한 생성 (2100~2126)
        if (Math.random() < 15/100) {
            startYear = 2100;
            endYear = rule.blockedExpiryYear; // 2126
        } else {
            // 나머지는 정상 만료기한 (2127~2200)
            startYear = 2127;
            endYear = 2200;
        }
    }
    // 1일차, 2일차는 2100~2200 전체 범위
    
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    
    return `${year}.${monthStr}.${dayStr}`;
}

// 현재 캐릭터 데이터
let currentCharacter = null;

// 캐릭터 이미지 목록 (normal과 robot으로 분류)
const characterImages = {
    normal: [
        'cha/characters/1-normal.png',
        'cha/characters/2-normal.png',
        'cha/characters/3-normal.png',
        'cha/characters/4-normal.png',
        'cha/characters/5-normal.png',
        'cha/characters/6-normal.png',
        'cha/characters/7-normal.png',
        'cha/characters/8-normal.png',
        'cha/characters/9-normal.png',
        'cha/characters/10-normal.png',
        'cha/characters/11-normal.png',
        'cha/characters/12-normal.png',
        'cha/characters/13-normal.png',
        'cha/characters/14-normal.png',
        'cha/characters/15-normal.png',
        'cha/characters/16-normal.png'
    ],
    robot: [
        'cha/characters/1-robot1.png',
        'cha/characters/1-robot2-arm.png',
        'cha/characters/2-robot1.png',
        'cha/characters/3-robot1-arm.png',
        'cha/characters/3-robot2.png',
        'cha/characters/4-robot1.png',
        'cha/characters/4-robot2.png',
        'cha/characters/5-robot1-arm.png',
        'cha/characters/5-robot2.png',
        'cha/characters/6-robot1.png',
        'cha/characters/6-robot2.png',
        'cha/characters/7-robot1-arm.png',
        'cha/characters/7-robot2.png',
        'cha/characters/8-robot1.png',
        'cha/characters/9-robot1.png',
        'cha/characters/10-robot1.png',
        'cha/characters/10-robot2.png',
        'cha/characters/11-robot1.png',
        'cha/characters/11-robot2-arm.png',
        'cha/characters/12-robot1.png',
        'cha/characters/12-robot2-arm.png',
        'cha/characters/13-robot1.png',
        'cha/characters/14-robot1.png',
        'cha/characters/14-robot2.png',
        'cha/characters/15-robot1.png',
        'cha/characters/15-robot2-arm.png',
        'cha/characters/16-robot1.png',
        'cha/characters/16-robot2-arm.png'
    ]
};

// 랜덤 캐릭터 이미지 선택 (중복 방지)
function getRandomCharacterImage(stage) {
    const rule = getStageRule(stage);
    const robotProbability = rule.robotProbability;
    
    let category;
    let selectedImage;
    
    // 4일차 이상에서 -arm 이미지 20% 확률 (기존 robotProbability와 독립적으로 계산)
    if (stage >= 4 && Math.random() < 0.2) {
        // -arm 이미지만 필터링 (robot 카테고리에서)
        const armImages = characterImages.robot.filter(img => img.endsWith('-arm.png'));
        const availableArmImages = armImages.filter(img => !gameState.usedImages.includes(img));
        const images = availableArmImages.length > 0 ? availableArmImages : armImages;
        
        if (images.length > 0) {
            const randomIndex = Math.floor(Math.random() * images.length);
            selectedImage = images[randomIndex];
            category = 'robot'; // -arm 이미지는 robot 카테고리에서 나옴
        } else {
            // -arm 이미지가 없으면 기존 로직으로 (robotProbability 적용, -arm 제외)
            const nonArmRobotImages = characterImages.robot.filter(img => !img.endsWith('-arm.png'));
            const allNonArmImages = [...characterImages.normal, ...nonArmRobotImages];
            const availableImages = allNonArmImages.filter(img => !gameState.usedImages.includes(img));
            const fallbackImages = availableImages.length > 0 ? availableImages : allNonArmImages;
            
            // robotProbability에 따라 선택 (normal + non-arm robot 중에서)
            const robotCount = Math.floor(nonArmRobotImages.length * robotProbability);
            const totalCount = characterImages.normal.length + robotCount;
            const randomValue = Math.random() * totalCount;
            
            if (randomValue < characterImages.normal.length) {
                // normal 선택
                const normalAvailable = availableImages.filter(img => characterImages.normal.includes(img));
                const normalImages = normalAvailable.length > 0 ? normalAvailable : characterImages.normal;
                const randomIndex = Math.floor(Math.random() * normalImages.length);
                selectedImage = normalImages[randomIndex];
                category = 'normal';
            } else {
                // robot 선택 (non-arm)
                const robotAvailable = availableImages.filter(img => nonArmRobotImages.includes(img));
                const robotImages = robotAvailable.length > 0 ? robotAvailable : nonArmRobotImages;
                const randomIndex = Math.floor(Math.random() * robotImages.length);
                selectedImage = robotImages[randomIndex];
                category = 'robot';
            }
        }
    } else {
        // 기존 로직: robotProbability에 따라 선택 (4일차 미만이거나 -arm이 아닌 경우)
        // 4일차 이상에서는 -arm 이미지를 제외하고 선택
        if (stage >= 4) {
            const nonArmRobotImages = characterImages.robot.filter(img => !img.endsWith('-arm.png'));
            const allNonArmImages = [...characterImages.normal, ...nonArmRobotImages];
            const availableImages = allNonArmImages.filter(img => !gameState.usedImages.includes(img));
            const fallbackImages = availableImages.length > 0 ? availableImages : allNonArmImages;
            
            // robotProbability에 따라 선택
            const robotCount = Math.floor(nonArmRobotImages.length * robotProbability);
            const totalCount = characterImages.normal.length + robotCount;
            const randomValue = Math.random() * totalCount;
            
            if (randomValue < characterImages.normal.length) {
                // normal 선택
                const normalAvailable = availableImages.filter(img => characterImages.normal.includes(img));
                const normalImages = normalAvailable.length > 0 ? normalAvailable : characterImages.normal;
                const randomIndex = Math.floor(Math.random() * normalImages.length);
                selectedImage = normalImages[randomIndex];
                category = 'normal';
            } else {
                // robot 선택 (non-arm)
                const robotAvailable = availableImages.filter(img => nonArmRobotImages.includes(img));
                const robotImages = robotAvailable.length > 0 ? robotAvailable : nonArmRobotImages;
                const randomIndex = Math.floor(Math.random() * robotImages.length);
                selectedImage = robotImages[randomIndex];
                category = 'robot';
            }
        } else {
            // 4일차 미만: 기존 로직
            category = Math.random() < robotProbability ? 'robot' : 'normal';
            const allImages = characterImages[category];
            
            // 사용되지 않은 이미지만 필터링
            const availableImages = allImages.filter(img => !gameState.usedImages.includes(img));
            
            // 사용 가능한 이미지가 없으면 리셋 (모든 이미지를 사용한 경우)
            const images = availableImages.length > 0 ? availableImages : allImages;
            
            const randomIndex = Math.floor(Math.random() * images.length);
            selectedImage = images[randomIndex];
        }
    }
    
    // 사용된 이미지 목록에 추가
    if (!gameState.usedImages.includes(selectedImage)) {
        gameState.usedImages.push(selectedImage);
    }
    
    return {
        image: selectedImage,
        isRobot: category === 'robot'
    };
}

// 새 캐릭터 생성
function generateNewCharacter() {
    const currentStage = gameState.currentStage;
    
    // 랜덤 캐릭터 이미지 선택
    const characterData = getRandomCharacterImage(currentStage);
    
    // 출신지 생성
    const locationData = generateRandomLocation(currentStage);
    
    // 만료기한 생성
    const expiry = generateRandomExpiry(currentStage);
    
    // isHuman 판단: robot이거나 거부할 출신지면 reject해야 함 (isHuman = false)
    const rule = getStageRule(currentStage);
    
// 만료기한 체크 (3일차 이상에서 2100~2126 범위면 출입금지)
let isBlockedExpiry = false;
if (currentStage >= 3) {
    const expiryYear = parseInt(expiry.split('.')[0]);
    // 2100 이상 2126 이하이면 출입금지
    isBlockedExpiry = expiryYear >= 2100 && expiryYear <= 2126;
}

// 대화 이상 확률 체크 (isDialogueBlocked 결정)
let isDialogueBlocked = false;
if (rule.blockedTalkProbability && rule.blockedTalkProbability > 0) {
    isDialogueBlocked = Math.random() < rule.blockedTalkProbability;
}

// 5일차 인천 특수 예외 처리
let isIncheonSpecial = (currentStage === 5 && (locationData.isIncheonSpecial || locationData.province === '인천광역시'));
let isIncheonHuman = false;
if (isIncheonSpecial) {
    // 물자를 가져올 확률: 로봇 외형이 아니고, ID카드 만료가 아니고, 로봇 목소리가 아닌 경우에만 적용
    // 먼저 다른 조건들을 체크
    const isRobotImage = characterData.isRobot;
    const hasBlockedExpiry = isBlockedExpiry;
    const hasBlockedDialogue = isDialogueBlocked;
    
    // 다른 조건들과 겹치지 않는 경우에만 물자 확률 적용
    if (!isRobotImage && !hasBlockedExpiry && !hasBlockedDialogue) {
        // 인천 출신자 중 50%는 인간(물자 지원군), 50%는 로봇
        isIncheonHuman = Math.random() < 0.5;
    } else {
        // 다른 조건에 해당하면 물자 지원군이 될 수 없음
        isIncheonHuman = false;
    }
}

// isBlockedProvince 계산 (인천 특수 예외는 출신지 제한에서 제외)
const isBlockedProvince = isIncheonSpecial ? false : rule.blockedProvinces.includes(locationData.province);

// 4일차 이상에서 -arm 이미지 처리
let isArmImage = false;
let isArmHuman = false;
if (currentStage >= 4 && characterData.image.endsWith('-arm.png')) {
    isArmImage = true;
    // 50% 확률로 인간 (의수/의족) - 출신지 제한과 관계없이 먼저 적용
    isArmHuman = Math.random() < 0.5;
}

// ✅ 최종 isHuman 판단
let isHuman;
// -arm 이미지 체크를 먼저 (characterData.isRobot보다 우선)
if (isArmImage && isArmHuman) {
    // -arm 이미지이고 50% 확률로 인간인 경우 (의수/의족)
    // 출신지 제한이 있으면 로봇 판정 (둘 중 하나라도 안 맞으면 로봇)
    // 로봇 목소리(isDialogueBlocked)나 ID카드 만료(isBlockedExpiry)인 경우도 무조건 로봇
    isHuman = !isBlockedProvince && !isBlockedExpiry && !isDialogueBlocked;
} else if (isArmImage && !isArmHuman) {
    // -arm 이미지이지만 로봇인 경우 (일반적인 답장을 함)
    // 로봇 외형은 표시하지 않지만, 로봇 판정
    isHuman = false;
} else if (isIncheonSpecial && isIncheonHuman) {
    // 5일차 인천 특수 예외: 물자를 가져온 사람은 무조건 인간 (다른 조건 체크 안 함)
    isHuman = true;
} else if (isIncheonSpecial && !isIncheonHuman) {
    // 5일차 인천 특수 예외: 물자를 가져오지 않은 로봇
    isHuman = false;
} else if (characterData.isRobot) {
    // 로봇 외형인 경우 무조건 로봇 (-arm 이미지가 아닌 경우만)
    isHuman = false;
} else {
    // 기존 로직: 네 가지 조건 모두 '통과'해야 isHuman = true
    isHuman = !isBlockedProvince   // 1. 금지된 출신지가 아니고
              && !isBlockedExpiry     // 2. 금지된 만료기한이 아니고
              && !isDialogueBlocked;  // 3. 대화 차단 상태도 아니어야 함
}
    
    currentCharacter = {
        name: generateRandomName(),
        origin: locationData.city,
        province: locationData.province,
        expiry: expiry,
        isHuman: isHuman,
        standingImage: characterData.image,
        isDialogueBlocked: isDialogueBlocked, // 대화에서 이상하게 할지 여부
        isRobot: characterData.isRobot, // 로봇 외형 여부
        isBlockedProvince: isBlockedProvince, // 금지된 출신지 여부
        isBlockedExpiry: isBlockedExpiry, // 금지된 만료기한 여부
        isArmImage: isArmImage, // -arm 이미지 여부
        isArmHuman: isArmHuman, // -arm 이미지 중 인간 여부
        isIncheonSpecial: isIncheonSpecial, // 인천 특수 예외 여부
        isIncheonHuman: isIncheonHuman // 인천 출신자 중 인간 여부
    };
    
    // 화면 업데이트
    document.getElementById('id-name').textContent = currentCharacter.name;
    document.getElementById('id-origin').textContent = currentCharacter.origin;
    document.getElementById('id-expiry').textContent = currentCharacter.expiry;
    
    // 말풍선 초기화 (새 캐릭터로 넘어갈 때)
    const bubblesContainer = document.getElementById('dialogue-bubbles');
    if (bubblesContainer) {
        bubblesContainer.innerHTML = '';
    }
    
    // 캐릭터 스탠딩 이미지 표시
    const characterStanding = document.getElementById('character-standing');
    const spritePlaceholder = document.querySelector('.sprite-placeholder');
    if (characterStanding) {
        characterStanding.style.backgroundImage = `url('${currentCharacter.standingImage}')`;
        characterStanding.classList.add('visible');
        // 플레이스홀더 숨기기
        if (spritePlaceholder) {
            spritePlaceholder.style.display = 'none';
        }
    }
    
    // 프로필 이미지 업데이트 (캐릭터 이미지 파일명에서 숫자 추출)
    const profileImage = document.getElementById('character-profile');
    if (profileImage) {
        // 예: "characters/1-normal.png" -> "1", "characters/3-robot1.png" -> "3"
        const match = currentCharacter.standingImage.match(/(\d+)/);
        if (match) {
            const characterNumber = match[1];
            profileImage.src = `cha/cha_profile/${characterNumber}-profile.jpg`;
            profileImage.style.display = 'block';
            
            // 이미지 로드 실패 시 에러 핸들링
            profileImage.onerror = function() {
                this.style.display = 'none';
            };
        } else {
            profileImage.style.display = 'none';
        }
    }
}   


// 게임 시작
function startGame(stage) {
    // 게임 배경음악 재생 (5일차는 특별 처리)
    if (stage === 5) {
        playDay5GameMusic();
    } else {
        playGameMusic();
    }
    
    gameState.currentStage = stage;
    gameState.correctCount = 0;
    gameState.wrongCount = 0;
    gameState.usedImages = []; // 스테이지 시작 시 사용된 이미지 목록 초기화
    gameState.admittedCharacters = []; // admit한 캐릭터 목록 초기화
    
    // 게임 화면 업데이트
    document.getElementById('current-day').textContent = stage;
    document.getElementById('score').textContent = '0';
    document.getElementById('correct-count').textContent = '0';
    document.getElementById('wrong-count').textContent = '0';
    
    // 지도 섹션 표시/숨김 (스테이지 규칙에 따라)
    const rule = getStageRule(stage);
    const mapSection = document.getElementById('map-section');
    const dialogueSection = document.getElementById('dialogue-section');
    
    // 대화 선택지 섹션 표시/숨김 (3일차부터)
    if (dialogueSection) {
        if (stage >= 3) {
            dialogueSection.style.display = 'flex';
        } else {
            dialogueSection.style.display = 'none';
        }
    }
    
    if (mapSection) {
        if (rule.hasMap) {
            mapSection.style.display = 'block';
            // 지도가 아직 초기화되지 않았다면 초기화
            setTimeout(() => {
                if (!map) {
                    initMap();
                }
                // 모든 지역 하이라이트 제거 후 새로 시작
                if (typeof hideRegionHighlight === 'function') {
                    const allProvinces = ['강원특별자치도', '경기도', '경상남도', '경상북도', '광주광역시', '대구광역시', '대전광역시', '부산광역시', '서울특별시', '세종특별자치시', '울산광역시', '인천광역시', '전북특별자치도', '충청남도', '충청북도'];
                    hideRegionHighlight(allProvinces);
                }
                
                setTimeout(() => {
                    // 2일차일 때 강원도 강조 표시
                    if (stage === 2 && typeof showRegionHighlight === 'function') {
                        showRegionHighlight(['강원특별자치도']);
                    } 
                    // 3일차일 때 강원도, 부산, 울산 강조 표시
                    else if (stage === 3 && typeof showRegionHighlight === 'function') {
                        showRegionHighlight(['강원특별자치도', '부산광역시', '울산광역시']);
                    }
                    // 4일차일 때 서울, 부산, 울산 강조 표시
                    else if (stage === 4 && typeof showRegionHighlight === 'function') {
                        showRegionHighlight(['서울특별시', '부산광역시', '울산광역시']);
                    }
                    // 5일차: 전라남도/광주광역시 제외한 모든 지역 빨간색, 인천 주황색
                    else if (stage === 5 && typeof showRegionHighlight === 'function') {
                        const allProvinces = ['강원특별자치도', '경기도', '경상남도', '경상북도', '광주광역시', '대구광역시', '대전광역시', '부산광역시', '서울특별시', '세종특별자치시', '울산광역시', '인천광역시', '전북특별자치도', '충청남도', '충청북도'];
                        const blockedProvinces = allProvinces.filter(p => p !== '전라남도' && p !== '광주광역시' && p !== '인천광역시');
                        showRegionHighlight(blockedProvinces, '#e74c3c'); // 빨간색
                        showRegionHighlight(['인천광역시'], '#ff8c00'); // 주황색
                    }
                }, 300);
            }, 100);
        } else {
            mapSection.style.display = 'none';
            // 지도 제거
            if (map) {
                map.remove();
                map = null;
            }
        }
    } else {
        // 지도가 이미 초기화된 경우에도 지역 강조 업데이트
        if (map && typeof showRegionHighlight === 'function' && typeof hideRegionHighlight === 'function') {
            // 모든 지역 하이라이트 제거
            const allProvinces = ['강원특별자치도', '경기도', '경상남도', '경상북도', '광주광역시', '대구광역시', '대전광역시', '부산광역시', '서울특별시', '세종특별자치시', '울산광역시', '인천광역시', '전북특별자치도', '충청남도', '충청북도'];
            hideRegionHighlight(allProvinces);
            
            if (stage === 2) {
                showRegionHighlight(['강원특별자치도']);
            } else if (stage === 3) {
                showRegionHighlight(['강원특별자치도', '부산광역시', '울산광역시']);
            } else if (stage === 4) {
                showRegionHighlight(['서울특별시', '부산광역시', '울산광역시']);
            } else if (stage === 5) {
                const blockedProvinces = allProvinces.filter(p => p !== '전라남도' && p !== '광주광역시' && p !== '인천광역시');
                showRegionHighlight(blockedProvinces, '#e74c3c'); // 빨간색
                showRegionHighlight(['인천광역시'], '#ff8c00'); // 주황색
            }
        }
    }
    
    // 메모 이미지 변경 (스테이지에 따라)
    const memoImg = document.getElementById('memo-img');
    if (memoImg) {
        if (stage >= 2 && stage <= 5) {
            memoImg.src = `img/memo${stage}.png`;
        } else {
            memoImg.src = 'img/memo.png';
        }
        // 이미지 로드 실패 시 에러 핸들링
        memoImg.onerror = function() {
            // 기본 메모 이미지로 대체
            this.src = 'img/memo.png';
        };
    }
    
    showScreen('game-screen');
    
    // 타임어택 시작
    startTimer(stage);
    
    // 첫 캐릭터 생성
    generateNewCharacter();
}

// 타임어택 시작
function startTimer(stage) {
    // 기존 타이머 정리
    if (gameTimer) {
        clearInterval(gameTimer);
    }
    
    // 스테이지별 시간 제한 가져오기
    const timeLimit = stageTimeLimits[stage] || 30;
    const startTime = Date.now();
    const duration = timeLimit * 1000; // 밀리초로 변환
    
    // UI 업데이트
    updateTimerDisplay();
    
    // 타이머 시작 (부드럽게 업데이트)
    gameTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        timeRemaining = Math.max(0, timeLimit - (elapsed / 1000));
        
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            // 시간 종료 - 게임 강제 종료
            clearInterval(gameTimer);
            gameTimer = null;
            endGame(gameState.correctCount, gameState.wrongCount, true);
        }
    }, 50); // 50ms마다 업데이트하여 부드럽게
}

// 타이머 UI 업데이트
function updateTimerDisplay() {
    const timerSeconds = document.getElementById('timer-seconds');
    const timerProgress = document.querySelector('.timer-progress');
    
    if (timerSeconds) {
        timerSeconds.textContent = Math.ceil(timeRemaining);
    }
    
    if (timerProgress) {
        const stage = gameState.currentStage;
        const timeLimit = stageTimeLimits[stage] || 30;
        const circumference = 2 * Math.PI * 45; // 반지름 45
        const progress = timeRemaining / timeLimit;
        const offset = circumference * (1 - progress);
        timerProgress.style.strokeDashoffset = offset;
    }
}

// 타이머 정리
function stopTimer() {
    if (gameTimer) {
        clearInterval(gameTimer);
        gameTimer = null;
    }
}

// 게임 종료 및 정산
function endGame(correct, wrong, isTimeOver = false) {
    // 타이머 정리
    stopTimer();
    
    // 게임 음악 중지 (5일차 포함)
    if (gameAudio && !gameAudio.paused) {
        gameAudio.pause();
        gameAudio.currentTime = 0;
    }
    if (day5GameAudio && !day5GameAudio.paused) {
        day5GameAudio.pause();
        day5GameAudio.currentTime = 0;
    }
    
    gameState.correctCount = correct;
    gameState.wrongCount = wrong;
    
    // 정산 화면 업데이트
    document.getElementById('result-correct').textContent = correct;
    document.getElementById('result-wrong').textContent = wrong;
    document.getElementById('result-total').textContent = correct + wrong;
    
    // 클리어/실패 판단
    const currentStage = gameState.currentStage;
    const isCleared = currentStage < 5 ? correct >= gameState.minCorrectToUnlock : (currentStage === 5 ? correct >= 22 : true);
    const isFailed = isTimeOver || (currentStage < 5 && correct < gameState.minCorrectToUnlock) || (currentStage === 5 && correct < 22);
    
    // 결과 오버레이 표시
    const resultOverlay = document.getElementById('game-result-overlay');
    const resultGif = document.getElementById('result-gif');
    
    if (resultOverlay && resultGif) {
        // GIF 설정 및 사운드 재생
        if (isCleared && !isFailed) {
            resultGif.src = 'img/gif/success.gif';
            playClearGifSound();
        } else {
            resultGif.src = 'img/gif/failed.gif';
            playFailGifSound();
        }
        resultOverlay.style.display = 'flex';
        
        // 3초 후 정산 화면으로 이동
        setTimeout(() => {
            resultOverlay.style.display = 'none';
            
            // 다음 스테이지 해제 확인
            const unlockMessage = document.getElementById('unlock-message');
            
            if (currentStage < 5 && correct >= gameState.minCorrectToUnlock) {
                const nextStage = currentStage + 1;
                if (!gameState.unlockedStages.includes(nextStage)) {
                    gameState.unlockedStages.push(nextStage);
                    saveProgress();
                    unlockMessage.textContent = `STAGE ${nextStage} UNLOCKED!`;
                    unlockMessage.classList.add('show');
                } else {
                    unlockMessage.classList.remove('show');
                }
            } else if (currentStage < 5 && correct < gameState.minCorrectToUnlock) {
                unlockMessage.textContent = `다음 스테이지를 해금하기 위해선 맞춘 횟수가 ${gameState.minCorrectToUnlock}번 이상이 되어야 합니다.`;
                unlockMessage.classList.add('show');
            } else {
                unlockMessage.classList.remove('show');
            }
            
            // 클리어 사운드 재생
            playClearSound();
            
            // 5일차 정산 화면 버튼 처리
            setupResultScreenButtons(currentStage);
            
            showScreen('result-screen');
        }, 3000);
    } else {
        // 오버레이가 없으면 바로 정산 화면으로
        const unlockMessage = document.getElementById('unlock-message');
        
        if (currentStage < 5 && correct >= gameState.minCorrectToUnlock) {
            const nextStage = currentStage + 1;
            if (!gameState.unlockedStages.includes(nextStage)) {
                gameState.unlockedStages.push(nextStage);
                saveProgress();
                unlockMessage.textContent = `STAGE ${nextStage} UNLOCKED!`;
                unlockMessage.classList.add('show');
            } else {
                unlockMessage.classList.remove('show');
            }
        } else if (currentStage < 5 && correct < gameState.minCorrectToUnlock) {
            unlockMessage.textContent = `다음 스테이지를 해금하기 위해선 맞춘 횟수가 ${gameState.minCorrectToUnlock}번 이상이 되어야 합니다.`;
            unlockMessage.classList.add('show');
        } else {
            unlockMessage.classList.remove('show');
        }
        
        playClearSound();
        
        // 5일차 정산 화면 버튼 처리
        setupResultScreenButtons(currentStage);
        
        showScreen('result-screen');
    }
}

// 정산 화면 버튼 설정 (5일차는 엔딩 버튼만 표시)
function setupResultScreenButtons(stage) {
    const retryBtn = document.getElementById('retry-btn');
    const stageSelectBtn = document.getElementById('stage-select-result-btn');
    let endingBtn = document.getElementById('ending-btn');
    const unlockMessage = document.getElementById('unlock-message');
    
    if (stage === 5) {
        // 엔딩 조건 확인
        const correct = gameState.correctCount;
        const isCleared = correct >= 22; // 정답 22명 이상
        const allAdmittedAreRobots = gameState.admittedCharacters.length > 0 && 
                                      gameState.admittedCharacters.every(char => !char.isHuman);
        const hasEnding = isCleared || allAdmittedAreRobots;
        
        if (hasEnding) {
            // 엔딩 조건 충족: 엔딩 보기 버튼만 표시, 재시도/스테이지 고르기 버튼 숨김
            if (retryBtn) retryBtn.style.display = 'none';
            if (stageSelectBtn) stageSelectBtn.style.display = 'none';
            if (unlockMessage) unlockMessage.classList.remove('show');
            
            if (!endingBtn) {
                const resultButtons = document.querySelector('.result-buttons');
                if (resultButtons) {
                    const btn = document.createElement('button');
                    btn.id = 'ending-btn';
                    btn.className = 'long-btn ending-btn';
                    btn.textContent = '엔딩 보기';
                    btn.style.backgroundColor = '#FFD700'; // 노란색
                    btn.style.color = '#000';
                    btn.style.border = '2px solid #FFD700';
                    resultButtons.appendChild(btn);
                    
                    // 엔딩 버튼 이벤트 리스너
                    btn.addEventListener('click', () => {
                        showEnding();
                    });
                }
            } else {
                endingBtn.style.display = 'block';
            }
        } else {
            // 엔딩 조건 미충족: 일반 정산 화면처럼 표시 (재시도/스테이지 고르기 버튼 표시)
            if (retryBtn) retryBtn.style.display = 'block';
            if (stageSelectBtn) stageSelectBtn.style.display = 'block';
            if (endingBtn) endingBtn.style.display = 'none';
            if (unlockMessage) {
                unlockMessage.textContent = '엔딩 조건이 해금되지 않았습니다';
                unlockMessage.classList.add('show');
            }
        }
    } else {
        // 다른 스테이지: 일반 버튼 표시
        if (retryBtn) retryBtn.style.display = 'block';
        if (stageSelectBtn) stageSelectBtn.style.display = 'block';
        if (endingBtn) endingBtn.style.display = 'none';
    }
}

// 엔딩 표시 함수
function showEnding() {
    // 엔딩 타입 결정: 로봇만 admit했는지 확인
    const allAdmittedAreRobots = gameState.admittedCharacters.length > 0 && 
                                  gameState.admittedCharacters.every(char => !char.isHuman);
    
    // 엔딩 타입: 'robot' = 로봇만 admit, 'normal' = 평범한 클리어
    const endingType = allAdmittedAreRobots ? 'robot' : 'normal';
    
    // 검정 화면으로 채우기
    const storyScreen = document.getElementById('story-screen');
    const storyBackground = storyScreen.querySelector('.story-background');
    if (storyBackground) {
        storyBackground.style.backgroundColor = '#000000';
    }
    // 스토리 오버레이도 검정으로
    const storyOverlay = storyScreen.querySelector('.story-overlay');
    if (storyOverlay) {
        storyOverlay.style.backgroundColor = '#000000';
        storyOverlay.style.opacity = '1';
    }
    
    // 엔딩 스토리 표시
    showEndingStory(endingType);
}

// 엔딩 스토리 표시
function showEndingStory(endingType) {
    const endingStories = endings[endingType] || [];
    currentStory = endingStories;
    currentStoryIndex = 0;
    
    // 엔딩 타입에 따라 배경음악 재생
    if (endingType === 'normal') {
        playBadEndMusic();
    } else if (endingType === 'robot') {
        playTrueEndMusic();
        // 진엔딩을 본 상태를 localStorage에 저장
        localStorage.setItem('trueEndingViewed', 'true');
    }
    
    // 스토리 화면 표시
    showScreen('story-screen');
    
    // 스토리 표시 함수
    function displayNextLine() {
        if (currentStoryIndex < currentStory.length) {
            const dialogue = currentStory[currentStoryIndex];
            
            const storyText = document.getElementById('story-text');
            const characterPortrait = document.getElementById('character-portrait');
            const characterName = document.getElementById('character-name');
            
            // 대사 표시
            if (typeof dialogue === 'string') {
                storyText.textContent = dialogue;
                characterName.textContent = '';
                characterPortrait.classList.remove('senior', 'player');
            } else {
                storyText.textContent = dialogue.text;
                const character = characters[dialogue.speaker];
                if (character) {
                    characterName.textContent = character.name;
                    let portraitClasses = 'character-portrait ' + dialogue.speaker;
                    if (dialogue.expression) {
                        portraitClasses += ' ' + dialogue.expression;
                    }
                    characterPortrait.className = portraitClasses;
                }
            }
            
            // 일러스트 표시 처리
            const illustrationOverlay = document.getElementById('story-illustration-overlay');
            const illustrationImg = document.getElementById('story-illustration-img');
            if (illustrationOverlay && illustrationImg && typeof dialogue === 'object' && dialogue.illustration) {
                if (dialogue.illustration.show) {
                    illustrationImg.src = dialogue.illustration.show;
                    illustrationOverlay.style.display = 'block';
                    // 이미지 로드 실패 시 에러 핸들링
                    illustrationImg.onerror = function() {
                        illustrationOverlay.style.display = 'none';
                    };
                } else if (dialogue.illustration.hide) {
                    illustrationOverlay.style.display = 'none';
                }
            }
            
            currentStoryIndex++;
        } else {
            // 엔딩 종료: 일러스트 숨김
            const illustrationOverlay = document.getElementById('story-illustration-overlay');
            if (illustrationOverlay) {
                illustrationOverlay.style.display = 'none';
            }
            
            // 메인 화면으로 돌아가기
            showScreen('main-screen');
        }
    }
    
    // 초기 표시
    displayNextLine();
    
    // Next 버튼 이벤트 재설정
    const nextBtn = document.getElementById('story-next-btn');
    nextBtn.onclick = displayNextLine;
    
    // Skip 버튼: 메인 화면으로
    const skipBtn = document.getElementById('story-skip-btn');
    skipBtn.onclick = () => {
        showScreen('main-screen');
    };
}

// 피드백 텍스트 표시
function showFeedbackText(event, isCorrect, character) {
    // 클릭 위치 가져오기
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    // 이유 파악
    const reasons = [];
    
    // 물자 지원군인 경우 다른 조건들을 표시하지 않음
    const isSupplyPerson = character.isIncheonSpecial && character.isIncheonHuman && character.isHuman;
    
    if (!isSupplyPerson) {
        // 로봇 외형 표시
        // 1. 일반 로봇 외형 (isRobot && !isArmImage)
        // 2. 의수이지만 로봇 판정인 경우 (isArmImage && !isArmHuman)
        if ((character.isRobot && !character.isArmImage) || 
            (character.isArmImage && !character.isArmHuman)) {
            reasons.push('로봇 외형');
        }
        
        // -arm 이미지이고 인간인 경우 (admit/deny 모두 표시)
        if (character.isArmImage && character.isArmHuman) {
            reasons.push('의수였음');
        }
        
        if (character.isBlockedExpiry) {
            reasons.push('ID카드 기한만료');
        }
        if (character.isDialogueBlocked) {
            reasons.push('기계 목소리');
        }
        // 5일차 인천 로봇인 경우도 출신지 이슈 표시
        if (character.isBlockedProvince || (character.isIncheonSpecial && !character.isIncheonHuman)) {
            reasons.push('출신지 이슈');
        }
    }
    
    // 피드백 텍스트 요소 생성
    const feedback = document.createElement('div');
    feedback.className = 'feedback-text';
    
    const mainText = document.createElement('div');
    mainText.className = isCorrect ? 'feedback-main feedback-correct' : 'feedback-main feedback-wrong';
    mainText.textContent = isCorrect ? '정답입니다!' : '틀렸습니다';
    
    const reasonText = document.createElement('div');
    reasonText.className = 'feedback-reason';
    reasonText.textContent = reasons.join(' / ');
    
    feedback.appendChild(mainText);
    if (reasons.length > 0) {
        feedback.appendChild(reasonText);
    }
    
    // 인천 출신 인간(구호물품)인 경우 '물자 지원군' 표시
    // 조건: 인천 특수 예외 && 인간 && 만료기한/로봇 목소리 문제 없음 && 정답
    if (isCorrect && 
        character.isIncheonSpecial && 
        character.isIncheonHuman && 
        character.isHuman &&
        !character.isBlockedExpiry && 
        !character.isDialogueBlocked) {
        const supportText = document.createElement('div');
        supportText.className = 'feedback-reason';
        supportText.textContent = '물자 지원군';
        feedback.appendChild(supportText);
    }
    
    // 위치 설정 (클릭 위치에서 100px 위)
    feedback.style.left = clickX + 'px';
    feedback.style.top = (clickY - 100) + 'px';
    
    // body에 추가
    document.body.appendChild(feedback);
    
    // 애니메이션 후 제거 (더 오래 표시)
    setTimeout(() => {
        feedback.remove();
    }, 3500);
}

// 진행도 리셋
function resetProgress() {
    const confirmMessage = "지금까지 저장된 진행 상황이 전부 초기화됩니다. 진행도를 리셋하시겠습니까?";
    
    if (confirm(confirmMessage)) {
        // localStorage 초기화
        localStorage.removeItem('turingDeskProgress');
        
        // 모든 localStorage 항목 삭제 (캐시 완전 삭제)
        localStorage.clear();
        
        // 페이지 새로고침
        location.reload();
    }
}

// 개발자 커맨드: 키 시퀀스 추적
let keySequence = [];
let keySequenceTimeout = null;
const KEY_SEQUENCE_TIMEOUT = 1000; // 1초 내에 입력되어야 함

// 개발자 커맨드 처리
function handleDeveloperCommand() {
    const currentStage = gameState.currentStage;
    
    // 키 시퀀스 길이 체크 (3일차, 4일차는 4개, 나머지는 4개)
    if (keySequence.length !== 4) {
        return;
    }
    
    const sequence = keySequence.map(k => k.key).join(',');
    
    // 1일차: 왼쪽 두 번, 오른쪽 두 번
    if (currentStage === 1 && sequence === 'ArrowLeft,ArrowLeft,ArrowRight,ArrowRight') {
        const requiredCorrect = gameState.minCorrectToUnlock;
        gameState.correctCount = requiredCorrect;
        gameState.wrongCount = 0;
        endGame(gameState.correctCount, gameState.wrongCount);
        keySequence = [];
        return;
    }
    
    // 2일차: 위쪽 두 번, 아래쪽 두 번
    if (currentStage === 2 && sequence === 'ArrowUp,ArrowUp,ArrowDown,ArrowDown') {
        const requiredCorrect = gameState.minCorrectToUnlock;
        gameState.correctCount = requiredCorrect;
        gameState.wrongCount = 0;
        endGame(gameState.correctCount, gameState.wrongCount);
        keySequence = [];
        return;
    }
    
    // 3일차: 위쪽 네 번
    if (currentStage === 3 && sequence === 'ArrowUp,ArrowUp,ArrowUp,ArrowUp') {
        const requiredCorrect = gameState.minCorrectToUnlock;
        gameState.correctCount = requiredCorrect;
        gameState.wrongCount = 0;
        endGame(gameState.correctCount, gameState.wrongCount);
        keySequence = [];
        return;
    }
    
    // 4일차: 아래쪽 네 번
    if (currentStage === 4 && sequence === 'ArrowDown,ArrowDown,ArrowDown,ArrowDown') {
        const requiredCorrect = gameState.minCorrectToUnlock;
        gameState.correctCount = requiredCorrect;
        gameState.wrongCount = 0;
        endGame(gameState.correctCount, gameState.wrongCount);
        keySequence = [];
        return;
    }
    
    // 5일차 특별 커맨드: 위쪽 두 번, 왼쪽 두 번 → 노말 엔딩
    if (currentStage === 5 && sequence === 'ArrowUp,ArrowUp,ArrowLeft,ArrowLeft') {
        const requiredCorrect = 22;
        gameState.correctCount = requiredCorrect;
        gameState.wrongCount = 0;
        gameState.admittedCharacters = [];
        // 22명 이상 클리어 상태로 설정 (모두 인간으로 간주)
        for (let i = 0; i < 22; i++) {
            gameState.admittedCharacters.push({ isHuman: true });
        }
        endGame(gameState.correctCount, gameState.wrongCount);
        keySequence = [];
        return;
    }
    
    // 5일차 특별 커맨드: 위쪽 두 번, 오른쪽 두 번 → 진엔딩 (로봇 엔딩)
    if (currentStage === 5 && sequence === 'ArrowUp,ArrowUp,ArrowRight,ArrowRight') {
        const requiredCorrect = 22;
        gameState.correctCount = requiredCorrect;
        gameState.wrongCount = 0;
        gameState.admittedCharacters = [];
        // 모두 로봇으로 설정
        for (let i = 0; i < 22; i++) {
            gameState.admittedCharacters.push({ isHuman: false });
        }
        endGame(gameState.correctCount, gameState.wrongCount);
        keySequence = [];
        return;
    }
}


// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    // 진행도 로드
    loadProgress();
    
    // 메인 화면 -> 스테이지 선택
    document.getElementById('start-btn').addEventListener('click', () => {
        playStageSelectMusic();
        showScreen('stage-select-screen');
    });
    
    // 스테이지 선택 -> 메인 화면
    document.getElementById('back-to-main-btn').addEventListener('click', () => {
        showScreen('main-screen');
    });
    
    // 리셋 버튼
    document.getElementById('reset-btn').addEventListener('click', () => {
        resetProgress();
    });
    
    // 스테이지 버튼 클릭
    document.querySelectorAll('.stage-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // e.currentTarget을 사용하여 버튼 요소를 확실히 가져옴
            const button = e.currentTarget;
            const stage = parseInt(button.dataset.stage);
            if (gameState.unlockedStages.includes(stage)) {
                showScreen('story-screen');
                showStory(stage);
            }
        });
    });
    
    // 통과 버튼
    document.getElementById('pass-btn').addEventListener('click', (e) => {
        if (!currentCharacter) return;
        
        playButtonSound();
        
        const isCorrect = currentCharacter.isHuman;
        if (isCorrect) {
            gameState.correctCount++;
        } else {
            gameState.wrongCount++;
        }
        
        // 5일차 엔딩 판단을 위해 admit한 캐릭터 추적
        if (gameState.currentStage === 5) {
            gameState.admittedCharacters.push({
                isHuman: currentCharacter.isHuman
            });
        }
        
        // 피드백 텍스트 표시
        showFeedbackText(e, isCorrect, currentCharacter);
        
        updateGameStats();
        generateNewCharacter();
    });
    
    // 거부 버튼
    document.getElementById('reject-btn').addEventListener('click', (e) => {
        if (!currentCharacter) return;
        
        playButtonSound();
        
        const isCorrect = !currentCharacter.isHuman;
        if (isCorrect) {
            gameState.correctCount++;
        } else {
            gameState.wrongCount++;
        }
        
        // 피드백 텍스트 표시
        showFeedbackText(e, isCorrect, currentCharacter);
        
        updateGameStats();
        generateNewCharacter();
    });
    
  

    
    // 게임 통계 업데이트 함수
    function updateGameStats() {
        document.getElementById('correct-count').textContent = gameState.correctCount;
        document.getElementById('wrong-count').textContent = gameState.wrongCount;
        document.getElementById('score').textContent = gameState.correctCount - gameState.wrongCount;
        
        // 게임 종료 조건: 5일차는 25명, 그 외는 20명 처리 후 게임 종료
        const total = gameState.correctCount + gameState.wrongCount;
        const requiredTotal = gameState.currentStage === 5 ? 25 : 20;
        if (total >= requiredTotal) {
            setTimeout(() => {
                endGame(gameState.correctCount, gameState.wrongCount);
            }, 500);
        }
    }
    
    // 정산 화면 -> 재시도
    document.getElementById('retry-btn').addEventListener('click', () => {
        const stage = gameState.currentStage;
        showScreen('story-screen');
        showStory(stage);
    });
    
    // 정산 화면 -> 스테이지 선택
    document.getElementById('stage-select-result-btn').addEventListener('click', () => {
        updateStageButtons();
        playStageSelectMusic();
        showScreen('stage-select-screen');
    });
    
    // 나가기 버튼 이벤트 리스너
    const exitGameBtn = document.getElementById('exit-game-btn');
    const exitStoryBtn = document.getElementById('exit-story-btn');
    const exitDialog = document.getElementById('exit-confirm-dialog');
    const exitConfirmYes = document.getElementById('exit-confirm-yes');
    const exitConfirmNo = document.getElementById('exit-confirm-no');
    
    // 나가기 버튼 클릭 시 다이얼로그 표시
    if (exitGameBtn) {
        exitGameBtn.addEventListener('click', () => {
            exitDialog.classList.add('active');
        });
    }
    
    if (exitStoryBtn) {
        exitStoryBtn.addEventListener('click', () => {
            exitDialog.classList.add('active');
        });
    }
    
    // 예 버튼 클릭 시 스테이지 선택 화면으로 이동
    if (exitConfirmYes) {
        exitConfirmYes.addEventListener('click', () => {
            stopTimer(); // 타이머 정리
            playStageSelectMusic();
            exitDialog.classList.remove('active');
            showScreen('stage-select-screen');
        });
    }
    
    // 아니오 버튼 클릭 시 다이얼로그 닫기
    if (exitConfirmNo) {
        exitConfirmNo.addEventListener('click', () => {
            exitDialog.classList.remove('active');
        });
    }
    
    // 대화 선택지 버튼 이벤트 리스너
    const dialogueButtons = document.querySelectorAll('.dialogue-btn');
    dialogueButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const option = e.target.getAttribute('data-option');
            handleDialogueOption(option);
        });
    });
    
// 대화 선택지 처리 함수 (수정)
function handleDialogueOption(option) {
    if (!currentCharacter) return;
    
    playButtonSound();
    
    // 3일차 이상에서만 작동
    const currentStage = gameState.currentStage;
    if (currentStage < 3) return;
    
    // 🌟🌟🌟 수정된 핵심 로직 🌟🌟🌟
    // 대화가 이상한지 여부는 isDialogueBlocked 값으로만 판단합니다.
    const isTalkingNormal = !currentCharacter.isDialogueBlocked;
    
    let response = '';
    
    if (option === '1') {
        // "1. 안녕하세요?"
        if (isTalkingNormal) { // isDialogueBlocked가 false일 때 (정상 대화)
            // 정상적인 대답
            const responses = [
                '오늘 날씨가 참 좋네요',
                '반가워요',
                '제발 들어가게 해주세요'
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        } else { // isDialogueBlocked가 true일 때 (이상 대화)
            // 이상한 대답
            const responses = [
                '안- 하 - 요 -',
                '안녕, 안녕? 안녕? 녀녀녀녀녀녀녀녕!',
                '직, 지지직, 안녕, 지지직...'
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        }
    } else if (option === '2') {
        // "2. 당신 모습에 이상한 게 보여요."
        // 4일차 이상에서 -arm 이미지인 경우 특별 처리
        if (currentStage >= 4 && currentCharacter.isArmImage) {
            if (currentCharacter.isArmHuman) {
                // -arm 이미지이고 인간인 경우 (의수/의족)
                const responses = [
                    '아, 이거 의수예요.',
                    '사고를 당해서 팔에 로봇을 심었어요!',
                    '의족이에요. 교통사고로 다리를 잃었거든요.',
                    '의수입니다. 산업재해로 팔을 잃었어요.'
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
            } else {
                // -arm 이미지이고 로봇인 경우 (평소대로)
                if (isTalkingNormal) {
                    const responses = [
                        '무슨 소리세요? 아무것도 없는데요.',
                        '제 얼굴에 뭐라도 묻은 건가요?',
                        '잘 모르겠는데요...'
                    ];
                    response = responses[Math.floor(Math.random() * responses.length)];
                } else {
                    const responses = [
                        '뭐-ㄹㅏ---',
                        '무엇? 무엇? 무엇? 무?',
                        '지지직, 지지지지지직....'
                    ];
                    response = responses[Math.floor(Math.random() * responses.length)];
                }
            }
        } else {
            // 일반적인 경우
            if (isTalkingNormal) { // isDialogueBlocked가 false일 때 (정상 대화)
                // 정상적인 대답
                const responses = [
                    '무슨 소리세요? 아무것도 없는데요.',
                    '제 얼굴에 뭐라도 묻은 건가요?',
                    '잘 모르겠는데요...'
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
            } else { // isDialogueBlocked가 true일 때 (이상 대화)
                // 이상한 대답
                const responses = [
                    '뭐-ㄹㅏ---',
                    '무엇? 무엇? 무엇? 무?',
                    '지지직, 지지지지지직....'
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
            }
        }
    } else if (option === '3') {
        // "3. 출신지가 어딘가요?"
        // 5일차 인천 특수 예외 처리
        if (currentStage === 5 && currentCharacter.isIncheonSpecial) {
            if (currentCharacter.isIncheonHuman) {
                // 인천 출신자 중 인간인 경우
                const responses = [
                    '구호 물품을 들고왔습니다!',
                    '바다를 넘어 필요한 물자들을 가지고 왔어요.',
                    '인천공항에서 구호품을 실어왔습니다.',
                    '필요한 물자를 가지고 왔어요.'
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
            } else {
                // 인천 출신자 중 로봇인 경우 (일반적인 대답)
                if (isTalkingNormal) {
                    response = `${currentCharacter.origin}에서 왔어요.`;
                } else {
                    const responses = [
                        '지지지지지직, 지지지지지지직-',
                        '어디더라, 직, 어디, 어디, 어....',
                        '지지직, 끼이이익- 지직-'
                    ];
                    response = responses[Math.floor(Math.random() * responses.length)];
                }
            }
        } else {
            // 일반적인 경우
            if (isTalkingNormal) { // isDialogueBlocked가 false일 때 (정상 대화)
                // 정상적인 대답 (출신지 말하기)
                response = `${currentCharacter.origin}에서 왔어요.`;
            } else { // isDialogueBlocked가 true일 때 (이상 대화)
                // 이상한 대답
                const responses = [
                    '지지지지지직, 지지지지지지직-',
                    '어디더라, 직, 어디, 어디, 어....',
                    '지지직, 끼이이익- 지직-'
                ];
                response = responses[Math.floor(Math.random() * responses.length)];
            }
        }
    }
    
    // 말풍선에 대답 표시
    showDialogueBubble(response);
}
    
    // 말풍선 표시 함수
    function showDialogueBubble(text) {
        const bubblesContainer = document.getElementById('dialogue-bubbles');
        if (!bubblesContainer) return;
        
        const bubble = document.createElement('div');
        bubble.className = 'dialogue-bubble';
        bubble.textContent = text;
        
        bubblesContainer.appendChild(bubble);
        
        // 말풍선이 너무 많아지면 스크롤 가능하도록
        bubblesContainer.scrollTop = bubblesContainer.scrollHeight;
    }
    
    // 말풍선 초기화 함수 (새 캐릭터 생성 시 호출)
    function clearDialogueBubbles() {
        const bubblesContainer = document.getElementById('dialogue-bubbles');
        if (bubblesContainer) {
            bubblesContainer.innerHTML = '';
        }
    }
    
    // 다이얼로그 배경 클릭 시 닫기
    if (exitDialog) {
        exitDialog.addEventListener('click', (e) => {
            if (e.target === exitDialog) {
                exitDialog.classList.remove('active');
            }
        });
    }
    
    // 개발자 커맨드: 키 입력 이벤트 리스너
    document.addEventListener('keydown', (e) => {
        // 게임 화면에서만 작동
        const gameScreen = document.getElementById('game-screen');
        if (!gameScreen || !gameScreen.classList.contains('active')) {
            return;
        }
        
        // currentStage가 설정되어 있는지 확인
        if (!gameState.currentStage || gameState.currentStage === 0) {
            return;
        }
        
        // 화살표 키만 추적
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            // 기본 동작 방지 (스크롤 등)
            e.preventDefault();
            
            // 기존 타임아웃 클리어
            if (keySequenceTimeout) {
                clearTimeout(keySequenceTimeout);
            }
            
            // 키 입력 추가
            keySequence.push({ key: e.key, time: Date.now() });
            
            // 최대 4개까지만 유지
            if (keySequence.length > 4) {
                keySequence.shift();
            }
            
            // 개발자 커맨드 확인 (키 시퀀스가 4개일 때만)
            if (keySequence.length === 4) {
                handleDeveloperCommand();
            }
            
            // 타임아웃 설정: 일정 시간 내에 다음 키가 입력되지 않으면 시퀀스 초기화
            keySequenceTimeout = setTimeout(() => {
                keySequence = [];
            }, KEY_SEQUENCE_TIMEOUT);
        }
    });
});
