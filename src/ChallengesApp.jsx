import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom'

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function safeUUID() {
  try {
    if (typeof crypto !== 'undefined' && crypto?.randomUUID) return crypto.randomUUID()
  } catch {
    // ignore
  }
  return `id-${Math.random().toString(16).slice(2)}-${Date.now()}`
}

function Card({ title, hint, right, children }) {
  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <h2>{title}</h2>
          {hint ? <p>{hint}</p> : null}
        </div>
        {right ? <div className="row">{right}</div> : null}
      </div>
      {children}
    </div>
  )
}

function AppButton({ variant = 'primary', disabled, onClick, children, type = 'button' }) {
  const cls = ['btn', variant === 'primary' ? 'btnPrimary' : '']
    .filter(Boolean)
    .join(' ')
  return (
    <button className={cls} type={type} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}

// 1) Derived State: Total Price
function Challenge01() {
  const [items, setItems] = useState([
    { id: 'a', name: 'Keyboard', price: 35, qty: 1 },
    { id: 'b', name: 'Mouse', price: 18, qty: 2 },
    { id: 'c', name: 'USB-C Cable', price: 9, qty: 3 },
  ])

  const total = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items],
  )

  function updateQty(id, nextQty) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty: clamp(nextQty, 0, 999) } : it)),
    )
  }

  return (
    <Card
      title="1) Derived State: Total Price"
      hint="Total is computed (not stored) using reduce + useMemo."
      right={<span className="pill">Total: ${total.toFixed(2)}</span>}
    >
      <div className="kpi">
        {items.map((it) => (
          <div className="kpiBox" key={it.id}>
            <b>{it.name}</b>
            <div className="row">
              <span className="pill">${it.price}</span>
              <div className="field">
                <span className="label">Qty</span>
                <input
                  value={it.qty}
                  onChange={(e) => updateQty(it.id, Number(e.target.value))}
                  type="number"
                  min={0}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// 2) Controlled vs Uncontrolled
function Challenge02() {
  const [controlled, setControlled] = useState('Hello')
  const uncontrolledRef = useRef(null)
  const [readout, setReadout] = useState(null)

  return (
    <Card
      title="2) Controlled vs Uncontrolled"
      hint="Controlled uses state. Uncontrolled uses useRef + ref.current.value."
      right={
        <AppButton
          onClick={() =>
            setReadout({
              controlled,
              uncontrolled: uncontrolledRef.current?.value ?? '',
            })
          }
        >
          Read values
        </AppButton>
      }
    >
      <div className="row">
        <div className="field">
          <span className="label">Controlled</span>
          <input value={controlled} onChange={(e) => setControlled(e.target.value)} />
        </div>
        <div className="field">
          <span className="label">Uncontrolled</span>
          <input defaultValue="World" ref={uncontrolledRef} />
        </div>
      </div>
      <div className="hr" />
      <div className="kpiBox">
        <b>Readout</b>
        <div>{readout ? JSON.stringify(readout) : 'Click “Read values”'}</div>
      </div>
    </Card>
  )
}

// 3) Debounced Search
function Challenge03() {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 400)
    return () => clearTimeout(t)
  }, [q])

  const results = useMemo(() => {
    const data = ['React', 'Redux', 'Router', 'Recoil', 'Remix', 'Render Props', 'Refs', 'RSC']
    const needle = debounced.trim().toLowerCase()
    if (!needle) return data
    return data.filter((x) => x.toLowerCase().includes(needle))
  }, [debounced])

  return (
    <Card
      title="3) Debounced Search"
      hint="Updates results 400ms after typing stops."
      right={<span className="pill">Debounced: {debounced || '—'}</span>}
    >
      <div className="field">
        <span className="label">Search</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type fast…" />
      </div>
      <div className="hr" />
      <div className="kpi">
        {results.map((r) => (
          <div className="kpiBox" key={r}>
            <b>Match</b>
            <div>{r}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// 4) Infinite Counter with Step
function Challenge04() {
  const [count, setCount] = useState(0)
  const [stepRaw, setStepRaw] = useState('1')
  const step = Number(stepRaw)
  const stepValid = Number.isFinite(step) && Number.isInteger(step) && step !== 0

  return (
    <Card title="4) Infinite Counter with Step" hint="Step must be a valid non-zero integer.">
      <div className="row">
        <span className="pill">Count: {count}</span>
        <div className="field">
          <span className="label">Step</span>
          <input value={stepRaw} onChange={(e) => setStepRaw(e.target.value)} />
        </div>
        <AppButton disabled={!stepValid} onClick={() => setCount((c) => c + step)}>
          + step
        </AppButton>
        <AppButton disabled={!stepValid} onClick={() => setCount((c) => c - step)} variant="outline">
          - step
        </AppButton>
      </div>
      <div className="hr" />
      <div className="kpiBox">
        <b>Validation</b>
        <div>
          {stepValid ? (
            <span style={{ color: 'var(--ok)' }}>OK</span>
          ) : (
            <span style={{ color: 'var(--danger)' }}>Enter a non-zero integer</span>
          )}
        </div>
      </div>
    </Card>
  )
}

// 5) Reusable Button Component
function Challenge05() {
  const [disabled, setDisabled] = useState(false)
  return (
    <Card title="5) Reusable Button Component" hint="AppButton supports variant + disabled.">
      <div className="row">
        <AppButton variant="primary" disabled={disabled} onClick={() => alert('Primary')}>
          Primary
        </AppButton>
        <AppButton variant="outline" disabled={disabled} onClick={() => alert('Outline')}>
          Outline
        </AppButton>
        <label className="pill">
          <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} /> Disabled
        </label>
      </div>
    </Card>
  )
}

// 6) Accordion (FAQ)
function Challenge06() {
  const faq = [
    { id: 'a', q: 'What is derived state?', a: 'State you compute from other state, not store.' },
    { id: 'b', q: 'When use useRef?', a: 'For mutable values that don’t trigger re-render.' },
    { id: 'c', q: 'Why cleanup in useEffect?', a: 'To cancel timers, listeners, requests, etc.' },
  ]
  const [openId, setOpenId] = useState(null)

  return (
    <Card title="6) Accordion (FAQ)" hint="Only one open. Clicking open item closes it.">
      <div className="list">
        {faq.map((it) => {
          const open = openId === it.id
          return (
            <button
              key={it.id}
              className="itemBtn"
              onClick={() => setOpenId((cur) => (cur === it.id ? null : it.id))}
              aria-current={open ? 'true' : 'false'}
            >
              <div className="itemTitle">{it.q}</div>
              <div className="itemHint">{open ? it.a : 'Click to open'}</div>
            </button>
          )
        })}
      </div>
    </Card>
  )
}

// 7) Multi-step Form
function Challenge07() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', email: '', city: '', address: '' })

  const canNext = useMemo(() => {
    if (step === 0) return form.name.trim() && form.email.trim()
    if (step === 1) return form.city.trim() && form.address.trim()
    return true
  }, [form, step])

  function next() {
    if (!canNext) return
    setStep((s) => clamp(s + 1, 0, 2))
  }
  function back() {
    setStep((s) => clamp(s - 1, 0, 2))
  }

  return (
    <Card title="7) Multi-step Form" hint="3 steps: Personal → Address → Review. Blocks Next if required empty.">
      <div className="row">
        <span className="pill">Step {step + 1} / 3</span>
        <AppButton variant="outline" disabled={step === 0} onClick={back}>
          Back
        </AppButton>
        <AppButton disabled={!canNext || step === 2} onClick={next}>
          Next
        </AppButton>
      </div>
      <div className="hr" />

      {step === 0 ? (
        <div className="row">
          <div className="field">
            <span className="label">Name *</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="field">
            <span className="label">Email *</span>
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="row">
          <div className="field">
            <span className="label">City *</span>
            <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="field">
            <span className="label">Address *</span>
            <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="kpiBox">
          <b>Review</b>
          <div>{JSON.stringify(form, null, 2)}</div>
        </div>
      ) : null}

      <div className="hr" />
      {!canNext && step !== 2 ? (
        <div className="pill" style={{ borderColor: 'rgba(255, 77, 109, 0.5)' }}>
          Fill required fields to continue
        </div>
      ) : null}
    </Card>
  )
}

// 8) Form with Dynamic Fields
function Challenge08() {
  const [skills, setSkills] = useState(() => [{ id: safeUUID(), value: 'React' }])
  function add() {
    setSkills((prev) => [...prev, { id: safeUUID(), value: '' }])
  }
  function remove(id) {
    setSkills((prev) => prev.filter((s) => s.id !== id))
  }
  function update(id, value) {
    setSkills((prev) => prev.map((s) => (s.id === id ? { ...s, value } : s)))
  }

  return (
    <Card title="8) Form with Dynamic Fields" hint="Add/remove skills; each skill has a stable id.">
      <div className="row">
        <AppButton onClick={add}>Add skill</AppButton>
      </div>
      <div className="hr" />
      <div className="list">
        {skills.map((s) => (
          <div className="row" key={s.id}>
            <input value={s.value} onChange={(e) => update(s.id, e.target.value)} placeholder="Skill…" />
            <AppButton variant="outline" onClick={() => remove(s.id)} disabled={skills.length === 1}>
              Remove
            </AppButton>
          </div>
        ))}
      </div>
      <div className="hr" />
      <div className="kpiBox">
        <b>Payload</b>
        <div>{JSON.stringify(skills)}</div>
      </div>
    </Card>
  )
}

// 9) Password Strength Meter
function Challenge09() {
  const [pw, setPw] = useState('')
  const score = useMemo(() => {
    let s = 0
    if (pw.length >= 8) s += 1
    if (/[0-9]/.test(pw)) s += 1
    if (/[^a-zA-Z0-9]/.test(pw)) s += 1
    if (pw.length >= 12) s += 1
    return s
  }, [pw])

  const label = score <= 1 ? 'Weak' : score === 2 ? 'Medium' : 'Strong'
  const color = score <= 1 ? 'var(--danger)' : score === 2 ? '#ffb020' : 'var(--ok)'

  return (
    <Card title="9) Password Strength Meter" hint="Simple rules: length + number + symbol.">
      <div className="field">
        <span className="label">Password</span>
        <input value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Try: Abc!12345" />
      </div>
      <div className="hr" />
      <div className="row">
        <span className="pill">
          Strength: <b style={{ color, marginLeft: 6 }}>{label}</b>
        </span>
        <span className="pill">Score: {score} / 4</span>
      </div>
    </Card>
  )
}

// 10) Toast Notifications
function Challenge10() {
  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((title, message) => {
    const id = safeUUID()
    setToasts((prev) => [...prev, { id, title, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <Card
      title="10) Toast Notifications"
      hint="Supports multiple toasts; each auto-hides after 3s."
      right={
        <AppButton onClick={() => pushToast('Saved', `Toast at ${new Date().toLocaleTimeString()}`)}>
          Show toast
        </AppButton>
      }
    >
      <div className="toastWrap" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <b>{t.title}</b>
            <small>{t.message}</small>
          </div>
        ))}
      </div>
      <div className="kpiBox">
        <b>Note</b>
        <div>Toasts appear in the top-right corner.</div>
      </div>
    </Card>
  )
}

// 11) Copy to Clipboard
function Challenge11() {
  const [text, setText] = useState('Copy this text')
  const [status, setStatus] = useState('')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setStatus('Copied!')
      setTimeout(() => setStatus(''), 1000)
    } catch (e) {
      setStatus('Copy failed (browser permission).')
      console.error(e)
    }
  }

  return (
    <Card title="11) Copy to Clipboard" hint="Uses Clipboard API; shows “Copied!” for 1s.">
      <div className="row">
        <input value={text} onChange={(e) => setText(e.target.value)} style={{ minWidth: 260 }} />
        <AppButton onClick={copy}>Copy</AppButton>
        {status ? <span className="pill">{status}</span> : null}
      </div>
    </Card>
  )
}

// 12) Dark/Light Theme (body class + localStorage)
function Challenge12() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.body.classList.toggle('lightTheme', theme === 'light')
  }, [theme])

  return (
    <Card title="12) Dark/Light Theme" hint="Persists to localStorage; toggles body class.">
      <div className="row">
        <span className="pill">Theme: {theme}</span>
        <AppButton
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          variant={theme === 'dark' ? 'primary' : 'outline'}
        >
          Toggle theme
        </AppButton>
      </div>
    </Card>
  )
}

// 13) useEffect Dependencies Trap
function Challenge13() {
  const [userId, setUserId] = useState('1')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let alive = true
    async function run() {
      setLoading(true)
      await new Promise((r) => setTimeout(r, 450))
      if (!alive) return
      setData({ userId, name: userId === '1' ? 'Ada' : userId === '2' ? 'Linus' : 'Grace' })
      setLoading(false)
    }
    run()
    return () => {
      alive = false
    }
  }, [userId])

  return (
    <Card title="13) useEffect Dependencies Trap" hint="Fetch runs only when userId changes (not every render).">
      <div className="row">
        <div className="field">
          <span className="label">User</span>
          <select value={userId} onChange={(e) => setUserId(e.target.value)}>
            <option value="1">User 1</option>
            <option value="2">User 2</option>
            <option value="3">User 3</option>
          </select>
        </div>
        <span className="pill">{loading ? 'Loading…' : 'Idle'}</span>
      </div>
      <div className="hr" />
      <div className="kpiBox">
        <b>Result</b>
        <div>{data ? JSON.stringify(data) : 'No data yet'}</div>
      </div>
    </Card>
  )
}

// 14) Fetch with AbortController
function Challenge14() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!query.trim()) return

    const controller = new AbortController()

    const t = setTimeout(() => {
      if (controller.signal.aborted) return
      setResult({ query, items: [query, `${query} (2)`, `${query} (3)`] })
    }, 500)

    return () => {
      controller.abort()
      clearTimeout(t)
    }
  }, [query])

  const status = !query.trim() ? 'Idle' : result?.query === query ? 'Done' : 'Fetching…'

  return (
    <Card title="14) Fetch with AbortController" hint="Aborts previous request when query changes quickly.">
      <div className="row">
        <input
          value={query}
          onChange={(e) => {
            setResult(null)
            setQuery(e.target.value)
          }}
          placeholder="Type quickly…"
        />
        <span className="pill">{status}</span>
      </div>
      <div className="hr" />
      <div className="kpiBox">
        <b>Result</b>
        <div>{query.trim() ? (result ? JSON.stringify(result) : '—') : '—'}</div>
      </div>
    </Card>
  )
}

// 15) Skeleton Loader
function Challenge15() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    let alive = true
    const t = setTimeout(() => {
      if (!alive) return
      setData({ title: 'Loaded content', lines: ['First line', 'Second line', 'Third line'] })
      setLoading(false)
    }, 900)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [])

  return (
    <Card title="15) Skeleton Loader" hint="Shows skeleton placeholders while loading.">
      {loading ? (
        <div className="list">
          <div className="skeletonLine" style={{ width: '55%' }} />
          <div className="skeletonLine" style={{ width: '92%' }} />
          <div className="skeletonLine" style={{ width: '86%' }} />
          <div className="skeletonLine" style={{ width: '70%' }} />
        </div>
      ) : (
        <div className="kpiBox">
          <b>{data.title}</b>
          <div className="list">
            {data.lines.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

// 16) Sort + Filter + Search Combined
function Challenge16() {
  const [q, setQ] = useState('')
  const [minPrice, setMinPrice] = useState(0)
  const [sortBy, setSortBy] = useState('priceAsc')
  const products = useMemo(
    () => [
      { id: 'a', name: 'Keyboard', price: 35 },
      { id: 'b', name: 'Mouse', price: 18 },
      { id: 'c', name: 'Monitor', price: 220 },
      { id: 'd', name: 'USB Hub', price: 26 },
      { id: 'e', name: 'Chair', price: 155 },
    ],
    [],
  )

  const view = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let x = products.filter((p) => p.price >= minPrice)
    if (needle) x = x.filter((p) => p.name.toLowerCase().includes(needle))
    x = [...x].sort((a, b) => {
      if (sortBy === 'priceAsc') return a.price - b.price
      if (sortBy === 'priceDesc') return b.price - a.price
      return a.name.localeCompare(b.name)
    })
    return x
  }, [minPrice, products, q, sortBy])

  return (
    <Card title="16) Sort + Filter + Search Combined" hint="Pipeline: filter → search → sort.">
      <div className="row">
        <div className="field">
          <span className="label">Search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="field">
          <span className="label">Min price</span>
          <input value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))} type="number" min={0} />
        </div>
        <div className="field">
          <span className="label">Sort</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="priceAsc">Price ↑</option>
            <option value="priceDesc">Price ↓</option>
            <option value="nameAsc">Name A→Z</option>
          </select>
        </div>
      </div>
      <div className="hr" />
      <div className="kpi">
        {view.map((p) => (
          <div className="kpiBox" key={p.id}>
            <b>{p.name}</b>
            <div>${p.price}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// 17) Keyboard Shortcuts (Ctrl+K opens search box)
function Challenge17() {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    function onKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  return (
    <Card title="17) Keyboard Shortcuts" hint="Press Ctrl+K (or ⌘K) to open search. ESC closes.">
      <div className="row">
        <AppButton onClick={() => setOpen(true)}>Open</AppButton>
        <span className="pill">Open: {open ? 'Yes' : 'No'}</span>
      </div>
      <div className="hr" />
      {open ? (
        <div className="kpiBox">
          <b>Search</b>
          <div className="row">
            <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type…" />
            <AppButton variant="outline" onClick={() => setOpen(false)}>
              Close
            </AppButton>
          </div>
        </div>
      ) : (
        <div className="pill">Tip: try Ctrl+K / ⌘K</div>
      )}
    </Card>
  )
}

// 18) Editable Profile (Optimistic UI)
function Challenge18() {
  const [profile, setProfile] = useState({ name: 'Amer', bio: 'Intermediate React practice.' })
  const [draft, setDraft] = useState(profile)
  const [status, setStatus] = useState('Idle')

  async function save() {
    const prev = profile
    setProfile(draft) // optimistic
    setStatus('Saving…')
    await new Promise((r) => setTimeout(r, 650))
    const fail = Math.random() < 0.25
    if (fail) {
      setProfile(prev) // rollback
      setDraft(prev)
      setStatus('Failed (rolled back)')
      return
    }
    setStatus('Saved')
  }

  return (
    <Card title="18) Editable Profile (Optimistic UI)" hint="Updates UI first; rolls back if request fails.">
      <div className="row">
        <span className="pill">Status: {status}</span>
        <AppButton onClick={save}>Save</AppButton>
      </div>
      <div className="hr" />
      <div className="row">
        <div className="field">
          <span className="label">Name</span>
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
        </div>
        <div className="field" style={{ minWidth: 340, flex: 1 }}>
          <span className="label">Bio</span>
          <input value={draft.bio} onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))} />
        </div>
      </div>
      <div className="hr" />
      <div className="kpiBox">
        <b>Current profile</b>
        <div>{JSON.stringify(profile)}</div>
      </div>
    </Card>
  )
}

// 19) Pagination + URL Sync
function Challenge19() {
  const [page, setPage] = useState(() => {
    const p = new URLSearchParams(window.location.search).get('page')
    const n = Number(p)
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
  })

  useEffect(() => {
    const url = new URL(window.location.href)
    url.searchParams.set('page', String(page))
    window.history.replaceState({}, '', url.toString())
  }, [page])

  const items = useMemo(() => {
    const start = (page - 1) * 5 + 1
    return Array.from({ length: 5 }, (_, i) => `Item ${start + i}`)
  }, [page])

  return (
    <Card title="19) Pagination + URL Sync" hint="Syncs page with ?page=2 in query string.">
      <div className="row">
        <AppButton variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Prev
        </AppButton>
        <span className="pill">Page: {page}</span>
        <AppButton onClick={() => setPage((p) => p + 1)}>Next</AppButton>
      </div>
      <div className="hr" />
      <div className="kpi">
        {items.map((x) => (
          <div className="kpiBox" key={x}>
            <b>Row</b>
            <div>{x}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// 20) Custom Hook: useToggle
function useToggle(initial = false) {
  const [value, setValue] = useState(Boolean(initial))
  const toggle = useCallback(() => setValue((v) => !v), [])
  const setOn = useCallback(() => setValue(true), [])
  const setOff = useCallback(() => setValue(false), [])
  return [value, toggle, setOn, setOff]
}

function Challenge20() {
  const [a, toggleA, setAOn, setAOff] = useToggle(true)
  const [b, toggleB] = useToggle(false)

  return (
    <Card title="20) Custom Hook: useToggle" hint="Returns [value, toggle, setOn, setOff]; used in 2 components.">
      <div className="row">
        <span className="pill">A: {a ? 'ON' : 'OFF'}</span>
        <AppButton onClick={toggleA}>Toggle A</AppButton>
        <AppButton variant="outline" onClick={setAOn}>
          A on
        </AppButton>
        <AppButton variant="outline" onClick={setAOff}>
          A off
        </AppButton>
      </div>
      <div className="hr" />
      <div className="row">
        <span className="pill">B: {b ? 'ON' : 'OFF'}</span>
        <AppButton onClick={toggleB}>Toggle B</AppButton>
      </div>
    </Card>
  )
}

// 21) Portal Modal (ESC close)
function Challenge21() {
  const [open, setOpen] = useState(false)
  const root = useMemo(() => document.getElementById('modal-root'), [])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const modal = open ? (
    <div className="modalOverlay" role="dialog" aria-modal="true" onMouseDown={() => setOpen(false)}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <b>Portal modal</b>
          <AppButton variant="outline" onClick={() => setOpen(false)}>
            Close
          </AppButton>
        </div>
        <div className="hr" />
        <div className="kpiBox">
          <b>Tip</b>
          <div>Press ESC to close.</div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <Card title="21) Portal Modal" hint="Renders with createPortal into #modal-root; ESC closes.">
      <div className="row">
        <AppButton onClick={() => setOpen(true)}>Open modal</AppButton>
        <span className="pill">Open: {open ? 'Yes' : 'No'}</span>
      </div>
      {open && root ? ReactDOM.createPortal(modal, root) : null}
    </Card>
  )
}

// 22) Compound Component Tabs (Context)
const TabsContext = React.createContext(null)

function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue)
  const ctx = useMemo(() => ({ value, setValue }), [value])
  return <TabsContext.Provider value={ctx}>{children}</TabsContext.Provider>
}

Tabs.List = function TabsList({ children }) {
  return <div className="row">{children}</div>
}

Tabs.Tab = function TabsTab({ value, children }) {
  const ctx = React.useContext(TabsContext)
  const active = ctx.value === value
  return (
    <button className={['btn', active ? 'btnPrimary' : ''].filter(Boolean).join(' ')} onClick={() => ctx.setValue(value)}>
      {children}
    </button>
  )
}

Tabs.Panel = function TabsPanel({ when, children }) {
  const ctx = React.useContext(TabsContext)
  if (ctx.value !== when) return null
  return <div className="kpiBox">{children}</div>
}

function Challenge22() {
  return (
    <Card title="22) Compound Component Tabs" hint="Tabs share state via Context: <Tabs><Tabs.List/><Tabs.Panel/></Tabs>.">
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Tab value="one">One</Tabs.Tab>
          <Tabs.Tab value="two">Two</Tabs.Tab>
          <Tabs.Tab value="three">Three</Tabs.Tab>
        </Tabs.List>
        <div className="hr" />
        <Tabs.Panel when="one">
          <b>Panel One</b>
          <div className="itemHint">Context-driven panel rendering.</div>
        </Tabs.Panel>
        <Tabs.Panel when="two">
          <b>Panel Two</b>
          <div className="itemHint">No prop drilling needed.</div>
        </Tabs.Panel>
        <Tabs.Panel when="three">
          <b>Panel Three</b>
          <div className="itemHint">Compound component API.</div>
        </Tabs.Panel>
      </Tabs>
    </Card>
  )
}

// 23) Memoization with React.memo + useCallback
const MemoRow = React.memo(function MemoRow({ label, onPing }) {
  return (
    <div className="kpiBox">
      <b>{label}</b>
      <div className="row">
        <span className="pill">Memoized</span>
        <AppButton variant="outline" onClick={onPing}>
          Ping
        </AppButton>
      </div>
    </div>
  )
})

function Challenge23() {
  const [count, setCount] = useState(0)
  const [pings, setPings] = useState(0)
  const onPing = useCallback(() => setPings((x) => x + 1), [])

  return (
    <Card title="23) Memoization with React.memo" hint="Rows are memoized; stable handler via useCallback.">
      <div className="row">
        <span className="pill">Parent count: {count}</span>
        <AppButton onClick={() => setCount((c) => c + 1)}>Re-render parent</AppButton>
        <span className="pill">Pings: {pings}</span>
      </div>
      <div className="hr" />
      <div className="kpi">
        {Array.from({ length: 6 }, (_, i) => (
          <MemoRow key={i} label={`Row ${i + 1}`} onPing={onPing} />
        ))}
      </div>
    </Card>
  )
}

// 24) Drag and Drop List (Basic)
function reorder(list, from, to) {
  const x = [...list]
  const [moved] = x.splice(from, 1)
  x.splice(to, 0, moved)
  return x
}

function Challenge24() {
  const [items, setItems] = useState(['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo'])
  const dragIndexRef = useRef(null)

  return (
    <Card title="24) Drag and Drop List (Basic)" hint="HTML5 drag events + reorder function (no libs).">
      <div className="list">
        {items.map((it, idx) => (
          <div
            key={it}
            className="itemBtn"
            draggable
            onDragStart={() => {
              dragIndexRef.current = idx
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              const from = dragIndexRef.current
              const to = idx
              if (from === null || from === undefined) return
              if (from === to) return
              setItems((prev) => reorder(prev, from, to))
              dragIndexRef.current = null
            }}
          >
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="itemTitle">{it}</div>
              <span className="pill">#{idx + 1}</span>
            </div>
            <div className="itemHint">Drag me onto another item</div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// 25) File Upload Preview
function Challenge25() {
  const [file, setFile] = useState(null)
  const reactId = useId()
  const inputId = `file-${reactId}`

  const url = useMemo(() => {
    if (!file) return ''
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    if (!url) return
    return () => URL.revokeObjectURL(url)
  }, [url])

  return (
    <Card title="25) File Upload Preview" hint="Accepts images only; uses URL.createObjectURL for preview.">
      <div className="row">
        <label className="btn btnPrimary" htmlFor={inputId}>
          Choose image
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        {file ? <span className="pill">{file.name}</span> : <span className="pill">No file</span>}
      </div>
      <div className="hr" />
      {url ? (
        <div className="kpiBox">
          <b>Preview</b>
          <div style={{ marginTop: 10 }}>
            <img
              src={url}
              alt="preview"
              style={{ width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: 12, border: '1px solid var(--border)' }}
            />
          </div>
        </div>
      ) : (
        <div className="kpiBox">
          <b>Preview</b>
          <div>Choose an image to see the preview.</div>
        </div>
      )}
    </Card>
  )
}

const CHALLENGES = [
  { id: 'c01', n: 1, title: 'Derived State: Total Price', hint: 'reduce + useMemo', Comp: Challenge01 },
  { id: 'c02', n: 2, title: 'Controlled vs Uncontrolled', hint: 'useRef for uncontrolled', Comp: Challenge02 },
  { id: 'c03', n: 3, title: 'Debounced Search', hint: 'useEffect timer cleanup', Comp: Challenge03 },
  { id: 'c04', n: 4, title: 'Infinite Counter with Step', hint: 'validate integer step', Comp: Challenge04 },
  { id: 'c05', n: 5, title: 'Reusable Button', hint: 'variant + disabled', Comp: Challenge05 },
  { id: 'c06', n: 6, title: 'Accordion (FAQ)', hint: 'only one open', Comp: Challenge06 },
  { id: 'c07', n: 7, title: 'Multi-step Form', hint: 'block next when invalid', Comp: Challenge07 },
  { id: 'c08', n: 8, title: 'Dynamic Fields', hint: 'stable ids', Comp: Challenge08 },
  { id: 'c09', n: 9, title: 'Password Strength', hint: 'simple scoring', Comp: Challenge09 },
  { id: 'c10', n: 10, title: 'Toast Notifications', hint: 'multiple + auto-hide', Comp: Challenge10 },
  { id: 'c11', n: 11, title: 'Copy to Clipboard', hint: 'Clipboard API', Comp: Challenge11 },
  { id: 'c12', n: 12, title: 'Dark/Light Theme', hint: 'body class + localStorage', Comp: Challenge12 },
  { id: 'c13', n: 13, title: 'useEffect deps trap', hint: 'depend on userId only', Comp: Challenge13 },
  { id: 'c14', n: 14, title: 'AbortController', hint: 'abort previous fetch', Comp: Challenge14 },
  { id: 'c15', n: 15, title: 'Skeleton Loader', hint: 'placeholders while loading', Comp: Challenge15 },
  { id: 'c16', n: 16, title: 'Sort + Filter + Search', hint: 'pipeline', Comp: Challenge16 },
  { id: 'c17', n: 17, title: 'Keyboard Shortcuts', hint: 'Ctrl/⌘K + cleanup', Comp: Challenge17 },
  { id: 'c18', n: 18, title: 'Optimistic UI', hint: 'rollback on failure', Comp: Challenge18 },
  { id: 'c19', n: 19, title: 'Pagination + URL Sync', hint: '?page=2', Comp: Challenge19 },
  { id: 'c20', n: 20, title: 'Custom Hook: useToggle', hint: 'return helpers', Comp: Challenge20 },
  { id: 'c21', n: 21, title: 'Portal Modal', hint: 'createPortal + ESC', Comp: Challenge21 },
  { id: 'c22', n: 22, title: 'Compound Tabs', hint: 'Context compound API', Comp: Challenge22 },
  { id: 'c23', n: 23, title: 'React.memo', hint: 'memo + useCallback', Comp: Challenge23 },
  { id: 'c24', n: 24, title: 'Drag and Drop', hint: 'HTML5 drag events', Comp: Challenge24 },
  { id: 'c25', n: 25, title: 'File Upload Preview', hint: 'URL.createObjectURL', Comp: Challenge25 },
]

export default function ChallengesApp() {
  const [filter, setFilter] = useState('')
  const [activeId, setActiveId] = useState('c01')

  const active = useMemo(() => CHALLENGES.find((c) => c.id === activeId) || CHALLENGES[0], [activeId])

  const list = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return CHALLENGES
    return CHALLENGES.filter((c) => `${c.n} ${c.title} ${c.hint}`.toLowerCase().includes(q))
  }, [filter])

  const ActiveComp = active.Comp

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Intermediate React Challenges</h1>
          <small>25</small>
        </div>
        <input className="searchBox" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter…" />
        <div className="list" style={{ marginTop: 10 }}>
          {list.map((c) => (
            <button
              key={c.id}
              className="itemBtn"
              onClick={() => setActiveId(c.id)}
              aria-current={activeId === c.id ? 'true' : 'false'}
            >
              <div className="itemTitle">
                {c.n}) {c.title}
              </div>
              <div className="itemHint">{c.hint}</div>
            </button>
          ))}
        </div>
        <div className="hr" />
        <div className="kpiBox">
          <b>Tip</b>
          <div className="itemHint">
            Some challenges use browser APIs (clipboard, file preview). If your browser blocks them, try a secure context
            (localhost) and allow permissions.
          </div>
        </div>
      </aside>
      <main className="main">
        <ActiveComp />
      </main>
    </div>
  )
}
