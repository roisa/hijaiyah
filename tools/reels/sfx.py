#!/usr/bin/env python3
"""Sound effects track for a reel: reads the event log written by kit/reels/engine.js ([{t, k}, …]) and writes a
WAV with a matching sound at each moment. Sounds are synthesised here (no samples, no music — many families prefer
reels without musical instruments; add a nasheed or a voice-over when editing if you like).
Usage: python3 tools/reels/sfx.py log.json duration out.wav"""
import json, sys, wave
import numpy as np

SR = 44100

def env(n, a=0.005, r=0.12):
    t = np.arange(n) / SR
    e = np.minimum(1, t / a) * np.exp(-t / r)
    return e

def tone(f, d, kind="sine", vol=0.3, slide=None, r=None):
    n = int(SR * d); t = np.arange(n) / SR
    fr = f if slide is None else f * (slide / f) ** (t / d)
    ph = 2 * np.pi * np.cumsum(fr) / SR
    w = np.sin(ph) if kind == "sine" else np.sign(np.sin(ph)) * 0.6 if kind == "square" else 2 / np.pi * np.arcsin(np.sin(ph))
    return w * env(n, r=r or d / 3) * vol

def noise(d, vol=0.15, lo=0.2):
    n = int(SR * d); x = np.random.randn(n)
    k = np.ones(8) / 8; x = np.convolve(x, k, mode="same")
    t = np.arange(n) / n
    return x * np.sin(np.pi * t) ** 2 * vol

def seq(parts):
    total = max(int(SR * (o + len(p) / SR)) for o, p in parts) + 1
    out = np.zeros(total)
    for o, p in parts:
        i = int(SR * o); out[i:i + len(p)] += p
    return out

S = {
    "tap": lambda: tone(660, 0.07, "triangle", 0.18),
    "good": lambda: seq([(0, tone(784, 0.14, "triangle", 0.28)), (0.09, tone(1175, 0.22, "triangle", 0.25))]),
    "bad": lambda: tone(240, 0.22, "triangle", 0.18, slide=170),
    "pop": lambda: seq([(0, tone(420, 0.09, "sine", 0.3, slide=1300)), (0.03, tone(900, 0.07, "sine", 0.18))]),
    "whoosh": lambda: noise(0.38, 0.10),
    "boing": lambda: tone(220, 0.35, "sine", 0.28, slide=640, r=0.15),
    "sparkle": lambda: seq([(i * 0.06, tone(f, 0.18, "sine", 0.12)) for i, f in enumerate([1568, 2093, 2637, 3136])]),
    "star": lambda: seq([(0, tone(1319, 0.25, "triangle", 0.22)), (0.05, tone(1976, 0.3, "sine", 0.1))]),
    "combo": lambda: seq([(i * 0.07, tone(523 * 2 ** (s / 12), 0.18, "triangle", 0.22)) for i, s in enumerate([0, 4, 7, 12, 16])]),
    "win": lambda: seq([(i * 0.12, tone(f, 0.26, "triangle", 0.24)) for i, f in enumerate([523, 659, 784, 1047])] + [(0.5, tone(1319, 0.6, "triangle", 0.2))]),
    "draw": lambda: noise(0.5, 0.025),
}

def main():
    log, dur, out = json.load(open(sys.argv[1])), float(sys.argv[2]), sys.argv[3]
    track = np.zeros(int(SR * (dur + 1)))
    last = {}
    for e in log:
        k = e.get("k")
        if k not in S or e["t"] - last.get(k, -9) < 0.05: continue
        last[k] = e["t"]
        s = S[k](); i = int(SR * e["t"]); track[i:i + len(s)] += s[: max(0, len(track) - i)]
    track = track[: int(SR * dur)]
    peak = np.max(np.abs(track)) or 1
    track = np.tanh(track / peak * 1.2) * 0.7
    pcm = (track * 32767).astype(np.int16)
    with wave.open(out, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())

if __name__ == "__main__":
    main()
