/* Baby Mo Hijaiyah — little drawn pictures along each book's trail on the learning map.
   Flat and soft like the level backgrounds (bg.js): a 48×48 box, a light top, a darker side, no outlines.
   No people, prophets or angels; the Qur'an Gate uses a moon, stars, lanterns, a dome and palms only. */
(function () {
  function S(inner) { return '<svg viewBox="0 0 48 48" aria-hidden="true">' + inner + "</svg>"; }
  var A = {
    palm: S('<path d="M23 46 C22 34 24 22 27 15" stroke="#B9824F" stroke-width="4" fill="none" stroke-linecap="round"/>' +
      '<path d="M24 44 C23.5 36 25 26 27 18" stroke="#D9A46C" stroke-width="1.6" fill="none" stroke-dasharray="2 3"/>' +
      '<path d="M27 15 C20 8 10 9 5 15 C13 13 20 14 27 17Z" fill="#3FB56A"/><path d="M27 15 C34 7 43 9 46 16 C38 13 32 14 27 17Z" fill="#2E9E57"/>' +
      '<path d="M27 15 C24 6 29 1 35 2 C31 6 29 10 28 16Z" fill="#4FCB7A"/><path d="M27 16 C19 16 12 22 11 29 C16 23 21 19 27 17Z" fill="#2E9E57"/>' +
      '<path d="M27 16 C34 17 39 23 39 30 C35 24 31 20 27 17Z" fill="#3FB56A"/><circle cx="25" cy="18" r="2.6" fill="#8A5A2B"/><circle cx="29" cy="18.5" r="2.4" fill="#7A4E24"/>'),
    shell: S('<path d="M24 10 C36 10 44 22 42 34 L24 40 L6 34 C4 22 12 10 24 10Z" fill="#FFB3A7"/>' +
      '<path d="M24 40 L24 11 M24 40 L15 13 M24 40 L33 13 M24 40 L9 20 M24 40 L39 20" stroke="#F08A7C" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M18 37 L30 37 L28 43 L20 43Z" fill="#F08A7C"/><path d="M13 16 C16 13 19 12 22 12" stroke="#FFE1DB" stroke-width="2" fill="none" stroke-linecap="round"/>'),
    crab: S('<path d="M8 20 C4 14 6 8 11 8 C10 12 12 14 14 14Z" fill="#F0563F"/><path d="M40 20 C44 14 42 8 37 8 C38 12 36 14 34 14Z" fill="#F0563F"/>' +
      '<path d="M12 33 L5 38 M14 36 L9 42 M36 33 L43 38 M34 36 L39 42 M13 21 L10 17 M35 21 L38 17" stroke="#D9402C" stroke-width="2.6" stroke-linecap="round"/>' +
      '<ellipse cx="24" cy="29" rx="14" ry="10" fill="#FF6B52"/><ellipse cx="22" cy="25" rx="8" ry="3.5" fill="#FF9A86"/>' +
      '<path d="M20 22 L19 16 M28 22 L29 16" stroke="#D9402C" stroke-width="2"/><circle cx="19" cy="15" r="3" fill="#fff"/><circle cx="29" cy="15" r="3" fill="#fff"/>' +
      '<circle cx="19.5" cy="15.5" r="1.5" fill="#2B2B3A"/><circle cx="29.5" cy="15.5" r="1.5" fill="#2B2B3A"/><path d="M21 32 Q24 34 27 32" stroke="#B5301F" stroke-width="1.6" fill="none" stroke-linecap="round"/>'),
    hibiscus: S('<g transform="translate(24 24)">' + [0, 72, 144, 216, 288].map(function (a) { return '<ellipse rx="8" ry="11" cy="-10" fill="#FF5C8A" transform="rotate(' + a + ')"/>'; }).join("") +
      [36, 108, 180, 252, 324].map(function (a) { return '<path d="M0 0 L0 -14" stroke="#E23D6D" stroke-width="1.4" transform="rotate(' + a + ')"/>'; }).join("") +
      '<circle r="5" fill="#E23D6D"/><path d="M0 0 L6 -12" stroke="#FFD43B" stroke-width="1.6"/><circle cx="6" cy="-12" r="2" fill="#FFD43B"/></g>'),
    boat: S('<path d="M23 6 L23 32" stroke="#8A5A2B" stroke-width="2.4"/><path d="M24 7 L38 30 L24 30Z" fill="#fff"/><path d="M22 11 L11 30 L22 30Z" fill="#FFD43B"/>' +
      '<path d="M5 33 L43 33 L37 42 L11 42Z" fill="#E8553E"/><path d="M5 33 L43 33 L42 35 L6 35Z" fill="#FF8A6E"/>' +
      '<path d="M2 44 Q8 41 14 44 T26 44 T38 44 T48 44" stroke="#4FB6E8" stroke-width="2.4" fill="none" stroke-linecap="round"/>'),
    turtle: S('<ellipse cx="40" cy="30" rx="5" ry="4.2" fill="#7BCB6A"/><circle cx="41.5" cy="28.6" r="1.1" fill="#2B2B3A"/>' +
      '<ellipse cx="12" cy="38" rx="4" ry="3" fill="#7BCB6A"/><ellipse cx="32" cy="38" rx="4" ry="3" fill="#7BCB6A"/><path d="M6 32 L2 33" stroke="#7BCB6A" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M5 34 C5 20 14 14 22 14 C30 14 38 20 38 34Z" fill="#2E9E57"/><path d="M14 22 L22 18 L30 22 L28 30 L16 30Z" fill="#4FCB7A"/>' +
      '<path d="M5 34 L38 34" stroke="#1F7A41" stroke-width="2.4"/>'),
    // forest
    tree: S('<rect x="21" y="30" width="6" height="15" rx="2" fill="#9A6A3A"/><circle cx="24" cy="20" r="14" fill="#3FA34D"/>' +
      '<circle cx="15" cy="25" r="9" fill="#358F42"/><circle cx="33" cy="25" r="9" fill="#358F42"/><circle cx="20" cy="14" r="7" fill="#5CC46A"/>' +
      '<circle cx="31" cy="19" r="2" fill="#FF5C5C"/><circle cx="17" cy="26" r="2" fill="#FF5C5C"/><circle cx="26" cy="27" r="2" fill="#FF5C5C"/>'),
    mushroom: S('<path d="M18 26 L30 26 L31 42 C31 44 17 44 17 42Z" fill="#FFF1DC"/><path d="M26 27 L30 27 L31 42 C30 43 28 43.5 27 43.5Z" fill="#EBD5B5"/>' +
      '<path d="M4 28 C4 14 13 7 24 7 C35 7 44 14 44 28Z" fill="#F0453A"/><path d="M8 27 C9 16 15 10 24 9" stroke="#FF7A6E" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="16" cy="17" r="3.2" fill="#fff"/><circle cx="29" cy="13" r="2.6" fill="#fff"/><circle cx="35" cy="22" r="3" fill="#fff"/><circle cx="23" cy="23" r="2.2" fill="#fff"/>'),
    butterfly: S('<path d="M24 22 C14 6 2 10 5 20 C7 26 15 26 24 24Z" fill="#7B6CF6"/><path d="M24 22 C34 6 46 10 43 20 C41 26 33 26 24 24Z" fill="#7B6CF6"/>' +
      '<path d="M24 25 C15 27 9 34 13 39 C17 42 22 36 24 28Z" fill="#FF8FC8"/><path d="M24 25 C33 27 39 34 35 39 C31 42 26 36 24 28Z" fill="#FF8FC8"/>' +
      '<circle cx="12" cy="17" r="3" fill="#FFD43B"/><circle cx="36" cy="17" r="3" fill="#FFD43B"/><rect x="22.5" y="16" width="3" height="20" rx="1.5" fill="#3A3355"/>' +
      '<path d="M23.5 17 Q20 10 18 9 M24.5 17 Q28 10 30 9" stroke="#3A3355" stroke-width="1.3" fill="none"/>'),
    daisy: S('<path d="M24 46 L24 26" stroke="#3FA34D" stroke-width="2.6"/><path d="M24 38 C18 36 15 32 15 30 C20 31 23 34 24 38Z" fill="#5CC46A"/>' +
      '<g transform="translate(24 20)">' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<ellipse rx="3.8" ry="8.2" cy="-8" fill="#fff" stroke="#C9B8EE" stroke-width="1.4" transform="rotate(' + a + ')"/>'; }).join("") +
      '<circle r="5" fill="#FFC21A"/><circle r="5" fill="#FFD95A" transform="translate(-1 -1) scale(.6)"/></g>'),
    ladybug: S('<path d="M12 28 L6 26 M12 34 L6 36 M36 28 L42 26 M36 34 L42 36 M16 38 L12 43 M32 38 L36 43" stroke="#3A3355" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="24" cy="14" r="7" fill="#3A3355"/><ellipse cx="24" cy="29" rx="14" ry="13" fill="#F0453A"/><path d="M24 16 L24 42" stroke="#3A3355" stroke-width="2"/>' +
      '<circle cx="17" cy="25" r="3" fill="#3A3355"/><circle cx="31" cy="25" r="3" fill="#3A3355"/><circle cx="18" cy="34" r="2.4" fill="#3A3355"/><circle cx="30" cy="34" r="2.4" fill="#3A3355"/>' +
      '<path d="M14 22 C16 19 19 17 21 17" stroke="#FF8A80" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="21" cy="12" r="1.5" fill="#fff"/><circle cx="27" cy="12" r="1.5" fill="#fff"/>'),
    // mountain
    mountain: S('<path d="M2 44 L18 14 L34 44Z" fill="#6E93D6"/><path d="M18 14 L34 44 L24 44 Z" fill="#5A7EC2"/><path d="M14 44 L31 10 L47 44Z" fill="#7FA6E6"/>' +
      '<path d="M31 10 L47 44 L38 44Z" fill="#6890D6"/><path d="M31 10 L36 20 L33 18 L30 21 L27 18Z" fill="#fff"/><path d="M18 14 L22 22 L19 20 L16 22 L14 21Z" fill="#fff"/>'),
    pine: S('<rect x="21.5" y="38" width="5" height="8" rx="1.5" fill="#8A5A2B"/><path d="M24 4 L34 18 L29 18 L37 29 L31 29 L40 40 L8 40 L17 29 L11 29 L19 18 L14 18Z" fill="#2F8F5B"/>' +
      '<path d="M24 4 L34 18 L29 18 L37 29 L31 29 L40 40 L24 40Z" fill="#257A4C"/><path d="M15 26 L21 26 M13 36 L20 36" stroke="#4FB57A" stroke-width="2" stroke-linecap="round"/>'),
    cloud: S('<path d="M10 36 C3 36 2 27 9 25 C8 16 19 12 24 18 C27 10 40 11 40 21 C47 21 47 33 40 36Z" fill="#fff" stroke="#A9C6EA" stroke-width="1.6"/>' +
      '<path d="M10 35 L40 35 C44 34 45 32 44.5 29.5 C41 33 14 33.5 6.5 31.5 C7.5 33.5 8.5 35 10 35Z" fill="#CFE0F5"/><circle cx="17" cy="29" r="1.4" fill="#5A7EC2"/><circle cx="29" cy="29" r="1.4" fill="#5A7EC2"/><path d="M21 31.5 Q23 33 25 31.5" stroke="#5A7EC2" stroke-width="1.2" fill="none" stroke-linecap="round"/>'),
    edelweiss: S('<path d="M24 46 L24 28" stroke="#4FA36A" stroke-width="2.6"/><g transform="translate(24 20)">' +
      [0, 60, 120, 180, 240, 300].map(function (a) { return '<path d="M0 0 L-4 -9 L0 -15 L4 -9Z" fill="#FFB3D9" transform="rotate(' + a + ')"/>'; }).join("") +
      '<circle r="5" fill="#FFE27A"/><circle cx="-1.5" cy="-1" r="1.2" fill="#F5B300"/><circle cx="1.5" cy="1" r="1.2" fill="#F5B300"/></g>'),
    bird: S('<path d="M10 26 C14 18 22 16 26 22 C30 16 40 16 44 22 C38 21 33 23 30 28 C27 26 24 26 22 28 C18 24 14 24 10 26Z" fill="#3B7DD8"/>' +
      '<ellipse cx="24" cy="28" rx="7" ry="5" fill="#5A9BEA"/><circle cx="18.5" cy="26" r="3.2" fill="#5A9BEA"/><circle cx="17.8" cy="25.4" r="1" fill="#1D2B4A"/><path d="M15 26.5 L12 28 L15.5 28.4Z" fill="#FFB020"/>'),
    // sea
    fish: S('<path d="M34 24 L46 15 L44 24 L46 33Z" fill="#FF8A3D"/><ellipse cx="21" cy="24" rx="16" ry="11" fill="#FFA94D"/><path d="M14 14 C18 9 25 9 28 14Z" fill="#FF8A3D"/>' +
      '<path d="M18 15 C16 20 16 28 18 33 M25 14 C23 20 23 28 25 34" stroke="#FFD9A8" stroke-width="2.4" fill="none"/><circle cx="11" cy="21" r="3.2" fill="#fff"/><circle cx="10.5" cy="21" r="1.7" fill="#2B2B3A"/>' +
      '<circle cx="4" cy="12" r="2" fill="none" stroke="#8FD8F5" stroke-width="1.4"/><circle cx="7" cy="6" r="1.4" fill="none" stroke="#8FD8F5" stroke-width="1.2"/>'),
    octopus: S([10, 17, 24, 31, 38].map(function (x, i) { return '<path d="M' + x + ' 26 C' + (x - 3 + i % 2 * 6) + ' 34 ' + (x + 4 - i % 2 * 8) + ' 38 ' + (x + 1) + ' 45" stroke="#B26CF0" stroke-width="5" fill="none" stroke-linecap="round"/>'; }).join("") +
      '<path d="M6 28 C6 12 14 4 24 4 C34 4 42 12 42 28 C36 31 12 31 6 28Z" fill="#C383FA"/><ellipse cx="17" cy="12" rx="4" ry="2.4" fill="#DDB4FF" transform="rotate(-25 17 12)"/>' +
      '<circle cx="18" cy="19" r="3" fill="#fff"/><circle cx="30" cy="19" r="3" fill="#fff"/><circle cx="18.5" cy="19.5" r="1.6" fill="#2B2B3A"/><circle cx="30.5" cy="19.5" r="1.6" fill="#2B2B3A"/>' +
      '<path d="M21 24 Q24 26.5 27 24" stroke="#7A3FB8" stroke-width="1.6" fill="none" stroke-linecap="round"/>'),
    whale: S('<path d="M22 6 C22 10 24 12 26 12 M26 12 C28 12 30 10 30 6 M26 12 L26 16" stroke="#8FD8F5" stroke-width="2.2" fill="none" stroke-linecap="round"/>' +
      '<path d="M4 30 C4 20 13 16 24 16 C34 16 40 22 42 28 L47 22 L46 34 L42 34 C38 40 30 42 22 42 C10 42 4 37 4 30Z" fill="#3D8FE0"/>' +
      '<path d="M6 32 C10 38 16 40 24 40 C32 40 38 37 41 33 C34 35 14 36 6 32Z" fill="#CFE8FF"/><circle cx="14" cy="27" r="1.8" fill="#1D2B4A"/><ellipse cx="12" cy="31" rx="2.4" ry="1.4" fill="#FF9FB5" opacity=".7"/>'),
    coral: S('<path d="M24 46 L24 30 M24 34 C18 30 16 24 16 18 M24 32 C30 28 32 22 32 14 M16 24 C12 22 10 18 10 14 M32 22 C36 20 38 16 38 12 M24 30 L24 10" stroke="#FF7FA0" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<circle cx="10" cy="13" r="3" fill="#FF9FB8"/><circle cx="16" cy="17" r="3" fill="#FF9FB8"/><circle cx="24" cy="9" r="3" fill="#FF9FB8"/><circle cx="32" cy="13" r="3" fill="#FF9FB8"/><circle cx="38" cy="11" r="3" fill="#FF9FB8"/>' +
      '<path d="M14 46 C14 40 18 38 24 38 C30 38 34 40 34 46Z" fill="#F2C48A"/>'),
    // town
    house: S('<rect x="9" y="22" width="30" height="22" rx="2" fill="#FFE9C7"/><rect x="31" y="22" width="8" height="22" fill="#F5D6A8"/>' +
      '<path d="M5 24 L24 7 L43 24Z" fill="#E8553E"/><path d="M24 7 L43 24 L36 24Z" fill="#C8432F"/><rect x="31" y="9" width="5" height="9" fill="#B3794A"/>' +
      '<rect x="20" y="31" width="8" height="13" rx="4" fill="#8B5CF6"/><rect x="12" y="28" width="6" height="6" rx="1" fill="#8FD8F5"/><rect x="31" y="28" width="5" height="6" rx="1" fill="#8FD8F5"/>'),
    tulip: S('<path d="M24 46 L24 24" stroke="#3FA34D" stroke-width="2.6"/><path d="M24 40 C16 38 13 31 14 27 C20 29 23 34 24 40Z" fill="#5CC46A"/><path d="M24 36 C31 34 34 28 33 24 C28 26 25 30 24 36Z" fill="#4FB55E"/>' +
      '<path d="M14 8 L19 14 L24 6 L29 14 L34 8 L34 18 C34 25 30 28 24 28 C18 28 14 25 14 18Z" fill="#FF5C8A"/><path d="M24 6 L29 14 L34 8 L34 18 C34 25 30 28 24 28Z" fill="#E23D6D"/>'),
    balloon: S('<path d="M24 32 C23 37 26 40 24 46" stroke="#9AA6B5" stroke-width="1.4" fill="none"/><ellipse cx="24" cy="17" rx="12" ry="14" fill="#3D9BFF"/>' +
      '<path d="M22 31 L26 31 L24 34Z" fill="#2A7AD6"/><ellipse cx="19" cy="11" rx="3" ry="5" fill="#9ACBFF" transform="rotate(-20 19 11)"/>'),
    lamp: S('<rect x="22.5" y="14" width="3" height="30" fill="#4A5568"/><rect x="17" y="42" width="14" height="4" rx="2" fill="#4A5568"/><path d="M17 14 L31 14 L28 6 L20 6Z" fill="#4A5568"/>' +
      '<path d="M19 14 L29 14 L27 8 L21 8Z" fill="#FFE27A"/><circle cx="24" cy="11" r="9" fill="#FFE27A" opacity=".25"/>'),
    // tajwid fair
    castle: S('<rect x="8" y="18" width="10" height="26" fill="#FFC58A"/><rect x="30" y="18" width="10" height="26" fill="#F5A35A"/><rect x="14" y="24" width="20" height="20" fill="#FFD3A0"/>' +
      '<path d="M6 18 L13 6 L20 18Z" fill="#E0892B"/><path d="M28 18 L35 6 L42 18Z" fill="#C9701A"/><path d="M13 6 L13 1 L18 3 L13 5" fill="#FF5C8A"/><path d="M35 6 L35 1 L40 3 L35 5" fill="#3D9BFF"/>' +
      '<path d="M14 24 L14 20 L18 20 L18 24 M22 24 L22 20 L26 20 L26 24 M30 24 L30 20 L34 20 L34 24" fill="#FFD3A0"/><path d="M20 44 L20 36 C20 31 28 31 28 36 L28 44Z" fill="#9A5A1A"/>'),
    sunflower: S('<path d="M24 46 L24 28" stroke="#3FA34D" stroke-width="3"/><path d="M24 38 C30 36 33 32 33 29 C28 30 25 34 24 38Z" fill="#5CC46A"/><g transform="translate(24 18)">' +
      [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(function (a) { return '<ellipse rx="3.2" ry="7" cy="-10" fill="#FFC21A" transform="rotate(' + a + ')"/>'; }).join("") +
      '<circle r="7" fill="#8A5A2B"/><circle r="4" fill="#6A4320"/></g>'),
    rainbow: S('<path d="M4 38 A20 20 0 0 1 44 38" stroke="#FF5C5C" stroke-width="4.5" fill="none"/><path d="M8.5 38 A15.5 15.5 0 0 1 39.5 38" stroke="#FFC21A" stroke-width="4.5" fill="none"/>' +
      '<path d="M13 38 A11 11 0 0 1 35 38" stroke="#4FCB7A" stroke-width="4.5" fill="none"/><path d="M17.5 38 A6.5 6.5 0 0 1 30.5 38" stroke="#3D9BFF" stroke-width="4.5" fill="none"/>' +
      '<ellipse cx="7" cy="40" rx="7" ry="4.5" fill="#fff"/><ellipse cx="41" cy="40" rx="7" ry="4.5" fill="#fff"/>'),
    lolly: S('<rect x="22.5" y="26" width="3" height="20" rx="1.5" fill="#E8DCC8"/><circle cx="24" cy="17" r="13" fill="#FF8FC8"/>' +
      '<path d="M24 17 m0 -9 a9 9 0 1 1 -8.5 11.5 a6 6 0 1 1 9.5 -6 a3 3 0 1 1 -3 3" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>'),
    tent: S('<path d="M4 44 L24 8 L44 44Z" fill="#FF6B6B"/><path d="M24 8 L30 44 L18 44Z" fill="#fff"/><path d="M24 8 L44 44 L34 44Z" fill="#E24C4C"/>' +
      '<path d="M24 8 L24 2 L31 4.5 L24 7" fill="#FFC21A"/><path d="M20 44 L24 30 L28 44Z" fill="#7A3FB8"/>'),
    // Qur'an Gate
    moon: S('<path d="M30 6 A18 18 0 1 0 42 34 A14 14 0 1 1 30 6Z" fill="#FFD43B"/><path d="M30 6 A18 18 0 0 0 14 38 A14 14 0 0 1 30 6Z" fill="#FFE57A" opacity=".6"/>'),
    star: S('<path d="M24 4 L29.5 17 L44 18 L33 27.5 L36.5 42 L24 34 L11.5 42 L15 27.5 L4 18 L18.5 17Z" fill="#FFC21A"/><path d="M24 4 L29.5 17 L44 18 L33 27.5 L24 24Z" fill="#FFD95A"/>'),
    lantern: S('<path d="M24 2 L24 8" stroke="#8A6A1E" stroke-width="2"/><path d="M17 8 L31 8 L29 13 L19 13Z" fill="#C9A227"/>' +
      '<path d="M16 13 L32 13 C35 20 35 30 32 37 L16 37 C13 30 13 20 16 13Z" fill="#E8553E"/><path d="M20 15 L28 15 C30 21 30 29 28 35 L20 35 C18 29 18 21 20 15Z" fill="#FFD95A"/>' +
      '<circle cx="24" cy="25" r="11" fill="#FFE27A" opacity=".25"/><path d="M19 37 L29 37 L27 42 L21 42Z" fill="#C9A227"/><path d="M24 42 L24 47" stroke="#C9A227" stroke-width="2"/>'),
    sparkle: S('<path d="M20 8 C21 18 24 21 34 22 C24 23 21 26 20 36 C19 26 16 23 6 22 C16 21 19 18 20 8Z" fill="#FFD43B"/>' +
      '<path d="M37 30 C37.5 35 39 36.5 44 37 C39 37.5 37.5 39 37 44 C36.5 39 35 37.5 30 37 C35 36.5 36.5 35 37 30Z" fill="#FFE57A"/>'),
    dome: S('<rect x="6" y="30" width="36" height="16" fill="#F5E6C8"/><path d="M6 30 L42 30 L42 32 L6 32Z" fill="#E2CFA6"/>' +
      '<path d="M11 30 C11 18 16 13 24 10 C32 13 37 18 37 30Z" fill="#2FA37A"/><path d="M24 10 C32 13 37 18 37 30 L30 30 C30 20 28 14 24 10Z" fill="#23875F"/>' +
      '<path d="M24 10 L24 4" stroke="#C9A227" stroke-width="2"/><path d="M26.5 3.5 A3 3 0 1 1 24 1 A2.4 2.4 0 1 0 26.5 3.5Z" fill="#C9A227"/>' +
      '<path d="M20 46 L20 39 C20 35 28 35 28 39 L28 46Z" fill="#B08A4A"/><path d="M10 46 L10 37 C10 34 15 34 15 37 L15 46Z M33 46 L33 37 C33 34 38 34 38 37 L38 46Z" fill="#D9C08E"/>')
  };
  HJ.mapArt = {
    1: [A.palm, A.shell, A.crab, A.hibiscus, A.boat, A.turtle],
    2: [A.tree, A.mushroom, A.butterfly, A.daisy, A.ladybug, A.tree],
    3: [A.mountain, A.pine, A.cloud, A.edelweiss, A.bird, A.pine],
    4: [A.fish, A.shell, A.octopus, A.whale, A.coral, A.crab],
    5: [A.house, A.tulip, A.balloon, A.lamp, A.house, A.tree],
    6: [A.castle, A.sunflower, A.rainbow, A.lolly, A.tent, A.balloon],
    7: [A.moon, A.star, A.lantern, A.palm, A.sparkle, A.dome]
  };
})();
