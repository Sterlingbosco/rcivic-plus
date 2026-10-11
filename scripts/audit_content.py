import argparse
import json
import hashlib
import re
from datetime import date
from html.parser import HTMLParser
from urllib.request import Request, urlopen
from pathlib import Path
from zipfile import ZipFile
from xml.etree import ElementTree


def read_docx(path):
    namespace = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    sections = []
    with ZipFile(path) as archive:
        names = [name for name in archive.namelist() if name == "word/document.xml" or name.startswith(("word/header", "word/footer", "word/footnotes", "word/endnotes")) and name.endswith(".xml")]
        for name in names:
            root = ElementTree.fromstring(archive.read(name))
            paragraphs = ["".join(node.text or "" for node in paragraph.findall(".//w:t", namespace)) for paragraph in root.findall(".//w:p", namespace)]
            sections.append({"part": name, "paragraphs": [text for text in paragraphs if text.strip()]})
    return sections


class OfficialParser(HTMLParser):
    def __init__(self):
        super().__init__()
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
        if tag == "h1" and "Liste officielle des questions" in text and "CSP" in text:
            self.active = True
        elif self.active and tag in ("h2", "p", "strong", "b") and text.endswith(":") and len(text) < 100:
            self.theme = text.rstrip(" :")
        elif self.active and tag == "li" and self.theme:
            self.questions.append({"theme": self.theme, "question": text, "status": "answer_pending_review"})
        self.capture = None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("document", type=Path)
    parser.add_argument("--official")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--checked-at", default=date.today().isoformat())
    args = parser.parse_args()
    sections = read_docx(args.document)
    if not args.official:
        print(json.dumps(sections, ensure_ascii=False, indent=2))
        return
    request = Request(args.official, headers={"User-Agent": "RCIVIC-plus-content-audit/0.1"})
    with urlopen(request, timeout=30) as response:
        html = response.read().decode("utf-8")
    official = OfficialParser()
    official.feed(html)
    headings = ["PRINCIPES ET VALEURS DE LA RÉPUBLIQUE", "SYSTÈME INSTITUTIONNEL ET POLITIQUE", "DROITS ET DEVOIRS", "HISTOIRE, GÉOGRAPHIE ET CULTURE", "VIVRE DANS LA SOCIÉTÉ FRANÇAISE"]
    raw = "\n".join(text for section in sections for text in section["paragraphs"])
    client = []
    for index, heading in enumerate(headings):
        start = raw.index(heading) + len(heading)
        end = raw.index(headings[index + 1]) if index + 1 < len(headings) else len(raw)
        client.append({"theme": heading, "answers": [text.strip() for text in raw[start:end].split("•") if text.strip()]})
    if len(official.questions) < 100:
        raise ValueError("Extraction officielle incomplète : aucun export effectué")
    data = {"checkedAt": args.checked_at, "sourceUrl": args.official, "documentSha256": hashlib.sha256(args.document.read_bytes()).hexdigest(), "documentSections": sections, "clientContent": client, "officialQuestions": official.questions}
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    summary = {"officialCount": len(official.questions), "clientCount": sum(len(section["answers"]) for section in client), "themes": [{"theme": section["theme"], "clientCount": len(section["answers"]), "officialCount": sum(question["theme"].upper().replace(",", "") == section["theme"].replace(",", "") for question in official.questions)} for section in client]}
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
