'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Plus, Users, ShoppingBag, FolderOpen, Mail, Phone, MapPin, Globe, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'enquiries'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Business Profile States
  const [name, setName] = useState('');
  const [type, setType] = useState('agency');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [institutionType, setInstitutionType] = useState('');

  // Services, Staff, Enquiries lists
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);

  // Add Service Form
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcPrice, setNewSvcPrice] = useState('');
  const [newSvcDesc, setNewSvcDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/business/profile');
      const data = await res.json();
      if (res.ok && data.profile) {
        setName(data.profile.business_name || '');
        setType(data.profile.business_type || 'agency');
        setPhone(data.profile.phone || '');
        setWhatsapp(data.profile.whatsapp_number || '');
        setEmail(data.profile.email || '');
        setWebsite(data.profile.website || '');
        setAddress(data.profile.address || '');
        setCity(data.profile.city || '');
        setState(data.profile.state || '');
        setPincode(data.profile.pincode || '');
        setDescription(data.profile.description || '');
        setPropertyType(data.profile.property_type || '');
        setInstitutionType(data.profile.institution_type || '');

        setServices(data.services || []);
        setStaff(data.staff || []);
      }

      // Load Enquiries
      const enquiriesRes = await fetch('/api/business/enquiries');
      const enquiriesData = await enquiriesRes.json();
      if (enquiriesRes.ok) {
        setEnquiries(enquiriesData.enquiries || []);
      }
    } catch {
      toast.error('Failed to load business profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Business name is required.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/business/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: name,
          business_type: type,
          phone,
          whatsapp_number: whatsapp,
          email,
          website,
          address,
          city,
          state,
          pincode,
          description,
          property_type: propertyType,
          institution_type: institutionType
        })
      });
      if (res.ok) {
        toast.success('Business profile updated.');
        await loadData();
      } else {
        const d = await res.json();
        toast.error(d.error || 'Failed to save.');
      }
    } catch {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEnquiry = async (id: string) => {
    try {
      const res = await fetch(`/api/business/enquiries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Enquiry/Lead cancelled.');
        await loadData();
      } else {
        toast.error('Failed to delete enquiry.');
      }
    } catch {
      toast.error('Deletion failed.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" /> Loading business profile…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            💼 Business Suite
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your white-label business details, catalog of services, staff directory, and inquiries.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-4">
        {(['profile', 'services', 'enquiries'] as const).map(tab => (
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
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card className="backdrop-blur-md bg-card/60 border-border/50 p-6 space-y-4">
            <CardTitle className="text-base">Business Details</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Acme Agency LLC" />
              </div>
              <div className="space-y-2">
                <Label>Industry Sector</Label>
                <Select value={type} onValueChange={v => setType(v || 'agency')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agency">Agency / Consultancy</SelectItem>
                    <SelectItem value="hotel">Hotels & Hospitality</SelectItem>
                    <SelectItem value="education">Education & Coaching</SelectItem>
                    <SelectItem value="retail">Retail / E-commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === 'hotel' && (
                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Input value={propertyType} onChange={e => setPropertyType(e.target.value)} placeholder="Resort, Boutique Hotel" />
                </div>
              )}

              {type === 'education' && (
                <div className="space-y-2">
                  <Label>Institution Type</Label>
                  <Input value={institutionType} onChange={e => setInstitutionType(e.target.value)} placeholder="Coaching Center, School" />
                </div>
              )}

              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880 1XXXXXXXXX" />
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://mybusiness.com" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Business Bio/Description</Label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Write a short description..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={city} onChange={e => setCity(e.target.value)} />
              </div>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Profile Details
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Add Service Card */}
          <Card className="backdrop-blur-md bg-card/60 border-border/50 p-6 h-fit space-y-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Add Catalog Item
            </CardTitle>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Item Name</Label>
                <Input value={newSvcName} onChange={e => setNewSvcName(e.target.value)} placeholder="Premium Suite Booking" />
              </div>
              <div className="space-y-1">
                <Label>Pricing (BDT)</Label>
                <Input value={newSvcPrice} onChange={e => setNewSvcPrice(e.target.value)} placeholder="4999" />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={newSvcDesc} onChange={e => setNewSvcDesc(e.target.value)} placeholder="Item details..." rows={2} />
              </div>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Catalog Item
              </Button>
            </div>
          </Card>

          {/* Catalog List */}
          <div className="col-span-2 space-y-4">
            <h3 className="text-md font-bold">Catalog Items</h3>
            {services.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-muted/20 border border-border/40 rounded-lg p-6 text-center">
                Your catalog is currently empty. Use the form to add items.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map(svc => (
                  <Card key={svc.id} className="backdrop-blur-md bg-card/60 border-border/50 p-4">
                    <h4 className="font-semibold text-sm">{svc.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{svc.description || 'No description'}</p>
                    <div className="mt-3 text-xs text-primary font-bold">
                      Price: ৳{svc.price}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'enquiries' && (
        <Card className="backdrop-blur-md bg-card/60 border-border/50 p-6">
          <CardTitle className="text-base mb-4 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" /> Incoming Business Enquiries & Leads
          </CardTitle>
          {enquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              No enquiries received yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2">Client Name</th>
                    <th className="py-2">Contact Info</th>
                    <th className="py-2">Enquiry Category</th>
                    <th className="py-2">Details / Notes</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiries.map(enq => (
                    <tr key={enq.id} className="border-b border-border/40 hover:bg-muted/10">
                      <td className="py-3 font-medium">{enq.contact_name || enq.contact?.name || 'Lead'}</td>
                      <td className="py-3">{enq.contact_phone}</td>
                      <td className="py-3">
                        <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md text-xs font-semibold">
                          {enq.enquiry_type}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground truncate max-w-[200px]">{enq.notes || '-'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          enq.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-primary/20 text-primary border border-primary/30'
                        }`}>
                          {enq.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <Button variant="ghost" size="sm" onClick={() => handleCancelEnquiry(enq.id)} className="text-destructive hover:bg-destructive/10">
                          Cancel
                        </Button>
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
