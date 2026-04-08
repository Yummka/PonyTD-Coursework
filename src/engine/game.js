import Enemy from './entities/Enemy.js';
import Tower from './entities/Tower.js';
import Projectile from './entities/Projectile.js';
import LunaEffect from './entities/LunaEffect.js';
import FloatingText from './entities/FloatingText.js';
import { 
    backgroundImage, TOWER_CONFIG, BUILD_SLOT_SIZE, SELL_REFUND_PERCENTAGE, 
    PAUSE_BETWEEN_GROUPS_MS, ENEMY_TYPES, originalWidth, originalHeight, 
    backgroundMusic, nightMusic, eveningMusic, crystalMusic, LEVEL_START_MONEY, morningMusic,
    pathLevel6, buildSlotsLevel6, path as defaultPath, buildSlots as defaultBuildSlots, LEVELS_CONFIG
} from './config.js';

export default class Game {
    constructor(canvasElement, store) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.store = store; // Сохраняем ссылку на стор Vue
        

        this.originalWidth = originalWidth;
        this.originalHeight = originalHeight;
        
        this.money = 0;
        this.lives = 0;
        this.wave = 0;
        this.currentLevel = 1;

        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.spawnTimeouts = [];
        this.effects = [];
        this.floatingTexts = [];
        
        this.isRunning = false;
        this.isBuilding = false;
        this.isSelling = false;
        this.isPlacingPatrolPoint = false;
        this.patrolTowerRef = null;
        this.selectedTowerType = null;
        this.waveInProgress = false;
        this.allEnemiesScheduled = false;

        this.currentRawPath = defaultPath;
        this.currentRawSlots = JSON.parse(JSON.stringify(defaultBuildSlots));
        this.mouse = { x: 0, y: 0 };
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.setupScaling();
        this.recalculatePositions();

        window.addEventListener('resize', () => {
            this.setupScaling();
            this.recalculatePositions();
        });
                
        this.isBackgroundLoaded = false;
        backgroundImage.onload = () => { this.isBackgroundLoaded = true; };
        
        this.animationId = null;
        this.gameLoop();
    }

    gameLoop() {
        if (this.isRunning) {
            this.update();
            this.draw();
        }
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // 1. Обновление объектов
        this.towers.forEach(tower => tower.update(this.enemies, this.projectiles));
        this.effects.forEach(eff => eff.update(this.enemies));
        this.effects = this.effects.filter(eff => eff.state !== 'finished');
        
        this.projectiles = this.projectiles.filter(projectile => {
            const result = projectile.update(this.scale);
            if (result === true) return false;
            if (result && result.type === 'aoe') {
                this.enemies.forEach(enemy => {
                    const dx = enemy.x - result.x;
                    const dy = enemy.y - result.y;
                    if (Math.sqrt(dx*dx + dy*dy) < projectile.aoeRadius) {
                        enemy.currentHealth -= projectile.damage;
                    }
                });
                return false;
            }
            return true;
        });

        // Чистим врагов
    this.enemies = this.enemies.filter(enemy => {
        if (enemy.isFinished) {
            this.lives -= (enemy.maxHealth > 1000) ? 5 : 1; // Боссы бьют больнее
            return false;
        }
        if (enemy.currentHealth <= 0) {
            this.money += enemy.bounty;
            // Если убили кристалл Сомбры
            if (enemy.type === 'SombraCrystal') {
                const slot = this.scaledBuildSlots.find(s => s.x === enemy.x && s.y === enemy.y);
                if (slot) slot.occupied = false;
                const boss = this.enemies.find(e => e.type === 'KingSombra');
                if (boss) boss.currentHealth -= 2000;
            }
            return false;
        }
        return true;
    });

        this.enemies.forEach(enemy => enemy.update(this.scale));

        // 2. Логика жизней и смерти врагов
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isFinished) {
                this.lives -= 1;
                return false;
            }
            if (enemy.currentHealth <= 0) {
                this.money += enemy.bounty;
                return false;
            }
            return true;
        });

    // В game.js внутри метода update()
    const totalWavesForLevel = LEVELS_CONFIG[this.currentLevel].length;

    if (this.waveInProgress && this.allEnemiesScheduled && this.enemies.length === 0) {
        this.waveInProgress = false;

        if (this.wave >= totalWavesForLevel) {
            this.isRunning = false; 
            
            // Вызываем сохранение через ссылку на стор
            this.store.saveGameResult({
                money: this.money,
                lives: this.lives,
                wave: this.wave
            });

            this.store.showPopup({
                type: 'win',
                title: 'УРОВЕНЬ ПРОЙДЕН!',
                text: `Великолепно! Ты защитила Эквестрию за ${this.store.gameTime} сек.`,
                imgs: ['ЛунаСтоит', 'Флат_стоит']
            });
        }
    }
        // 4. Проверка поражения
        if (this.lives <= 0 && this.wave > 0) {
            this.isRunning = false;
            this.store.showPopup({
                type: 'lose',
                title: 'GAME OVER',
                text: 'Пони отступили... Попробуем еще раз?',
                color: 'text-red-500'
            });
        }
        
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const levelColors = {
            3: '#51323c', 4: '#08141e', 5: '#5e8553', 6: '#494885', default: '#346927'
        };
        this.ctx.fillStyle = levelColors[this.currentLevel] || levelColors.default;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isBackgroundLoaded) {
            this.ctx.drawImage(backgroundImage, this.offsetX, this.offsetY, this.originalWidth * this.scale, this.originalHeight * this.scale);
        }

        if (this.isBuilding || this.isSelling) {
            const size = this.SCALED_BUILD_SLOT_SIZE;
            this.scaledBuildSlots.forEach(slot => {
                if (!slot.occupied) {
                    this.ctx.fillStyle = 'rgba(182, 238, 129, 0.4)';
                    this.ctx.fillRect(slot.x - size/2, slot.y - size/2, size, size);
                }
            });
        }

        this.towers.forEach(tower => tower.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.scale)); 
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.effects.forEach(eff => eff.draw(this.ctx));
        this.drawGhostTower();
    }

    startLevel(levelNumber) {
        this.currentLevel = levelNumber;
        this.stopMusic();
        this.store.startTime = Date.now();

        if (levelNumber === 6) {
            this.currentRawPath = pathLevel6;
            this.currentRawSlots = JSON.parse(JSON.stringify(buildSlotsLevel6));
            backgroundImage.src = '/images/ФПСНкристалл.png';
            this.activeMusic = crystalMusic;
        } else {
            this.currentRawPath = defaultPath;
            this.currentRawSlots = JSON.parse(JSON.stringify(defaultBuildSlots));
            if (levelNumber === 3) { backgroundImage.src = '/images/ФПСНвечер.png'; this.activeMusic = eveningMusic; }
            else if (levelNumber === 4) { backgroundImage.src = '/images/ФПСНночь.png'; this.activeMusic = nightMusic; }
            else if (levelNumber === 5) { backgroundImage.src = '/images/ФПСНутро.png'; this.activeMusic = morningMusic; }
            else { backgroundImage.src = '/images/ФПСН.png'; this.activeMusic = backgroundMusic; }
        }

        this.recalculatePositions();
        this.playMusic();

        this.money = LEVEL_START_MONEY[levelNumber] || 100;
        this.lives = 10;
        this.wave = 0;
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.isRunning = true;
        this.waveInProgress = false;
        this.allEnemiesScheduled = false;
        
        this.spawnTimeouts.forEach(t => clearTimeout(t));
        this.spawnTimeouts = [];
    }

    playMusic() {
        if (this.activeMusic) this.activeMusic.play().catch(() => {});
    }

    stopMusic() {
        [backgroundMusic, nightMusic, eveningMusic, morningMusic, crystalMusic].forEach(m => {
            m.pause(); m.currentTime = 0;
        });
    }

    stop() {
    this.isRunning = false;
    // Останавливаем анимацию
    if (this.animationId) {
        cancelAnimationFrame(this.animationId);
    }
    // Очищаем все таймеры появления врагов
    this.spawnTimeouts.forEach(t => clearTimeout(t));
    this.spawnTimeouts = [];
    this.stopMusic();
}

    startWave() {
        if (this.waveInProgress || !this.isRunning) return;
        this.waveInProgress = true;
        this.wave++;
        
        const waveData = LEVELS_CONFIG[this.currentLevel][this.wave - 1];
        if (!waveData) return;

        let totalToSpawn = 0;
        waveData.enemies.forEach(g => totalToSpawn += g.count);
        let spawned = 0;
        this.allEnemiesScheduled = false;

        waveData.enemies.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                const tId = setTimeout(() => {
                    this.enemies.push(new Enemy(group.type, this.scaledPath));
                    spawned++;
                    if (spawned === totalToSpawn) this.allEnemiesScheduled = true;
                }, i * group.interval);
                this.spawnTimeouts.push(tId);
            }
        });
    }

    // --- ЛОГИКА БОССОВ (ФУНКЦИИ-ТРИГГЕРЫ) ---

triggerNightmareEffect() {
    this.isRunning = false; // Пауза для сообщения
    this.store.showPopup({
        type: 'story',
        title: "ВЕЧНАЯ НОЧЬ!",
        text: "Найтмер Мун здесь! Её темная магия усыпила ваших пони!<br>Они не могут атаковать, пока не проснутся (в следующей волне).",
        img: 'НайтмерМун' // Проверь, чтобы это имя было в config.js
    });

    const activeTowers = this.towers.filter(t => !t.isAsleep);
    activeTowers.sort(() => Math.random() - 0.5);
    const countToSleep = Math.min(activeTowers.length, 10);
    for (let i = 0; i < countToSleep; i++) {
        activeTowers[i].isAsleep = true;
    }
}

triggerChrysalisEffect() {
    this.store.showPopup({
        type: 'story',
        title: "РИТУАЛ ОБОРОТНЕЙ!",
        text: "Кризалис превращает ваших пони в перевертышей! Они покинут свои посты и пойдут против вас!",
        img: 'Кризалис'
    });

    const activeTowers = [...this.towers];
    activeTowers.sort(() => Math.random() - 0.5);
    let count = Math.min(Math.floor(Math.random() * 5) + 5, activeTowers.length);

    for (let i = 0; i < count; i++) {
        activeTowers[i].isTransforming = true;
        activeTowers[i].transformFrame = 0;
    }
}

spawnSombraCrystals() {
    this.store.showPopup({
        type: 'story',
        title: "ТЕМНЫЕ КРИСТАЛЛЫ!",
        text: "Король Сомбра блокирует ваши слоты строительства! Уничтожьте кристаллы, чтобы освободить место и нанести ему урон!",
        img: 'Сомбра'
    });

    const availableSlots = this.scaledBuildSlots.filter(slot => !slot.occupied);
    availableSlots.sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(5, availableSlots.length); i++) {
        const slot = availableSlots[i];
        const crystal = new Enemy('SombraCrystal', []); 
        crystal.x = slot.x;
        crystal.y = slot.y;
        slot.occupied = true;
        this.enemies.push(crystal);
    }
}

    // --- ИСПРАВЛЕННЫЙ СПАВН С ПРОВЕРКОЙ БОССОВ ---

    startWave() {
        if (this.waveInProgress || !this.isRunning) return;
        
        const waveData = LEVELS_CONFIG[this.currentLevel][this.wave];
        if (!waveData) return;

        this.waveInProgress = true;
        this.wave++;
        this.allEnemiesScheduled = false;

        let totalEnemies = 0;
        waveData.enemies.forEach(g => totalEnemies += g.count);
        let spawnedCount = 0;

        waveData.enemies.forEach(group => {
            for (let i = 0; i < group.count; i++) {
                const timerId = setTimeout(() => {
                    const enemy = new Enemy(group.type, this.scaledPath);
                    this.enemies.push(enemy);

                    // --- ПРОВЕРКА НА БОССОВ ---
                    if (enemy.type === 'NightmareMoon') this.triggerNightmareEffect();
                    if (enemy.type === 'Crizalis') this.triggerChrysalisEffect();
                    if (enemy.type === 'KingSombra') this.spawnSombraCrystals();

                    spawnedCount++;
                    if (spawnedCount === totalEnemies) {
                        this.allEnemiesScheduled = true;
                    }
                }, i * group.interval);
                this.spawnTimeouts.push(timerId);
            }
        });
    }

    

    handleCanvasClick(event) {
        const pos = this.getMousePos(event);

        if (this.isPlacingPatrolPoint && this.patrolTowerRef) {
            const nearestSlot = this.findNearestFreeSlot(pos.x, pos.y);
            if (nearestSlot) {
                this.patrolTowerRef.patrolEnd = { x: nearestSlot.x, y: nearestSlot.y };
                nearestSlot.occupied = true;
                this.isPlacingPatrolPoint = false;
                this.patrolTowerRef = null;
                this.store.isPlacingPatrol = false;
            }
            return;
        }

        if (this.isSelling) {
            const towerIndex = this.towers.findIndex(t => Math.sqrt(Math.pow(t.x - pos.x, 2) + Math.pow(t.y - pos.y, 2)) < 40);
            if (towerIndex !== -1) {
                const tower = this.towers[towerIndex];
                this.money += Math.floor(TOWER_CONFIG[tower.type].price * 0.7);
                const slot = this.scaledBuildSlots.find(s => s.x === tower.x && s.y === tower.y);
                if (slot) slot.occupied = false;
                this.towers.splice(towerIndex, 1);
            }
            this.isSelling = false;
            return;
        }

        if (this.isBuilding && this.selectedTowerType) {
            const nearestSlot = this.findNearestFreeSlot(pos.x, pos.y);
            const price = TOWER_CONFIG[this.selectedTowerType].price;
            if (nearestSlot && this.money >= price) {
                this.money -= price;
                const newTower = new Tower(nearestSlot.x, nearestSlot.y, this.selectedTowerType, this);
                this.towers.push(newTower);
                nearestSlot.occupied = true;
                this.isBuilding = false;
                if (newTower.isPatrolTower) {
                    this.isPlacingPatrolPoint = true;
                    this.patrolTowerRef = newTower;
                    this.store.isPlacingPatrol = true;
                }
            }
        }
    }

    handleMouseMove(event) {
        this.mouse = this.getMousePos(event);
    }

    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (event.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (event.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    setupScaling() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.scale = Math.min(this.canvas.width / this.originalWidth, this.canvas.height / this.originalHeight);
        this.offsetX = (this.canvas.width - this.originalWidth * this.scale) / 2;
        this.offsetY = (this.canvas.height - this.originalHeight * this.scale) / 2;
    }

    recalculatePositions() {
        this.SCALED_BUILD_SLOT_SIZE = BUILD_SLOT_SIZE * this.scale;
        this.scaledPath = this.currentRawPath.map(p => this.scaleCoords(p));
        this.scaledBuildSlots = this.currentRawSlots.map(originalSlot => ({
            ...this.scaleCoords(originalSlot), occupied: false
        }));
    }

    scaleCoords(point) {
        return { x: point.x * this.scale + this.offsetX, y: point.y * this.scale + this.offsetY };
    }

    findNearestFreeSlot(mouseX, mouseY) {
        let nearestSlot = null;
        let minDistance = Infinity;
        for (const slot of this.scaledBuildSlots) {
            if (!slot.occupied) {
                const distance = Math.sqrt(Math.pow(slot.x - mouseX, 2) + Math.pow(slot.y - mouseY, 2));
                if (distance < this.SCALED_BUILD_SLOT_SIZE / 2 && distance < minDistance) {
                    minDistance = distance; nearestSlot = slot;
                }
            }
        }
        return nearestSlot;
    }

    drawGhostTower() {
        if (!this.isBuilding || !this.selectedTowerType) return;
        const config = TOWER_CONFIG[this.selectedTowerType];
        const nearestSlot = this.findNearestFreeSlot(this.mouse.x, this.mouse.y);
        if (nearestSlot) {
            const x = nearestSlot.x; const y = nearestSlot.y;
            this.ctx.beginPath();
            this.ctx.arc(x, y, config.range * this.scale, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.fill();
            this.ctx.fillStyle = this.money >= config.price ? 'rgba(170, 255, 170, 0.4)' : 'rgba(255, 170, 170, 0.4)';
            this.ctx.fillRect(x - this.SCALED_BUILD_SLOT_SIZE/2, y - this.SCALED_BUILD_SLOT_SIZE/2, this.SCALED_BUILD_SLOT_SIZE, this.SCALED_BUILD_SLOT_SIZE);
        }
    }

    selectTower(type) { this.isBuilding = true; this.selectedTowerType = type; this.isSelling = false; }
    toggleSellMode() { this.isSelling = !this.isSelling; this.isBuilding = false; }
}