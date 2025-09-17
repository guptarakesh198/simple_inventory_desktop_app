import { cn } from "@/lib/utils";
import { Button } from "./button";

const pages = [
  { name: "Product Master", key: "products" },
  { name: "In Stock", key: "in" },
  { name: "Out Stock", key: "out" },
];

export function Navbar({ current, onNavigate }: { current: string; onNavigate: (key: string) => void }) {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 border-b bg-background">
      <div className="flex gap-4">
        {pages.map((page) => (
          <Button
            key={page.key}
            variant={current === page.key ? "default" : "ghost"}
            className={cn("rounded-md px-4 py-2 text-base", current === page.key && "font-bold")}
            onClick={() => onNavigate(page.key)}
          >
            {page.name}
          </Button>
        ))}
      </div>
    </nav>
  );
}
