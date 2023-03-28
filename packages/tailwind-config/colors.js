/**
 * Color names via
 * https://www.htmlcsscolor.com/
 */

const baseColors = {
  black: '#000000',
  white: '#FFFFFF',
  green: {
    foam: '#CCE9E7',
    sinbad: '#A8D0CD',
    tradewind: '#65B3AE',
    halfBaked:  '#4D9D98',
    blueDianne: '#2E524E',
    swamp: '#1A2F2D',
    racingGreen: '#0F1B1A',
  },
  gray: {
    silver: '#C4C4C4',
    charcoal: '#464646',
    blackPearl: '#1C1E20',
    nero: '#262626',
    soot: '#141414',
  },
  disabled: {
    gray: '#696969',
    grayLight: '#9D9D9D',
    greenDark: '#0B1413'
  },
  status: {
    error: '#E22F3D',
    success: '#3EB66A'
  }
}

module.exports = {
  boxes: {
    containerBg: baseColors.black,
    containerStroke: baseColors.gray.blackPearl,
  },
  type: {
    primary: baseColors.white,
    secondary: baseColors.gray.silver,
    muted: baseColors.gray.charcoal,
    error: baseColors.status.error,
    inversed: baseColors.black
  },
  stroke: {
    primary: baseColors.gray.blackPearl,
    primaryHover: baseColors.green.blueDianne,
    selected: baseColors.white,
    disabled: baseColors.disabled.gray,
    error: baseColors.status.error,
    ghost:  baseColors.green.foam,
    ghostHover: baseColors.green.sinbad,
    inputs: baseColors.gray.charcoal
  },
  status: {
    error: baseColors.status.error,
    success: baseColors.status.success,
  },
  button: {
    primary: baseColors.green.tradewind,
    primaryHover: baseColors.green.halfBaked,
    secondary: baseColors.green.foam,
    secondaryHover: baseColors.green.sinbad,
    tertiary: baseColors.green.tradewind,
    tertiaryHover: baseColors.green.swamp,
    disabled: baseColors.disabled.gray
  },
  links: {
    // Update with links states
  }
}
