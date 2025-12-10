// 지도 변수
let map = null;
let provinceMarkers = []; // 시/도 급 마커들
let detailMarkers = []; // 세부 지역 마커들
const DETAIL_ZOOM_LEVEL = 7.5; // 세부 지역이 보이기 시작하는 줌 레벨
let regionLayers = {}; // 지역별 GeoJSON 레이어 저장 (키: 지역명, 값: 레이어)
let regionAnimationIds = {}; // 지역별 애니메이션 ID 저장
let gangwonLayer = null; // 강원도 GeoJSON 레이어 (하위 호환성)
let gangwonAnimationId = null; // 강원도 애니메이션 ID (하위 호환성)
let sharedAnimationStartTime = null; // 공유 애니메이션 시작 시간 (동기화용)

// 지도 초기화
function initMap() {
    const mapElement = document.getElementById('map');
    
    if (!mapElement || map) return;
    
    // 지도 생성 (대한민국 전체가 보이는 뷰)
    map = L.map('map', {
        zoomControl: false
    }).setView([36.5, 127.5], 7);
    
    // -----------------------------------------------------------------
    // 복잡한 OSM 타일 대신, 단순하고 글자 없는 타일 레이어 사용
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO &amp; OpenStreetMap contributors',
        maxZoom: 18 // 최대 줌 레벨 조정
    }).addTo(map);
    // -----------------------------------------------------------------
    
    // 시/도 급 광역단체 중심 좌표 (기본 줌 레벨에서 표시)
    provinceMarkers.push(addLabelToMap([37.56667, 126.97806], '서울', true));
    provinceMarkers.push(addLabelToMap([35.82000, 127.10861], '전북', true));
    provinceMarkers.push(addLabelToMap([36.65750, 126.67139], '충청남도', true)); 
    provinceMarkers.push(addLabelToMap([36.90000, 127.80000], '충청북도', true)); 
    provinceMarkers.push(addLabelToMap([35.17944, 129.07556], '부산', true));
    provinceMarkers.push(addLabelToMap([35.87144, 128.60144], '대구', true));
    provinceMarkers.push(addLabelToMap([37.45626, 126.70521], '인천', true));
    provinceMarkers.push(addLabelToMap([35.15955, 126.85260], '광주', true));
    provinceMarkers.push(addLabelToMap([36.35041, 127.38455], '대전', true));
    provinceMarkers.push(addLabelToMap([35.53838, 129.31136], '울산', true));
    provinceMarkers.push(addLabelToMap([36.48167, 127.28972], '세종', true));
    provinceMarkers.push(addLabelToMap([37.28000, 127.01639], '경기도', true));
    provinceMarkers.push(addLabelToMap([37.88147, 128.50000], '강원도', true));
    provinceMarkers.push(addLabelToMap([34.86790, 126.99100], '전라남도', true));
    provinceMarkers.push(addLabelToMap([36.57500, 128.84722], '경상북도', true));
    provinceMarkers.push(addLabelToMap([35.46060, 128.21320], '경상남도', true));

    // --- 세부 지역 (시/군/구) 좌표 (확대 시 표시) ---
    
    // 서울특별시 (Seoul Special City)
    detailMarkers.push(addLabelToMap([37.51752, 127.04750], '강남구', false));
    detailMarkers.push(addLabelToMap([37.53032, 127.12389], '강동구', false));
    detailMarkers.push(addLabelToMap([37.63973, 127.02551], '강북구', false));
    detailMarkers.push(addLabelToMap([37.55099, 126.84950], '강서구', false));
    detailMarkers.push(addLabelToMap([37.47827, 126.95166], '관악구', false));
    detailMarkers.push(addLabelToMap([37.53856, 127.08226], '광진구', false));
    detailMarkers.push(addLabelToMap([37.49544, 126.88569], '구로구', false));
    detailMarkers.push(addLabelToMap([37.45680, 126.89547], '금천구', false));
    detailMarkers.push(addLabelToMap([37.65345, 127.05670], '노원구', false));
    detailMarkers.push(addLabelToMap([37.66874, 127.04719], '도봉구', false));
    detailMarkers.push(addLabelToMap([37.57442, 127.03964], '동대문구', false));
    detailMarkers.push(addLabelToMap([37.51240, 126.93921], '동작구', false));
    detailMarkers.push(addLabelToMap([37.56619, 126.90159], '마포구', false));
    detailMarkers.push(addLabelToMap([37.57945, 126.93655], '서대문구', false));
    detailMarkers.push(addLabelToMap([37.48357, 127.03264], '서초구', false));
    detailMarkers.push(addLabelToMap([37.56350, 127.03664], '성동구', false));
    detailMarkers.push(addLabelToMap([37.58945, 127.01676], '성북구', false));
    detailMarkers.push(addLabelToMap([37.51441, 127.10657], '송파구', false));
    detailMarkers.push(addLabelToMap([37.52702, 126.85616], '양천구', false));
    detailMarkers.push(addLabelToMap([37.52636, 126.89626], '영등포구', false));
    detailMarkers.push(addLabelToMap([37.53235, 126.99042], '용산구', false));
    detailMarkers.push(addLabelToMap([37.60275, 126.93043], '은평구', false));
    detailMarkers.push(addLabelToMap([37.57351, 126.97858], '종로구', false));
    detailMarkers.push(addLabelToMap([37.56230, 126.99420], '중구', false));
    detailMarkers.push(addLabelToMap([37.59542, 127.09355], '중랑구', false));

    // 경기도 (Gyeonggi-do)
    detailMarkers.push(addLabelToMap([37.83000, 127.50972], '가평군', false));
    detailMarkers.push(addLabelToMap([37.65814, 126.83196], '고양시', false));
    detailMarkers.push(addLabelToMap([37.42944, 127.00333], '과천시', false));
    detailMarkers.push(addLabelToMap([37.47889, 126.86611], '광명시', false));
    detailMarkers.push(addLabelToMap([37.40938, 127.26620], '광주시', false));
    detailMarkers.push(addLabelToMap([37.59500, 127.13528], '구리시', false));
    detailMarkers.push(addLabelToMap([37.35972, 126.92444], '군포시', false));
    detailMarkers.push(addLabelToMap([37.61500, 126.71500], '김포시', false));
    detailMarkers.push(addLabelToMap([37.63583, 127.21861], '남양주시', false));
    detailMarkers.push(addLabelToMap([37.90389, 127.06000], '동두천시', false));
    detailMarkers.push(addLabelToMap([37.49889, 126.76889], '부천시', false));
    detailMarkers.push(addLabelToMap([37.42083, 127.12611], '성남시', false));
    detailMarkers.push(addLabelToMap([37.26389, 127.02861], '수원시', false));
    detailMarkers.push(addLabelToMap([37.37806, 126.80417], '시흥시', false));
    detailMarkers.push(addLabelToMap([37.32361, 126.82111], '안산시', false));
    detailMarkers.push(addLabelToMap([37.00417, 127.27944], '안성시', false));
    detailMarkers.push(addLabelToMap([37.39417, 126.95667], '안양시', false));
    detailMarkers.push(addLabelToMap([37.78167, 127.04528], '양주시', false));
    detailMarkers.push(addLabelToMap([37.49139, 127.48972], '양평군', false));
    detailMarkers.push(addLabelToMap([37.29875, 127.63665], '여주시', false));
    detailMarkers.push(addLabelToMap([38.10083, 127.07083], '연천군', false));
    detailMarkers.push(addLabelToMap([37.14778, 127.07583], '오산시', false));
    detailMarkers.push(addLabelToMap([37.24139, 127.17722], '용인시', false));
    detailMarkers.push(addLabelToMap([37.34861, 127.00444], '의왕시', false));
    detailMarkers.push(addLabelToMap([37.73889, 127.04750], '의정부시', false));
    detailMarkers.push(addLabelToMap([37.28444, 127.44750], '이천시', false));
    detailMarkers.push(addLabelToMap([37.76167, 126.77750], '파주시', false));
    detailMarkers.push(addLabelToMap([37.00389, 127.10806], '평택시', false));
    detailMarkers.push(addLabelToMap([37.89222, 127.20083], '포천시', false));
    detailMarkers.push(addLabelToMap([37.53931, 127.21855], '하남시', false));
    detailMarkers.push(addLabelToMap([37.19944, 126.83111], '화성시', false));

    // 경상남도 (Gyeongsangnam-do)
    detailMarkers.push(addLabelToMap([34.88056, 128.61861], '거제시', false));
    detailMarkers.push(addLabelToMap([35.68694, 127.90472], '거창군', false));
    detailMarkers.push(addLabelToMap([35.23417, 128.87806], '김해시', false));
    detailMarkers.push(addLabelToMap([34.73361, 127.93000], '남해군', false));
    detailMarkers.push(addLabelToMap([35.49500, 128.74417], '밀양시', false));
    detailMarkers.push(addLabelToMap([35.09333, 128.08333], '사천시', false));
    detailMarkers.push(addLabelToMap([35.40500, 127.87611], '산청군', false));
    detailMarkers.push(addLabelToMap([35.33389, 129.01861], '양산시', false));
    detailMarkers.push(addLabelToMap([35.32639, 128.29389], '의령군', false));
    detailMarkers.push(addLabelToMap([35.18028, 128.10917], '진주시', false));
    detailMarkers.push(addLabelToMap([35.58000, 128.49083], '창녕군', false));
    detailMarkers.push(addLabelToMap([35.22806, 128.68361], '창원시', false));
    detailMarkers.push(addLabelToMap([34.84361, 128.42306], '통영시', false));
    detailMarkers.push(addLabelToMap([35.05694, 127.75056], '하동군', false));
    detailMarkers.push(addLabelToMap([35.28694, 128.40694], '함안군', false));
    detailMarkers.push(addLabelToMap([35.52028, 127.73722], '함양군', false));
    detailMarkers.push(addLabelToMap([35.56833, 128.16917], '합천군', false));

    // 경상북도 (Gyeongsangbuk-do)
    detailMarkers.push(addLabelToMap([35.82639, 128.74972], '경산시', false));
    detailMarkers.push(addLabelToMap([35.85694, 129.21528], '경주시', false));
    detailMarkers.push(addLabelToMap([35.73306, 128.27250], '고령군', false));
    detailMarkers.push(addLabelToMap([36.11306, 128.34028], '구미시', false));
    detailMarkers.push(addLabelToMap([36.11111, 128.11389], '김천시', false));
    detailMarkers.push(addLabelToMap([36.59278, 128.19194], '문경시', false));
    detailMarkers.push(addLabelToMap([36.91139, 128.75944], '봉화군', false));
    detailMarkers.push(addLabelToMap([36.40222, 128.15778], '상주시', false));
    detailMarkers.push(addLabelToMap([35.91472, 128.28306], '성주군', false));
    detailMarkers.push(addLabelToMap([36.56833, 128.72917], '안동시', false));
    detailMarkers.push(addLabelToMap([36.41694, 129.36250], '영덕군', false));
    detailMarkers.push(addLabelToMap([36.66694, 129.11722], '영양군', false));
    detailMarkers.push(addLabelToMap([36.81528, 128.62083], '영주시', false));
    detailMarkers.push(addLabelToMap([35.97222, 128.93000], '영천시', false));
    detailMarkers.push(addLabelToMap([36.58611, 128.51361], '예천군', false));
    detailMarkers.push(addLabelToMap([37.50222, 130.86556], '울릉군', false));
    detailMarkers.push(addLabelToMap([36.99444, 129.40000], '울진군', false));
    detailMarkers.push(addLabelToMap([36.36861, 128.75611], '의성군', false));
    detailMarkers.push(addLabelToMap([35.65694, 128.73028], '청도군', false));
    detailMarkers.push(addLabelToMap([36.43889, 129.05778], '청송군', false));
    detailMarkers.push(addLabelToMap([36.00222, 128.39750], '칠곡군', false));
    detailMarkers.push(addLabelToMap([36.03972, 129.36528], '포항시', false));

    // 광주광역시 (Gwangju Metropolitan City)
    detailMarkers.push(addLabelToMap([35.16109, 126.79090], '광산구', false));
    detailMarkers.push(addLabelToMap([35.12740, 126.90380], '남구', false));
    detailMarkers.push(addLabelToMap([35.14815, 126.91896], '동구', false));
    detailMarkers.push(addLabelToMap([35.18730, 126.90290], '북구', false));
    detailMarkers.push(addLabelToMap([35.14819, 126.85293], '서구', false));

    // 대구광역시 (Daegu Metropolitan City)
    detailMarkers.push(addLabelToMap([36.31349, 128.57147], '군위군', false));
    detailMarkers.push(addLabelToMap([35.84549, 128.58661], '남구', false));
    detailMarkers.push(addLabelToMap([35.85108, 128.52046], '달서구', false));
    detailMarkers.push(addLabelToMap([35.77607, 128.43577], '달성군', false));
    detailMarkers.push(addLabelToMap([35.88566, 128.62625], '동구', false));
    detailMarkers.push(addLabelToMap([35.90000, 128.59175], '북구', false));
    detailMarkers.push(addLabelToMap([35.87465, 128.55109], '서구', false));
    detailMarkers.push(addLabelToMap([35.85905, 128.62625], '수성구', false));
    detailMarkers.push(addLabelToMap([35.86678, 128.59538], '중구', false));

    // 대전광역시 (Daejeon Metropolitan City)
    detailMarkers.push(addLabelToMap([36.37582, 127.42525], '대덕구', false));
    detailMarkers.push(addLabelToMap([36.32765, 127.43323], '동구', false));
    detailMarkers.push(addLabelToMap([36.35174, 127.38555], '서구', false));
    detailMarkers.push(addLabelToMap([36.36195, 127.33923], '유성구', false));
    detailMarkers.push(addLabelToMap([36.32630, 127.42171], '중구', false));

    // 부산광역시 (Busan Metropolitan City)
    detailMarkers.push(addLabelToMap([35.21043, 128.98399], '강서구', false));
    detailMarkers.push(addLabelToMap([35.24220, 129.09117], '금정구', false));
    detailMarkers.push(addLabelToMap([35.24161, 129.21321], '기장군', false));
    detailMarkers.push(addLabelToMap([35.13883, 129.09919], '남구', false));
    detailMarkers.push(addLabelToMap([35.13523, 129.03929], '동구', false));
    detailMarkers.push(addLabelToMap([35.20163, 129.08866], '동래구', false));
    detailMarkers.push(addLabelToMap([35.16664, 129.05060], '부산진구', false));
    detailMarkers.push(addLabelToMap([35.21980, 129.00684], '북구', false));
    detailMarkers.push(addLabelToMap([35.15174, 128.98189], '사상구', false));
    detailMarkers.push(addLabelToMap([35.10543, 128.96677], '사하구', false));
    detailMarkers.push(addLabelToMap([35.09761, 129.02324], '서구', false));
    detailMarkers.push(addLabelToMap([35.16851, 129.11306], '수영구', false));
    detailMarkers.push(addLabelToMap([35.17646, 129.07921], '연제구', false));
    detailMarkers.push(addLabelToMap([35.09914, 129.05581], '영도구', false));
    detailMarkers.push(addLabelToMap([35.10565, 129.03152], '중구', false));
    detailMarkers.push(addLabelToMap([35.16335, 129.16362], '해운대구', false));

    // 울산광역시 (Ulsan Metropolitan City)
    detailMarkers.push(addLabelToMap([35.53846, 129.31139], '남구', false));
    detailMarkers.push(addLabelToMap([35.51737, 129.41873], '동구', false));
    detailMarkers.push(addLabelToMap([35.58079, 129.36217], '북구', false));
    detailMarkers.push(addLabelToMap([35.55620, 129.17641], '울주군', false));
    detailMarkers.push(addLabelToMap([35.56061, 129.32049], '중구', false));

    // 인천광역시 (Incheon Metropolitan City)
    detailMarkers.push(addLabelToMap([37.74833, 126.41722], '강화군', false));
    detailMarkers.push(addLabelToMap([37.53818, 126.73693], '계양구', false));
    detailMarkers.push(addLabelToMap([37.47881, 126.63725], '동구', false));
    detailMarkers.push(addLabelToMap([37.46231, 126.66649], '미추홀구', false));
    detailMarkers.push(addLabelToMap([37.44754, 126.72120], '남동구', false));
    detailMarkers.push(addLabelToMap([37.50884, 126.72478], '부평구', false));
    detailMarkers.push(addLabelToMap([37.54289, 126.66258], '서구', false));
    detailMarkers.push(addLabelToMap([37.40939, 126.67812], '연수구', false));
    detailMarkers.push(addLabelToMap([37.45626, 126.70521], '옹진군', false));
    detailMarkers.push(addLabelToMap([37.47353, 126.62151], '중구', false));

    // 강원특별자치도 (Gangwon State)
    detailMarkers.push(addLabelToMap([37.75189, 128.87617], '강릉시', false));
    detailMarkers.push(addLabelToMap([38.37563, 128.46872], '고성군', false));
    detailMarkers.push(addLabelToMap([37.52556, 129.11667], '동해시', false));
    detailMarkers.push(addLabelToMap([37.44521, 129.16781], '삼척시', false));
    detailMarkers.push(addLabelToMap([38.20455, 128.59122], '속초시', false));
    detailMarkers.push(addLabelToMap([38.09333, 127.99417], '양구군', false));
    detailMarkers.push(addLabelToMap([38.07722, 128.61806], '양양군', false));
    detailMarkers.push(addLabelToMap([37.18667, 128.46194], '영월군', false));
    detailMarkers.push(addLabelToMap([37.34184, 127.92083], '원주시', false));
    detailMarkers.push(addLabelToMap([38.08278, 128.16750], '인제군', false));
    detailMarkers.push(addLabelToMap([37.38889, 128.66556], '정선군', false));
    detailMarkers.push(addLabelToMap([38.14917, 127.31972], '철원군', false));
    detailMarkers.push(addLabelToMap([37.88147, 127.72911], '춘천시', false));
    detailMarkers.push(addLabelToMap([37.16568, 128.98667], '태백시', false));
    detailMarkers.push(addLabelToMap([37.37194, 128.39722], '평창군', false));
    detailMarkers.push(addLabelToMap([37.88500, 127.88889], '홍천군', false));
    detailMarkers.push(addLabelToMap([38.10667, 127.70889], '화천군', false));
    detailMarkers.push(addLabelToMap([37.49306, 127.98583], '횡성군', false));

    // 충청북도 (Chungcheongbuk-do)
    detailMarkers.push(addLabelToMap([36.81500, 127.79528], '괴산군', false));
    detailMarkers.push(addLabelToMap([36.98306, 128.36972], '단양군', false));
    detailMarkers.push(addLabelToMap([36.48583, 127.73667], '보은군', false));
    detailMarkers.push(addLabelToMap([36.17444, 127.78806], '영동군', false));
    detailMarkers.push(addLabelToMap([36.30472, 127.57528], '옥천군', false));
    detailMarkers.push(addLabelToMap([36.95306, 127.67444], '음성군', false));
    detailMarkers.push(addLabelToMap([37.13500, 128.20694], '제천시', false));
    detailMarkers.push(addLabelToMap([36.78778, 127.57722], '증평군', false));
    detailMarkers.push(addLabelToMap([36.86472, 127.43972], '진천군', false));
    detailMarkers.push(addLabelToMap([36.64250, 127.48972], '청주시', false));
    detailMarkers.push(addLabelToMap([36.99167, 127.92750], '충주시', false));

    // 충청남도 (Chungcheongnam-do)
    detailMarkers.push(addLabelToMap([36.23722, 127.24083], '계룡시', false));
    detailMarkers.push(addLabelToMap([36.47889, 127.12611], '공주시', false));
    detailMarkers.push(addLabelToMap([36.10472, 127.48750], '금산군', false));
    detailMarkers.push(addLabelToMap([36.20889, 127.09444], '논산시', false));
    detailMarkers.push(addLabelToMap([36.89278, 126.60806], '당진시', false));
    detailMarkers.push(addLabelToMap([36.39861, 126.61944], '보령시', false));
    detailMarkers.push(addLabelToMap([36.29167, 126.91472], '부여군', false));
    detailMarkers.push(addLabelToMap([36.78028, 126.44972], '서산시', false));
    detailMarkers.push(addLabelToMap([36.08278, 126.69056], '서천군', false));
    detailMarkers.push(addLabelToMap([36.78639, 127.00222], '아산시', false));
    detailMarkers.push(addLabelToMap([36.68500, 126.84028], '예산군', false));
    detailMarkers.push(addLabelToMap([36.81417, 127.11333], '천안시', false));
    detailMarkers.push(addLabelToMap([36.45222, 126.98083], '청양군', false));
    detailMarkers.push(addLabelToMap([36.74500, 126.30972], '태안군', false));
    detailMarkers.push(addLabelToMap([36.60139, 126.66694], '홍성군', false));

    // 전북특별자치도 (Jeonbuk Special Self-Governing Province)
    detailMarkers.push(addLabelToMap([35.43306, 126.70889], '고창군', false));
    detailMarkers.push(addLabelToMap([35.96917, 126.68361], '군산시', false));
    detailMarkers.push(addLabelToMap([35.80000, 126.89056], '김제시', false));
    detailMarkers.push(addLabelToMap([35.40278, 127.38750], '남원시', false));
    detailMarkers.push(addLabelToMap([36.00222, 127.67139], '무주군', false));
    detailMarkers.push(addLabelToMap([35.73028, 126.73306], '부안군', false));
    detailMarkers.push(addLabelToMap([35.37806, 127.13944], '순창군', false));
    detailMarkers.push(addLabelToMap([35.87500, 127.13472], '완주군', false));
    detailMarkers.push(addLabelToMap([35.94722, 126.94722], '익산시', false));
    detailMarkers.push(addLabelToMap([35.61778, 127.28861], '임실군', false));
    detailMarkers.push(addLabelToMap([35.61667, 127.53028], '장수군', false));
    detailMarkers.push(addLabelToMap([35.82000, 127.10861], '전주시', false));
    detailMarkers.push(addLabelToMap([35.56861, 126.85056], '정읍시', false));
    detailMarkers.push(addLabelToMap([35.82417, 127.42472], '진안군', false));

    // 전라남도 (Jeollanam-do)
    detailMarkers.push(addLabelToMap([34.58778, 126.76444], '강진군', false));
    detailMarkers.push(addLabelToMap([34.60639, 127.28722], '고흥군', false));
    detailMarkers.push(addLabelToMap([35.30278, 127.28194], '곡성군', false));
    detailMarkers.push(addLabelToMap([34.94056, 127.69750], '광양시', false));
    detailMarkers.push(addLabelToMap([35.20167, 127.46417], '구례군', false));
    detailMarkers.push(addLabelToMap([35.02500, 126.71694], '나주시', false));
    detailMarkers.push(addLabelToMap([35.31306, 126.99722], '담양군', false));
    detailMarkers.push(addLabelToMap([34.81056, 126.39167], '목포시', false));
    detailMarkers.push(addLabelToMap([34.99611, 126.47639], '무안군', false));
    detailMarkers.push(addLabelToMap([34.76722, 127.10639], '보성군', false));
    detailMarkers.push(addLabelToMap([34.94917, 127.48972], '순천시', false));
    detailMarkers.push(addLabelToMap([34.80556, 126.37750], '신안군', false));
    detailMarkers.push(addLabelToMap([34.76000, 127.66278], '여수시', false));
    detailMarkers.push(addLabelToMap([35.28917, 126.50528], '영광군', false));
    detailMarkers.push(addLabelToMap([34.78250, 126.69056], '영암군', false));
    detailMarkers.push(addLabelToMap([34.30500, 126.75889], '완도군', false));
    detailMarkers.push(addLabelToMap([35.30583, 126.78778], '장성군', false));
    detailMarkers.push(addLabelToMap([34.68556, 126.91444], '장흥군', false));
    detailMarkers.push(addLabelToMap([34.41722, 126.26250], '진도군', false));
    detailMarkers.push(addLabelToMap([35.08333, 126.54111], '함평군', false));
    detailMarkers.push(addLabelToMap([34.56833, 126.58917], '해남군', false));
    detailMarkers.push(addLabelToMap([35.08639, 126.99306], '화순군', false));
    
    // 줌 레벨에 따라 마커 표시/숨김 처리
    updateMarkerVisibility();
    map.on('zoomend', updateMarkerVisibility);
    
    // 지역별 GeoJSON 레이어 로드 (초기에는 숨김)
    loadRegionBoundary('강원특별자치도');
    loadRegionBoundary('부산광역시');
    loadRegionBoundary('울산광역시');
    
    // 하위 호환성을 위해 강원도 레이어도 로드
    loadGangwonBoundary();
}

// 지역 경계 GeoJSON 로드 및 표시
function loadRegionBoundary(regionName) {
    if (!map) return;
    
    // 지역명을 파일명으로 변환
    const fileNameMap = {
        '강원특별자치도': 'hangjeongdong_Gangwon.geojson',
        '부산광역시': 'hangjeongdong_Busan.geojson',
        '울산광역시': 'hangjeongdong_Ulsan.geojson',
        '서울특별시': 'hangjeongdong_Seoul.geojson',
        '경기도': 'hangjeongdong_Gyeonggi.geojson',
        '경상남도': 'hangjeongdong_Gyeongsangnam.geojson',
        '경상북도': 'hangjeongdong_Gyeongsangbuk.geojson',
        '광주광역시': 'hangjeongdong_Gwangju.geojson',
        '대구광역시': 'hangjeongdong_Daegu.geojson',
        '대전광역시': 'hangjeongdong_Daejeon.geojson',
        '세종특별자치시': 'hangjeongdong_Sejong.geojson',
        '인천광역시': 'hangjeongdong_Incheon.geojson',
        '전북특별자치도': 'hangjeongdong_Jeollabuk.geojson',
        '충청남도': 'hangjeongdong_Chungcheongnam.geojson',
        '충청북도': 'hangjeongdong_Chungcheongbuk.geojson',
        '전라남도': 'hangjeongdong_Jeollanam.geojson'
    };
    
    const fileName = fileNameMap[regionName];
    if (!fileName) {
        console.log('지원하지 않는 지역:', regionName);
        return;
    }
    
    // GeoJSON 파일 로드 
    const basePath = window.location.pathname.split('/').slice(0, -1).join('/') || '';
    fetch(`${basePath}/geojson_file/${fileName}`)
        .then(response => response.json())
        .then(data => {
            // 기존 레이어가 있으면 제거
            if (regionLayers[regionName]) {
                map.removeLayer(regionLayers[regionName]);
            }
            
            // CSS 변수에서 secondary-color 가져오기
            const rootStyle = getComputedStyle(document.documentElement);
            const secondaryColor = rootStyle.getPropertyValue('--secondary-color').trim() || '#e74c3c';
            
            // GeoJSON 레이어 생성 - 경계선 없이 채우기만
            const layer = L.geoJSON(data, {
                style: {
                    color: 'transparent', // 경계선 제거
                    fillColor: secondaryColor,
                    fillOpacity: 1.0, // 단색 채우기
                    weight: 0, // 경계선 두께 0
                    opacity: 1.0
                }
            });
            
            layer.addTo(map);
            // 초기에는 숨김
            layer.setStyle({ opacity: 0, fillOpacity: 0 });
            
            // 레이어 저장
            regionLayers[regionName] = layer;
            
            // 하위 호환성: 강원도인 경우 gangwonLayer에도 저장
            if (regionName === '강원특별자치도') {
                gangwonLayer = layer;
            }
        })
        .catch(error => {
            console.log(`${regionName} GeoJSON 로드 실패:`, error);
        });
}

// 강원도 경계 GeoJSON 로드 및 표시 (하위 호환성)
function loadGangwonBoundary() {
    loadRegionBoundary('강원특별자치도');
}

// 강원도 강조 표시/숨김 (하위 호환성)
function showGangwonHighlight(show) {
    if (show) {
        showRegionHighlight(['강원특별자치도']);
    } else {
        hideRegionHighlight(['강원특별자치도']);
    }
}

// 여러 지역 강조 표시/숨김
function showRegionHighlight(regionNames, highlightColor = null) {
    if (!Array.isArray(regionNames)) {
        regionNames = [regionNames];
    }
    
    // 공유 시작 시간 초기화 (새로 시작할 때)
    if (sharedAnimationStartTime === null) {
        sharedAnimationStartTime = performance.now();
    }
    
    regionNames.forEach(regionName => {
        const layer = regionLayers[regionName];
        if (!layer) {
            // 레이어가 아직 로드되지 않았으면 다시 시도
            loadRegionBoundary(regionName);
            setTimeout(() => {
                if (regionLayers[regionName]) {
                    showRegionHighlight([regionName], highlightColor);
                }
            }, 500);
            return;
        }
        
        // 기존 애니메이션 중지
        if (regionAnimationIds[regionName]) {
            cancelAnimationFrame(regionAnimationIds[regionName]);
            regionAnimationIds[regionName] = null;
        }
        
        const rootStyle = getComputedStyle(document.documentElement);
        // highlightColor가 제공되면 사용, 아니면 기본 secondary-color 사용
        const color = highlightColor || rootStyle.getPropertyValue('--secondary-color').trim() || '#e74c3c';
        
        // 애니메이션 시작 (공유 시작 시간 사용)
        const duration = 3000; // 3초 주기
        const minOpacity = 0.4; // 최소 투명도
        const maxOpacity = 0.8; // 최대 투명도
        
        function animate(timestamp) {
            const elapsed = timestamp - sharedAnimationStartTime;
            const progress = ((elapsed % duration) / duration);
            
            // 사인파를 사용하여 부드러운 깜빡임 효과
            const opacity = minOpacity + (maxOpacity - minOpacity) * (Math.sin(progress * Math.PI * 2) * 0.5 + 0.5);
            
            layer.setStyle({
                fillColor: color,
                fillOpacity: opacity,
                opacity: opacity
            });
            
            regionAnimationIds[regionName] = requestAnimationFrame(animate);
        }
        
        regionAnimationIds[regionName] = requestAnimationFrame(animate);
    });
}

// 여러 지역 강조 숨김
function hideRegionHighlight(regionNames) {
    if (!Array.isArray(regionNames)) {
        regionNames = [regionNames];
    }
    
    regionNames.forEach(regionName => {
        const layer = regionLayers[regionName];
        if (layer) {
            // 애니메이션 중지
            if (regionAnimationIds[regionName]) {
                cancelAnimationFrame(regionAnimationIds[regionName]);
                regionAnimationIds[regionName] = null;
            }
            
            // 스타일 초기화 (투명하게)
            layer.setStyle({
                fillColor: 'transparent',
                fillOpacity: 0,
                opacity: 0
            });
        }
    });
    
    // 모든 애니메이션이 중지되었는지 확인하고, 공유 시작 시간 초기화
    const hasActiveAnimation = Object.values(regionAnimationIds).some(id => id !== null);
    if (!hasActiveAnimation) {
        sharedAnimationStartTime = null;
    }
}

// 줌 레벨에 따라 마커 표시/숨김 처리 함수
function updateMarkerVisibility() {
    const currentZoom = map.getZoom();
    const showDetails = currentZoom >= DETAIL_ZOOM_LEVEL;
    
    // 시/도 급 마커: 확대 시 숨김
    provinceMarkers.forEach(marker => {
        if (marker && marker.getElement()) {
            marker.getElement().style.display = showDetails ? 'none' : 'block';
        }
    });
    
    // 세부 지역 마커: 확대 시 표시
    detailMarkers.forEach(marker => {
        if (marker && marker.getElement()) {
            marker.getElement().style.display = showDetails ? 'block' : 'none';
        }
    });
}

// 라벨 아이콘을 생성하는 함수 (HTML/CSS 스타일을 적용)
const createCustomLabelIcon = (text) => L.divIcon({
    className: 'custom-minimap-label', // 2단계에서 정의한 CSS 클래스
    html: text,
    iconSize: [100, 20], // 아이콘 영역 크기
    iconAnchor: [50, 10] // 라벨 중앙을 기준으로 배치
});

// 특정 좌표에 라벨을 마커로 추가하는 함수
function addLabelToMap(latlng, text, isProvince = false) {
    const icon = createCustomLabelIcon(text);
    // 메인 맵에 마커로 추가하여 텍스트를 표시합니다.
    const marker = L.marker(latlng, { icon: icon, interactive: false });
    
    // 초기 표시 상태 설정
    if (isProvince) {
        // 시/도 급은 기본적으로 표시
        marker.addTo(map);
    } else {
        // 세부 지역은 기본적으로 숨김
        marker.addTo(map);
        marker.getElement().style.display = 'none';
    }
    
    return marker;
}

