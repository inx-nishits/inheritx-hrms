"use client";

import { Select, SelectItem, SelectProps } from '@nextui-org/react';
import { cn } from '@/lib/utils';

interface NextUISelectProps extends Omit<SelectProps, 'selectedKeys' | 'onSelectionChange' | 'children'> {
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{ value: string; label: string } | string>;
  error?: string;
}

export function NextUISelect({
  value,
  onChange,
  options,
  error,
  placeholder = "Select...",
  label,
  classNames,
  ...props
}: NextUISelectProps) {
  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' 
      ? { value: opt, label: opt }
      : opt
  );

  const selectedKeys = value ? new Set([value]) : new Set<string>();

  // Determine wrapper width - use custom base width if provided, otherwise default to w-full
  const hasCustomWidth = classNames?.base?.includes('w-');
  const wrapperWidth = hasCustomWidth ? '' : 'w-full';

  // Default trigger classes
  const defaultTriggerClasses = "h-11 bg-background border border-input rounded-[8px] transition-colors px-3 justify-between focus:outline-none";
  
  return (
    <div className={wrapperWidth}>
      <Select
        {...props}
        label={label}
        placeholder={placeholder}
        selectedKeys={selectedKeys}
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] as string;
          onChange?.(selected || '');
        }}
        selectionMode="single"
        isInvalid={!!error}
        errorMessage={error}
        classNames={{
          base: classNames?.base || "w-full",
          trigger: cn(defaultTriggerClasses, classNames?.trigger),
          value: cn("text-sm font-medium text-foreground flex-1 text-left", classNames?.value),
          selectorIcon: cn("text-muted-foreground w-4 h-4 flex-shrink-0", classNames?.selectorIcon),
          popoverContent: cn("bg-background border border-border rounded-[8px] shadow-lg", classNames?.popoverContent),
          mainWrapper: classNames?.mainWrapper,
          label: classNames?.label,
          helperWrapper: classNames?.helperWrapper,
          errorMessage: classNames?.errorMessage,
          listbox: classNames?.listbox,
          listboxWrapper: classNames?.listboxWrapper,
        }}
        popoverProps={{
          placement: "auto",
          classNames: {
            content: "bg-background border border-border rounded-[8px] shadow-lg p-1 max-w-[calc(100vw-16px)] min-w-fit",
          },
          offset: 4,
          shouldFlip: true,
          shouldCloseOnBlur: true,
          isDismissable: true,
          isKeyboardDismissDisabled: false,
          containerPadding: 8,
          flip: true,
          boundary: "clippingParents",
        }}
        listboxProps={{
          itemClasses: {
            base: [
              "rounded-[6px]",
              "text-default-500",
              "transition-opacity",
              "data-[hover=true]:text-foreground",
              "data-[hover=true]:bg-accent",
              "data-[selectable=true]:focus:bg-accent",
              "data-[selectable=true]:focus:text-foreground",
              "data-[pressed=true]:opacity-70",
            ],
            title: [
              "whitespace-nowrap",
              "overflow-visible",
            ],
          },
        }}
      >
        {normalizedOptions.map((option) => (
          <SelectItem 
            key={option.value} 
            value={option.value}
            textValue={option.label}
          >
            {option.label}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}

