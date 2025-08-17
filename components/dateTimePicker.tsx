"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateTimePickerProps {
  label: string;
  value: string; // "YYYY-MM-DDTHH:mm"
  onChange: (val: string) => void;
  required?: boolean;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  required,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value) : undefined;
  const [hours, minutes] = value
    ? value.split("T")[1].slice(0, 5).split(":").map(Number)
    : [0, 0];

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;

    const year = newDate.getFullYear();
    const month = (newDate.getMonth() + 1).toString().padStart(2, "0");
    const day = newDate.getDate().toString().padStart(2, "0");

    const datePart = `${year}-${month}-${day}`;
    const iso = `${datePart}T${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    onChange(iso);
    setOpen(false);
  };

  // Handle time change
  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const datePart = value
      ? value.split("T")[0]
      : new Date().toISOString().split("T")[0];
    const iso = `${datePart}T${newHours.toString().padStart(2, "0")}:${newMinutes
      .toString()
      .padStart(2, "0")}`;
    onChange(iso);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="px-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-4 items-center">
        {/* Date Picker */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-1/2 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateChange}
            />
          </PopoverContent>
        </Popover>

        {/* Time Picker using shadcn Select */}
        <div className="flex gap-2">
          {/* Hours */}
          <Select
            value={hours.toString().padStart(2, "0")}
            onValueChange={(val) => handleTimeChange(Number(val), minutes)}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => {
                const display = i.toString().padStart(2, "0");
                return (
                  <SelectItem key={i} value={display}>
                    {display}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Minutes */}
          <Select
            value={minutes.toString().padStart(2, "0")}
            onValueChange={(val) => handleTimeChange(hours, Number(val))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 60 }, (_, i) => {
                const display = i.toString().padStart(2, "0");
                return (
                  <SelectItem key={i} value={display}>
                    {display}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
