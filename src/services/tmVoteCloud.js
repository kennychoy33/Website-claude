import { createClient } from '@supabase/supabase-js'

export const TM_VOTE_STORAGE_KEY = 'toastmasters-vote-demo-v5'
export const TM_VOTE_MEETING_ID = '627'
const TM_WORKSPACE_STORAGE_KEY = `${TM_VOTE_STORAGE_KEY}-workspace-id`
const TM_CLOUD_CONFIG_STORAGE_KEY = `${TM_VOTE_STORAGE_KEY}-cloud-config`
const TM_ACTIVE_CLUB_STORAGE_KEY = `${TM_VOTE_STORAGE_KEY}-active-club`
const DEFAULT_SUPABASE_URL = 'https://tjojeuqvbmejnnauibkg.supabase.co'
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_Js5Iky2j-g31KZsCjeb30g_LIdWOKP8'
let activeClubId = localStorage.getItem(TM_ACTIVE_CLUB_STORAGE_KEY) || 'default'

export function setActiveClubId(clubId = 'default') {
  activeClubId = clubId || 'default'
  localStorage.setItem(TM_ACTIVE_CLUB_STORAGE_KEY, activeClubId)
}

export function getActiveClubId() {
  return activeClubId || 'default'
}

function getActiveClubRowId() {
  return getActiveClubId() || 'default'
}

function clubKey(key) {
  return `${key}-club-${getActiveClubId()}`
}

function getClubStorageItem(key) {
  return localStorage.getItem(clubKey(key)) || (getActiveClubId() === 'default' ? localStorage.getItem(key) : null)
}

function getManagedClubMeta(clubId = getActiveClubId()) {
  try {
    const clubs = JSON.parse(localStorage.getItem('tm-master-clubs') || '[]')
    return clubs.find(club => club.id === clubId) || null
  } catch {
    return null
  }
}

const envCloudConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
}

function normalizeSupabaseUrl(value = '') {
  const raw = String(value || '').trim()
  if (!raw) return ''
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    return `${url.protocol}//${url.host}`
  } catch {
    return raw
      .replace(/\/rest\/v1\/?$/i, '')
      .replace(/\/auth\/v1\/?$/i, '')
      .replace(/\/+$/g, '')
  }
}

function normalizeCloudConfig(config = {}) {
  return {
    url: normalizeSupabaseUrl(config.url),
    anonKey: String(config.anonKey || '').trim(),
  }
}

function decodeCloudConfig(value = '') {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
    const parsed = JSON.parse(json)
    return normalizeCloudConfig({
      url: parsed.url || '',
      anonKey: parsed.anonKey || '',
    })
  } catch {
    return { url: '', anonKey: '' }
  }
}

function encodeCloudConfig(config) {
  const normalized = normalizeCloudConfig(config)
  const json = JSON.stringify({ url: normalized.url || '', anonKey: normalized.anonKey || '' })
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function getUrlCloudConfig() {
  const params = new URLSearchParams(window.location.search)
  return decodeCloudConfig(params.get('cfg') || '')
}

export function loadRuntimeCloudConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(TM_CLOUD_CONFIG_STORAGE_KEY) || '{}')
    return normalizeCloudConfig({
      url: saved.url || '',
      anonKey: saved.anonKey || '',
    })
  } catch {
    return { url: '', anonKey: '' }
  }
}

export function saveRuntimeCloudConfig(config) {
  localStorage.setItem(TM_CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(normalizeCloudConfig(config)))
}

export function clearRuntimeCloudConfig() {
  localStorage.removeItem(TM_CLOUD_CONFIG_STORAGE_KEY)
}

function getActiveCloudConfig() {
  const urlConfig = getUrlCloudConfig()
  if (urlConfig.url && urlConfig.anonKey) return urlConfig
  const runtimeConfig = loadRuntimeCloudConfig()
  if (runtimeConfig.url && runtimeConfig.anonKey) return runtimeConfig
  return normalizeCloudConfig(envCloudConfig)
}

const activeCloudConfig = getActiveCloudConfig()

export const isCloudConfigured = Boolean(activeCloudConfig.url && activeCloudConfig.anonKey)

const supabase = isCloudConfigured ? createClient(activeCloudConfig.url, activeCloudConfig.anonKey) : null
const publicSupabase = isCloudConfigured
  ? createClient(activeCloudConfig.url, activeCloudConfig.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `${TM_VOTE_STORAGE_KEY}-public-client`,
    },
  })
  : null

export async function getCurrentUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  if (data.user?.id) rememberWorkspaceId(data.user.id)
  return data.user
}

export function onAuthChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user?.id) rememberWorkspaceId(session.user.id)
    callback(session?.user || null)
  })
  return () => data.subscription.unsubscribe()
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (data.user?.id) rememberWorkspaceId(data.user.id)
  return data.user
}

export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  if (data.user?.id) rememberWorkspaceId(data.user.id)
  return data.user
}

export function rememberWorkspaceId(spaceId) {
  if (spaceId) localStorage.setItem(TM_WORKSPACE_STORAGE_KEY, spaceId)
}

export function getRememberedWorkspaceId() {
  return localStorage.getItem(TM_WORKSPACE_STORAGE_KEY) || ''
}

export function getLocalWorkspaceId() {
  const saved = getRememberedWorkspaceId()
  if (saved) return saved
  const id = `local-${crypto.randomUUID()}`
  rememberWorkspaceId(id)
  return id
}

export async function signOutUser() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function getPublicVoteUrl(spaceId = '', clubId = getActiveClubId(), meetingId = '') {
  const basePath = import.meta.env.BASE_URL || '/'
  const url = new URL(`${basePath.replace(/\/$/, '')}/tm-vote`, window.location.origin)
  const activeSpace = spaceId || getRememberedWorkspaceId() || getLocalWorkspaceId()
  url.searchParams.set('view', 'vote')
  url.searchParams.set('space', activeSpace)
  url.searchParams.set('club', clubId || 'default')
  if (meetingId) url.searchParams.set('meeting', meetingId)
  if (!envCloudConfig.url && !envCloudConfig.anonKey && activeCloudConfig.url && activeCloudConfig.anonKey) {
    url.searchParams.set('cfg', encodeCloudConfig(activeCloudConfig))
  }
  return url.toString()
}

export function getPublicTimerUrl(spaceId = '', clubId = getActiveClubId(), meetingId = '') {
  const url = new URL(getPublicVoteUrl(spaceId, clubId, meetingId))
  url.searchParams.set('view', 'timer')
  return url.toString()
}

function getMeetingId(spaceId = '', clubId = getActiveClubId()) {
  const clubPart = clubId && clubId !== 'default' ? `-${clubId}` : ''
  return spaceId ? `${spaceId}${clubPart}-${TM_VOTE_MEETING_ID}` : `${TM_VOTE_MEETING_ID}${clubPart}`
}

function getSpaceIdFromMeetingId(meetingId = '') {
  const clubId = getActiveClubId()
  const suffix = clubId && clubId !== 'default' ? `-${clubId}-${TM_VOTE_MEETING_ID}` : `-${TM_VOTE_MEETING_ID}`
  return meetingId.endsWith(suffix) ? meetingId.slice(0, -suffix.length) : ''
}

export const seedState = {
  meeting: {
    id: TM_VOTE_MEETING_ID,
    number: '第627次',
    date: '16/07/2026',
    theme: '走出舒适圈',
    word: '拥抱改变',
    closeTime: '9:15 PM',
    status: 'open',
    link: getPublicVoteUrl(),
  },
  prepared: [
    { id: 'p1', name: '郑彩云', title: '科技救世主', project: '评估与反馈 L5', votes: 0 },
    { id: 'p2', name: '徐子淳', title: '如何用 AI 赚钱', project: '说服型演说 L5', votes: 0 },
  ],
  impromptu: [
    { id: 'i1', name: '李函袀', votes: 0 },
    { id: 'i2', name: '王凤', votes: 0 },
    { id: 'i3', name: '洪碧娇', votes: 0 },
    { id: 'i4', name: '叶雪娥', votes: 0 },
  ],
  evaluator: [
    { id: 'e1', name: '胡惠钦', votes: 0 },
    { id: 'e2', name: '叶雪娥', votes: 0 },
  ],
  history: [
    { meeting: '第626次', date: '04/07/2026', preparedWinner: '', preparedVotes: 0, impromptuWinner: '', impromptuVotes: 0, evaluatorWinner: '', evaluatorVotes: 0 },
  ],
}

export const seedPeopleState = {
  members: [
    { id: 'm1', name: '杨锦婷', englishName: '', email: '', phone: '', pathway: '', level: '', status: 'active', joinedDate: '' },
    { id: 'm2', name: '徐子淳', englishName: '', email: '', phone: '', pathway: 'Persuasive Influence', level: 'L5', status: 'active', joinedDate: '' },
    { id: 'm3', name: '李函袀', englishName: '', email: '', phone: '', pathway: '', level: '', status: 'active', joinedDate: '' },
    { id: 'm4', name: '胡惠钦', englishName: '', email: '', phone: '', pathway: '', level: '', status: 'active', joinedDate: '' },
    { id: 'm5', name: '王凤', englishName: '', email: '', phone: '', pathway: '', level: '', status: 'active', joinedDate: '' },
    { id: 'm6', name: '郑彩云', englishName: '', email: '', phone: '', pathway: 'Presentation Mastery', level: 'L5', status: 'active', joinedDate: '' },
    { id: 'm7', name: '吴膺翔', englishName: '', email: '', phone: '', pathway: '', level: '', status: 'active', joinedDate: '' },
    { id: 'm8', name: '刘宇彤', englishName: '', email: '', phone: '', pathway: '', level: '', status: 'active', joinedDate: '' },
    { id: 'm9', name: '吕良兴', englishName: '', email: '', phone: '', pathway: '', level: '', status: 'active', joinedDate: '' },
  ],
  guests: [
    { id: 'g1', name: '刘书宁', email: '', phone: '', introducedBy: '', visitDate: '', notes: '✅ RM30' },
    { id: 'g2', name: '陈秀丽', email: '', phone: '', introducedBy: '', visitDate: '', notes: 'JB TMC 会长；✅ RM60' },
    { id: 'g3', name: '陈丽明', email: '', phone: '', introducedBy: '', visitDate: '', notes: '新山讲演会卸任会长；✅ RM60' },
    { id: 'g4', name: '栯璇', email: '', phone: '', introducedBy: '', visitDate: '', notes: '金山园会长；3人；✅ RM180' },
    { id: 'g5', name: '曾芳玲', email: '', phone: '', introducedBy: '', visitDate: '', notes: '✅ RM60' },
    { id: 'g6', name: '莊陸', email: '', phone: '', introducedBy: '', visitDate: '', notes: '+1；✅ RM1000' },
    { id: 'g7', name: '汪志雄', email: '', phone: '', introducedBy: '', visitDate: '', notes: '✅ RM60' },
    { id: 'g8', name: '罗永康', email: '', phone: '', introducedBy: '', visitDate: '', notes: 'RM60' },
    { id: 'g9', name: '许美玉', email: '', phone: '', introducedBy: '', visitDate: '', notes: '✅ RM60' },
    { id: 'g10', name: '雪娥', email: '', phone: '', introducedBy: '', visitDate: '', notes: '+1；✅ RM90' },
    { id: 'g11', name: '陈文杰', email: '', phone: '', introducedBy: '', visitDate: '', notes: '+9；RM600' },
    { id: 'g12', name: '超杰', email: '', phone: '', introducedBy: '', visitDate: '', notes: 'RM60' },
    { id: 'g13', name: '芃钧/佳', email: '', phone: '', introducedBy: '', visitDate: '', notes: '' },
  ],
}

export const seedMeetingOpsState = {
  attendance: [],
  roles: [
    { id: 'r1', roleName: 'Sergeant at Arms', time: '3', personType: 'member', personId: '' },
    { id: 'r2', roleName: 'President Opening', time: '5', personType: 'member', personId: '' },
    { id: 'r3', roleName: 'Toastmaster of the Evening', time: '5', personType: 'member', personId: '' },
    { id: 'r4', roleName: 'Timer', time: '3', personType: 'member', personId: '' },
    { id: 'r5', roleName: 'Ah Counter', time: '3', personType: 'member', personId: '' },
    { id: 'r6', roleName: 'Grammarian', time: '5', personType: 'member', personId: '' },
    { id: 'r7', roleName: 'Table Topics Master', time: '20', personType: 'member', personId: '' },
    { id: 'r8', roleName: 'General Evaluator', time: '10', personType: 'member', personId: '' },
  ],
}

export const seedSystemSettings = {
  clubName: '柔南区麻坡中华校友会讲演会',
  clubShort: '中华讲演会',
  toastmasterId: '',
  adminName: '',
  username: '',
  logoDataUrl: '',
  agendaTemplateName: '',
  agendaTemplateDataUrl: '',
  agendaRoleTemplate: [
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
  ],
  clubAdmins: [
    { id: 'a1', toastmasterId: '', email: '', username: '', password: '', name: '' },
  ],
}

function getBlankVoteState() {
  return {
    meeting: {
      id: getMeetingId(),
      number: '',
      date: '',
      theme: '',
      word: '',
      closeTime: '',
      status: 'draft',
      link: getPublicVoteUrl(),
    },
    prepared: [],
    impromptu: [],
    evaluator: [],
    history: [],
  }
}

function getBlankPeopleState() {
  return { members: [], guests: [] }
}

function getBlankSystemSettings() {
  const club = getManagedClubMeta()
  return {
    ...seedSystemSettings,
    clubName: club?.clubName || '',
    clubShort: club?.clubShort || club?.clubName || '',
    toastmasterId: club?.toastmasterId || '',
    adminName: club?.adminName || '',
    username: club?.username || '',
    logoDataUrl: '',
    agendaTemplateName: '',
    agendaTemplateDataUrl: '',
    clubAdmins: [],
  }
}

function getDefaultVoteState() {
  return getActiveClubId() === 'default' ? seedState : getBlankVoteState()
}

function getDefaultPeopleState() {
  return getActiveClubId() === 'default' ? seedPeopleState : getBlankPeopleState()
}

function getDefaultSystemSettings() {
  return getActiveClubId() === 'default' ? seedSystemSettings : getBlankSystemSettings()
}

export function loadLocalState() {
  try {
    const saved = getClubStorageItem(TM_VOTE_STORAGE_KEY)
    const state = saved ? JSON.parse(saved) : getDefaultVoteState()
    return {
      ...state,
      meeting: { ...state.meeting, link: getPublicVoteUrl() },
    }
  } catch {
    const fallback = getDefaultVoteState()
    return {
      ...fallback,
      meeting: { ...fallback.meeting, link: getPublicVoteUrl() },
    }
  }
}

export function saveLocalState(next) {
  localStorage.setItem(clubKey(TM_VOTE_STORAGE_KEY), JSON.stringify({
    ...next,
    meeting: { ...next.meeting, link: getPublicVoteUrl() },
  }))
}

export function loadLocalPeople() {
  try {
    const saved = getClubStorageItem(`${TM_VOTE_STORAGE_KEY}-people`)
    return saved ? JSON.parse(saved) : getDefaultPeopleState()
  } catch {
    return getDefaultPeopleState()
  }
}

export function saveLocalPeople(next) {
  localStorage.setItem(clubKey(`${TM_VOTE_STORAGE_KEY}-people`), JSON.stringify(next))
}

export function loadLocalMeetingOps() {
  try {
    const saved = getClubStorageItem(`${TM_VOTE_STORAGE_KEY}-meeting-ops`)
    return saved ? JSON.parse(saved) : seedMeetingOpsState
  } catch {
    return seedMeetingOpsState
  }
}

export function saveLocalMeetingOps(next) {
  localStorage.setItem(clubKey(`${TM_VOTE_STORAGE_KEY}-meeting-ops`), JSON.stringify(next))
}

export function loadLocalSystemSettings() {
  try {
    const saved = getClubStorageItem(`${TM_VOTE_STORAGE_KEY}-system-settings`)
    return saved ? { ...getDefaultSystemSettings(), ...JSON.parse(saved) } : getDefaultSystemSettings()
  } catch {
    return getDefaultSystemSettings()
  }
}

export function saveLocalSystemSettings(next) {
  localStorage.setItem(clubKey(`${TM_VOTE_STORAGE_KEY}-system-settings`), JSON.stringify(next))
}

export async function loadSystemSettings(spaceId = '') {
  if (!isCloudConfigured) {
    return { data: loadLocalSystemSettings(), source: 'local' }
  }

  const user = await getCurrentUser()
  if (!user && !spaceId) {
    return { data: loadLocalSystemSettings(), source: 'local' }
  }

  const ownerId = spaceId || user.id
  const clubId = getActiveClubRowId()

  let { data, error } = await supabase
    .from('tm_club_settings')
    .select('owner_id, club_name, club_short, toastmaster_id, admin_name, username, logo_data_url, agenda_template_name, agenda_template_data_url, agenda_role_template')
    .eq('owner_id', ownerId)
    .eq('club_id', clubId)
    .maybeSingle()

  if (error) {
    const result = await supabase
      .from('tm_club_settings')
      .select('owner_id, club_name, club_short, toastmaster_id, admin_name, username')
      .eq('owner_id', ownerId)
      .eq('club_id', clubId)
      .maybeSingle()
    data = result.data
    error = result.error
  }

  if (error) throw error
  if (!data) return { data: getDefaultSystemSettings(), source: 'cloud' }

  let clubAdmins = seedSystemSettings.clubAdmins
  if (user && !spaceId) {
    const { data: admins, error: adminsError } = await supabase
      .from('tm_club_admins')
      .select('*')
      .eq('owner_id', user.id)
      .eq('club_id', clubId)
      .order('created_at', { ascending: true })

    if (!adminsError) {
      clubAdmins = admins.length ? admins.map(fromClubAdminRow) : seedSystemSettings.clubAdmins
    }
  }

  return { data: { ...fromSystemSettingsRow(data), clubAdmins }, source: 'cloud' }
}

export async function saveSystemSettings(settings) {
  saveLocalSystemSettings(settings)

  if (!isCloudConfigured) {
    return { source: 'local' }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { source: 'local' }
  }

  const { error } = await supabase
    .from('tm_club_settings')
    .upsert(toSystemSettingsRow(settings, user.id), { onConflict: 'owner_id,club_id' })

  if (error) {
    const { error: minimalError } = await supabase
      .from('tm_club_settings')
      .upsert({
        owner_id: user.id,
        club_id: getActiveClubRowId(),
        club_name: settings.clubName,
        club_short: settings.clubShort,
        toastmaster_id: settings.toastmasterId,
        admin_name: settings.adminName,
        username: settings.username,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'owner_id,club_id' })

    if (minimalError) throw minimalError
    return { source: 'cloud' }
  }

  const { error: deleteAdminsError } = await supabase
    .from('tm_club_admins')
    .delete()
    .eq('owner_id', user.id)
    .eq('club_id', getActiveClubRowId())

  if (deleteAdminsError) return { source: 'cloud' }

  const adminRows = (settings.clubAdmins || []).map(item => toClubAdminRow(item, user.id))
  if (adminRows.length) {
    const { error: insertAdminsError } = await supabase
      .from('tm_club_admins')
      .insert(adminRows)

    if (insertAdminsError) return { source: 'cloud' }
  }

  return { source: 'cloud' }
}

export async function loadPeopleState(spaceId = '', clubId = getActiveClubId()) {
  if (!isCloudConfigured) {
    return { data: loadLocalPeople(), source: 'local' }
  }

  const user = await getCurrentUser()
  const activeOwner = spaceId || user?.id
  if (!activeOwner) {
    return { data: loadLocalPeople(), source: 'local' }
  }
  const readClient = spaceId && !user ? (publicSupabase || supabase) : supabase
  const activeClub = clubId || getActiveClubRowId()

  const [{ data: members, error: memberError }, { data: guests, error: guestError }] = await Promise.all([
    readClient
      .from('tm_members')
      .select('*')
      .eq('owner_id', activeOwner)
      .eq('club_id', activeClub)
      .order('name', { ascending: true }),
    readClient
      .from('tm_guests')
      .select('*')
      .eq('owner_id', activeOwner)
      .eq('club_id', activeClub)
      .order('visit_date', { ascending: false }),
  ])

  if (isMissingSchemaError(memberError) || isMissingSchemaError(guestError)) {
    return {
      data: loadLocalPeople(),
      source: 'local',
      warning: '云端数据库还没完成完整迁移，当前先使用本机暂存。请在 Supabase 执行 supabase/tm-vote-full-cloud-migration.sql。',
    }
  }

  if (memberError) throw memberError
  if (guestError) throw guestError

  return {
    data: {
      members: members.map(fromMemberRow),
      guests: guests.map(fromGuestRow),
    },
    source: 'cloud',
  }
}

export async function savePeopleState(state) {
  if (!isCloudConfigured) {
    saveLocalPeople(state)
    return { source: 'local' }
  }

  const user = await getCurrentUser()
  if (!user) {
    saveLocalPeople(state)
    return { source: 'local' }
  }

  const memberRows = state.members.filter(item => item.name?.trim()).map(item => toMemberRow(item, user.id))
  const guestRows = state.guests.filter(item => item.name?.trim()).map(item => toGuestRow(item, user.id))
  const { error: memberDeleteError } = await supabase
    .from('tm_members')
    .delete()
    .eq('owner_id', user.id)
    .eq('club_id', getActiveClubRowId())

  if (isMissingSchemaError(memberDeleteError)) {
    saveLocalPeople(state)
    return {
      source: 'local',
      warning: '云端数据库还没完成完整迁移，已先保存到本机。请在 Supabase 执行 supabase/tm-vote-full-cloud-migration.sql。',
    }
  }
  if (memberDeleteError) throw memberDeleteError

  if (memberRows.length) {
    const { error: memberInsertError } = await supabase
      .from('tm_members')
      .insert(memberRows)

    if (isMissingSchemaError(memberInsertError)) {
      saveLocalPeople(state)
      return {
        source: 'local',
        warning: '云端数据库还没完成完整迁移，已先保存到本机。请在 Supabase 执行 supabase/tm-vote-full-cloud-migration.sql。',
      }
    }
    if (memberInsertError) throw memberInsertError
  }

  const { error: guestDeleteError } = await supabase
    .from('tm_guests')
    .delete()
    .eq('owner_id', user.id)
    .eq('club_id', getActiveClubRowId())

  if (isMissingSchemaError(guestDeleteError)) {
    saveLocalPeople(state)
    return {
      source: 'local',
      warning: '云端数据库还没完成完整迁移，已先保存到本机。请在 Supabase 执行 supabase/tm-vote-full-cloud-migration.sql。',
    }
  }
  if (guestDeleteError) throw guestDeleteError

  if (guestRows.length) {
    const { error: guestInsertError } = await supabase
      .from('tm_guests')
      .insert(guestRows)

    if (isMissingSchemaError(guestInsertError)) {
      saveLocalPeople(state)
      return {
        source: 'local',
        warning: '云端数据库还没完成完整迁移，已先保存到本机。请在 Supabase 执行 supabase/tm-vote-full-cloud-migration.sql。',
      }
    }
    if (guestInsertError) throw guestInsertError
  }

  return { source: 'cloud' }
}

export async function loadMeetingOpsState(meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  if (!isCloudConfigured) {
    return { data: loadLocalMeetingOps(), source: 'local' }
  }

  const user = await getCurrentUser()
  const activeOwner = spaceId || user?.id
  if (!activeOwner) {
    return { data: loadLocalMeetingOps(), source: 'local' }
  }

  const activeMeetingId = meetingId || getMeetingId(activeOwner, clubId)
  const readClient = spaceId && !user ? (publicSupabase || supabase) : supabase
  if (spaceId && !user) {
    const { data: roles, error: rolesError } = await readClient
      .from('tm_meeting_roles')
      .select('*')
      .eq('owner_id', activeOwner)
      .eq('meeting_id', activeMeetingId)
      .order('created_at', { ascending: true })
    if (rolesError) throw rolesError
    return {
      data: {
        attendance: [],
        roles: roles.length ? roles.map(fromRoleRow) : seedMeetingOpsState.roles,
      },
      source: 'cloud',
    }
  }

  const [{ data: attendance, error: attendanceError }, { data: roles, error: rolesError }] = await Promise.all([
    readClient
      .from('tm_meeting_attendance')
      .select('*')
      .eq('owner_id', activeOwner)
      .eq('meeting_id', activeMeetingId),
    readClient
      .from('tm_meeting_roles')
      .select('*')
      .eq('owner_id', activeOwner)
      .eq('meeting_id', activeMeetingId)
      .order('created_at', { ascending: true }),
  ])

  if (attendanceError) throw attendanceError
  if (rolesError) throw rolesError

  return {
    data: {
      attendance: attendance.map(fromAttendanceRow),
      roles: roles.length ? roles.map(fromRoleRow) : seedMeetingOpsState.roles,
    },
    source: 'cloud',
  }
}

export async function saveMeetingOpsState(state, meetingId = '') {
  if (!isCloudConfigured) {
    saveLocalMeetingOps(state)
    return { source: 'local' }
  }

  const user = await getCurrentUser()
  if (!user) {
    saveLocalMeetingOps(state)
    return { source: 'local' }
  }

  const activeMeetingId = normalizeMeetingIdForOwner(meetingId, user.id)
  const attendanceRows = state.attendance.map(item => toAttendanceRow(item, user.id, activeMeetingId))
  const roleRows = state.roles.map(item => toRoleRow(item, user.id, activeMeetingId))

  await ensureMeetingRowForOps(activeMeetingId, user.id)

  const { error: attendanceDeleteError } = await supabase
    .from('tm_meeting_attendance')
    .delete()
    .eq('owner_id', user.id)
    .eq('meeting_id', activeMeetingId)

  if (attendanceDeleteError) throw attendanceDeleteError

  if (attendanceRows.length) {
    const { error: attendanceInsertError } = await supabase
      .from('tm_meeting_attendance')
      .insert(attendanceRows)

    if (attendanceInsertError) throw attendanceInsertError
  }

  const { error: rolesDeleteError } = await supabase
    .from('tm_meeting_roles')
    .delete()
    .eq('owner_id', user.id)
    .eq('meeting_id', activeMeetingId)

  if (rolesDeleteError) throw rolesDeleteError

  if (roleRows.length) {
    const { error: rolesInsertError } = await supabase
      .from('tm_meeting_roles')
      .insert(roleRows)

    if (rolesInsertError) throw rolesInsertError
  }

  return { source: 'cloud' }
}

function localTimerKey(meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  return `${TM_VOTE_STORAGE_KEY}-timer-records-${spaceId || 'local'}-${clubId || 'default'}-${meetingId || 'current'}`
}

function loadLocalTimerRecords(meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  try {
    return JSON.parse(localStorage.getItem(localTimerKey(meetingId, spaceId, clubId)) || '[]')
  } catch {
    return []
  }
}

function saveLocalTimerRecords(meetingId = '', records = [], spaceId = '', clubId = getActiveClubId()) {
  localStorage.setItem(localTimerKey(meetingId, spaceId, clubId), JSON.stringify(records))
}

function localTimerLiveKey(meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  return `${TM_VOTE_STORAGE_KEY}-timer-live-${spaceId || 'local'}-${clubId || 'default'}-${meetingId || 'current'}`
}

function loadLocalTimerLiveState(meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  try {
    return JSON.parse(localStorage.getItem(localTimerLiveKey(meetingId, spaceId, clubId)) || 'null')
  } catch {
    return null
  }
}

function saveLocalTimerLiveState(state = {}, meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  localStorage.setItem(localTimerLiveKey(meetingId, spaceId, clubId), JSON.stringify(state))
}

export async function loadTimerRecordsState(meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  if (!isCloudConfigured) {
    return { data: loadLocalTimerRecords(meetingId, spaceId, clubId), source: 'local' }
  }

  const user = await getCurrentUser()
  const activeOwner = spaceId || user?.id
  if (!activeOwner || !meetingId) {
    return { data: loadLocalTimerRecords(meetingId, spaceId, clubId), source: 'local' }
  }

  const readClient = spaceId && !user ? (publicSupabase || supabase) : supabase
  const { data, error } = await readClient
    .from('tm_timer_records')
    .select('*')
    .eq('owner_id', activeOwner)
    .eq('club_id', clubId || 'default')
    .eq('meeting_id', meetingId)
    .neq('item_type', 'live-state')
    .order('created_at', { ascending: false })

  if (isMissingSchemaError(error)) {
    return { data: loadLocalTimerRecords(meetingId, spaceId, clubId), source: 'local' }
  }
  if (error) throw error

  return { data: (data || []).map(fromTimerRecordRow), source: 'cloud' }
}

export async function loadTimerLiveState(meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  if (!isCloudConfigured) {
    return { data: loadLocalTimerLiveState(meetingId, spaceId, clubId), source: 'local' }
  }

  const user = await getCurrentUser()
  const activeOwner = spaceId || user?.id
  if (!activeOwner || !meetingId) {
    return { data: loadLocalTimerLiveState(meetingId, spaceId, clubId), source: 'local' }
  }

  const readClient = spaceId && !user ? (publicSupabase || supabase) : supabase
  const { data, error } = await readClient
    .from('tm_timer_records')
    .select('*')
    .eq('owner_id', activeOwner)
    .eq('club_id', clubId || 'default')
    .eq('meeting_id', meetingId)
    .eq('item_type', 'live-state')
    .order('created_at', { ascending: false })
    .limit(1)

  if (isMissingSchemaError(error)) {
    return { data: loadLocalTimerLiveState(meetingId, spaceId, clubId), source: 'local' }
  }
  if (error) throw error

  const row = data?.[0]
  if (!row) return { data: loadLocalTimerLiveState(meetingId, spaceId, clubId), source: 'cloud' }
  return {
    data: {
      activeId: row.item_id || '',
      baseElapsed: row.elapsed_seconds || 0,
      startedAt: row.started_at || '',
      status: row.light || 'idle',
      updatedAt: row.ended_at || row.created_at || '',
    },
    source: 'cloud',
  }
}

export async function saveTimerLiveState(state = {}, meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  const nextLocal = {
    activeId: state.activeId || '',
    baseElapsed: Math.round(state.baseElapsed || 0),
    startedAt: state.startedAt || '',
    status: state.status || 'idle',
    updatedAt: new Date().toISOString(),
  }
  saveLocalTimerLiveState(nextLocal, meetingId, spaceId, clubId)

  if (!isCloudConfigured) {
    return { data: nextLocal, source: 'local' }
  }

  const user = await getCurrentUser()
  const activeOwner = spaceId || user?.id
  if (!activeOwner || !meetingId) {
    return { data: nextLocal, source: 'local' }
  }

  const writeClient = spaceId && !user ? (publicSupabase || supabase) : supabase
  const liveRecord = {
    id: `live-${activeOwner}-${clubId || 'default'}-${meetingId}-${Date.now()}`,
    itemId: nextLocal.activeId,
    itemType: 'live-state',
    summary: 'Timer live state',
    person: '',
    duration: '',
    elapsed: nextLocal.baseElapsed,
    light: nextLocal.status,
    lightLabel: nextLocal.status,
    startedAt: nextLocal.startedAt || null,
    endedAt: nextLocal.updatedAt,
  }
  const { error } = await writeClient
    .from('tm_timer_records')
    .insert(toTimerRecordRow(liveRecord, activeOwner, meetingId, clubId || 'default'))

  if (isMissingSchemaError(error) || isRowLevelSecurityError(error)) {
    return { data: nextLocal, source: 'local' }
  }
  if (error) throw error

  return { data: nextLocal, source: 'cloud' }
}

export async function saveTimerRecordState(record, meetingId = '', spaceId = '', clubId = getActiveClubId()) {
  const nextLocal = [record, ...loadLocalTimerRecords(meetingId, spaceId, clubId).filter(item => item.id !== record.id)].slice(0, 120)
  saveLocalTimerRecords(meetingId, nextLocal, spaceId, clubId)

  if (!isCloudConfigured) {
    return { data: nextLocal, source: 'local' }
  }

  const user = await getCurrentUser()
  const activeOwner = spaceId || user?.id
  if (!activeOwner || !meetingId) {
    return { data: nextLocal, source: 'local' }
  }

  const writeClient = spaceId && !user ? (publicSupabase || supabase) : supabase
  const { error } = await writeClient
    .from('tm_timer_records')
    .insert(toTimerRecordRow(record, activeOwner, meetingId, clubId || 'default'))

  if (isMissingSchemaError(error) || isRowLevelSecurityError(error)) {
    return { data: nextLocal, source: 'local' }
  }
  if (error) throw error

  const refreshed = await loadTimerRecordsState(meetingId, spaceId, clubId)
  return refreshed
}

function normalizeMeetingIdForOwner(meetingId, ownerId) {
  const rawId = `${meetingId || ''}`
  if (!rawId) return getMeetingId(ownerId)
  if (rawId.startsWith(`${ownerId}-`)) return rawId
  if (rawId === TM_VOTE_MEETING_ID) return getMeetingId(ownerId)
  return rawId
}

async function ensureMeetingRowForOps(meetingId, ownerId) {
  const { data, error } = await supabase
    .from('tm_meetings')
    .select('id')
    .eq('id', meetingId)
    .maybeSingle()

  if (error) throw error
  if (data) return

  await upsertMeetingWithSchemaFallback({
    id: meetingId,
    owner_id: ownerId,
    club_id: getActiveClubRowId(),
    meeting_number: '',
    meeting_date: '',
    theme: '',
    word_of_day: '',
    close_time: '',
    status: 'draft',
    public_link: getPublicVoteUrl(ownerId, getActiveClubId()),
  })
}

export async function loadVoteState(spaceId = '', clubId = getActiveClubId(), explicitMeetingId = '') {
  if (!isCloudConfigured) {
    return { data: loadLocalState(), source: 'local' }
  }

  const user = await getCurrentUser()
  const activeSpace = spaceId || user?.id
  if (!activeSpace) {
    return { data: loadLocalState(), source: 'local' }
  }
  const urlMeetingId = new URLSearchParams(window.location.search).get('meeting') || ''
  let meetingId = explicitMeetingId || urlMeetingId || getMeetingId(activeSpace, clubId)
  if (!explicitMeetingId && !urlMeetingId && user && !spaceId) {
    const { data: latestMeeting, error: latestMeetingError } = await supabase
      .from('tm_meetings')
      .select('id')
      .eq('owner_id', user.id)
      .eq('club_id', clubId || 'default')
      .order('meeting_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!latestMeetingError && latestMeeting?.id) meetingId = latestMeeting.id
  }

  const readClient = publicSupabase || supabase
  const { data: meeting, error: meetingError } = await readClient
    .from('tm_meetings')
    .select('*')
    .eq('id', meetingId)
    .maybeSingle()

  if (meetingError) throw meetingError

  if (!meeting) {
    if (spaceId) {
      const blankState = getBlankVoteState()
      return {
        data: {
          ...blankState,
          meeting: {
            ...blankState.meeting,
            id: meetingId,
            number: '',
            theme: '',
            status: 'draft',
            link: getPublicVoteUrl(activeSpace, clubId, meetingId),
          },
          prepared: [],
          impromptu: [],
          evaluator: [],
        },
        source: 'cloud',
      }
    }
    if (!user) return { data: loadLocalState(), source: 'local' }
    return { data: getDefaultVoteState(), source: 'cloud' }
  }

  const historyQuery = readClient
    .from('tm_winner_history')
    .select('*')
    .eq('owner_id', activeSpace)
    .eq('club_id', clubId || 'default')
    .order('meeting_date', { ascending: false })
    .limit(20)

  const [{ data: candidates, error: candidateError }, { data: history, error: historyError }] = await Promise.all([
    readClient
      .from('tm_candidates')
      .select('*')
      .eq('meeting_id', meeting.id)
      .order('sort_order', { ascending: true }),
    historyQuery,
  ])

  if (candidateError) throw candidateError
  if (historyError) throw historyError

  return {
    data: {
      meeting: { ...fromMeetingRow(meeting), link: meeting.public_link || getPublicVoteUrl(activeSpace, clubId, meeting.id) },
      prepared: candidates.filter(item => item.category === 'prepared').map(fromCandidateRow),
      impromptu: candidates.filter(item => item.category === 'impromptu').map(fromCandidateRow),
      evaluator: candidates.filter(item => item.category === 'evaluator').map(fromCandidateRow),
      history: history.map(fromHistoryRow),
    },
    source: 'cloud',
  }
}

export async function saveVoteState(state) {
  if (!isCloudConfigured) {
    saveLocalState(state)
    return { data: loadLocalState(), source: 'local' }
  }

  const user = await getCurrentUser()
  if (!user) {
    saveLocalState(state)
    return { data: loadLocalState(), source: 'local' }
  }

  rememberWorkspaceId(user.id)
  const meetingId = normalizeMeetingIdForOwner(state.meeting?.id, user.id)
  const meeting = { ...state.meeting, id: meetingId, link: getPublicVoteUrl(user.id, getActiveClubId(), meetingId) }
  const meetingRow = toMeetingRow(meeting, meetingId, user.id)
  const candidateRows = [
    ...state.prepared.map((item, index) => toCandidateRow(item, meetingId, 'prepared', index)),
    ...state.impromptu.map((item, index) => toCandidateRow(item, meetingId, 'impromptu', index)),
    ...state.evaluator.map((item, index) => toCandidateRow(item, meetingId, 'evaluator', index)),
  ]

  await saveVoteSetupWithSchemaFallback(meetingRow, candidateRows)

  return {
    data: {
      ...state,
      meeting,
      prepared: candidateRows.filter(item => item.category === 'prepared').map(fromCandidateRow),
      impromptu: candidateRows.filter(item => item.category === 'impromptu').map(fromCandidateRow),
      evaluator: candidateRows.filter(item => item.category === 'evaluator').map(fromCandidateRow),
    },
    source: 'cloud',
  }
}

export async function loadMeetingRecordsState() {
  if (!isCloudConfigured) return { data: [], source: 'local' }
  const user = await getCurrentUser()
  if (!user) return { data: [], source: 'local' }

  const { data: meetings, error } = await supabase
    .from('tm_meetings')
    .select('*')
    .eq('owner_id', user.id)
    .eq('club_id', getActiveClubRowId())
    .order('meeting_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  const records = []
  for (const meeting of meetings || []) {
    const stateResult = await loadVoteState('', getActiveClubId(), meeting.id)
    const opsResult = await loadMeetingOpsState(meeting.id)
    records.push({
      id: meeting.id,
      savedAt: meeting.created_at || new Date().toISOString(),
      data: stateResult.data,
      meetingOps: opsResult.data,
    })
  }

  return { data: records, source: 'cloud' }
}

async function saveVoteSetupWithSchemaFallback(meetingRow, candidateRows) {
  const { error: rpcError } = await supabase.rpc('tm_save_vote_setup', {
    p_meeting: meetingRow,
    p_candidates: candidateRows,
  })

  if (!rpcError) return
  if (isMissingFunctionError(rpcError, 'tm_save_vote_setup')) {
    throw new Error('云端数据库还没完成最新迁移，缺少 tm_save_vote_setup。请在 Supabase 执行 supabase/tm-vote-full-cloud-migration.sql 后重新登录。')
  }
  if (isRowLevelSecurityError(rpcError)) {
    throw new Error('Supabase RLS 权限未更新，无法保存投票名单。请在 Supabase 执行 supabase/tm-vote-full-cloud-migration.sql 后重新登录。')
  }
  throw rpcError
}

export async function submitVote(state, preparedId, impromptuId, evaluatorId, voterToken) {
  if (!isCloudConfigured) {
    const next = incrementLocalVotes(state, preparedId, impromptuId, evaluatorId)
    const nextWithHistory = withVoteHistorySnapshot(next)
    saveLocalState(nextWithHistory)
    return { data: nextWithHistory, source: 'local' }
  }

  const meetingId = state.meeting.id || TM_VOTE_MEETING_ID
  const normalizedPreparedId = normalizeCandidateId(preparedId, meetingId)
  const normalizedImpromptuId = normalizeCandidateId(impromptuId, meetingId)
  const normalizedEvaluatorId = normalizeCandidateId(evaluatorId, meetingId)
  const voteClient = publicSupabase || supabase
  const { data, error } = await voteClient.rpc('tm_submit_vote', {
    p_meeting_id: meetingId,
    p_prepared_candidate_id: normalizedPreparedId,
    p_impromptu_candidate_id: normalizedImpromptuId,
    p_evaluator_candidate_id: normalizedEvaluatorId,
    p_voter_token: voterToken,
  })

  if (error) throw error
  if (data?.already_voted) {
    const err = new Error('already_voted')
    err.code = 'already_voted'
    throw err
  }

  return loadVoteState(getSpaceIdFromMeetingId(meetingId))
}

function normalizeCandidateId(candidateId, meetingId) {
  const rawId = `${candidateId || ''}`
  if (!rawId || rawId.startsWith(`${meetingId}-`)) return rawId
  return `${meetingId}-${rawId}`
}

export function getOrCreateVoterToken(meetingNumber) {
  return `${meetingNumber}-${crypto.randomUUID()}`
}

export function hasLocalVote(meetingNumber) {
  return sessionStorage.getItem(`${TM_VOTE_STORAGE_KEY}-voted-${meetingNumber}`) === '1'
}

export function markLocalVoted(meetingNumber) {
  sessionStorage.setItem(`${TM_VOTE_STORAGE_KEY}-voted-${meetingNumber}`, '1')
}

function incrementLocalVotes(state, preparedId, impromptuId, evaluatorId) {
  return {
    ...state,
    prepared: state.prepared.map(item => item.id === preparedId ? { ...item, votes: item.votes + 1 } : item),
    impromptu: state.impromptu.map(item => item.id === impromptuId ? { ...item, votes: item.votes + 1 } : item),
    evaluator: state.evaluator.map(item => item.id === evaluatorId ? { ...item, votes: item.votes + 1 } : item),
  }
}

function topCandidate(list = []) {
  const sorted = [...list].sort((a, b) => (b.votes || 0) - (a.votes || 0))
  if (!sorted.length || !sorted[0].votes) return { name: '', votes: 0 }
  const tied = sorted[1] && (sorted[1].votes || 0) === (sorted[0].votes || 0)
  return { name: tied ? 'Tied' : sorted[0].name, votes: sorted[0].votes || 0 }
}

function voteHistorySnapshot(state) {
  const prepared = topCandidate(state.prepared)
  const impromptu = topCandidate(state.impromptu)
  const evaluator = topCandidate(state.evaluator)
  return {
    id: state.meeting?.id || `${state.meeting?.number || ''}-${state.meeting?.date || ''}`,
    meeting: state.meeting?.number || '',
    date: state.meeting?.date || '',
    preparedWinner: prepared.name,
    preparedVotes: prepared.votes,
    impromptuWinner: impromptu.name,
    impromptuVotes: impromptu.votes,
    evaluatorWinner: evaluator.name,
    evaluatorVotes: evaluator.votes,
  }
}

function withVoteHistorySnapshot(state) {
  const snapshot = voteHistorySnapshot(state)
  const key = `${snapshot.id || ''}|${snapshot.meeting}|${snapshot.date}`
  const history = (state.history || []).filter(record => {
    const recordKey = `${record.id || ''}|${record.meeting}|${record.date}`
    return recordKey !== key
  })
  return {
    ...state,
    history: [snapshot, ...history],
  }
}

function toMeetingRow(meeting, meetingId, ownerId) {
  return {
    id: meetingId,
    owner_id: ownerId,
    club_id: getActiveClubRowId(),
    meeting_number: meeting.number,
    meeting_date: meeting.date,
    theme: meeting.theme,
    word_of_day: meeting.word,
    close_time: meeting.closeTime,
    status: meeting.status,
    public_link: meeting.link,
  }
}

async function upsertMeetingWithSchemaFallback(meetingRow) {
  const { error: rpcError } = await supabase.rpc('tm_save_meeting', {
    p_id: meetingRow.id,
    p_club_id: meetingRow.club_id || getActiveClubRowId(),
    p_meeting_number: meetingRow.meeting_number,
    p_meeting_date: meetingRow.meeting_date,
    p_theme: meetingRow.theme,
    p_word_of_day: meetingRow.word_of_day || '',
    p_close_time: meetingRow.close_time || '',
    p_status: meetingRow.status || 'draft',
    p_public_link: meetingRow.public_link || '',
  })

  if (!rpcError) return
  if (isMissingFunctionError(rpcError)) {
    throw new Error('云端数据库还没完成最新迁移，缺少 tm_save_meeting。请在 Supabase 执行 supabase/tm-vote-full-cloud-migration.sql 后重新登录。')
  }
  if (isRowLevelSecurityError(rpcError)) {
    throw new Error('Supabase RLS 权限未更新。请在 Supabase 执行 supabase/tm-vote-full-cloud-migration.sql 后重新登录。')
  }
  throw rpcError
}

function fromMeetingRow(row) {
  return {
    id: row.id,
    number: row.meeting_number,
    date: row.meeting_date,
    theme: row.theme,
    word: row.word_of_day,
    closeTime: row.close_time,
    status: row.status,
    link: row.public_link || getPublicVoteUrl(),
  }
}

function toCandidateRow(item, meetingId, category, sortOrder) {
  const dbId = item.id.startsWith(`${meetingId}-`) ? item.id : `${meetingId}-${item.id}`
  return {
    id: dbId,
    meeting_id: meetingId,
    category,
    name: item.name,
    speech_title: item.title || '',
    project: item.project || '',
    votes: item.votes || 0,
    sort_order: sortOrder,
  }
}

function fromCandidateRow(row) {
  return {
    id: row.id,
    name: row.name,
    title: row.speech_title,
    project: row.project,
    votes: row.votes || 0,
  }
}

function fromHistoryRow(row) {
  return {
    id: row.meeting_id || row.id,
    meeting: row.meeting_number,
    date: row.meeting_date,
    preparedWinner: row.prepared_winner,
    preparedVotes: row.prepared_votes,
    impromptuWinner: row.impromptu_winner,
    impromptuVotes: row.impromptu_votes,
    evaluatorWinner: row.evaluator_winner,
    evaluatorVotes: row.evaluator_votes,
  }
}

function isMissingSchemaError(error) {
  if (!error) return false
  const message = `${error.message || error.details || ''}`.toLowerCase()
  return message.includes('schema cache') || message.includes('could not find the table') || message.includes('could not find the')
}

function isMissingColumnError(error, columnName) {
  if (!error) return false
  const message = `${error.message || error.details || ''}`.toLowerCase()
  return message.includes(`${columnName}`.toLowerCase()) && message.includes('schema cache')
}

function isMissingFunctionError(error, functionName = 'tm_save_meeting') {
  if (!error) return false
  const message = `${error.message || error.details || ''}`.toLowerCase()
  return message.includes(functionName.toLowerCase()) && (message.includes('schema cache') || message.includes('could not find the function'))
}

function isRowLevelSecurityError(error) {
  if (!error) return false
  const message = `${error.message || error.details || ''}`.toLowerCase()
  return message.includes('row-level security') || message.includes('violates row-level security policy')
}

function getPeopleCloudIdPrefix(ownerId) {
  return `${ownerId}::${getActiveClubId()}::`
}

function toPeopleCloudId(id, ownerId) {
  const rawId = `${id || Date.now()}`
  if (rawId.includes('::')) return rawId
  return `${getPeopleCloudIdPrefix(ownerId)}${rawId}`
}

function fromPeopleCloudId(id) {
  const rawId = `${id || ''}`
  return rawId.includes('::') ? rawId.split('::').pop() : rawId
}

function toMemberRow(item, ownerId) {
  return {
    id: toPeopleCloudId(item.id, ownerId),
    owner_id: ownerId,
    club_id: getActiveClubRowId(),
    name: item.name,
    english_name: item.englishName || '',
    email: item.email || '',
    phone: item.phone || '',
    pathway: item.pathway || '',
    level: item.level || '',
    status: item.status || 'active',
    joined_date: item.joinedDate || null,
  }
}

function fromMemberRow(row) {
  return {
    id: fromPeopleCloudId(row.id),
    name: row.name,
    englishName: row.english_name || '',
    email: row.email || '',
    phone: row.phone || '',
    pathway: row.pathway || '',
    level: row.level || '',
    status: row.status || 'active',
    joinedDate: row.joined_date || '',
  }
}

function toGuestRow(item, ownerId) {
  return {
    id: toPeopleCloudId(item.id, ownerId),
    owner_id: ownerId,
    club_id: getActiveClubRowId(),
    name: item.name,
    email: item.email || '',
    phone: item.phone || '',
    introduced_by: item.introducedBy || '',
    visit_date: item.visitDate || null,
    notes: item.notes || '',
  }
}

function fromGuestRow(row) {
  return {
    id: fromPeopleCloudId(row.id),
    name: row.name,
    email: row.email || '',
    phone: row.phone || '',
    introducedBy: row.introduced_by || '',
    visitDate: row.visit_date || '',
    notes: row.notes || '',
  }
}

function toAttendanceRow(item, ownerId, meetingId) {
  return {
    owner_id: ownerId,
    club_id: getActiveClubRowId(),
    meeting_id: meetingId,
    person_type: item.personType,
    person_id: item.personId,
    attended: item.attended,
  }
}

function fromAttendanceRow(row) {
  return {
    id: row.id,
    personType: row.person_type,
    personId: row.person_id,
    attended: row.attended,
  }
}

function toRoleRow(item, ownerId, meetingId) {
  return {
    owner_id: ownerId,
    club_id: getActiveClubRowId(),
    meeting_id: meetingId,
    role_name: item.roleName,
    role_time: item.time,
    person_type: item.personType,
    person_id: item.personId,
  }
}

function fromRoleRow(row) {
  return {
    id: row.id,
    roleName: row.role_name,
    time: row.role_time || '',
    personType: row.person_type,
    personId: row.person_id,
  }
}

function toTimerRecordRow(record, ownerId, meetingId, clubId) {
  return {
    id: record.id,
    owner_id: ownerId,
    club_id: clubId || 'default',
    meeting_id: meetingId,
    item_id: record.itemId || '',
    item_type: record.itemType || '',
    summary: record.summary || '',
    person: record.person || '',
    planned_duration: record.duration || '',
    elapsed_seconds: Math.round(record.elapsed || 0),
    light: record.light || '',
    light_label: record.lightLabel || '',
    started_at: record.startedAt || null,
    ended_at: record.endedAt || new Date().toISOString(),
  }
}

function fromTimerRecordRow(row) {
  return {
    id: row.id,
    itemId: row.item_id || '',
    itemType: row.item_type || '',
    summary: row.summary || '',
    person: row.person || '',
    duration: row.planned_duration || '',
    elapsed: row.elapsed_seconds || 0,
    light: row.light || '',
    lightLabel: row.light_label || '',
    startedAt: row.started_at || '',
    endedAt: row.ended_at || row.created_at || '',
  }
}

function toSystemSettingsRow(settings, ownerId) {
  return {
    owner_id: ownerId,
    club_id: getActiveClubRowId(),
    club_name: settings.clubName,
    club_short: settings.clubShort,
    toastmaster_id: settings.toastmasterId,
    admin_name: settings.adminName,
    username: settings.username,
    logo_data_url: settings.logoDataUrl,
    agenda_template_name: settings.agendaTemplateName,
    agenda_template_data_url: settings.agendaTemplateDataUrl,
    agenda_role_template: settings.agendaRoleTemplate || [],
    updated_at: new Date().toISOString(),
  }
}

function fromSystemSettingsRow(row) {
  const club = getManagedClubMeta(row.club_id || getActiveClubId())
  return {
    clubName: row.club_name || club?.clubName || seedSystemSettings.clubName,
    clubShort: row.club_short || club?.clubShort || club?.clubName || seedSystemSettings.clubShort,
    toastmasterId: row.toastmaster_id || club?.toastmasterId || '',
    adminName: row.admin_name || '',
    username: row.username || '',
    logoDataUrl: row.logo_data_url || '',
    agendaTemplateName: row.agenda_template_name || '',
    agendaTemplateDataUrl: row.agenda_template_data_url || '',
    agendaRoleTemplate: row.agenda_role_template || seedSystemSettings.agendaRoleTemplate,
  }
}

function toClubAdminRow(admin, ownerId) {
  const club = getManagedClubMeta()
  return {
    id: toPeopleCloudId(admin.id, ownerId),
    owner_id: ownerId,
    club_id: getActiveClubRowId(),
    toastmaster_id: admin.toastmasterId || club?.toastmasterId || getActiveClubId(),
    email: admin.email || '',
    username: admin.username,
    password_hint: admin.password,
    name: admin.name,
  }
}

function fromClubAdminRow(row) {
  const club = getManagedClubMeta(row.club_id || getActiveClubId())
  return {
    id: fromPeopleCloudId(row.id),
    toastmasterId: row.toastmaster_id || club?.toastmasterId || getActiveClubId(),
    email: row.email || '',
    username: row.username || '',
    password: row.password_hint || '',
    name: row.name || '',
  }
}
