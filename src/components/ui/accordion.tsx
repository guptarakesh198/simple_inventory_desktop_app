import * as React from "react"

export function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(true);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = React.useState<string>(open ? 'none' : '0px');

  React.useEffect(() => {
    if (open && contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight + 'px');
    } else {
      setMaxHeight('0px');
    }
  }, [open, children]);

  return (
    <div className="border rounded-md mb-4 bg-background">
      <button
        className="w-full cursor-pointer flex justify-between items-center px-4 py-3 font-semibold text-lg focus:outline-none"
        onClick={() => setOpen(o => !o)}
      >
        {title}
  <span>{open ? "-" : "+"}</span>
      </button>
      <div
        ref={contentRef}
        className={
          `px-4 pb-4 transition-all duration-300 overflow-hidden` +
          (open ? ' opacity-100' : ' opacity-0')
        }
        style={{
          maxHeight,
          transitionProperty: 'max-height, opacity',
        }}
        aria-hidden={!open}
      >
        {children}
      </div>
    </div>
  );
}
