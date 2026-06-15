import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Clock, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const ShippingQuotation: React.FC = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('express');
  const [shipmentData, setShipmentData] = useState<any>(null);

  useEffect(() => {
    const data = localStorage.getItem('shipmentData');
    setShipmentData(JSON.parse(data || '{}'));
  }, []);

  const deliveryOptions = [
    {
      id: 'economy',
      name: 'Economy',
      icon: Truck,
      estimatedDays: 3,
      price: 25000,
      description: 'Standard delivery in 3-5 days',
    },
    {
      id: 'express',
      name: 'Express',
      icon: Clock,
      estimatedDays: 1,
      price: 50000,
      description: 'Next day delivery guaranteed',
    },
    {
      id: 'sameday',
      name: 'Same Day',
      icon: Truck,
      estimatedDays: 0,
      price: 100000,
      description: 'Deliver today in 6 hours',
    },
  ];

  const handleConfirm = () => {
    const orderData = {
      ...shipmentData,
      deliveryType: selectedOption,
      shippingFee: deliveryOptions.find(o => o.id === selectedOption)?.price,
    };
    localStorage.setItem('orderData', JSON.stringify(orderData));
    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <Header scrollY={0} />
      <div className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Quotation</h1>
            <p className="text-gray-600 text-lg">Choose your preferred delivery option</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 sticky top-32">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Shipment Summary</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between pb-4 border-b border-gray-100">
                    <span className="text-gray-600">From:</span>
                    <span className="font-semibold text-gray-900">{shipmentData?.senderCity}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-100">
                    <span className="text-gray-600">To:</span>
                    <span className="font-semibold text-gray-900">{shipmentData?.receiverCity}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-gray-100">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-semibold text-gray-900">{shipmentData?.packageWeight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-semibold text-gray-900">{shipmentData?.packageSize}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {deliveryOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`relative p-6 rounded-2xl border-2 transition-all cursor-pointer transform hover:scale-105 ${
                      selectedOption === option.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg shadow-blue-600/30'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selectedOption === option.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">{option.name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                          {option.estimatedDays === 0 ? (
                            <p className="text-sm text-green-600 font-semibold mt-2">Deliver in 6 hours or less</p>
                          ) : (
                            <p className="text-sm text-gray-600 mt-2">Estimated delivery: {option.estimatedDays}-{option.estimatedDays + 2} days</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-gray-900">{(option.price / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-gray-500 mt-1">VND</p>
                      </div>
                    </div>
                    {selectedOption === option.id && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle size={24} className="text-blue-600" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-12">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Shield size={24} className="text-blue-600" />
              Insurance &amp; Services
            </h3>
            <div className="space-y-4">
              {[
                { label: 'Full Value Insurance', price: 5000, checked: true },
                { label: 'COD (Cash on Delivery)', price: 0, checked: false },
                { label: 'Signature Required', price: 0, checked: false },
              ].map((service, idx) => (
                <label key={idx} className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors">
                  <input type="checkbox" defaultChecked={service.checked} className="w-5 h-5 rounded" />
                  <span className="ml-4 flex-1 font-semibold text-gray-900">{service.label}</span>
                  {service.price > 0 && <span className="text-gray-600">+{(service.price / 1000).toFixed(0)}K VND</span>}
                </label>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white mb-8">
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Shipping Fee</span>
                <span className="font-semibold">{(deliveryOptions.find(o => o.id === selectedOption)?.price || 0) / 1000}K VND</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-90">Insurance</span>
                <span className="font-semibold">5,000 VND</span>
              </div>
              <div className="h-px bg-white/20"></div>
              <div className="flex justify-between text-lg">
                <span className="font-bold">Total</span>
                <span className="font-extrabold">{(deliveryOptions.find(o => o.id === selectedOption)?.price || 0) / 1000 + 5}K VND</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => navigate('/create-shipment')}
              className="px-8 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              Confirm &amp; Continue to Payment
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingQuotation;
