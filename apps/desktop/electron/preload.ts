import { contextBridge, ipcRenderer } from "electron";

// Secure context bridge exposing safely typed APIs to the renderer
contextBridge.exposeInMainWorld("electronAPI", {
    getAppVersion: () => ipcRenderer.invoke("get-app-version"),
});
