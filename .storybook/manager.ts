import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

const lightTheme = create({
  base: 'light',
  brandTitle: 'Spoonjoy',
  brandUrl: 'https://spoonjoy.com',
  brandImage: '/logos/sj_black.svg',
  brandTarget: '_self',
});

const darkTheme = create({
  base: 'dark',
  brandTitle: 'Spoonjoy',
  brandUrl: 'https://spoonjoy.com',
  brandImage: '/logos/sj_white.svg',
  brandTarget: '_self',
});

addons.setConfig({
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? darkTheme : lightTheme,
});
