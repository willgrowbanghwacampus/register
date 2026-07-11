import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="home-container">
      <h1>학원 관리 시스템</h1>
      <p className="subtitle">역할을 선택해주세요</p>
      <div className="button-group">
        <button className="role-button student" onClick={() => navigate('/student')}>
          <span className="icon">📝</span>
          <span>Student</span>
          <span className="desc">신입생 등록</span>
        </button>
        <button className="role-button manager" onClick={() => navigate('/manager')}>
          <span className="icon">📊</span>
          <span>Manager</span>
          <span className="desc">등록 현황 조회</span>
        </button>
      </div>
    </div>
  )
}
