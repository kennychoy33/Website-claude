import { createClient } from '@supabase/supabase-js'

export const TM_VOTE_STORAGE_KEY = 'toastmasters-vote-demo-v5'
export const TM_VOTE_MEETING_ID = '627'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isCloudConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const supabase = isCloudConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

export async function getCurrentUser() {
  if (!supabase) return null
  const { data } = await supabase.auth.getUser()
  return data.user
}

export function onAuthChange(callback) {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null)
  })
  return () => data.subscription.unsubscribe()
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function signUpWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data.user
}

export async function signOutUser() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function getPublicVoteUrl(spaceId = '') {
  const basePath = import.meta.env.BASE_URL || '/'
  const url = new URL(`${basePath.replace(/\/$/, '')}/tm-vote`, window.location.origin)
  url.searchParams.set('view', 'vote')
  if (spaceId) url.searchParams.set('space', spaceId)
  return url.toString()
}

function getMeetingId(spaceId = '') {
  return spaceId ? `${spaceId}-${TM_VOTE_MEETING_ID}` : TM_VOTE_MEETING_ID
}

function getSpaceIdFromMeetingId(meetingId = '') {
  const suffix = `-${TM_VOTE_MEETING_ID}`
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

export function loadLocalState() {
  try {
    const saved = localStorage.getItem(TM_VOTE_STORAGE_KEY)
    return saved ? JSON.parse(saved) : seedState
  } catch {
    return seedState
  }
}

export function saveLocalState(next) {
  localStorage.setItem(TM_VOTE_STORAGE_KEY, JSON.stringify(next))
}

export async function loadVoteState(spaceId = '') {
  if (!isCloudConfigured) {
    return { data: loadLocalState(), source: 'local' }
  }

  const user = await getCurrentUser()
  const activeSpace = spaceId || user?.id
  if (!activeSpace) {
    return { data: loadLocalState(), source: 'local' }
  }
  const meetingId = getMeetingId(activeSpace)

  const { data: meeting, error: meetingError } = await supabase
    .from('tm_meetings')
    .select('*')
    .eq('id', meetingId)
    .maybeSingle()

  if (meetingError) throw meetingError

  if (!meeting) {
    if (!user || spaceId) return { data: loadLocalState(), source: 'local' }
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
      meeting: { ...fromMeetingRow(meeting), link: meeting.public_link || getPublicVoteUrl(activeSpace) },
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
    return { source: 'local' }
  }

  const user = await getCurrentUser()
  if (!user) {
    saveLocalState(state)
    return { source: 'local' }
  }

  const meetingId = getMeetingId(user.id)
  const meeting = { ...state.meeting, id: meetingId, link: getPublicVoteUrl(user.id) }
  const meetingRow = toMeetingRow(meeting, meetingId, user.id)
  const candidateRows = [
    ...state.prepared.map((item, index) => toCandidateRow(item, meetingId, 'prepared', index)),
    ...state.impromptu.map((item, index) => toCandidateRow(item, meetingId, 'impromptu', index)),
    ...state.evaluator.map((item, index) => toCandidateRow(item, meetingId, 'evaluator', index)),
  ]

  const { error: meetingError } = await supabase
    .from('tm_meetings')
    .upsert(meetingRow)

  if (meetingError) throw meetingError

  const { error: deleteError } = await supabase
    .from('tm_candidates')
    .delete()
    .eq('meeting_id', meetingId)

  if (deleteError) throw deleteError

  const { error: candidateError } = await supabase
    .from('tm_candidates')
    .insert(candidateRows)

  if (candidateError) throw candidateError

  return { source: 'cloud' }
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
