const { app, BrowserWindow, Menu, shell, dialog, utilityProcess } = require('electron');
const path = require('path');

// Determinar si estamos en desarrollo o producción
const isDev = !app.isPackaged;
const PORT = process.env.PORT || 3000;
const DEV_URL = `http://localhost:${PORT}`;

let mainWindow = null;
let nextProcess = null;

// URLs propias de la app: el servidor Next local (y el backend en localhost)
function isAppUrl(url) {
  try {
    const { protocol, hostname } = new URL(url);
    return (protocol === 'http:' || protocol === 'https:') && (hostname === 'localhost' || hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

// Solo http(s): openExternal con file:// u otros protocolos puede ejecutar programas locales
function openExternalSafe(url) {
  try {
    const { protocol } = new URL(url);
    if (protocol === 'http:' || protocol === 'https:') shell.openExternal(url);
  } catch {
    // URL inválida: ignorar
  }
}

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
    if (isAppUrl(url)) {
      return { action: 'allow' };
    }
    openExternalSafe(url);
    return { action: 'deny' };
  });

  // La ventana principal solo navega dentro de la app; lo demás se abre en el navegador
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isAppUrl(url)) {
      event.preventDefault();
      openExternalSafe(url);
    }
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
      mainWindow.loadURL(url).catch(() => {
        retryLoadURL(mainWindow, url);
      });
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
// El servidor standalone se empaqueta fuera del asar (extraResources -> resources/standalone)
// y se ejecuta con utilityProcess, que usa el Node.js integrado en Electron.
function startNextServer() {
  return new Promise((resolve) => {
    const serverDir = path.join(process.resourcesPath, 'standalone');
    const url = `http://localhost:${PORT}`;
    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve(url);
      }
    };

    nextProcess = utilityProcess.fork(path.join(serverDir, 'server.js'), [], {
      cwd: serverDir,
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(PORT),
        HOSTNAME: 'localhost',
      },
      stdio: 'pipe',
      serviceName: 'ActionMetrics Next.js',
    });

    nextProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('started')) {
        done();
      }
    });

    nextProcess.stderr.on('data', (data) => {
      console.error(`[next] ${data}`);
    });

    nextProcess.on('exit', (code) => {
      nextProcess = null;
      if (!resolved) {
        dialog.showErrorBox(
          'Error al iniciar',
          `El servidor interno de la aplicación se cerró inesperadamente (código ${code}).`
        );
        app.quit();
      }
    });

    // Timeout: resolver después de 5s si el servidor no emite "Ready"
    setTimeout(done, 5000);
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
      label: app.name,
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
