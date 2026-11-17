import { Box, IconButton, NativeSelect } from '@chakra-ui/react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

export interface AdminSelectOption {
  value: string;
  label: string;
}

export function AdminSelect({
  value,
  onChange,
  options,
  disabled,
  required,
  clearable = true,
  size = 'md',
  placeholder,
  'aria-label': ariaLabel,
  'data-testid': testId,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly AdminSelectOption[];
  disabled?: boolean;
  required?: boolean;
  /** Show an X control to clear the value (default true). */
  clearable?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  placeholder?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}) {
  const { t } = useTranslation();
  const hasEmptyOption = options.some((option) => option.value === '');
  const resolvedOptions =
    clearable && !hasEmptyOption
      ? [{ value: '', label: placeholder ?? t('ui.selectPlaceholder') }, ...options]
      : options;

  const showClear = clearable && value !== '' && disabled !== true;

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    onChange(event.target.value);
  }

  function clear() {
    onChange('');
  }

  return (
    <Box position="relative" width="100%">
      <NativeSelect.Root size={size} disabled={disabled} width="100%">
        <NativeSelect.Field
          value={value}
          onChange={handleChange}
          aria-label={ariaLabel}
          aria-required={required}
          data-testid={testId}
          pe={showClear ? '4.5rem' : undefined}
          // NativeSelect.Field omits HTML `required` from its props type.
          {...(required === true ? ({ required: true } as object) : {})}
        >
          {resolvedOptions.map((option) => (
            <option key={option.value === '' ? '__empty' : option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      {showClear ? (
        <IconButton
          type="button"
          aria-label={t('ui.clear')}
          size="2xs"
          variant="ghost"
          position="absolute"
          top="50%"
          right="1.75rem"
          transform="translateY(-50%)"
          zIndex={1}
          minW="1.25rem"
          h="1.25rem"
          color="text.muted"
          _hover={{ color: 'text.primary', bg: 'accent.goldMuted' }}
          onClick={clear}
          data-testid={testId !== undefined ? `${testId}-clear` : 'admin-select-clear'}
        >
          ×
        </IconButton>
      ) : null}
    </Box>
  );
}
