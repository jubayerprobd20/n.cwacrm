'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Calendar, Clock, Stethoscope, User, ShieldAlert, Award, Star, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClinicPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'settings' | 'appointments'>('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Clinic State
  const [clinicName, setClinicName] = useState('');
  const [clinicType, setClinicType] = useState('General Practice');
  const [clinicDescription, setClinicDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [mapLink, setMapLink] = useState('');

  // Timings State
  const [timings, setTimings] = useState<any[]>(
    DAYS_OF_WEEK.map(day => ({
      day_name: day,
      opening_time: '09:00',
      closing_time: '18:00',
      is_closed: day === 'Sunday',
      lunch_break_start: '13:00',
      lunch_break_end: '14:00'
    }))
  );

  // AI Settings State
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiTone, setAiTone] = useState('polite and empathetic');
  const [greetingMessage, setGreetingMessage] = useState('Welcome to our clinic! I am your AI assistant. How can I help you today?');
  const [afterHoursMessage, setAfterHoursMessage] = useState('Our clinic is currently closed, but you can still book an appointment for tomorrow.');

  // Doctors & Appointments State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Add Doctor Form State
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpec, setNewDocSpec] = useState('');
  const [newDocQual, setNewDocQual] = useState('');
  const [newDocFee, setNewDocFee] = useState('500');

  // Load All Clinic Data
  const loadData = async () => {
    setLoading(true);
    try {
      // Load Clinic
      const clinicRes = await fetch('/api/healthcare/clinic');
      const clinicData = await clinicRes.json();
      if (clinicRes.ok && clinicData.clinic) {
        setClinicName(clinicData.clinic.clinic_name || '');
        setClinicType(clinicData.clinic.clinic_type || 'General Practice');
        setClinicDescription(clinicData.clinic.clinic_description || '');
        setPhone(clinicData.clinic.phone || '');
        setWhatsapp(clinicData.clinic.whatsapp_number || '');
        setEmail(clinicData.clinic.email || '');
        setAddress(clinicData.clinic.address || '');
        setCity(clinicData.clinic.city || '');
        setState(clinicData.clinic.state || '');
        setPincode(clinicData.clinic.pincode || '');
        setMapLink(clinicData.clinic.google_map_link || '');

        if (clinicData.timings && clinicData.timings.length > 0) {
          setTimings(clinicData.timings);
        }
        if (clinicData.aiSettings) {
          setAiEnabled(clinicData.aiSettings.ai_enabled);
          setAiTone(clinicData.aiSettings.ai_tone);
          setGreetingMessage(clinicData.aiSettings.greeting_message || '');
          setAfterHoursMessage(clinicData.aiSettings.after_hours_message || '');
        }
      }

      // Load Doctors
      const docsRes = await fetch('/api/healthcare/doctors');
      const docsData = await docsRes.json();
      if (docsRes.ok) setDoctors(docsData.doctors || []);

      // Load Appointments
      const apptsRes = await fetch('/api/healthcare/appointments');
      const apptsData = await apptsRes.json();
      if (apptsRes.ok) setAppointments(apptsData.appointments || []);
    } catch {
      toast.error('Failed to load clinic information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveClinic = async () => {
    if (!clinicName.trim()) {
      toast.error('Clinic name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/healthcare/clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_name: clinicName,
          clinic_type: clinicType,
          clinic_description: clinicDescription,
          phone,
          whatsapp_number: whatsapp,
          email,
          address,
          city,
          state,
          pincode,
          google_map_link: mapLink,
          timings,
          aiSettings: {
            ai_enabled: aiEnabled,
            ai_tone: aiTone,
            greeting_message: greetingMessage,
            after_hours_message: afterHoursMessage
          }
        })
      });
      if (res.ok) {
        toast.success('Clinic configuration updated.');
        await loadData();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to save configuration.');
      }
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) return;

    try {
      const res = await fetch('/api/healthcare/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_name: newDocName,
          specialization: newDocSpec,
          qualification: newDocQual,
          consultation_fee: Number(newDocFee) || 0
        })
      });
      if (res.ok) {
        toast.success('Doctor added to roster.');
        setNewDocName('');
        setNewDocSpec('');
        setNewDocQual('');
        setNewDocFee('500');
        await loadData();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to add doctor.');
      }
    } catch {
      toast.error('Failed to connect to server.');
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      const res = await fetch(`/api/healthcare/doctors?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Doctor removed from roster.');
        await loadData();
      } else {
        toast.error('Failed to delete.');
      }
    } catch {
      toast.error('Delete failed.');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const res = await fetch(`/api/healthcare/appointments?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Appointment cancelled.');
        await loadData();
      } else {
        toast.error('Failed to cancel appointment.');
      }
    } catch {
      toast.error('Cancellation failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" /> Loading clinic details…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
            🏥 Clinic Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure doctors roster, operational hours, appointments, and conversational AI Assistant.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-4">
        {(['overview', 'doctors', 'settings', 'appointments'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-semibold capitalize transition-all border-b-2 ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Clinic Stats */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 col-span-2 space-y-4 p-6">
            <CardHeader className="p-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                {clinicName || 'My Healthcare Clinic'}
              </CardTitle>
              <CardDescription>{clinicType} • {city || 'Location Setup Pending'}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {clinicDescription || 'No description provided yet. Update in Clinic Settings tab.'}
              </p>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30">
                <div>
                  <span className="text-xs text-muted-foreground block">Active Doctor Roster</span>
                  <span className="text-xl font-bold">{doctors.length} Doctors</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Scheduled Appointments</span>
                  <span className="text-xl font-bold text-primary">
                    {appointments.filter(a => a.status === 'scheduled').length} Bookings
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 p-6 space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Clinic Timings
            </CardTitle>
            <div className="space-y-2">
              {timings.map(t => (
                <div key={t.day_name} className="flex justify-between text-xs py-1 border-b border-border/20 last:border-0">
                  <span className="font-medium">{t.day_name}</span>
                  <span className={t.is_closed ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                    {t.is_closed ? 'Closed' : `${t.opening_time} - ${t.closing_time}`}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'doctors' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Doctor Add Form */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 p-6 h-fit">
            <CardTitle className="text-base mb-4">Add Doctor to Roster</CardTitle>
            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Doctor Name</Label>
                <Input id="doc-name" value={newDocName} onChange={e => setNewDocName(e.target.value)} placeholder="Dr. Jane Smith" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-spec">Specialization</Label>
                <Input id="doc-spec" value={newDocSpec} onChange={e => setNewDocSpec(e.target.value)} placeholder="Cardiologist, Pediatrician" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-qual">Qualifications</Label>
                <Input id="doc-qual" value={newDocQual} onChange={e => setNewDocQual(e.target.value)} placeholder="MD, MBBS" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-fee">Consultation Fee (৳)</Label>
                <Input id="doc-fee" type="number" value={newDocFee} onChange={e => setNewDocFee(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Doctor
              </Button>
            </form>
          </Card>

          {/* Roster List */}
          <div className="col-span-2 space-y-4">
            <h3 className="text-md font-bold">On-Duty Doctors</h3>
            {doctors.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted/20 border border-border/40 rounded-lg p-6 text-center">
                No doctors added yet. Use the form to setup your clinic roster.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {doctors.map(doc => (
                  <Card key={doc.id} className="backdrop-blur-md bg-card/60 border-border/50 p-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold text-sm">{doc.doctor_name}</h4>
                        </div>
                        <button onClick={() => handleDeleteDoctor(doc.id)} className="text-destructive hover:bg-destructive/10 p-1 rounded-md">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{doc.specialization} ({doc.qualification})</p>
                      <div className="flex items-center gap-1 text-xs text-primary font-medium">
                        <Star className="h-3.5 w-3.5 fill-primary" /> Consultation Fee: ৳{doc.consultation_fee}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6">
          <Card className="backdrop-blur-md bg-card/60 border-border/50 p-6 space-y-4">
            <CardTitle className="text-base">Clinic Configuration</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Clinic Name</Label>
                <Input value={clinicName} onChange={e => setClinicName(e.target.value)} placeholder="Acme Healthcare Clinic" />
              </div>
              <div className="space-y-2">
                <Label>Specialty Type</Label>
                <Input value={clinicType} onChange={e => setClinicType(e.target.value)} placeholder="Multispeciality Clinic" />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="011-XXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number for AI</Label>
                <Input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="91XXXXXXXXXX" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Clinic Bio/Description</Label>
                <Textarea value={clinicDescription} onChange={e => setClinicDescription(e.target.value)} placeholder="Brief introduction of clinic..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={city} onChange={e => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={state} onChange={e => setState(e.target.value)} />
              </div>
            </div>
          </Card>

          {/* AI Booking Assistant Panel */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-5 w-5 text-primary fill-primary" /> AI Healthcare Assistant Config
              </CardTitle>
              <CardDescription>
                Customize how your automated AI assistant books clinic visits on WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div>
                  <Label className="font-semibold block">Enable Clinic AI Booking Agent</Label>
                  <span className="text-xs text-muted-foreground">Auto-handles appointment requests on WhatsApp</span>
                </div>
                <Input type="checkbox" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} className="w-6 h-6 border-primary" />
              </div>

              <div className="space-y-2">
                <Label>Assistant Tone/Personality</Label>
                <Input value={aiTone} onChange={e => setAiTone(e.target.value)} placeholder="polite, empathetic, and professional" />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Greeting Message</Label>
                <Textarea value={greetingMessage} onChange={e => setGreetingMessage(e.target.value)} rows={2} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveClinic} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Clinic Settings
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'appointments' && (
        <Card className="backdrop-blur-md bg-card/60 border-border/50 p-6">
          <CardTitle className="text-base mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Booked Appointments Log
          </CardTitle>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              No appointments booked yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2">Patient</th>
                    <th className="py-2">Contact</th>
                    <th className="py-2">Doctor</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Time</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt.id} className="border-b border-border/40 hover:bg-muted/10">
                      <td className="py-3 font-medium">{appt.patient_name || appt.contact?.name || 'Patient'}</td>
                      <td className="py-3">{appt.contact?.phone || 'No Phone'}</td>
                      <td className="py-3">{appt.doctor?.doctor_name || 'General O.P.D'}</td>
                      <td className="py-3">{appt.appointment_date}</td>
                      <td className="py-3">{appt.appointment_time}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          appt.status === 'scheduled'
                            ? 'bg-primary/20 text-primary border border-primary/30'
                            : 'bg-destructive/20 text-destructive border border-destructive/30'
                        }`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {appt.status === 'scheduled' && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancelAppointment(appt.id)} className="text-destructive hover:bg-destructive/10">
                            Cancel
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
