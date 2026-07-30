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

function clubKey(key) {
  return `${key}-club-${getActiveClubId()}`
}

function getClubStorageItem(key) {
  return localStorage.getItem(clubKey(key)) || (getActiveClubId() === 'default' ? localStorage.getItem(key) : null)
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

export function getPublicVoteUrl(spaceId = '', clubId = getActiveClubId()) {
  const basePath = import.meta.env.BASE_URL || '/'
  const url = new URL(`${basePath.replace(/\/$/, '')}/tm-vote`, window.location.origin)
  const activeSpace = spaceId || getRememberedWorkspaceId() || getLocalWorkspaceId()
  url.searchParams.set('view', 'vote')
  url.searchParams.set('space', activeSpace)
  url.searchParams.set('club', clubId || 'default')
  if (!envCloudConfig.url && !envCloudConfig.anonKey && activeCloudConfig.url && activeCloudConfig.anonKey) {
    url.searchParams.set('cfg', encodeCloudConfig(activeCloudConfig))
  }
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
    { id: 'a1', toastmasterId: '', username: '', password: '', name: '' },
  ],
}

export function loadLocalState() {
  try {
    const saved = getClubStorageItem(TM_VOTE_STORAGE_KEY)
    const state = saved ? JSON.parse(saved) : seedState
    return {
      ...state,
      meeting: { ...state.meeting, link: getPublicVoteUrl() },
    }
  } catch {
    return {
      ...seedState,
      meeting: { ...seedState.meeting, link: getPublicVoteUrl() },
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
    return saved ? JSON.parse(saved) : seedPeopleState
  } catch {
    return seedPeopleState
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
    return saved ? { ...seedSystemSettings, ...JSON.parse(saved) } : seedSystemSettings
  } catch {
    return seedSystemSettings
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

  let { data, error } = await supabase
    .from('tm_club_settings')
    .select('owner_id, club_name, club_short, toastmaster_id, admin_name, username, logo_data_url, agenda_template_name, agenda_template_data_url, agenda_role_template')
    .eq('owner_id', ownerId)
    .maybeSingle()

  if (error) {
    const result = await supabase
      .from('tm_club_settings')
      .select('owner_id, club_name, club_short, toastmaster_id, admin_name, username')
      .eq('owner_id', ownerId)
      .maybeSingle()
    data = result.data
    error = result.error
  }

  if (error) throw error
  if (!data) return { data: seedSystemSettings, source: 'cloud' }

  let clubAdmins = seedSystemSettings.clubAdmins
  if (user && !spaceId) {
    const { data: admins, error: adminsError } = await supabase
      .from('tm_club_admins')
      .select('*')
      .eq('owner_id', user.id)
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
    .upsert(toSystemSettingsRow(settings, user.id), { onConflict: 'owner_id' })

  if (error) {
    const { error: minimalError } = await supabase
      .from('tm_club_settings')
      .upsert({
        owner_id: user.id,
        club_name: settings.clubName,
        club_short: settings.clubShort,
        toastmaster_id: settings.toastmasterId,
        admin_name: settings.adminName,
        username: settings.username,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'owner_id' })

    if (minimalError) throw minimalError
    return { source: 'cloud' }
  }

  const { error: deleteAdminsError } = await supabase
    .from('tm_club_admins')
    .delete()
    .eq('owner_id', user.id)

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

export async function loadPeopleState() {
  if (!isCloudConfigured) {
    return { data: loadLocalPeople(), source: 'local' }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { data: loadLocalPeople(), source: 'local' }
  }

  const [{ data: members, error: memberError }, { data: guests, error: guestError }] = await Promise.all([
    supabase
      .from('tm_members')
      .select('*')
      .eq('owner_id', user.id)
      .order('name', { ascending: true }),
    supabase
      .from('tm_guests')
      .select('*')
      .eq('owner_id', user.id)
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

  const scopedPrefix = getPeopleCloudIdPrefix(user.id)
  const isCurrentClubRow = row => {
    if (typeof row.id !== 'string' || !row.id.includes('::')) return true
    return row.id.startsWith(scopedPrefix)
  }

  const scopedMembers = members.filter(isCurrentClubRow).filter(row => `${row.id}`.startsWith(scopedPrefix))
  const scopedGuests = guests.filter(isCurrentClubRow).filter(row => `${row.id}`.startsWith(scopedPrefix))
  const visibleMembers = scopedMembers.length ? scopedMembers : members.filter(isCurrentClubRow)
  const visibleGuests = scopedGuests.length ? scopedGuests : guests.filter(isCurrentClubRow)

  return {
    data: {
      members: visibleMembers.map(fromMemberRow),
      guests: visibleGuests.map(fromGuestRow),
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
  const scopedPrefix = getPeopleCloudIdPrefix(user.id)

  const { error: memberDeleteError } = await supabase
    .from('tm_members')
    .delete()
    .eq('owner_id', user.id)
    .like('id', `${scopedPrefix}%`)

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
    .like('id', `${scopedPrefix}%`)

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

export async function loadMeetingOpsState(meetingId = '') {
  if (!isCloudConfigured) {
    return { data: loadLocalMeetingOps(), source: 'local' }
  }

  const user = await getCurrentUser()
  if (!user) {
    return { data: loadLocalMeetingOps(), source: 'local' }
  }

  const activeMeetingId = meetingId || getMeetingId(user.id)
  const [{ data: attendance, error: attendanceError }, { data: roles, error: rolesError }] = await Promise.all([
    supabase
      .from('tm_meeting_attendance')
      .select('*')
      .eq('owner_id', user.id)
      .eq('meeting_id', activeMeetingId),
    supabase
      .from('tm_meeting_roles')
      .select('*')
      .eq('owner_id', user.id)
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

  const activeMeetingId = meetingId || getMeetingId(user.id)
  const attendanceRows = state.attendance.map(item => toAttendanceRow(item, user.id, activeMeetingId))
  const roleRows = state.roles.map(item => toRoleRow(item, user.id, activeMeetingId))

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

export async function loadVoteState(spaceId = '', clubId = getActiveClubId()) {
  if (!isCloudConfigured) {
    return { data: loadLocalState(), source: 'local' }
  }

  const user = await getCurrentUser()
  const activeSpace = spaceId || user?.id
  if (!activeSpace) {
    return { data: loadLocalState(), source: 'local' }
  }
  const meetingId = getMeetingId(activeSpace, clubId)

  const { data: meeting, error: meetingError } = await supabase
    .from('tm_meetings')
    .select('*')
    .eq('id', meetingId)
    .maybeSingle()

  if (meetingError) throw meetingError

  if (!meeting) {
    if (spaceId) {
      return {
        data: {
          ...seedState,
          meeting: {
            ...seedState.meeting,
            id: meetingId,
            number: '',
            theme: '',
            status: 'draft',
            link: getPublicVoteUrl(activeSpace, clubId),
          },
          prepared: [],
          impromptu: [],
          evaluator: [],
        },
        source: 'cloud',
      }
    }
    if (!user) return { data: loadLocalState(), source: 'local' }
    await saveVoteState(seedState)
    return loadVoteState(user.id)
  }

  const [{ data: candidates, error: candidateError }, { data: history, error: historyError }] = await Promise.all([
    supabase
      .from('tm_candidates')
      .select('*')
      .eq('meeting_id', meeting.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('tm_winner_history')
      .select('*')
      .order('meeting_date', { ascending: false })
      .limit(20),
  ])

  if (candidateError) throw candidateError
  if (historyError) throw historyError

  return {
    data: {
      meeting: { ...fromMeetingRow(meeting), link: meeting.public_link || getPublicVoteUrl(activeSpace, clubId) },
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
  const meetingId = getMeetingId(user.id)
  const meeting = { ...state.meeting, id: meetingId, link: getPublicVoteUrl(user.id, getActiveClubId()) }
  const meetingRow = toMeetingRow(meeting, meetingId, user.id)
  const candidateRows = [
    ...state.prepared.map((item, index) => toCandidateRow(item, meetingId, 'prepared', index)),
    ...state.impromptu.map((item, index) => toCandidateRow(item, meetingId, 'impromptu', index)),
    ...state.evaluator.map((item, index) => toCandidateRow(item, meetingId, 'evaluator', index)),
  ]

  await upsertMeetingWithSchemaFallback(meetingRow)

  const { error: deleteError } = await supabase
    .from('tm_candidates')
    .delete()
    .eq('meeting_id', meetingId)

  if (deleteError) throw deleteError

  if (candidateRows.length) {
    const { error: candidateError } = await supabase
      .from('tm_candidates')
      .insert(candidateRows)

    if (candidateError) throw candidateError
  }

  return {
    data: {
      ...state,
      meeting,
    },
    source: 'cloud',
  }
}

export async function submitVote(state, preparedId, impromptuId, evaluatorId, voterToken) {
  if (!isCloudConfigured) {
    const next = incrementLocalVotes(state, preparedId, impromptuId, evaluatorId)
    saveLocalState(next)
    return { data: next, source: 'local' }
  }

  const meetingId = state.meeting.id || TM_VOTE_MEETING_ID
  const { data, error } = await supabase.rpc('tm_submit_vote', {
    p_meeting_id: meetingId,
    p_prepared_candidate_id: preparedId,
    p_impromptu_candidate_id: impromptuId,
    p_evaluator_candidate_id: evaluatorId,
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

export function getOrCreateVoterToken(meetingNumber) {
  const key = `${TM_VOTE_STORAGE_KEY}-voter-${meetingNumber}`
  const saved = localStorage.getItem(key)
  if (saved) return saved
  const token = crypto.randomUUID()
  localStorage.setItem(key, token)
  return token
}

export function hasLocalVote(meetingNumber) {
  return localStorage.getItem(`${TM_VOTE_STORAGE_KEY}-voted-${meetingNumber}`) === '1'
}

export function markLocalVoted(meetingNumber) {
  localStorage.setItem(`${TM_VOTE_STORAGE_KEY}-voted-${meetingNumber}`, '1')
}

function incrementLocalVotes(state, preparedId, impromptuId, evaluatorId) {
  return {
    ...state,
    prepared: state.prepared.map(item => item.id === preparedId ? { ...item, votes: item.votes + 1 } : item),
    impromptu: state.impromptu.map(item => item.id === impromptuId ? { ...item, votes: item.votes + 1 } : item),
    evaluator: state.evaluator.map(item => item.id === evaluatorId ? { ...item, votes: item.votes + 1 } : item),
  }
}

function toMeetingRow(meeting, meetingId, ownerId) {
  return {
    id: meetingId,
    owner_id: ownerId,
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
    p_meeting_number: meetingRow.meeting_number,
    p_meeting_date: meetingRow.meeting_date,
    p_theme: meetingRow.theme,
    p_word_of_day: meetingRow.word_of_day || '',
    p_close_time: meetingRow.close_time || '',
    p_status: meetingRow.status || 'draft',
    p_public_link: meetingRow.public_link || '',
  })

  if (!rpcError) return
  if (!isMissingFunctionError(rpcError)) throw rpcError

  const optionalColumns = ['word_of_day', 'close_time', 'status', 'public_link', 'created_at', 'updated_at']
  let row = { ...meetingRow }

  for (let attempt = 0; attempt <= optionalColumns.length; attempt += 1) {
    const { error } = await supabase
      .from('tm_meetings')
      .upsert(row)

    if (!error) return

    const missingColumn = optionalColumns.find(column => isMissingColumnError(error, column) && column in row)
    if (!missingColumn) throw error

    const { [missingColumn]: _removed, ...nextRow } = row
    row = nextRow
  }
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

function isMissingFunctionError(error) {
  if (!error) return false
  const message = `${error.message || error.details || ''}`.toLowerCase()
  return message.includes('tm_save_meeting') && (message.includes('schema cache') || message.includes('could not find the function'))
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

function toSystemSettingsRow(settings, ownerId) {
  return {
    owner_id: ownerId,
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
  return {
    clubName: row.club_name || seedSystemSettings.clubName,
    clubShort: row.club_short || seedSystemSettings.clubShort,
    toastmasterId: row.toastmaster_id || '',
    adminName: row.admin_name || '',
    username: row.username || '',
    logoDataUrl: row.logo_data_url || '',
    agendaTemplateName: row.agenda_template_name || '',
    agendaTemplateDataUrl: row.agenda_template_data_url || '',
    agendaRoleTemplate: row.agenda_role_template || seedSystemSettings.agendaRoleTemplate,
  }
}

function toClubAdminRow(admin, ownerId) {
  return {
    id: admin.id,
    owner_id: ownerId,
    toastmaster_id: admin.toastmasterId,
    username: admin.username,
    password_hint: admin.password,
    name: admin.name,
  }
}

function fromClubAdminRow(row) {
  return {
    id: row.id,
    toastmasterId: row.toastmaster_id || '',
    username: row.username || '',
    password: row.password_hint || '',
    name: row.name || '',
  }
}
