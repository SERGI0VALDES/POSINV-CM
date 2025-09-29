const { app, BrowserWindow } = require('electron')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 800
  })

  win.loadFile('src/renderer/dashboard.html')
}

app.whenReady().then(() => {
  createWindow()
})