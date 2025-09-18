import { cn } from "@/lib/utils";
import { Button } from "./button";

const pages = [
	{ name: "Product Master", key: "products" },
	{ name: "In Stock", key: "in" },
	{ name: "Out Stock", key: "out" },
	{ name: "Settings", key: "settings" },
];

export function Navbar({
	current,
	onNavigate,
	companyName = "My Company",
}: {
	current: string;
	onNavigate: (key: string) => void;
	companyName?: string;
}) {
	return (
		<>
			{/* Top company bar (centered, large, dynamic name) */}
			<div className="w-full bg-muted/5 border-b">
				<div className="container mx-auto px-6 py-4 flex justify-center">
					<div className="text-center">
						<span className="block text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight">
							{companyName}
						</span>
					</div>
				</div>
			</div>

			{/* Main navigation */}
			<nav className="w-full border-b bg-background">
				<div className="container mx-auto flex items-center justify-between px-6 py-4">
					<div className="flex gap-4">
						{pages.map((page) => (
							<Button
								key={page.key}
								variant={current === page.key ? "default" : "ghost"}
								className={cn(
									"rounded-md px-4 py-2 text-base cursor-pointer",
									current === page.key && "font-bold"
								)}
								onClick={() => onNavigate(page.key)}
								aria-current={current === page.key ? "page" : undefined}
							>
								{page.name}
							</Button>
						))}
					</div>
				</div>
			</nav>
		</>
	);
}
