
export const createUISlice = (set, get) => ({
    // State
    activeWorkspaceId: "default-workspace",
    activeTab: "overview", // Default Tab: "overview", "market", "analysis", "boss", "settings"

    workspaces: [
        {
            id: "default-workspace",
            name: "Ana Panel",
            activeMarketProfileId: "default_server",
            // Data storage for components (no layout info needed anymore)
            data: {
                moneyInput: { amount: "" },
                noteTaker: { notes: "" }
            }
        },
    ],

    // Actions
    setActiveTab: (tabId) =>
        set((state) => {
            state.activeTab = tabId;
        }),

    addWorkspace: (name) =>
        set((state) => {
            const defaultProfileId = state.serverProfiles?.[0]?.id || "default_server";
            const newWorkspace = {
                id: crypto.randomUUID(),
                name: name || "Yeni Panel",
                activeMarketProfileId: defaultProfileId,
                data: {}
            };
            state.workspaces.push(newWorkspace);
            state.activeWorkspaceId = newWorkspace.id;
        }),

    switchWorkspace: (id) =>
        set((state) => {
            state.activeWorkspaceId = id;
        }),

    renameWorkspace: (workspaceId, newName) =>
        set((state) => {
            const workspace = state.workspaces.find((ws) => ws.id === workspaceId);
            if (workspace) {
                workspace.name = newName;
            }
        }),

    removeWorkspace: (workspaceId) =>
        set((state) => {
            if (state.workspaces.length <= 1) return;
            const workspaceIndex = state.workspaces.findIndex((ws) => ws.id === workspaceId);
            if (workspaceIndex === -1) return;

            if (state.activeWorkspaceId === workspaceId) {
                const newActiveIndex = workspaceIndex === state.workspaces.length - 1
                    ? workspaceIndex - 1
                    : workspaceIndex + 1;
                state.activeWorkspaceId = state.workspaces[newActiveIndex].id;
            }
            state.workspaces.splice(workspaceIndex, 1);
        }),

    // Data updater helper
    updateComponentData: (workspaceId, componentKey, data) =>
        set((state) => {
            const workspace = state.workspaces.find((ws) => ws.id === workspaceId);
            if (workspace) {
                if (!workspace.data) workspace.data = {};
                workspace.data[componentKey] = { ...workspace.data[componentKey], ...data };
            }
        }),

    // Widget data updater (backward compatibility)
    // widgetId genellikle workspaceId veya bir component key olarak kullanılır
    updateWidgetData: (widgetId, data) =>
        set((state) => {
            // widgetId aslında workspaceId ise doğrudan o workspace'e yaz
            let workspace = state.workspaces.find((ws) => ws.id === widgetId);

            // Bulunamadıysa aktif workspace'i kullan
            if (!workspace) {
                workspace = state.workspaces.find((ws) => ws.id === state.activeWorkspaceId);
            }

            if (workspace) {
                if (!workspace.data) workspace.data = {};

                // Eğer data içinde 'metins' varsa, metinSettings altına kaydet
                if (data.metins) {
                    if (!workspace.data.metinSettings) workspace.data.metinSettings = {};
                    workspace.data.metinSettings.metins = data.metins;
                } else {
                    // Diğer veriler için generic merge
                    Object.keys(data).forEach(key => {
                        workspace.data[key] = data[key];
                    });
                }
            }
        }),

    setWorkspaceMarketProfile: (workspaceId, profileId) =>
        set((state) => {
            const workspace = state.workspaces.find((ws) => ws.id === workspaceId);
            if (workspace) {
                workspace.activeMarketProfileId = profileId;
            }
        }),

    nukeStore: () => {
        localStorage.removeItem("financial-dashboard-storage");
        window.location.reload();
    },
});
