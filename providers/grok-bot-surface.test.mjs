import { expect, test } from "bun:test"
import { runInNewContext } from "node:vm"
import { surfaceTail, surfaceBusy, surfaceComposer } from "./grok-bot-surface.mjs"

test("0.77 nested user markup produces one turn without hiding separate duplicate messages", () => {
  const message = (role, text, rowKey) => ({
    dataset: { role }, innerText: text,
    closest: () => ({ dataset: { rowKey } }),
    querySelector: selector => selector === ".sand-message-prose" ? { innerText: text } : null,
  })
  const user = message("user", "hello [Magpie turn: 123]", "nonce:123")
  const wrapper = { ...user, querySelector: selector => selector === "[data-role]" ? user : { innerText: user.innerText } }
  const reply = message("assistant", "real reply", "reply:1")
  const separate = message("user", user.innerText, "nonce:456")
  const region = { scrollHeight: 900, querySelectorAll: () => [wrapper, user, reply, separate] }
  const result = runInNewContext(surfaceTail, { document: { querySelector: () => region } })
  expect(JSON.parse(JSON.stringify(result))).toEqual({ entries: [
    { id: "nonce:123", role: "user", text: user.innerText },
    { id: "reply:1", role: "assistant", text: "real reply" },
    { id: "nonce:456", role: "user", text: user.innerText },
  ] })
  expect(region.scrollTop).toBe(900)
})

test("visible Working, approval, and stop controls keep a turn running", () => {
  let label = "My bot, Working", awaiting
  const selected = { dataset: {}, getAttribute: () => label }
  const button = { disabled: false, getAttribute: () => awaiting }
  const document = { querySelector: () => selected, querySelectorAll: () => [button] }
  expect(runInNewContext(surfaceBusy, { document })).toBe(true)
  label = "My bot"
  selected.dataset.awaiting = "true"
  expect(runInNewContext(surfaceBusy, { document })).toBe(true)
  delete selected.dataset.awaiting
  awaiting = "Stop generating"
  expect(runInNewContext(surfaceBusy, { document })).toBe(true)
  button.disabled = true
  expect(runInNewContext(surfaceBusy, { document })).toBe(false)
})

test("composer check preserves drafts and only focuses an empty input", () => {
  let focused = 0
  const composer = { innerText: "user draft", focus() { focused++ } }
  const document = { querySelector: () => composer }
  expect(runInNewContext(surfaceComposer, { document })).toBe("draft")
  expect(focused).toBe(0)
  composer.innerText = "\n"
  expect(runInNewContext(surfaceComposer, { document })).toBe("ready")
  expect(focused).toBe(1)
})
