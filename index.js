const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// ОБРАБОТЧИК: Системное окно сохранения файла JSON
ipcMain.handle('save-character-dialog', async (event, characterData) => {
    const homeDir = process.env.USERPROFILE || process.env.HOME;
    const defaultPath = path.join(homeDir, 'Desktop', `${characterData.name.replace(/[^a-zа-я0-9]/gi, '_')}_char.json`);
    
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showSaveDialog(win, {
        title: 'Сохранить персонажа',
        defaultPath: defaultPath,
        filters: [{ name: 'JSON Персонажи', extensions: ['json'] }]
    });

    if (!result.canceled && result.filePath) {
        fs.writeFileSync(result.filePath, JSON.stringify(characterData, null, 4), 'utf-8');
        return { success: true, fileName: path.basename(result.filePath) };
    }
    return { success: false };
});

// ОБРАБОТЧИК: Системное окно загрузки файла JSON
ipcMain.handle('load-character-dialog', async () => {
    const win = BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win, {
        title: 'Выберите файл персонажа (.json)',
        filters: [{ name: 'JSON/Файлы', extensions: ['json'] }],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const fileContent = fs.readFileSync(result.filePaths[0], 'utf-8');
        return { success: true, data: JSON.parse(fileContent) };
    }
    return { success: false };
});
