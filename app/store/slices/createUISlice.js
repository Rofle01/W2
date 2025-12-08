import { WIDGET_REGISTRY } from "../constants";

export const createUISlice = (set, get) => ({
    // State
    activeWorkspaceId: "default-workspace",
    isPerformanceMode: false,
    workspaces: [
        {
            id: "default-workspace",
            name: "Ana Panel",
            activeMarketProfileId: "default_server", // Default profile selection
            widgets: [
                {
                    id: "default-money-input-widget",
                    type: "money-input",
                    isVisible: true,
                    data: { amount: "" },
                },
                {
                    id: "default-note-taker-widget",
                    type: "note-taker",
                    isVisible: true,
                    data: { notes: "" },
                },
            ],
        },
    ],

    // Actions
    addWorkspace: (name) =>
        set((state) => {
            // Get the first available market profile ID
            const defaultProfileId = state.serverProfiles?.[0]?.id || "default_server";

            const newWorkspace = {
                id: crypto.randomUUID(),
                name: name || "Yeni Panel",
                activeMarketProfileId: defaultProfileId, // Assign default profile
                widgets: [],
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
            if (state.workspaces.length <= 1) {
                console.warn("Son workspace silinemez!");
                return;
            }
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

    addWidget: (type) =>
        set((state) => {
            if (!WIDGET_REGISTRY[type]) {
                console.error(`Widget tipi "${type}" registry'de bulunamadı!`);
                return;
            }
            const activeWorkspace = state.workspaces.find(
                (ws) => ws.id === state.activeWorkspaceId
            );
            if (activeWorkspace) {
                const defaultData = { ...WIDGET_REGISTRY[type].defaultData };
                activeWorkspace.widgets.push({
                    id: crypto.randomUUID(),
                    type,
                    isVisible: true,
                    data: defaultData,
                });
            }
        }),

    removeWidget: (widgetId) =>
        set((state) => {
            const activeWorkspace = state.workspaces.find(
                (ws) => ws.id === state.activeWorkspaceId
            );
            if (activeWorkspace) {
                const index = activeWorkspace.widgets.findIndex((w) => w.id === widgetId);
                if (index !== -1) {
                    activeWorkspace.widgets.splice(index, 1);
                }
            }
        }),

    toggleWidgetVisibility: (widgetId) =>
        set((state) => {
            const activeWorkspace = state.workspaces.find(
                (ws) => ws.id === state.activeWorkspaceId
            );
            const widget = activeWorkspace?.widgets.find((w) => w.id === widgetId);
            if (widget) {
                widget.isVisible = !widget.isVisible;
            }
        }),

    updateWidgetData: (widgetId, partialData) =>
        set((state) => {
            const activeWorkspace = state.workspaces.find(
                (ws) => ws.id === state.activeWorkspaceId
            );
            const widget = activeWorkspace?.widgets.find((w) => w.id === widgetId);
            if (widget) {
                widget.data = { ...widget.data, ...partialData };
            }
        }),

    togglePerformanceMode: () =>
        set((state) => {
            state.isPerformanceMode = !state.isPerformanceMode;
        }),

    /**
     * Set the active market profile for a workspace
     * @param {string} workspaceId - Workspace ID
     * @param {string} profileId - Market profile ID
     */
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
