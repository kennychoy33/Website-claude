import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import {
  getOrCreateVoterToken,
  getCurrentUser,
  hasLocalVote,
  isCloudConfigured,
  loadMeetingOpsState,
  loadPeopleState,
  loadLocalState,
  loadSystemSettings,
  loadVoteState,
  markLocalVoted,
  onAuthChange,
  saveVoteState,
  saveMeetingOpsState,
  savePeopleState,
  saveSystemSettings,
  signInWithEmail,
  signOutUser,
  signUpWithEmail,
  submitVote,
} from '../services/tmVoteCloud'
import './ToastmastersVote.css'

const LANG = {
  zh: {
    navAdmin: '投票设置',
    navSystem: '分会资料设定',
    navMaster: '系统管理',
    navPeople: '会员嘉宾',
    navMeeting: '例会管理',
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
    evaluator: '最佳评估员',
    name: '姓名',
    speechTitle: '演讲题目',
    project: '项目',
    action: '操作',
    remove: '删除',
    addPrepared: '+ 添加备稿讲员',
    addImpromptu: '+ 添加即席讲员',
    addEvaluator: '+ 添加评估员',
    voteLink: '投票链接',
    scanVote: '扫码投票',
    copyLink: '复制链接',
    downloadPoster: '下载分享图片',
    preparedCandidates: '备稿候选',
    impromptuCandidates: '即席候选',
    evaluatorCandidates: '评估候选',
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
    bestEvaluator: '最佳评估',
    votes: '票',
    preparedVotes: '备稿票数',
    impromptuVotes: '即席票数',
    evaluatorVotes: '评估票数',
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
    privateSpace: '登录后，每个使用者都有自己的独立投票空间。',
    email: 'Email',
    password: '密码',
    login: '登录',
    createAccount: '建立账号',
    logout: '登出',
    loginTitle: 'Toastmasters 投票系统',
    loginSubtitle: '登录你的独立空间，管理自己的会议、候选人和历史票数。',
    membersTitle: '会员资料库',
    guestsTitle: '嘉宾资料库',
    addMember: '+ 添加会员',
    addGuest: '+ 添加嘉宾',
    englishName: '英文名',
    phone: '电话',
    pathway: 'Pathway',
    level: 'Level',
    status: '状态',
    joinedDate: '加入日期',
    introducedBy: '介绍人',
    visitDate: '来访日期',
    notes: '备注',
    active: 'Active',
    inactive: 'Inactive',
    importMembers: '从会员资料带入',
    syncFromRoles: '同步当前例会职务',
    importRole: '导入例会职务',
    peopleSaved: '会员/嘉宾已保存',
    meetingSaved: '例会资料已保存',
    attendanceTitle: '出席记录',
    rolesTitle: '职务分配',
    agendaTitle: '例会表',
    printAgenda: '列印例会表',
    attended: '出席',
    absent: '缺席',
    role: '职务',
    roleTime: '时间/分钟',
    assignee: '担任者',
    addRole: '+ 添加职务',
    resetRoles: '套用完整职务模板',
    member: '会员',
    guest: '嘉宾',
    preparedSpeakers: '备稿讲员',
    evaluators: '评估员',
    tableTopics: '即席讲员',
    systemTitle: '分会资料设定',
    systemSubtitle: '维护分会名称、Logo、例会表模板和分会管理者。投票者只需要 QR code，不需要登录。',
    clubName: '分会名称',
    clubShortName: '分会简称',
    toastmasterId: 'Toastmaster ID',
    adminName: '管理员姓名',
    username: 'User Name',
    systemSaved: '系统设定已保存',
    accountNote: '这里可以记录分会管理者资料。正式上线时，密码应由系统管理通过 Supabase Auth / Edge Function 建立，不建议长期保存明文密码。',
    masterNote: '系统管理是给最高管理者新建分会、分会管理者 ID 和密码使用。',
    logoUpload: '上传分会 Logo',
    agendaTemplate: '上传例会表 Template',
    agendaRoleTemplate: '例会表职务模板',
    addTemplateRole: '+ 加入模板职务',
    clubAdmins: '分会管理者',
    addClubAdmin: '+ 加入管理者',
    masterTitle: '系统管理',
    masterSubtitle: '最高管理者用于新建分会、分配 Toastmaster ID、User Name 和初始 Password。',
    createClub: '新建分会',
    saveClubList: '保存分会列表',
    clubCreated: '分会已加入',
    clubListSaved: '分会列表已保存',
    noClub: '还没有分会记录',
    createClubHint: '请填写分会名称、User Name 和 Password',
    clubList: '分会列表',
    newMeeting: '新建例会',
    editMeeting: '修改例会',
    meetingRecords: '例会记录',
    currentMeeting: '本次例会',
    lockedMeeting: '已锁定',
    editableMeeting: '可修改',
    savedMeeting: '已收藏',
    selectRecord: '查看旧记录',
    recordLockedNote: '旧记录只能查看，不能删除。收藏超过 7 天后不允许修改。',
    importAgenda: '导入例会表 / Excel',
    exportExcel: '导出 Excel',
    templateReady: '已上传模板',
  },
  en: {
    navAdmin: 'Setup',
    navSystem: 'Club Profile Settings',
    navMaster: 'System Admin',
    navPeople: 'Members & Guests',
    navMeeting: 'Meeting & Agenda',
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
    evaluator: 'Best Evaluator',
    name: 'Name',
    speechTitle: 'Speech Title',
    project: 'Project',
    action: 'Action',
    remove: 'Remove',
    addPrepared: '+ Add Prepared Speaker',
    addImpromptu: '+ Add Table Topics Speaker',
    addEvaluator: '+ Add Evaluator',
    voteLink: 'Voting Link',
    scanVote: 'Scan to Vote',
    copyLink: 'Copy Link',
    downloadPoster: 'Download Share Image',
    preparedCandidates: 'Prepared Candidates',
    impromptuCandidates: 'Table Topics Candidates',
    evaluatorCandidates: 'Evaluator Candidates',
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
    bestEvaluator: 'Best Evaluator',
    votes: 'votes',
    preparedVotes: 'Prepared Votes',
    impromptuVotes: 'Table Topics Votes',
    evaluatorVotes: 'Evaluator Votes',
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
    privateSpace: 'After login, every user has an independent voting workspace.',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    createAccount: 'Create Account',
    logout: 'Logout',
    loginTitle: 'Toastmasters Voting System',
    loginSubtitle: 'Sign in to manage your own meetings, candidates, and voting history.',
    membersTitle: 'Member Directory',
    guestsTitle: 'Guest Directory',
    addMember: '+ Add Member',
    addGuest: '+ Add Guest',
    englishName: 'English Name',
    phone: 'Phone',
    pathway: 'Pathway',
    level: 'Level',
    status: 'Status',
    joinedDate: 'Joined Date',
    introducedBy: 'Introduced By',
    visitDate: 'Visit Date',
    notes: 'Notes',
    active: 'Active',
    inactive: 'Inactive',
    importMembers: 'Import from Members',
    syncFromRoles: 'Sync Current Meeting Roles',
    importRole: 'Import Meeting Role',
    peopleSaved: 'Members / guests saved',
    meetingSaved: 'Meeting details saved',
    attendanceTitle: 'Attendance',
    rolesTitle: 'Role Assignment',
    agendaTitle: 'Agenda',
    printAgenda: 'Print Agenda',
    attended: 'Attended',
    absent: 'Absent',
    role: 'Role',
    roleTime: 'Time / min',
    assignee: 'Assignee',
    addRole: '+ Add Role',
    resetRoles: 'Apply Full Role Template',
    member: 'Member',
    guest: 'Guest',
    preparedSpeakers: 'Prepared Speakers',
    evaluators: 'Evaluators',
    tableTopics: 'Table Topics',
    systemTitle: 'Club Profile Settings',
    systemSubtitle: 'Manage club name, logo, agenda template, and club admins. Voters only need the QR code, no login required.',
    clubName: 'Club Name',
    clubShortName: 'Club Short Name',
    toastmasterId: 'Toastmaster ID',
    adminName: 'Admin Name',
    username: 'User Name',
    systemSaved: 'System settings saved',
    accountNote: 'Club admin details can be recorded here. In production, passwords should be provisioned by System Admin through Supabase Auth / Edge Function, not stored as long-term plain text.',
    masterNote: 'System Admin is for the owner to create clubs, club admin IDs, and initial passwords.',
    logoUpload: 'Upload Club Logo',
    agendaTemplate: 'Upload Agenda Template',
    agendaRoleTemplate: 'Agenda Role Template',
    addTemplateRole: '+ Add Template Role',
    clubAdmins: 'Club Admins',
    addClubAdmin: '+ Add Admin',
    masterTitle: 'System Admin',
    masterSubtitle: 'Owner-only area to create clubs, Toastmaster IDs, user names, and initial passwords.',
    createClub: 'Create Club',
    saveClubList: 'Save Club List',
    clubCreated: 'Club added',
    clubListSaved: 'Club list saved',
    noClub: 'No club records yet',
    createClubHint: 'Please enter club name, user name, and password',
    clubList: 'Club List',
    newMeeting: 'New Meeting',
    editMeeting: 'Edit Meeting',
    meetingRecords: 'Meeting Records',
    currentMeeting: 'Current Meeting',
    lockedMeeting: 'Locked',
    editableMeeting: 'Editable',
    savedMeeting: 'Saved Meeting',
    selectRecord: 'View Past Record',
    recordLockedNote: 'Past records are view-only and cannot be deleted. Saved records lock after 7 days.',
    importAgenda: 'Import Agenda / Excel',
    exportExcel: 'Export Excel',
    templateReady: 'Template uploaded',
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

function CandidateNamePicker({ item, members, onSelectMember, onTypeOther, t }) {
  const isKnownMember = members.some(member => member.name === item.name)
  const value = item.name && isKnownMember ? item.name : item.name ? '__other__' : ''

  function handleChange(event) {
    const nextValue = event.target.value
    if (nextValue === '__other__') {
      onTypeOther(item.name && !isKnownMember ? item.name : '')
      return
    }
    const member = members.find(entry => entry.name === nextValue)
    if (member) onSelectMember(member)
  }

  return (
    <div className="tm-name-picker">
      <select value={value} onChange={handleChange}>
        <option value="">{t.name}</option>
        {members.map(member => (
          <option key={member.id} value={member.name}>{member.name}</option>
        ))}
        <option value="__other__">其他 / Other</option>
      </select>
      {value === '__other__' && (
        <input value={item.name} onChange={event => onTypeOther(event.target.value)} placeholder="其他 / Other" />
      )}
    </div>
  )
}

function roleMatchesCandidateType(roleName, type) {
  if (type === 'prepared') return /prepared speaker/i.test(roleName)
  if (type === 'impromptu') return /table topics speaker/i.test(roleName)
  if (type === 'evaluator') return /^evaluator\b/i.test(roleName)
  return false
}

function CandidateEditor({ type, candidates, onChange, t, people, meetingRoles = [] }) {
  const isPrepared = type === 'prepared'
  const title = isPrepared ? t.prepared : type === 'evaluator' ? t.evaluator : t.impromptu
  const activeMembers = (people?.members || []).filter(member => member.status !== 'inactive' && member.name)
  const candidateRoles = meetingRoles.filter(role => roleMatchesCandidateType(role.roleName, type))

  function update(id, field, value) {
    onChange(candidates.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  function selectMember(id, member) {
    onChange(candidates.map(item => {
      if (item.id !== id) return item
      const project = [member.pathway, member.level].filter(Boolean).join(' ')
      return isPrepared
        ? { ...item, name: member.name, project: project || item.project }
        : { ...item, name: member.name }
    }))
  }

  function addCandidate() {
    const nextId = `${type[0]}${Date.now()}`
    onChange([
      ...candidates,
      isPrepared
        ? { id: nextId, name: '', title: '', project: '', votes: 0 }
        : { id: nextId, name: '', votes: 0 },
    ])
  }

  function addFromRole(roleId) {
    const role = candidateRoles.find(item => item.id === roleId)
    if (!role) return
    const name = personLabel(people, role.personType, role.personId)
    if (!name) return
    const nextId = `${type[0]}${Date.now()}`
    const candidate = isPrepared
      ? { id: nextId, name, title: '', project: '', votes: 0 }
      : { id: nextId, name, votes: 0 }
    onChange([
      ...candidates.filter(item => item.name !== name),
      candidate,
    ])
  }

  function remove(id) {
    onChange(candidates.filter(item => item.id !== id))
  }

  return (
    <section className="tm-panel">
      <div className="tm-panel-title">
        <span className="tm-icon">{isPrepared ? '🏆' : '🎤'}</span>
        <h2>{title}</h2>
      </div>
      <div className="tm-role-import">
        <select value="" onChange={event => addFromRole(event.target.value)}>
          <option value="">{t.importRole}</option>
          {candidateRoles.map(role => {
            const name = personLabel(people, role.personType, role.personId)
            return (
              <option key={role.id} value={role.id}>
                {role.roleName}{name ? ` - ${name}` : ''}
              </option>
            )
          })}
        </select>
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
              <CandidateNamePicker
                item={item}
                members={activeMembers}
                onSelectMember={member => selectMember(item.id, member)}
                onTypeOther={value => update(item.id, 'name', value)}
                t={t}
              />
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
              <CandidateNamePicker
                item={item}
                members={activeMembers}
                onSelectMember={member => selectMember(item.id, member)}
                onTypeOther={value => update(item.id, 'name', value)}
                t={t}
              />
              <button onClick={() => remove(item.id)} aria-label={`Remove ${item.name}`}>x</button>
            </label>
          ))}
        </div>
      )}

      <button className="tm-outline" onClick={addCandidate}>
        {isPrepared ? t.addPrepared : type === 'evaluator' ? t.addEvaluator : t.addImpromptu}
      </button>
    </section>
  )
}

function AdminView({ data, setData, setView, persistState, source, syncStatus, t, people, meetingOps }) {
  function updateMeeting(field, value) {
    setData({ ...data, meeting: { ...data.meeting, [field]: value } })
  }

  function updateCandidates(field, list) {
    setData({ ...data, [field]: list })
  }

  function syncedVoteData(nextData = data) {
    return candidatesFromMeetingRoles(meetingOps.roles, people, nextData)
  }

  function saveSetup() {
    const next = syncedVoteData()
    setData(next)
    persistState(next)
  }

  function setStatus(status) {
    const next = syncedVoteData({ ...data, meeting: { ...data.meeting, status } })
    setData(next)
    persistState(next)
  }

  function importFromMembers() {
    const activeMembers = (people?.members || []).filter(member => member.status !== 'inactive')
    const toBasicCandidate = (member, prefix, index) => ({
      id: `${prefix}${Date.now()}${index}`,
      name: member.name,
      title: '',
      project: [member.pathway, member.level].filter(Boolean).join(' '),
      votes: 0,
    })
    const toNameCandidate = (member, prefix, index) => ({
      id: `${prefix}${Date.now()}${index}`,
      name: member.name,
      votes: 0,
    })
    const next = {
      ...data,
      prepared: activeMembers.slice(0, 2).map((member, index) => toBasicCandidate(member, 'p', index)),
      impromptu: activeMembers.slice(0, 4).map((member, index) => toNameCandidate(member, 'i', index)),
      evaluator: activeMembers.slice(0, 2).map((member, index) => toNameCandidate(member, 'e', index)),
    }
    setData(next)
  }

  function syncFromMeetingRoles() {
    setData(syncedVoteData())
  }

  const savedVotes =
    data.prepared.reduce((sum, item) => sum + item.votes, 0) +
    data.impromptu.reduce((sum, item) => sum + item.votes, 0) +
    data.evaluator.reduce((sum, item) => sum + item.votes, 0)

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
            <button onClick={saveSetup}>{t.save}</button>
            <button onClick={importFromMembers}>{t.importMembers}</button>
            <button onClick={syncFromMeetingRoles}>{t.syncFromRoles}</button>
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

        <CandidateEditor type="prepared" candidates={data.prepared} onChange={list => updateCandidates('prepared', list)} t={t} people={people} meetingRoles={meetingOps.roles} />
        <CandidateEditor type="impromptu" candidates={data.impromptu} onChange={list => updateCandidates('impromptu', list)} t={t} people={people} meetingRoles={meetingOps.roles} />
        <CandidateEditor type="evaluator" candidates={data.evaluator} onChange={list => updateCandidates('evaluator', list)} t={t} people={people} meetingRoles={meetingOps.roles} />
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
        <div className="tm-stat-row"><span>{t.evaluatorCandidates}</span><b>{data.evaluator.length}</b></div>
        <div className="tm-stat-row"><span>{t.totalVotes}</span><b>{savedVotes}</b></div>
        <div className="tm-stat-row"><span>{t.voteStatus}</span><b>{meetingStatusLabel(data.meeting.status, t)}</b></div>
      </aside>
    </div>
  )
}

function SystemSettingsView({ settings, setSettings, persistSettings, syncStatus, t }) {
  function update(field, value) {
    setSettings({ ...settings, [field]: value })
  }

  function updateAdmin(id, field, value) {
    setSettings({
      ...settings,
      clubAdmins: (settings.clubAdmins || []).map(item => item.id === id ? { ...item, [field]: value } : item),
    })
  }

  function addAdmin() {
    setSettings({
      ...settings,
      clubAdmins: [
        ...(settings.clubAdmins || []),
        { id: `a${Date.now()}`, toastmasterId: '', username: '', password: '', name: '' },
      ],
    })
  }

  function removeAdmin(id) {
    setSettings({
      ...settings,
      clubAdmins: (settings.clubAdmins || []).filter(item => item.id !== id),
    })
  }

  function updateTemplateRole(index, value) {
    const nextRoles = [...(settings.agendaRoleTemplate || [])]
    const current = typeof nextRoles[index] === 'string' ? { roleName: nextRoles[index], time: '' } : nextRoles[index]
    nextRoles[index] = { ...current, roleName: value }
    setSettings({ ...settings, agendaRoleTemplate: nextRoles })
  }

  function updateTemplateRoleTime(index, value) {
    const nextRoles = [...(settings.agendaRoleTemplate || [])]
    const current = typeof nextRoles[index] === 'string' ? { roleName: nextRoles[index], time: '' } : nextRoles[index]
    nextRoles[index] = { ...current, time: value }
    setSettings({ ...settings, agendaRoleTemplate: nextRoles })
  }

  function addTemplateRole() {
    setSettings({
      ...settings,
      agendaRoleTemplate: [...(settings.agendaRoleTemplate || []), { roleName: '', time: '' }],
    })
  }

  function removeTemplateRole(index) {
    setSettings({
      ...settings,
      agendaRoleTemplate: (settings.agendaRoleTemplate || []).filter((_, currentIndex) => currentIndex !== index),
    })
  }

  function readFile(event, field, nameField = '') {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setSettings({
        ...settings,
        [field]: reader.result,
        ...(nameField ? { [nameField]: file.name } : {}),
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="tm-main-column">
      <div className="tm-screen-head">
        <div>
          <h1>{t.systemTitle}</h1>
          <p>{t.systemSubtitle}</p>
          {syncStatus && <div className="tm-sync-badge"><b>{syncStatus}</b></div>}
        </div>
        <div className="tm-actions">
          <button className="tm-gold" onClick={() => persistSettings(settings)}>{t.save}</button>
        </div>
      </div>

      <section className="tm-panel">
        <div className="tm-panel-title">
          <span className="tm-icon">⚙</span>
          <h2>{t.navSystem}</h2>
        </div>
        <div className="tm-form-grid">
          <label>
            <span>{t.clubName}</span>
            <input value={settings.clubName} onChange={event => update('clubName', event.target.value)} />
          </label>
          <label>
            <span>{t.clubShortName}</span>
            <input value={settings.clubShort} onChange={event => update('clubShort', event.target.value)} />
          </label>
          <label>
            <span>{t.toastmasterId}</span>
            <input value={settings.toastmasterId} onChange={event => update('toastmasterId', event.target.value)} />
          </label>
          <label>
            <span>{t.username}</span>
            <input value={settings.username} onChange={event => update('username', event.target.value)} />
          </label>
          <label>
            <span>{t.adminName}</span>
            <input value={settings.adminName} onChange={event => update('adminName', event.target.value)} />
          </label>
        </div>
      </section>

      <section className="tm-panel">
        <div className="tm-panel-title">
          <span className="tm-icon">▣</span>
          <h2>{t.logoUpload}</h2>
        </div>
        <div className="tm-upload-grid">
          <label className="tm-upload-box">
            <span>{t.logoUpload}</span>
            <input type="file" accept="image/*" onChange={event => readFile(event, 'logoDataUrl')} />
          </label>
          <div className="tm-logo-preview">
            {settings.logoDataUrl ? <img src={settings.logoDataUrl} alt={t.logoUpload} /> : <span>{t.clubShort}</span>}
          </div>
          <label className="tm-upload-box">
            <span>{t.agendaTemplate}</span>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={event => readFile(event, 'agendaTemplateDataUrl', 'agendaTemplateName')} />
          </label>
          <div className="tm-template-preview">
            <b>{settings.agendaTemplateName || t.pending}</b>
            {settings.agendaTemplateName && <small>{t.templateReady}</small>}
          </div>
        </div>
      </section>

      <section className="tm-panel">
        <div className="tm-panel-title">
          <span className="tm-icon">☷</span>
          <h2>{t.agendaRoleTemplate}</h2>
        </div>
        <div className="tm-template-roles">
          {(settings.agendaRoleTemplate || []).map((role, index) => {
            const templateRole = typeof role === 'string' ? { roleName: role, time: '' } : role
            return (
            <div key={`${templateRole.roleName}-${index}`} className="tm-template-role-row">
              <span>{index + 1}</span>
              <input value={templateRole.roleName} onChange={event => updateTemplateRole(index, event.target.value)} />
              <input value={templateRole.time || ''} onChange={event => updateTemplateRoleTime(index, event.target.value)} placeholder="min" />
              <button className="tm-danger" onClick={() => removeTemplateRole(index)}>{t.remove}</button>
            </div>
            )
          })}
        </div>
        <button className="tm-outline" onClick={addTemplateRole}>{t.addTemplateRole}</button>
      </section>

      <section className="tm-panel">
        <div className="tm-panel-title">
          <span className="tm-icon">👤</span>
          <h2>{t.clubAdmins}</h2>
        </div>
        <div className="tm-directory-table admins">
          <div className="tm-directory-head">
            <span>{t.toastmasterId}</span>
            <span>{t.username}</span>
            <span>{t.password}</span>
            <span>{t.adminName}</span>
            <span>{t.action}</span>
          </div>
          {(settings.clubAdmins || []).map(item => (
            <div className="tm-directory-row" key={item.id}>
              <input value={item.toastmasterId} onChange={event => updateAdmin(item.id, 'toastmasterId', event.target.value)} />
              <input value={item.username} onChange={event => updateAdmin(item.id, 'username', event.target.value)} />
              <input value={item.password} type="password" onChange={event => updateAdmin(item.id, 'password', event.target.value)} />
              <input value={item.name} onChange={event => updateAdmin(item.id, 'name', event.target.value)} />
              <button className="tm-danger" onClick={() => removeAdmin(item.id)}>{t.remove}</button>
            </div>
          ))}
        </div>
        <button className="tm-outline" onClick={addAdmin}>{t.addClubAdmin}</button>
      </section>

      <section className="tm-panel tm-note-panel">
        <p>{t.accountNote}</p>
        <p>{t.masterNote}</p>
      </section>
    </div>
  )
}

function MasterAdminView({ settings, t }) {
  const admins = settings.clubAdmins || []
  const [clubs, setClubs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tm-master-clubs') || '[]')
    } catch {
      return []
    }
  })
  const [draft, setDraft] = useState({
    clubName: '',
    toastmasterId: '',
    username: '',
    password: '',
    adminName: '',
  })
  const [message, setMessage] = useState('')

  function updateDraft(field, value) {
    setDraft({ ...draft, [field]: value })
  }

  function createClub() {
    if (!draft.clubName || !draft.username || !draft.password) {
      setMessage(t.createClubHint)
      document.getElementById('tm-create-club-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    const nextClubs = [
      ...clubs,
      { ...draft, id: `club${Date.now()}` },
    ]
    setClubs(nextClubs)
    localStorage.setItem('tm-master-clubs', JSON.stringify(nextClubs))
    setDraft({ clubName: '', toastmasterId: '', username: '', password: '', adminName: '' })
    setMessage(t.clubCreated)
  }

  function updateClub(id, field, value) {
    setClubs(clubs.map(club => club.id === id ? { ...club, [field]: value } : club))
  }

  function deleteClub(id) {
    const nextClubs = clubs.filter(club => club.id !== id)
    setClubs(nextClubs)
    localStorage.setItem('tm-master-clubs', JSON.stringify(nextClubs))
  }

  function saveClubList() {
    let nextClubs = clubs
    if (draft.clubName || draft.toastmasterId || draft.username || draft.password || draft.adminName) {
      if (!draft.clubName || !draft.username || !draft.password) {
        setMessage(t.createClubHint)
        return
      }
      nextClubs = [...clubs, { ...draft, id: `club${Date.now()}` }]
      setClubs(nextClubs)
      setDraft({ clubName: '', toastmasterId: '', username: '', password: '', adminName: '' })
    }
    localStorage.setItem('tm-master-clubs', JSON.stringify(nextClubs))
    setMessage(t.clubListSaved)
  }

  return (
    <div className="tm-main-column">
      <div className="tm-screen-head">
        <div>
          <h1>{t.masterTitle}</h1>
          <p>{t.masterSubtitle}</p>
        </div>
        <div className="tm-actions">
          <button className="tm-gold" onClick={createClub}>{t.createClub}</button>
          <button onClick={saveClubList}>{t.saveClubList}</button>
        </div>
      </div>
      {message && <div className="tm-sync-badge"><b>{message}</b></div>}
      <section className="tm-panel" id="tm-create-club-form">
        <div className="tm-panel-title">
          <span className="tm-icon">＋</span>
          <h2>{t.createClub}</h2>
        </div>
        <div className="tm-form-grid">
          <label>
            <span>{t.clubName}</span>
            <input value={draft.clubName} onChange={event => updateDraft('clubName', event.target.value)} />
          </label>
          <label>
            <span>{t.toastmasterId}</span>
            <input value={draft.toastmasterId} onChange={event => updateDraft('toastmasterId', event.target.value)} />
          </label>
          <label>
            <span>{t.username}</span>
            <input value={draft.username} onChange={event => updateDraft('username', event.target.value)} />
          </label>
          <label>
            <span>{t.password}</span>
            <input type="password" value={draft.password} onChange={event => updateDraft('password', event.target.value)} />
          </label>
          <label>
            <span>{t.adminName}</span>
            <input value={draft.adminName} onChange={event => updateDraft('adminName', event.target.value)} />
          </label>
        </div>
      </section>
      <section className="tm-panel">
        <div className="tm-panel-title">
          <span className="tm-icon">☷</span>
          <h2>{t.clubList}</h2>
        </div>
        <div className="tm-master-list">
          <div>
            <span>{t.clubName}</span>
            <b>{settings.clubName || t.club}</b>
          </div>
          <div>
            <span>{t.toastmasterId}</span>
            <b>{settings.toastmasterId || t.pending}</b>
          </div>
          <div>
            <span>{t.clubAdmins}</span>
            <b>{admins.length}</b>
          </div>
        </div>
        <div className="tm-club-table">
          <div className="tm-club-table-head">
            <span>{t.clubName}</span>
            <span>{t.toastmasterId}</span>
            <span>{t.username}</span>
            <span>{t.password}</span>
            <span>{t.adminName}</span>
            <span>{t.action}</span>
          </div>
          {clubs.map(club => (
            <div className="tm-club-table-row" key={club.id}>
              <input value={club.clubName} onChange={event => updateClub(club.id, 'clubName', event.target.value)} />
              <input value={club.toastmasterId} onChange={event => updateClub(club.id, 'toastmasterId', event.target.value)} />
              <input value={club.username} onChange={event => updateClub(club.id, 'username', event.target.value)} />
              <input type="password" value={club.password} onChange={event => updateClub(club.id, 'password', event.target.value)} />
              <input value={club.adminName} onChange={event => updateClub(club.id, 'adminName', event.target.value)} />
              <button className="tm-danger" onClick={() => deleteClub(club.id)}>{t.remove}</button>
            </div>
          ))}
          {!clubs.length && <div className="tm-empty-row">{t.noClub}</div>}
        </div>
      </section>
      <section className="tm-panel tm-note-panel">
        <p>{t.masterNote}</p>
        <p>{t.accountNote}</p>
      </section>
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
  const [evaluatorPick, setEvaluatorPick] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const alreadyVoted = hasLocalVote(data.meeting.number)
  const isOpen = ['open', '开放投票', '开放中'].includes(data.meeting.status)

  async function handleSubmitVote() {
    if (!preparedPick || !impromptuPick || !evaluatorPick || alreadyVoted) return
    setSubmitting(true)
    setError('')
    try {
      const voterToken = getOrCreateVoterToken(data.meeting.number)
      const result = await submitVote(data, preparedPick, impromptuPick, evaluatorPick, voterToken)
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
          <VoteCard title={t.evaluator} candidates={data.evaluator} selected={evaluatorPick} onSelect={setEvaluatorPick} t={t} />
          <button className="tm-submit-vote" disabled={!preparedPick || !impromptuPick || !evaluatorPick || submitting} onClick={handleSubmitVote}>
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
          <strong>{t.evaluator}</strong>
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
  const evaluatorWinner = winner(data.evaluator, t)
  const maxPrepared = Math.max(1, ...data.prepared.map(item => item.votes))
  const maxImpromptu = Math.max(1, ...data.impromptu.map(item => item.votes))
  const maxEvaluator = Math.max(1, ...data.evaluator.map(item => item.votes))

  return (
    <div className="tm-results-grid">
      <section className="tm-panel">
        <h2>{t.realtime}</h2>
        <div className="tm-winner-row">
          <div><span>{t.bestPrepared}</span><b>{preparedWinner.label}</b><small>{preparedWinner.votes} {t.votes}</small></div>
          <div><span>{t.bestImpromptu}</span><b>{impromptuWinner.label}</b><small>{impromptuWinner.votes} {t.votes}</small></div>
          <div><span>{t.bestEvaluator}</span><b>{evaluatorWinner.label}</b><small>{evaluatorWinner.votes} {t.votes}</small></div>
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
      <section className="tm-panel">
        <h2>{t.evaluatorVotes}</h2>
        {data.evaluator.map(item => <Bar key={item.id} item={item} max={maxEvaluator} />)}
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
      evaluatorWinner: winner(data.evaluator, t).label,
      evaluatorVotes: winner(data.evaluator, t).votes,
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
            <p>{t.bestEvaluator}: {record.evaluatorWinner || t.pending} ({record.evaluatorVotes} {t.votes})</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function PeopleView({ people, setPeople, persistPeople, syncStatus, t }) {
  function updateMember(id, field, value) {
    setPeople({
      ...people,
      members: people.members.map(item => item.id === id ? { ...item, [field]: value } : item),
    })
  }

  function updateGuest(id, field, value) {
    setPeople({
      ...people,
      guests: people.guests.map(item => item.id === id ? { ...item, [field]: value } : item),
    })
  }

  function addMember() {
    setPeople({
      ...people,
      members: [
        ...people.members,
        {
          id: `m${Date.now()}`,
          name: '',
          englishName: '',
          email: '',
          phone: '',
          pathway: '',
          level: '',
          status: 'active',
          joinedDate: '',
        },
      ],
    })
  }

  function addGuest() {
    setPeople({
      ...people,
      guests: [
        ...people.guests,
        {
          id: `g${Date.now()}`,
          name: '',
          email: '',
          phone: '',
          introducedBy: '',
          visitDate: '',
          notes: '',
        },
      ],
    })
  }

  function removeMember(id) {
    setPeople({ ...people, members: people.members.filter(item => item.id !== id) })
  }

  function removeGuest(id) {
    setPeople({ ...people, guests: people.guests.filter(item => item.id !== id) })
  }

  return (
    <div className="tm-main-column">
      <div className="tm-screen-head">
        <div>
          <h1>{t.navPeople}</h1>
          <p>{t.privateSpace}</p>
          {syncStatus && <div className="tm-sync-badge"><b>{syncStatus}</b></div>}
        </div>
        <div className="tm-actions">
          <button className="tm-gold" onClick={() => persistPeople(people)}>{t.save}</button>
          <button onClick={addMember}>{t.addMember}</button>
          <button onClick={addGuest}>{t.addGuest}</button>
        </div>
      </div>

      <section className="tm-panel">
        <div className="tm-panel-title">
          <span className="tm-icon">👥</span>
          <h2>{t.membersTitle}</h2>
        </div>
        <div className="tm-directory-table members">
          <div className="tm-directory-head">
            <span>{t.name}</span>
            <span>{t.englishName}</span>
            <span>{t.pathway}</span>
            <span>{t.level}</span>
            <span>{t.email}</span>
            <span>{t.phone}</span>
            <span>{t.status}</span>
            <span>{t.action}</span>
          </div>
          {people.members.map(item => (
            <div className="tm-directory-row" key={item.id}>
              <input value={item.name} onChange={e => updateMember(item.id, 'name', e.target.value)} />
              <input value={item.englishName} onChange={e => updateMember(item.id, 'englishName', e.target.value)} />
              <input value={item.pathway} onChange={e => updateMember(item.id, 'pathway', e.target.value)} />
              <input value={item.level} onChange={e => updateMember(item.id, 'level', e.target.value)} />
              <input value={item.email} onChange={e => updateMember(item.id, 'email', e.target.value)} />
              <input value={item.phone} onChange={e => updateMember(item.id, 'phone', e.target.value)} />
              <select value={item.status} onChange={e => updateMember(item.id, 'status', e.target.value)}>
                <option value="active">{t.active}</option>
                <option value="inactive">{t.inactive}</option>
              </select>
              <button className="tm-danger" onClick={() => removeMember(item.id)}>{t.remove}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="tm-panel">
        <div className="tm-panel-title">
          <span className="tm-icon">🙋</span>
          <h2>{t.guestsTitle}</h2>
        </div>
        <div className="tm-directory-table guests">
          <div className="tm-directory-head">
            <span>{t.name}</span>
            <span>{t.email}</span>
            <span>{t.phone}</span>
            <span>{t.introducedBy}</span>
            <span>{t.visitDate}</span>
            <span>{t.notes}</span>
            <span>{t.action}</span>
          </div>
          {people.guests.map(item => (
            <div className="tm-directory-row" key={item.id}>
              <input value={item.name} onChange={e => updateGuest(item.id, 'name', e.target.value)} />
              <input value={item.email} onChange={e => updateGuest(item.id, 'email', e.target.value)} />
              <input value={item.phone} onChange={e => updateGuest(item.id, 'phone', e.target.value)} />
              <input value={item.introducedBy} onChange={e => updateGuest(item.id, 'introducedBy', e.target.value)} />
              <input value={item.visitDate} onChange={e => updateGuest(item.id, 'visitDate', e.target.value)} />
              <input value={item.notes} onChange={e => updateGuest(item.id, 'notes', e.target.value)} />
              <button className="tm-danger" onClick={() => removeGuest(item.id)}>{t.remove}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function personLabel(people, type, id) {
  const list = type === 'guest' ? people.guests : people.members
  return list.find(item => item.id === id)?.name || ''
}

function PersonSelect({ people, personType, personId, onChange, t, disabled = false }) {
  const list = personType === 'guest' ? people.guests : people.members

  return (
    <div className="tm-person-select">
      <select disabled={disabled} value={personType} onChange={event => onChange(event.target.value, '')}>
        <option value="member">{t.member}</option>
        <option value="guest">{t.guest}</option>
      </select>
      <select disabled={disabled} value={personId} onChange={event => onChange(personType, event.target.value)}>
        <option value="">{t.name}</option>
        {list.map(item => (
          <option key={item.id} value={item.id}>{item.name}</option>
        ))}
      </select>
    </div>
  )
}

function fullToastmastersRoles(settings) {
  const nonRolePattern = /invocation|pledge|guest introduction|word of the day|timer report|ah counter report|grammarian report|awards presentation|president closing/i
  const fallbackRoles = [
    { roleName: 'Sergeant at Arms', time: '3' },
    { roleName: 'President', time: '5' },
    { roleName: 'Toastmaster of the Evening', time: '5' },
    { roleName: 'Timer', time: '3' },
    { roleName: 'Ah Counter', time: '3' },
    { roleName: 'Grammarian', time: '5' },
    { roleName: 'Prepared Speaker 1', time: '7' },
    { roleName: 'Prepared Speaker 2', time: '7' },
    { roleName: 'Prepared Speaker 3', time: '7' },
    { roleName: 'Evaluator 1', time: '3' },
    { roleName: 'Evaluator 2', time: '3' },
    { roleName: 'Evaluator 3', time: '3' },
    { roleName: 'Table Topics Master', time: '20' },
    { roleName: 'Table Topics Speaker 1', time: '2' },
    { roleName: 'Table Topics Speaker 2', time: '2' },
    { roleName: 'Table Topics Speaker 3', time: '2' },
    { roleName: 'Table Topics Speaker 4', time: '2' },
    { roleName: 'General Evaluator', time: '10' },
  ]
  const templateRoles = (settings.agendaRoleTemplate || [])
    .filter(Boolean)
    .filter(role => !nonRolePattern.test(typeof role === 'string' ? role : role.roleName || ''))
  const sourceRoles = templateRoles.length >= 8 ? templateRoles : fallbackRoles
  return sourceRoles.map((role, index) => {
    const templateRole = typeof role === 'string' ? { roleName: role, time: '' } : role
    return {
      id: `r${Date.now()}${index}`,
      roleName: templateRole.roleName,
      time: templateRole.time || '',
      personType: 'member',
      personId: '',
    }
  })
}

function candidatesFromMeetingRoles(roles, people, existingData) {
  const toName = role => personLabel(people, role.personType, role.personId)
  const toCandidate = (role, prefix, index) => ({
    id: `${prefix}${Date.now()}${index}`,
    name: toName(role),
    votes: 0,
  })
  const prepared = roles
    .filter(role => /prepared speaker/i.test(role.roleName) && toName(role))
    .map((role, index) => ({
      ...toCandidate(role, 'p', index),
      title: '',
      project: '',
    }))
  const impromptu = roles
    .filter(role => /table topics speaker/i.test(role.roleName) && toName(role))
    .map((role, index) => toCandidate(role, 'i', index))
  const evaluator = roles
    .filter(role => /^evaluator\b/i.test(role.roleName) && toName(role))
    .map((role, index) => toCandidate(role, 'e', index))

  return {
    ...existingData,
    prepared: prepared.length ? prepared : existingData.prepared,
    impromptu: impromptu.length ? impromptu : existingData.impromptu,
    evaluator: evaluator.length ? evaluator : existingData.evaluator,
  }
}

function meetingRecordKey() {
  return 'tm-meeting-records-v1'
}

function isRecordLocked(record) {
  if (!record?.savedAt) return false
  const savedTime = new Date(record.savedAt).getTime()
  if (Number.isNaN(savedTime)) return false
  return Date.now() - savedTime > 7 * 24 * 60 * 60 * 1000
}

function MeetingView({ data, setData, persistState, people, meetingOps, setMeetingOps, persistMeetingOps, syncStatus, t, settings }) {
  const [records, setRecords] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(meetingRecordKey()) || '[]')
    } catch {
      return []
    }
  })
  const [selectedRecordId, setSelectedRecordId] = useState('current')
  const selectedRecord = records.find(record => record.id === selectedRecordId)
  const viewingOldRecord = selectedRecordId !== 'current'
  const locked = viewingOldRecord || isRecordLocked(selectedRecord)
  const attendanceIndex = new Map(meetingOps.attendance.map(item => [`${item.personType}:${item.personId}`, item.attended]))
  const attendanceRows = [
    ...people.members.map(item => ({ personType: 'member', personId: item.id, name: item.name })),
    ...people.guests.map(item => ({ personType: 'guest', personId: item.id, name: item.name })),
  ].filter(item => item.name)

  function updateMeeting(field, value) {
    if (locked) return
    setData({ ...data, meeting: { ...data.meeting, [field]: value } })
  }

  function updateAttendance(personType, personId, attended) {
    if (locked) return
    const key = `${personType}:${personId}`
    const existing = meetingOps.attendance.find(item => `${item.personType}:${item.personId}` === key)
    const nextAttendance = existing
      ? meetingOps.attendance.map(item => `${item.personType}:${item.personId}` === key ? { ...item, attended } : item)
      : [...meetingOps.attendance, { personType, personId, attended }]
    setMeetingOps({ ...meetingOps, attendance: nextAttendance })
  }

  function updateRole(id, field, value) {
    if (locked) return
    setMeetingOps({
      ...meetingOps,
      roles: meetingOps.roles.map(item => item.id === id ? { ...item, [field]: value } : item),
    })
  }

  function updateRolePerson(id, personType, personId) {
    if (locked) return
    setMeetingOps({
      ...meetingOps,
      roles: meetingOps.roles.map(item => item.id === id ? { ...item, personType, personId } : item),
    })
  }

  function addRole() {
    if (locked) return
    setMeetingOps({
      ...meetingOps,
      roles: [...meetingOps.roles, { id: `r${Date.now()}`, roleName: '', time: '', personType: 'member', personId: '' }],
    })
  }

  function removeRole(id) {
    if (locked) return
    setMeetingOps({ ...meetingOps, roles: meetingOps.roles.filter(item => item.id !== id) })
  }

  function resetRolesFromTemplate() {
    if (locked) return
    const roles = fullToastmastersRoles(settings)
    setMeetingOps({ ...meetingOps, roles })
    setData(candidatesFromMeetingRoles(roles, people, data))
  }

  function createMeeting() {
    setSelectedRecordId('current')
    const roles = fullToastmastersRoles(settings)
    const currentNumber = String(data.meeting.number || '').match(/\d+/)?.[0]
    const nextNumber = currentNumber ? `第${Number(currentNumber) + 1}次` : ''
    const next = {
      ...data,
      meeting: {
        ...data.meeting,
        id: `${Date.now()}`,
        number: nextNumber,
        date: new Date().toISOString().slice(0, 10),
        theme: '',
        word: '',
        closeTime: '',
        status: 'draft',
      },
      prepared: [],
      impromptu: [],
      evaluator: [],
    }
    setData(next)
    setMeetingOps({
      attendance: [],
      roles,
    })
  }

  function importAgendaFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    window.alert(`${t.importAgenda}: ${file.name}`)
  }

  function exportExcel() {
    const rows = [
      ['Section', 'Role/Type', 'Name', 'Detail'],
      ...meetingOps.roles.map(item => ['Role', item.roleName, personLabel(people, item.personType, item.personId), '']),
      ...data.prepared.map(item => ['Prepared Speaker', item.project || '', item.name, item.title || '']),
      ...data.evaluator.map(item => ['Evaluator', '', item.name, '']),
      ...data.impromptu.map(item => ['Table Topics', '', item.name, '']),
    ]
    const csv = rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${data.meeting.number || 'meeting'}-agenda.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  async function saveMeetingAll() {
    if (locked) return
    const syncedData = candidatesFromMeetingRoles(meetingOps.roles, people, data)
    setData(syncedData)
    await persistState(syncedData)
    await persistMeetingOps(meetingOps)
    const record = {
      id: syncedData.meeting.id || `${Date.now()}`,
      savedAt: new Date().toISOString(),
      data: syncedData,
      meetingOps,
    }
    const nextRecords = [
      record,
      ...records.filter(item => item.id !== record.id),
    ]
    setRecords(nextRecords)
    localStorage.setItem(meetingRecordKey(), JSON.stringify(nextRecords))
    setSelectedRecordId(record.id)
  }

  function selectRecord(id) {
    setSelectedRecordId(id)
    if (id === 'current') return
    const record = records.find(item => item.id === id)
    if (!record) return
    setData(record.data)
    setMeetingOps(record.meetingOps)
  }

  function editCurrent() {
    setSelectedRecordId('current')
  }

  return (
    <div className="tm-main-column">
      <div className="tm-screen-head no-print">
        <div>
          <h1>{t.navMeeting}</h1>
          <p>{data.meeting.number || t.currentMeeting} {t.regularMeeting} | {data.meeting.date}</p>
          <p className="tm-lock-note">{locked ? t.lockedMeeting : t.editableMeeting} · {t.recordLockedNote}</p>
          {syncStatus && <div className="tm-sync-badge"><b>{syncStatus}</b></div>}
        </div>
        <div className="tm-actions">
          <button className="tm-gold" onClick={createMeeting}>{t.newMeeting}</button>
          <button onClick={editCurrent}>{t.editMeeting}</button>
          <label className="tm-file-action">
            {t.importAgenda}
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" onChange={importAgendaFile} />
          </label>
          <button onClick={exportExcel}>{t.exportExcel}</button>
          <button onClick={saveMeetingAll} disabled={locked}>{t.save}</button>
          <button onClick={addRole} disabled={locked}>{t.addRole}</button>
          <button onClick={resetRolesFromTemplate} disabled={locked}>{t.resetRoles}</button>
          <button onClick={() => window.print()}>{t.printAgenda}</button>
        </div>
      </div>

      <section className="tm-panel no-print">
        <div className="tm-panel-title">
          <span className="tm-icon">☷</span>
          <h2>{t.meetingRecords}</h2>
        </div>
        <div className="tm-record-toolbar">
          <label>
            <span>{t.selectRecord}</span>
            <select value={selectedRecordId} onChange={event => selectRecord(event.target.value)}>
              <option value="current">{t.currentMeeting}</option>
              {records.map(record => (
                <option key={record.id} value={record.id}>
                  {record.data?.meeting?.number || record.id} | {record.data?.meeting?.date || ''} {isRecordLocked(record) ? `(${t.lockedMeeting})` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="tm-panel no-print">
        <div className="tm-panel-title">
          <span className="tm-icon">☰</span>
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
              <input disabled={locked} value={data.meeting[field] || ''} onChange={event => updateMeeting(field, event.target.value)} />
            </label>
          ))}
        </div>
      </section>

      <section className="tm-panel no-print">
        <div className="tm-panel-title">
          <span className="tm-icon">✓</span>
          <h2>{t.attendanceTitle}</h2>
        </div>
        <div className="tm-attendance-grid">
          {attendanceRows.map(item => {
            const checked = attendanceIndex.get(`${item.personType}:${item.personId}`) !== false
            return (
              <label key={`${item.personType}-${item.personId}`} className="tm-attendance-item">
                <input
                  type="checkbox"
                  disabled={locked}
                  checked={checked}
                  onChange={event => updateAttendance(item.personType, item.personId, event.target.checked)}
                />
                <span>{item.name}</span>
                <small>{item.personType === 'guest' ? t.guest : t.member}</small>
              </label>
            )
          })}
        </div>
      </section>

      <section className="tm-panel no-print">
        <div className="tm-panel-title">
          <span className="tm-icon">▦</span>
          <h2>{t.rolesTitle}</h2>
        </div>
        <div className="tm-role-table">
          <div className="tm-role-head">
            <span>{t.role}</span>
            <span>{t.roleTime}</span>
            <span>{t.assignee}</span>
            <span>{t.action}</span>
          </div>
          {meetingOps.roles.map(item => (
            <div className="tm-role-row" key={item.id}>
              <input disabled={locked} value={item.roleName} onChange={event => updateRole(item.id, 'roleName', event.target.value)} />
              <input disabled={locked} value={item.time || ''} onChange={event => updateRole(item.id, 'time', event.target.value)} />
              <PersonSelect
                people={people}
                personType={item.personType}
                personId={item.personId}
                onChange={(personType, personId) => !locked && updateRolePerson(item.id, personType, personId)}
                t={t}
                disabled={locked}
              />
              <button className="tm-danger" disabled={locked} onClick={() => removeRole(item.id)}>{t.remove}</button>
            </div>
          ))}
        </div>
      </section>

      <section className="tm-agenda-print">
        <header>
          {settings.logoDataUrl && <img className="tm-agenda-logo" src={settings.logoDataUrl} alt={t.clubShort} />}
          <h1>{t.club}</h1>
          <h2>{data.meeting.number} {t.regularMeeting}</h2>
          <p>{data.meeting.date} | {data.meeting.theme} | {t.word}: {data.meeting.word}</p>
        </header>
        <div className="tm-agenda-columns">
          <div>
            <h3>{t.rolesTitle}</h3>
            {meetingOps.roles.map(item => (
              <p key={item.id}><b>{item.roleName || t.role}</b>{item.time ? ` (${item.time})` : ''}: {personLabel(people, item.personType, item.personId) || t.pending}</p>
            ))}
          </div>
          <div>
            <h3>{t.preparedSpeakers}</h3>
            {data.prepared.map(item => <p key={item.id}><b>{item.name || t.pending}</b>: {item.title || t.pending}</p>)}
            <h3>{t.evaluators}</h3>
            {data.evaluator.map(item => <p key={item.id}>{item.name || t.pending}</p>)}
            <h3>{t.tableTopics}</h3>
            {data.impromptu.map(item => <p key={item.id}>{item.name || t.pending}</p>)}
          </div>
        </div>
      </section>
    </div>
  )
}

function normalizeState(next) {
  return {
    ...next,
    evaluator: next.evaluator || [
      { id: 'e1', name: '胡惠钦', votes: 0 },
      { id: 'e2', name: '叶雪娥', votes: 0 },
    ],
    history: (next.history || []).map(record => ({
      ...record,
      evaluatorWinner: record.evaluatorWinner || '',
      evaluatorVotes: record.evaluatorVotes || 0,
    })),
  }
}

function LoginView({ lang, setLang, t, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(mode) {
    setBusy(true)
    setError('')
    try {
      const user = mode === 'signup'
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password)
      onLogin(user)
    } catch (err) {
      setError(err.message || t.saveFailed)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tm-login-page">
      <div className="tm-login-card">
        <div className="tm-brand tm-login-brand">TM Vote</div>
        <LanguageToggle lang={lang} setLang={setLang} t={t} />
        <h1>{t.loginTitle}</h1>
        <p>{t.loginSubtitle}</p>
        <p className="tm-login-note">{t.privateSpace}</p>
        <label>
          <span>{t.email}</span>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" />
        </label>
        <label>
          <span>{t.password}</span>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
        </label>
        {error && <p className="tm-error">{error}</p>}
        <div className="tm-login-actions">
          <button disabled={busy || !email || !password} onClick={() => submit('login')}>{t.login}</button>
          <button disabled={busy || !email || !password} className="tm-outline" onClick={() => submit('signup')}>{t.createAccount}</button>
        </div>
      </div>
    </div>
  )
}

export default function ToastmastersVote() {
  const [data, setData] = useState(null)
  const [people, setPeople] = useState({ members: [], guests: [] })
  const [meetingOps, setMeetingOps] = useState({ attendance: [], roles: [] })
  const [settings, setSettings] = useState({
    clubName: '',
    clubShort: '',
    toastmasterId: '',
    adminName: '',
    username: '',
    logoDataUrl: '',
    agendaTemplateName: '',
    agendaTemplateDataUrl: '',
    clubAdmins: [],
  })
  const publicView = new URLSearchParams(window.location.search).get('view') === 'vote'
  const publicSpace = new URLSearchParams(window.location.search).get('space') || ''
  const [view, setView] = useState(publicView ? 'vote' : 'system')
  const [lang, setLang] = useState(() => localStorage.getItem('tm-vote-lang') || 'zh')
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(!isCloudConfigured || publicView)
  const [source, setSource] = useState(isCloudConfigured ? 'cloud' : 'local')
  const [syncStatus, setSyncStatus] = useState('')
  const t = LANG[lang]
  const appText = {
    ...t,
    club: settings.clubName || t.club,
    clubShort: settings.clubShort || t.clubShort,
  }

  useEffect(() => {
    if (!isCloudConfigured || publicView) return undefined
    let mounted = true
    getCurrentUser().then(currentUser => {
      if (!mounted) return
      setUser(currentUser)
      setAuthReady(true)
    })
    const unsubscribe = onAuthChange(nextUser => {
      setUser(nextUser)
      setAuthReady(true)
    })
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [publicView])

  useEffect(() => {
    let ignore = false
    async function hydrate() {
      if (!authReady || (!publicView && isCloudConfigured && !user)) return
      setSyncStatus(t.syncing)
      try {
        const result = await loadVoteState(publicView ? publicSpace : '')
        if (!ignore) {
          setData(normalizeState(result.data))
          setSource(result.source)
          setSyncStatus('')
        }
      } catch {
        if (!ignore) {
          setData(normalizeState(loadLocalState()))
          setSource('local')
          setSyncStatus(t.loadFailed)
        }
      }
    }
    hydrate()
    return () => { ignore = true }
  }, [authReady, user, publicView, publicSpace])

  useEffect(() => {
    let ignore = false
    async function hydratePeople() {
      if (publicView || !authReady || (isCloudConfigured && !user)) return
      try {
        const result = await loadPeopleState()
        if (!ignore) setPeople(result.data)
      } catch {
        if (!ignore) setPeople({ members: [], guests: [] })
      }
    }
    hydratePeople()
    return () => { ignore = true }
  }, [authReady, user, publicView])

  useEffect(() => {
    let ignore = false
    async function hydrateSettings() {
      if (!authReady || (!publicView && isCloudConfigured && !user)) return
      try {
        const result = await loadSystemSettings(publicView ? publicSpace : '')
        if (!ignore) setSettings(result.data)
      } catch {
        if (!ignore) setSettings({ clubName: t.club, clubShort: t.clubShort, toastmasterId: '', adminName: '', username: '', logoDataUrl: '', agendaTemplateName: '', agendaTemplateDataUrl: '', clubAdmins: [] })
      }
    }
    hydrateSettings()
    return () => { ignore = true }
  }, [authReady, user, publicView, publicSpace])

  useEffect(() => {
    let ignore = false
    async function hydrateMeetingOps() {
      if (publicView || !authReady || (isCloudConfigured && !user) || !data?.meeting?.id) return
      try {
        const result = await loadMeetingOpsState(data.meeting.id)
        if (!ignore) setMeetingOps(result.data)
      } catch {
        if (!ignore) setMeetingOps({ attendance: [], roles: [] })
      }
    }
    hydrateMeetingOps()
    return () => { ignore = true }
  }, [authReady, user, publicView, data?.meeting?.id])

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

  async function persistPeople(next) {
    setSyncStatus(t.syncing)
    try {
      await savePeopleState(next)
      setSyncStatus(t.peopleSaved)
    } catch {
      setSyncStatus(t.saveFailed)
    }
  }

  async function persistMeetingOps(next) {
    setSyncStatus(t.syncing)
    try {
      await saveMeetingOpsState(next)
      setSyncStatus(t.meetingSaved)
    } catch {
      setSyncStatus(t.saveFailed)
    }
  }

  async function persistSettings(next) {
    setSyncStatus(t.syncing)
    try {
      await saveSystemSettings(next)
      setSyncStatus(t.systemSaved)
    } catch {
      setSyncStatus(t.saveFailed)
    }
  }

  async function handleLogout() {
    await signOutUser()
    setUser(null)
    setData(null)
  }

  const nav = useMemo(() => [
    ['system', t.navSystem],
    ['meeting', t.navMeeting],
    ['people', t.navPeople],
    ['admin', t.navAdmin],
    ['vote', t.navVote],
    ['share', t.navShare],
    ['results', t.navResults],
    ['history', t.navHistory],
  ], [t])

  const masterNav = useMemo(() => [
    ['master', t.navMaster],
  ], [t])

  if (!authReady) {
    return <div className="tm-success-card"><h2>{appText.syncing}</h2></div>
  }

  if (!publicView && isCloudConfigured && !user) {
    return <LoginView lang={lang} setLang={changeLang} t={t} onLogin={setUser} />
  }

  if (!data) {
    return (
      <div className={`tm-page ${publicView ? 'public' : ''}`}>
        {!publicView && <aside className="tm-sidebar">
          <div className="tm-brand">TM Vote</div>
          <LanguageToggle lang={lang} setLang={changeLang} t={appText} />
        </aside>}
        <main className="tm-content">
          <div className="tm-success-card"><h2>{appText.syncing}</h2></div>
        </main>
      </div>
    )
  }

  return (
    <div className={`tm-page ${publicView ? 'public' : ''}`}>
      {!publicView && <aside className="tm-sidebar">
        <div className="tm-brand">{appText.clubShort}</div>
        <LanguageToggle lang={lang} setLang={changeLang} t={appText} />
        {isCloudConfigured && <button onClick={handleLogout}>{appText.logout}</button>}
        {nav.map(([key, label]) => (
          <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>{label}</button>
        ))}
        <div className="tm-sidebar-bottom">
          {masterNav.map(([key, label]) => (
            <button key={key} className={view === key ? 'active' : ''} onClick={() => setView(key)}>{label}</button>
          ))}
        </div>
      </aside>}
      <main className="tm-content">
        {view === 'system' && <SystemSettingsView settings={settings} setSettings={setSettings} persistSettings={persistSettings} syncStatus={syncStatus} t={appText} />}
        {view === 'master' && <MasterAdminView settings={settings} t={appText} />}
        {view === 'admin' && <AdminView data={data} setData={setData} setView={setView} persistState={persistState} source={source} syncStatus={syncStatus} t={appText} people={people} meetingOps={meetingOps} />}
        {view === 'people' && <PeopleView people={people} setPeople={setPeople} persistPeople={persistPeople} syncStatus={syncStatus} t={appText} />}
        {view === 'meeting' && <MeetingView data={data} setData={setData} persistState={persistState} people={people} meetingOps={meetingOps} setMeetingOps={setMeetingOps} persistMeetingOps={persistMeetingOps} syncStatus={syncStatus} t={appText} settings={settings} />}
        {view === 'vote' && <VoteView data={data} setData={setData} setView={setView} t={appText} />}
        {view === 'success' && <div className="tm-success-card"><h1>{appText.thankVote}</h1><p>{appText.recorded}</p></div>}
        {view === 'share' && <SharePoster data={data} t={appText} />}
        {view === 'results' && <ResultsView data={data} t={appText} />}
        {view === 'history' && <HistoryView data={data} t={appText} />}
      </main>
    </div>
  )
}
