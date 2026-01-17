'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Service } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { API_URL } from '@/lib/api';

import CustomServiceSelector from './CustomServiceSelector';
import CustomDateTimePicker from './CustomDateTimePicker';
import { filterNama, filterNomor } from '@/lib/input-helpers';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';


interface BookingFormProps {
    services: Service[];
}

export default function BookingForm({ services }: BookingFormProps) {
    const router = useRouter();

    // State dasar untuk form pemesanan
    const [selectedServiceId, setSelectedServiceId] = useState<string>(() => {
        return (services && services.length > 0) ? services[0].id : '';
    });

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedBookingTime, setSelectedBookingTime] = useState<Date | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);

    const isMounted = useRef(false);
    useEffect(() => {
        isMounted.current = true;
    }, []);

    // Sinkronisasi ID layanan jika data props services berubah
    useEffect(() => {
        if (!isMounted.current) return;

        if (!services || services.length === 0) {
            if (selectedServiceId !== '') setSelectedServiceId('');
            return;
        }

        const currentServiceExists = services.some(s => s.id === selectedServiceId);
        if (!selectedServiceId || !currentServiceExists) {
            const firstServiceId = services[0]?.id || '';
            if (selectedServiceId !== firstServiceId) {
                setSelectedServiceId(firstServiceId);
            }
        }
    }, [services, selectedServiceId]);

    /**
     * Mengirim data booking ke API backend.
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!customerName || !customerPhone || !selectedServiceId || !selectedBookingTime) {
            toast.error('Please complete all booking details.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName,
                    customerPhone,
                    serviceId: selectedServiceId,
                    bookingTime: selectedBookingTime.toISOString(), 
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                const errorMsg = response.status === 409 
                    ? 'Booking slot conflict. Please choose another time.' 
                    : (responseData.message || 'An error occurred.');
                toast.error(errorMsg);
                return;
            }

            toast.success(responseData.message || 'Booking created successfully!');
            
            // Reset form setelah berhasil
            setCustomerName('');
            setCustomerPhone('');
            setSelectedBookingTime(undefined);
            setSelectedServiceId(services[0]?.id || '');
        } catch (err: unknown) {
            toast.error('Server connection failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
    <div className="pt-20 pb-12 px-4"> 
    <Card className="w-full max-w-xl mx-auto rounded-3xl shadow-2xl border-none">
    
    {/* Header Card */}
    <CardHeader className="space-y-1 text-center">
      <CardTitle className="text-xl font-black tracking-tight">
        Book Your Appointment
      </CardTitle>
      <CardDescription className="text-sm text-gray-500">
        Fill in the details below to reserve your time
      </CardDescription>
    </CardHeader>

    {/* Isi Card */}
    <CardContent>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Full Name */}
        <div className="space-y-1.5">
          <Label
            htmlFor="customerName"
            className="text-[10px] font-black uppercase tracking-widest text-black ml-2"
          >
            Full Name
          </Label>
          <Input
            id="customerName"
            type="text"
            placeholder="Enter your name"
            value={customerName}
            onChange={(e) => setCustomerName(filterNama(e.target.value))}
            disabled={isLoading}
            className="w-full px-5 py-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold text-sm placeholder:text-gray-300"
          />
        </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label
              htmlFor="customerPhone"
              className="text-[10px] font-black uppercase tracking-widest text-black ml-2"
            >
              Phone Number
            </Label>
            <div className="relative group">
              {/* Penanda +62 di dalam input */}
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400 group-focus-within:text-black transition-colors">
                +62
              </span>
              <Input
                id="customerPhone"
                type="text"
                placeholder="8123456789" // Placeholder diubah tanpa '0'
                value={customerPhone}
                onChange={(e) => setCustomerPhone(filterNomor(e.target.value))}
                disabled={isLoading}
                // Tambahkan pl-14 agar teks input tidak menabrak +62
                className="w-full pl-14 pr-5 py-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold text-sm placeholder:text-gray-300"
              />
            </div>
          </div>

        {/* Service */}
        <CustomServiceSelector
          services={services}
          selectedServiceId={selectedServiceId}
          onSelectService={setSelectedServiceId}
          disabled={services.length === 0}
        />

        {/* Date & Time */}
        <CustomDateTimePicker
          selectedDate={selectedBookingTime}
          onSelectDate={setSelectedBookingTime}
        />

        {/* Submit */}
        <Button
          type="submit"
          disabled={
            isLoading ||
            services.length === 0 ||
            !selectedBookingTime ||
            !customerName ||
            !customerPhone
          }
          className="w-full py-7 text-xs font-black uppercase tracking-widest bg-gray-900 hover:bg-black text-white rounded-2xl shadow-xl active:scale-[0.98]"
        >
          {isLoading ? 'Processing...' : 'Book Appointment Now'}
        </Button>

      </form>
    </CardContent>
  </Card>
  </div>
  );
}