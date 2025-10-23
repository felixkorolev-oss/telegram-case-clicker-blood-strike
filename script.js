class CaseClickerGame {
    constructor() {
        this.coins = 100;
        this.level = 1;
        this.clickPower = 1;
        this.autoClicker = false;
        this.autoClickInterval = null;
        
        this.init();
    }
    
    init() {
        this.loadGame();
        this.setupEventListeners();
        this.initTelegram();
        this.updateUI();
    }
    
    initTelegram() {
        // Инициализация Telegram Web App
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        // Установка цвета темы
        document.documentElement.style.setProperty('--tg-theme-bg-color', Telegram.WebApp.backgroundColor);
        document.documentElement.style.setProperty('--tg-theme-text-color', Telegram.WebApp.textColor);
    }
    
    setupEventListeners() {
        // Клик по основной кнопке
        document.getElementById('clickBtn').addEventListener('click', () => {
            this.addCoins(this.clickPower);
            this.animateClick();
        });
        
        // Открытие кейсов
        document.querySelectorAll('.case-item').forEach(caseItem => {
            caseItem.addEventListener('click', () => {
                const price = parseInt(caseItem.dataset.price);
                this.openCase(price, caseItem.dataset.reward);
            });
        });
        
        // Покупка улучшений
        document.querySelectorAll('.upgrade-item').forEach(upgrade => {
            upgrade.addEventListener('click', () => {
                const cost = parseInt(upgrade.dataset.cost);
                const type = upgrade.dataset.type;
                this.buyUpgrade(cost, type, upgrade);
            });
        });
        
        // Закрытие модального окна
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });
    }
    
    addCoins(amount) {
        this.coins += amount;
        this.checkLevelUp();
        this.updateUI();
        this.saveGame();
    }
    
    animateClick() {
        const btn = document.getElementById('clickBtn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 150);
    }
    
    openCase(price, rewardRange) {
        if (this.coins < price) {
            this.showNotification('Недостаточно монет!');
            return;
        }
        
        this.coins -= price;
        
        // Вычисление награды из диапазона (например "15-25")
        const [min, max] = rewardRange.split('-').map(Number);
        const reward = Math.floor(Math.random() * (max - min + 1)) + min;
        
        // Анимация открытия кейса
        setTimeout(() => {
            this.showReward(reward);
            this.addCoins(reward);
        }, 500);
        
        this.updateUI();
    }
    
    showReward(amount) {
        document.getElementById('rewardAmount').textContent = `+${amount} 🪙`;
        document.getElementById('caseModal').style.display = 'block';
    }
    
    closeModal() {
        document.getElementById('caseModal').style.display = 'none';
    }
    
    buyUpgrade(cost, type, element) {
        if (this.coins < cost) {
            this.showNotification('Недостаточно монет!');
            return;
        }
        
        this.coins -= cost;
        
        switch(type) {
            case 'click':
                this.clickPower += 1;
                element.style.display = 'none';
                this.showNotification('💪 Сила клика увеличена!');
                break;
                
            case 'auto':
                if (!this.autoClicker) {
                    this.autoClicker = true;
                    this.startAutoClicker();
                    element.style.display = 'none';
                    this.showNotification('🤖 Автокликер активирован!');
                }
                break;
        }
        
        this.updateUI();
        this.saveGame();
    }
    
    startAutoClicker() {
        this.autoClickInterval = setInterval(() => {
            this.addCoins(this.clickPower);
        }, 3000); // Каждые 3 секунды
    }
    
    checkLevelUp() {
        const newLevel = Math.floor(this.coins / 100) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.showNotification(`🎉 Новый уровень: ${this.level}!`);
        }
    }
    
    showNotification(message) {
        // Простое уведомление (можно улучшить)
        alert(message);
    }
    
    updateUI() {
        document.getElementById('coins').textContent = this.coins;
        document.getElementById('level').textContent = this.level;
        
        // Обновление отображения улучшений
        document.querySelectorAll('.upgrade-item').forEach(upgrade => {
            const cost = parseInt(upgrade.dataset.cost);
            if (this.coins < cost) {
                upgrade.classList.add('disabled');
            } else {
                upgrade.classList.remove('disabled');
            }
        });
    }
    
    saveGame() {
        const gameData = {
            coins: this.coins,
            level: this.level,
            clickPower: this.clickPower,
            autoClicker: this.autoClicker
        };
        localStorage.setItem('caseClickerSave', JSON.stringify(gameData));
    }
    
    loadGame() {
        const saved = localStorage.getItem('caseClickerSave');
        if (saved) {
            const gameData = JSON.parse(saved);
            this.coins = gameData.coins || 100;
            this.level = gameData.level || 1;
            this.clickPower = gameData.clickPower || 1;
            this.autoClicker = gameData.autoClicker || false;
            
            if (this.autoClicker) {
                this.startAutoClicker();
            }
        }
    }
}

// Запуск игры когда страница загрузится
document.addEventListener('DOMContentLoaded', () => {
    new CaseClickerGame();
});