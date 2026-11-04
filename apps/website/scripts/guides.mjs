export const guides = [
  {
    slug: "ai-daily-planning-prompt", title: "Plan your day with AI.", searchTitle: "AI Daily Planning Prompt for ChatGPT, Claude & Gemini", published: "2026-11-03", updated: "2026-11-03", book: "Day",
    description: "Use a free daily planning prompt to turn your task list into a realistic schedule. Includes what to enter, a worked example, and checks before you follow the plan.",
    summary: "Turn a messy task list into a plan that fits your real working hours.",
    before: `<p>A useful AI daily planning prompt gives your chat assistant four things: your tasks, your available hours, your fixed commitments, and the priority you want to protect. Ask it to question anything unclear before it writes a schedule. Then check the plan against your calendar.</p>
    <p>The prompt below is <strong>The Morning Chief of Staff</strong> from <a href="/books/deliberate-day">The Deliberate Day</a>. You can try this complete prompt without buying the book or creating a Promptugraphy account.</p>
    <h2>Start with the day you actually have.</h2>
    <p>Write a rough list of what is on your mind. Include the awkward, unfinished tasks as well as the easy ones. “Quarterly report” is useful context, but “draft the report’s opening section” gives the AI a clearer finish line.</p>
    <ul><li><strong>Tasks:</strong> what needs doing and which deadlines are real.</li><li><strong>Working hours:</strong> when you can start and when you need to stop.</li><li><strong>Fixed commitments:</strong> meetings, appointments, and travel time.</li><li><strong>Weekly priority:</strong> the goal the day should move forward.</li><li><strong>Energy:</strong> a rough self-assessment, so the hardest task is not automatically left until last.</li></ul>
    <h2>Give the conversation a starting point.</h2>
    <p>Copy the prompt and replace its bracketed fields with your details. It is plain text you can paste into ChatGPT, Claude, or Gemini. You do not need a separate app or integration.</p>`,
    after: `<h2>What a useful answer can look like.</h2>
    <p>Here is an illustrative example based on the book’s worked session. The input includes a client proposal, a reply to Sarah, a quarterly report, a dentist appointment at 2 PM, and laptop research. The proposal has the important deadline.</p>
    <div class="table-scroll"><table><caption>Example response excerpt</caption><thead><tr><th scope="col">Part of the answer</th><th scope="col">What to look for</th></tr></thead><tbody><tr><th scope="row">Today’s one thing</th><td>Finish the client proposal because it has the external deadline.</td></tr><tr><th scope="row">First work block</th><td>Use the morning for the proposal, when your stated energy is highest.</td></tr><tr><th scope="row">Fixed appointment</th><td>Protect the dentist appointment and ask about travel or duration if these are missing.</td></tr><tr><th scope="row">Not today</th><td>Defer laptop research because it has no deadline.</td></tr><tr><th scope="row">Risk and response</th><td>Keep Sarah’s reply short if it could turn into a long thread.</td></tr></tbody></table></div>
    <p>This is a worked example, not a record of a customer’s result. Your answer should reflect your own time, deadlines, and commitments.</p>
    <h2>Check the plan before you use it.</h2>
    <p>Confirm that the AI has not invented deadlines, ignored travel, or scheduled more work than fits. If the plan is too full, ask: “What should I remove? Keep the deadline and the appointment fixed.” If a task is still vague, ask what a finished version would look like today.</p>
    <p>You can also tell it where the schedule is wrong: “The proposal needs two hours, not thirty minutes,” or “I cannot do focused work straight after that meeting.” These corrections are part of using the prompt.</p>
    <h2>When to use a different prompt.</h2>
    <p>If you already know your priority but keep avoiding it, a smaller first move may be more useful than another schedule. Try the <a href="/guides/ai-prompt-to-start-a-task">task-starting prompt from The Deliberate Focus</a>.</p>
    <p>For planning, email, decisions, and goals together, <a href="/books/deliberate-day">The Deliberate Day</a> contains 17 connected prompts in a 47-page PDF. It costs $19.99 USD, with checkout and delivery through Gumroad. You can <a href="/books#compare">compare both books</a> before choosing.</p>`,
  },
  {
    slug: "ai-prompt-to-start-a-task", title: "Start the task you keep avoiding.", searchTitle: "An AI Prompt for Procrastination: Start a Task", published: "2026-11-03", updated: "2026-11-03", book: "Focus",
    description: "Try The Cold Start, a free AI prompt for the task you keep avoiding. Get a small first action, see a worked example, and adjust the result to your time.",
    summary: "Use The Cold Start to turn an avoided task into one small, visible first move.",
    before: `<p>When you know what to do but keep putting it off, ask your AI for a concrete first action rather than a full productivity plan. Describe the task, say why you think you are avoiding it, and give the time you have available. The answer should name something you can actually do next.</p>
    <p><strong>The Cold Start</strong> is the first prompt in <a href="/books/deliberate-focus">The Deliberate Focus</a>. It asks for an intentionally imperfect opening move, a sentence about what the session does not need to achieve, and a bridge into the next step.</p>
    <h2>Name the task, not the whole problem.</h2>
    <p>“Be more productive” leaves too much for the AI to guess. “Write the introduction to a client proposal” gives it a specific starting place. Add your best guess about the friction: perfectionism, uncertainty, a dull task, or concern about someone’s reaction.</p>
    <p>You do not need a perfect explanation. If you are unsure, say so. Include the minutes you actually have now; a five-minute gap and a forty-minute session need different first steps.</p>
    <h2>Try The Cold Start.</h2>
    <p>Copy the full prompt below into ChatGPT, Claude, or Gemini and fill in the three bracketed fields. The website does not run an AI model or receive your answers.</p>`,
    after: `<h2>Read the answer as an action.</h2>
    <p>In the book’s worked example, the task is a client proposal introduction, the friction is pressure to make it sound expensive, and the available time is forty minutes. The sample response suggests writing an intentionally clumsy opening sentence, such as “Hello, we would like money in exchange for robots.”</p>
    <p>The point of that example is to produce raw material before trying to produce client-ready copy. The next step is to rewrite the sentence. It is an authored worked example, not a testimonial or a guaranteed outcome.</p>
    <dl class="guide-definitions"><dt>The ugly opener</dt><dd>One visible action, such as typing a deliberately rough sentence or putting a heading into a blank document.</dd><dt>The permission slip</dt><dd>A clear limit on what you need to finish in this session.</dd><dt>The bridge</dt><dd>The next action that becomes easier once the first artifact exists.</dd></dl>
    <h2>If the answer is still too big, shrink it.</h2>
    <p>“Draft the whole introduction” can still feel like the original task. Reply: “Make the first move smaller. It must take under two minutes and leave something visible.” You can ask for one sentence, one rough bullet, or a file with a working title.</p>
    <p>Once you have a first artifact, choose whether to continue or stop at the time you set. The prompt is a way to structure a work session; it does not diagnose or treat an attention or mental-health condition.</p>
    <h2>Starting and planning solve different problems.</h2>
    <p>If you are unsure what deserves your attention, start with the <a href="/guides/ai-daily-planning-prompt">AI daily planning prompt</a>. If the priority is clear and beginning is the hard part, use The Cold Start.</p>
    <p><a href="/books/deliberate-focus">The Deliberate Focus</a> adds prompts for interruptions, workspace setup, breaks, and ongoing reviews. The 99-page PDF contains 24 connected prompts and costs $19.99 USD through Gumroad. <a href="/books#compare">Compare it with The Deliberate Day</a> if you are deciding where to begin.</p>`,
  },
]
