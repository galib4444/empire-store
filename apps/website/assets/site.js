const menu = document.querySelector("[data-menu]")
const nav = document.querySelector("[data-nav]")
menu?.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true"
  menu.setAttribute("aria-expanded", String(open))
  nav.classList.toggle("is-open", open)
})
nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  menu?.setAttribute("aria-expanded", "false")
  nav.classList.remove("is-open")
}))
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && menu?.getAttribute("aria-expanded") === "true") {
    menu.setAttribute("aria-expanded", "false")
    nav.classList.remove("is-open")
    menu.focus()
  }
})

document.querySelectorAll("[data-copy]").forEach(button => {
  button.addEventListener("click", async () => {
    const prompt = document.getElementById(button.dataset.copy)
    const status = button.parentElement.querySelector("[role=status]")
    try {
      await navigator.clipboard.writeText(prompt.textContent.trim())
      button.textContent = "Copied ✓"
      if (status) status.textContent = "Prompt copied. Paste it into your AI chat."
      setTimeout(() => { button.textContent = "Copy the prompt" }, 2500)
    } catch {
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(prompt)
      selection.removeAllRanges()
      selection.addRange(range)
      if (status) status.textContent = "Select and copy the highlighted prompt with your device’s copy command."
    }
  })
})

const choices = document.querySelectorAll("[data-choice]")
const result = document.querySelector("[data-recommendation]")
choices.forEach(button => button.addEventListener("click", () => {
  choices.forEach(choice => choice.setAttribute("aria-pressed", String(choice === button)))
  const day = button.dataset.choice === "day"
  result.innerHTML = `<h3>The Deliberate ${day ? "Day" : "Focus"}</h3><p>${day ? "Start with a realistic plan for your day, your inbox, and the decisions taking up space in your head." : "Start with the task you are avoiding, then build a work session with fewer distractions."}</p><a class="text-link" href="/books/deliberate-${day ? "day" : "focus"}">Explore the book <span aria-hidden="true">↗</span></a>`
  result.hidden = false
}))

document.querySelectorAll("[data-sample-tab]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-sample-tab]").forEach(tab => {
    const active = tab === button
    tab.setAttribute("aria-pressed", String(active))
    document.getElementById(tab.dataset.sampleTab).hidden = !active
  })
}))
