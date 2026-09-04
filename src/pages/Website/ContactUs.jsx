import React from 'react';

export default function ContactUs() {
  return (
    <div className="py-20 px-8 text-center max-w-2xl mx-auto">
      <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Get in Touch</h1>
      <p className="text-lg text-slate-600 mb-8">Have questions about our transport ERP? Our team is here to help.</p>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-left">
        <p className="text-slate-700 font-medium mb-2">📧 Email: support@buddyfleets.com</p>
        <p className="text-slate-700 font-medium">📞 Helpline: +91 98765 43210</p>
      </div>
    </div>
  );
}