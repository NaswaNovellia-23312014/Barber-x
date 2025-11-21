// web/src/components/CustomServiceSelector.tsx
import * as React from 'react';
import { Service } from '@/types';
import { Label } from '@/components/ui/label';

interface CustomServiceSelectorProps {
    services: Service[];
    selectedServiceId: string;
    onSelectService: (serviceId: string) => void;
    disabled?: boolean;
    }

    export default function CustomServiceSelector({
    services,
    selectedServiceId,
    onSelectService,
    disabled = false,
    }: CustomServiceSelectorProps) {
    return (
        <div>
        <Label htmlFor="service">Pilih Layanan</Label>
        <select
            id="service"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
            value={selectedServiceId}
            onChange={(e) => onSelectService(e.target.value)}
            disabled={disabled || services.length === 0}
        >
            {services.length === 0 ? (
            <option value="" disabled>Tidak ada layanan tersedia</option>
            ) : (
            <>
                <option value="" disabled>Pilih Layanan</option> {/* Pilihan default */}
                {services.map((service) => (
                <option key={service.id} value={service.id}>
                    {service.name} - Rp{service.price.toLocaleString('id-ID')} ({service.duration} menit)
                </option>
                ))}
            </>
            )}
        </select>
        </div>
    );
}