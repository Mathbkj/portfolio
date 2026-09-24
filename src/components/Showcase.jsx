import ScrollRiseText from "./ScrollRiseText";

function Showcase() {
  return (
    <section className="pointer-events-none relative flex min-h-svh w-full items-center justify-between gap-4 px-6 md:px-12">
      <div className="flex max-w-[30%] flex-col items-start gap-4 text-left">
        <ScrollRiseText
          text="Zero sugar"
          className="text-[length:min(9vw,7rem)]! font-bold text-black!"
        />
        <ScrollRiseText
          as="p"
          text="All the iconic taste, none of the sugar."
          className="text-[length:min(2.4vw,1.25rem)] text-text"
        />
      </div>
      <div className="flex max-w-[30%] flex-col items-end gap-4 text-right">
        <ScrollRiseText
          text="Full taste"
          className="text-[length:min(9vw,7rem)]! font-bold text-black!"
        />
        <ScrollRiseText
          as="p"
          text="Served ice cold, every single time."
          className="text-[length:min(2.4vw,1.25rem)] text-text"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center px-6 pb-8 text-center md:pb-12">
        <ScrollRiseText
          text="Always ice cold. Always Coca-Cola."
          className="text-[length:min(6vw,4.5rem)]! font-bold text-black!"
        />
      </div>
    </section>
  );
}

export default Showcase;
