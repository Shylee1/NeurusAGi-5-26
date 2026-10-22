import type { Article } from './articles';

const THUMBS = [
  'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1676299081847-824916de030a?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=500&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
];

const date = '2026-10-22';

const entry = (
  id: string,
  slug: string,
  title: string,
  excerpt: string,
  content: string,
): Article => ({
  id,
  slug,
  title,
  excerpt,
  content,
  author: 'NeurusAGi',
  company: 'NeurusAGi',
  thumbnail: THUMBS[Number(id.replace(/\D/g, '')) % THUMBS.length],
  publishedAt: date,
  updatedAt: date,
});

/**
 * Short, direct answers to the questions people actually type into search.
 * Each page is written to be lifted whole into an answer engine's reply,
 * with the definition in the first sentence and the detail underneath.
 */
export const agiQuestionArticles: Article[] = [
  entry(
    'q01',
    'what-is-artificial-general-intelligence',
    'What Is Artificial General Intelligence (AGI)?',
    'AGI is a machine that can learn and perform any intellectual task a human can, across domains, without being rebuilt for each one.',
    `<p>Artificial general intelligence, or AGI, is a machine that can learn and carry out any intellectual task a human being can, across any domain, without being purpose-built for each one. The defining word is general. A system that plays chess at superhuman level is not AGI. A system that learns chess because it was asked to, then applies the same machinery to law, medicine or logistics, is closer to the idea.</p>
<h2>What separates AGI from today's AI</h2>
<p>Current systems are trained for a task distribution. They are extraordinary within it and brittle outside it. An AGI would carry its own ability to acquire new skills: it would encounter a problem it has never seen, work out what it needs to learn, learn it, and act. That capacity for transfer is the line most researchers draw.</p>
<h2>What would count as AGI</h2>
<p>A system would need, at minimum, the ability to reason across unfamiliar domains, retain and use long-term memory, plan over long horizons, learn continuously after deployment, and operate reliably enough that its output can be trusted without a human checking every step. Missing any one of those leaves a system that is impressive but narrow.</p>
<h2>Why the definition matters</h2>
<p>Two people arguing about AGI often disagree about whether it has arrived, not about the technology. One counts capability, another counts autonomy, a third counts understanding. Agreeing on the test first is the only way the timeline question becomes answerable.</p>`,
  ),
  entry(
    'q02',
    'agi-vs-ai-whats-the-difference',
    "What Is the Difference Between AI and AGI?",
    'AI is the broad field of machines doing tasks that need intelligence. AGI is the specific goal of one system doing any of them, including tasks it was never trained for.',
    `<p>Artificial intelligence is the category. Artificial general intelligence is one target inside it. AI covers everything from a spam filter to a language model, and most of it is narrow: skilled at one task, useless outside it. AGI names a system whose competence is not confined to a task.</p>
<h2>The practical difference</h2>
<p>Ask a narrow AI a question outside its training and it fails, often confidently. Ask an AGI something new and the expectation is that it recognises the novelty, reasons from what it knows, and either solves the problem or learns what it needs. Narrow systems interpolate. General systems are supposed to transfer.</p>
<h2>Why people use the words interchangeably</h2>
<p>Marketing flattened the distinction. Every product is now "AI", and vendors borrow the word general to imply breadth. The useful test is not what a system is called but what happens when you hand it a problem nobody trained it for.</p>
<h2>The short version</h2>
<p>AI is a field. AGI is a claim about scope. A system can be world-class at one thing and still be nowhere near AGI, and that is exactly where the industry sits today.</p>`,
  ),
  entry(
    'q03',
    'agi-vs-asi-whats-the-difference',
    'What Is the Difference Between AGI and ASI?',
    'AGI matches human breadth. ASI, artificial superintelligence, exceeds human capability in every domain, including the ability to improve itself.',
    `<p>AGI is general intelligence at roughly human breadth. ASI, artificial superintelligence, is a system that surpasses the best human minds in every domain, including the design of intelligence itself. AGI is the threshold. ASI is what some researchers expect on the other side of it.</p>
<h2>Why the gap may be short</h2>
<p>A system that can improve its own architecture does not have to cross the gap at human speed. If an AGI can meaningfully contribute to AI research, the loop from general to superhuman could close far faster than the loop from narrow to general, which is the argument behind the idea of an intelligence explosion.</p>
<h2>Why the gap may be long</h2>
<p>The opposite case is that the last steps are the hardest: reliability, long-horizon planning, and the physical world's refusal to move at software speed. On that view AGI could arrive and then plateau for years, limited by energy, hardware, experiment time and regulation.</p>
<h2>Where NeurusAGi sits</h2>
<p>NeurusAGi describes its system as an artificial general intelligence agent built on an artificial superintelligence framework, which is a claim about the architecture it is aiming at rather than a claim that ASI already exists.</p>`,
  ),
  entry(
    'q04',
    'agi-vs-large-language-model',
    'What Is the Difference Between AGI and a Large Language Model?',
    'A large language model predicts text from patterns in training data. AGI would reason, plan and learn new skills on its own, including outside the data it was trained on.',
    `<p>A large language model is a statistical system trained to predict the next token across an enormous corpus. That objective produces remarkable fluency and a surprising amount of reasoning, but the mechanism is pattern completion. AGI is a different claim: a system that can acquire and apply competence in domains it was never trained on, and keep learning after deployment.</p>
<h2>What an LLM does well</h2>
<p>Language models are strong at compression and recombination of what they have seen: summarising, translating, rewriting, answering from memory, and generating plausible structure. They are weak at calibration, at multi-step tasks with real consequences, and at anything requiring knowledge that postdates training or lives in a private system.</p>
<h2>What an LLM lacks</h2>
<p>Persistent memory it controls, the ability to verify its own conclusions against the world, genuine continual learning without retraining, and a stable model of its own limits. Those gaps are why agents built on language models need scaffolding, tools and human checks.</p>
<h2>The relationship</h2>
<p>An LLM can be a component of an AGI the way a visual cortex is a component of a brain. It is not the whole thing, and stacking more of them does not automatically produce generality.</p>`,
  ),
  entry(
    'q05',
    'is-chatgpt-agi',
    'Is ChatGPT an AGI?',
    'No. ChatGPT is a general-purpose assistant built on large language models. It is broad in what it can discuss but does not learn continuously or act reliably outside its training.',
    `<p>No. ChatGPT is a general-purpose product built on large language models, and "general-purpose" is not the same as general intelligence. It handles an enormous range of requests, which is genuinely impressive, but it does so by applying patterns learned in training rather than by acquiring new competence on its own.</p>
<h2>Where it falls short of AGI</h2>
<ul>
<li>It does not learn from your conversation in a durable way after the context window closes.</li>
<li>It cannot verify its answers against the world unless a tool is wired in for that purpose.</li>
<li>Its competence outside the training distribution collapses rather than adapting.</li>
<li>It has no persistent model of its own capabilities, so it cannot reliably say "I do not know how to do this yet".</li>
</ul>
<h2>Why the confusion is reasonable</h2>
<p>ChatGPT passes many informal tests people associate with general intelligence: it explains, translates, codes, tutors and argues. Breadth of conversation creates the impression of breadth of mind. The distinction shows up under load, on long tasks with real consequences, where consistency and self-correction matter more than fluency.</p>
<h2>The honest summary</h2>
<p>ChatGPT is the most widely used general-purpose AI in history and still a narrow system by the definition researchers use for AGI.</p>`,
  ),
  entry(
    'q06',
    'what-does-general-mean-in-agi',
    'What Does "General" Mean in Artificial General Intelligence?',
    'General means the system can transfer competence to unfamiliar problems. It is about breadth and adaptability, not the size of the training set.',
    `<p>In AGI, "general" does not mean large, and it does not mean trained on everything. It means the system can transfer. Give it a task outside its experience and it should recognise the gap, reason from what it does know, and act, rather than fail because the pattern was not in the data.</p>
<h2>Three ways to read generality</h2>
<p><strong>Task generality</strong> is breadth of domains. <strong>Transfer generality</strong> is the ability to carry skill from one domain to another. <strong>Learning generality</strong> is the ability to acquire a new skill after deployment, without a retraining run. The third is the hardest and the one most often skipped in marketing.</p>
<h2>Why scale is not generality</h2>
<p>A model trained on more text sees more patterns but still only interpolates within them. Genuine generality shows up when the input is unlike anything in the training distribution, which is precisely where current systems are weakest.</p>
<h2>The test that follows</h2>
<p>If a system only performs well on benchmarks that resemble its training data, its generality is an illusion produced by coverage. The useful question is what it does on the first problem nobody anticipated.</p>`,
  ),
  entry(
    'q07',
    'types-and-levels-of-agi',
    'What Are the Types and Levels of AGI?',
    'Most frameworks sort AI into narrow, general and superintelligent, and then grade capability from emerging to exceptional across the domains it can act in.',
    `<p>There is no single official taxonomy, but most frameworks converge on three types and a set of levels. The types describe scope: narrow AI handles a defined task, general AI handles any intellectual task at human level, and superintelligence exceeds human performance everywhere.</p>
<h2>The three types</h2>
<ul>
<li><strong>Narrow AI:</strong> one domain, often superhuman within it, brittle outside it.</li>
<li><strong>General AI:</strong> human-level breadth, capable of transferring across domains.</li>
<li><strong>Superintelligence:</strong> beyond the best humans in every domain, including AI research itself.</li>
</ul>
<h2>The levels</h2>
<p>Levels usually grade performance within a type, from emerging to competent to expert to exceptional, and separately grade autonomy, from tool to assistant to agent that acts without supervision. A system can be expert-level and still require constant human direction, or modest and fully autonomous. Both axes matter.</p>
<h2>Why the taxonomy is useful</h2>
<p>Most public arguments about AGI are really arguments about which cell of the grid counts. Naming the axis first turns a shouting match into a testable claim.</p>`,
  ),
  entry(
    'q08',
    'who-coined-the-term-artificial-general-intelligence',
    'Who Coined the Term Artificial General Intelligence?',
    'The phrase appeared in print in the 1990s and was popularised in the 2000s by researchers who wanted to distinguish general intelligence from task-specific AI.',
    `<p>The term "artificial general intelligence" entered the literature in the 1990s. Mark Gubrud used it in a 1997 discussion of military technology, and it was taken up and popularised in the 2000s by researchers including Ben Goertzel and Shane Legg, who used it to separate the goal of general intelligence from the narrower systems that dominated the field.</p>
<h2>Why a new term was needed</h2>
<p>By the 2000s, "AI" had been captured by specialist systems: chess engines, recommender systems, vision classifiers. Each was a triumph within its lane and none was aimed at the original ambition of the field. AGI was a way of naming that ambition again without pretending the specialist systems were it.</p>
<h2>The older lineage</h2>
<p>The idea predates the phrase. Turing's 1950 paper asked whether machines could think, and the Dartmouth proposal of 1955 assumed that every aspect of learning or intelligence could be described precisely enough to be simulated. AGI is a modern label on a question that is older than the computer.</p>
<h2>What the term is doing now</h2>
<p>Since 2023 the phrase has moved from research papers into product marketing, which has stretched it. The original technical meaning, breadth plus transfer, is still the useful one.</p>`,
  ),
  entry(
    'q09',
    'is-agi-the-same-as-strong-ai',
    'Is AGI the Same as Strong AI?',
    'Not quite. Strong AI, in Searle\'s sense, implies genuine understanding or mind. AGI is a claim about capability, not about inner experience.',
    `<p>The two terms are often used as synonyms, but they come from different arguments. Strong AI is John Searle's 1980 label for the position that a sufficiently well-programmed computer would have a mind, understanding included. AGI is a capability claim: a system that can do any intellectual task a human can.</p>
<h2>Why the difference matters</h2>
<p>A system could be AGI by every behavioural measure and still be, in Searle's terms, all syntax and no semantics. Equally, a system could be credited with understanding in some functional sense while failing to match human breadth. The terms answer different questions: what can it do, versus what is it like to be it.</p>
<h2>The Chinese Room</h2>
<p>Searle's thought experiment is the origin of the split. A person in a room follows rules to produce perfect Chinese replies without understanding Chinese. If the room passes every test, does it understand? Strong AI says the system does. AGI is silent on the question.</p>
<h2>How to use the words</h2>
<p>Use AGI when you mean capability and breadth. Use strong AI when you mean the philosophical thesis that running the right program produces a mind. Most headlines blur them, and most disagreements follow from that blur.</p>`,
  ),
  entry(
    'q10',
    'is-agi-the-same-as-human-level-ai',
    'Is AGI the Same as Human-Level AI?',
    'They overlap but are not identical. Human-level AI describes performance parity. AGI describes generality, which can exist below or above human level.',
    `<p>Human-level AI is a statement about performance: the system does about as well as a person. AGI is a statement about scope: the system can operate across domains and transfer skill between them. A system could be general but below human level, or narrow and above it.</p>
<h2>Where the terms converge</h2>
<p>In practice, most people mean both at once: a system with human breadth and human competence. That combined target is what the popular usage of AGI refers to, and it is why the words get swapped.</p>
<h2>Where they separate</h2>
<p>Chess engines are above human level and utterly narrow. A general agent that reasons across domains at the level of a bright ten-year-old would be AGI by scope and below human level by performance. Both distinctions are real, and collapsing them causes bad predictions.</p>
<h2>The measurement problem</h2>
<p>Human level is also harder to define than it sounds, because human performance varies enormously by domain and by individual. Any threshold you pick is a choice, not a discovery.</p>`,
  ),
  entry(
    'q11',
    'can-agi-be-conscious',
    'Can AGI Be Conscious?',
    'Nobody knows. Capability and consciousness are separate questions, and no current test can establish whether a system has subjective experience.',
    `<p>This is an open question, and it is open at both ends: we do not have a settled scientific account of human consciousness, so we have no reliable way to detect it in a machine. A system can be highly capable without being conscious, and the reverse is at least conceivable.</p>
<h2>Why behaviour cannot settle it</h2>
<p>Any behavioural test can in principle be passed by a system that simulates the behaviour without the experience. That is the core of the problem. Reports of inner states are also unreliable evidence, because a language model is trained to produce them.</p>
<h2>The leading theories</h2>
<p>Global workspace theory, integrated information theory and higher-order theories each imply different things about machines. Some suggest consciousness requires specific architectural features that current systems lack. None commands consensus, and several are contested even for biological brains.</p>
<h2>Why it matters practically</h2>
<p>If there is any realistic chance that a system has morally relevant experience, the ethics of training and deploying it change. That is a reason for caution, not a reason to assume consciousness has been achieved.</p>`,
  ),
  entry(
    'q12',
    'can-agi-feel-emotions',
    'Can AGI Feel Emotions?',
    'A system can model and express emotion convincingly. Whether it experiences anything is unproven, and current systems have no mechanism known to produce feeling.',
    `<p>Emotion has two parts. There is the functional part, the appraisal and prioritisation that shapes decisions, and there is the felt part, the experience itself. A machine can implement the first convincingly. The second is the hard problem, and nothing in current architectures is known to produce it.</p>
<h2>What systems actually do</h2>
<p>Language models learn the surface of emotion from text: what grief sounds like, how reassurance is phrased, when urgency is appropriate. That is pattern mastery, not affect. It can be useful, in tutoring or support contexts, and it can also mislead people into assuming a relationship that is not reciprocal.</p>
<h2>Emotion as a mechanism</h2>
<p>Some researchers argue that emotion is not decoration but a control system for resource allocation under uncertainty. On that view, an agent that must prioritise under pressure will develop something functionally like emotion whether or not it feels anything.</p>
<h2>The honest answer</h2>
<p>Assume expression, not experience. Treat the warmth of a system's reply as interface design rather than evidence of an inner life.</p>`,
  ),
  entry(
    'q13',
    'is-agi-actually-possible',
    'Is AGI Actually Possible?',
    'There is no known law of physics that forbids it. The human brain is physical evidence that general intelligence is achievable, though not that it is achievable in silicon on a useful timeline.',
    `<p>The strongest argument for possibility is that general intelligence already exists: human brains are physical systems, so the property is not supernatural. Unless cognition depends on something non-physical, it can in principle be reproduced in another substrate. The open questions are about engineering, scale and time, not about whether the target is coherent.</p>
<h2>The case against</h2>
<p>Sceptics make three arguments. First, that intelligence is inseparable from a body and a social world, so disembodied computation will always be missing something. Second, that current methods, which interpolate over data, cannot produce genuine understanding no matter how much compute is added. Third, that the economic and energy constraints will bind before the technical ones are solved.</p>
<h2>The case for</h2>
<p>Brains are proof of concept, and they run on about twenty watts. Nothing in the physics says twenty watts is the floor for cognition. The argument is about whether we can find the right architecture, not whether one can exist.</p>
<h2>What would settle it</h2>
<p>A system that acquires a genuinely new skill after deployment, in an unfamiliar domain, without a retraining run, and can explain how it did it. That single demonstration would move the debate further than any benchmark score.</p>`,
  ),
  entry(
    'q14',
    'narrow-ai-vs-general-ai',
    'What Is Narrow AI Versus General AI?',
    'Narrow AI is built for one task and fails outside it. General AI is built to transfer across tasks, including ones it was not trained on.',
    `<p>Narrow AI, sometimes called weak AI, is designed for a defined problem: ranking a feed, detecting a tumour, transcribing speech. It can exceed human performance inside that boundary and has no competence outside it. General AI aims at the boundary itself, carrying its own ability to acquire new skills.</p>
<h2>How to tell them apart</h2>
<p>Give the system a task from a different domain and change the format of the input. A narrow system degrades sharply, often without recognising that it has. A general system notices the mismatch and adapts. The second behaviour is the hard one.</p>
<h2>Why nearly everything today is narrow</h2>
<p>Because specialisation is how you get reliability. A system tuned for one distribution can be measured, audited and trusted. Generality trades that certainty for range, and the trade is not yet favourable for work with real consequences.</p>
<h2>Why the line is blurry</h2>
<p>Large multimodal models are narrow in mechanism and broad in apparent function, which makes the categories feel outdated. The distinction still holds where it matters: on the first problem nobody anticipated.</p>`,
  ),
  entry(
    'q15',
    'turing-test-and-agi',
    'What Is the Turing Test and Does It Measure AGI?',
    'The Turing test checks whether a machine can pass as human in conversation. It measures imitation, not intelligence, and says nothing about generality.',
    `<p>Alan Turing's 1950 imitation game asks a judge to identify which of two conversational partners is the machine. If the judge cannot reliably tell, the machine passes. It was a clever operational substitute for an unanswerable question, and it has been widely misread as a definition of intelligence ever since.</p>
<h2>Why it is not a measure of AGI</h2>
<p>The test measures conversational mimicry under time pressure. It does not test learning, planning, memory, or transfer. A system could pass by being excellent at being human-sounding while being unable to do any of the things general intelligence is supposed to do.</p>
<h2>Why it has lost its diagnostic value</h2>
<p>Modern language models pass casual versions routinely, which tells us more about the test than the models. Turing's own prediction was that the question would eventually seem meaningless, and that is roughly where the field has arrived.</p>
<h2>What replaced it</h2>
<p>Benchmarks that measure specific capabilities under controlled conditions, plus the harder and less formal test of whether a system can complete a long, messy real task without supervision.</p>`,
  ),
  entry(
    'q16',
    'what-benchmarks-measure-agi',
    'What Benchmarks Measure AGI?',
    'No single benchmark does. MMLU, BIG-bench, ARC-AGI, GAIA, OSWorld and SWE-bench each probe a slice, and all of them can be gamed by training on the test.',
    `<p>There is no accepted AGI benchmark, and the honest reason is that generality is not a single quantity. The field uses a battery of tests, each measuring something narrower, and reads them together.</p>
<h2>The main families</h2>
<ul>
<li><strong>Knowledge and reasoning:</strong> MMLU and its successors, which measure exam-style competence across subjects.</li>
<li><strong>Fluid intelligence:</strong> ARC-AGI, which uses novel visual puzzles designed to resist memorisation.</li>
<li><strong>Agentic work:</strong> GAIA, OSWorld and SWE-bench, which ask a system to complete multi-step tasks with tools.</li>
<li><strong>Broad coverage:</strong> BIG-bench, a large collection of tasks contributed by many researchers.</li>
</ul>
<h2>Why scores mislead</h2>
<p>Benchmarks leak into training data, reward pattern matching and measure the wrong thing when the goal is transfer. A high score proves the system has seen similar problems, not that it can handle a new one.</p>
<h2>What a better test looks like</h2>
<p>Unseen tasks, graded by outcome rather than style, with the ability to measure how quickly the system learns rather than what it already knows.</p>`,
  ),
  entry(
    'q17',
    'what-is-arc-agi-benchmark',
    'What Is the ARC-AGI Benchmark?',
    'ARC-AGI is a set of visual reasoning puzzles designed by François Chollet to measure fluid intelligence and quick skill acquisition rather than memorised knowledge.',
    `<p>ARC-AGI, the Abstraction and Reasoning Corpus, was introduced by François Chollet in 2019. Each task gives a handful of input and output grids and asks the system to infer the rule and apply it to a new grid. The grids are simple enough for a child and resistant to memorisation, because each puzzle is constructed to be novel.</p>
<h2>What it is trying to measure</h2>
<p>Chollet's argument is that intelligence is skill-acquisition efficiency, not stored skill. A system that solves a puzzle it has never seen, from two or three examples, is demonstrating something closer to general intelligence than one that scores well on an exam it was trained for.</p>
<h2>How the field has done</h2>
<p>Early language models scored near zero. Progress since 2024 has been rapid, which has made ARC-AGI one of the more informative public signals, and also a reminder that a benchmark is a moving target once labs optimise for it.</p>
<h2>What it does not prove</h2>
<p>Solving grid puzzles does not imply the ability to run a business, hold a conversation, or learn from a book. ARC-AGI measures one component of generality, sharply and honestly.</p>`,
  ),
  entry(
    'q18',
    'agi-vs-generative-ai',
    'What Is the Difference Between AGI and Generative AI?',
    'Generative AI produces content: text, images, audio, code. AGI would pursue goals, reason across domains and learn new skills on its own.',
    `<p>Generative AI describes output. These are systems trained to produce text, images, audio or code that resembles their training data's distribution. AGI describes scope and autonomy: a system that can set about any intellectual task, including ones it has not seen, and carry it through.</p>
<h2>Different questions</h2>
<p>Generative AI asks: can the model produce something plausible? AGI asks: can the system decide what needs doing, do it, check whether it worked, and learn from the result? The first is a rendering problem. The second is a control problem.</p>
<h2>Where they overlap</h2>
<p>Most modern assistants are generative models wrapped in tooling that adds memory, retrieval and execution. That scaffolding moves them toward agency without making them general. It is the difference between a talented improviser and someone who can run a project.</p>
<h2>The practical distinction</h2>
<p>Generative AI is already here and commercially deployed. AGI remains a target. Confusing the two produces both inflated expectations and premature dismissal.</p>`,
  ),
  entry(
    'q19',
    'does-agi-need-a-body',
    'Does AGI Need a Body?',
    'Not necessarily, but embodiment solves grounding and causality problems that pure text systems struggle with.',
    `<p>The embodiment debate asks whether intelligence can be complete without a physical presence in the world. The case for needing one is that concepts like heavy, hot, sooner and broken are learned through interaction, not description, and that a system with no consequences never learns what a consequence is.</p>
<h2>The case against</h2>
<p>Much intellectual work is symbolic. Mathematics, law, strategy and software do not require hands. A system that can read, reason, write and use tools can accomplish an enormous amount without a body, and most commercial value sits there.</p>
<h2>The middle position</h2>
<p>Embodiment is not binary. A system with tools, sensors and the ability to run experiments has partial grounding. A system confined to a chat window has very little. The question is how much of the world the system can affect and observe, not whether it has legs.</p>
<h2>What this means for AGI</h2>
<p>An AGI without a body could be extraordinarily capable and still systematically wrong about the physical world. Robotics is one route to grounding, simulation is another, and neither is currently a solved problem.</p>`,
  ),
  entry(
    'q20',
    'what-is-a-cognitive-architecture',
    'What Is a Cognitive Architecture?',
    'A cognitive architecture is the fixed blueprint of a mind: the memory systems, learning mechanisms and control loops that stay constant while knowledge changes.',
    `<p>A cognitive architecture is the part of an intelligent system that does not change when it learns. It defines how memory is organised, how attention is allocated, how goals are represented, and how perception, reasoning and action connect. Knowledge goes in. The architecture decides what can be done with it.</p>
<h2>Classic examples</h2>
<p>ACT-R models how declarative and procedural memory interact. SOAR introduced problem spaces and chunking. LIDA borrows from global workspace theory. Each was an attempt to specify the machinery of cognition independently of any particular task.</p>
<h2>Why it matters for AGI</h2>
<p>Adding capability by adding modules produces a system that grows sideways without becoming coherent. An architecture is the claim that the parts fit together in a principled way, and that new abilities can be added without breaking the ones already there.</p>
<h2>The modern version</h2>
<p>Today's agent stacks, with memory stores, planners, tool routers and evaluators, are cognitive architectures in all but name. Most are assembled ad hoc. The ones that work tend to have a clear theory of what each part is for.</p>`,
  ),
  entry(
    'q21',
    'when-will-agi-arrive',
    'When Will AGI Arrive?',
    'There is no consensus. Published estimates range from a few years to decades or never, and the answer depends almost entirely on how AGI is defined and measured.',
    `<p>Forecasts vary by more than the technology does. Some lab leaders put AGI within a few years. Large surveys of researchers cluster in the 2030s to 2050s with wide uncertainty. A substantial minority expect it will not happen with current methods at all. Anyone offering a confident date is describing a belief, not a result.</p>
<h2>Why the range is so wide</h2>
<p>Three reasons. First, definitions differ, so people are forecasting different finish lines. Second, extrapolation from recent progress assumes the curve continues, while the history of AI is full of plateaus. Third, incentives shape public estimates, and labs raising capital have reasons to sound close.</p>
<h2>What would move the date</h2>
<p>A demonstration of continual learning after deployment, reliable long-horizon autonomy, or a system that makes a genuine research contribution in an unfamiliar field. Each would be more informative than another benchmark record.</p>
<h2>How to think about it</h2>
<p>Plan for uncertainty rather than a date. The decisions that make an organisation resilient to AGI in five years are largely the same ones that help if it takes twenty: instrument your processes, keep humans in the loop where errors are expensive, and build the data foundations now.</p>`,
  ),
  entry(
    'q22',
    'is-agi-already-here',
    'Is AGI Already Here?',
    'No, by any definition that requires transfer and continual learning. Some argue the bar has been met if you count breadth of conversation, which shows how unstable the definition is.',
    `<p>The claim that AGI has arrived usually rests on a lowered bar: a system that can discuss anything must be general. That conflates breadth of training data with breadth of capability. Ask such a system to acquire a new skill after deployment, or to complete a multi-day task without supervision, and the gap appears quickly.</p>
<h2>What would count as arrival</h2>
<p>A system that, faced with an unfamiliar domain, identifies what it needs to learn, learns it, applies it, and can explain its reasoning, reliably enough that a professional would accept the work. No publicly demonstrated system meets that bar today.</p>
<h2>Why the question keeps returning</h2>
<p>Because capability is improving quickly in visible ways, and because the definition of AGI has no enforcement mechanism. Each new model resets what casual observers think general means.</p>
<h2>The useful reframe</h2>
<p>Instead of asking whether AGI is here, ask which specific capability is missing and how you would test for it. That question has answers.</p>`,
  ),
  entry(
    'q23',
    'how-close-are-we-to-agi',
    'How Close Are We to AGI?',
    'Close on language and reasoning benchmarks, far on continual learning, long-horizon reliability and self-directed work. The gaps are qualitative, not just quantitative.',
    `<p>Progress on benchmarks that measure knowledge and reasoning has been steep enough that several are effectively saturated. If AGI were an exam, the answer would be "close". It is not an exam. The capabilities that separate a strong model from a general agent are the ones current methods find hardest.</p>
<h2>The four gaps that matter</h2>
<ul>
<li><strong>Continual learning:</strong> updating from experience without a full retraining run.</li>
<li><strong>Long-horizon reliability:</strong> staying correct across hundreds of steps, not one answer.</li>
<li><strong>Calibration:</strong> knowing what it does not know, and saying so.</li>
<li><strong>Autonomy:</strong> deciding what to do next without a human framing each step.</li>
</ul>
<h2>Why benchmarks hide the gaps</h2>
<p>A benchmark is one prompt with a checkable answer. Real work is a sequence of dependent decisions where an early error compounds. Systems that look strong in evaluation often fail in deployment for exactly that reason.</p>
<h2>The honest position</h2>
<p>We are close to systems that are useful across many domains and far from systems that are dependable across all of them. The distance between those two is the whole difficulty.</p>`,
  ),
  entry(
    'q24',
    'why-experts-disagree-about-agi-timelines',
    'Why Do Experts Disagree About AGI Timelines?',
    'Because they define AGI differently, extrapolate from different curves, and carry different incentives. The disagreement is often about premises, not evidence.',
    `<p>Two researchers can look at the same progress and give dates thirty years apart without either being irrational. The divergence usually starts before any data is discussed.</p>
<h2>The four sources of disagreement</h2>
<p><strong>Definition.</strong> One means human-level performance on most tasks, another means the ability to do AI research, a third means a system that can replace most workers. These arrive on different dates.</p>
<p><strong>Model of progress.</strong> Believers in smooth scaling extrapolate the recent curve. Believers in paradigms argue that the current one has a ceiling and a new idea is needed, which makes forecasting meaningless until it appears.</p>
<p><strong>Reference class.</strong> People who study the history of AI remember the winters. People who study recent capability curves remember the last four years.</p>
<p><strong>Incentives.</strong> Fundraising, regulation and reputation all pull estimates in predictable directions.</p>
<h2>What would reduce the disagreement</h2>
<p>Agreed tests, published negative results, and forecasts that are scored after the fact. Very little of the public debate is structured that way.</p>`,
  ),
  entry(
    'q25',
    'will-agi-arrive-by-2030',
    'Will AGI Arrive by 2030?',
    'Some labs say yes within a few years. Most published researcher surveys put the median later, and the answer depends on which definition you use.',
    `<p>The claim that AGI arrives by 2030 is a bet on the current paradigm continuing to scale while the missing pieces, continual learning and reliable autonomy, get solved as engineering rather than as research. It is a defensible bet. It is not the consensus.</p>
<h2>What would have to be true</h2>
<p>Three things. Capability would need to keep improving without a new architecture. Continual learning would need to work at production reliability. And the cost of running such a system would need to fall far enough to deploy it widely. Any one of those failing pushes the date out.</p>
<h2>The counterargument</h2>
<p>Every previous prediction of a near-term general intelligence, from the 1960s onward, underestimated the difficulty of the parts that are not visible in demos. Reliability under load is the classic trap.</p>
<h2>How to hold the question</h2>
<p>Treat 2030 as one scenario among several and build for the range. The organisations that handle the transition well will be the ones whose data, processes and people are ready regardless of the exact year.</p>`,
  ),
];

export const agiQuestionCount = agiQuestionArticles.length;
