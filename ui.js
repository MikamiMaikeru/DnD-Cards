const { ipcRenderer } = require('electron');

// Переключение между главными экранами
const startScreen = document.getElementById('start-screen');
const masterScreen = document.getElementById('master-screen');
const playerScreen = document.getElementById('player-screen');

document.getElementById('btn-master').addEventListener('click', () => {
    switchScreen(masterScreen);
});

document.getElementById('btn-player').addEventListener('click', () => {
    switchScreen(playerScreen);
});

document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (playerCreate.classList.contains('active')) {
            playerCreate.classList.remove('active');
            playerHub.classList.add('active');
        } else {
            switchScreen(startScreen);
        }
    });
});

function switchScreen(targetScreen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    targetScreen.classList.add('active');
}

// Переключение под-экранов внутри Игрока
const playerHub = document.getElementById('player-hub');
const playerCreate = document.getElementById('player-create');
const playerView = document.getElementById('player-view');

document.getElementById('btn-create-char').addEventListener('click', () => {
    playerHub.classList.remove('active');
    playerCreate.classList.add('active');
});

document.getElementById('btn-back-to-hub').addEventListener('click', () => {
    playerCreate.classList.remove('active');
    playerHub.classList.add('active');
});

// Возврат из окна просмотра персонажа обратно в хаб
document.getElementById('btn-unload-char').addEventListener('click', () => {
    playerView.classList.remove('active');
    playerHub.classList.add('active');
});

// Логика сборки данных и отправки на сохранение
document.getElementById('btn-save-char').addEventListener('click', async () => {
    const characterData = {
        name: document.getElementById('char-name').value || "Безымянный",
        class: document.getElementById('char-class').value || "Обыватель 1",
        stats: {
            str: document.getElementById('stat-str').value,
            dex: document.getElementById('stat-dex').value,
            con: document.getElementById('stat-con').value,
            int: document.getElementById('stat-int').value,
            wis: document.getElementById('stat-wis').value,
            cha: document.getElementById('stat-cha').value
        },
        cards: []
    };

    // Отправляем запрос в главный процесс на сохранение
    const result = await ipcRenderer.invoke('save-character-dialog', characterData);

    if (result.success) {
        alert(`Персонаж сохранен!\nФайл: ${result.fileName}`);
        document.getElementById('char-name').value = '';
        document.getElementById('char-class').value = '';
        playerCreate.classList.remove('active');
        playerHub.classList.add('active');
    }
});

// Логика запроса загрузки персонажа
document.getElementById('btn-load-char').addEventListener('click', async () => {
    // Вызываем окно выбора в главном процессе
    const result = await ipcRenderer.invoke('load-character-dialog');

    if (!result.success) return; // Пользователь отменил выбор

    const character = result.data;

    if (!character.name || !character.stats) {
        alert('Неверный формат файла персонажа!');
        return;
    }

    // Отрисовка данных на экране просмотра
    document.getElementById('view-char-name').innerText = character.name;
    document.getElementById('view-char-class').innerText = character.class;
    
    document.getElementById('display-str').innerText = character.stats.str;
    document.getElementById('display-dex').innerText = character.stats.dex; 
    document.getElementById('display-con').innerText = character.stats.con;
    document.getElementById('display-int').innerText = character.stats.int;
    document.getElementById('display-wis').innerText = character.stats.wis;
    document.getElementById('display-cha').innerText = character.stats.cha;

    playerHub.classList.remove('active');
    playerView.classList.add('active');
});
