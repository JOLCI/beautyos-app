export function hexToHSL(hex: string): string {
  let r = 0,
    g = 0,
    b = 0
  if (hex.length === 4) {
    r = parseInt('0x' + hex[1] + hex[1])
    g = parseInt('0x' + hex[2] + hex[2])
    b = parseInt('0x' + hex[3] + hex[3])
  } else if (hex.length === 7) {
    r = parseInt('0x' + hex[1] + hex[2])
    g = parseInt('0x' + hex[3] + hex[4])
    b = parseInt('0x' + hex[5] + hex[6])
  }
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function applyTheme(primaryHex: string, secondaryHex?: string) {
  const p = hexToHSL(primaryHex)
  document.documentElement.style.setProperty('--primary', p)
  document.documentElement.style.setProperty('--ring', p)
  document.documentElement.style.setProperty('--sidebar-primary', p)
  document.documentElement.style.setProperty('--sidebar-ring', p)

  if (secondaryHex) {
    const s = hexToHSL(secondaryHex)
    document.documentElement.style.setProperty('--secondary', s)
  }
}
