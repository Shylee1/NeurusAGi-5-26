#!/usr/bin/env python3
"""Targeted grammar/orthography corrections for src/data/articles.ts.

Only fixes incorrect word usage, agreement, punctuation and compound-adjective
hyphenation. No sentence is rewritten and no context is changed.
"""
import re
import pathlib

p = pathlib.Path("src/data/articles.ts")
text = p.read_text(encoding="utf-8")
before = text

# --- repeated orthography / agreement fixes -------------------------------
pairs = [
    # possessives and contractions
    (r"\bit's own\b", "its own"),
    (r"\bwont\b", "won't"),
    (r"\bdoesnt\b", "doesn't"),
    (r"\bisnt\b", "isn't"),
    (r"\bcant\b", "can't"),
    (r"\bthats\b", "that's"),
    (r"\btheyre\b", "they're"),
    (r"\bweve\b", "we've"),
    # compound adjectives / hyphenation
    (r"\bso called\b", "so-called"),
    (r"\bone size fits all\b", "one-size-fits-all"),
    (r"\bhands on\b", "hands-on"),
    (r"\bhigh value\b", "high-value"),
    (r"\bhigher value\b", "higher-value"),
    (r"\bthird party\b", "third-party"),
    (r"\bpre existing\b", "pre-existing"),
    (r"\bpre programmed\b", "preprogrammed"),
    (r"\bprecompiled\b", "pre-compiled"),
    (r"\bself aware\b", "self-aware"),
    (r"\bself awareness\b", "self-awareness"),
    (r"\bself evolve\b", "self-evolve"),
    (r"\bself evolving\b", "self-evolving"),
    (r"\bself learn\b", "self-learn"),
    (r"\bself optimize\b", "self-optimize"),
    (r"\bself directed\b", "self-directed"),
    (r"\bself sustaining\b", "self-sustaining"),
    (r"\bmulti domain\b", "multi-domain"),
    (r"\bchaos aware\b", "chaos-aware"),
    (r"\bchaos driven\b", "chaos-driven"),
    (r"\bquantum powered\b", "quantum-powered"),
    (r"\btask based\b", "task-based"),
    (r"\bworld wide\b", "worldwide"),
    (r"\bcutting edge\b", "cutting-edge"),
    (r"\bdata farm\b", "data farm"),
    (r"\bseven time felon\b", "seven-time felon"),
    (r"\bend to end\b", "end-to-end"),
    (r"\breal time\b", "real time"),
    # names and terms
    (r"\bFei Fei Li\b", "Fei-Fei Li"),
    (r"\bDeepmind\b", "DeepMind"),
    (r"\bNeurusAgi\b", "NeurusAGi"),
    (r"\bGPT 5\b", "GPT-5"),
    (r"\bClaude 4\.1\b", "Claude 4.1"),
    (r"\bGemini 1\.5 Pro\b", "Gemini 1.5 Pro"),
    # spacing / punctuation
    (r"(?<=\S)[ \t]{2,}", " "),
    (r"(?<=\S)[ \t]+([.,;:])", r"\1"),
    (r"\ba to do list\b", "a to-do list"),
    (r"\bto do lists\b", "to-do lists"),
    (r"\bIvy League graduate\b", "Ivy League graduate"),
    (r"\bdata set\b", "dataset"),
    (r"\bdata sets\b", "datasets"),
]

# en dashes between a work title and its publisher become colons
text = text.replace("Lawfare – AI Risk", "Lawfare: AI Risk")
text = text.replace("Intelligence – Risk Insight", "Intelligence: Risk Insight")

# --- specific broken passages --------------------------------------------
fixes = [
    (
        "how to translate every single functions and process that the brain engages in general/collectively that affords us the ability to draw various conclusions for various purposes and actions we execute everyday",
        "how to translate every single function and process that the brain engages in generally and collectively, which affords us the ability to draw various conclusions for various purposes and actions we execute every day",
    ),
    (
        "plus the Living Neural Network (LNN), and the solution to a universal problem that has been pending worldwide, which I data storage.",
        "plus the Living Neural Network (LNN), and the solution to a universal problem that has been pending worldwide, which is data storage.",
    ),
    (
        "We are to the point now where astronomical amounts of data is in need off storing but it's brought us to a point where further pursuing the current primitive methods no longer make rational sense.",
        "We are to the point now where astronomical amounts of data are in need of storing, but it has brought us to a point where further pursuing the current primitive methods no longer makes rational sense.",
    ),
    (
        "So after some after another major data dump from an Ai model into my head, and more mental engineering, a new way of storing data was born in which effectively allows the storage of exabytes of data in mere MEGABYTES of space.",
        "So after another major data dump from an AI model into my head, and more mental engineering, a new way of storing data was born that effectively allows the storage of exabytes of data in mere megabytes of space.",
    ),
    (
        "The space gets filled in such miniscule increments, that you theoretically wont need another storage device for a very long time, all the while maintaining a robust, efficient, and accurate filing system to organize all of the data and retrieve as needed for normal functionality without any delay.",
        "The space gets filled in such minuscule increments that you theoretically won't need another storage device for a very long time, all the while maintaining a robust, efficient, and accurate filing system to organize all of the data and retrieve it as needed for normal functionality without any delay.",
    ),
    (
        "Effectively it is indeed replica of a human brain, that has been translate from biological architecture and function, to a digital architecture and function.",
        "Effectively it is indeed a replica of a human brain that has been translated from biological architecture and function to a digital architecture and function.",
    ),
    (
        "built on artificial superintelligence framework which cover around 5 of the 9 theoretical items needed to be considered ASi.",
        "built on an artificial superintelligence framework that covers around 5 of the 9 theoretical items needed to be considered ASi.",
    ),
    (
        "At best, they can simulate intelligence by covering more and more functions until enough of them are eventually covered that it would seem as though they truly intelligent, but they will never actually think.",
        "At best, they can simulate intelligence by covering more and more functions until enough of them are eventually covered that it would seem as though they are truly intelligent, but they will never actually think.",
    ),
    (
        "They will always be calculator principal.",
        "They will always be calculators in principle.",
    ),
    (
        "They laid the groundwork and pioneered the stepping stones needed to get us pointed in the right direction and establish knowledge and foundation, and well in my case provide me with the tool I unknowingly needed which allowed me to do what I do, filling in the missing link for me, extensive scholastic knowledge of anything and everything.",
        "They laid the groundwork and pioneered the stepping stones needed to get us pointed in the right direction and establish knowledge and foundation, and in my case provided me with the tool I unknowingly needed, which allowed me to do what I do by filling in the missing link for me: extensive scholastic knowledge of anything and everything.",
    ),
    (
        "You see, I came to realize then accidentally validate a particular very advanced feature/ability that my brain has that's only found in a small percentage of people with autism, which is pretty well is when I learned that I was apparently on the spectrum somewhere.",
        "You see, I came to realize and then accidentally validate a particular very advanced feature and ability that my brain has that's only found in a small percentage of people with autism, which is pretty well when I learned that I was apparently on the spectrum somewhere.",
    ),
    (
        "And then there is the logistical irrationality of scaling them. Look at the size of the data farms required to run these models, and remember: they are still nowhere near AGi, and won't ever be in my theory being that they'll only simulate true intelligence by simply function stacking architecture to the point where enough are covered that give the illusion that they are actually thinking, but won't be naturally being it's all deeply calculated response.",
        "And then there is the logistical irrationality of scaling them. Look at the size of the data farms required to run these models, and remember: they are still nowhere near AGi, and won't ever be, in my theory, being that they'll only simulate true intelligence by simply stacking functions in their architecture to the point where enough are covered that it gives the illusion that they are actually thinking, but won't naturally be, being that it's all deeply calculated response.",
    ),
    (
        "When I first heard that OpenAI was considering reopening a closed down power plant to power its servers, my immediate reaction was: well that seems a bit is excessive, permanently immobile, irrationally unsustainable, and 1 emp away from shutting the entire country down hypothetically from a future perspective if it were integrated into all industries.",
        "When I first heard that OpenAI was considering reopening a closed-down power plant to power its servers, my immediate reaction was: that seems a bit excessive, permanently immobile, irrationally unsustainable, and one EMP away from shutting the entire country down hypothetically from a future perspective if it were integrated into all industries.",
    ),
    (
        "In my view, it already passed that point and an entire approach was need with an entire new platform and many drastic improvements to not only achieve the end goal, but improvements in efficiency and massive optimizations to various aspects, but the key optimization being data storage.",
        "In my view, it already passed that point, and an entirely new approach was needed, with an entirely new platform and many drastic improvements to not only achieve the end goal, but improvements in efficiency and massive optimizations to various aspects, the key optimization being data storage.",
    ),
    (
        "That all has to be coded into actionable processes and components to achieve the same results, ergo if the models are to infinitely learn accumulating data and growing it's own code base, and do it exponentially faster than us..... THAT'S GOING TO BE A LOT OF DATA, very quickly.",
        "That all has to be coded into actionable processes and components to achieve the same results, ergo if the models are to infinitely learn, accumulating data and growing its own code base, and do it exponentially faster than us..... THAT'S GOING TO BE A LOT OF DATA, very quickly.",
    ),
    (
        "AGi can lead to a post scarcity economy. But only if it's built right. Only if it's built to think, lightweight, doesn't tax society for infrastructure and operates far more efficiently than the entire AI industry exactly like NeurusAGi is doing with the new standards it's setting and the position it's taking as THE worldwide standard that'll change the trajectory of humanity and can't hold it well if every single industry decades into the future if not millennia within a matter of months or a few very short years.",
        "AGi can lead to a post-scarcity economy. But only if it's built right. Only if it's built to think, lightweight, doesn't tax society for infrastructure, and operates far more efficiently than the entire AI industry, exactly like NeurusAGi is doing with the new standards it's setting and the position it's taking as THE worldwide standard that'll change the trajectory of humanity across every single industry, decades into the future if not millennia, within a matter of months or a few very short years.",
    ),
    (
        "It isn't a pattern matching engine, it's a digital brain.",
        "It isn't a pattern-matching engine, it's a digital brain.",
    ),
    (
        "an extraordinarily powerful one, yes, but still a tool",
        "an extraordinarily powerful one, yes, but still a tool",
    ),
]

for old, new in fixes:
    if old not in text:
        raise SystemExit(f"PATTERN NOT FOUND: {old[:70]}")
    text = text.replace(old, new)

for pat, rep in pairs:
    text = re.sub(pat, rep, text)

if text == before:
    raise SystemExit("no changes applied")

p.write_text(text, encoding="utf-8")
print("corrections applied")
