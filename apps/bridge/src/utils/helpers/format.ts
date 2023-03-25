const getBITFormatInstance = (
  localses?: string | string[] | undefined,
  options?: Intl.NumberFormatOptions | undefined,
): Intl.NumberFormat => new Intl.NumberFormat(localses, options)

const getUSDCFormatInstance = (
  localses?: string | string[] | undefined,
  options?: Intl.NumberFormatOptions | undefined,
): Intl.NumberFormat => new Intl.NumberFormat(localses, options)

export { getBITFormatInstance, getUSDCFormatInstance }
