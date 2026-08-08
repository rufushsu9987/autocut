from __future__ import annotations

import html
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parents[1] / "examples" / "assets" / "infographic"
INK = "#211F1B"
MUTED = "#6F6962"
ACCENT = "#D97757"
SAGE = "#5E8065"
PANEL = "#FFFDF9"
SOFT = "#F1D9CD"


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def svg(label: str, body: str) -> str:
    raw = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 220" role="img" aria-label="{esc(label)}">
  <rect width="520" height="220" fill="none"/>
  <g fill="none" stroke="{INK}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    {body}
  </g>
  <style>
    text {{ font-family: Inter, Arial, sans-serif; fill: {INK}; }}
    .muted {{ fill: {MUTED}; }}
    .accent {{ fill: {ACCENT}; }}
    .sage {{ fill: {SAGE}; }}
  </style>
</svg>
'''
    return '\n'.join(line.rstrip() for line in raw.splitlines()) + '\n'


def problem_art() -> str:
    return svg(
        "散落的內容與檔案堆",
        f'''
        <path d="M58 169 L75 76 L208 63 L228 169 Z" fill="{SOFT}" opacity="0.52"/>
        <path d="M86 176 L100 49 L237 58 L249 176 Z" fill="{PANEL}"/>
        <path d="M132 178 L143 78 L286 88 L278 178 Z" fill="{PANEL}"/>
        <path d="M164 178 L175 104 L292 110 L289 178 Z" fill="{SOFT}" opacity="0.74"/>
        <path d="M100 49 L126 65 L237 58"/>
        <path d="M143 78 L167 93 L286 88"/>
        <path d="M175 104 L198 117 L292 110"/>
        <path d="M56 182 Q173 163 303 184" stroke="{ACCENT}" stroke-width="7" opacity="0.72"/>
        <rect x="250" y="129" width="168" height="49" rx="18" fill="{PANEL}"/>
        <path d="M272 145 h46 M272 160 h87" stroke="{MUTED}" stroke-width="3"/>
        <circle cx="390" cy="153" r="9" fill="{ACCENT}" stroke="none"/>
        <text x="80" y="210" font-size="18" font-weight="800" class="muted" stroke="none">散落的內容</text>
        <text x="314" y="116" font-size="17" font-weight="800" class="accent" stroke="none">REPO / URL / BRIEF</text>
        ''',
    )


def method_art() -> str:
    return svg(
        "Portable Core 方法人物",
        f'''
        <circle cx="236" cy="55" r="27" fill="{PANEL}"/>
        <circle cx="227" cy="54" r="3.5" fill="{INK}" stroke="none"/>
        <circle cx="246" cy="54" r="3.5" fill="{INK}" stroke="none"/>
        <path d="M226 70 Q237 78 248 70"/>
        <path d="M236 83 L236 151"/>
        <path d="M236 102 L182 122"/>
        <path d="M236 102 L289 119"/>
        <path d="M236 151 L199 194"/>
        <path d="M236 151 L274 194"/>
        <rect x="292" y="88" width="55" height="82" rx="10" fill="{SOFT}" transform="rotate(9 319 129)"/>
        <circle cx="319" cy="102" r="3" fill="{ACCENT}" stroke="none"/>
        <path d="M164 118 C131 99 111 100 91 112" stroke="{ACCENT}" stroke-width="6"/>
        <path d="M356 121 C384 107 405 111 425 127" stroke="{SAGE}" stroke-width="6"/>
        <path d="M78 112 l17 -2 l-9 15" fill="{ACCENT}"/>
        <path d="M437 127 l-16 2 l8 -14" fill="{SAGE}"/>
        <text x="145" y="214" font-size="18" font-weight="800" class="accent" stroke="none">STORY + LAYOUT + VERIFY</text>
        ''',
    )


def star_points(cx: float, cy: float, outer: float, inner: float, count: int = 5) -> str:
    import math

    points = []
    for index in range(count * 2):
        angle = -math.pi / 2 + index * math.pi / count
        radius = outer if index % 2 == 0 else inner
        points.append(f"{cx + math.cos(angle) * radius:.1f},{cy + math.sin(angle) * radius:.1f}")
    return " ".join(points)


def result_art() -> str:
    return svg(
        "可交付輸出工作儀表板",
        f'''
        <rect x="52" y="30" width="326" height="163" rx="20" fill="{PANEL}"/>
        <rect x="72" y="48" width="286" height="34" rx="17" fill="{SOFT}" opacity="0.78"/>
        <text x="91" y="71" font-size="18" font-weight="800" stroke="none">交付面板</text>
        <text x="305" y="71" font-size="17" font-weight="800" class="accent" stroke="none">LV. 08</text>
        <text x="76" y="106" font-size="14" font-weight="800" class="muted" stroke="none">本輪進度</text>
        <rect x="76" y="116" width="238" height="17" rx="9" fill="{PANEL}"/>
        <rect x="80" y="120" width="158" height="9" rx="5" fill="{INK}" stroke="none"/>
        <rect x="76" y="147" width="238" height="31" rx="15" fill="{PANEL}"/>
        <circle cx="94" cy="162" r="8" fill="{SAGE}"/>
        <path d="M89 162 l4 4 l7 -9" stroke="{PANEL}" stroke-width="3"/>
        <text x="113" y="168" font-size="15" font-weight="800" stroke="none">可編輯 · 可驗證</text>
        <polygon points="{star_points(427, 116, 41, 18)}" fill="{SOFT}"/>
        <text x="408" y="121" font-size="16" font-weight="900" class="accent" stroke="none">+XP</text>
        <path d="M387 168 l29 23 M416 191 l19 -29" stroke="{ACCENT}" stroke-width="4"/>
        <text x="111" y="214" font-size="18" font-weight="800" class="sage" stroke="none">READY TO SHIP</text>
        ''',
    )


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    assets = {
        "problem.svg": problem_art(),
        "method.svg": method_art(),
        "result.svg": result_art(),
    }
    for name, content in assets.items():
        (OUT_DIR / name).write_text(content, encoding="utf-8")
    print(f"generated {len(assets)} SVG assets in {OUT_DIR}")
    for name in assets:
        print(OUT_DIR / name)


if __name__ == "__main__":
    main()
