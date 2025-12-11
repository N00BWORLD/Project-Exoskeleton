# Project-Exoskeleton: Iron & Bone

> 로봇 파츠 수집형 오토배틀 모바일 게임

---

## 📁 파일 구조

```
c:/AG/game/
├── index.html              # HTML 진입점
├── style.css               # 모바일 레이아웃 (9:16)
├── README.md               # 프로젝트 개요
│
├── assets/
│   └── images/             # 이미지 에셋
│       ├── bg_zone1.png    # 배경
│       ├── enemy_dummy.png # 적 스프라이트
│       ├── hero_head.png   # 히어로 파츠 (6개)
│       ├── hero_chest.png
│       ├── hero_arm_l.png
│       ├── hero_arm_r.png
│       ├── hero_leg_l.png
│       ├── hero_leg_r.png
│       └── ui_battery.png  # UI 아이콘
│
└── src/
    ├── main.js             # 게임 진입점 (~155줄)
    │
    ├── core/
    │   └── Lang.js         # 다국어 시스템
    │
    ├── data/
    │   ├── TextData.js     # 로컬라이즈 텍스트
    │   └── GameConfig.js   # 밸런스 설정값
    │
    ├── engine/
    │   ├── Renderer.js     # Canvas 래퍼
    │   ├── Bone.js         # 뼈대 노드 (행렬 연산)
    │   ├── Skeleton.js     # 6-파츠 캐릭터 렌더링
    │   ├── SpriteManager.js# 이미지 로더
    │   └── SoundManager.js # 사운드 (Web Audio)
    │
    └── game/
        ├── systems/
        │   ├── BatteryManager.js  # 턴(30) 관리
        │   ├── ZoneManager.js     # 스테이지 진행
        │   ├── GridSystem.js      # 인벤토리 & 5-머지
        │   ├── CodexManager.js    # 도감 (발견/마스터)
        │   └── BattleSystem.js    # 오토배틀 로직
        │
        └── ui/
            ├── UIManager.js       # 모든 렌더링 (~190줄)
            └── InputManager.js    # 입력 처리 (~55줄)
```

---

## 🎮 핵심 시스템

| 시스템 | 파일 | 역할 |
|--------|------|------|
| **Game Loop** | `main.js` | 60fps 고정 타임스텝 |
| **렌더링** | `UIManager.js` | 배경, 적, 히어로, HUD, 그리드 |
| **입력** | `InputManager.js` | 터치, 버튼, 디버그 키 |
| **배틀** | `BattleSystem.js` | 턴제 자동 전투 |
| **진행** | `ZoneManager.js` | 존 이동, 드롭 티어 |
| **수집** | `CodexManager.js` | 발견 → 마스터리 |
| **캐릭터** | `Skeleton.js` | 6-파츠 구조 렌더링 |

---

## 🗺️ 개발 로드맵

### ✅ Phase 1: 엔진 기반 (완료)
- [x] Bone/Skeleton 시스템
- [x] 렌더러 & 스프라이트 매니저
- [x] 다국어 시스템

### ✅ Phase 2: 게임 루프 (완료)
- [x] 30턴 배터리 시스템
- [x] 존 진행 & 드롭 테이블
- [x] 도감 시스템 (발견/마스터)
- [x] 5-머지 로직

### ✅ Phase 3: 오토배틀 (완료)
- [x] 스탯 계산 (코덱스 기반)
- [x] 전투 루프 (공격-대기-방어)
- [x] 시각 피드백 (흔들림, 텍스트)
- [x] 사운드 연동

### ✅ Phase 4: 리팩토링 (완료)
- [x] main.js 분리 (425줄 → 155줄)
- [x] UIManager 추출
- [x] InputManager 추출

### 🔲 Phase 5: 콘텐츠 확장 (예정)
- [ ] 추가 존 (Zone 2, 3, 4)
- [ ] 다양한 적 타입
- [ ] 장비 시스템 (무기/방어구)
- [ ] 보스전

### 🔲 Phase 6: 최종 마무리 (예정)
- [ ] 이미지 에셋 정리 (배경 제거)
- [ ] 사운드 에셋 추가
- [ ] 밸런스 조정
- [ ] 배포 (GitHub Pages)

---

## ⌨️ 디버그 키

| 키 | 동작 |
|----|------|
| `Z` | 보스 클리어 (존+1, 턴+10) |
| `R` | 리셋 (존, 턴, 그리드 초기화) |
| `C` | 현재 티어 언락 (치트) |

---

## 📊 밸런스 설정 (`GameConfig.js`)

```javascript
BATTLE_CONFIG = {
    TURN_COST_ENTRY: 1,      // 전투 시작 비용
    TURN_COST_PENALTY: 2,    // 패배 추가 페널티
    ENEMY_BASE_HP: 80,
    ENEMY_BASE_ATK: 10,
    TURN_DURATION_MS: 500
}

MASTERY_BONUS = {
    maxHP: 50,    // 티어당 HP 증가
    atk: 10,      // 티어당 공격력 증가
    crit: 1,      // 티어당 크리티컬%
    loot: 1       // 티어당 드롭률%
}
```

---

## 🚀 실행 방법

```bash
cd c:/AG/game
python -m http.server 8080
# 브라우저에서 http://localhost:8080 접속
```
