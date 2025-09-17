import React, { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
// @ts-ignore
import { exportToExcel } from "@/components/ui/excelExport";

const initialData: any[] = [];



const PAGE_SIZE_OPTIONS = [5, 15, 25];

export default function Products() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [data, setData] = useState<any[]>(initialData);
  useEffect(() => {
    fetch('http://localhost:5000/products/')
      .then(res => res.json())
      .then(apiData => {
        setData(apiData.map((item: any) => ({
          ...item,
          Thresholdquantity: item.ThresholdQuantity ?? item.Thresholdquantity
        })));
      })
      .catch(() => {});
  }, []);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<any>(null);
  const [addRow, setAddRow] = useState<any>({ ProductName: "", Category: "", SquCode: "", Quantity: "", Thresholdquantity: "", Price: "" });
  const [addErrors, setAddErrors] = useState<any>({});
  const [editErrors, setEditErrors] = useState<any>({});

  // Derived filtered & paginated data
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(d =>
      String(d.ProductName).toLowerCase().includes(q) ||
      String(d.Category).toLowerCase().includes(q) ||
      String(d.SquCode).toLowerCase().includes(q)
    );
  }, [data, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleExport = () => {
    try {
      // export filtered list
      // @ts-ignore
      exportToExcel(filtered, 'products.xlsx');
    } catch (e) {
      // ignore
    }
  };

  const handleDelete = async (idx: number) => {
    const globalIdx = (page - 1) * pageSize + idx;
    const product = data[globalIdx];
    if (!product) return;
    try {
      const res = await fetch(`http://localhost:5000/products/${product.id}`, { method: 'DELETE' });
      if (res.ok) {
        setData(prev => prev.filter(p => p.id !== product.id));
      }
    } catch (e) {
      // ignore
    }
  };

  const handleEdit = (idx: number) => {
    const row = paginated[idx];
    if (!row) return;
    setEditIndex(idx);
    setEditRow({
      ProductName: row.ProductName ?? "",
      Category: row.Category ?? "",
      SquCode: row.SquCode ?? "",
      Quantity: String(row.Quantity ?? ""),
      Thresholdquantity: String(row.Thresholdquantity ?? row.ThresholdQuantity ?? ""),
      Price: String(row.Price ?? 0)
    });
    setEditErrors({});
  };
  const handleEditSave = async (idx: number) => {
    const globalIdx = (page - 1) * pageSize + idx;
    const errors: any = {};
    const name = String(editRow.ProductName ?? '').trim();
    const code = String(editRow.SquCode ?? '').trim();
    if (!name) errors.ProductName = "Product Name is required.";
    if (!editRow.Category || !String(editRow.Category).trim()) errors.Category = "Category is required.";
    if (!code) errors.SquCode = "SquCode is required.";
    if (!editRow.Quantity && editRow.Quantity !== 0) errors.Quantity = "Quantity is required.";
    if (!editRow.Thresholdquantity && editRow.Thresholdquantity !== 0) errors.Thresholdquantity = "Threshold quantity is required.";
    const nameLower = name.toLowerCase();
    const codeLower = code.toLowerCase();
    if (name && data.some((p, i) => i !== globalIdx && String(p.ProductName ?? '').trim().toLowerCase() === nameLower)) errors.ProductName = "Product Name must be unique.";
    if (code && data.some((p, i) => i !== globalIdx && String(p.SquCode ?? '').trim().toLowerCase() === codeLower)) errors.SquCode = "SquCode must be unique.";
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const product = data[globalIdx];
    const updatedProduct = {
      ...editRow,
      Quantity: Number(editRow.Quantity),
      Thresholdquantity: Number(editRow.Thresholdquantity),
      Price: editRow.Price ? Number(editRow.Price) : 0
    };
    try {
      const res = await fetch(`http://localhost:5000/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ProductName: updatedProduct.ProductName,
          Category: updatedProduct.Category,
          SquCode: updatedProduct.SquCode,
          Quantity: updatedProduct.Quantity,
          ThresholdQuantity: updatedProduct.Thresholdquantity,
          Price: updatedProduct.Price
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setData(prev => prev.map((row, i) => i === globalIdx ? {
          ...updated,
          Thresholdquantity: updated.ThresholdQuantity ?? updated.Thresholdquantity,
          SquCode: updated.SquCode
        } : row));
        setEditIndex(null);
        setEditRow(null);
      }
    } catch (e) {
      // Optionally handle error
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditRow({ ...editRow, [e.target.name]: e.target.value });
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddRow({ ...addRow, [e.target.name]: e.target.value });
  };
  const handleAdd = async () => {
    const errors: any = {};
    const name = String(addRow.ProductName ?? '').trim();
    const category = String(addRow.Category ?? '').trim();
    const code = String(addRow.SquCode ?? '').trim();
    if (!name) errors.ProductName = "Product Name is required.";
    if (!category) errors.Category = "Category is required.";
    if (!code) errors.SquCode = "SquCode is required.";
    if (addRow.Quantity === '' || addRow.Quantity === null || addRow.Quantity === undefined) errors.Quantity = "Quantity is required.";
    if (addRow.Thresholdquantity === '' || addRow.Thresholdquantity === null || addRow.Thresholdquantity === undefined) errors.Thresholdquantity = "Threshold quantity is required.";
    const nameLower = name.toLowerCase();
    const codeLower = code.toLowerCase();
    if (name && data.some(p => String(p.ProductName ?? '').trim().toLowerCase() === nameLower)) errors.ProductName = "Product Name must be unique.";
    if (code && data.some(p => String(p.SquCode ?? '').trim().toLowerCase() === codeLower)) errors.SquCode = "SquCode must be unique.";
    setAddErrors(errors);
    if (Object.keys(errors).length > 0) return;
    const newProduct = {
      ...addRow,
      Quantity: Number(addRow.Quantity),
      Thresholdquantity: Number(addRow.Thresholdquantity),
      Price: addRow.Price ? Number(addRow.Price) : 0
    };
    try {
      const res = await fetch('http://localhost:5000/products/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ProductName: newProduct.ProductName,
          Category: newProduct.Category,
          SquCode: newProduct.SquCode,
          Quantity: newProduct.Quantity,
          ThresholdQuantity: newProduct.Thresholdquantity,
          Price: newProduct.Price
        })
      });
      if (res.ok) {
        const created = await res.json();
        setData(prev => [...prev, {
          ...created,
          Thresholdquantity: created.ThresholdQuantity ?? created.Thresholdquantity,
          SquCode: created.SquCode
        }]);
        setAddRow({ ProductName: "", Category: "", SquCode: "", Quantity: "", Thresholdquantity: "", Price: "" });
        setAddErrors({});
      }
    } catch (e) {
      // Optionally handle error
    }
  };

  

  return (
    <div className="w-full min-h-screen p-6 bg-slate-100">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Top controls */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
          <Button onClick={handleExport} variant="outline" className="w-fit order-1 md:order-none bg-slate-200">Export as Excel</Button>
          <div className="flex-1" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="max-w-xs ml-auto order-2 md:order-none"
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>SquCode</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Threshold Quantity</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Add Row */}
            <TableRow>
              <TableCell className="py-3">
                <Input name="ProductName" value={addRow.ProductName} onChange={handleAddChange} placeholder="Product Name" />
                {addErrors.ProductName && <div className="text-xs text-red-600 mt-1">{addErrors.ProductName}</div>}
              </TableCell>
              <TableCell className="py-3">
                <Input name="Category" value={addRow.Category} onChange={handleAddChange} placeholder="Category" />
                {addErrors.Category && <div className="text-xs text-red-600 mt-1">{addErrors.Category}</div>}
              </TableCell>
              <TableCell className="py-3">
                <Input name="SquCode" value={addRow.SquCode} onChange={handleAddChange} placeholder="SquCode" />
                {addErrors.SquCode && <div className="text-xs text-red-600 mt-1">{addErrors.SquCode}</div>}
              </TableCell>
              <TableCell className="py-3">
                <Input name="Quantity" value={addRow.Quantity} onChange={handleAddChange} placeholder="Quantity" type="number" />
                {addErrors.Quantity && <div className="text-xs text-red-600 mt-1">{addErrors.Quantity}</div>}
              </TableCell>
              <TableCell className="py-3">
                <Input name="Thresholdquantity" value={addRow.Thresholdquantity} onChange={handleAddChange} placeholder="Threshold" type="number" />
                {addErrors.Thresholdquantity && <div className="text-xs text-red-600 mt-1">{addErrors.Thresholdquantity}</div>}
              </TableCell>
              <TableCell className="py-3">
                <Input name="Price" value={addRow.Price} onChange={handleAddChange} placeholder="Price" type="number" />
              </TableCell>
              <TableCell className="py-3"><Button size="sm" onClick={handleAdd}>Add</Button></TableCell>
            </TableRow>
            {/* Data Rows */}
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No products found.</TableCell>
              </TableRow>
            ) : (
              paginated.map((row, i) => (
                <TableRow key={i} className="py-1">
                  {editIndex === i ? (
                    <>
                      <TableCell className="py-3">
                        <Input name="ProductName" value={editRow.ProductName} onChange={handleEditChange} />
                        {editErrors.ProductName && <div className="text-xs text-red-600 mt-1">{editErrors.ProductName}</div>}
                      </TableCell>
                      <TableCell className="py-3">
                        <Input name="Category" value={editRow.Category} onChange={handleEditChange} />
                        {editErrors.Category && <div className="text-xs text-red-600 mt-1">{editErrors.Category}</div>}
                      </TableCell>
                      <TableCell className="py-3">
                        <Input name="SquCode" value={editRow.SquCode} onChange={handleEditChange} />
                        {editErrors.SquCode && <div className="text-xs text-red-600 mt-1">{editErrors.SquCode}</div>}
                      </TableCell>
                      <TableCell className="py-3">
                        <Input name="Quantity" value={editRow.Quantity} onChange={handleEditChange} type="number" />
                        {editErrors.Quantity && <div className="text-xs text-red-600 mt-1">{editErrors.Quantity}</div>}
                      </TableCell>
                      <TableCell className="py-3">
                        <Input name="Thresholdquantity" value={editRow.Thresholdquantity} onChange={handleEditChange} type="number" />
                        {editErrors.Thresholdquantity && <div className="text-xs text-red-600 mt-1">{editErrors.Thresholdquantity}</div>}
                      </TableCell>
                      <TableCell className="py-3">
                        <Input name="Price" value={editRow.Price} onChange={handleEditChange} type="number" />
                      </TableCell>
                      <TableCell className="py-3">
                        <Button size="sm" onClick={() => handleEditSave(i)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditIndex(null); setEditRow(null); }}>Cancel</Button>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="py-2">{row.ProductName}</TableCell>
                      <TableCell className="py-2">{row.Category}</TableCell>
                      <TableCell className="py-2">{row.SquCode}</TableCell>
                      <TableCell className="py-2">{row.Quantity}</TableCell>
                      <TableCell className="py-2">{row.Thresholdquantity}</TableCell>
                      <TableCell className="py-2">₹{Number(row.Price).toFixed(2)}</TableCell>
                      <TableCell className="py-2">
                          <div className="flex items-center justify-center gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(i)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(i)}>Delete</Button>
                          </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {/* Bottom controls */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4 gap-4">
          <div className="flex gap-2 items-center order-2 md:order-none">
            <span>Show</span>
            <Select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
              {PAGE_SIZE_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Select>
            <span>entries</span>
          </div>
          <div className="flex-1" />
          <div className="order-1 md:order-none">
            <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}