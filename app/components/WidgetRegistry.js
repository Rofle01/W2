import dynamic from 'next/dynamic';
import { WIDGET_TYPES } from '../store/constants';
import WidgetSkeleton from './ui/WidgetSkeleton';
import FinancialWidget from './FinancialWidget'; // Default widget kept static

// Lazy load widgets
const MarketWidget = dynamic(() => import('./widgets/MarketWidget'), {
    loading: () => <WidgetSkeleton />,
    ssr: false // Widgets rely heavily on browser storage/state, so better client-side
});

const CharacterWidget = dynamic(() => import('./widgets/CharacterWidget'), {
    loading: () => <WidgetSkeleton />,
    ssr: false
});

const AnalysisWidget = dynamic(() => import('./widgets/AnalysisWidget'), {
    loading: () => <WidgetSkeleton />,
    ssr: false
});

const MetinSettingsWidget = dynamic(() => import('./widgets/MetinSettingsWidget'), {
    loading: () => <WidgetSkeleton />,
    ssr: false
});

const DamageProgressionWidget = dynamic(() => import('./widgets/DamageProgressionWidget'), {
    loading: () => <WidgetSkeleton />,
    ssr: false
});

const MarketSupplyWidget = dynamic(() => import('./widgets/MarketSupplyWidget'), {
    loading: () => <WidgetSkeleton />,
    ssr: false
});

const CraftingWidget = dynamic(() => import('./widgets/CraftingWidget'), {
    loading: () => <WidgetSkeleton />,
    ssr: false
});

const BossSettingsWidget = dynamic(() => import('./widgets/BossSettingsWidget'), {
    loading: () => <WidgetSkeleton />,
    ssr: false
});

// Map types to components
const WIDGET_COMPONENTS = {
    [WIDGET_TYPES.MARKET]: MarketWidget,
    [WIDGET_TYPES.CHARACTER]: CharacterWidget,
    [WIDGET_TYPES.ANALYSIS]: AnalysisWidget,
    [WIDGET_TYPES.METIN_SETTINGS]: MetinSettingsWidget,
    [WIDGET_TYPES.DAMAGE_PROGRESSION]: DamageProgressionWidget,
    [WIDGET_TYPES.MARKET_SUPPLY]: MarketSupplyWidget,
    [WIDGET_TYPES.CRAFTING]: CraftingWidget,
    [WIDGET_TYPES.BOSS_SETTINGS]: BossSettingsWidget,
};

/**
 * Returns the component associated with the given widget type.
 * Default: FinancialWidget
 */
export const getWidgetComponent = (type) => {
    return WIDGET_COMPONENTS[type] || FinancialWidget;
};
