import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import StudentRegister from './pages/StudentRegister.jsx'
import Manager from './pages/Manager.jsx'

// HashRouter를 사용하면 GitHub Pages 같은 정적 호스팅에서
// 새로고침 시 404가 나는 문제 없이 라우팅이 동작합니다.
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student" element={<StudentRegister />} />
        <Route path="/manager" element={<Manager />} />
      </Routes>
    </HashRouter>
  )
}
