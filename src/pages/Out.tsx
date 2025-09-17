import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Dialog } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";

export default function Out() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("");
  const [selected, setSelected] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem("out_selected");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmProduct, setConfirmProduct] = useState<any | null>(null);

  // Persist selected to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("out_selected", JSON.stringify(selected));
    } catch {}
  }, [selected]);

  useEffect(() => {
    fetch("http://localhost:5000/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => setProducts([]));
  }, []);

  const categories = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => {
      if (p.Category) s.add(p.Category);
    });
    return Array.from(s);
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((row) => {
      const matchCategory = category ? row.Category === category : true;
      const matchSearch =
        !q ||
        String(row.ProductName ?? "")
          .toLowerCase()
          .includes(q);
      return matchCategory && matchSearch;
    });
  }, [search, products, category]);

  const handleAdd = (product: any) => {
    setSelected((prev) => {
      const found = prev.find((p) => p.SquCode === product.SquCode);
      if (found) return prev;
      return [...prev, { ...product, outQuantity: 1 }];
    });
  };

  const handleChangeQty = (squCode: string, delta: number) => {
    const found = selected.find((p) => p.SquCode === squCode);
    if (!found) return;
    if (delta < 0 && found.outQuantity <= 1) {
      setConfirmProduct(found);
      setConfirmOpen(true);
      return;
    }
    setSelected((prev) =>
      prev.map((p) =>
        p.SquCode === squCode
          ? {
              ...p,
              outQuantity: Math.max(
                1,
                Math.min(p.Quantity, p.outQuantity + delta)
              ),
            }
          : p
      )
    );
  };

  const handleRemove = (squCode: string) => {
    setSelected((prev) => prev.filter((p) => p.SquCode !== squCode));
  };

  const handleConfirmRemove = (confirm: boolean) => {
    if (confirm && confirmProduct) {
      setSelected((prev) =>
        prev.filter((p) => p.SquCode !== confirmProduct.SquCode)
      );
    }
    setConfirmOpen(false);
    setConfirmProduct(null);
  };

  const totalProducts = selected.length;
  const totalQuantity = selected.reduce((sum, p) => sum + p.outQuantity, 0);
  const totalPrice = selected.reduce(
    (sum, p) => sum + p.outQuantity * p.Price,
    0
  );

  const handleSubmit = async () => {
    const payload = selected.map((p) => ({
      id: p.id,
      quantity: p.outQuantity,
    }));
    try {
      await fetch("http://localhost:5000/products/out-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Update local products quantities
      setProducts((prev) =>
        prev.map((prod) => {
          const found = selected.find((s) => s.id === prod.id);
          if (found)
            return {
              ...prod,
              Quantity: (prod.Quantity || 0) - found.outQuantity,
            };
          return prod;
        })
      );
      setReviewOpen(false);
      setSelected([]);
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="flex w-full min-h-screen p-8 gap-8 bg-slate-100 ">
      <div className="w-full max-w-md">
        <Accordion title="Search Product">
          <div className="my-2 flex gap-2 ">
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-40"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            <Input
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
            {filtered.length === 0 && (
              <div className="text-muted-foreground">No products found.</div>
            )}
            {filtered.map((product) => (
              <div
                key={product.SquCode}
                className="flex items-center justify-between border rounded px-3 py-2 bg-card"
              >
                <div>
                  <div className="font-medium">
                    {product.ProductName}
                    {product.Category && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({product.Category})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Qty: {product.Quantity}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAdd(product)}
                  disabled={selected.some((p) => p.SquCode === product.SquCode)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </Accordion>
      </div>
      <div className="flex-1 bg-card rounded-lg p-6 flex flex-col min-h-[500px]">
        <div className="font-bold text-lg mb-4">
          Selected Products (Out Stock)
        </div>
        <div className="flex flex-col gap-2">
          {selected.length === 0 && (
            <div className="text-muted-foreground">No products selected.</div>
          )}
          {selected.map((product) => (
            <div
              key={product.SquCode}
              className="flex items-center gap-4 border-b pb-2"
            >
              <div className="flex-1">
                <div className="font-medium">
                  {product.ProductName}
                  {product.Category && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({product.Category})
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Price: ₹{product.Price.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleChangeQty(product.SquCode, -1)}
                >
                  {" "}
                  -{" "}
                </Button>
                <span className="w-8 text-center">{product.outQuantity}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleChangeQty(product.SquCode, 1)}
                >
                  {" "}
                  +{" "}
                </Button>
              </div>
              <div className="w-24 text-right font-semibold">
                ₹{(product.outQuantity * product.Price).toFixed(2)}
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRemove(product.SquCode)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="flex gap-8">
            <div className="flex items-center gap-2">
              <span>Total Products:</span>
              <span className="font-semibold">{totalProducts}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Total Quantity:</span>
              <span className="font-semibold">{totalQuantity}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Total Price:</span>
              <span className="font-semibold">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => setReviewOpen(true)}
              disabled={selected.length === 0}
            >
              Review
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <div className="font-bold text-lg mb-4">Remove product?</div>
        <div className="mb-4">
          Are you sure you want to remove{" "}
          <span className="font-semibold">{confirmProduct?.ProductName}</span>{" "}
          from the cart?
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={() => handleConfirmRemove(false)}>
            No
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleConfirmRemove(true)}
          >
            Yes
          </Button>
        </div>
      </Dialog>

      <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)}>
        <div className="font-bold text-lg mb-4">Review Out Stock</div>
        <div className="mb-4">
          <table className="w-full border border-gray-300 text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="py-2 px-3 text-center border border-gray-300">
                  Category
                </th>
                <th className="py-2 px-3 text-left border border-gray-300">
                  Product Name
                </th>
                <th className="py-2 px-3 text-center border border-gray-300">
                  Quantity
                </th>
                <th className="py-2 px-3 text-right border border-gray-300">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const grouped: { [cat: string]: any[] } = {};
                selected.forEach((p: any) => {
                  if (!grouped[p.Category]) grouped[p.Category] = [];
                  grouped[p.Category].push(p);
                });
                const rows: React.ReactNode[] = [];
                Object.entries(grouped).forEach(([cat, products]) => {
                  (products as any[]).forEach((product, idx) => {
                    rows.push(
                      <tr key={product.SquCode}>
                        {idx === 0 && (
                          <td
                            className="py-1 px-3 align-middle text-center border border-gray-300"
                            rowSpan={products.length}
                          >
                            {cat}
                          </td>
                        )}
                        <td className="py-1 px-3 border border-gray-300">
                          {product.ProductName}
                        </td>
                        <td className="py-1 px-3 text-center border border-gray-300">
                          {product.outQuantity}
                        </td>
                        <td className="py-1 px-3 text-right border border-gray-300">
                          ₹{(product.outQuantity * product.Price).toFixed(2)}
                        </td>
                      </tr>
                    );
                  });
                });
                return rows;
              })()}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-4">
          <Button variant="ghost" onClick={() => setReviewOpen(false)}>
            Cancel
          </Button>
          <Button variant="default" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
