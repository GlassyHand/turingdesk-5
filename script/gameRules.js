// 게임 스테이지별 규칙 설정
const gameRules = {
    // 1days: 지도 없음, 외관만 확인
    1: {
        name: "1days",
        hasMap: false,
        robotProbability: 0.5, // 1:1 비율
        blockedProvinces: [], // 거부할 출신지 없음
        blockedProvinceProbability: 0, // 거부할 출신지 확률 없음
        blockedTalkProbability: 0 // 대화 이상 확률 없음
    },
    
    // 2days: 지도 있음, 강원특별자치도 출신 거부
    2: {
        name: "2days",
        hasMap: true,
        robotProbability: 1/3, // 1/3 확률로 robot
        blockedProvinces: ['강원특별자치도'], // 강원특별자치도 출신 거부
        blockedProvinceProbability: 0.37, // 37% 확률로 거부할 출신지 등장
        blockedTalkProbability: 0 // 대화 이상 확률 없음
    },
    
    // 3days: 지도 있음, 강원도/부산/울산 출입금지, 만료기한 2126 이하 출입금지
    3: {
        name: "3days",
        hasMap: true,
        robotProbability: 20/100, // 20% 확률로 robot
        blockedProvinces: ['강원특별자치도', '부산광역시', '울산광역시'], // 강원도, 부산, 울산 출입금지
        blockedProvinceProbability: 20/100, // 20% 확률로 거부할 출신지 등장
        blockedExpiryYear: 2126, // 2126 이하 만료기한 출입금지
        blockedTalkProbability: 10/100 // 대화 이상 확률 (10%)
    },
    
    // 4days: 지도 있음, 서울/부산/울산 출입금지
    4: {
        name: "4days",
        hasMap: true,
        robotProbability: 10/100, // 15% 확률로 robot
        blockedProvinces: ['서울특별시', '부산광역시', '울산광역시'], // 서울, 부산, 울산 출입금지
        blockedProvinceProbability: 20/100, // 20% 확률로 거부할 출신지 등장
        blockedExpiryYear: 2126, // 2126 이하 만료기한 출입금지
        blockedTalkProbability: 1/10 // 대화 이상 확률
    },
    
    // 5days: 지도 있음, 전라남도/광주광역시 제외한 모든 지역 출입금지
    5: {
        name: "5days",
        hasMap: true,
        robotProbability: 10/100, // 10% 확률로 robot (4일차와 동일)
        blockedProvinces: ['강원특별자치도', '경기도', '경상남도', '경상북도', '대구광역시', '대전광역시', '부산광역시', '서울특별시', '세종특별자치시', '울산광역시', '전북특별자치도', '충청남도', '충청북도'], // 전라남도/광주광역시 제외한 모든 지역
        blockedProvinceProbability: 15/100, // 15% 확률로 거부할 출신지 등장
        blockedExpiryYear: 2126, // 2126 이하 만료기한 출입금지
        blockedTalkProbability: 1/10 // 대화 이상 확률
    }
};

// 스테이지별 규칙 가져오기
function getStageRule(stage) {
    return gameRules[stage] || gameRules[1]; // 기본값은 1days 규칙
}

