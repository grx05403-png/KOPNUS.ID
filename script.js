(function() {
    "use strict";

    // DOM Elements
    const reel1 = document.getElementById('reel1');
    const reel2 = document.getElementById('reel2');
    const reel3 = document.getElementById('reel3');
    const spinBtn = document.getElementById('spinBtn');
    const resetBtn = document.getElementById('resetBtn');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const spinCountDisplay = document.getElementById('spinCount');
    const comboDisplay = document.getElementById('comboDisplay');
    const resultDisplay = document.getElementById('resultDisplay');

    // State
    let score = 0;
    let spinCount = 0;
    let combo = 0;
    let isSpinning = false;

    // Fruit list untuk random
    const fruits = ['🍒', '🍋', '🍊', '🍉', '🍇', '🍓'];
    const fruitNames = {
        '🍒': 'Cherry',
        '🍋': 'Lemon',
        '🍊': 'Jeruk',
        '🍉': 'Semangka',
        '🍇': 'Anggur',
        '🍓': 'Strawberry'
    };

    // Poin kombinasi
    const comboPoints = {
        '🍒🍒🍒': 50,
        '🍋🍋🍋': 40,
        '🍊🍊🍊': 30,
        '🍉🍉🍉': 25,
        '🍇🍇🍇': 20,
        '🍓🍓🍓': 15
    };

    // Ambil fruit tengah dari reel
    function getMiddleFruit(reelElement) {
        const inner = reelElement.querySelector('.reel-inner');
        const items = inner.querySelectorAll('.fruit-item');
        // index ke-1 adalah tengah (karena 3 item terlihat)
        return items[1] ? items[1].textContent : '🍒';
    }

    // Set posisi reel dengan animasi
    function setReelPosition(reelElement, targetIndex, duration = 300) {
        const inner = reelElement.querySelector('.reel-inner');
        const itemHeight = 60; // height per item
        const offset = targetIndex * itemHeight;
        inner.style.transition = `transform ${duration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        inner.style.transform = `translateY(-${offset}px)`;
    }

    // Random spin dengan efek
    function spinReel(reelElement, callback) {
        const inner = reelElement.querySelector('.reel-inner');
        const totalItems = inner.querySelectorAll('.fruit-item').length;
        
        // Random posisi akhir (dengan efek berputar beberapa kali)
        const spinCount = 5 + Math.floor(Math.random() * 5); // 5-10 putaran
        const finalIndex = Math.floor(Math.random() * totalItems);
        const totalOffset = (spinCount * totalItems + finalIndex);
        
        const itemHeight = 60;
        const offset = totalOffset * itemHeight;
        
        inner.style.transition = `transform ${800 + Math.random() * 400}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        inner.style.transform = `translateY(-${offset}px)`;
        
        // Panggil callback setelah animasi selesai
        setTimeout(() => {
            // Reset ke posisi yang benar (modulo)
            const normalizedIndex = totalOffset % totalItems;
            const normalizedOffset = normalizedIndex * itemHeight;
            inner.style.transition = 'none';
            inner.style.transform = `translateY(-${normalizedOffset}px)`;
            if (callback) callback(normalizedIndex);
        }, 1200);
    }

    // Cek kombinasi 3 buah
    function checkCombo(fruit1, fruit2, fruit3) {
        const comboKey = fruit1 + fruit2 + fruit3;
        
        // Cek 3 sama
        if (fruit1 === fruit2 && fruit2 === fruit3) {
            const points = comboPoints[comboKey] || 10;
            return {
                isCombo: true,
                points: points,
                message: `🎉 JACKPOT! 3 ${fruitNames[fruit1]}! +${points} poin!`
            };
        }
        
        // Cek 2 sama
        if (fruit1 === fruit2 || fruit2 === fruit3 || fruit1 === fruit3) {
            let matchFruit = fruit1 === fruit2 ? fruit1 : fruit3;
            return {
                isCombo: true,
                points: 5,
                message: `✨ 2 ${fruitNames[matchFruit]} sama! +5 poin`
            };
        }
        
        return {
            isCombo: false,
            points: 0,
            message: `😅 ${fruitNames[fruit1]}, ${fruitNames[fruit2]}, ${fruitNames[fruit3]} - coba lagi!`
        };
    }

    // Main spin function
    function performSpin() {
        if (isSpinning) return;
        isSpinning = true;
        spinBtn.disabled = true;
        spinBtn.textContent = '🌀 Spinning...';
        resultDisplay.textContent = '🌀 Memutar...';

        // Ambil 3 reel
        const reels = [reel1, reel2, reel3];
        let results = [];
        let completed = 0;

        // Spin setiap reel
        reels.forEach((reel, index) => {
            spinReel(reel, (finalIndex) => {
                const fruit = getMiddleFruit(reel);
                results[index] = fruit;
                completed++;
                
                if (completed === 3) {
                    // Semua reel selesai
                    setTimeout(() => {
                        const [f1, f2, f3] = results;
                        const comboResult = checkCombo(f1, f2, f3);
                        
                        // Update skor
                        if (comboResult.isCombo) {
                            score += comboResult.points;
                            combo++;
                            comboDisplay.textContent = combo;
                        }
                        
                        scoreDisplay.textContent = score;
                        spinCount++;
                        spinCountDisplay.textContent = spinCount;
                        
                        // Tampilkan hasil
                        resultDisplay.innerHTML = comboResult.message;
                        
                        // Efek visual untuk jackpot
                        if (comboResult.points >= 30) {
                            resultDisplay.style.color = '#facc15';
                            resultDisplay.style.fontSize = '1.3rem';
                            setTimeout(() => {
                                resultDisplay.style.color = '#fff';
                                resultDisplay.style.fontSize = '1.1rem';
                            }, 2000);
                        } else {
                            resultDisplay.style.color = '#fff';
                            resultDisplay.style.fontSize = '1.1rem';
                        }
                        
                        isSpinning = false;
                        spinBtn.disabled = false;
                        spinBtn.textContent = '🎰 SPIN!';
                    }, 200);
                }
            });
        });
    }

    // Reset game
    function resetGame() {
        if (isSpinning) return;
        
        score = 0;
        spinCount = 0;
        combo = 0;
        
        scoreDisplay.textContent = '0';
        spinCountDisplay.textContent = '0';
        comboDisplay.textContent = '0';
        resultDisplay.innerHTML = '🔄 Skor direset! Tekan SPIN untuk mulai.';
        resultDisplay.style.color = '#fff';
        resultDisplay.style.fontSize = '1.1rem';
        
        // Reset posisi reel ke awal
        [reel1, reel2, reel3].forEach(reel => {
            const inner = reel.querySelector('.reel-inner');
            inner.style.transition = 'none';
            inner.style.transform = 'translateY(0)';
        });
    }

    // Event Listeners
    spinBtn.addEventListener('click', performSpin);
    resetBtn.addEventListener('click', resetGame);

    // Inisialisasi awal
    console.log('🍉 Fruit Spin Game Loaded!');
})();
