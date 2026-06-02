import React, { useState } from 'react';
import { Download, CreditCard, Calendar, DollarSign } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const PaymentHistory: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('all');

  const payments = [
    { id: 'PAY001', date: '2024-05-25', description: 'Shipment SLABCD12345', amount: 50000, status: 'completed', method: 'Credit Card' },
    { id: 'PAY002', date: '2024-05-20', description: 'Shipment SLXYZ98765', amount: 35000, status: 'completed', method: 'Bank Transfer' },
    { id: 'PAY003', date: '2024-05-15', description: 'Shipment SLPQR54321', amount: -45000, status: 'refunded', method: 'Credit Card' },
  ];

  const filteredPayments = payments.filter((p) => filterStatus === 'all' || p.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header scrollY={0} />
      <div className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment History</h1>
            <p className="text-gray-600 text-lg">Track all your transactions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <DollarSign size={16} /> Total Spent
              </p>
              <p className="text-3xl font-bold text-gray-900">195,000</p>
              <p className="text-xs text-gray-500 mt-2">VND</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <CreditCard size={16} /> Total Transactions
              </p>
              <p className="text-3xl font-bold text-gray-900">3</p>
              <p className="text-xs text-gray-500 mt-2">Payments</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <DollarSign size={16} /> Refunded
              </p>
              <p className="text-3xl font-bold text-red-600">45,000</p>
              <p className="text-xs text-gray-500 mt-2">VND</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex gap-2">
              {['all', 'completed', 'refunded'].map((status) => (
                <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  filterStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Payment ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Method</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{payment.id}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{payment.description}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{payment.method}</td>
                      <td className={`px-6 py-4 font-bold text-right ${
                        payment.amount > 0 ? 'text-gray-900' : 'text-red-600'
                      }`}>
                        {payment.amount > 0 ? '+' : ''}{(payment.amount / 1000).toFixed(0)}K VND
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentHistory;
