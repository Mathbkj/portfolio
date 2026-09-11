import logo from '../assets/logo.png'

function Navbar() {
  return (
    <nav className="sticky font-bebas top-4 z-50 mx-auto flex w-full max-w-3xl items-center justify-between rounded-full border border-border bg-bg/70 px-6 py-3 backdrop-blur-md">
      <a href="#">
        <img src={logo} alt="Logo" className="h-7 w-auto dark:invert" />
      </a>

      <ul className="flex items-center gap-6 text-sm text-text">
        <li>
          <a href="#about" className="transition-colors hover:text-accent">
            About
          </a>
        </li>
        <li>
          <a href="#projects" className="transition-colors hover:text-accent">
            Projects
          </a>
        </li>
        <li>
          <a href="#contact" className="transition-colors hover:text-accent">
            Contact
          </a>
        </li>
      </ul>
    </nav>
  )
}

export default Navbar
