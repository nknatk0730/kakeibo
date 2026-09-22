import { Routes, Route, Link } from "react-router";
import Home from "./pages/Home";
import Authors from "./pages/authors/Authors";
import AuthorDetail from "./pages/authors/AuthorDetail";
import "./App.css";
import "./pages/authors/authors.css";
import AuthorCreate from "./pages/authors/AuthorCreate";
import AuthorEdit from "./pages/authors/AuthorEdit";

function App() {

	return (
		<>
      <nav className="app-nav" aria-label="メインメニュー"><Link to="/">ホーム</Link><Link to="/authors">著者一覧</Link></nav>
      <Routes>
			<Route path="/" element={<Home />} />
			<Route path="/authors" element={<Authors />} />
			<Route path="/authors/new" element={<AuthorCreate />} />
        <Route path="/authors/:id/edit" element={<AuthorEdit />} />
        <Route path="/authors/:id" element={<AuthorDetail />} />
		<Route path="*" element={<p>ページが見つかりません。</p>} />
      </Routes>
    </>
	);
}

export default App;
