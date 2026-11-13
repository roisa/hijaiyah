/* Baby Mo Hijaiyah — how to write each letter (isolated form), for the tracing game.
   Coordinates are in a 100 × 100 box. Each letter is a list of strokes in writing order; a stroke is an SVG path
   drawn in its writing direction (Arabic: right to left, top to bottom), or a dot {d:[x,y]} that is tapped.
   The same paths draw the guide, the arrows, the demo finger, the checking and the "clean" letter at the end. */
(function () {
  var D = function (x, y) { return { d: [x, y] }; };
  var BOWL = "M80 40 C83 60 75 68 50 68 C27 68 19 61 20 44";
  var JIM = "M28 30 C40 25 56 25 66 30 C50 36 33 46 31 60 C29 76 50 85 72 79";
  var DAL = "M36 20 C52 35 65 52 62 67 C50 74 34 72 23 65";
  var RO = "M58 30 C62 48 57 66 32 80";
  var SIN = "M88 38 Q88 54 80 54 Q75 54 75 44 Q75 54 69 54 Q63 54 63 44 Q63 68 48 73 Q30 78 22 65 Q18 57 21 50";
  var SHOD = "M56 52 C60 38 84 33 86 45 C88 55 70 56 56 53 C56 70 45 77 31 75 C19 73 15 64 18 54";
  var THO = "M22 64 L76 64 C88 52 68 38 52 52 C47 57 44 60 40 63";
  var AIN = "M63 33 C54 25 40 29 42 39 C44 47 58 48 65 47 C45 52 32 62 34 74 C36 85 57 87 71 80";
  var FA = "M74 52 C64 47 64 34 74 32 C84 30 87 44 80 54 C70 66 34 66 17 50";
  var QOF = "M64 48 C55 42 57 28 68 28 C78 28 80 40 72 50 C70 70 56 80 40 78 C26 76 20 66 24 56";
  var S = {
    alif: ["M50 14 L50 86"],
    ba: [BOWL, D(50, 83)], ta: [BOWL, D(42, 30), D(58, 30)], tsa: [BOWL, D(41, 32), D(59, 32), D(50, 20)],
    jim: [JIM, D(50, 60)], hha: [JIM], kho: [JIM, D(46, 15)],
    dal: [DAL], dzal: [DAL, D(27, 10)], ro: [RO], zai: [RO, D(57, 17)],
    sin: [SIN], syin: [SIN, D(69, 27), D(81, 27), D(75, 16)],
    shod: [SHOD], dhod: [SHOD, D(71, 27)],
    tho: [THO, "M46 20 L46 60"], zho: [THO, "M46 20 L46 60", D(64, 36)],
    ain: [AIN], ghin: [AIN, D(52, 16)],
    fa: [FA, D(74, 19)], qof: [QOF, D(62, 15), D(75, 15)],
    kaf: ["M74 22 L74 66 L24 66 C18 66 16 62 18 55", "M46 50 L57 43"],
    lam: ["M66 16 L66 62 C66 82 30 82 28 60"],
    mim: ["M62 46 C77 46 77 27 62 27 C47 27 45 46 62 46 C60 62 58 78 56 92"],
    nun: ["M77 40 C83 72 30 81 21 48", D(50, 34)],
    wau: ["M58 52 C70 52 70 36 58 36 C46 36 46 52 60 52 C62 70 50 80 33 82"],
    ha: ["M58 20 C27 27 26 76 51 78 C79 79 80 42 58 20"],
    ya: ["M70 38 C55 30 49 45 62 51 C79 59 71 74 48 74 C31 74 21 66 23 53", D(41, 86), D(55, 86)]
  };
  HJ.strokes = function (k) { return S[k] || null; };
})();
