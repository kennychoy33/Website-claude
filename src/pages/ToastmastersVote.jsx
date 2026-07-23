import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import {
  getOrCreateVoterToken,
  hasLocalVote,
  isCloudConfigured,
  loadLocalState,
  loadVoteState,
  markLocalVoted,
  saveVoteState,
  submitVote,
} from '../services/tmVoteCloud'
import './ToastmastersVote.css'

const LANG = {
  zh: {
    navAdmin: '投票设置',
    navVote: '投票页面',
    navShare: '分享海报',
    navResults: '结果统计',
    navHistory: '历史记录',
    clubShort: '中华讲演会',
    club: '柔南区麻坡中华校友会讲演会',
    todaySetup: '今日投票设置',
    regularMeeting: '例常活动',
    save: '保存设置',
    openVote: '开放投票',
    preview: '预览投票页',
    meetingInfo: '会议资料',
    meetingNo: '会议编号',
    date: '日期',
    theme: '主题',
    word: '每日一词',
    closeTime: '截止时间',
    prepared: '最佳备稿讲员',
    impromptu: '最佳即席讲员',
    name: '姓名',
    speechTitle: '演讲题目',
    project: '项目',
    action: '操作',
    remove: '删除',
    addPrepared: '+ 添加备稿讲员',
    addImpromptu: '+ 添加即席讲员',
    voteLink: '投票链接',
    scanVote: '扫码投票',
    copyLink: '复制链接',
    downloadPoster: '下载分享图片',
    preparedCandidates: '备稿候选',
    impromptuCandidates: '即席候选',
    totalVotes: '总票数',
    voteStatus: '投票状态',
    tonightVote: '今晚最佳表现投票',
    alreadyVoted: '你已经完成投票',
    thanksJoin: '谢谢参与。每台设备每场会议限投一次。',
    notOpen: '投票尚未开放',
    waitOpen: '请等待会议维护人员开放投票。',
    unnamed: '未命名',
    submit: '提交投票',
    submitting: '提交中...',
    rule: '不记名 | 每人限投一次 | 截止前完成投票',
    voteNow: '立即投票',
    realtime: '实时结果',
    bestPrepared: '最佳备稿',
    bestImpromptu: '最佳即席',
    votes: '票',
    preparedVotes: '备稿票数',
    impromptuVotes: '即席票数',
    historyDb: '历史得奖者资料库',
    noVotes: '暂无票数',
    tied: '同票',
    pending: '待填写',
    thankVote: '谢谢投票',
    recorded: '你的选择已经记录。',
    viewResults: '查看结果',
    statusOpen: '开放投票',
    statusDraft: '草稿',
    langLabel: '语言',
    cloud: '云端模式',
    local: '本地模式',
    syncing: '同步中...',
    saved: '已保存',
    cloudHint: '连接 Supabase 后，资料和票数会跨设备同步。',
    loadFailed: '云端读取失败，已切换到本地模式。',
    saveFailed: '保存失败，请检查网络或 Supabase 设置。',
    duplicateVote: '这台设备已经投过票。',
  },
  en: {
    navAdmin: 'Setup',
    navVote: 'Voting Page',
    navShare: 'Share Poster',
    navResults: 'Results',
    navHistory: 'History',
    clubShort: 'Chung Hwa Toastmasters',
    club: 'Johor South Muar Chung Hwa Alumni Toastmasters Club',
    todaySetup: 'Today Voting Setup',
    regularMeeting: 'Regular Meeting',
    save: 'Save Settings',
    openVote: 'Open Voting',
    preview: 'Preview Voting Page',
    meetingInfo: 'Meeting Info',
    meetingNo: 'Meeting No.',
    date: 'Date',
    theme: 'Theme',
    word: 'Word of the Day',
    closeTime: 'Close Time',
    prepared: 'Best Prepared Speaker',
    impromptu: 'Best Table Topics Speaker',
    name: 'Name',
    speechTitle: 'Speech Title',
    project: 'Project',
    action: 'Action',
    remove: 'Remove',
    addPrepared: '+ Add Prepared Speaker',
    addImpromptu: '+ Add Table Topics Speaker',
    voteLink: 'Voting Link',
    scanVote: 'Scan to Vote',
    copyLink: 'Copy Link',
    downloadPoster: 'Download Share Image',
    preparedCandidates: 'Prepared Candidates',
    impromptuCandidates: 'Table Topics Candidates',
    totalVotes: 'Total Votes',
    voteStatus: 'Voting Status',
    tonightVote: 'Tonight Best Performance Vote',
    alreadyVoted: 'You have already voted',
    thanksJoin: 'Thank you. One vote per device for this meeting.',
    notOpen: 'Voting is not open yet',
    waitOpen: 'Please wait for the meeting admin to open voting.',
    unnamed: 'Unnamed',
    submit: 'Submit Vote',
    submitting: 'Submitting...',
    rule: 'Anonymous | One vote per person | Vote before closing',
    voteNow: 'Vote Now',
    realtime: 'Live Results',
    bestPrepared: 'Best Prepared',
    bestImpromptu: 'Best Table Topics',
    votes: 'votes',
    preparedVotes: 'Prepared Votes',
    impromptuVotes: 'Table Topics Votes',
    historyDb: 'Winner History Database',
    noVotes: 'No votes yet',
    tied: 'Tied',
    pending: 'Pending',
    thankVote: 'Thank You',
    recorded: 'Your vote has been recorded.',
    viewResults: 'View Results',
    statusOpen: 'Open',
    statusDraft: 'Draft',
    langLabel: 'Language',
    cloud: 'Cloud Mode',
    local: 'Local Mode',
    syncing: 'Syncing...',
    saved: 'Saved',
    cloudHint: 'Connect Supabase to sync meetings and votes across devices.',
    loadFailed: 'Cloud loading failed. Switched to local mode.',
    saveFailed: 'Save failed. Please check network or Supabase settings.',
    duplicateVote: 'This device has already voted.',
  },
}

function meetingStatusLabel(status, t) {
  if (status === 'open' || status === '开放投票' || status === '开放中') return t.statusOpen
  return t.statusDraft
}

function winner(list, t) {
  const sorted = [...list].sort((a, b) => b.votes - a.votes)
  if (!sorted.length || sorted[0].votes === 0) return { label: t.noVotes, votes: 0, tied: false }
  const tied = sorted[1] && sorted[1].votes === sorted[0].votes
  return { label: tied ? t.tied : sorted[0].name, votes: sorted[0].votes, tied }
}

function QrBlock({ value, compact = false }) {
  const [src, setSrc] = useState('')

  useEffect(() => {
    let ignore = false
    QRCode.toDataURL(value || window.location.href, {
      margin: 1,
      width: compact ? 260 : 186,
      color: { dark: '#050505', light: '#ffffff' },
    }).then(nextSrc => {
      if (!ignore) setSrc(nextSrc)
    })
    return () => { ignore = true }
  }, [value, compact])

  return (
    <div className={`tm-qr ${compact ? 'compact' : ''}`} aria-label="QR code">
      {src ? <img src={src} alt="QR code" /> : null}
    </div>
  )
}

function LanguageToggle({ lang, setLang, t }) {
  return (
    <div className="tm-lang-toggle" aria-label={t.langLabel}>
      <button className={lang === 'zh' ? 'active' : ''} onClick={() => setLang('zh')}>中文</button>
      <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
    </div>
  )
}

function SyncBadge({ source, syncStatus, t }) {
  return (
    <div className="tm-sync-badge">
      <b>{source === 'cloud' ? t.cloud : t.local}</b>
      <span>{syncStatus || (source === 'cloud' ? t.saved : t.cloudHint)}</span>
    </div>
  )
}

function CandidateEditor({ type, candidates, onChange, t }) {
  const isPrepared = type === 'prepared'

  function update(id, field, value) {
    onChange(candidates.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  function addCandidate() {
    const nextId = `${isPrepared ? 'p' : 'i'}${Date.now()}`
    onChange([
      ...candidates,
      isPrepared
        ? { id: nextId, name: '', title: '', project: '', votes: 0 }
        : { id: nextId, name: '', votes: 0 },
    ])
  }

  function remove(id) {
    onChange(candidates.filter(item => item.id !== id))
  }

  return (
    <section className="tm-panel">
      <div className="tm-panel-title">
        <span className="tm-icon">{isPrepared ? '🏆' : '🎤'}</span>
        <h2>{isPrepared ? t.prepared : t.impromptu}</h2>
      </div>

      {isPrepared ? (
        <div className="tm-table">
          <div className="tm-table-head">
            <span>{t.name}</span>
            <span>{t.speechTitle}</span>
            <span>{t.project}</span>
            <span>{t.action}</span>
          </div>
          {candidates.map(item => (
            <div className="tm-table-row" key={item.id}>
              <input value={item.name} onChange={e => update(item.id, 'name', e.target.value)} />
              <input value={item.title} onChange={e => update(item.id, 'title', e.target.value)} />
              <input value={item.project} onChange={e => update(item.id, 'project', e.target.value)} />
              <button className="tm-danger" onClick={() => remove(item.id)}>{t.remove}</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="tm-chip-editor">
          {candidates.map(item => (
            <label className="tm-name-chip" key={item.id}>
              <input value={item.name} onChange={e => update(item.id, 'name', e.target.value)} />
              <button onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`}>x</button>
            </label>
          ))}
        </div>
      )}

      <button className="tm-outline" onClick={addCandidate}>
        {isPrepared ? t.addPrepared : t.addImpromptu}
      </button>
    </section>
  )
}

function AdminView({ data, setData, setView, persistState, source, syncStatus, t }) {
  function updateMeeting(field, value) {
    setData({ ...data, meeting: { ...data.meeting, [field]: value } })
  }

  function updateCandidates(field, list) {
    setData({ ...data, [field]: list })
  }

  function setStatus(status) {
    const next = { ...data, meeting: { ...data.meeting, status } }
    setData(next)
    persistState(next)
  }

  const savedVotes = data.prepared.reduce((sum, item) => sum + item.votes, 0) + data.impromptu.reduce((sum, item) => sum + item.votes, 0)

  return (
    <div className="tm-admin-grid">
      <div className="tm-main-column">
        <div className="tm-screen-head">
          <div>
            <h1>{t.todaySetup} <span>{meetingStatusLabel(data.meeting.status, t)}</span></h1>
            <p>{data.meeting.number} {t.regularMeeting} | {data.meeting.theme}</p>
            <SyncBadge source={source} syncStatus={syncStatus} t={t} />
          </div>
          <div className="tm-actions">
            <button onClick={() => persistState(data)}>{t.save}</button>
            <button className="tm-gold" onClick={() => setStatus('open')}>{t.openVote}</button>
            <button onClick={() => setView('vote')}>{t.preview}</button>
          </div>
        </div>

        <section className="tm-panel">
          <div className="tm-panel-title">
            <span className="tm-icon">📋</span>
            <h2>{t.meetingInfo}</h2>
          </div>
          <div className="tm-form-grid">
            {[
              ['number', t.meetingNo],
              ['date', t.date],
              ['theme', t.theme],
              ['word', t.word],
              ['closeTime', t.closeTime],
            ].map(([field, label]) => (
              <label key={field}>
                <span>{label}</span>
                <input value={data.meeting[field]} onChange={e => updateMeeting(field, e.target.value)} />
              </label>
            ))}
          </div>
        </section>

        <CandidateEditor type="prepared" candidates={data.prepared} onChange={list => updateCandidates('prepared', list)} t={t} />
        <CandidateEditor type="impromptu" candidates={data.impromptu} onChange={list => updateCandidates('impromptu', list)} t={t} />
      </div>

      <aside className="tm-share-panel">
        <h2>{t.voteLink}</h2>
        <p>{t.scanVote}</p>
        <QrBlock value={data.meeting.link} />
        <strong>{data.meeting.link}</strong>
        <button onClick={() => navigator.clipboard?.writeText(data.meeting.link)}>{t.copyLink}</button>
        <button className="tm-outline" onClick={() => setView('share')}>{t.downloadPoster}</button>
        <div className="tm-stat-row"><span>{t.preparedCandidates}</span><b>{data.prepared.length}</b></div>
        <div className="tm-stat-row"><span>{t.impromptuCandidates}</span><b>{data.impromptu.length}</b></div>
        <div className="tm-stat-row"><span>{t.totalVotes}</span><b>{savedVotes}</b></div>
        <div className="tm-stat-row"><span>{t.voteStatus}</span><b>{meetingStatusLabel(data.meeting.status, t)}</b></div>
      </aside>
    </div>
  )
}

function VoteCard({ title, candidates, selected, onSelect, prepared, t }) {
  return (
    <section className="tm-vote-card">
      <h2>{title}</h2>
      <div className="tm-vote-options">
        {candidates.map(item => (
          <button
            key={item.id}
            className={selected === item.id ? 'selected' : ''}
            onClick={() => onSelect(item.id)}
          >
            <span>{item.name || t.unnamed}</span>
            {prepared && <small>{item.title}</small>}
          </button>
        ))}
      </div>
    </section>
  )
}

function VoteView({ data, setData, setView, t }) {
  const [preparedPick, setPreparedPick] = useState('')
  const [impromptuPick, setImpromptuPick] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const alreadyVoted = hasLocalVote(data.meeting.number)
  const isOpen = ['open', '开放投票', '开放中'].includes(data.meeting.status)

  async function handleSubmitVote() {
    if (!preparedPick || !impromptuPick || alreadyVoted) return
    setSubmitting(true)
    setError('')
    try {
      const voterToken = getOrCreateVoterToken(data.meeting.number)
      const result = await submitVote(data, preparedPick, impromptuPick, voterToken)
      setData(result.data)
      markLocalVoted(data.meeting.number)
      setView('success')
    } catch (err) {
      setError(err.code === 'already_voted' ? t.duplicateVote : t.saveFailed)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="tm-vote-shell">
      <div className="tm-vote-hero">
        <p>{t.club}</p>
        <h1>{t.tonightVote}</h1>
        <span>{data.meeting.number} {t.regularMeeting} | {data.meeting.theme}</span>
      </div>

      {alreadyVoted ? (
        <div className="tm-success-card">
          <h2>{t.alreadyVoted}</h2>
          <p>{t.thanksJoin}</p>
          <button onClick={() => setView('results')}>{t.viewResults}</button>
        </div>
      ) : !isOpen ? (
        <div className="tm-success-card">
          <h2>{t.notOpen}</h2>
          <p>{t.waitOpen}</p>
        </div>
      ) : (
        <>
          <VoteCard title={t.prepared} candidates={data.prepared} selected={preparedPick} onSelect={setPreparedPick} prepared t={t} />
          <VoteCard title={t.impromptu} candidates={data.impromptu} selected={impromptuPick} onSelect={setImpromptuPick} t={t} />
          <button className="tm-submit-vote" disabled={!preparedPick || !impromptuPick || submitting} onClick={handleSubmitVote}>
            {submitting ? t.submitting : t.submit}
          </button>
          {error && <p className="tm-error">{error}</p>}
          <p className="tm-rule">{t.rule}</p>
        </>
      )}
    </div>
  )
}

function SharePoster({ data, t }) {
  return (
    <div className="tm-poster-wrap">
      <div className="tm-poster">
        <div className="tm-poster-top">
          <span>{t.clubShort}</span>
          <span>Toastmasters Club</span>
        </div>
        <p>{t.club}</p>
        <h1>{t.tonightVote}</h1>
        <h2>{data.meeting.number} {t.regularMeeting} | {data.meeting.theme}</h2>
        <div className="tm-poster-qr">
          <span>{t.scanVote}</span>
          <QrBlock value={data.meeting.link} compact />
          <b>{data.meeting.link}</b>
        </div>
        <button>{t.voteNow}</button>
        <div className="tm-poster-items">
          <strong>{t.prepared}</strong>
          <strong>{t.impromptu}</strong>
        </div>
        <div className="tm-poster-meta">
          <span>{t.date}: {data.meeting.date}</span>
          <span>{t.closeTime}: {data.meeting.closeTime}</span>
        </div>
        <footer>{t.rule}</footer>
      </div>
    </div>
  )
}

function ResultsView({ data, t }) {
  const preparedWinner = winner(data.prepared, t)
  const impromptuWinner = winner(data.impromptu, t)
  const maxPrepared = Math.max(1, ...data.prepared.map(item => item.votes))
  const maxImpromptu = Math.max(1, ...data.impromptu.map(item => item.votes))

  return (
    <div className="tm-results-grid">
      <section className="tm-panel">
        <h2>{t.realtime}</h2>
        <div className="tm-winner-row">
          <div><span>{t.bestPrepared}</span><b>{preparedWinner.label}</b><small>{preparedWinner.votes} {t.votes}</small></div>
          <div><span>{t.bestImpromptu}</span><b>{impromptuWinner.label}</b><small>{impromptuWinner.votes} {t.votes}</small></div>
        </div>
      </section>
      <section className="tm-panel">
        <h2>{t.preparedVotes}</h2>
        {data.prepared.map(item => <Bar key={item.id} item={item} max={maxPrepared} />)}
      </section>
      <section className="tm-panel">
        <h2>{t.impromptuVotes}</h2>
        {data.impromptu.map(item => <Bar key={item.id} item={item} max={maxImpromptu} />)}
      </section>
    </div>
  )
}

function Bar({ item, max }) {
  return (
    <div className="tm-bar-row">
      <span>{item.name}</span>
      <div><i style={{ width: `${(item.votes / max) * 100}%` }} /></div>
      <b>{item.votes}</b>
    </div>
  )
}

function HistoryView({ data, t }) {
  const records = [
    ...data.history,
    {
      meeting: data.meeting.number,
      date: data.meeting.date,
      preparedWinner: winner(data.prepared, t).label,
      preparedVotes: winner(data.prepared, t).votes,
      impromptuWinner: winner(data.impromptu, t).label,
      impromptuVotes: winner(data.impromptu, t).votes,
    },
  ]

  return (
    <section className="tm-panel">
      <h2>{t.historyDb}</h2>
      <div className="tm-history-list">
        {records.map(record => (
          <div key={`${record.meeting}-${record.date}`} className="tm-history-card">
            <strong>{record.meeting}</strong>
            <span>{record.date}</span>
            <p>{t.bestPrepared}: {record.preparedWinner || t.pending} ({record.preparedVotes} {t.votes})</p>
            <p>{t.bestImpromptu}: {record.impromptuWinner || t.pending} ({record.impromptuVotes} {t.votes})</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ToastmastersVote() {
  const [data, setData] = useState(null)
  const publicView = new URLSearchParams(window.location.search).get('view') === 'vote'
  const [view, setView] = useState(publicView ? 'vote' : 'admin')
  const [lang, setLang] = useState(() => localStorage.getItem('tm-vote-lang') || 'zh')
  const [source, setSource] = useState(isCloudConfigured ? 'cloud' : 'local')
  const [syncStatus, setSyncStatus] = useState('')
  const t = LANG[lang]

  useEffect(() => {
    let ignore = false
    async function hydrate() {
      setSyncStatus(t.syncing)
      try {
        const result = await loadVoteState()
        if (!ignore) {
          setData(result.data)
          setSource(result.source)
          setSyncStatus('')
        }
      } catch {
        if (!ignore) {
          setData(loadLocalState())
          setSource('local')
          setSyncStatus(t.loadFailed)
        }
      }
    }
    hydrate()
    return () => { ignore = true }
  }, [])

  function changeLang(nextLang) {
    setLang(nextLang)
    localStorage.setItem('tm-vote-lang', nextLang)
  }

  async function persistState(next) {
    setSyncStatus(t.syncing)
    try {
      const result = await saveVoteState(next)
      setSource(result.source)
      setSyncStatus(t.saved)
    } catch {
      setSyncStatus(t.saveFailed)
    }
  }

  const nav = useMemo(() => [
    ['admin', t.navAdmin],
    ['vote', t.navVote],
    ['share', t.navShare],
    ['results', t.navResults],
    ['history', t.navHistory],
  ], [t])

  if (!data) {
    return (
      <div className={`tm-page ${publicView ? 'public' : ''}`}>
        {!publicView && <aside className="tm-sidebar">
          <div className="tm-brand">TM Vote</div>
          <LanguageToggle lang={lang} setLang={changeLang} t={t} />
        </aside>}
        <main className="tm-content">
          <div className="tm-success-card"><h2>{t.syncing}</h2></div>
        </main>
      </div>
    )
  }

  return (
    <div className={`tm-page ${publicView ? 'public' : ''}`}>
      {!publicView && <aside className="tm-sidebar">
        <div className="tm-brand">TM Vote</div>
        <LanguageToggle lang={lang} setLang={changeLang} t={t} />
        {nav.map(([key, label]) => (
          <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>{label}</button>
        ))}
      </aside>}
      <main className="tm-content">
        {view === 'admin' && <AdminView data={data} setData={setData} setView={setView} persistState={persistState} source={source} syncStatus={syncStatus} t={t} />}
        {view === 'vote' && <VoteView data={data} setData={setData} setView={setView} t={t} />}
        {view === 'success' && <div className="tm-success-card"><h1>{t.thankVote}</h1><p>{t.recorded}</p><button onClick={() => setView('results')}>{t.viewResults}</button></div>}
        {view === 'share' && <SharePoster data={data} t={t} />}
        {view === 'results' && <ResultsView data={data} t={t} />}
        {view === 'history' && <HistoryView data={data} t={t} />}
      </main>
    </div>
  )
}
