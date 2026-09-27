import ScrollRiseText from "./ScrollRiseText";

// On narrow screens the can takes the middle of the screen, so both columns
// move into the free space above it and the tagline stays in the space below.
// On short screens the type also scales with the height so it all fits.
const HEADING =
  "text-[length:min(9vw,7rem)]! font-bold text-black! narrow:text-[length:min(10vw,calc(var(--can-gap)*0.26))]! short:text-[length:min(9vw,11vh)]!";
const BODY =
  "text-[length:min(2.4vw,1.25rem)] text-text narrow:text-[length:min(3.6vw,1.1rem)] short:text-[length:min(2.4vw,3.6vh)]";

function Showcase() {
  return (
    <section className="pointer-events-none relative flex min-h-svh w-full items-center justify-between gap-4 px-6 md:px-12 narrow:items-start narrow:pt-[calc(var(--can-gap)*0.12)]">
      <div className="flex max-w-[30%] flex-col items-start gap-4 text-left narrow:max-w-[46%] narrow:gap-2">
        <ScrollRiseText text="Zero sugar" className={HEADING} />
        <ScrollRiseText as="p" text="All the iconic taste, none of the sugar." className={BODY} />
      </div>
      <div className="flex max-w-[30%] flex-col items-end gap-4 text-right narrow:max-w-[46%] narrow:gap-2">
        <ScrollRiseText text="Full taste" className={HEADING} />
        <ScrollRiseText as="p" text="Served ice cold, every single time." className={BODY} />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-8 text-center md:pb-12 short:pb-4!">
        <ScrollRiseText
          text="Always ice cold. Always Coca-Cola."
          className="text-[length:min(6vw,4.5rem)]! font-bold text-black! short:text-[length:min(6vw,7vh)]!"
        />
      </div>
    </section>
  );
}

export default Showcase;
