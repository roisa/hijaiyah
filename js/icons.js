/* Rounded line icons in the spirit of iOS SF Symbols (same drawing style as babymo-app/www/bm-icons.js).
   HJ.ic("speaker") → an <svg> string that uses currentColor. */
(function () {
  var S = 'fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"';
  var D = 'fill="currentColor" fill-opacity=".24" stroke="none"';
  var F = 'fill="currentColor" stroke="none"';
  var P = {
    close: '<path ' + S + ' d="M6 6l12 12M18 6 6 18"/>',
    back: '<path ' + S + ' d="M15 4.5 7.5 12l7.5 7.5"/>',
    chevR: '<path ' + S + ' d="M9 4.5l7.5 7.5L9 19.5"/>',
    play: '<path ' + F + ' d="M7.5 4.6v14.8L19.6 12z"/>',
    next: '<path ' + S + ' d="M5 12h13.5M13 5.5l6.5 6.5-6.5 6.5"/>',
    skip: '<path ' + F + ' d="M5 5.5v13l9-6.5z"/><path ' + S + ' d="M18 5.5v13"/>',
    replay: '<path ' + S + ' d="M20.2 12.4A8.2 8.2 0 1 1 17.6 6"/><path ' + S + ' d="M19.8 2.9v4.6h-4.6"/>',
    speaker: '<path ' + D + ' d="M4 9.2h3.6L12.5 5v14l-4.9-4.2H4z"/><path ' + S + ' d="M4 9.2h3.6L12.5 5v14l-4.9-4.2H4z"/><path ' + S + ' d="M16 9a4.3 4.3 0 0 1 0 6M18.8 6.4a8 8 0 0 1 0 11.2"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3" ' + D + '/><rect x="9" y="3" width="6" height="11" rx="3" ' + S + '/><path ' + S + ' d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="3" ' + F + '/>',
    ear: '<path ' + S + ' d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-6 0"/><path ' + S + ' d="M10 9a2 2 0 0 1 4 0"/>',
    gear: '<circle cx="12" cy="12" r="3.2" ' + S + '/><path ' + S + ' d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    gamepad: '<path ' + S + ' d="M7 7.5h10a4.2 4.2 0 0 1 4.1 5l-.8 4.1a2.3 2.3 0 0 1-4 1.1L14.6 16H9.4l-1.7 1.7a2.3 2.3 0 0 1-4-1.1l-.8-4.1A4.2 4.2 0 0 1 7 7.5z"/><path ' + S + ' d="M8 10.3v3.4M6.3 12h3.4"/><circle cx="15.3" cy="11" r=".9" ' + F + '/><circle cx="17.5" cy="13.1" r=".9" ' + F + '/>',
    map: '<path ' + D + ' d="M9 4.5 3.5 6.6v13l5.5-2.1 6 2.1 5.5-2.1v-13L15 6.6z"/><path ' + S + ' d="M9 4.5 3.5 6.6v13l5.5-2.1 6 2.1 5.5-2.1v-13L15 6.6zM9 4.5v13M15 6.6v13"/>',
    sticker: '<path ' + S + ' d="M12 3.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
    user: '<circle cx="12" cy="8" r="4" ' + S + '/><path ' + S + ' d="M4 21a8 8 0 0 1 16 0"/>',
    family: '<circle cx="8" cy="7.5" r="3" ' + S + '/><circle cx="16.5" cy="9" r="2.4" ' + S + '/><path ' + S + ' d="M2.8 20a5.2 5.2 0 0 1 10.4 0M13.5 20a3.6 3.6 0 0 1 7.2 0"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="3" ' + D + '/><rect x="5" y="10.5" width="14" height="10" rx="3" ' + S + '/><path ' + S + ' d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    check: '<path ' + S + ' d="M5 12.5l4.5 4.5L19 7.5"/>',
    heart: '<path ' + F + ' d="M12 20.5s-8-4.6-8-10.4A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8 2.5c0 5.8-8 10.4-8 10.4z"/>',
    bulb: '<path ' + S + ' d="M9 17.5h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.8.6 1.1 1.4 1.1 2.2h5c0-.8.3-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
    trash: '<path ' + S + ' d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
    hand: '<path ' + S + ' d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V4.5a1.5 1.5 0 0 1 3 0V12M14 11.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-.5a6 6 0 0 1-4.9-2.6L3.5 14.5a1.5 1.5 0 0 1 2.4-1.8L8 15"/>',
    mouth: '<path ' + S + ' d="M4 12c2.5-3 13.5-3 16 0-2.5 4-13.5 4-16 0z"/><path ' + S + ' d="M4 12h16"/>',
    book: '<path ' + D + ' d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path ' + S + ' d="M4 20.5V5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5zA2.5 2.5 0 0 0 6.5 21H20"/>'
  };
  HJ.ic = function (n, cls) { return '<svg class="ic ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || "") + "</svg>"; };
})();
