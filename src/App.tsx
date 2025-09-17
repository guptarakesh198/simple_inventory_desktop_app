
import { useState } from "react"

import Products from "./pages/Products"
import In from "./pages/In"
import Out from "./pages/Out"

import { Navbar } from "@/components/ui/navbar"



const pageContent: Record<string, React.ReactNode> = {
  products: <Products />,
  in: <In />,
  out: <Out />,
};

function App() {
  const [current, setCurrent] = useState<string>("products");
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar current={current} onNavigate={setCurrent} />
      <main className="flex-1 flex items-center justify-center">
        {pageContent[current]}
      </main>
    </div>
  );
}

export default App