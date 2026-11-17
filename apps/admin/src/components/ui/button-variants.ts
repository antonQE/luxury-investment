import type { ButtonProps } from '@chakra-ui/react';

/**
 * Theme recipe defines `danger`, but Chakra's shipped ButtonVariant types do not.
 * Cast keeps runtime variant="danger" while satisfying TypeScript.
 */
export const dangerVariant = 'danger' as NonNullable<ButtonProps['variant']>;
