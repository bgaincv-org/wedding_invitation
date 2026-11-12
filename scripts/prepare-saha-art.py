"""Extract the supplied SaHa wordmark and wax seal without redrawing either.

Usage: python scripts/prepare-saha-art.py Stamp2.pdf "Slides (1).pdf"
Requires PyMuPDF. Run prepare-saha-art.mjs afterward for the web seal export.
"""
from argparse import ArgumentParser
from pathlib import Path
import fitz


def svg_path(drawing):
    commands, previous = [], None
    for item in drawing['items']:
        kind, start = item[:2]
        if kind not in ('l', 'c'):
            raise ValueError(f'Unexpected wordmark path: {kind}')
        if previous is None or abs(start - previous) > .001:
            if previous is not None:
                commands.append('Z')
            commands.append(f'M{start.x:.3f} {start.y:.3f}')
        if kind == 'l':
            end = item[2]
            commands.append(f'L{end.x:.3f} {end.y:.3f}')
        else:
            commands.append('C' + ' '.join(f'{p.x:.3f} {p.y:.3f}' for p in item[2:]))
            end = item[-1]
        previous = end
    commands.append('Z')
    return ' '.join(commands)


parser = ArgumentParser(description=__doc__)
parser.add_argument('wordmark_pdf', type=Path)
parser.add_argument('seal_pdf', type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
masters = root / 'asset-sources' / 'branding'
public = root / 'public' / 'art' / 'branding'
masters.mkdir(parents=True, exist_ok=True)
public.mkdir(parents=True, exist_ok=True)

with fitz.open(args.wordmark_pdf) as source:
    # Only the standalone SaHa lettering, excluding the other reference designs.
    region = fitz.Rect(495, 390, 615, 450)
    drawings = [d for d in source[0].get_drawings() if region.contains(d['rect'])]
    if len(drawings) != 2:
        raise ValueError('Expected the two original SaHa lettering paths in Stamp2.pdf.')
    bounds = fitz.Rect(drawings[0]['rect'])
    for drawing in drawings[1:]:
        bounds |= drawing['rect']
    bounds += (-1, -1, 1, 1)
    paths = ''.join(f'<path d="{svg_path(d)}"/>' for d in drawings)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="107" height="48" '
           f'viewBox="{bounds.x0:.3f} {bounds.y0:.3f} {bounds.width:.3f} {bounds.height:.3f}">'
           f'<g fill="#231f20">{paths}</g></svg>\n')
    (masters / 'saha-wordmark-original.svg').write_text(svg, encoding='utf-8')
    (public / 'saha-wordmark.svg').write_text(svg.replace('#231f20', '#8e2945'), encoding='utf-8')

    # The supplied interlocking S/ha mark and its two hearts, above the lettering.
    region = fitz.Rect(520, 320, 585, 390)
    monogram = [d for d in source[0].get_drawings() if region.contains(d['rect'])]
    if len(monogram) != 4:
        raise ValueError('Expected four original monogram paths in Stamp2.pdf.')
    bounds = fitz.Rect(monogram[0]['rect'])
    for drawing in monogram[1:]:
        bounds |= drawing['rect']
    bounds += (-1, -1, 1, 1)
    paths = ''.join(f'<path d="{svg_path(d)}"/>' for d in monogram)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="70" '
           f'viewBox="{bounds.x0:.3f} {bounds.y0:.3f} {bounds.width:.3f} {bounds.height:.3f}">'
           f'<g fill="#231f20">{paths}</g></svg>\n')
    (masters / 'saha-monogram-original.svg').write_text(svg, encoding='utf-8')
    (public / 'saha-monogram.svg').write_text(svg.replace('#231f20', '#8e2945'), encoding='utf-8')

with fitz.open(args.seal_pdf) as source:
    page = source[0]
    # The gold wax seal on the left invitation on the first slide. Its native
    # soft mask preserves the original transparent edge and gold texture.
    region = fitz.Rect(380, 530, 490, 645)
    candidates = [info for info in page.get_images(full=True)
                  if info[1] and any(region.contains(r) for r in page.get_image_rects(info[0]))]
    if len(candidates) != 1:
        raise ValueError('Expected one gold wax seal in the first slide.')
    xref, mask = candidates[0][:2]
    seal = fitz.Pixmap(fitz.Pixmap(source, xref), fitz.Pixmap(source, mask))
    seal.save(masters / 'saha-wax-seal-original.png')

print('Extracted the original SaHa vector lettering and transparent gold wax seal.')
