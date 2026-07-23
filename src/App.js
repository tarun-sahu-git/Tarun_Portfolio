import logo from './logo.svg';
import './App.css';

import Home from './components/Home'
import About from './components/About'
import Skill from './components/Skill'
import Project from './components/Project'
import Contact from './components/Contact';
import Education from './components/Education';
import Experience from './components/Experience';
import Footer from './components/Footer';
function App() {
  return (
    <div className="App">
     <Home/>
     <About/>
     <Education/>
     <Skill/>
     <Experience/>
     <Project/>
     <Contact/>
     <Footer/>
    </div>
  );
}

export default App;
