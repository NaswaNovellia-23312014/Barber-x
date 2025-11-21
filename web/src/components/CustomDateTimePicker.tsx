// web/src/components/CustomDateTimePicker.tsx
'use client';

import * as React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';

// date-fns imports
import { format, getDay, setHours, setMinutes, isToday } from 'date-fns';
import parseISO from 'date-fns/parseISO'; 

// === KOMPONEN SHADCN UI ===
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; 
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; 
import { cn } from '@/lib/utils'; 

import { toast } from 'sonner';
import { API_URL } from '@/lib/api';
import { Booking } from '@/types'; 
import { CalendarIcon } from 'lucide-react'; 

interface CustomDateTimePickerProps {
  // Prop ini sekarang menjadi sumber tunggal kebenaran
  selectedDate: Date | undefined; 
  onSelectDate: (date: Date | undefined) => void;
}

export default function CustomDateTimePicker({
  selectedDate, // Prop: Tanggal yang dipilih (dari parent)
  onSelectDate, // Prop: Callback saat tanggal/waktu diubah
}: CustomDateTimePickerProps) {
  
  // HANYA state untuk data fetching dan kontrol UI Popover
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
  }, []);


  // Ambil data booking untuk tanggal yang dipilih dari backend
  useEffect(() => {
    // Gunakan prop selectedDate langsung sebagai dependensi dan data
    if (!isMounted.current || !selectedDate) { 
        setBookedTimes(new Set()); 
        return;
    }

    const fetchBookingsForDate = async () => {
      setFetchingBookings(true);
      try {
        // Gunakan selectedDate (prop) sebagai basis
        const formattedDate = format(selectedDate, 'yyyy-MM-dd'); 
        const res = await fetch(`${API_URL}/bookings?date=${formattedDate}`);
        
        if (!res.ok) {
          const errorBody = await res.text();
          throw new Error(`Gagal mengambil data booking: ${res.status} ${res.statusText}, Body: ${errorBody}`);
        }
        
        const data: Booking[] = await res.json();

        const newBookedTimes = new Set<string>();
        data.forEach(booking => {
            if (typeof booking.bookingTime === 'string') {
              try {
                  const bookingDateTime = parseISO(booking.bookingTime);
                  if (bookingDateTime instanceof Date && !isNaN(bookingDateTime.getTime())) {
                      const timeSlot = format(bookingDateTime, 'HH:mm');
                      newBookedTimes.add(timeSlot);
                  }
              } catch (parseError) {
                  console.error('Error parsing bookingTime string:', booking.bookingTime, parseError);
              }
            }
        });
        setBookedTimes(newBookedTimes);

      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error(`Gagal memuat booking: ${error instanceof Error ? error.message : String(error)}`);
        setBookedTimes(new Set());
      } finally {
        setFetchingBookings(false);
      }
    };

    fetchBookingsForDate();
    // Dependensi: Hanya bergantung pada prop selectedDate
  }, [selectedDate]); 

  
  // Handler saat tanggal dipilih dari kalender
  const handleDateChange = (date: Date | undefined) => {
    // 1. Panggil prop onSelectDate untuk update state di parent (Date: date, Time: undefined)
    onSelectDate(date); 
    
    // 2. Menutup popover
    if (date) { 
        setIsPopoverOpen(false); 
    }
  };

  // Handler saat slot waktu dipilih
  const handleTimeSlotClick = (slotTime: string) => {
    if (!selectedDate) return;

    const [hours, minutes] = slotTime.split(':').map(Number);
    // Gunakan selectedDate (prop) sebagai basis tanggal, lalu tambahkan waktu
    const fullSelectedDateTime = setMinutes(setHours(selectedDate, hours), minutes);
    
    // Panggil prop onSelectDate untuk update state di parent (Date: date, Time: slotTime)
    onSelectDate(fullSelectedDateTime);
  };
  
  // Generate semua slot waktu yang mungkin
  const allPossibleTimeSlots = useMemo(() => {
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 21; // 9 PM
    const intervalMinutes = 30;

    for (let h = startHour; h < endHour; h++) {
      for (let m = 0; m < 60; m += intervalMinutes) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  // Filter slot waktu yang ditampilkan
  const filteredTimeSlots = useMemo(() => {
    // Gunakan prop selectedDate untuk logika hari ini
    if (!isMounted.current || !selectedDate) return []; 

    const now = new Date();
    const currentHourMinute = format(now, 'HH:mm');
    const isTodaySelected = isToday(selectedDate);

    return allPossibleTimeSlots.map(slotTime => {
        let isDisabled = false;

        if (bookedTimes.has(slotTime)) {
            isDisabled = true;
        }

        if (isTodaySelected) {
            if (slotTime < currentHourMinute) {
                isDisabled = true;
            }
        }
        
        return { time: slotTime, isBooked: isDisabled };
    });
  }, [allPossibleTimeSlots, selectedDate, bookedTimes]);


  // Helper untuk menentukan apakah hari itu weekday (Senin-Jumat)
  const isWeekday = (date: Date) => {
    const day = getDay(date);
    return day !== 0 && day !== 6; // Hanya hari Senin-Jumat
  };
    
  return (
    <div className="space-y-4">
      <Label className="block text-sm font-medium text-gray-700">Pilih Tanggal</Label>
      
      {/* Mengikat state open ke Popover */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            onClick={() => setIsPopoverOpen(true)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {/* Tampilkan prop selectedDate */}
            {selectedDate ? format(selectedDate, "dd MMMM yyyy") : <span>Pilih tanggal</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            // selected BINDING LANGSUNG ke prop selectedDate
            selected={selectedDate} 
            onSelect={handleDateChange} // onSelect memanggil parent's callback
            initialFocus
            disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return !isWeekday(date) || date < today;
            }} 
          />
        </PopoverContent>
      </Popover>

      {/* Tampilkan slot waktu jika selectedDate ada */}
      {selectedDate && (
        <div className="mt-4">
          <Label className="block text-sm font-medium text-gray-700 mb-2">Pilih Waktu ({format(selectedDate, 'dd MMM yyyy')}):</Label>
          {fetchingBookings ? (
            <p className="text-gray-500">Memuat slot waktu...</p>
          ) : filteredTimeSlots.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto pr-2">
              {filteredTimeSlots.map((slot) => (
                <Button
                  key={slot.time}
                  type="button"
                  // Bandingkan waktu yang dipilih di prop dengan slot yang ada
                  variant={selectedDate && format(selectedDate, 'HH:mm') === slot.time ? 'default' : 'outline'}
                  onClick={() => handleTimeSlotClick(slot.time)}
                  disabled={slot.isBooked} 
                  className="px-2 py-1 text-xs"
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Tidak ada slot waktu tersedia untuk tanggal ini.</p>
          )}
        </div>
      )}
    </div>
  );
}