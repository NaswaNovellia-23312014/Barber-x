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
  
  // Generate semua slot waktu yang mungkin
  const allPossibleTimeSlots = useMemo(() => {
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 21; 
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
    if (!isClient || !selectedDate) return []; 

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
  }, [allPossibleTimeSlots, selectedDate, bookedTimes, isClient]);

  const isWeekday = (date: Date) => {
    const day = getDay(date);
    return day !== 0 && day !== 6; 
  };

  // === SOLUSI HYDRATION ERROR ===
  if (!isClient) {
      return (
          <div className="space-y-4">
              <Label className="block text-sm font-medium text-gray-700">Pilih Tanggal</Label>
              <Button
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal text-muted-foreground"
                  disabled
              >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  <span>Memuat tanggal...</span>
              </Button>
          </div>
      );
  }
  // ============================
    
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