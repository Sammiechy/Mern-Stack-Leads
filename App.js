import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './signup/Signup';
import Login from './signup/Login';
import Lead from './signup/Lead';

function App() {
  return (
   <div style={{margin:"20px"}}>
   <Router>
   <Routes>
    <Route path="/" element={<Login/>}/>
    <Route path="/leads" element={<Lead/>}/>
    <Route path="/signup" element={<Signup/>} />
    </Routes>
   </Router>
   
   </div> 
  );
}

export default App;
