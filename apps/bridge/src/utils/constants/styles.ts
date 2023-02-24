import clsx from 'clsx';

const CLASS_NAMES = Object.freeze({
  LIGHT: 'light',
  DARK: 'dark'
});

const LAYOUT = Object.freeze({
  APP_BAR_HEIGHT: 72
});

// MEMO: inspired by https://mui.com/components/buttons/
const BORDER_CLASSES = clsx(
  'border',
  'border-bitdaoGray-300',
  'dark:border-white',
  'dark:border-opacity-25'
);
// TODO: not used for now
const DISABLED_BORDER_CLASSES = clsx(
  'border',
  'border-black',
  'border-opacity-10',
  'dark:border-white',
  'dark:border-opacity-10'
);

// MEMO: inspired by https://mui.com/customization/dark-mode/#dark-mode-with-custom-palette
const DISABLED_BACKGROUND_CLASSES = clsx(
  'bg-black',
  'bg-opacity-10',
  'dark:bg-white',
  'dark:bg-opacity-10'
);
const DISABLED_TEXT_CLASSES = clsx(
  'text-black',
  'text-opacity-25',
  'dark:text-white',
  'dark:text-opacity-30'
);

const TEXT_CLASSES = clsx(
  'text-black',
  'text-opacity-90',
  'dark:text-white'
);

const HOVER_BACKGROUND_CLASSES = clsx(
  'hover:bg-black',
  'hover:bg-opacity-5',
  'dark:hover:bg-white',
  'dark:hover:bg-opacity-10'
);

const RING_CLASSES = clsx(
  'ring-1',
  'ring-black',
  'ring-opacity-25',
  'dark:ring-white',
  'dark:ring-opacity-25'
);

const LAYOUT_SIDE_PADDING_CLASSES = clsx(
  'px-4',
  'sm:px-6',
  'lg:px-12'
);

const PAGE_MAIN_CONTENT_WIDTH_CLASSES = clsx(
  'max-w-7xl'
);

const PAGE_MAIN_CONTENT_Y_PADDING_CLASSES = 'py-10';

export {
  LAYOUT,
  CLASS_NAMES,
  BORDER_CLASSES,
  DISABLED_BORDER_CLASSES,
  DISABLED_BACKGROUND_CLASSES,
  DISABLED_TEXT_CLASSES,
  TEXT_CLASSES,
  HOVER_BACKGROUND_CLASSES,
  RING_CLASSES,
  LAYOUT_SIDE_PADDING_CLASSES,
  PAGE_MAIN_CONTENT_WIDTH_CLASSES,
  PAGE_MAIN_CONTENT_Y_PADDING_CLASSES
};
