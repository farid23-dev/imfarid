import Hero from "../components/Hero";
import About from "../components/About";
import Resume from "../components/Resume";
import Projects from "../components/Projects";
import Skills from "../components/Skills";
import Contact from "../components/Contact";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Resume />
      <Projects />
      <Skills />
      <Contact />
      <Footer />
    </>
  );
}
