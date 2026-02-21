import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import * as path from 'path';
import * as fs from 'fs/promises';
import { existsSync } from 'fs';

let mainWindow: BrowserWindow | null = null;
let userFolderPath: string | null = null;
let settingsPath: string | null = null;

const VAULTS_META_FILE = 'vaults.json';
const VAULT_ID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertValidVaultId(id: string): void {
  if (!VAULT_ID_REGEX.test(id)) {
    throw new Error('Invalid vault identifier');
  }
}

function normalizeExportName(name: string): string {
  const base = name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').trim();
  if (!base) return 'vault.kdbx';
  return base.toLowerCase().endsWith('.kdbx') ? base : `${base}.kdbx`;
}

async function ensureUserFolder(): Promise<string> {
  if (userFolderPath) return userFolderPath;
  throw new Error('No folder selected');
}

async function getSettingsPath(): Promise<string> {
  if (settingsPath) return settingsPath;
  settingsPath = path.join(app.getPath('userData'), 'settings.json');
  return settingsPath;
}

async function handleSelectFolder(): Promise<{ path: string; vaults: VaultMeta[] } | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Vault Storage Folder',
    buttonLabel: 'Select Folder',
  });
  
  if (!canceled && filePaths[0]) {
    userFolderPath = filePaths[0];
    
    await fs.mkdir(userFolderPath!, { recursive: true });
    
    const vaults = await loadVaultsMeta();
    
    await saveSettings({ vaultsPath: userFolderPath! });
    
    return { path: userFolderPath!, vaults };
  }
  return null;
}

interface VaultMeta {
  id: string;
  name: string;
  fileName: string;
  createdAt: string;
  lastAccessedAt: string;
}

interface AppSettings {
  vaultsPath?: string;
}

interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

async function loadSettings(): Promise<AppSettings> {
  try {
    const settingsFile = await getSettingsPath();
    const data = await fs.readFile(settingsFile, 'utf-8');
    const settings = JSON.parse(data);
    if (settings.vaultsPath) {
      userFolderPath = settings.vaultsPath;
    }
    return settings;
  } catch {
    return {};
  }
}

async function saveSettings(settings: AppSettings): Promise<void> {
  const settingsFile = await getSettingsPath();
  await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2), 'utf-8');
}

async function loadVaultsMeta(): Promise<VaultMeta[]> {
  const folder = await ensureUserFolder();
  const metaPath = path.join(folder, VAULTS_META_FILE);
  
  try {
    const data = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveVaultsMeta(vaults: VaultMeta[]): Promise<void> {
  const folder = await ensureUserFolder();
  const metaPath = path.join(folder, VAULTS_META_FILE);
  await fs.writeFile(metaPath, JSON.stringify(vaults, null, 2), 'utf-8');
}

async function handleGetVaultsPath(): Promise<string | null> {
  return userFolderPath;
}

async function handleListVaults(): Promise<VaultMeta[]> {
  return loadVaultsMeta();
}

async function handleReadVault(_event: any, id: string): Promise<Buffer> {
  assertValidVaultId(id);
  const folder = await ensureUserFolder();
  const vaults = await loadVaultsMeta();
  const vault = vaults.find(v => v.id === id);
  
  if (!vault) {
    throw new Error('Vault not found');
  }
  
  const filePath = path.join(folder, vault.fileName);
  const data = await fs.readFile(filePath);

  vault.lastAccessedAt = new Date().toISOString();
  await saveVaultsMeta(vaults);

  return data;
}

async function handleWriteVault(_event: any, id: string, data: Uint8Array): Promise<void> {
  assertValidVaultId(id);
  const folder = await ensureUserFolder();
  const vaults = await loadVaultsMeta();
  const vault = vaults.find(v => v.id === id);
  
  if (!vault) {
    throw new Error('Vault not found');
  }
  
  const filePath = path.join(folder, vault.fileName);
  await fs.writeFile(filePath, data);
  
  vault.lastAccessedAt = new Date().toISOString();
  await saveVaultsMeta(vaults);
}

async function handleCreateVault(_event: any, name: string, masterPassword?: string): Promise<VaultMeta> {
  if (typeof masterPassword === 'string') {
    const validation = validateMasterPasswordStrength(masterPassword);
    if (!validation.valid) {
      throw new Error(validation.errors[0]);
    }
  }
  const folder = await ensureUserFolder();
  const safeName = name.trim() || 'My Vault';
  const id = crypto.randomUUID();
  const fileName = `${id}.kdbx`;
  const now = new Date().toISOString();
  
  const vault: VaultMeta = {
    id,
    name: safeName,
    fileName,
    createdAt: now,
    lastAccessedAt: now,
  };
  
  const vaults = await loadVaultsMeta();
  vaults.push(vault);
  await saveVaultsMeta(vaults);
  
  return vault;
}

function validateMasterPasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  if (password.length < 12) {
    errors.push('Master password must contain at least 12 characters.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Master password must include at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Master password must include at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Master password must include at least one number.');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Master password must include at least one special character.');
  }

  return { valid: errors.length === 0, errors };
}

async function handleValidateMasterPassword(_event: any, password: string): Promise<PasswordValidationResult> {
  if (typeof password !== 'string') {
    return {
      valid: false,
      errors: ['Master password must be a text value.'],
    };
  }
  return validateMasterPasswordStrength(password);
}

async function handleDeleteVault(_event: any, id: string): Promise<void> {
  assertValidVaultId(id);
  const folder = await ensureUserFolder();
  const vaults = await loadVaultsMeta();
  const vaultIndex = vaults.findIndex(v => v.id === id);
  
  if (vaultIndex === -1) {
    throw new Error('Vault not found');
  }
  
  const vault = vaults[vaultIndex];
  const filePath = path.join(folder, vault.fileName);
  
  try {
    await fs.unlink(filePath);
  } catch {
    // File might not exist
  }
  
  vaults.splice(vaultIndex, 1);
  await saveVaultsMeta(vaults);
}

async function handleExportVault(_event: any, id: string): Promise<{ data: Buffer; name: string }> {
  assertValidVaultId(id);
  const data = await handleReadVault(null, id);
  const vaults = await loadVaultsMeta();
  const vault = vaults.find(v => v.id === id);
  
  if (!vault) {
    throw new Error('Vault not found');
  }
  
  return { data, name: normalizeExportName(vault.name) };
}

async function handleWriteExportFile(_event: any, targetPath: string, data: Uint8Array): Promise<void> {
  if (!targetPath || targetPath.length < 1) {
    throw new Error('Invalid export path');
  }

  if (path.extname(targetPath).toLowerCase() !== '.kdbx') {
    throw new Error('Export file must use .kdbx extension');
  }

  await fs.writeFile(targetPath, data);
}

async function handleImportVault(_event: any, filePath: string): Promise<VaultMeta> {
  const folder = await ensureUserFolder();
  if (path.extname(filePath).toLowerCase() !== '.kdbx') {
    throw new Error('Only .kdbx files can be imported');
  }
  const fileName = path.basename(filePath);
  const name = fileName.replace(/\.kdbx$/i, '');
  
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  
  const vault: VaultMeta = {
    id,
    name,
    fileName: `${id}.kdbx`,
    createdAt: now,
    lastAccessedAt: now,
  };
  
  const data = await fs.readFile(filePath);
  const destPath = path.join(folder, vault.fileName);
  await fs.writeFile(destPath, data);
  
  const vaults = await loadVaultsMeta();
  vaults.push(vault);
  await saveVaultsMeta(vaults);
  
  return vault;
}

async function handleSelectImportFile(): Promise<string | null> {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [{ name: 'KeePass Vaults', extensions: ['kdbx'] }],
    title: 'Import Vault',
  });
  
  if (!canceled && filePaths[0]) {
    return filePaths[0];
  }
  return null;
}

async function handleSelectExportFile(_event: any, defaultName: string): Promise<string | null> {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow!, {
    defaultPath: defaultName,
    filters: [{ name: 'KeePass Vaults', extensions: ['kdbx'] }],
    title: 'Export Vault',
  });
  
  if (!canceled && filePath) {
    return filePath;
  }
  return null;
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' as const }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        { role: 'selectAll' as const }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' as const },
        { role: 'forceReload' as const },
        { role: 'toggleDevTools' as const },
        { type: 'separator' as const },
        { role: 'resetZoom' as const },
        { role: 'zoomIn' as const },
        { role: 'zoomOut' as const },
        { type: 'separator' as const },
        { role: 'togglefullscreen' as const }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' as const },
        { role: 'close' as const }
      ]
    }
  ] as const;
  
  const menu = Menu.buildFromTemplate(template as unknown as Electron.MenuItemConstructorOptions[]);
  Menu.setApplicationMenu(menu);
}


function createWindow() {
  const iconPath = path.join(__dirname, '../../build/icon.png');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Calix Pass',
    icon: existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  createMenu();
  
  const settings = await loadSettings();
  
  ipcMain.handle('storage:selectFolder', handleSelectFolder);
  ipcMain.handle('storage:getVaultsPath', handleGetVaultsPath);
  ipcMain.handle('storage:listVaults', handleListVaults);
  ipcMain.handle('storage:readVault', handleReadVault);
  ipcMain.handle('storage:writeVault', handleWriteVault);
  ipcMain.handle('storage:createVault', handleCreateVault);
  ipcMain.handle('storage:deleteVault', handleDeleteVault);
  ipcMain.handle('storage:exportVault', handleExportVault);
  ipcMain.handle('storage:writeExportFile', handleWriteExportFile);
  ipcMain.handle('storage:importVault', handleImportVault);
  ipcMain.handle('storage:selectImportFile', handleSelectImportFile);
  ipcMain.handle('storage:selectExportFile', handleSelectExportFile);
  ipcMain.handle('storage:getInitialPath', () => settings.vaultsPath || null);
  ipcMain.handle('security:validateMasterPassword', handleValidateMasterPassword);
  
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
