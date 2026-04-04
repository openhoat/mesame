# Keyboard Navigation & Accessibility

This document describes the keyboard navigation features, ARIA attributes, and accessibility patterns currently implemented in the MeSame web application.

## Chat Interface

### Chat Input (`ChatInput`)

The chat textarea is the primary interactive element on the chat page.

| Key Combination | Action |
|----------------|--------|
| `Enter` | Send the current message |
| `Shift + Enter` | Insert a new line (does not send) |

- The textarea receives focus naturally via the browser tab order.
- The send button is disabled when the input is empty or while the assistant is streaming, preventing accidental submissions.
- A visible hint below the input tells users about `Enter` to send and `Shift+Enter` for a new line.

### Send Button

- The send button SVG icon carries `role="img"` and a translated `aria-label` (`chat.sendAriaLabel`), making the icon readable by screen readers.
- The button uses a native `<button>` element with `type="button"`, ensuring it is keyboard-focusable and activatable with `Enter` or `Space`.
- When disabled, `disabled` is set natively, which also communicates the state to assistive technologies.

### Conversation History Panel (`ConversationHistory`)

- Opens as a fixed overlay with a semi-transparent backdrop.
- All action buttons use native `<button>` elements with descriptive `aria-label` attributes:
  - **Export conversations** (`aria-label="Export conversations"`)
  - **Close conversation history** (`aria-label="Close conversation history"`)
  - **Add to sources** (`aria-label="Add to sources"`) on each conversation item
  - **Delete conversation** (`aria-label="Delete conversation"`) on each conversation item
- SVG icons inside buttons include `role="img"` and `aria-label` for screen reader identification, plus `<title>` elements for tooltip accessibility.
- The backdrop area is a `<button>` with `aria-label="Close conversation history"`, allowing keyboard dismissal by tabbing to it and pressing `Enter` or `Space`.
- Conversation items are rendered as native `<button>` elements, making them keyboard-focusable and selectable.

### Chat Header (`ChatHeader`)

- Uses Mantine `ActionIcon` components for toolbar actions (new conversation, history, settings, theme toggle), which are natively keyboard-focusable.
- Each action icon has a `title` attribute for tooltip context.
- The settings icon links to `/dashboard` using `react-router-dom` `Link`, preserving SPA keyboard navigation.

### Chat Messages (`ChatMessages`)

- The message container auto-scrolls to the latest message on mount.
- Messages are `<div>` elements with a `data-role` attribute indicating the speaker (user, assistant, error). These are display-only and do not require keyboard interaction.

## Dashboard Interface

### Dashboard Layout (`DashboardLayout`)

- Uses Mantine `AppShell` with a collapsible sidebar navigation.
- The mobile hamburger menu (`Burger`) is keyboard-accessible via Mantine's built-in support.
- The sidebar collapse/expand button (`ActionIcon`) is focusable and operable via keyboard.
- Navigation items use Mantine `NavLink` with `component={Link}`, maintaining proper `<a>` semantics for keyboard navigation and screen readers.
- Each nav link has a `minHeight` of `44px`, meeting the WCAG minimum touch/click target size.
- `data-testid` attributes are present on nav links for automated testing.

### Sources Page (`Sources`)

- The file upload button uses Mantine `FileButton`, which wraps a native file input for keyboard accessibility.
- Create, view, and delete actions use native buttons or Mantine `Button`/`ActionIcon` components.
- Modals (`Modal`) are provided by Mantine and include built-in focus trapping and `Escape` to close.
- Form fields (`TextInput`, `Textarea`) follow standard keyboard navigation (Tab between fields, type to input).

### Style Profiles Page (`StyleProfiles`)

- Profile action buttons (activate, regenerate, edit, delete) use Mantine `ActionIcon` and `Button`, all keyboard-focusable.
- Create/edit modal uses Mantine `Modal` with focus trapping.
- Source selection uses Mantine `Checkbox` components, operable via `Space` key.
- The model selector is a searchable Mantine `Select`, supporting keyboard search and arrow key navigation.

### Profile Questionnaire (`ProfileQuestionnaire`)

- Multi-step wizard with Previous/Next/Create buttons, all keyboard-operable.
- Passion and tone selection use Mantine `Chip` components, which are keyboard-focusable and toggleable.
- Text areas for free-form input follow standard keyboard behavior.
- Step progression is controlled via buttons, not auto-advance, giving users full control.

### Providers Page (`Providers`)

- Provider table uses Mantine `Table` with standard HTML table semantics.
- Toggle switches (`Switch`) for enabling/disabling providers are keyboard-operable.
- Modal forms for adding/editing providers use Mantine `Modal` with focus trapping.
- Select dropdowns use Mantine `Select` with keyboard arrow navigation.
- Confirmation dialogs use `window.confirm()`, which is natively accessible.

### Request Logs Page (`RequestLogs`)

- Search input is a standard Mantine `TextInput`, keyboard-focusable.
- Action buttons (toggle streaming, clear, export) are standard Mantine `Button` components.
- WebSocket connection status is displayed as a `Badge` with a `Tooltip` for additional context.

### Server Configuration Page (`ServerConfig`)

- All form inputs (`TextInput`, `NumberInput`, `Select`, `Switch`) are Mantine components with built-in keyboard support.
- Unsaved changes indicator appears with a save button when modifications are detected.
- The danger zone reset button uses a standard Mantine `Button`.

## Shared Components

### Model Selector (`ModelSelector`)

- Uses Mantine `Select` with `searchable` enabled, allowing keyboard-driven search and selection.
- Arrow keys navigate options, `Enter` selects, `Escape` closes the dropdown.
- Models are grouped by provider, and groups are navigable via keyboard.
- Includes a left-section icon (Bot) for visual identification.

### Theme Toggle (`ThemeToggle`)

- **Icon variant**: Single `ActionIcon` that cycles through themes on click/`Enter`/`Space`.
- **Menu variant**: Uses Mantine `Menu` with `Menu.Target` as an `ActionIcon`. The dropdown opens on click or keyboard activation, and items are navigable with arrow keys.
- Each menu item shows the current selection with a checkmark.

### File Drop Zone (`FileDropZone`)

- Wraps content in a `<section>` element with `aria-label="File drop zone"`.
- Drag-and-drop functionality is mouse-driven; file upload via keyboard is available through the `FileButton` component on the Sources page.
- The drop overlay uses `pointerEvents: 'none'` to avoid interfering with keyboard focus.

### Status Indicator (`StatusIndicator`)

- Displays connection status as text (connected/disconnected) alongside a colored dot.
- The text label ensures screen readers can convey connection state without relying on color alone.

## ARIA Attributes Summary

| Component | Attribute | Value |
|-----------|-----------|-------|
| `ChatInput` send icon | `role="img"`, `aria-label` | Translated send label |
| `ConversationHistory` export button | `aria-label` | `"Export conversations"` |
| `ConversationHistory` close button | `aria-label` | `"Close conversation history"` |
| `ConversationHistory` add-to-sources button | `aria-label` | `"Add to sources"` |
| `ConversationHistory` delete button | `aria-label` | `"Delete conversation"` |
| `ConversationHistory` backdrop | `aria-label` | `"Close conversation history"` |
| `ConversationHistory` SVG icons | `role="img"`, `aria-label` | Descriptive icon labels |
| `FileDropZone` wrapper | `aria-label` | `"File drop zone"` |

## Tab Order

The application follows the natural DOM order for tab navigation:

1. **Chat page**: Header action icons (model selector, new conversation, history, settings, theme toggle, status) -> Message area (non-interactive) -> Chat textarea -> Send button
2. **Dashboard pages**: Header (hamburger on mobile, app name, collapse toggle, theme toggle) -> Sidebar navigation links -> Main content area (page-specific form fields and action buttons)

Mantine components manage their own internal tab order (e.g., modal focus trapping, select dropdown navigation).

## Focus Management

- **Mantine Modals**: Automatically trap focus within the modal when open and restore focus to the trigger element on close.
- **Chat auto-scroll**: The message container scrolls to the bottom on mount, but does not programmatically move focus.
- **Model Selector dropdown**: Refetches available models when opened, without disrupting focus.

## Internationalization (i18n)

- All user-facing text is provided via `react-i18next` translations, ensuring screen readers receive localized content.
- ARIA labels on the send button icon use translated strings (`t('chat.sendAriaLabel')`).
- Some ARIA labels in the conversation history panel are hardcoded in English (e.g., `"Export conversations"`, `"Close conversation history"`).

## Known Limitations

1. **No skip-to-content link**: The application does not include a "skip to main content" link for keyboard users to bypass navigation.
2. **No visible focus indicators beyond browser defaults**: The application relies on browser default focus outlines and Mantine's built-in focus styles. Custom high-contrast focus indicators are not implemented.
3. **Conversation history lacks Escape-to-close**: The overlay panel does not listen for `Escape` key presses to close; users must tab to the backdrop button or close button.
4. **Chat messages are not navigable**: Individual messages cannot be focused or navigated with arrow keys. There is no landmark or region role on the message area.
5. **No `aria-live` region for streaming messages**: When the assistant is streaming a response, screen readers are not notified of content updates in real time.
6. **Some hardcoded English ARIA labels**: While most UI text is internationalized, some `aria-label` values in `ConversationHistory` are hardcoded in English.
7. **Drag-and-drop is mouse-only**: File upload via drag-and-drop has no keyboard equivalent on the chat page (though the Sources dashboard page provides a `FileButton` alternative).
8. **No landmark roles on chat layout**: The chat page does not use `<main>`, `<nav>`, or other landmark elements, which would help screen reader users orient themselves.
9. **Action buttons in conversation list only appear on hover**: The "Add to sources" and "Delete" buttons on conversation items use `opacity-0 group-hover:opacity-100`, making them invisible and potentially inaccessible to keyboard-only users who tab to them.
