/* Single source for studio identity: name, mark, contact and profile links. */
window.BRAND = {
  name: "Late Apex",
  person: "Harshit Chauhan",
  email: "hello@lateapex.studio",       // placeholder until the domain exists
  location: "Mumbai, India",
  github: "https://github.com/harsh4k",
  linkedin: "https://www.linkedin.com/in/harshit-chauhan-17a898364/",
  site: "https://harshh.pages.dev/",
  // Mark: an A whose right leg is a racing line, with the apex marked late.
  mark(size = 28, ink = "currentColor") {
    return `<svg class="mark" width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">` +
      `<path d="M10 54 L27 12" stroke="${ink}" stroke-width="6.5" stroke-linecap="round"/>` +
      `<path d="M27 12 C 35 11, 41 22, 44 32 S 50 50, 55 54" stroke="${ink}" stroke-width="6.5" stroke-linecap="round"/>` +
      `<circle class="mark__apex" cx="43.6" cy="31" r="5.2" fill="#ff3347"/></svg>`;
  },
};
