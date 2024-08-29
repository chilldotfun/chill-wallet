const palette = {
  white: '#ffffff',
  white_muted: 'rgba(255, 255, 255, 0.5)',
  black: '#000000',
  black_muted: 'rgba(0, 0, 0, 0.5)',
  black_muted2: 'rgba(0, 0, 0, 0.)',

  dark: '#1E283C',
  grey: '#495361',
  light: '#A2A4AA',

  black_dark: '#2a2626',

  green_dark: '#379a29',
  green: '#41B530',
  green_light: '#5ec04f',
  green_2CA85E: '#2CA85E',
  green_33BA69: '#33BA69',

  yellow_dark: '#d5ac00',
  yellow: 'rgb(253,224,71)',
  yellow_light: '#fcd226',

  red_dark: '#c92b40',
  red: '#ED334B',
  red_light: '#f05266',
  red_F24040: '#F24040',
  red_F1645F: '#F1645F',
  red_F7475C: '#F7475C',

  blue_dark: '#1461d1',
  blue: '#1872F6',
  blue_light: '#c6dcfd',

  orange_dark: '#d9691c',
  orange: '#FF7B21',
  orange_light: '#ff8f42',

  gold: '#eac249',
  gray_dark: '#BEBEBE',
  gray_col: '#949bb2',
  gray_80818B: '#80818B'
};

export const colors = Object.assign({}, palette, {
  transparent: 'rgba(0, 0, 0, 0)',
  inherit: 'inherit',
  text: palette.white,

  textDim: palette.white_muted,

  background: '#D8E0EF',

  error: '#e52937',

  danger: palette.red,

  card: '#262222',
  warning: palette.orange,
  primary: palette.yellow,

  bg2: '#2a2a2a',
  bg3: '#434242',
  bg4: '#383535',

  base: '#0052FF',

  border: 'rgba(255,255,255,0.1)',

  icon_yellow: '#FFBA33'
});

export type ColorTypes = keyof typeof colors;
