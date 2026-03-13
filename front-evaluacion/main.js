const { app, BrowserWindow, Menu, shell, dialog, nativeTheme } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Determinar si estamos en desarrollo o producción
const isDev = !app.isPackaged;
const PORT = process.env.PORT || 3000;
const DEV_URL = `http://localhost:${PORT}`;

let mainWindow = null;
let nextProcess = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'ActionMetrics',
    icon: path.join(__dirname, 'public', 'icon-512x512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false, // Mostrar cuando esté listo para evitar flash blanco
  });

  // Mostrar la ventana cuando el contenido esté listo
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abrir links externos en el navegador del sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://localhost') || url.startsWith('file://')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Cargar la app
  if (isDev) {
    mainWindow.loadURL(DEV_URL).catch(() => {
      // Si el servidor dev no está listo, reintentar
      retryLoadURL(mainWindow, DEV_URL);
    });
    // Abrir DevTools en desarrollo
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // En producción, servir Next.js con el servidor standalone
    startNextServer().then((url) => {
      mainWindow.loadURL(url);
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Reintentar cargar la URL (útil cuando next dev aún no está listo)
function retryLoadURL(win, url, retries = 30) {
  let attempts = 0;
  const interval = setInterval(() => {
    if (attempts >= retries) {
      clearInterval(interval);
      dialog.showErrorBox(
        'Error de conexión',
        'No se pudo conectar con el servidor de desarrollo. Asegúrate de que "npm run dev" esté ejecutándose.'
      );
      return;
    }
    attempts++;
    win.loadURL(url).then(() => {
      clearInterval(interval);
    }).catch(() => {
      // Seguir intentando
    });
  }, 1000);
}

// Iniciar el servidor Next.js en producción
function startNextServer() {
  return new Promise((resolve) => {
    const serverPath = path.join(__dirname, '.next', 'standalone', 'server.js');
    nextProcess = spawn(process.execPath, [serverPath], {
      env: {
        ...process.env,
        PORT: String(PORT),
        HOSTNAME: 'localhost',
      },
      stdio: 'pipe',
    });

    nextProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('started')) {
        resolve(`http://localhost:${PORT}`);
      }
    });

    // Timeout: resolver después de 5s si el servidor no emite "Ready"
    setTimeout(() => {
      resolve(`http://localhost:${PORT}`);
    }, 5000);
  });
}

// Crear menú de la aplicación
function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (mainWindow) mainWindow.reload();
          },
        },
        { type: 'separator' },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Deshacer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Rehacer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Pegar', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Seleccionar todo', accelerator: 'CmdOrCtrl+A', role: 'selectAll' },
      ],
    },
    {
      label: 'Vista',
      submenu: [
        {
          label: 'Zoom +',
          accelerator: 'CmdOrCtrl+=',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomFactor();
              mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
            }
          },
        },
        {
          label: 'Zoom -',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            if (mainWindow) {
              const currentZoom = mainWindow.webContents.getZoomFactor();
              mainWindow.webContents.setZoomFactor(Math.max(0.5, currentZoom - 0.1));
            }
          },
        },
        {
          label: 'Zoom original',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            if (mainWindow) mainWindow.webContents.setZoomFactor(1);
          },
        },
        { type: 'separator' },
        {
          label: 'Pantalla completa',
          accelerator: 'F11',
          click: () => {
            if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
          },
        },
        ...(isDev
          ? [
              { type: 'separator' },
              {
                label: 'DevTools',
                accelerator: 'CmdOrCtrl+Shift+I',
                click: () => {
                  if (mainWindow) mainWindow.webContents.toggleDevTools();
                },
              },
            ]
          : []),
      ],
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de ActionMetrics',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de ActionMetrics',
              message: 'ActionMetrics',
              detail: `Versión: ${app.getVersion()}\nPlataforma de evaluación de desempeño y seguimiento de objetivos.\n\nElectron: ${process.versions.electron}\nNode.js: ${process.versions.node}\nChromium: ${process.versions.chrome}`,
            });
          },
        },
      ],
    },
  ];

  // En macOS, agregar el menú de la app
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { label: 'Acerca de ActionMetrics', role: 'about' },
        { type: 'separator' },
        { label: 'Servicios', role: 'services' },
        { type: 'separator' },
        { label: 'Ocultar ActionMetrics', accelerator: 'Cmd+H', role: 'hide' },
        { label: 'Ocultar otros', accelerator: 'Cmd+Alt+H', role: 'hideOthers' },
        { label: 'Mostrar todo', role: 'unhide' },
        { type: 'separator' },
        { label: 'Salir', accelerator: 'Cmd+Q', role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Inicialización de la app
app.whenReady().then(() => {
  createMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Limpiar el proceso de Next.js al cerrar
app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
    nextProcess = null;
  }
});
