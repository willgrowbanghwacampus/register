import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

const MANAGER_PASSWORD = import.meta.env.VITE_MANAGER_PASSWORD

export default function Manager() {
  const navigate = useNavigate()
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (authed) fetchStudents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  const fetchStudents = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setStudents(data)
    }
    setLoading(false)
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === MANAGER_PASSWORD) {
      setAuthed(true)
      setAuthError('')
    } else {
      setAuthError('비밀번호가 일치하지 않습니다.')
    }
  }

  const filtered = students.filter((s) =>
    [s.name, s.phone, s.guardian_phone, s.school, s.grade].some((v) =>
      (v || '').toLowerCase().includes(search.toLowerCase())
    )
  )

  if (!authed) {
    return (
      <div className="form-container">
        <button className="back-button" onClick={() => navigate('/')}>← 뒤로</button>
        <h2>Manager 로그인</h2>
        <form onSubmit={handleLogin}>
          <label>
            비밀번호
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </label>
          <button type="submit">확인</button>
          {authError && <p className="status-error">{authError}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="manager-container">
      <button className="back-button" onClick={() => navigate('/')}>← 뒤로</button>
      <h2>신입생 등록 현황 ({students.length}명)</h2>

      <div className="toolbar">
        <input
          placeholder="이름, 연락처, 학교, 학년으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={fetchStudents}>새로고침</button>
      </div>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="status-error">{error}</p>}

      {!loading && !error && (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>이름</th>
                <th>생년월일</th>
                <th>학교</th>
                <th>학년</th>
                <th>본인 연락처</th>
                <th>보호자 연락처</th>
                <th>주소</th>
                <th>차량</th>
                <th>탑승 장소</th>
                <th>하원 장소</th>
                <th>메모</th>
                <th>마케팅</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.birth_date || '-'}</td>
                  <td>{s.school || '-'}</td>
                  <td>{s.grade || '-'}</td>
                  <td>{s.phone || '-'}</td>
                  <td>{s.guardian_phone || '-'}</td>
                  <td>{s.address || '-'}</td>
                  <td>{s.uses_shuttle ? '이용' : '미이용'}</td>
                  <td>{s.shuttle_pickup || '-'}</td>
                  <td>{s.shuttle_dropoff || '-'}</td>
                  <td>{s.notes || '-'}</td>
                  <td>{s.marketing_consent ? '동의' : '-'}</td>
                  <td>{new Date(s.created_at).toLocaleDateString('ko-KR')}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={13} style={{ textAlign: 'center' }}>등록된 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}