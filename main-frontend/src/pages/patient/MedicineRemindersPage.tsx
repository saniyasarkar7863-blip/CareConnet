import React, { useState, useEffect } from 'react';
import { Clock, Plus, Check, CheckCircle2, Bell, BellOff, Trash2, Calendar, Pill, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { reminderService } from '../../services/reminderService';
import { MedicineReminder } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { Modal } from '../../components/common/Modal';

export function MedicineRemindersPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [reminders, setReminders] = useState<MedicineReminder[]>([]);
  const [loading, setLoading] = useState(true);

  // New Reminder Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('500 mg');
  const [timesPerDay, setTimesPerDay] = useState<number>(2);
  const [time1, setTime1] = useState('08:30 AM');
  const [time2, setTime2] = useState('08:30 PM');
  const [duration, setDuration] = useState('14 days');
  const [instructions, setInstructions] = useState('Take after food with water');

  const loadReminders = async () => {
    if (!user) return;
    const list = await reminderService.getRemindersByPatient(user.associatedId || 'pat_1');
    setReminders(list);
    setLoading(false);
  };

  useEffect(() => {
    loadReminders();
  }, [user]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await reminderService.toggleReminderActive(id, !currentStatus);
      showToast(
        !currentStatus ? 'Reminder Activated' : 'Reminder Paused',
        'info',
        !currentStatus ? 'Daily alerts resumed.' : 'Alert notifications paused.'
      );
      loadReminders();
    } catch {
      showToast('Error updating reminder', 'error');
    }
  };

  const handleToggleDose = async (id: string, doseIndex: number) => {
    try {
      await reminderService.toggleTakenDose(id, doseIndex);
      loadReminders();
      showToast('Dose Status Updated', 'success', 'Daily adherence logged.');
    } catch {
      showToast('Error logging dose', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await reminderService.deleteReminder(id);
      showToast('Reminder Removed', 'info', 'Medication deleted from active schedule');
      loadReminders();
    } catch {
      showToast('Error deleting reminder', 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName) return;

    const scheduledTimes = timesPerDay === 1 ? [time1] : [time1, time2];

    try {
      await reminderService.createReminder({
        patientId: user?.associatedId || 'pat_1',
        medicineName: medName,
        dosage,
        timesPerDay,
        scheduledTimes,
        frequency: timesPerDay === 1 ? 'Once Daily' : 'Twice Daily',
        duration,
        instructions,
        isActive: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '2026-12-31',
      });

      showToast('New Reminder Configured', 'success', `Scheduled daily alert for ${medName}`);
      setModalOpen(false);
      setMedName('');
      loadReminders();
    } catch {
      showToast('Error creating reminder', 'error');
    }
  };

  // Compute adherence
  const totalDoses = reminders.reduce((acc, curr) => acc + curr.scheduledTimes.length, 0);
  const takenDoses = reminders.reduce((acc, curr) => acc + curr.takenToday.filter(Boolean).length, 0);
  const adherenceRate = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  if (loading) {
    return (
      <div className="py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Medicine Reminders & Adherence</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated medication schedules linked directly with doctor prescriptions
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Custom Reminder</span>
        </button>
      </div>

      {/* Adherence Scorecard */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[11px] font-semibold text-teal-800 uppercase tracking-wider">
            Daily Adherence Metric
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            {takenDoses} of {totalDoses} doses taken today
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Adherence rate: <strong className="text-teal-800 font-mono">{adherenceRate}%</strong>. Keeping to prescribed schedules reduces relapse risks.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span>Today's Completion</span>
            <span className="font-mono">{adherenceRate}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-700 rounded-full transition-all duration-300"
              style={{ width: `${adherenceRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reminders.map(rem => {
          return (
            <div
              key={rem.id}
              className={`p-5 rounded-2xl border transition-all bg-white shadow-xs ${
                rem.isActive ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-100">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{rem.medicineName}</h3>
                    <p className="text-xs text-slate-600 font-medium mt-0.5 font-mono">{rem.dosage}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{rem.instructions}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(rem.id, rem.isActive)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      rem.isActive
                        ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                        : 'bg-slate-100 text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                    title={rem.isActive ? 'Pause Reminder' : 'Resume Reminder'}
                  >
                    {rem.isActive ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDelete(rem.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove Reminder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scheduled Doses Tracker */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                  Today's Dose Checkpoints
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {rem.scheduledTimes.map((time, idx) => {
                    const isTaken = rem.takenToday[idx];
                    return (
                      <button
                        key={time}
                        onClick={() => handleToggleDose(rem.id, idx)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isTaken
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-xs font-bold block">{time}</span>
                          <span className="text-[10px] text-slate-500 block">
                            {isTaken ? '✓ Taken' : 'Tap to mark taken'}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isTaken
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isTaken && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400">
                <span>Duration: {rem.duration}</span>
                <span>{rem.frequency}</span>
              </div>
            </div>
          );
        })}
      </div>

      {reminders.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
          No medication reminders scheduled. You can add one or sync from your prescriptions.
        </div>
      )}

      {/* Add Reminder Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Medication Reminder"
        subtitle="Schedule automated alerts for your daily prescription doses"
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medicine Name *
            </label>
            <input
              type="text"
              required
              value={medName}
              onChange={e => setMedName(e.target.value)}
              placeholder="e.g. Metformin / Amlodipine"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dosage / Strength</label>
              <input
                type="text"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
                placeholder="500 mg"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Times per Day</label>
              <select
                value={timesPerDay}
                onChange={e => setTimesPerDay(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30 bg-white"
              >
                <option value={1}>Once Daily (1 dose)</option>
                <option value={2}>Twice Daily (2 doses)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dose 1 Time</label>
              <input
                type="text"
                value={time1}
                onChange={e => setTime1(e.target.value)}
                placeholder="08:30 AM"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-600/30"
              />
            </div>
            {timesPerDay === 2 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dose 2 Time</label>
                <input
                  type="text"
                  value={time2}
                  onChange={e => setTime2(e.target.value)}
                  placeholder="08:30 PM"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-teal-600/30"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Notes</label>
            <input
              type="text"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="e.g. Take immediately after breakfast"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600/30"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-4 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
