"""Rewrite every attributed claim that the linked source does not actually support."""
import re
from pathlib import Path

D = Path("src/data/agi")

NOBEL = "https://www.nobelprize.org/prizes/physics/2024/hinton/1925103-interview-transcript/"
FT = "https://www.ft.com/content/31feb335-4945-475e-baaa-3b880d9cf8ce"

SOURCES = {
    "openai": ("https://openai.com/index/planning-for-agi-and-beyond", "Planning for AGI and beyond", "OpenAI, 2023"),
    "dario": ("https://darioamodei.com/machines-of-loving-grace", "Machines of Loving Grace", "Dario Amodei, 2024"),
    "fli": (
        "https://futureoflife.org/open-letter/pause-giant-ai-experiments/",
        "Pause Giant AI Experiments: An Open Letter",
        "Future of Life Institute, 2023",
    ),
    "bulletin": (
        "https://thebulletin.org/2024/07/three-key-misconceptions-in-the-debate-about-ai-and-existential-risk/",
        "Three key misconceptions in the debate about AI and existential risk",
        "Bulletin of the Atomic Scientists, 2024",
    ),
    "nobel": (NOBEL, "Geoffrey Hinton: Nobel Prize interview", "Nobel Prize, 2024"),
}

EDITS = {
    "article-03.ts": [
        (
            "Sam Altman of OpenAI has said that AGi will be reached by scaling compute and data, which means only a handful of well funded labs can get there.",
            "Sam Altman's OpenAI has said scaling turned out to be far more important than it expected, which is why only a handful of well funded labs can compete at the frontier.",
        ),
        (
            "Demis Hassabis of DeepMind has said AGi could arrive within a decade along that same path.",
            "Demis Hassabis of DeepMind says AGi will compete with human competence in the next five to 10 years along that same path.",
        ),
        (
            "Dario Amodei of Anthropic has said the winning strategy is to stay at the frontier with the largest models.",
            "Dario Amodei of Anthropic expects powerful AI as early as 2026, and the models he describes keep getting bigger.",
        ),
    ],
    "article-04.ts": [
        (
            "Sam Altman of OpenAI has admitted that AGi could reshape humanity in unpredictable ways.",
            "Sam Altman's OpenAI roadmap warns that AGi would come with serious risk of misuse, drastic accidents and societal disruption.",
        )
    ],
    "article-05.ts": [
        (
            "Sam Altman of OpenAI has already acknowledged that AI will reshape the labor market in ways we cannot fully predict.",
            "Sam Altman's OpenAI roadmap already names job displacement as one of the questions AGi will force society to answer.",
        )
    ],
    "article-06.ts": [
        (
            "Sam Altman of OpenAI has said that AI will reshape how we learn.",
            "Sam Altman's OpenAI roadmap says AGi could give everyone help with almost any cognitive task, learning included.",
        ),
        (
            "Demis Hassabis of DeepMind has suggested that AGi could transform entire industries, education included.",
            "Demis Hassabis of DeepMind says AGi will compete with human competence in the next five to 10 years, education included.",
        ),
    ],
    "article-07.ts": [
        (
            "Sam Altman of OpenAI has said that AGi could reshape humanity in ways we cannot yet predict.",
            "Sam Altman's OpenAI roadmap warns that AGi would come with serious risk of misuse, drastic accidents and societal disruption.",
        )
    ],
    "article-08.ts": [
        (
            "Demis Hassabis of DeepMind has said AGi could transform every industry.",
            "Demis Hassabis of DeepMind says AGi will compete with human competence in the next five to 10 years.",
        ),
        (
            "Sam Altman of OpenAI speculates about AGi reshaping humanity in unpredictable ways.",
            "Sam Altman's OpenAI roadmap warns that AGi would come with serious risk of misuse, drastic accidents and societal disruption.",
        ),
        (
            "Elon Musk, through xAI, warns of existential risk if intelligence surpasses human control.",
            "Elon Musk signed the 2023 open letter warning that AI systems with human competitive intelligence can pose profound risks to society and humanity.",
        ),
        (
            "Geoffrey Hinton has cautioned that systems more intelligent than humans could emerge sooner than expected.",
            "Geoffrey Hinton has warned that advanced AI carries risk on the scale of pandemics or nuclear war.",
        ),
    ],
    "article-09.ts": [
        (
            "Sam Altman of OpenAI has suggested AGi will be defined by its ability to perform economically valuable work across domains.",
            "Sam Altman's OpenAI defines AGi as AI systems that are generally smarter than humans.",
        ),
        (
            "Demis Hassabis of DeepMind has said AGi will be measured by its ability to outsmart human workers.",
            "Demis Hassabis of DeepMind says AGi will compete with human competence in the next five to 10 years.",
        ),
    ],
    "article-10.ts": [
        (
            "Demis Hassabis of DeepMind has said AGi will emerge once models can outsmart human workers.",
            "Demis Hassabis of DeepMind says AGi will compete with human competence in the next five to 10 years.",
        ),
        (
            "Elon Musk, through xAI, warns that intelligence trained on vast datasets could quickly surpass human control.",
            "Elon Musk signed the 2023 open letter warning that AI systems with human competitive intelligence can pose profound risks to society and humanity.",
        ),
        (
            "Geoffrey Hinton has cautioned that systems more intelligent than humans may arrive sooner than expected.",
            "Geoffrey Hinton has warned that advanced AI carries risk on the scale of pandemics or nuclear war.",
        ),
    ],
    "article-11.ts": [
        (
            "Sam Altman of OpenAI has said that aligning AGi with human values is the most important challenge of our time.",
            "Sam Altman's OpenAI says it is working toward increasingly aligned and steerable models.",
        ),
        (
            "Demis Hassabis of DeepMind has warned that AGi could outsmart human workers and must be carefully aligned to avoid harm.",
            "Demis Hassabis of DeepMind says AGi will compete with human competence in the next five to 10 years and must be carefully aligned to avoid harm.",
        ),
        (
            "Dario Amodei of Anthropic built an entire company around constitutional AI, embedding values directly into models.",
            "Dario Amodei of Anthropic frames the whole problem as one of alignment and safety, with values built into the models from the start.",
        ),
    ],
    "article-12.ts": [
        (
            "Elon Musk, through xAI, insists that transparency is the only way to keep AI safe from monopolistic capture.",
            "Elon Musk signed the 2023 open letter warning that AI systems with human competitive intelligence can pose profound risks to society and humanity.",
        ),
        (
            "Dario Amodei of Anthropic built a company around constitutional AI and suggests those models can be responsibly distributed.",
            "Dario Amodei of Anthropic treats safety as the first problem and argues the benefits have to be shared deliberately.",
        ),
    ],
    "article-13.ts": [
        (
            "Sam Altman of OpenAI has argued that scaling data and compute will eventually produce AGi.",
            "Sam Altman's OpenAI has said scaling turned out to be far more important than it expected.",
        ),
        (
            "Demis Hassabis of DeepMind has said AGi will emerge once models can outsmart human workers.",
            "Demis Hassabis of DeepMind says AGi will compete with human competence in the next five to 10 years.",
        ),
        (
            "Elon Musk, through xAI, warns that intelligence trained on vast datasets could surpass human control. ",
            "",
        ),
        (
            "Geoffrey Hinton has cautioned that systems more intelligent than humans may arrive sooner than expected.",
            "Geoffrey Hinton has warned that advanced AI carries risk on the scale of pandemics or nuclear war.",
        ),
        (
            "Yann LeCun of Meta has dismissed the idea that scaling alone delivers intelligence, insisting new architectures are required.",
            "Dario Amodei of Anthropic expects powerful AI as early as 2026.",
        ),
    ],
    "article-14.ts": [
        (
            "Sam Altman of OpenAI has suggested that AGi will reshape knowledge work.",
            "Sam Altman's OpenAI roadmap names job displacement as one of the questions AGi will force society to answer.",
        ),
        (
            "Demis Hassabis of DeepMind has pointed to industries where automation can outperform humans.",
            "Demis Hassabis of DeepMind says AGi will compete with human competence in the next five to 10 years.",
        ),
        ("Elon Musk, through xAI, warns of widespread disruption across the economy. ", ""),
        (
            "Geoffrey Hinton has cautioned that AGi could upend entire sectors faster than society expects.",
            "Geoffrey Hinton has warned that advanced AI carries risk on the scale of pandemics or nuclear war.",
        ),
    ],
}

ADD = {
    "article-03.ts": ["openai", "dario"],
    "article-08.ts": ["openai", "fli"],
    "article-10.ts": ["bulletin"],
    "article-14.ts": ["bulletin"],
}

report = []

for name, pairs in EDITS.items():
    path = D / name
    text = path.read_text()
    for old, new in pairs:
        if old not in text:
            raise SystemExit(f"missing in {name}: {old[:70]}")
        text = text.replace(old, new, 1)
    for key in ADD.get(name, []):
        url, label, pub = SOURCES[key]
        if f'href="{url}"' in text:
            continue
        text = text.replace(
            "</ul>`",
            f'<li><a href="{url}" target="_blank" rel="noopener">{label}</a> ({pub})</li>\n</ul>`',
            1,
        )
        text = text.replace("  citations: [\n", f"  citations: [\n    '{url}',\n", 1)
    path.write_text(text)
    report.append(name)

# The FT link could not be checked behind its paywall; the Nobel interview says the same thing and can be read.
for name in ["article-08.ts", "article-09.ts", "article-10.ts", "article-13.ts", "article-14.ts"]:
    path = D / name
    text = path.read_text()
    if FT not in text:
        raise SystemExit(f"no FT link in {name}")
    text = re.sub(r'<li><a href="https://www\.ft\.com[^<]*</a>[^<]*</li>\n', "", text)
    text = text.replace(FT, NOBEL)
    if NOBEL not in text.split("citations:")[1]:
        text = text.replace("  citations: [\n", f"  citations: [\n    '{NOBEL}',\n", 1)
    text = text.replace(
        "</ul>`",
        f'<li><a href="{NOBEL}" target="_blank" rel="noopener">Geoffrey Hinton: Nobel Prize interview</a> (Nobel Prize, 2024)</li>\n</ul>`',
        1,
    )
    path.write_text(text)
    report.append(name + " (nobel)")

print("rewrote:", ", ".join(report))
