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
        <div className="space-y-1.5">
            <Label 
                htmlFor="service" 
                className="text-[10px] font-black uppercase tracking-widest text-black ml-2"
            >
                Select Service
            </Label>
            
            <div className="relative">
                <select
                    id="service"
                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-3 focus:ring-gray-200 outline-none font-bold text-sm transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    value={selectedServiceId}
                    onChange={(e) => onSelectService(e.target.value)}
                    disabled={disabled || services.length === 0}
                >
        </div>
    );
}