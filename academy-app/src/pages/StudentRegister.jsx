import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient.js'

const ACADEMY_NAME = '윌그로우어학원'

// 학년 옵션: 초1~초6, 중1~중3, 고1~고3
const GRADE_OPTIONS = [
  '초1', '초2', '초3', '초4', '초5', '초6',
  '중1', '중2', '중3',
  '고1', '고2', '고3',
]

const initialForm = {
  name: '',
  birth_date: '',
  school: '',
  grade: '',
  phone: '',
  guardian_phone: '',
  address: '',
  uses_shuttle: false,
  shuttle_pickup: '',
  shuttle_dropoff: '',
  notes: '',
  privacy_consent: false,
  guardian_consent: false,
  marketing_consent: false,
}

// 생년월일로 만 나이 계산
function calcAge(birthDate) {
  if (!birthDate) return null
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function StudentRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [status, setStatus] = useState({ loading: false, message: '', error: false })

  const age = calcAge(form.birth_date)
  const isUnder14 = age !== null && age < 14

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      setStatus({ loading: false, message: '학생 이름을 입력해주세요.', error: true })
      return
    }
    if (!form.birth_date) {
      setStatus({ loading: false, message: '생년월일을 입력해주세요.', error: true })
      return
    }
    if (!form.grade) {
      setStatus({ loading: false, message: '학년을 선택해주세요.', error: true })
      return
    }
    if (!form.guardian_phone.trim()) {
      setStatus({ loading: false, message: '보호자 연락처를 입력해주세요.', error: true })
      return
    }
    if (form.uses_shuttle && (!form.shuttle_pickup.trim() || !form.shuttle_dropoff.trim())) {
      setStatus({ loading: false, message: '차량 탑승 시 탑승 장소와 하원 장소를 입력해주세요.', error: true })
      return
    }
    if (!form.privacy_consent) {
      setStatus({ loading: false, message: '개인정보 수집·이용 동의는 필수입니다.', error: true })
      return
    }
    if (isUnder14 && !form.guardian_consent) {
      setStatus({ loading: false, message: '만 14세 미만은 법정대리인(보호자) 동의가 필수입니다.', error: true })
      return
    }

    setStatus({ loading: true, message: '', error: false })

    const payload = {
      ...form,
      shuttle_pickup: form.uses_shuttle ? form.shuttle_pickup : '',
      shuttle_dropoff: form.uses_shuttle ? form.shuttle_dropoff : '',
      guardian_consent: isUnder14 ? form.guardian_consent : false,
    }

    const { data, error } = await supabase
      .from('students')
      .insert([payload])
      .select()
      .single()

    if (error) {
      setStatus({ loading: false, message: `저장 실패: ${error.message}`, error: true })
      return
    }

    try {
      const { error: fnError } = await supabase.functions.invoke('notion-sync', { body: data })
      if (fnError) console.warn('Notion 동기화 실패:', fnError)
    } catch (notionError) {
      console.warn('Notion 동기화 실패:', notionError)
    }

    setStatus({ loading: false, message: '등록이 완료되었습니다!', error: false })
    setForm(initialForm)
  }

  return (
    <div className="form-container">
      <button className="back-button" onClick={() => navigate('/')}>← 뒤로</button>
      <h2>{ACADEMY_NAME} 신입생 등록</h2>
      <form onSubmit={handleSubmit}>
        <label>
          학생 이름 *
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          생년월일 *
          <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} required />
        </label>
        <label>
          학교
          <input name="school" value={form.school} onChange={handleChange} placeholder="예: 방화초등학교" />
        </label>
        <label>
          학년 *
          <select name="grade" value={form.grade} onChange={handleChange} required>
            <option value="">선택하세요</option>
            {GRADE_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <label>
          학생 본인 연락처 (선택)
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="010-0000-0000" />
        </label>
        <label>
          보호자 연락처 *
          <input name="guardian_phone" value={form.guardian_phone} onChange={handleChange} placeholder="010-0000-0000" required />
        </label>
        <label>
          주소
          <input name="address" value={form.address} onChange={handleChange} />
        </label>

        <fieldset className="fieldset">
          <legend>차량 탑승 여부</legend>
          <div className="radio-row">
            <label className="radio-label">
              <input type="radio" name="uses_shuttle" checked={form.uses_shuttle === true}
                onChange={() => setForm((prev) => ({ ...prev, uses_shuttle: true }))} />
              이용
            </label>
            <label className="radio-label">
              <input type="radio" name="uses_shuttle" checked={form.uses_shuttle === false}
                onChange={() => setForm((prev) => ({ ...prev, uses_shuttle: false, shuttle_pickup: '', shuttle_dropoff: '' }))} />
              미이용
            </label>
          </div>
        </fieldset>

        {form.uses_shuttle && (
          <>
            <label>
              탑승 장소 *
              <input name="shuttle_pickup" value={form.shuttle_pickup} onChange={handleChange} placeholder="예: ○○아파트 정문" />
            </label>
            <label>
              하원 장소 *
              <input name="shuttle_dropoff" value={form.shuttle_dropoff} onChange={handleChange} placeholder="예: ○○아파트 정문" />
            </label>
          </>
        )}

        <label>
          메모
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} />
        </label>

        <fieldset className="fieldset consent">
          <legend>개인정보 수집·이용 동의</legend>
          <p className="consent-text">
            {ACADEMY_NAME}은(는) 신입생 등록 및 학원 운영(수업·상담 안내, 차량 운행, 비상 연락)을 위해 아래와 같이 개인정보를 수집·이용합니다.
            <br />· 수집 항목: 학생 이름, 생년월일, 학교, 학년, 연락처, 보호자 연락처, 주소, 차량 탑승 정보, 메모
            <br />· 이용 목적: 등록 관리, 수업·상담 안내, 차량 운행, 비상 연락
            <br />· 보유 기간: 퇴원 후 3년까지 보관 후 파기
            <br />귀하는 동의를 거부할 권리가 있으며, 미동의 시 학원 등록이 제한될 수 있습니다.
          </p>
          <label className="checkbox-label">
            <input type="checkbox" name="privacy_consent" checked={form.privacy_consent} onChange={handleChange} />
            위 개인정보 수집·이용에 동의합니다. (필수)
          </label>

          {isUnder14 && (
            <>
              <p className="consent-text">
                본 학생은 만 14세 미만으로, 개인정보보호법에 따라 법정대리인(보호자)의 동의가 필요합니다.
              </p>
              <label className="checkbox-label">
                <input type="checkbox" name="guardian_consent" checked={form.guardian_consent} onChange={handleChange} />
                법정대리인(보호자)으로서 위 개인정보 수집·이용에 동의합니다. (만 14세 미만 필수)
              </label>
            </>
          )}
        </fieldset>

        <fieldset className="fieldset consent">
          <legend>마케팅 정보 수신 동의 (선택)</legend>
          <p className="consent-text">
            {ACADEMY_NAME}의 강좌 개설·이벤트·학사 안내 등 마케팅 정보를 문자·알림톡·이메일 등으로 받는 데 동의합니다.
            선택 항목이며, 미동의 시에도 등록에는 제한이 없습니다.
          </p>
          <label className="checkbox-label">
            <input type="checkbox" name="marketing_consent" checked={form.marketing_consent} onChange={handleChange} />
            마케팅 정보 수신에 동의합니다. (선택)
          </label>
        </fieldset>

        <button type="submit" disabled={status.loading}>
          {status.loading ? '등록 중...' : '등록하기'}
        </button>

        {status.message && (
          <p className={status.error ? 'status-error' : 'status-success'}>{status.message}</p>
        )}
      </form>
    </div>
  )
}