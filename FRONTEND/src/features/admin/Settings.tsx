import React, { useState } from 'react';
import AdminSidebar from '@components/AdminSidebar';

const settingsNavLinks = [
  { label: 'General', href: '#general', active: true },
  { label: 'Branding', href: '#branding', active: false },
  { label: 'AI Configuration', href: '#ai-config', active: false },
  { label: 'Notifications', href: '#notifications', active: false },
  { label: 'Security', href: '#security', active: false },
];

const colorAccents = [
  { color: '#2563eb', active: true },
  { color: '#10b981', active: false },
  { color: '#f59e0b', active: false },
  { color: '#8b5cf6', active: false },
];

const aiFeatures = [
  {
    id: 'ocr',
    title: 'Document OCR Processing',
    description: 'Automatically extract data from BOLs and invoices.',
    defaultOn: true,
  },
  {
    id: 'route',
    title: 'Predictive Route Mapping',
    description: 'Use AI to suggest alternative routes based on real-time traffic.',
    defaultOn: true,
  },
];

// Reusable Toggle component using Tailwind peer pattern
const Toggle: React.FC<{ id: string; defaultChecked?: boolean }> = ({ id, defaultChecked = false }) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        id={id}
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
    </label>
  );
};

const glassCardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
};

const inputClass = 'w-full h-12 px-4 rounded-[18px] bg-black/5 border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md transition-all outline-none';
const selectClass = 'w-full h-12 px-4 rounded-[18px] bg-black/5 border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface font-body-md transition-all outline-none appearance-none';
const labelClass = 'font-label-md text-label-md text-on-surface-variant uppercase tracking-wider';

const AdminSettings: React.FC = () => {
  return (
    <div className="bg-background text-on-background antialiased font-body-md overflow-hidden flex">
      {/* SideNavBar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen md:ml-[280px] w-full overflow-hidden bg-surface-container-lowest">
        {/* TopNavBar */}
        <header className="bg-surface/70 backdrop-blur-md border-b border-outline-variant/20 shadow-sm sticky top-0 z-40 flex justify-between items-center w-full px-container-padding py-stack-md max-w-[1600px]">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">SmartLog AI Operations Center</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden lg:block focus-within:ring-2 focus-within:ring-primary/50 rounded-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input
                className="w-64 h-10 pl-10 pr-4 rounded-full bg-surface-container-high border-none text-body-sm focus:ring-0 placeholder:text-on-surface-variant/50"
                placeholder="Search settings..."
                type="text"
              />
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-outline-variant/50 cursor-pointer">
              <img
                alt="Admin User Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHeDRJfW45PYYdCjeGMHa7Vd1ZQWzGNz6W29IexRfssz2ESmpD4d0g88fzwAvKqrv3fXjsUTehUG5MmjGzyhhYVDLXYf66CEzy3MukOvi07QQZKhEzzjp2mPcQUevq_CEBAaDipBU6aaK7sjMnpoNM9FZbabWWgHsDcgOapRdI6dl0tDOFryaltLm6dr3GtfvndQElSZCnm_7nQZziz54qIvRWW65IIlHr1R-tcQON7KHvF_7NBJ9SS4hqnQ09S2tGcRTGb9I5sEd4"
              />
            </div>
          </div>
        </header>

        {/* Scrollable Content Canvas */}
        <main className="flex-1 overflow-y-auto p-container-padding max-w-[1600px] w-full mx-auto pb-32">
          {/* Page Header */}
          <div className="mb-stack-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-surface">System Settings</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">Manage global configurations, integrations, and security policies.</p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-variant transition-colors font-body-sm text-body-sm font-medium">
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-surface-tint text-white shadow-lg hover:shadow-xl transition-all font-body-sm text-body-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Changes
              </button>
            </div>
          </div>

          {/* Settings Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-stack-lg items-start">
            {/* Left Jump Nav */}
            <div className="hidden lg:block lg:col-span-3 sticky top-6 space-y-1">
              {settingsNavLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className={
                    link.active
                      ? 'block px-4 py-3 rounded-lg font-body-sm text-body-sm text-primary font-semibold bg-primary/10 border-l-4 border-primary'
                      : 'block px-4 py-3 rounded-lg font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors border-l-4 border-transparent'
                  }
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Settings Forms */}
            <div className="lg:col-span-9 space-y-stack-lg">

              {/* General Settings */}
              <section id="general" className="rounded-xl p-stack-lg" style={glassCardStyle}>
                <h3 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant/20 pb-3 mb-6">
                  Company Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Company Name</label>
                    <input className={inputClass} type="text" defaultValue="Logistics Corp Intl." />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Support Email</label>
                    <input className={inputClass} type="email" defaultValue="support@logisticscorp.com" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className={labelClass}>HQ Address</label>
                    <input className={inputClass} type="text" defaultValue="100 Distribution Way, Port City, TX 75001" />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Timezone</label>
                    <select className={selectClass} defaultValue="UTC -06:00 (Central Time)">
                      <option>UTC -06:00 (Central Time)</option>
                      <option>UTC -05:00 (Eastern Time)</option>
                      <option>UTC -08:00 (Pacific Time)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Default Currency</label>
                    <select className={selectClass} defaultValue="USD ($)">
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Branding */}
              <section id="branding" className="rounded-xl p-stack-lg" style={glassCardStyle}>
                <h3 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant/20 pb-3 mb-6">
                  Branding
                </h3>
                <div className="flex flex-col sm:flex-row gap-8 items-start">
                  <div className="space-y-4">
                    <label className={`${labelClass} block`}>Current Brand Mark</label>
                    <div className="w-32 h-32 rounded-lg bg-surface-container-high border-2 border-dashed border-outline-variant/50 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                      <img
                        alt="Current Brand Logo"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida/ADBb0ugh-V9rtL5bcEC9vzIBFLC9Ds_RMVI7CGtJEdRy5T6BuNHRrlSw88QBlu40eKmXGS0-ISr07ZF-tQYMEU_CqU-ekoeJWxo7YUwbAQdILAMRhZIkXq26YLV20Odm3V7CAO1kKu1wFm032H3qTnJae37GUeCQh-70kN34ptqg9psMNPRcrhSCwbosFf65IInTA-CXiK0UlT4JQqKxN5ZgJ23tXlLy-POyjl3lX0XWt2jtsTemnBWotk8KRNqM"
                      />
                      <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-white">edit</span>
                      </div>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant/70 text-center w-32">400x400 PNG</p>
                  </div>

                  <div className="flex-1 space-y-6 w-full">
                    <div className="space-y-2">
                      <label className={labelClass}>Theme Preference</label>
                      <div className="flex gap-4">
                        {['Light', 'Dark', 'System'].map((theme) => (
                          <label key={theme} className="flex items-center gap-2 cursor-pointer">
                            <input
                              className="text-primary focus:ring-primary"
                              name="theme"
                              type="radio"
                              defaultChecked={theme === 'Light'}
                            />
                            <span className="font-body-md text-body-md text-on-surface">{theme}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={labelClass}>Primary Color Accent</label>
                      <div className="flex gap-3 items-center">
                        {colorAccents.map((c, i) => (
                          <button
                            key={i}
                            className={`w-8 h-8 rounded-full transition-all hover:ring-2 ring-offset-2`}
                            style={{
                              backgroundColor: c.color,
                              outline: c.active ? `2px solid ${c.color}` : 'none',
                              outlineOffset: c.active ? '2px' : '0',
                            }}
                          />
                        ))}
                        <button className="w-8 h-8 rounded-full bg-surface-container border border-dashed border-outline flex items-center justify-center">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* AI Configuration */}
              <section id="ai-config" className="rounded-xl p-stack-lg relative overflow-hidden" style={glassCardStyle}>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3 mb-6">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary-container">smart_toy</span>
                    AI Engine Configuration
                  </h3>
                  <span className="px-3 py-1 bg-gradient-to-r from-tertiary-container to-primary text-white font-label-md text-label-md rounded-full">
                    v2.4 Active
                  </span>
                </div>

                <div className="space-y-6">
                  {aiFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/30"
                    >
                      <div>
                        <h4 className="font-body-md text-body-md font-semibold text-on-surface">{feature.title}</h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{feature.description}</p>
                      </div>
                      <Toggle id={`${feature.id}-toggle`} defaultChecked={feature.defaultOn} />
                    </div>
                  ))}

                  <div className="space-y-2 mt-4">
                    <label className={`${labelClass} flex items-center justify-between`}>
                      Chatbot API Key
                      <a className="text-primary hover:underline lowercase normal-case font-body-sm" href="#">Manage Keys</a>
                    </label>
                    <div className="relative">
                      <input
                        className={`${inputClass} pr-12 font-mono`}
                        readOnly
                        type="password"
                        defaultValue="sk-logistics-ai-v2-89f89dsf89ds8f9"
                      />
                      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary">
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Security */}
              <section id="security" className="rounded-xl p-stack-lg" style={glassCardStyle}>
                <h3 className="font-headline-sm text-headline-sm text-on-surface border-b border-outline-variant/20 pb-3 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">security</span>
                  Security Policies
                </h3>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
                    <div>
                      <h4 className="font-body-md text-body-md font-semibold text-on-surface flex items-center gap-2">
                        Require Two-Factor Authentication (2FA)
                        <span className="w-2 h-2 rounded-full bg-error/20 inline-block ring-2 ring-error"></span>
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Enforce 2FA for all administrative accounts.</p>
                    </div>
                    <Toggle id="2fa-toggle" defaultChecked={true} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={labelClass}>Session Timeout</label>
                      <select className={selectClass} defaultValue="30 Minutes">
                        <option>15 Minutes</option>
                        <option>30 Minutes</option>
                        <option>1 Hour</option>
                        <option>4 Hours</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Password Expiry</label>
                      <select className={selectClass} defaultValue="90 Days">
                        <option>30 Days</option>
                        <option>90 Days</option>
                        <option>180 Days</option>
                        <option>Never</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
