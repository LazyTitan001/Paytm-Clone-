import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Signin } from "./pages/SignIn";
import { Dashboard } from "./pages/DashBoard";
import { SendMoney } from "./pages/SendMoney";

function App() {
  return (
    <>
       <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<SendMoney />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
