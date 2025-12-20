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
        <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
                <Label htmlFor="customerName">Nama Pelanggan</Label>
                <Input
                    id="customerName"
                    type="text"
                    placeholder="Masukkan Nama Anda"
                    value={customerName}
                    onChange={(e) => setCustomerName(filterNama(e.target.value))}
                    disabled={isLoading}
                />
            </div>

        <div className="space-y-2">
                <Label htmlFor="customerPhone">Nomor Telepon</Label>
                <Input
                    id="customerPhone"
                    type="text" 
                    placeholder="Masukkan Nomor Telepon"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(filterNomor(e.target.value))}
                    disabled={isLoading}
                />
        </div>

        <CustomServiceSelector
        services={services}
        selectedServiceId={selectedServiceId}
        onSelectService={setSelectedServiceId}
        disabled={services.length === 0}
      />

      <CustomDateTimePicker
        selectedDate={selectedBookingTime}
        onSelectDate={setSelectedBookingTime}
      />

      <Button
        type="submit"
        className="w-full"
        // Nonaktifkan tombol jika ada loading atau field-field penting belum diisi
        disabled={isLoading || services.length === 0 || !selectedBookingTime || !customerName || !customerPhone}
      >
        {isLoading ? 'Memproses...' : 'Pesan Sekarang'}
      </Button>
    </form>
  );
}