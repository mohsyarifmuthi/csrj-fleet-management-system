const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 84" width="84" height="84">
  <rect width="84" height="84" fill="#1a1f4e"/>
  <rect x="12" y="26" width="60" height="3" fill="white"/>
  <rect x="12" y="55" width="60" height="3" fill="white"/>
  <text x="42" y="48" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="bold" fill="white" letter-spacing="2">CSG</text>
</svg>`;

export const logoBase64 = `data:image/svg+xml;base64,${btoa(svgString)}`;