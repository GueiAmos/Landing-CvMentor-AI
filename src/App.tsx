import { BrowserRouter as Router } from "react-router-dom";
import LandingPage from "./components/landing/LandingPage";

function App() {
  const handleStartApp = () => {
    // window.scrollTo(0, 0);
  };

  return (
    <Router>
      <LandingPage onStartApp={handleStartApp} />
    </Router>
  );
}

export default App;
