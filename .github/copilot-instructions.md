# AI Coding Instructions for talk-for-me

## Project Overview

This is an **Expo React Native** mobile app (v54+) using **Expo Router v6** for file-based navigation with typed routes. Targets iOS, Android, and web with React Native new architecture enabled and React Compiler experimental features active.

## Architecture & Routing

### File-Based Routing (Expo Router)

- Routes are defined by file structure in `app/` directory
- `app/_layout.tsx` - Root layout with theme provider and navigation stack
- `app/(tabs)/` - Tab-based navigation group (home at `index.tsx`, explore screen)
- `app/modal.tsx` - Modal presentation screen
- **Anchor pattern**: Root layout sets `unstable_settings.anchor = '(tabs)'` for deep linking
- **Typed routes enabled**: Use `href="/modal"` with type safety from `experiments.typedRoutes`

### Navigation

- Uses `@react-navigation/native` v7 with bottom tabs
- Custom `HapticTab` component wraps tab buttons with haptic feedback
- Stack navigator in root, tabs navigator nested inside
- No headers shown at tab level (controlled at Stack.Screen level)

## Theming System

### Color Scheme Management

- **Automatic light/dark mode**: Configured via `userInterfaceStyle: "automatic"` in `app.json`
- `useColorScheme()` hook from React Native (re-exported from `hooks/use-color-scheme.ts`)
- `useThemeColor()` custom hook accepts `{light, dark}` props and fallback color names from `constants/theme.ts`
- Theme colors defined in `Colors` object: text, background, tint, icon, tab colors

### Themed Components Pattern

All custom UI components follow this pattern:

- Accept `lightColor` and `darkColor` props for overrides
- Use `useThemeColor()` to resolve colors automatically
- Examples: `ThemedText`, `ThemedView` in `components/`

### Icon System

- **Platform-specific icons**:
  - iOS: Native SF Symbols via `expo-symbols` (`icon-symbol.ios.tsx`)
  - Android/Web: Material Icons via `@expo/vector-icons` (`icon-symbol.tsx`)
- Mapping defined in `MAPPING` object - add new icons here first
- Single `IconSymbol` component, correct version loaded by platform extension

## Import Patterns

### Path Aliases

- `@/*` maps to project root (configured in `tsconfig.json`)
- **Always use**: `@/components/...`, `@/hooks/...`, `@/constants/...`, `@/assets/...`
- **Never use**: Relative paths like `../../components`

### Asset Imports

- Images: Use `require('@/assets/images/filename.png')` for static assets
- With `expo-image`: `<Image source={require('@/assets/...')} />`

## Development Workflow

### Running the App

```bash
npm start              # Start Expo dev server (choose platform)
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run web            # Run in browser
```

### Debugging

- iOS: `cmd + d` opens dev menu
- Android: `cmd + m` opens dev menu
- Web: `F12` for browser devtools
- Linting: `npm run lint` (uses Expo ESLint config)

### Reset Project Script

`npm run reset-project` moves starter code to `app-example/` and creates blank `app/` directory. This is a one-time scaffolding cleanup - remove from package.json after use.

## Styling Conventions

### StyleSheet vs Inline

- Use `StyleSheet.create()` for component styles (better performance)
- Define styles at bottom of file, not inline
- Acceptable inline: Simple layout props like `gap`, `marginBottom` for spacing

### Typography Variants

`ThemedText` component has predefined `type` prop variants:

- `default`, `defaultSemiBold` - Body text (16px)
- `title` - Large headers (32px bold)
- `subtitle` - Section headers (20px bold)
- `link` - Hyperlinks (hardcoded blue color)

## Key Dependencies & Features

### Animation Libraries

- `react-native-reanimated` v4 - Primary animation library
- `react-native-gesture-handler` - Touch gesture handling
- `expo-haptics` - Haptic feedback (used in `HapticTab`)

### Platform Support

- React 19.1.0, React Native 0.81.5
- Expo SDK 54, Router v6
- Web support via `react-native-web`

### Experimental Features Active

- `typedRoutes: true` - Type-safe navigation
- `reactCompiler: true` - React Compiler optimization
- `newArchEnabled: true` - React Native new architecture

## Common Patterns

### Creating New Screens

1. Add file in `app/` (or `app/(tabs)/` for tabbed screens)
2. Export default function component
3. Wrap content in `ThemedView` for proper background colors
4. Use `ThemedText` for all text content
5. Register in parent `_layout.tsx` if needed for Stack navigation

### Adding Icons

1. Find SF Symbol name on iOS
2. Find equivalent Material Icon at icons.expo.fyi
3. Add mapping to `MAPPING` in `components/ui/icon-symbol.tsx`
4. Use via `<IconSymbol name="your.symbol" color={...} />`

## Critical Notes

- This appears to be starter/template code - the app name "talk-for-me" suggests a communication/TTS feature not yet implemented
- Current screens are placeholder content from `create-expo-app` boilerplate
- No state management, API layer, or business logic present yet
