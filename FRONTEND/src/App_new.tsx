import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CustomerLandingPage from './features/customer/CustomerLandingPage';
import AuthPage from './features/auth/AuthPage';
import CreateOrder from './features/customer/CreateOrder';
import ShippingQuotation from './features/customer/ShippingQuotation';
import OrderSuccess from './features/customer/OrderSuccess';
import OrderTracking from './features/customer/OrderTracking';
import OrderHistory from './features/customer/OrderHistory';
import CustomerProfile from './features/customer/CustomerProfile';
import Settings from './features/customer/Settings';
import PaymentHistory from './features/customer/PaymentHistory';
import SupportChat from './features/support/SupportChat';
import VoucherCenter from './features/voucher/VoucherCenter';

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<CustomerLandingPage />} />

        {/* Auth */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />

        {/* Create Shipment Flow */}
        <Route path="/create-shipment" element={<CreateOrder />} />
        <Route path="/shipping-quotation" element={<ShippingQuotation />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Tracking */}
        <Route path="/tracking" element={<OrderTracking />} />

        {/* Customer Account */}
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/payment-history" element={<PaymentHistory />} />

        {/* Support */}
        <Route path="/support" element={<SupportChat />} />
        <Route path="/support-chat" element={<SupportChat />} />

        {/* Voucher */}
        <Route path="/voucher-center" element={<VoucherCenter />} />
      </Routes>
    </Router>
  );
}

export default App;
