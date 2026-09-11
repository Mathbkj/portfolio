import heroImg from '../assets/hero.png'

function Hero() {
  return (
    <section className="flex min-h-[80vh] w-full flex-col items-center justify-center px-6 py-16">
      <img src={heroImg} alt="" className="h-[80vh] w-full object-contain" />
    </section>
  )
}

export default Hero
