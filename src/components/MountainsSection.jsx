import mountain1 from "../assets/mountain-1.png";
import mountain2 from "../assets/mountain-2.png";
import mountain3 from "../assets/mountain-3.png";

function MountainsSection() {
  return (
    <section className="relative z-100 min-h-[70vh] w-full overflow-hidden bg-white">
      <img
        src={mountain1}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-40 h-auto w-full "
      />
      <img
        src={mountain3}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 z-10 h-auto w-80 -translate-x-1/2 w-full"
      />
      <img
        src={mountain2}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute right-60 bottom-32 z-30 h-auto w-72 md:w-96"
      />
    </section>
  );
}

export default MountainsSection;
