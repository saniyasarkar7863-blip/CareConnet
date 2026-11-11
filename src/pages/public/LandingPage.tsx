import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  FileText,
  ShieldCheck,
  Pill,
  Clock,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Building2,
  ClipboardList,
  Sparkles,
  UserCheck,
  Send,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { SpringNotice } from '../../components/common/SpringNotice';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export function LandingPage() {
  const { showToast } = useNotification();
  const { switchDemoRole } = useAuth();

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('Patient');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    setIsSubmittingContact(true);
    setTimeout(() => {
      setIsSubmittingContact(false);
      showToast('Inquiry sent successfully', 'success', 'Our clinical solutions team will respond shortly.');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SpringNotice />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-600" />
                <span>Next-Gen Healthcare Management Ecosystem</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]" style={{ textWrap: 'balance' }}>
                Connected healthcare for patients, doctors, and clinics.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                CareConnect centralizes clinical workflows from appointment scheduling and pre-consultation symptom intake to interactive doctor workspaces, digital prescriptions, and automated medicine reminders.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-sm transition-colors"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
                >
                  <span>Explore Workflow</span>
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-slate-200/70 flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Role-Based Access Control</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Spring Boot REST Ready</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Digital Prescription Standards</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Clinical Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                      CC
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">CareConnect Clinical Desk</p>
                      <p className="text-[10px] text-slate-400">Live Consultation & Intake View</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                    STATUS: ACTIVE
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Doctor badge & Patient info */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Assigned Specialist
                      </span>
                      <p className="text-sm font-bold text-slate-900">Dr. Priya Nair</p>
                      <p className="text-xs text-slate-500">Cardiology · Apex Metro Healthcare</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                        Patient
                      </span>
                      <p className="text-sm font-semibold text-slate-900">Aarav Sharma (34M)</p>
                      <span className="text-[11px] text-teal-700 font-medium">B+ Blood Group</span>
                    </div>
                  </div>

                  {/* Pre-consultation pill summary */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <ClipboardList className="w-3.5 h-3.5 text-teal-600" />
                        Pre-Consultation Intake
                      </span>
                      <span className="text-[11px] text-teal-700 font-semibold">Verified</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      Chief Complaint: Mild evening headache · BP: 132/84 mmHg · Allergy: Penicillin
                    </p>
                  </div>

                  {/* Interactive Prescription Preview Row */}
                  <div className="p-3 rounded-xl border border-teal-100 bg-teal-50/50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-teal-900 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-teal-700" />
                        Active Prescription (Rx)
                      </span>
                      <span className="font-mono text-[10px] text-teal-800">#RX-301</span>
                    </div>
                    <p className="text-[11px] text-teal-900/80 mt-1">
                      Telmisartan 40mg · Daily Morning · Scheduled Reminder Active
                    </p>
                  </div>

                  {/* Quick switch launchpad buttons */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => switchDemoRole('patient')}
                      className="flex-1 py-2 text-center text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors"
                    >
                      Enter as Patient
                    </button>
                    <button
                      onClick={() => switchDemoRole('doctor')}
                      className="flex-1 py-2 text-center text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                    >
                      Enter as Doctor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Platform Benefits Section */}
      <section id="benefits" className="py-16 sm:py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block mb-1">
              Core Clinical Value
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Built to eliminate healthcare fragmentation
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              CareConnect removes friction across the entire continuum of patient care through five synchronized clinical modules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Simplified Appointments</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Filter by clinic, specialty, and verified slots with real-time confirmation and reschedule capabilities.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Digital Health Profiles</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Persistent medical history, allergies, chronic conditions, and authorized lab reports accessible across consults.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <ClipboardList className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Pre-Consultation Intake</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Patients report symptoms, duration, and vitals before the visit so doctors review full context in advance.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <Pill className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Digital Prescriptions</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Structured digital Rx with precise dosage, frequency, food timings, and licensed practitioner signatures.
              </p>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 hover:border-teal-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Medicine Reminders</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Daily dosage schedules generated straight from doctor prescriptions with adherence checkboxes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block mb-1">
              Linear Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              How CareConnect connects your care
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              From registration to post-consultation adherence, experience a seamless five-step digital journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 relative">
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-block mb-3">
                01. Register
              </span>
              <h3 className="text-sm font-bold text-slate-900">Create Profile</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Sign up as Patient, Doctor, or Clinic with verified medical credentials and emergency contacts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 relative">
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-block mb-3">
                02. Discover
              </span>
              <h3 className="text-sm font-bold text-slate-900">Find Doctor & Clinic</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Search accredited specialists by department, qualification, clinic location, and fee structure.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 relative">
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-block mb-3">
                03. Schedule
              </span>
              <h3 className="text-sm font-bold text-slate-900">Book & Submit Intake</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Choose convenient time slots and fill the pre-consultation symptom questionnaire prior to arrival.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 relative">
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-block mb-3">
                04. Consult
              </span>
              <h3 className="text-sm font-bold text-slate-900">Doctor Consultation</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Doctor reviews symptoms, enters clinical observations, diagnostic findings, and treatment plan.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 relative">
              <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 inline-block mb-3">
                05. Prescribe
              </span>
              <h3 className="text-sm font-bold text-slate-900">Rx & Reminders</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Instant digital prescription generation and automated daily medicine reminder schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-16 sm:py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block mb-1">
              Enterprise Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Purpose-built tools for every stakeholder
            </h2>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Role-tailored dashboards and secure permission boundaries for Patients, Physicians, and Clinic Administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center mb-5">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Patient Health Central</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Patients maintain a lifelong health record including blood group, emergency contacts, allergy alerts, and categorized lab documents with strict doctor access controls.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>One-click doctor slot booking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Digital report archive & download</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Active prescription adherence tracker</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-5">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Doctor Clinical Workspace</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Streamlined consultation workspace for recording clinical findings, reviewing pre-submitted patient symptoms, and issuing legally structured digital prescriptions.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Interactive digital Rx builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Multi-clinic practice affiliation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Patient history & report access</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Clinic Management Portal</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Centralized facility oversight for managing practitioner memberships, daily appointment flows, departmental shifts, and operational clinic analytics.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Doctor affiliation & roster overview</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Daily clinic consultation queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Privacy-hardened staff boundaries</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Healthcare Statistics Section (Clearly identified illustrative/demo metrics) */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider block mb-1">
              Platform Metrics
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Demonstrated scale and clinical reliability
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              (Illustrative Phase 1 simulation metrics for evaluation)
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <p className="text-3xl font-extrabold text-teal-400 tabular-nums">14,800+</p>
              <p className="text-xs font-medium text-slate-300 mt-1">Consultations Coordinated</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Across multi-specialty OPDs</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <p className="text-3xl font-extrabold text-teal-400 tabular-nums">99.2%</p>
              <p className="text-xs font-medium text-slate-300 mt-1">On-Time Slot Adherence</p>
              <p className="text-[11px] text-slate-500 mt-0.5">With pre-consultation intake</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <p className="text-3xl font-extrabold text-teal-400 tabular-nums">320+</p>
              <p className="text-xs font-medium text-slate-300 mt-1">Verified Medical Specialists</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Cardiology, General, Pediatrics, Ortho</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-800">
              <p className="text-3xl font-extrabold text-teal-400 tabular-nums">4.9 / 5</p>
              <p className="text-xs font-medium text-slate-300 mt-1">Patient Experience Score</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Rated by active patients</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block">
                Academic & Enterprise Roots
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Engineered as a B.Tech CSE Major Project with production standards
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                CareConnect was conceptualized to address the critical breakdown between patient self-reporting, doctor examination records, and post-visit medication adherence.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Designed with a strict separation of concerns, the frontend is paired with an API service layer ready for deployment with a <strong>Java 21 Spring Boot</strong> backend, backed by <strong>Oracle Database</strong> relational integrity and <strong>JUnit 5 / Mockito</strong> test suites.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-medium">React 19 & Vite</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-medium">Tailwind CSS</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-medium">Spring Boot 3.x REST</span>
                <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-medium">Oracle Database 19c+</span>
              </div>
            </div>

            <div className="lg:col-span-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Architectural Highlights</h3>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3 bg-white rounded-lg border border-slate-200/70">
                  <strong className="text-slate-900 block mb-0.5">Strict Role Boundaries</strong>
                  Patients cannot inspect clinical queues; doctors only access authorized medical records; clinics only monitor departmental operational metadata.
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200/70">
                  <strong className="text-slate-900 block mb-0.5">Closed-Loop Prescription Adherence</strong>
                  Prescriptions authored by licensed doctors automatically generate medication reminders for patients without manual re-entry.
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200/70">
                  <strong className="text-slate-900 block mb-0.5">Pre-Consultation Clinical Intake</strong>
                  Minimizes consultation latency by gathering structured symptom timelines and baseline vitals prior to face-to-face visits.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider block mb-1">
              Get in Touch
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Connect with the CareConnect team
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              Inquire about clinic integration, practitioner onboarding, or academic project demonstration.
            </p>
          </div>

          <div className="max-w-xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="e.g. Dr. Rohan Kapoor"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="name@clinic.org"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Healthcare Role</label>
                <select
                  value={contactRole}
                  onChange={e => setContactRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 bg-white"
                >
                  <option value="Patient">Patient / Family Member</option>
                  <option value="Doctor">Medical Practitioner / Specialist</option>
                  <option value="Clinic">Clinic Administrator / Hospital Director</option>
                  <option value="Evaluator">Academic Faculty / Evaluator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Inquiry *</label>
                <textarea
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  placeholder="Tell us about your clinic setup or request an interactive demonstration..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingContact}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                {isSubmittingContact ? (
                  <span>Sending message...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
