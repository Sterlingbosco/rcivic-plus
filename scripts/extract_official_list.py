"""Extrait une liste officielle de questions de connaissance (profil CR ou NAT) vers data/reference-audit-<profil>.json.

Pour un PDF officiel (liste naturalisation) : --pdf liste.pdf à la place de --html (nécessite pypdf).

Usage (Windows : télécharger d'abord la page avec curl.exe, le certificat local bloque parfois urllib) :
  curl.exe -sS -L -o liste.html <url de la liste officielle>
  py -3 scripts/extract_official_list.py --profile CR --html liste.html --url <url> --expected 40,42,33,39,34

Le fichier produit garde le même format que `officialQuestions` de data/reference-audit.json
(theme, question, status) : les énoncés sont copiés à l'identique, jamais reformulés.
"""

import argparse
import hashlib
import json
import re
from datetime import date
from html.parser import HTMLParser
from pathlib import Path


class ListParser(HTMLParser):
    def __init__(self, marker):
        super().__init__()
        self.marker = marker
        self.active = False
        self.capture = None
        self.text = []
        self.theme = None
        self.questions = []

    def handle_starttag(self, tag, attrs):
        if tag == "footer":
            self.active = False
        if tag in ("h1", "h2", "p", "strong", "b", "li") and self.capture is None:
            self.capture = tag
            self.text = []

    def handle_data(self, text):
        if self.capture:
            self.text.append(text)

    def handle_endtag(self, tag):
        if tag != self.capture:
            return
        text = re.sub(r"\s+", " ", "".join(self.text)).strip()
        if tag == "h1" and "Liste officielle des questions" in text and self.marker in text:
            self.active = True
        elif self.active and tag in ("h2", "p", "strong", "b") and text.endswith(":") and len(text) < 100:
            self.theme = text.rstrip(" :")
        elif self.active and tag == "li" and self.theme:
            self.questions.append({"theme": self.theme, "question": text, "status": "answer_pending_review"})
        self.capture = None


PDF_THEMES = {
    "Principes et valeurs de la République",
    "Système institutionnel et politique",
    "Droits et devoirs",
    "Histoire, géographie et culture",
    "Histoire géographie et culture",
    "Vivre dans la société française",
}


def parse_pdf(path):
    """Un énoncé par ligne ; une ligne qui ne finit pas par ? : \" est la première moitié d'un énoncé coupé."""
    from pypdf import PdfReader

    lines = []
    for page in PdfReader(str(path)).pages:
        lines += [re.sub(r"\s+", " ", line).strip() for line in (page.extract_text() or "").split("\n")]
    questions, theme, pending = [], None, ""
    for line in lines:
        if not line or line == "Intitulé de la question":
            continue
        if line == "?":  # cellule vide du document officiel : ce n'est pas un énoncé
            print("Avertissement : ligne « ? » isolée ignorée (artefact du PDF officiel).")
            continue
        if line in PDF_THEMES:
            theme = line.replace("Histoire géographie", "Histoire, géographie")
            continue
        text = f"{pending} {line}".strip() if pending else line
        if not re.search(r'(\?|:|"|\.\.\.)$', text):
            pending = text
            continue
        pending = ""
        questions.append({"theme": theme, "question": text, "status": "answer_pending_review"})
    if pending:
        raise SystemExit(f"Énoncé coupé non terminé : {pending!r}")
    return questions


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--profile", required=True, choices=["CR", "NAT"])
    parser.add_argument("--html", type=Path)
    parser.add_argument("--pdf", type=Path)
    parser.add_argument("--url", required=True)
    parser.add_argument("--marker", help="texte du titre h1 identifiant la liste (défaut : le profil)")
    parser.add_argument("--expected", help="effectifs attendus par thème, séparés par des virgules")
    parser.add_argument("--checked-at", default=date.today().isoformat())
    args = parser.parse_args()
    source = args.pdf or args.html
    if not source:
        raise SystemExit("--html ou --pdf obligatoire")
    raw = source.read_bytes()
    if args.pdf:
        extracted = parse_pdf(args.pdf)
    else:
        extractor = ListParser(args.marker or args.profile)
        extractor.feed(raw.decode("utf-8"))
        extracted = extractor.questions
    themes = []
    for entry in extracted:
        if entry["theme"] not in themes:
            themes.append(entry["theme"])
    counts = [sum(q["theme"] == theme for q in extracted) for theme in themes]
    if args.expected and counts != [int(value) for value in args.expected.split(",")]:
        raise SystemExit(f"Effectifs inattendus : {counts} au lieu de {args.expected} — aucun export")
    if len(extracted) < 20:
        raise SystemExit("Extraction incomplète : aucun export")
    data = {
        "profile": args.profile,
        "checkedAt": args.checked_at,
        "sourceUrl": args.url,
        "documentSha256": hashlib.sha256(raw).hexdigest(),
        "officialQuestions": extracted,
    }
    out = Path("data") / f"reference-audit-{args.profile.lower()}.json"
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"profile": args.profile, "total": len(extracted), "themes": dict(zip(themes, counts))}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
