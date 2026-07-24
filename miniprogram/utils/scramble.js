// miniprogram/utils/scramble.js

const MOVES = {
    "3x3": ["U", "D", "L", "R", "F", "B"],
    "2x2": ["U", "R", "F"],
    "4x4": ["U", "D", "L", "R", "F", "B", "Uw", "Dw", "Lw", "Rw", "Fw", "Bw"],
    "5x5": ["U", "D", "L", "R", "F", "B", "Uw", "Dw", "Lw", "Rw", "Fw", "Bw"],
    "Pyraminx": ["U", "L", "R", "B"],
    "Skewb": ["U", "L", "R", "B"],
    "Megaminx": ["R", "D"]
};

const SUFFIXES = {
    "3x3": ["", "'", "2"],
    "2x2": ["", "'", "2"],
    "4x4": ["", "'", "2"],
    "5x5": ["", "'", "2"],
    "Pyraminx": ["", "'"],
    "Skewb": ["", "'"],
    "Megaminx": ["++", "--"]
};

function generateScramble(puzzleType = '3x3') {
    if (puzzleType === 'Clock') {
        return generateClockScramble();
    }
    if (puzzleType === 'SQ1') {
        return generateSQ1Scramble();
    }

    const typeKey = MOVES[puzzleType] ? puzzleType : '3x3';
    const movesList = MOVES[typeKey];
    const suffixList = SUFFIXES[typeKey];
    
    let length = 20;
    if (puzzleType === '2x2') length = 11;
    if (puzzleType === '4x4') length = 40;
    if (puzzleType === '5x5') length = 60;
    if (puzzleType === 'Pyraminx') length = 11;
    if (puzzleType === 'Skewb') length = 11;
    if (puzzleType === 'Megaminx') return generateMegaminxScramble();

    const result = [];
    let lastAxis = -1;

    for (let i = 0; i < length; i++) {
        let axisIndex;
        do {
            axisIndex = Math.floor(Math.random() * movesList.length);
        } while (Math.floor(axisIndex / 2) === Math.floor(lastAxis / 2) && movesList.length > 3);

        lastAxis = axisIndex;
        const move = movesList[axisIndex];
        const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];
        result.push(move + suffix);
    }

    // 金字塔小角块打乱补充
    if (puzzleType === 'Pyraminx') {
        const tips = ['u', 'l', 'r', 'b'];
        tips.forEach(tip => {
            if (Math.random() > 0.4) {
                const s = Math.random() > 0.5 ? "" : "'";
                result.push(tip + s);
            }
        });
    }

    return result.join(' ');
}

function generateMegaminxScramble() {
    const lines = [];
    for (let r = 0; r < 7; r++) {
        const line = [];
        for (let i = 0; i < 10; i++) {
            const move = (i % 2 === 0) ? 'R' : 'D';
            const suffix = Math.random() > 0.5 ? '++' : '--';
            line.push(move + suffix);
        }
        const uSuffix = Math.random() > 0.5 ? "U" : "U'";
        line.push(uSuffix);
        lines.push(line.join(' '));
    }
    return lines.join('\n');
}

function generateSQ1Scramble() {
    const seq = [];
    const length = 12;
    for (let i = 0; i < length; i++) {
        const top = Math.floor(Math.random() * 12) - 5;
        const bot = Math.floor(Math.random() * 12) - 5;
        seq.push(`(${top},${bot})`);
        seq.push('/');
    }
    return seq.join(' ');
}

function generateClockScramble() {
    const pins = ['UR', 'DR', 'DL', 'UL', 'U', 'R', 'D', 'L', 'ALL'];
    const seq = [];
    pins.forEach(pin => {
        const val = Math.floor(Math.random() * 12) - 5;
        const sign = val >= 0 ? '+' : '';
        seq.push(`${pin}${sign}${val}`);
    });
    seq.push('y2');
    const pinsBack = ['U', 'R', 'D', 'L', 'ALL'];
    pinsBack.forEach(pin => {
        const val = Math.floor(Math.random() * 12) - 5;
        const sign = val >= 0 ? '+' : '';
        seq.push(`${pin}${sign}${val}`);
    });
    // 随机独立打乱按键 (Pin 状态)
    const corners = ['UR', 'DR', 'DL', 'UL'];
    const activePins = [];
    corners.forEach(c => {
        if (Math.random() > 0.5) activePins.push(c);
    });
    if (activePins.length > 0) {
        seq.push(activePins.join(' '));
    }
    return seq.join(' ');
}

module.exports = {
    generateScramble
};
