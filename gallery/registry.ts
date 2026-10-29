import Button from './demos/Button.demo.svelte';
import ButtonGroup from './demos/ButtonGroup.demo.svelte';
import IconButton from './demos/IconButton.demo.svelte';
import Link from './demos/Link.demo.svelte';
import Toggle from './demos/Toggle.demo.svelte';
import Checkbox from './demos/Checkbox.demo.svelte';
import RadioGroup from './demos/RadioGroup.demo.svelte';
import Select from './demos/Select.demo.svelte';
import Slider from './demos/Slider.demo.svelte';
import Switch from './demos/Switch.demo.svelte';
import TextArea from './demos/TextArea.demo.svelte';
import TextInput from './demos/TextInput.demo.svelte';
import Box from './demos/Box.demo.svelte';
import Card from './demos/Card.demo.svelte';
import Divider from './demos/Divider.demo.svelte';
import Grid from './demos/Grid.demo.svelte';
import ScrollArea from './demos/ScrollArea.demo.svelte';
import Spacer from './demos/Spacer.demo.svelte';
import SplitPane from './demos/SplitPane.demo.svelte';
import Stack from './demos/Stack.demo.svelte';
import Breadcrumbs from './demos/Breadcrumbs.demo.svelte';
import Menu from './demos/Menu.demo.svelte';
import NavList from './demos/NavList.demo.svelte';
import Pagination from './demos/Pagination.demo.svelte';
import Tabs from './demos/Tabs.demo.svelte';
import ContextMenu from './demos/ContextMenu.demo.svelte';
import Drawer from './demos/Drawer.demo.svelte';
import Modal from './demos/Modal.demo.svelte';
import Popover from './demos/Popover.demo.svelte';
import Toast from './demos/Toast.demo.svelte';
import Tooltip from './demos/Tooltip.demo.svelte';
import Alert from './demos/Alert.demo.svelte';
import Avatar from './demos/Avatar.demo.svelte';
import Badge from './demos/Badge.demo.svelte';
import Kbd from './demos/Kbd.demo.svelte';
import Progress from './demos/Progress.demo.svelte';
import Spinner from './demos/Spinner.demo.svelte';

export const demos = [
	{ name: 'Button', category: 'actions', description: "Clickable action with variants, tones, sizes, shapes, loading and icon slots.", demo: Button },
	{ name: 'ButtonGroup', category: 'actions', description: "Row of attached buttons, or a segmented single-select control driven by options and value.", demo: ButtonGroup },
	{ name: 'IconButton', category: 'actions', description: "Square icon-only action with a hover tooltip, sharing Button's variants, tones and sizes.", demo: IconButton },
	{ name: 'Link', category: 'actions', description: "Inline text action with tones, underlined on hover.", demo: Link },
	{ name: 'Toggle', category: 'actions', description: "Button that holds a pressed or unpressed state, with a tone for the pressed look.", demo: Toggle },
	{ name: 'Checkbox', category: 'inputs', description: "Boolean or indeterminate check with a label, in three sizes, controlled by the parent.", demo: Checkbox },
	{ name: 'RadioGroup', category: 'inputs', description: "Pick one of a few options, in a column or a row, with arrow-key navigation.", demo: RadioGroup },
	{ name: 'Select', category: 'inputs', description: "Dropdown that picks one option from a list, with keyboard navigation and a scrolling list for long option sets.", demo: Select },
	{ name: 'Slider', category: 'inputs', description: "Pick a number in a range by dragging the thumb, clicking the track or using the arrow keys.", demo: Slider },
	{ name: 'Switch', category: 'inputs', description: "On/off toggle with a track and thumb, optional label, and three sizes.", demo: Switch },
	{ name: 'TextArea', category: 'inputs', description: "Multi-line text field with label, hint or error text, and a height that grows with its content.", demo: TextArea },
	{ name: 'TextInput', category: 'inputs', description: "Single-line text field with label, hint or error text, leading and trailing slots, and three sizes.", demo: TextInput },
	{ name: 'Box', category: 'layout', description: "Plain flex column with optional padding, background, border and corner radius.", demo: Box },
	{ name: 'Card', category: 'layout', description: "Surface with a header, body and footer, optionally clickable as a whole.", demo: Card },
	{ name: 'Divider', category: 'layout', description: "Hairline rule, horizontal or vertical, with an optional centred label.", demo: Divider },
	{ name: 'Grid', category: 'layout', description: "Equal-width column grid with a spacing gap between cells.", demo: Grid },
	{ name: 'ScrollArea', category: 'layout', description: "Vertically scrolling column with a fixed height or a height cap, and a drawn scroll thumb.", demo: ScrollArea },
	{ name: 'Spacer', category: 'layout', description: "Flexible empty box that takes up the free space in a row or column.", demo: Spacer },
	{ name: 'SplitPane', category: 'layout', description: "Two panes divided by a draggable, keyboard-nudgeable grip, side by side or stacked.", demo: SplitPane },
	{ name: 'Stack', category: 'layout', description: "Flex row or column with spacing, alignment, justification and optional wrapping.", demo: Stack },
	{ name: 'Breadcrumbs', category: 'navigation', description: "Trail of ancestor pages, with the last item marked as the current page.", demo: Breadcrumbs },
	{ name: 'Menu', category: 'navigation', description: "Dropdown of actions anchored to a trigger, with shortcuts, tones, disabled items and separators.", demo: Menu },
	{ name: 'NavList', category: 'navigation', description: "Vertical sidebar list with section headings, optional icons and badges.", demo: NavList },
	{ name: 'Pagination', category: 'navigation', description: "Page controls with previous and next buttons and a windowed run of page numbers around the current page.", demo: Pagination },
	{ name: 'Tabs', category: 'navigation', description: "Switch between sibling views with an underline or a segmented pill control.", demo: Tabs },
	{ name: 'ContextMenu', category: 'overlays', description: "Wraps a region and opens a menu of actions on right click or ctrl+click.", demo: ContextMenu },
	{ name: 'Drawer', category: 'overlays', description: "Panel that slides in from the left, right or bottom over a scrim, with title, body and footer.", demo: Drawer },
	{ name: 'Modal', category: 'overlays', description: "Centred dialog over a scrim, with title, body and footer actions.", demo: Modal },
	{ name: 'Popover', category: 'overlays', description: "Floating panel anchored to a trigger, or to window coordinates, that closes on outside press or Escape.", demo: Popover },
	{ name: 'Toast', category: 'overlays', description: "Stacked notifications shown bottom-right, raised with the toast() function and dismissed by timer or close button.", demo: Toast },
	{ name: 'Tooltip', category: 'overlays', description: "Short hover hint beside a trigger, shown after a delay and hidden when the pointer leaves.", demo: Tooltip },
	{ name: 'Alert', category: 'feedback', description: "Inline status message with a tone, optional title and a dismiss control.", demo: Alert },
	{ name: 'Avatar', category: 'feedback', description: "Circle or square user image, falling back to initials from a name.", demo: Avatar },
	{ name: 'Badge', category: 'feedback', description: "Small pill label for counts, statuses and tags, in five tones and three variants.", demo: Badge },
	{ name: 'Kbd', category: 'feedback', description: "Keyboard shortcut caps for a chord such as cmd+k, drawn with macOS glyphs.", demo: Kbd },
	{ name: 'Progress', category: 'feedback', description: "Horizontal progress bar for a known percentage, or an indeterminate sweep.", demo: Progress },
	{ name: 'Spinner', category: 'feedback', description: "Indeterminate loading indicator drawn as a ring of fading dots.", demo: Spinner },
];
