
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Plus,
  Bell,
  IndianRupee,
  TrendingUp,
  Clock,
  Download,
  Menu,
  Trash2,
  ArrowLeft,
  X,
} from "lucide-react";

/* =====================================================
   REUSABLE COMPONENTS
===================================================== */

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  ...props
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        {...props}
      />
    </label>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500"
      >
        <option value="">Select {label}</option>
        {children}
      </select>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </span>

      <textarea
        rows={3}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}

function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900">
          {title}
        </h3>

        {description && (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

function StatCard({ title, value, note, icon, color }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className={`rounded-xl p-3 ${styles[color]}`}>
          {icon}
        </div>
      </div>

      <h3 className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {note}
      </p>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-500">{label}</span>

      <span className="font-semibold tabular-nums">
        ₹{money(value)}
      </span>
    </div>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function money(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const emptyItem = () => ({
  description: "",
  hsn: "",
  qty: "",
  unit: "",
  rate: "",
  discount: "",
  gst: "",
});

const initialForm = {
  supplier: {
    tagline: "",
    name: "",
    address: "",
    phone: "",
    udyam: "",
    gstin: "",
    state: "",
    stateCode: "",
    email: "",
  },

  consignee: {
    name: "",
    address: "",
    phone: "",
    gstin: "",
    state: "",
    stateCode: "",
  },

  buyer: {
    name: "",
    address: "",
    phone: "",
    gstin: "",
    state: "",
    stateCode: "",
    placeOfSupply: "",
  },

  invoice: {
    number: "",
    date: "",
    deliveryNote: "",
    payment: "",
    reference: "",
    otherReferences: "",
    orderNo: "",
    orderDate: "",
    dispatchNo: "",
    deliveryDate: "",
    transport: "",
    destination: "",
    terms: "",
  },

  items: [emptyItem()],
  charges: [],

  balance: {
    previous: "",
    previousType: "",
  },

  bank: {
    holder: "",
    name: "",
    account: "",
    branchIfsc: "",
  },

  declaration: "",

  prepared: "",
  verified: "",
  authorised: "",
};

/* =====================================================
   MAIN APP
===================================================== */

export default function App() {
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const steps = [
    "Supplier",
    "Buyer",
    "Invoice",
    "Products",
    "Bank & Other",
  ];

  /* =====================================================
     STATE CHECK
  ===================================================== */

  const sameState =
    form.buyer.state.trim().toLowerCase() ===
    form.supplier.state.trim().toLowerCase();

  /* =====================================================
     PRODUCT-WISE GST CALCULATION
  ===================================================== */

  const calculations = useMemo(() => {
    const itemDetails = form.items.map((item) => {
      const qty = Math.max(0, Number(item.qty) || 0);
      const rate = Math.max(0, Number(item.rate) || 0);

      const discountPercent = Math.min(
        100,
        Math.max(0, Number(item.discount) || 0)
      );

      const gst = Math.min(
        100,
        Math.max(0, Number(item.gst) || 0)
      );

      const gross = qty * rate;

      const discountAmount =
        gross * discountPercent / 100;

      const taxable = gross - discountAmount;

      const tax = taxable * gst / 100;

      return {
        ...item,
        gross,
        discountAmount,
        taxable,
        tax,
        cgst: sameState ? tax / 2 : 0,
        sgst: sameState ? tax / 2 : 0,
        igst: sameState ? 0 : tax,
        total: taxable + tax,
      };
    });

    /* ADDITIONAL CHARGES */

    const chargeDetails = form.charges.map((charge) => {
      const taxable = Math.max(
        0,
        Number(charge.amount) || 0
      );

      const gst = Math.min(
        100,
        Math.max(0, Number(charge.gst) || 0)
      );

      const tax = taxable * gst / 100;

      return {
        ...charge,
        taxable,
        tax,
        cgst: sameState ? tax / 2 : 0,
        sgst: sameState ? tax / 2 : 0,
        igst: sameState ? 0 : tax,
        total: taxable + tax,
      };
    });

    const allRows = [
      ...itemDetails,
      ...chargeDetails,
    ];

    const taxableTotal = allRows.reduce(
      (sum, row) => sum + row.taxable,
      0
    );

    const cgst = allRows.reduce(
      (sum, row) => sum + row.cgst,
      0
    );

    const sgst = allRows.reduce(
      (sum, row) => sum + row.sgst,
      0
    );

    const igst = allRows.reduce(
      (sum, row) => sum + row.igst,
      0
    );

    const totalTax = cgst + sgst + igst;

    const grandTotal = taxableTotal + totalTax;

    const roundedTotal = Math.round(grandTotal);

    const roundOff = roundedTotal - grandTotal;

    const previous = Math.max(
      0,
      Number(form.balance.previous) || 0
    );

    const balance =
      form.balance.previousType === "Cr"
        ? roundedTotal - previous
        : roundedTotal + previous;

    /* HSN + GST RATE WISE SUMMARY */

    const taxGroups = {};

    allRows.forEach((row) => {
      const key = `${row.hsn}_${Number(row.gst || 0)}`;

      if (!taxGroups[key]) {
        taxGroups[key] = {
          hsn: row.hsn,
          gst: Number(row.gst || 0),
          taxable: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          tax: 0,
        };
      }

      taxGroups[key].taxable += row.taxable;
      taxGroups[key].cgst += row.cgst;
      taxGroups[key].sgst += row.sgst;
      taxGroups[key].igst += row.igst;
      taxGroups[key].tax += row.tax;
    });

    return {
      itemDetails,
      chargeDetails,
      allRows,
      taxGroups: Object.values(taxGroups),
      taxableTotal,
      cgst,
      sgst,
      igst,
      totalTax,
      grandTotal: roundedTotal,
      roundOff,
      balance,
    };
  }, [form, sameState]);

  /* =====================================================
     UPDATE FUNCTIONS
  ===================================================== */

  const updateSection = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      ),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, emptyItem()],
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items:
        prev.items.length === 1
          ? [emptyItem()]
          : prev.items.filter((_, i) => i !== index),
    }));
  };

  const addCharge = () => {
    setForm((prev) => ({
      ...prev,
      charges: [
        ...prev.charges,
        {
          name: "",
          hsn: "",
          amount: "",
          gst: "",
        },
      ],
    }));
  };

  const updateCharge = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      charges: prev.charges.map((charge, i) =>
        i === index
          ? { ...charge, [field]: value }
          : charge
      ),
    }));
  };

  const removeCharge = (index) => {
    setForm((prev) => ({
      ...prev,
      charges: prev.charges.filter(
        (_, i) => i !== index
      ),
    }));
  };

  /* =====================================================
     PDF GENERATION
  ===================================================== */

  const generatePDF = async () => {
    if (
      !form.invoice.number.trim() ||
      !form.buyer.name.trim()
    ) {
      setMessage(
        "Please enter invoice number and buyer name."
      );
      return;
    }

    if (
      !form.items.some((item) =>
        item.description.trim()
      )
    ) {
      setMessage("Please add at least one product.");
      return;
    }

    const invalidItem = form.items.some((item) => {
      const discount = Number(item.discount);
      const gst = Number(item.gst);
      const qty = Number(item.qty);
      const rate = Number(item.rate);

      return (
        discount < 0 ||
        discount > 100 ||
        gst < 0 ||
        gst > 100 ||
        qty < 0 ||
        rate < 0
      );
    });

    if (invalidItem) {
      setMessage(
        "Please check quantity, rate, discount and GST values."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "https://tax-bill-backend.onrender.com/generate-pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        let errorMessage = "PDF generation failed.";

        try {
          const errorData = await response.json();

          errorMessage = [
            errorData.message,
            errorData.error,
          ]
            .filter(Boolean)
            .join(": ") || errorMessage;

          console.error(
            "PDF Backend Error:",
            errorData
          );
        } catch {
          // Keep default error message.
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        `Invoice-${form.invoice.number}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("PDF downloaded successfully!");

    } catch (error) {
      console.error("PDF Generation Error:", error);

      setMessage(
        error.message || "Something went wrong."
      );

    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     FORM STEP 1 - SUPPLIER
  ===================================================== */

  const renderStep = () => {
    if (activeStep === 0) {
      return (
        <Section
          title="Supplier Details"
          description="Enter your business details."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Business Name"
              value={form.supplier.name}
              onChange={(v) =>
                updateSection("supplier", "name", v)
              }
            />

            <Input
              label="Tagline"
              value={form.supplier.tagline}
              onChange={(v) =>
                updateSection("supplier", "tagline", v)
              }
            />

            <Input
              label="Phone"
              value={form.supplier.phone}
              onChange={(v) =>
                updateSection("supplier", "phone", v)
              }
            />

            <Input
              label="Email"
              type="email"
              value={form.supplier.email}
              onChange={(v) =>
                updateSection("supplier", "email", v)
              }
            />

            <Input
              label="GSTIN"
              value={form.supplier.gstin}
              onChange={(v) =>
                updateSection("supplier", "gstin", v)
              }
            />

            <Input
              label="Udyam Number"
              value={form.supplier.udyam}
              onChange={(v) =>
                updateSection("supplier", "udyam", v)
              }
            />

            <Input
              label="State"
              value={form.supplier.state}
              onChange={(v) =>
                updateSection("supplier", "state", v)
              }
            />

            <Input
              label="State Code"
              value={form.supplier.stateCode}
              onChange={(v) =>
                updateSection("supplier", "stateCode", v)
              }
            />
          </div>

          <div className="mt-5">
            <TextArea
              label="Business Address"
              value={form.supplier.address}
              onChange={(v) =>
                updateSection("supplier", "address", v)
              }
            />
          </div>
        </Section>
      );
    }

    /* =====================================================
       FORM STEP 2 - BUYER
    ===================================================== */

    if (activeStep === 1) {
      return (
        <>
          <Section title="Buyer Details">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Buyer Name"
                value={form.buyer.name}
                onChange={(v) =>
                  updateSection("buyer", "name", v)
                }
              />

              <Input
                label="Phone"
                value={form.buyer.phone}
                onChange={(v) =>
                  updateSection("buyer", "phone", v)
                }
              />

              <Input
                label="GSTIN"
                value={form.buyer.gstin}
                onChange={(v) =>
                  updateSection("buyer", "gstin", v)
                }
              />

              <Input
                label="State"
                value={form.buyer.state}
                onChange={(v) =>
                  updateSection("buyer", "state", v)
                }
              />

              <Input
                label="State Code"
                value={form.buyer.stateCode}
                onChange={(v) =>
                  updateSection("buyer", "stateCode", v)
                }
              />

              <Input
                label="Place of Supply"
                value={form.buyer.placeOfSupply}
                onChange={(v) =>
                  updateSection("buyer", "placeOfSupply", v)
                }
              />
            </div>

            <div className="mt-5">
              <TextArea
                label="Buyer Address"
                value={form.buyer.address}
                onChange={(v) =>
                  updateSection("buyer", "address", v)
                }
              />
            </div>
          </Section>

          <Section
            title="Consignee Details"
            description="Optional delivery recipient details."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Consignee Name"
                value={form.consignee.name}
                onChange={(v) =>
                  updateSection("consignee", "name", v)
                }
              />

              <Input
                label="Phone"
                value={form.consignee.phone}
                onChange={(v) =>
                  updateSection("consignee", "phone", v)
                }
              />

              <Input
                label="GSTIN"
                value={form.consignee.gstin}
                onChange={(v) =>
                  updateSection("consignee", "gstin", v)
                }
              />

              <Input
                label="State"
                value={form.consignee.state}
                onChange={(v) =>
                  updateSection("consignee", "state", v)
                }
              />

              <Input
                label="State Code"
                value={form.consignee.stateCode}
                onChange={(v) =>
                  updateSection("consignee", "stateCode", v)
                }
              />
            </div>

            <div className="mt-5">
              <TextArea
                label="Consignee Address"
                value={form.consignee.address}
                onChange={(v) =>
                  updateSection("consignee", "address", v)
                }
              />
            </div>
          </Section>
        </>
      );
    }

    /* =====================================================
       FORM STEP 3 - INVOICE
    ===================================================== */

    if (activeStep === 2) {
      return (
        <Section title="Invoice Information">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Invoice Number"
              value={form.invoice.number}
              onChange={(v) =>
                updateSection("invoice", "number", v)
              }
            />

            <Input
              label="Invoice Date"
              type="date"
              value={form.invoice.date}
              onChange={(v) =>
                updateSection("invoice", "date", v)
              }
            />

            <Input
              label="Delivery Note"
              value={form.invoice.deliveryNote}
              onChange={(v) =>
                updateSection("invoice", "deliveryNote", v)
              }
            />

            <Input
              label="Payment Terms"
              value={form.invoice.payment}
              onChange={(v) =>
                updateSection("invoice", "payment", v)
              }
            />

            <Input
              label="Reference"
              value={form.invoice.reference}
              onChange={(v) =>
                updateSection("invoice", "reference", v)
              }
            />

            <Input
              label="Other References"
              value={form.invoice.otherReferences}
              onChange={(v) =>
                updateSection(
                  "invoice",
                  "otherReferences",
                  v
                )
              }
            />

            <Input
              label="Order Number"
              value={form.invoice.orderNo}
              onChange={(v) =>
                updateSection("invoice", "orderNo", v)
              }
            />

            <Input
              label="Order Date"
              type="date"
              value={form.invoice.orderDate}
              onChange={(v) =>
                updateSection("invoice", "orderDate", v)
              }
            />

            <Input
              label="Dispatch Number"
              value={form.invoice.dispatchNo}
              onChange={(v) =>
                updateSection("invoice", "dispatchNo", v)
              }
            />

            <Input
              label="Delivery Date"
              type="date"
              value={form.invoice.deliveryDate}
              onChange={(v) =>
                updateSection(
                  "invoice",
                  "deliveryDate",
                  v
                )
              }
            />

            <Input
              label="Transport"
              value={form.invoice.transport}
              onChange={(v) =>
                updateSection("invoice", "transport", v)
              }
            />

            <Input
              label="Destination"
              value={form.invoice.destination}
              onChange={(v) =>
                updateSection("invoice", "destination", v)
              }
            />
          </div>

          <div className="mt-5">
            <TextArea
              label="Terms of Delivery"
              value={form.invoice.terms}
              onChange={(v) =>
                updateSection("invoice", "terms", v)
              }
            />
          </div>
        </Section>
      );
    }

    /* =====================================================
       FORM STEP 4 - PRODUCTS
    ===================================================== */

    if (activeStep === 3) {
      return (
        <>
          <Section
            title="Product Details"
            description="Enter each product's own quantity, rate, discount and GST percentage."
          >
            <div className="space-y-5">
              {form.items.map((item, index) => {
                const calculation =
                  calculations.itemDetails[index];

                return (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold text-slate-900">
                        Product {index + 1}
                      </h4>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                        title="Remove product"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Input
                        label="Description"
                        value={item.description}
                        onChange={(v) =>
                          updateItem(
                            index,
                            "description",
                            v
                          )
                        }
                        placeholder="Product name"
                      />

                      <Input
                        label="HSN/SAC"
                        value={item.hsn}
                        onChange={(v) =>
                          updateItem(index, "hsn", v)
                        }
                        placeholder="HSN code"
                      />

                      <Input
                        label="Quantity"
                        type="number"
                        min="0"
                        step="any"
                        value={item.qty}
                        onChange={(v) =>
                          updateItem(index, "qty", v)
                        }
                      />

                      <Select
                        label="Unit"
                        value={item.unit}
                        onChange={(v) =>
                          updateItem(index, "unit", v)
                        }
                      >
                        <option value="PCS">PCS - Pieces</option>
                        <option value="NOS">NOS - Numbers</option>
                        <option value="KG">KG - Kilogram</option>
                        <option value="G">G - Gram</option>
                        <option value="LTR">LTR - Litre</option>
                        <option value="ML">ML - Millilitre</option>
                        <option value="MTR">MTR - Metre</option>
                        <option value="BOX">BOX - Box</option>
                        <option value="SET">SET - Set</option>
                        <option value="PAIR">PAIR - Pair</option>
                        <option value="DOZEN">DOZEN - Dozen</option>
                        <option value="ROLL">ROLL - Roll</option>
                        <option value="TON">TON - Tonne</option>
                      </Select>

                      <Input
                        label="Rate (₹)"
                        type="number"
                        min="0"
                        step="any"
                        value={item.rate}
                        onChange={(v) =>
                          updateItem(index, "rate", v)
                        }
                      />

                      <Input
                        label="Discount (%)"
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={item.discount}
                        onChange={(v) =>
                          updateItem(
                            index,
                            "discount",
                            v
                          )
                        }
                      />

                      <Input
                        label="GST Rate (%)"
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        placeholder="Enter GST percentage"
                        value={item.gst}
                        onChange={(v) =>
                          updateItem(index, "gst", v)
                        }
                      />
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <div className="space-y-2 text-sm">
                        <SummaryRow
                          label="Gross Amount"
                          value={calculation.gross}
                        />

                        <SummaryRow
                          label="Discount"
                          value={calculation.discountAmount}
                        />

                        <SummaryRow
                          label="Taxable Amount"
                          value={calculation.taxable}
                        />

                        <SummaryRow
                          label="GST Amount"
                          value={calculation.tax}
                        />

                        {sameState ? (
                          <>
                            <SummaryRow
                              label={`CGST (${Number(item.gst || 0) / 2}%)`}
                              value={calculation.cgst}
                            />

                            <SummaryRow
                              label={`SGST (${Number(item.gst || 0) / 2}%)`}
                              value={calculation.sgst}
                            />
                          </>
                        ) : (
                          <SummaryRow
                            label={`IGST (${item.gst}%)`}
                            value={calculation.igst}
                          />
                        )}

                        <div className="flex justify-between border-t border-slate-200 pt-3 font-bold">
                          <span>Product Total</span>
                          <span className="text-blue-700">
                            ₹{money(calculation.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addItem}
              className="mt-5 flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              <Plus size={18} />
              Add Product
            </button>
          </Section>

          {/* ADDITIONAL CHARGES */}

          <Section
            title="Additional Charges"
            description="Example: Packing, forwarding, freight and other charges."
          >
            {form.charges.map((charge, index) => {
              const calculation =
                calculations.chargeDetails[index];

              return (
                <div
                  key={index}
                  className="mb-4 rounded-xl border border-slate-200 p-4"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h4 className="font-semibold">
                      Additional Charge {index + 1}
                    </h4>

                    <button
                      type="button"
                      onClick={() => removeCharge(index)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Input
                      label="Charge Name"
                      value={charge.name}
                      onChange={(v) =>
                        updateCharge(index, "name", v)
                      }
                    />

                    <Input
                      label="HSN/SAC"
                      value={charge.hsn}
                      onChange={(v) =>
                        updateCharge(index, "hsn", v)
                      }
                    />

                    <Input
                      label="Amount (₹)"
                      type="number"
                      min="0"
                      step="any"
                      value={charge.amount}
                      onChange={(v) =>
                        updateCharge(index, "amount", v)
                      }
                    />

                    <Input
                      label="GST Rate (%)"
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      value={charge.gst}
                      onChange={(v) =>
                        updateCharge(index, "gst", v)
                      }
                    />
                  </div>

                  <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
                    <SummaryRow
                      label="Taxable Amount"
                      value={calculation.taxable}
                    />

                    <SummaryRow
                      label="GST Amount"
                      value={calculation.tax}
                    />

                    <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                      <span>Charge Total</span>
                      <span>
                        ₹{money(calculation.total)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={addCharge}
              className="flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              <Plus size={18} />
              Add Charge
            </button>
          </Section>
        </>
      );
    }

    /* =====================================================
       FORM STEP 5 - BANK & OTHER
    ===================================================== */

    return (
      <>
        <Section title="Bank Details">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Account Holder"
              value={form.bank.holder}
              onChange={(v) =>
                updateSection("bank", "holder", v)
              }
            />

            <Input
              label="Bank Name"
              value={form.bank.name}
              onChange={(v) =>
                updateSection("bank", "name", v)
              }
            />

            <Input
              label="Account Number"
              value={form.bank.account}
              onChange={(v) =>
                updateSection("bank", "account", v)
              }
            />

            <Input
              label="Branch / IFSC"
              value={form.bank.branchIfsc}
              onChange={(v) =>
                updateSection("bank", "branchIfsc", v)
              }
            />
          </div>
        </Section>

        <Section title="Previous Balance & Declaration">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Input
              label="Previous Balance (₹)"
              type="number"
              min="0"
              step="any"
              value={form.balance.previous}
              onChange={(v) =>
                updateSection("balance", "previous", v)
              }
            />

            <Select
              label="Previous Balance Type"
              value={form.balance.previousType}
              onChange={(v) =>
                updateSection(
                  "balance",
                  "previousType",
                  v
                )
              }
            >
              <option value="Dr">Debit (Dr)</option>
              <option value="Cr">Credit (Cr)</option>
            </Select>

            <Input
              label="Prepared By"
              value={form.prepared}
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  prepared: v,
                }))
              }
            />

            <Input
              label="Verified By"
              value={form.verified}
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  verified: v,
                }))
              }
            />

            <Input
              label="Authorised Signatory"
              value={form.authorised}
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  authorised: v,
                }))
              }
            />
          </div>

          <div className="mt-5">
            <TextArea
              label="Declaration"
              value={form.declaration}
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  declaration: v,
                }))
              }
            />
          </div>
        </Section>
      </>
    );
  };

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* DESKTOP SIDEBAR */}

      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col bg-slate-950 text-white md:flex">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-2xl font-bold">
            GST<span className="text-blue-400">Pro</span>
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Invoice Management
          </p>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase text-slate-500">
            Menu
          </p>

          <button
            onClick={() => setShowInvoiceForm(false)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              !showInvoiceForm
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            onClick={() => {
              setShowInvoiceForm(true);
              setActiveStep(0);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm ${
              showInvoiceForm
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <FileText size={19} />
            Create Invoice
          </button>

          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
            <Users size={19} />
            Customers
          </div>

          <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-300">
            <Settings size={19} />
            Settings
          </div>
        </nav>

        <div className="border-t border-slate-800 p-5">
          <p className="text-sm font-semibold">
            Gouranga Bhunia
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Administrator
          </p>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}

      {mobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenu(false)}
        >
          <div
            className="h-full w-72 bg-slate-950 p-5 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                GST<span className="text-blue-400">Pro</span>
              </h2>

              <button
                onClick={() => setMobileMenu(false)}
              >
                <X />
              </button>
            </div>

            <button
              onClick={() => {
                setShowInvoiceForm(false);
                setMobileMenu(false);
              }}
              className="mb-2 flex w-full items-center gap-3 rounded-xl bg-blue-600 p-3"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            <button
              onClick={() => {
                setShowInvoiceForm(true);
                setActiveStep(0);
                setMobileMenu(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl p-3"
            >
              <FileText size={18} />
              Create Invoice
            </button>
          </div>
        </div>
      )}

      <main className="md:ml-64">

        {/* HEADER */}

        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={23} />
            </button>

            <div>
              <h2 className="text-lg font-bold md:text-xl">
                {showInvoiceForm
                  ? "Create Invoice"
                  : "Dashboard"}
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                {showInvoiceForm
                  ? "Fill in your invoice information."
                  : "Manage your GST invoices."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-slate-200 p-2">
              <Bell size={19} />
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              G
            </div>
          </div>
        </header>

        {/* DASHBOARD */}

        {!showInvoiceForm ? (
          <div className="space-y-7 p-4 md:p-8">

            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Welcome back, Gouranga!
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your business invoices from one place.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowInvoiceForm(true);
                  setActiveStep(0);
                  setMessage("");
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
              >
                <Plus size={19} />
                Create Invoice
              </button>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Sales"
                value="₹0.00"
                note="This financial year"
                icon={<IndianRupee />}
                color="blue"
              />

              <StatCard
                title="Total Invoices"
                value="0"
                note="Invoices generated"
                icon={<FileText />}
                color="purple"
              />

              <StatCard
                title="Pending Payments"
                value="₹0.00"
                note="Amount receivable"
                icon={<Clock />}
                color="orange"
              />

              <StatCard
                title="Paid Amount"
                value="₹0.00"
                note="Payments received"
                icon={<TrendingUp />}
                color="green"
              />
            </section>

            <Section
              title="Quick Actions"
              description="Start creating and managing your invoices."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => {
                    setShowInvoiceForm(true);
                    setActiveStep(0);
                  }}
                  className="rounded-xl border border-slate-200 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <FileText
                    className="mb-4 text-blue-600"
                    size={27}
                  />

                  <h4 className="font-bold">
                    New GST Invoice
                  </h4>

                  <p className="mt-2 text-sm text-slate-500">
                    Enter buyer, products, tax and payment details.
                  </p>
                </button>

                <div className="rounded-xl border border-slate-200 p-5">
                  <Download
                    className="mb-4 text-purple-600"
                    size={27}
                  />

                  <h4 className="font-bold">
                    PDF Invoices
                  </h4>

                  <p className="mt-2 text-sm text-slate-500">
                    Generated PDFs download directly to your device.
                  </p>
                </div>
              </div>
            </Section>

            <Section title="Recent Invoices">
              <div className="py-12 text-center text-sm text-slate-400">
                No invoices created yet.
              </div>
            </Section>
          </div>
        ) : (

          /* INVOICE FORM */

          <div className="space-y-6 p-4 pb-32 md:p-8 md:pb-10">

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setShowInvoiceForm(false)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </button>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                GST Invoice
              </span>
            </div>

            {/* STEPPER */}

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex min-w-[540px] items-center justify-between gap-2">
                {steps.map((step, index) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(index)}
                    className="flex flex-1 flex-col items-center gap-2"
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                        activeStep === index
                          ? "bg-blue-600 text-white"
                          : activeStep > index
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span
                      className={`text-xs font-medium ${
                        activeStep === index
                          ? "text-blue-600"
                          : "text-slate-500"
                      }`}
                    >
                      {step}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {renderStep()}

            {/* TAX SUMMARY */}

            <Section
              title="Live GST Summary"
              description={
                sameState
                  ? "CGST + SGST (Same State)"
                  : "IGST (Different States)"
              }
            >
              <div className="space-y-3 text-sm">
                <SummaryRow
                  label="Taxable Amount"
                  value={calculations.taxableTotal}
                />

                <SummaryRow
                  label="CGST"
                  value={calculations.cgst}
                />

                <SummaryRow
                  label="SGST"
                  value={calculations.sgst}
                />

                <SummaryRow
                  label="IGST"
                  value={calculations.igst}
                />

                <SummaryRow
                  label="Total GST"
                  value={calculations.totalTax}
                />

                <SummaryRow
                  label="Round Off"
                  value={calculations.roundOff}
                />

                <div className="flex justify-between border-t border-slate-200 pt-4 text-base font-bold">
                  <span>Grand Total</span>

                  <span className="text-blue-700">
                    ₹{money(calculations.grandTotal)}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-semibold">
                  <span>Previous Balance</span>

                  <span>
                    ₹{money(form.balance.previous)}
                    {" "}
                    {form.balance.previousType}
                  </span>
                </div>

                <div className="flex justify-between text-sm font-bold">
                  <span>Current Balance</span>

                  <span>
                    ₹{money(Math.abs(calculations.balance))}
                    {calculations.balance >= 0 ? " Dr" : " Cr"}
                  </span>
                </div>
              </div>
            </Section>

            {/* HSN GST RATE SUMMARY */}

            <Section
              title="HSN/SAC Tax Summary"
              description="Tax is grouped by HSN/SAC and GST percentage."
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left text-slate-500">
                      <th className="p-3">HSN/SAC</th>
                      <th className="p-3 text-right">GST Rate</th>
                      <th className="p-3 text-right">Taxable</th>
                      <th className="p-3 text-right">CGST</th>
                      <th className="p-3 text-right">SGST</th>
                      <th className="p-3 text-right">IGST</th>
                    </tr>
                  </thead>

                  <tbody>
                    {calculations.taxGroups.map((group, index) => (
                      <tr
                        key={`${group.hsn}-${group.gst}-${index}`}
                        className="border-b border-slate-100"
                      >
                        <td className="p-3">
                          {group.hsn || "-"}
                        </td>

                        <td className="p-3 text-right">
                          {group.gst}%
                        </td>

                        <td className="p-3 text-right">
                          ₹{money(group.taxable)}
                        </td>

                        <td className="p-3 text-right">
                          ₹{money(group.cgst)}
                        </td>

                        <td className="p-3 text-right">
                          ₹{money(group.sgst)}
                        </td>

                        <td className="p-3 text-right">
                          ₹{money(group.igst)}
                        </td>
                      </tr>
                    ))}

                    <tr className="font-bold">
                      <td className="p-3" colSpan={2}>
                        Total
                      </td>

                      <td className="p-3 text-right">
                        ₹{money(calculations.taxableTotal)}
                      </td>

                      <td className="p-3 text-right">
                        ₹{money(calculations.cgst)}
                      </td>

                      <td className="p-3 text-right">
                        ₹{money(calculations.sgst)}
                      </td>

                      <td className="p-3 text-right">
                        ₹{money(calculations.igst)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Section>

            {message && (
              <div
                className={`rounded-xl p-4 text-sm ${
                  message.includes("successfully")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* BOTTOM ACTIONS */}

            <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-3 border-t border-slate-200 bg-white p-3 md:static md:rounded-2xl md:border md:p-4">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => s - 1)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold disabled:opacity-40"
              >
                Previous
              </button>

              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => {
                    setActiveStep((s) => s + 1);
                    setMessage("");
                  }}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Save & Continue
                </button>
              ) : (
                <button
                  disabled={loading}
                  onClick={generatePDF}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Download size={18} />

                  {loading
                    ? "Generating..."
                    : "Download PDF"}
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
