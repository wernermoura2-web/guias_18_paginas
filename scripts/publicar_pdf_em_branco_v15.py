#!/usr/bin/env python3
"""Publica o modelo de 22 páginas BPF v15 a partir das partes binárias versionadas.
Não modifica o PDF: garante o SHA-256 e grava exatamente os bytes validados.
"""
from pathlib import Path
from io import BytesIO
from hashlib import sha256
from zipfile import ZipFile

ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/"assets"/"pdf-v15"
PARTS=sorted(DIR.glob("part-*.bin"))
assert len(PARTS)==14, f"Faltam partes do PDF: {len(PARTS)}/14"
archive=b"".join(p.read_bytes() for p in PARTS)
assert sha256(archive).hexdigest()=="8b282c91fe335fd81feed7ef08f14d82d0f9d0155b0f8b468a1df7c485305354", "ZIP incorreto"
with ZipFile(BytesIO(archive)) as z:
    assert z.namelist()==["Guia_BPF_v15.pdf"], z.namelist()
    pdf=z.read("Guia_BPF_v15.pdf")
assert sha256(pdf).hexdigest()=="f2e8cb2cad5346e8e5daf514a10e8a5567fabf4f0b7c06774c725b724be3c666", "PDF incorreto"
assert pdf.startswith(b"%PDF-") and len(pdf)==11635662
output=ROOT/"Guia_BPF_Em_Branco_Atualizado.pdf"
output.write_bytes(pdf)
print("PDF BPF v15 publicado:",output.name,len(pdf),"bytes, 22 páginas, SHA verificado")
