// src/App.tsx
import { Suspense, lazy } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";

const Catalog = lazy(() => import("./pages/Catalog"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div className="p-6">Cargando…</div>}>
        <Routes>
          <Route path="/" element={<Catalog />} />
          <Route path="/propiedad/:id" element={<PropertyDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
