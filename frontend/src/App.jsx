import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./componants/Landing";
import Botbottom from "./componants/Botbottom";
import Chatbot from "./componants/CampusConnectBot";
import AdminPanel from "./componants/AdminPanel";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Landing />
              <Botbottom />
              <Chatbot />
            </div>
          }
        />
        <Route path="/admin" element={<AdminPanel />} />
        {/* Add this route if you want to keep the capitalized URL */}
        <Route path="/AdminPanel" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;