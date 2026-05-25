import { Platform } from "react-native";

export const VGTheme = {
  colors: {
    primary: "#19c10f",
    primaryDark: "#15a50c",
    primaryLight: "#e8fce7",
    primarySubtle: "#f0fdf0",
    background: "#f8fafc",
    surface: "#ffffff",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textTertiary: "#94a3b8",
    border: "#e2e8f0",
    inputBg: "#f1f5f9",
    error: "#ef4444",
    errorBg: "#fef2f2",
    warning: "#f59e0b",
    warningBg: "#fef3c7",
    successBg: "#dcfce7",
    successText: "#15803d",
    infoBg: "#dbeafe",
    infoText: "#1d4ed8",
    dangerBg: "#fee2e2",
    dangerText: "#b91c1c",
    pendingText: "#b45309",
  },
  shadow: {
    card: {
      shadowColor: "#64748b",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 3,
    } as const,
    button: {
      shadowColor: "#19c10f",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 8,
      elevation: 4,
    } as const,
    toggle: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 2,
    } as const,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },
};

// Mantido para compatibilidade com componentes existentes
const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
