"""
Generates an original, royalty-free ambient background pad for the AgentGraph
demo video. Pure synthesis (sine/triangle partials + slow envelopes) — no
samples, no third-party audio, so there's no licensing question.

Usage: python3 scripts/generate_bgm.py
Output: public/audio/bgm.wav
"""

import numpy as np
import wave
import struct

SR = 44100
TOTAL_DUR = 63.0  # slightly longer than the video; Remotion truncates cleanly
N = int(SR * TOTAL_DUR)
t = np.linspace(0, TOTAL_DUR, N, endpoint=False)

# Four-chord slow progression (Am7 - Fmaj7 - Cmaj7 - Gadd9), one every ~15.75s,
# with wide overlapping windows so chords crossfade into each other.
CHORDS = [
    [110.00, 130.81, 164.81, 196.00],  # Am7
    [87.31, 110.00, 130.81, 164.81],  # Fmaj7
    [130.81, 164.81, 196.00, 246.94],  # Cmaj7
    [98.00, 123.47, 146.83, 220.00],  # Gadd9
]

slot = TOTAL_DUR / len(CHORDS)
window_width = slot * 1.7


def hann_window(times, center, width):
    x = (times - center) / width
    w = np.zeros_like(times)
    mask = np.abs(x) <= 0.5
    w[mask] = 0.5 * (1 + np.cos(2 * np.pi * x[mask]))
    return w


def make_channel(detune_cents):
    detune = 2 ** (detune_cents / 1200)
    out = np.zeros(N)
    for i, notes in enumerate(CHORDS):
        center = slot * 0.5 + i * slot
        env = hann_window(t, center, window_width)
        if not np.any(env):
            continue
        chord_signal = np.zeros(N)
        for note_idx, freq in enumerate(notes):
            f = freq * detune
            # Slow amplitude LFO per note for gentle, non-static movement.
            lfo = 1.0 + 0.06 * np.sin(2 * np.pi * (0.07 + 0.01 * note_idx) * t + note_idx)
            partial = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * f * 2 * t)
            chord_signal += (partial * lfo) / len(notes)
        out += chord_signal * env
    return out


left = make_channel(-3)
right = make_channel(3)

# Very soft filtered noise for air/texture (simple moving-average low-pass).
rng = np.random.default_rng(7)
noise = rng.normal(0, 1, N)
kernel = np.ones(180) / 180
noise = np.convolve(noise, kernel, mode="same")
noise = noise / (np.max(np.abs(noise)) + 1e-9) * 0.02
left += noise
right += noise * 0.98

# Overall fade in / fade out envelope.
fade_in_end = 2.5
fade_out_start = 55.0
master_env = np.ones(N)
fade_in_mask = t < fade_in_end
master_env[fade_in_mask] = 0.5 * (1 - np.cos(np.pi * t[fade_in_mask] / fade_in_end))
fade_out_mask = t > fade_out_start
fo = (t[fade_out_mask] - fade_out_start) / (TOTAL_DUR - fade_out_start)
master_env[fade_out_mask] = 0.5 * (1 + np.cos(np.pi * fo))

left *= master_env
right *= master_env

# Normalize to a quiet, unobtrusive background level.
peak = max(np.max(np.abs(left)), np.max(np.abs(right)))
target_peak = 0.22
left = left / peak * target_peak
right = right / peak * target_peak

stereo = np.empty((N, 2), dtype=np.float32)
stereo[:, 0] = left
stereo[:, 1] = right

pcm16 = np.clip(stereo * 32767, -32768, 32767).astype(np.int16)

with wave.open("public/audio/bgm.wav", "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes(pcm16.tobytes())

print(f"Wrote public/audio/bgm.wav — {TOTAL_DUR}s, peak {target_peak}")
