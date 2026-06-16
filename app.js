(() => {
  const STORAGE_KEY = 'companyLinkBoard_v1'

  // Default data
  const defaultData = {
    folders: [
      { id: 'unsorted', name: 'Unsorted', items: [] }
    ]
  }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }

  // Icons mapping: small inline SVGs (safe, simple visuals)
  const ICONS = {
    'google-drive': `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="20" height="12" rx="2" fill="#FDE68A" stroke="#F59E0B" stroke-width="0.5"/>
        <path d="M4 6L8 4h8l4 2" stroke="#D97706" stroke-width="0.6" fill="none"/>
      </svg>
    `,
    'google-doc': `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="3" width="12" height="18" rx="1.5" fill="#DBEAFE" stroke="#60A5FA" stroke-width="0.5"/>
        <path d="M8 7h6M8 11h6M8 15h4" stroke="#2563EB" stroke-width="0.8" stroke-linecap="round"/>
      </svg>
    `,
    'google-sheet': `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="14" height="16" rx="1.5" fill="#ECFCCB" stroke="#84CC16" stroke-width="0.5"/>
        <path d="M7 7v10M11 7v10" stroke="#4D7C0F" stroke-width="0.7"/>
      </svg>
    `,
    'crm': `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="3" fill="#FEF3C7" stroke="#F59E0B" stroke-width="0.5"/>
        <rect x="13" y="5" width="6" height="6" rx="1" fill="#E6E6FA" stroke="#8B5CF6" stroke-width="0.5"/>
        <rect x="7" y="14" width="10" height="5" rx="1" fill="#FEE2E2" stroke="#EF4444" stroke-width="0.5"/>
      </svg>
    `,
    'other': `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 14a3 3 0 0 1 0-4l3-3a3 3 0 0 1 4 4l-1 1" stroke="#6B7280" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 10a3 3 0 0 1 0 4l-3 3a3 3 0 0 1-4-4l1-1" stroke="#6B7280" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
  }

  // DOM refs
  const board = document.getElementById('board')
  const addLinkBtn = document.getElementById('addLinkBtn')
  const addFolderBtn = document.getElementById('addFolderBtn')
  const linkModal = document.getElementById('linkModal')
  const linkForm = document.getElementById('linkForm')
  const cancelLink = document.getElementById('cancelLink')
  const folderPrompt = document.getElementById('folderPrompt')
  const newFolderName = document.getElementById('newFolderName')
  const createFolder = document.getElementById('createFolder')
  const cancelFolder = document.getElementById('cancelFolder')
  const folderSelect = document.getElementById('folderSelect')

  let data = load()

  // Save/load
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }
  function load() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : defaultData }
    catch(e){ console.error('load error', e); return defaultData }
  }

  // Render UI
  function render() {
    board.innerHTML = ''
    data.folders.forEach(folder => {
      const f = document.createElement('section')
      f.className = 'folder'
      const h = document.createElement('h3')
      const nameSpan = document.createElement('span')
      nameSpan.textContent = folder.name
      const countSmall = document.createElement('small')
      countSmall.className = 'muted'
      countSmall.textContent = `${folder.items.length} items`

      h.appendChild(nameSpan)
      h.appendChild(countSmall)

      // Add folder delete button (not for the default 'unsorted' folder)
      if (folder.id !== 'unsorted') {
        const delFolderBtn = document.createElement('button')
        delFolderBtn.className = 'folder-delete'
        delFolderBtn.title = 'Remove folder'
        delFolderBtn.setAttribute('aria-label', `Remove folder ${folder.name}`)
        delFolderBtn.textContent = '🗑'
        delFolderBtn.addEventListener('click', ev => {
          ev.preventDefault(); ev.stopPropagation();
          if (!confirm(`Remove folder "${folder.name}" and all its ${folder.items.length} items?`)) return
          const idx = data.folders.findIndex(x => x.id === folder.id)
          if (idx === -1) return
          data.folders.splice(idx, 1)
          save(); render()
        })
        h.appendChild(delFolderBtn)
      }
      f.appendChild(h)

      const items = document.createElement('div')
      items.className = 'items'

        folder.items.forEach(item => {
          const wrap = document.createElement('div')
          wrap.className = 'item'

          const a = document.createElement('a')
          a.className = 'link'
          a.href = item.url
          a.target = '_blank'
          a.rel = 'noopener noreferrer'

          const iconDiv = document.createElement('div')
          iconDiv.className = 'icon'
          iconDiv.innerHTML = ICONS[item.type] || ICONS.other

          const info = document.createElement('div')
          info.innerHTML = `<div class="title">${escapeHtml(item.title)}</div><div class="muted small">${hostname(item.url)}</div>`

          a.appendChild(iconDiv)
          a.appendChild(info)

          const del = document.createElement('button')
          del.className = 'delete'
          del.title = 'Remove link'
          del.setAttribute('aria-label', `Remove ${item.title}`)
          del.textContent = '✖'
          del.addEventListener('click', ev => {
            ev.preventDefault(); ev.stopPropagation();
            if (!confirm(`Remove link "${item.title}"?`)) return
            const fidx = data.folders.findIndex(x => x.id === folder.id)
            if (fidx === -1) return
            const idx = data.folders[fidx].items.findIndex(it => it.id === item.id)
            if (idx === -1) return
            data.folders[fidx].items.splice(idx, 1)
            save(); render()
          })

          wrap.appendChild(a)
          wrap.appendChild(del)
          items.appendChild(wrap)
        })

      f.appendChild(items)
      board.appendChild(f)
    })

    // Update folder select
    folderSelect.innerHTML = ''
    data.folders.forEach(f => {
      const o = document.createElement('option'); o.value = f.id; o.textContent = f.name; folderSelect.appendChild(o)
    })
  }

  // Utility
  function hostname(url){ try{ return new URL(url).hostname }catch(e){return url} }
  function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

  // Actions
  addLinkBtn.addEventListener('click', ()=>{ linkModal.setAttribute('aria-hidden','false'); linkForm.title.focus() })
  cancelLink.addEventListener('click', ()=>{ linkModal.setAttribute('aria-hidden','true'); linkForm.reset() })

  addFolderBtn.addEventListener('click', ()=>{ folderPrompt.hidden = false; newFolderName.focus() })
  cancelFolder.addEventListener('click', ()=>{ folderPrompt.hidden = true; newFolderName.value = '' })
  createFolder.addEventListener('click', ()=>{
    const name = newFolderName.value.trim(); if(!name) return; const id = uid(); data.folders.push({id,name,items:[]}); save(); render(); newFolderName.value=''; folderPrompt.hidden=true
  })

  linkForm.addEventListener('submit', e=>{
    e.preventDefault(); const f = new FormData(linkForm); const title = f.get('title').trim(); const url = f.get('url').trim(); const type = f.get('type'); const folderId = f.get('folder') || 'unsorted'
    if(!title||!url) return
    const item = { id: uid(), title, url, type }
    const folder = data.folders.find(x=>x.id===folderId) || data.folders[0]
    folder.items.push(item)
    save(); render(); linkModal.setAttribute('aria-hidden','true'); linkForm.reset()
  })

  // Init
  render()

  // Expose for debug
  window.__linkBoard = {data, save, render}

})();
