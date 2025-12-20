'use client';

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { format, getDay, setHours, setMinutes, isToday } from 'date-fns';
import parseISO from 'date-fns/parseISO'; 

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
  selectedDate: Date | undefined; 
  onSelectDate: (date: Date | undefined) => void;
}

export default function CustomDateTimePicker({
  selectedDate, 
  onSelectDate, 
}: CustomDateTimePickerProps) {
  
  const [isClient, setIsClient] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
  const [fetchingBookings, setFetchingBookings] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Mencegah kesalahan hidrasi antara server dan client
  useEffect(() => {
    setIsClient(true);
  }, []);

  /**
   * Mengambil data pemesanan untuk mengecek slot yang sudah terisi.
   */
  useEffect(() => {
    if (!isClient || !selectedDate) { 
        setBookedTimes(new Set()); 
        return;
    }

    const fetchBookingsForDate = async () => {
      setFetchingBookings(true);
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd'); 
        const res = await fetch(`${API_URL}/bookings?date=${formattedDate}`);
        
        if (!res.ok) throw new Error(`Failed to fetch bookings`);
        
        const data: Booking[] = await res.json();
        const newBookedTimes = new Set<string>();

        data.forEach(booking => {
            if (typeof booking.bookingTime === 'string') {
              try {
                  const bookingDateTime = parseISO(booking.bookingTime);
                  if (bookingDateTime instanceof Date && !isNaN(bookingDateTime.getTime())) {
                    newBookedTimes.add(format(bookingDateTime, 'HH:mm'));
                  }
              } catch (e) {
                  console.error('Parse error:', e);
              }
            }
        });
        setBookedTimes(newBookedTimes);
      } catch (error) {
        toast.error('Failed to load time slots.');
        setBookedTimes(new Set());
      } finally {
        setFetchingBookings(false);
      }
    };

    fetchBookingsForDate();
  }, [selectedDate, isClient]); 

  const handleDateChange = (date: Date | undefined) => {
    onSelectDate(date); 
    if (date) setIsPopoverOpen(false); 
  };

  const handleTimeSlotClick = (slotTime: string) => {
    if (!selectedDate) return;

    const [hours, minutes] = slotTime.split(':').map(Number);
    const fullSelectedDateTime = setMinutes(setHours(selectedDate, hours), minutes);
    
    onSelectDate(fullSelectedDateTime);
  };
  
  // Menghasilkan slot waktu (09:00 - 21:00)
  const allPossibleTimeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 9; h < 21; h++) {
      for (let m = 0; m < 60; m += 30) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  // Filter slot waktu berdasarkan ketersediaan dan waktu sekarang
  const filteredTimeSlots = useMemo(() => {
    if (!isClient || !selectedDate) return []; 

    const now = new Date();
    const currentHourMinute = format(now, 'HH:mm');
    const isTodaySelected = isToday(selectedDate);

    return allPossibleTimeSlots.map(slotTime => {
        let isDisabled = bookedTimes.has(slotTime);
        if (isTodaySelected && slotTime < currentHourMinute) {
            isDisabled = true;
        }
        return { time: slotTime, isBooked: isDisabled };
    });
  }, [allPossibleTimeSlots, selectedDate, bookedTimes, isClient]);

  const isWeekday = (date: Date) => {
    const day = getDay(date);
    return day !== 0 && day !== 6; 
  };

  // State loading awal untuk mencegah hydration mismatch
  if (!isClient) {
      return (
          <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Select Date</Label>
              <Button variant="outline" className="w-full justify-start py-6 rounded-2xl bg-gray-50 border-none" disabled>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Loading...</span>
              </Button>
          </div>
      );
  }
    
  return (
    <div className="space-y-4">
      <Label className="block text-sm font-medium text-gray-700">Pilih Tanggal</Label>
      
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
            {selectedDate ? format(selectedDate, "dd MMMM yyyy") : <span>Pilih tanggal</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate} 
            onSelect={handleDateChange} 
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