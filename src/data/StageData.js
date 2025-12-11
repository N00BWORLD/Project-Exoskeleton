/**
 * StageData.js - Stage definitions
 */
export const STAGES = [
    {
        id: 0,
        name: '훈련장',
        nameEn: 'Training Ground',
        background: 'bg_zone1',
        enemy: 'enemy_dummy',
        enemyName: 'Training Dummy',
        difficulty: 1.0,
        dropTier: 1,
        unlocked: true,
        requiredClears: 0
    },
    {
        id: 1,
        name: '폐공장',
        nameEn: 'Abandoned Factory',
        background: 'bg_zone2',
        enemy: 'enemy_robot',
        enemyName: 'Broken Robot',
        difficulty: 1.5,
        dropTier: 2,
        unlocked: false,
        requiredClears: 3 // Need 3 clears to unlock
    },
    {
        id: 2,
        name: '지하시설',
        nameEn: 'Underground Facility',
        background: 'bg_zone3',
        enemy: 'enemy_mech',
        enemyName: 'Security Mech',
        difficulty: 2.0,
        dropTier: 3,
        unlocked: false,
        requiredClears: 10
    },
    {
        id: 3,
        name: '연구소',
        nameEn: 'Research Lab',
        background: 'bg_zone4',
        enemy: 'enemy_proto',
        enemyName: 'Prototype',
        difficulty: 3.0,
        dropTier: 4,
        unlocked: false,
        requiredClears: 20
    }
];
