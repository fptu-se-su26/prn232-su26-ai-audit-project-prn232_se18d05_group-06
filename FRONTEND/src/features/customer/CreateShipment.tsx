import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, User, Phone, Mail, ArrowRight } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const CreateShipment: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    // Sender
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    senderCity: '',
    // Receiver
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    receiverCity: '',
    // Package
    packageWeight: '',
    packageSize: '',
    packageDescription: '',
    packageValue: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save shipment data to localStorage
    localStorage.setItem('shipmentData', JSON.stringify(formData));
    navigate('/create-order');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header scrollY={0} />
      <div className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-8">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 mb-4">
              <Package size={16} className="text-blue-600" />
              <span className="text-blue-600 text-sm font-semibold">Create New Shipment</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Send Package</h1>
            <p className="text-gray-600 text-lg">Fill in the details to calculate shipping fees</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Sender Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  1
                </div>
                Sender Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.senderPhone}
                    onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="+84 912 345 678"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.senderAddress}
                    onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.senderCity}
                    onChange={(e) => setFormData({ ...formData, senderCity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Ho Chi Minh"
                  />
                </div>
              </div>
            </div>

            {/* Receiver Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold">
                  2
                </div>
                Receiver Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Receiver name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.receiverPhone}
                    onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="+84 912 345 678"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Address</label>
                  <input
                    type="text"
                    value={formData.receiverAddress}
                    onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.receiverCity}
                    onChange={(e) => setFormData({ ...formData, receiverCity: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="Da Nang"
                  />
                </div>
              </div>
            </div>

            {/* Package Information */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                  3
                </div>
                Package Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.packageWeight}
                    onChange={(e) => setFormData({ ...formData, packageWeight: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Size</label>
                  <select
                    value={formData.packageSize}
                    onChange={(e) => setFormData({ ...formData, packageSize: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  >
                    <option>Small (&lt; 500g)</option>
                    <option>Medium (500g - 2kg)</option>
                    <option>Large (2kg - 10kg)</option>
                    <option>Extra Large (&gt; 10kg)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.packageDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, packageDescription: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="What's inside?"
                    rows={3}
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Package Value (VND)
                  </label>
                  <input
                    type="number"
                    value={formData.packageValue}
                    onChange={(e) => setFormData({ ...formData, packageValue: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                    placeholder="100,000"
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                Calculate Shipping Fee
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CreateShipment;
