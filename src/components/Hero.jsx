import AnimatedHeadline from "./AnimatedHeadline";
import HoverBlend from "./HoverBlend";
import people from "../assets/people.jpg";

function Hero() {
  return (
    // overflow-x-clip (not overflow-hidden) so the image can extend below the
    // section, under the CloudSection that overlaps it.
    <section className="relative isolate flex h-svh w-full shrink-0 items-end justify-center overflow-x-clip pb-8">
      <img
        src={people}
        alt=""
        className="absolute top-0 left-0 -z-10 h-[140svh] w-full object-cover object-center"
      />
      <HoverBlend className="absolute top-6 left-6 md:top-10 md:left-12">
        <p className="text-left text-lg font-bold text-white">
          I build websites that go beyond the screen
        </p>
      </HoverBlend>
      <button
        type="button"
        className="absolute top-6 right-6 cursor-pointer rounded-full border-2 border-white px-6 py-2 text-lg font-bold text-white mix-blend-overlay transition-colors duration-300 hover:border-white hover:bg-white hover:text-black hover:mix-blend-normal md:top-10 md:right-12"
      >
        Explore
      </button>
      <HoverBlend className="relative" radius={220}>
        <AnimatedHeadline
          text="Tech"
          className="m-0! whitespace-nowrap text-center font-bold text-white text-[300px]"
        />
      </HoverBlend>
    </section>
  );
}

export default Hero;
